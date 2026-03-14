import React, { useState, useEffect } from 'react';
import { Shield, Lock, FileText, Download, AlertTriangle } from 'lucide-react';

const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`rounded-xl border shadow-sm ${className}`} {...props}>
        {children}
    </div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardDescription = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) => (
    <p className={`text-sm text-slate-500 ${className}`} title={title}>{children}</p>
);
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-4 pt-0 ${className}`}>{children}</div>
);
interface SectorReport {
    ticker: string;
    company_name: string;
    overall_signal: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
    confidence_score: number;
    regime: {
        label: string;
    };
    executive_summary?: {
        narrative_plain?: string;
        narrative_technical?: string;
    };
}

interface SectorPackData {
    sector: string;
    tier_access: "authorized" | "unauthorized";
    generated_at: string;
    reports: SectorReport[];
}

const SectorPacksDashboard = () => {
    const [selectedSector, setSelectedSector] = useState('Technology');
    const [data, setData] = useState<SectorPackData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sectors = [
        "Technology", "Healthcare", "Financials", "Energy", "Consumer",
        "Industrials", "Materials", "Utilities", "Real Estate", "Communications"
    ];

    // Fetch sector data with AbortController to prevent race conditions
    useEffect(() => {
        const controller = new AbortController();
        const fetchSectorData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/quantus/api/v1/sectors/${selectedSector}/reports`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error('Failed to fetch sector data');

                const result = await response.json();
                if (!result || typeof result.sector !== 'string' || !Array.isArray(result.reports)) {
                    throw new Error('Invalid sector pack data format');
                }
                setData(result as SectorPackData);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchSectorData();
        return () => controller.abort();
    }, [selectedSector]);

    const getSignalColor = (signal: string) => {
        if (signal.includes('BUY')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (signal.includes('SELL')) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-light text-slate-100 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-400" />
                        Institutional Sector Packs
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Pre-generated institutional teardowns for the Top 20 tickers in each sector.
                        Refreshed every 96 hours via the Meridian v2.4 Batch Engine.
                    </p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium border border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Download className="w-4 h-4" />
                    Download PDF Digest
                </button>
            </div>

            {/* Sector Selector */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
                {sectors.map(sector => (
                    <button
                        key={sector}
                        onClick={() => setSelectedSector(sector)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSector === sector
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                    >
                        {sector}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <p>Error loading sector pack: {error}</p>
                </div>
            ) : data && data.tier_access === "authorized" ? (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium text-slate-200">
                            {selectedSector} Top 20
                        </h2>
                        <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                            Last Generated: {new Date(data.generated_at).toLocaleString(undefined, { timeZoneName: 'short' })}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl">
                        {data.reports.map((report, idx) => (
                            <Card key={idx} className="bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-medium tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                                                {report.ticker}
                                            </CardTitle>
                                            <CardDescription className="text-xs truncate max-w-[120px]" title={report.company_name || "Company"}>
                                                {report.company_name || "Company"}
                                            </CardDescription>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getSignalColor(report.overall_signal)}`}>
                                            {report.overall_signal}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs items-center">
                                            <span className="text-slate-500">Confidence</span>
                                            <span className="text-slate-300 font-medium">{report.confidence_score}%</span>
                                        </div>
                                        <div className="flex justify-between text-xs items-center">
                                            <span className="text-slate-500">Regime</span>
                                            <span className="text-slate-300 font-medium truncate ml-2">{report.regime.label}</span>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-indigo-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 duration-300">
                                            <FileText className="w-3 h-3" />
                                            View Full Report
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                    <Lock className="w-12 h-12 text-slate-600 mb-4" />
                    <h3 className="text-xl font-medium text-slate-300 mb-2">Upgrade Required</h3>
                    <p className="text-slate-500 max-w-md">
                        Your current tier does not include access to the {selectedSector} Sector Pack.
                        Subscribe to unlock 20 automated institutional reports updated weekly.
                    </p>
                    <button className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium border border-slate-700">
                        View Pricing Plans
                    </button>
                </div>
            )}
        </div>
    );
};

export default SectorPacksDashboard;
