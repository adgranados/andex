'use client';

interface InlineModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function InlineModal({ isOpen, onClose, title, children }: InlineModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
