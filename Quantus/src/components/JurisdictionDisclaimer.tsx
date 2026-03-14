import type { AssetClass } from '../types';

// ─── Jurisdiction types ───────────────────────────────────────────────────────

export type Jurisdiction = 'US' | 'EU' | 'UK' | 'CA' | 'JP' | 'GLOBAL';

// ─── Disclaimer text by jurisdiction × asset class ───────────────────────────

const BASE: Record<Jurisdiction, string> = {
    US: 'For educational and research purposes only. Past performance does not guarantee future results. This is not financial, investment, or legal advice. Quantus Research Solutions is not a registered investment adviser under the Investment Advisers Act of 1940.',
    EU: 'This communication does not constitute investment research within the meaning of MiFID II Article 36 or a personal investment recommendation. It is provided for informational purposes to professional investors only. Past performance is not a reliable indicator of future results.',
    UK: 'This material is a marketing communication and has not been prepared in accordance with legal requirements designed to promote the independence of investment research. Not approved for distribution to retail clients under the Financial Services and Markets Act 2000. Professional investor use only.',
    CA: 'This report is provided for informational purposes only and does not constitute investment advice as defined by applicable securities legislation including the Ontario Securities Act and applicable CSA regulations. Not intended for retail investor distribution.',
    JP: '本レポートは情報提供のみを目的としており、金融商品取引法に基づく投資助言ではありません。過去の運用成績は将来の結果を保証するものではありません。',
    GLOBAL: 'For informational purposes only. Not investment advice. Past performance is not indicative of future results. Users are responsible for compliance with local regulations.',
};

const CRYPTO_ADDENDUM: Record<Jurisdiction, string> = {
    US: ' Crypto assets are not securities for purposes of the federal securities laws unless explicitly determined otherwise by the SEC. Subject to CFTC jurisdiction for commodity derivatives.',
    EU: ' Crypto-assets may be subject to the Markets in Crypto-Assets Regulation (MiCA). Nothing herein constitutes an offer to acquire crypto-assets within the meaning of MiCA.',
    UK: ' Crypto-assets are not regulated by the FCA. The value of crypto-assets can rise and fall significantly and you may not get back the amount you invest.',
    CA: ' Cryptocurrency trading is speculative and carries substantial risk. Crypto ETPs and derivatives may be subject to CSA and OSC guidance.',
    JP: ' 暗号資産は金融商品取引法上の有価証券ではない場合があります。暗号資産交換業者の登録は必須です。',
    GLOBAL: ' Crypto-asset regulation varies by jurisdiction — users must verify compliance with applicable local law.',
};

const COMMODITY_ADDENDUM: Record<Jurisdiction, string> = {
    US: ' Commodity futures and options trading involves substantial risk of loss. Not suitable for all investors. Margin calls may be required. CFTC Rule 4.41 applies.',
    EU: ' Commodity derivative trading is subject to EMIR and MiFID II position limits. Substantial risk of loss exists.',
    UK: ' Commodity derivatives are regulated investments under FSMA 2000. Trading in futures and options involves significant risk of loss.',
    CA: ' Commodity futures trading is subject to regulatory requirements under applicable provincial and federal commodity trading legislation.',
    JP: ' 商品先物取引は大きなリスクを伴います。損失が発生する可能性があります。',
    GLOBAL: ' Commodity derivatives carry significant risk. Users must understand leverage and margin requirements.',
};

// ─── Core disclaimer function ─────────────────────────────────────────────────

export function getDisclaimer(jurisdiction: Jurisdiction, assetClass: AssetClass): string {
    const base = BASE[jurisdiction] ?? BASE.GLOBAL;
    switch (assetClass) {
        case 'CRYPTO': return base + (CRYPTO_ADDENDUM[jurisdiction] ?? CRYPTO_ADDENDUM.GLOBAL);
        case 'COMMODITY': return base + (COMMODITY_ADDENDUM[jurisdiction] ?? COMMODITY_ADDENDUM.GLOBAL);
        default: return base; // EQUITY and ETF use base only
    }
}

// ─── React component ──────────────────────────────────────────────────────────

import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';

interface JurisdictionDisclaimerProps {
    jurisdiction: Jurisdiction;
    assetClass: AssetClass;
    compact?: boolean;   // collapsed by default (expanded only in Section D + emails)
    lightMode?: boolean;
}

export function JurisdictionDisclaimer({
    jurisdiction, assetClass, compact = true, lightMode,
}: JurisdictionDisclaimerProps) {
    const [expanded, setExpanded] = useState(!compact);
    const text = getDisclaimer(jurisdiction, assetClass);
    const ts = lightMode ? '#64748B' : '#6B7280';

    return (
        <div
            className="rounded-xl text-xs"
            style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', padding: '10px 14px' }}
        >
            <button
                onClick={() => compact && setExpanded(e => !e)}
                className={`flex items-center gap-2 w-full text-left ${compact ? 'cursor-pointer' : 'cursor-default'}`}
            >
                <Shield className="w-3 h-3 flex-shrink-0 text-indigo-400" />
                <span className="font-semibold text-indigo-400 mr-1">{jurisdiction} Regulatory Notice</span>
                <span className="font-mono" style={{ color: '#6B7280' }}>— {assetClass}</span>
                {compact && (
                    <span className="ml-auto" style={{ color: '#6B7280' }}>
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </span>
                )}
            </button>
            {expanded && (
                <p className="mt-2 leading-relaxed" style={{ color: ts }}>
                    {text}
                </p>
            )}
        </div>
    );
}

// ─── Jurisdiction detector (browser locale + IP fallback) ─────────────────────

export function detectJurisdiction(): Jurisdiction {
    // 1. Check user override in localStorage
    const override = localStorage.getItem('quantus_jurisdiction') as Jurisdiction | null;
    if (override) return override;

    // 2. Detect from browser locale
    const locale = (navigator.language ?? 'en-US').toUpperCase();
    if (locale.includes('US')) return 'US';
    if (locale.includes('GB')) return 'UK';
    if (locale.includes('CA')) return 'CA';
    if (locale.includes('JP')) return 'JP';
    if (['DE', 'FR', 'IT', 'ES', 'NL', 'PT', 'PL', 'BE', 'AT', 'FI', 'IE', 'GR', 'CZ', 'SK', 'HU', 'RO', 'HR', 'BG', 'DK', 'SE', 'SI', 'LT', 'LV', 'EE', 'CY', 'LU', 'MT'].some(c => locale.includes(c))) return 'EU';

    // 3. Fallback — production: use IP geolocation API
    return 'GLOBAL';
}
