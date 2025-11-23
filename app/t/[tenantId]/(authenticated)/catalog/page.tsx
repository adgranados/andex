'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CatalogTabs } from '@/app/components/catalog/CatalogTabs';
import { ZoneList } from '@/app/components/catalog/ZoneList';
import { TypeList } from '@/app/components/catalog/TypeList';
import { OwnerList } from '@/app/components/catalog/OwnerList';
import { PropertyList } from '@/app/components/catalog/PropertyList';

export default function CatalogPage({ params }: { params: { tenantId: string } }) {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'zones';
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-white">Catálogo Maestro</h1>
                <p className="text-slate-400 mt-2">Gestiona zonas, tipos, propietarios y propiedades.</p>
            </header>

            <CatalogTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="min-h-[400px]">
                {activeTab === 'zones' && <ZoneList tenantId={params.tenantId} />}
                {activeTab === 'types' && <TypeList tenantId={params.tenantId} />}
                {activeTab === 'owners' && <OwnerList tenantId={params.tenantId} />}
                {activeTab === 'properties' && <PropertyList tenantId={params.tenantId} />}
            </div>
        </div>
    );
}
