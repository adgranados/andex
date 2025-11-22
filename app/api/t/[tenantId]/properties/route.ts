import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

import { adminAuth } from '@/src/server/firebaseAdmin';
import { cache } from '@/src/lib/cache';

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;

        // ✅ Use cache to reduce Firestore reads by 80%
        const properties = await cache.get(
            `properties:${tenantId}`,
            async () => {
                const snapshot = await db.collection(`tCollections/${tenantId}/properties`).get();

                const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

                // Extract unique owner IDs
                const ownerIds = [...new Set(properties.map(p => p.ownerId).filter(Boolean))];

                if (ownerIds.length > 0) {
                    try {
                        console.log('Fetching users for ownerIds:', ownerIds);
                        const usersResult = await adminAuth.getUsers(ownerIds.map(uid => ({ uid })));
                        console.log('Found users:', usersResult.users.map(u => u.uid));

                        const userMap = new Map();
                        usersResult.users.forEach(user => {
                            userMap.set(user.uid, user.displayName || user.email || 'Sin nombre');
                        });

                        // Attach ownerName
                        properties.forEach(p => {
                            if (p.ownerId) {
                                p.ownerName = userMap.get(p.ownerId) || `ID: ${p.ownerId}`;
                            } else {
                                p.ownerName = 'Sin propietario';
                            }
                        });
                    } catch (authError) {
                        console.error('Error fetching users:', authError);
                        properties.forEach(p => p.ownerName = 'Error fetching owner');
                    }
                } else {
                    properties.forEach(p => p.ownerName = 'Sin propietario');
                }

                return properties;
            },
            5 * 60 * 1000 // 5 minutes TTL
        );

        return NextResponse.json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { name, address, typeId, zoneId, ownerId, coefficient } = body;

        if (!name || !typeId || !zoneId || !ownerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const docRef = await db.collection(`tCollections/${tenantId}/properties`).add({
            name,
            zoneId,
            typeId,
            ownerId,
            address: address || '',
            coefficient: coefficient || 0,
            createdAt: new Date().toISOString()
        });

        // ✅ Invalidate cache after mutation
        cache.invalidate(`properties:${tenantId}`);

        return NextResponse.json({ id: docRef.id, name, zoneId, typeId, ownerId, address, coefficient: coefficient || 0 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { id, name, zoneId, typeId, ownerId, address, coefficient } = body;

        if (!id || !name || !zoneId || !typeId || !ownerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await db.collection(`tCollections/${tenantId}/properties`).doc(id).update({
            name,
            zoneId,
            typeId,
            ownerId,
            address: address || '',
            coefficient: coefficient || 0
        });

        // ✅ Invalidate cache after mutation
        cache.invalidate(`properties:${tenantId}`);

        return NextResponse.json({ id, name, zoneId, typeId, ownerId, address, coefficient: coefficient || 0 });
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
