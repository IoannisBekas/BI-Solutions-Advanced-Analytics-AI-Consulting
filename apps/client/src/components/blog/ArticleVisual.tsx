import { useId, type ReactNode } from "react";
import type { BlogPost } from "@/data/blogData";
import { cn } from "@/lib/utils";

type ArticleVisualPost = Pick<BlogPost, "slug" | "title" | "category" | "tags">;

interface ArticleVisualProps {
  post: ArticleVisualPost;
  className?: string;
}

type Motif =
  | "web"
  | "dashboard"
  | "model"
  | "ai"
  | "governance"
  | "cloud"
  | "mlops"
  | "privacy"
  | "roadmap"
  | "decision"
  | "proof"
  | "risk";

type Palette = {
  paper: string;
  tint: string;
  ink: string;
  quiet: string;
  accent: string;
  accent2: string;
  accent3: string;
};

const PALETTES: Record<string, Palette> = {
  web: {
    paper: "#F8FAFC",
    tint: "#E0F2FE",
    ink: "#111827",
    quiet: "#94A3B8",
    accent: "#0F766E",
    accent2: "#2563EB",
    accent3: "#F59E0B",
  },
  bi: {
    paper: "#F8FAFC",
    tint: "#FEF3C7",
    ink: "#111827",
    quiet: "#94A3B8",
    accent: "#2563EB",
    accent2: "#0F766E",
    accent3: "#F59E0B",
  },
  ai: {
    paper: "#FAFAFA",
    tint: "#FCE7F3",
    ink: "#111827",
    quiet: "#A1A1AA",
    accent: "#BE123C",
    accent2: "#4F46E5",
    accent3: "#10B981",
  },
  data: {
    paper: "#F7FEE7",
    tint: "#F8FAFC",
    ink: "#111827",
    quiet: "#94A3B8",
    accent: "#65A30D",
    accent2: "#0284C7",
    accent3: "#7C3AED",
  },
  operations: {
    paper: "#FFF7ED",
    tint: "#F1F5F9",
    ink: "#111827",
    quiet: "#A8A29E",
    accent: "#EA580C",
    accent2: "#0F766E",
    accent3: "#2563EB",
  },
  risk: {
    paper: "#FAFAFA",
    tint: "#F4F4F5",
    ink: "#111827",
    quiet: "#A1A1AA",
    accent: "#111827",
    accent2: "#52525B",
    accent3: "#71717A",
  },
};

const MOTIF_BY_SLUG: Record<string, Motif> = {
  "website-web-app-development-greece-business-needs": "web",
  "power-bi-consulting-dashboards-business-infrastructure": "dashboard",
  "semantic-modeling-power-bi-clean-models": "model",
  "ai-consulting-greek-businesses-practical-use-cases": "ai",
  "data-strategy-before-ai-better-foundations": "decision",
  "cloud-migration-analytics-teams-manual-reports": "cloud",
  "mlops-small-mid-sized-teams-productionize-ai": "mlops",
  "data-governance-gdpr-scale-analytics-control": "governance",
  "ai-literacy-teams-adopt-ai-without-operational-risk": "governance",
  "modern-websites-track-business-outcomes": "web",
  "corporate-website-redesign-warning-signs": "web",
  "booking-flows-service-businesses": "web",
  "landing-pages-for-ai-products": "web",
  "dashboard-requirements-before-power-bi-build": "dashboard",
  "kpi-dictionary-business-intelligence": "model",
  "power-bi-tableau-looker-tool-choice": "decision",
  "data-quality-checklist-analytics-projects": "governance",
  "customer-data-foundation-small-business": "model",
  "ai-document-workflows-professional-services": "ai",
  "prompt-workflow-design-business-teams": "ai",
  "ai-assistant-governance-company-policy": "governance",
  "predictive-analytics-forecasting-mistakes": "dashboard",
  "analytics-roadmap-first-90-days": "roadmap",
  "cloud-data-warehouse-vs-spreadsheets": "cloud",
  "dbt-airflow-analytics-automation": "mlops",
  "model-monitoring-ai-workflows": "mlops",
  "gdpr-safe-web-analytics": "privacy",
  "data-literacy-training-for-managers": "decision",
  "internal-tools-vs-saas-build-buy": "decision",
  "portfolio-case-studies-that-sell-services": "proof",
  "google-gemini-import-ai-chats": "ai",
  "power-bi-solutions-semantic-model-analysis-workspace": "dashboard",
};

function getPalette(post: ArticleVisualPost): Palette {
  if (post.category.includes("Web")) return PALETTES.web;
  if (post.category.includes("BI") || post.category.includes("Analytics")) return PALETTES.bi;
  if (post.category.includes("AI")) return PALETTES.ai;
  if (post.category.includes("Data")) return PALETTES.data;
  return PALETTES.operations;
}

function getMotif(post: ArticleVisualPost): Motif {
  if (MOTIF_BY_SLUG[post.slug]) return MOTIF_BY_SLUG[post.slug];
  if (post.category.includes("Web")) return "web";
  if (post.category.includes("BI")) return "dashboard";
  if (post.category.includes("AI")) return "ai";
  if (post.category.includes("Data")) return "model";
  return "decision";
}

function Panel({
  x,
  y,
  width,
  height,
  fill,
  stroke,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="16" fill={fill} stroke={stroke} strokeWidth="2" />
      {children}
    </g>
  );
}

function MiniText({ x, y, widths, color }: { x: number; y: number; widths: number[]; color: string }) {
  return (
    <g>
      {widths.map((width, index) => (
        <rect key={`${x}-${y}-${width}-${index}`} x={x} y={y + index * 18} width={width} height="7" rx="3.5" fill={color} opacity={index === 0 ? 0.72 : 0.42} />
      ))}
    </g>
  );
}

function AxisChart({ p }: { p: Palette }) {
  return (
    <g>
      <Panel x={380} y={78} width={196} height={196} fill="#FFFFFF" stroke={p.quiet}>
        <path d="M414 234H542M414 120V234" fill="none" stroke={p.quiet} strokeWidth="2" />
        <path d="M418 212C454 182 480 196 506 162C520 144 532 134 546 126" fill="none" stroke={p.accent} strokeLinecap="round" strokeWidth="6" />
        <path d="M420 222C456 218 482 220 508 210C526 204 540 190 552 174" fill="none" stroke={p.accent3} strokeDasharray="7 8" strokeLinecap="round" strokeWidth="4" />
        <rect x="414" y="94" width="72" height="14" rx="7" fill={p.ink} />
      </Panel>
    </g>
  );
}

function RiskMotif({ p }: { p: Palette }) {
  return (
    <g>
      <Panel x={360} y={88} width={226} height={176} fill="#FFFFFF" stroke={p.quiet}>
        <path d="M396 222H552M396 122V222" fill="none" stroke={p.quiet} strokeWidth="2" />
        <rect x="414" y="178" width="22" height="44" rx="6" fill={p.accent} opacity="0.92" />
        <rect x="452" y="150" width="22" height="72" rx="6" fill={p.accent2} opacity="0.72" />
        <rect x="490" y="132" width="22" height="90" rx="6" fill={p.accent3} opacity="0.72" />
        <path d="M394 118C430 102 462 112 490 96C516 82 544 84 568 100" fill="none" stroke={p.accent} strokeLinecap="round" strokeWidth="4" />
        <rect x="414" y="112" width="72" height="16" rx="8" fill={p.ink} />
        <MiniText x={414} y={236} widths={[120, 78]} color={p.quiet} />
      </Panel>
      <Panel x={514} y={210} width={90} height={54} fill="#FFFFFF" stroke={p.accent2}>
        <text x="559" y="243" textAnchor="middle" fill={p.accent2} fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="800">finance</text>
      </Panel>
    </g>
  );
}

function BrowserMotif({ p }: { p: Palette }) {
  return (
    <g>
      <Panel x={356} y={74} width={228} height={178} fill="#FFFFFF" stroke={p.quiet}>
        <path d="M356 110H584" stroke={p.quiet} strokeWidth="2" />
        <circle cx="378" cy="93" r="5" fill={p.accent3} />
        <circle cx="396" cy="93" r="5" fill={p.accent2} />
        <circle cx="414" cy="93" r="5" fill={p.accent} />
        <rect x="386" y="134" width="92" height="20" rx="8" fill={p.accent} opacity="0.22" />
        <MiniText x={386} y={178} widths={[132, 96, 116]} color={p.quiet} />
      </Panel>
      <Panel x={486} y={178} width={72} height={110} fill={p.ink} stroke={p.ink}>
        <rect x="502" y="206" width="40" height="10" rx="5" fill="#FFFFFF" opacity="0.84" />
        <rect x="502" y="232" width="30" height="8" rx="4" fill={p.accent3} />
      </Panel>
    </g>
  );
}

function ModelMotif({ p }: { p: Palette }) {
  const nodes = [
    [382, 86, "Date", p.accent],
    [510, 86, "Cust", p.accent2],
    [382, 228, "Prod", p.accent3],
    [510, 228, "Geo", p.ink],
  ] as const;

  return (
    <g>
      <rect x="446" y="154" width="76" height="52" rx="12" fill={p.ink} />
      <text x="484" y="186" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontSize="15" fontWeight="800">Fact</text>
      {nodes.map(([x, y, label, color]) => (
        <g key={label}>
          <rect x={x} y={y} width="74" height="42" rx="10" fill="#FFFFFF" stroke={color} strokeWidth="2" />
          <text x={x + 37} y={y + 27} textAnchor="middle" fill={color} fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="800">{label}</text>
        </g>
      ))}
      <path d="M456 112L470 154M520 112L502 154M456 250L470 206M520 250L502 206" fill="none" stroke={p.quiet} strokeLinecap="round" strokeWidth="3" />
    </g>
  );
}

function AiMotif({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="438" y="116" width="96" height="96" rx="22" fill="#FFFFFF" stroke={p.accent2} strokeWidth="3" />
      <path d="M408 146H438M534 146H564M408 182H438M534 182H564M468 86V116M504 86V116M468 212V242M504 212V242" stroke={p.accent2} strokeLinecap="round" strokeWidth="4" />
      <circle cx="486" cy="164" r="17" fill={p.accent2} opacity="0.22" />
      <circle cx="486" cy="164" r="6" fill={p.accent2} />
      <Panel x={370} y={246} width={102} height={46} fill="#FFFFFF" stroke={p.accent}>
        <text x="421" y="275" textAnchor="middle" fill={p.accent} fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="800">input</text>
      </Panel>
      <Panel x={500} y={246} width={102} height={46} fill="#FFFFFF" stroke={p.accent3}>
        <text x="551" y="275" textAnchor="middle" fill={p.accent3} fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="800">review</text>
      </Panel>
    </g>
  );
}

function GovernanceMotif({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M486 84L572 118V176C572 230 536 268 486 288C436 268 400 230 400 176V118Z" fill="#FFFFFF" stroke={p.accent2} strokeLinejoin="round" strokeWidth="4" />
      <path d="M452 178L476 202L522 144" fill="none" stroke={p.accent2} strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
      <MiniText x={374} y={96} widths={[54, 40]} color={p.quiet} />
      <MiniText x={548} y={236} widths={[52, 36]} color={p.quiet} />
    </g>
  );
}

function CloudMotif({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="372" y="222" width="64" height="42" rx="10" fill="#FFFFFF" stroke={p.quiet} strokeWidth="2" />
      <rect x="460" y="222" width="64" height="42" rx="10" fill="#FFFFFF" stroke={p.quiet} strokeWidth="2" />
      <rect x="548" y="222" width="64" height="42" rx="10" fill="#FFFFFF" stroke={p.quiet} strokeWidth="2" />
      <path d="M410 172H548C574 172 594 154 594 130C594 108 576 92 552 92C538 92 526 98 518 108C504 88 482 80 458 86C432 92 416 112 416 136C398 140 386 154 386 170C386 172 394 172 410 172Z" fill="#FFFFFF" stroke={p.accent2} strokeLinejoin="round" strokeWidth="4" />
      <path d="M492 174V222M404 222V194H580V222" fill="none" stroke={p.accent} strokeLinecap="round" strokeWidth="4" />
    </g>
  );
}

function DecisionMotif({ p }: { p: Palette }) {
  return (
    <g>
      <Panel x={360} y={86} width={232} height={188} fill="#FFFFFF" stroke={p.quiet}>
        <path d="M476 112V248M386 180H566" stroke={p.quiet} strokeWidth="2" />
        <rect x="392" y="126" width="64" height="34" rx="8" fill={p.accent2} opacity="0.18" />
        <rect x="498" y="126" width="48" height="34" rx="8" fill={p.accent} opacity="0.18" />
        <rect x="392" y="204" width="76" height="34" rx="8" fill={p.accent3} opacity="0.2" />
        <rect x="500" y="204" width="56" height="34" rx="8" fill={p.ink} opacity="0.12" />
      </Panel>
    </g>
  );
}

function MLOpsMotif({ p }: { p: Palette }) {
  return (
    <g>
      <Panel x={360} y={92} width={96} height={48} fill="#FFFFFF" stroke={p.accent}>
        <text x="408" y="122" textAnchor="middle" fill={p.accent} fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="800">train</text>
      </Panel>
      <Panel x={498} y={92} width={96} height={48} fill="#FFFFFF" stroke={p.accent2}>
        <text x="546" y="122" textAnchor="middle" fill={p.accent2} fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="800">ship</text>
      </Panel>
      <Panel x={430} y={218} width={96} height={48} fill="#FFFFFF" stroke={p.accent3}>
        <text x="478" y="248" textAnchor="middle" fill={p.accent3} fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="800">monitor</text>
      </Panel>
      <path d="M456 116H498M540 140L498 218M430 238L384 140" fill="none" stroke={p.quiet} strokeLinecap="round" strokeWidth="4" />
    </g>
  );
}

function ProofMotif({ p }: { p: Palette }) {
  return (
    <g>
      <Panel x={362} y={92} width={96} height={172} fill="#FFFFFF" stroke={p.quiet}>
        <rect x="386" y="122" width="48" height="44" rx="8" fill={p.accent} opacity="0.2" />
        <MiniText x={386} y={196} widths={[50, 36]} color={p.quiet} />
      </Panel>
      <Panel x={486} y={72} width={104} height={212} fill={p.ink} stroke={p.ink}>
        <path d="M518 176L538 196L568 148" fill="none" stroke={p.accent3} strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
        <text x="538" y="122" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontSize="15" fontWeight="800">proof</text>
      </Panel>
    </g>
  );
}

function renderMotif(motif: Motif, palette: Palette) {
  switch (motif) {
    case "web":
      return <BrowserMotif p={palette} />;
    case "dashboard":
      return <AxisChart p={palette} />;
    case "model":
      return <ModelMotif p={palette} />;
    case "ai":
      return <AiMotif p={palette} />;
    case "governance":
    case "privacy":
      return <GovernanceMotif p={palette} />;
    case "cloud":
      return <CloudMotif p={palette} />;
    case "mlops":
      return <MLOpsMotif p={palette} />;
    case "proof":
      return <ProofMotif p={palette} />;
    case "risk":
      return <RiskMotif p={palette} />;
    case "roadmap":
    case "decision":
    default:
      return <DecisionMotif p={palette} />;
  }
}

function getCoverLabel(motif: Motif) {
  switch (motif) {
    case "web":
      return ["Digital", "surface"];
    case "dashboard":
      return ["Decision", "system"];
    case "model":
      return ["Semantic", "layer"];
    case "ai":
      return ["AI", "workflow"];
    case "governance":
    case "privacy":
      return ["Control", "framework"];
    case "cloud":
      return ["Cloud", "foundation"];
    case "mlops":
      return ["Production", "loop"];
    case "roadmap":
      return ["90-day", "roadmap"];
    case "proof":
      return ["Proof", "story"];
    case "risk":
      return ["Risk", "finance"];
    case "decision":
    default:
      return ["Decision", "brief"];
  }
}

function toSvgId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function ArticleVisual({ post, className }: ArticleVisualProps) {
  const palette = getPalette(post);
  const motif = getMotif(post);
  const coverLabel = getCoverLabel(motif);
  const reactId = useId();
  const idBase = toSvgId(`article-${reactId}-${post.slug}`);
  const surfaceGradientId = `${idBase}-surface`;
  const panelGradientId = `${idBase}-panel`;
  const bandGradientId = `${idBase}-band`;
  const motifGradientId = `${idBase}-motif`;
  const texturePatternId = `${idBase}-texture`;
  const paperShadowId = `${idBase}-paper-shadow`;
  const motifShadowId = `${idBase}-motif-shadow`;

  return (
    <div className={cn("h-full w-full overflow-hidden bg-gray-100", className)}>
      <svg
        role="img"
        aria-label={`${post.title} article cover`}
        className="h-full w-full"
        viewBox="0 0 640 360"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={surfaceGradientId} x1="0" y1="0" x2="640" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.42" stopColor={palette.paper} />
            <stop offset="1" stopColor={palette.tint} />
          </linearGradient>
          <linearGradient id={panelGradientId} x1="34" y1="42" x2="606" y2="312" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.96" />
            <stop offset="0.58" stopColor="#FFFFFF" stopOpacity="0.86" />
            <stop offset="1" stopColor={palette.tint} stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={bandGradientId} x1="0" y1="46" x2="640" y2="318" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={palette.accent} stopOpacity="0.2" />
            <stop offset="0.48" stopColor={palette.accent2} stopOpacity="0.14" />
            <stop offset="1" stopColor={palette.accent3} stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id={motifGradientId} x1="342" y1="64" x2="592" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="0.52" stopColor={palette.paper} stopOpacity="0.82" />
            <stop offset="1" stopColor={palette.tint} stopOpacity="0.9" />
          </linearGradient>
          <pattern id={texturePatternId} width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M0 21.5H22M21.5 0V22" stroke={palette.quiet} strokeOpacity="0.12" strokeWidth="1" />
            <circle cx="5" cy="6" r="0.8" fill={palette.quiet} fillOpacity="0.1" />
          </pattern>
          <filter id={paperShadowId} x="-8%" y="-12%" width="116%" height="128%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor={palette.ink} floodOpacity="0.16" />
          </filter>
          <filter id={motifShadowId} x="-14%" y="-14%" width="128%" height="132%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor={palette.ink} floodOpacity="0.14" />
          </filter>
        </defs>

        <rect width="640" height="360" fill={`url(#${surfaceGradientId})`} />
        <path d="M0 0H640V128H0Z" fill={palette.tint} opacity="0.78" />
        <path d="M-36 64C80 26 182 42 286 80C390 118 478 128 676 70V246C520 306 404 304 276 260C172 224 72 222 -36 260Z" fill={`url(#${bandGradientId})`} />
        <path d="M0 306C84 270 154 286 236 312C330 342 430 344 640 268V360H0Z" fill={palette.accent} opacity="0.1" />
        <rect width="640" height="360" fill={`url(#${texturePatternId})`} opacity="0.55" />

        <g filter={`url(#${paperShadowId})`}>
          <rect x="34" y="44" width="572" height="268" rx="30" fill={`url(#${panelGradientId})`} />
          <rect x="34" y="44" width="572" height="268" rx="30" fill="#FFFFFF" opacity="0.36" />
          <rect x="34" y="44" width="572" height="268" rx="30" fill="none" stroke="#FFFFFF" strokeOpacity="0.74" strokeWidth="2" />
          <rect x="35" y="45" width="570" height="266" rx="29" fill="none" stroke={palette.quiet} strokeOpacity="0.28" strokeWidth="1.5" />
        </g>
        <path d="M52 74V286" stroke={palette.accent} strokeLinecap="round" strokeWidth="6" />
        <path d="M64 74V190" stroke={palette.accent3} strokeLinecap="round" strokeWidth="3" opacity="0.72" />
        <g opacity="0.2">
          {Array.from({ length: 9 }).map((_, index) => (
            <path key={index} d={`M68 ${88 + index * 24}H304`} stroke={palette.quiet} strokeWidth="1" />
          ))}
        </g>

        <rect x="72" y="82" width={Math.min(230, 84 + post.category.length * 8)} height="30" rx="15" fill={palette.ink} />
        <text x="92" y="102" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontSize="12" fontWeight="800" letterSpacing="0">
          {post.category.toUpperCase()}
        </text>

        <text x="72" y="166" fill={palette.ink} fontFamily="Inter, Arial, sans-serif" fontSize="38" fontWeight="850" letterSpacing="0">
          {coverLabel.map((line, index) => (
            <tspan key={line} x="72" dy={index === 0 ? 0 : 44}>
              {line}
            </tspan>
          ))}
        </text>
        <MiniText x={74} y={236} widths={[184, 128]} color={palette.quiet} />

        <g transform="translate(74 274)">
          <rect width="68" height="14" rx="7" fill={palette.accent} opacity="0.22" />
          <rect x="78" width="42" height="14" rx="7" fill={palette.accent2} opacity="0.18" />
          <rect x="132" width="22" height="14" rx="7" fill={palette.accent3} opacity="0.28" />
          <rect y="22" width="112" height="6" rx="3" fill={palette.quiet} opacity="0.3" />
          <rect x="124" y="22" width="36" height="6" rx="3" fill={palette.quiet} opacity="0.18" />
        </g>

        <path d="M330 72V292" stroke={palette.quiet} strokeOpacity="0.28" strokeWidth="2" />
        <g filter={`url(#${motifShadowId})`}>
          <rect x="340" y="62" width="258" height="238" rx="28" fill={`url(#${motifGradientId})`} />
          <rect x="340" y="62" width="258" height="238" rx="28" fill="#FFFFFF" opacity="0.2" />
          <path d="M360 92H576M360 270H548" stroke="#FFFFFF" strokeLinecap="round" strokeOpacity="0.72" strokeWidth="2" />
          <path d="M372 74H584V288" fill="none" stroke={palette.accent} strokeLinecap="round" strokeOpacity="0.18" strokeWidth="8" />
          <rect x="340" y="62" width="258" height="238" rx="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.76" strokeWidth="2" />
          <rect x="341" y="63" width="256" height="236" rx="27" fill="none" stroke={palette.quiet} strokeOpacity="0.24" strokeWidth="1.5" />
        </g>
        <g filter={`url(#${motifShadowId})`}>{renderMotif(motif, palette)}</g>
      </svg>
    </div>
  );
}
