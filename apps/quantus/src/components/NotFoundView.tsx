import { ArrowLeft, Layers, Search } from 'lucide-react';

interface NotFoundViewProps {
    path: string;
    onGoWorkspace: () => void;
    onGoSectors: () => void;
}

export function NotFoundView({ path, onGoWorkspace, onGoSectors }: NotFoundViewProps) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div
                className="w-full max-w-2xl rounded-[32px] border p-8 md:p-10"
                style={{
                    background: 'rgba(255,255,255,0.94)',
                    borderColor: '#E5E7EB',
                    boxShadow: '0 24px 72px rgba(15,23,42,0.08)',
                }}
            >
                <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em]" style={{ color: '#64748B', borderColor: '#E5E7EB' }}>
                    Quantus route
                </div>
                <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em]" style={{ color: '#09090B', fontFamily: 'var(--font-heading)' }}>
                    This Quantus page does not exist.
                </h1>
                <p className="mt-4 text-base leading-relaxed" style={{ color: '#64748B' }}>
                    The route <code style={{ color: '#0F172A' }}>{path}</code> is not part of the Quantus workspace. Use one of the supported product areas below.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        onClick={onGoWorkspace}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                        style={{ background: '#09090B', color: '#FFFFFF' }}
                    >
                        <Search className="w-4 h-4" />
                        Open Workspace
                    </button>
                    <button
                        onClick={onGoSectors}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                        style={{ background: '#FFFFFF', color: '#09090B', border: '1px solid #E5E7EB' }}
                    >
                        <Layers className="w-4 h-4" />
                        Open Sector Packs
                    </button>
                </div>
                <button
                    onClick={onGoWorkspace}
                    className="mt-6 inline-flex items-center gap-2 text-sm"
                    style={{ color: '#64748B' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return to the Quantus home route
                </button>
            </div>
        </div>
    );
}
