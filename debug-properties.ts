import fs from 'fs';
import path from 'path';

// Manually load .env
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                // Handle JSON content specifically for FIREBASE_SERVICE_ACCOUNT_JSON if needed
                // But usually .env values are just strings. JSON might be escaped.
                process.env[key] = value;
            }
        });
        console.log('.env loaded manually');
    }
} catch (e) {
    console.error('Error loading .env:', e);
}
// import { db, adminAuth } from './src/server/firebaseAdmin'; // Removed static import

async function main() {
    // Dynamic import after env is loaded
    const { db, adminAuth } = await import('./src/server/firebaseAdmin');

    const tenantId = 'zS44Y351QJG895X0l399'; // From previous logs
    console.log(`Listing collections for tenant: ${tenantId}`);

    try {
        // const collections = await db.collection(`tCollections/${tenantId}`).listCollections(); // Removed invalid call
        // The structure is likely tCollections/{tenantId}/...
        // So we need to list subcollections of the document `tCollections/{tenantId}`.

        const tenantDoc = db.collection('tCollections').doc(tenantId);
        const subcollections = await tenantDoc.listCollections();

        console.log('Subcollections:', subcollections.map(c => c.id));

        const ownersSnapshot = await db.collection(`tCollections/${tenantId}/owners`).limit(1).get();
        console.log(`\nFound ${ownersSnapshot.size} owners (limit 1).`);
        ownersSnapshot.docs.forEach(doc => {
            console.log(`Owner ${doc.id}:`, doc.data());
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
