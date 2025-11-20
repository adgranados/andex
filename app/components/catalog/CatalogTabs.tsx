'use client';

interface Tab {
    id: string;
    label: string;
}

interface CatalogTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function CatalogTabs({ activeTab, onTabChange }: CatalogTabsProps) {
    const tabs: Tab[] = [
        { id: 'zones', label: 'Zonas' },
        { id: 'types', label: 'Tipos de Propiedad' },
        { id: 'owners', label: 'Propietarios' },
        { id: 'properties', label: 'Propiedades' },
    ];

    return (
        <div className="border-b border-white/10 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-200'
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
