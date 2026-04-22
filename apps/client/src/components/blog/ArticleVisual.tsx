import type { ReactNode } from "react";
import type { BlogPost } from "@/data/blogData";
import { cn } from "@/lib/utils";

type ArticleVisualPost = Pick<BlogPost, "slug" | "title" | "category" | "tags">;

interface ArticleVisualProps {
  post: ArticleVisualPost;
  className?: string;
}

interface Palette {
  bg: string;
  bg2: string;
  ink: string;
  muted: string;
  panel: string;
  accent: string;
  accent2: string;
  accent3: string;
}

type Motif =
  | "greeceWeb"
  | "biCockpit"
  | "semanticStar"
  | "aiUseCases"
  | "dataFoundation"
  | "cloudMigration"
  | "mlopsRelease"
  | "gdprShield"
  | "aiRisk"
  | "analyticsConversion"
  | "redesignAudit"
  | "bookingCalendar"
  | "landingFunnel"
  | "requirementsBoard"
  | "kpiDictionary"
  | "toolComparison"
  | "qualityChecklist"
  | "customer360"
  | "documentWorkflow"
  | "promptWorkflow"
  | "policyGuardrails"
  | "forecastVariance"
  | "roadmap90"
  | "warehouseMigration"
  | "automationDag"
  | "modelMonitoring"
  | "privacyAnalytics"
  | "managerLiteracy"
  | "buildBuyMatrix"
  | "caseStudyProof"
  | "geminiImport"
  | "workspaceProduct";

interface VisualSpec {
  hash: number;
  offset: number;
  palette: Palette;
  motif: Motif;
}

type SvgLength = number | string;

const PALETTE_BANK: Palette[] = [
  {
    bg: "#F8FAFC",
    bg2: "#EFF6FF",
    ink: "#111827",
    muted: "#CBD5E1",
    panel: "#FFFFFF",
    accent: "#2563EB",
    accent2: "#14B8A6",
    accent3: "#F59E0B",
  },
  {
    bg: "#FAFAFA",
    bg2: "#ECFDF5",
    ink: "#111827",
    muted: "#D1D5DB",
    panel: "#FFFFFF",
    accent: "#059669",
    accent2: "#2563EB",
    accent3: "#F97316",
  },
  {
    bg: "#F8FAFC",
    bg2: "#F5F3FF",
    ink: "#111827",
    muted: "#CBD5E1",
    panel: "#FFFFFF",
    accent: "#7C3AED",
    accent2: "#06B6D4",
    accent3: "#F59E0B",
  },
  {
    bg: "#FFF7ED",
    bg2: "#F8FAFC",
    ink: "#111827",
    muted: "#D6D3D1",
    panel: "#FFFFFF",
    accent: "#EA580C",
    accent2: "#0F766E",
    accent3: "#2563EB",
  },
  {
    bg: "#FDF2F8",
    bg2: "#F8FAFC",
    ink: "#111827",
    muted: "#D1D5DB",
    panel: "#FFFFFF",
    accent: "#BE123C",
    accent2: "#4F46E5",
    accent3: "#10B981",
  },
  {
    bg: "#F7FEE7",
    bg2: "#F8FAFC",
    ink: "#111827",
    muted: "#D1D5DB",
    panel: "#FFFFFF",
    accent: "#65A30D",
    accent2: "#0284C7",
    accent3: "#7C3AED",
  },
  {
    bg: "#F8FAFC",
    bg2: "#FEF3C7",
    ink: "#111827",
    muted: "#CBD5E1",
    panel: "#FFFFFF",
    accent: "#F59E0B",
    accent2: "#0EA5E9",
    accent3: "#111827",
  },
  {
    bg: "#F1F5F9",
    bg2: "#F8FAFC",
    ink: "#111827",
    muted: "#CBD5E1",
    panel: "#FFFFFF",
    accent: "#0F766E",
    accent2: "#A855F7",
    accent3: "#F97316",
  },
];

const MOTIF_BY_SLUG: Record<string, Motif> = {
  "website-web-app-development-greece-business-needs": "greeceWeb",
  "power-bi-consulting-dashboards-business-infrastructure": "biCockpit",
  "semantic-modeling-power-bi-clean-models": "semanticStar",
  "ai-consulting-greek-businesses-practical-use-cases": "aiUseCases",
  "data-strategy-before-ai-better-foundations": "dataFoundation",
  "cloud-migration-analytics-teams-manual-reports": "cloudMigration",
  "mlops-small-mid-sized-teams-productionize-ai": "mlopsRelease",
  "data-governance-gdpr-scale-analytics-control": "gdprShield",
  "ai-literacy-teams-adopt-ai-without-operational-risk": "aiRisk",
  "modern-websites-track-business-outcomes": "analyticsConversion",
  "corporate-website-redesign-warning-signs": "redesignAudit",
  "booking-flows-service-businesses": "bookingCalendar",
  "landing-pages-for-ai-products": "landingFunnel",
  "dashboard-requirements-before-power-bi-build": "requirementsBoard",
  "kpi-dictionary-business-intelligence": "kpiDictionary",
  "power-bi-tableau-looker-tool-choice": "toolComparison",
  "data-quality-checklist-analytics-projects": "qualityChecklist",
  "customer-data-foundation-small-business": "customer360",
  "ai-document-workflows-professional-services": "documentWorkflow",
  "prompt-workflow-design-business-teams": "promptWorkflow",
  "ai-assistant-governance-company-policy": "policyGuardrails",
  "predictive-analytics-forecasting-mistakes": "forecastVariance",
  "analytics-roadmap-first-90-days": "roadmap90",
  "cloud-data-warehouse-vs-spreadsheets": "warehouseMigration",
  "dbt-airflow-analytics-automation": "automationDag",
  "model-monitoring-ai-workflows": "modelMonitoring",
  "gdpr-safe-web-analytics": "privacyAnalytics",
  "data-literacy-training-for-managers": "managerLiteracy",
  "internal-tools-vs-saas-build-buy": "buildBuyMatrix",
  "portfolio-case-studies-that-sell-services": "caseStudyProof",
  "google-gemini-import-ai-chats": "geminiImport",
  "power-bi-solutions-semantic-model-analysis-workspace": "workspaceProduct",
};

const FALLBACK_MOTIFS: Motif[] = [
  "dataFoundation",
  "biCockpit",
  "semanticStar",
  "analyticsConversion",
  "documentWorkflow",
  "workspaceProduct",
];

const MOTIF_PALETTE: Record<Motif, number> = {
  greeceWeb: 1,
  biCockpit: 6,
  semanticStar: 2,
  aiUseCases: 4,
  dataFoundation: 0,
  cloudMigration: 7,
  mlopsRelease: 3,
  gdprShield: 1,
  aiRisk: 4,
  analyticsConversion: 5,
  redesignAudit: 3,
  bookingCalendar: 0,
  landingFunnel: 2,
  requirementsBoard: 6,
  kpiDictionary: 7,
  toolComparison: 6,
  qualityChecklist: 1,
  customer360: 0,
  documentWorkflow: 2,
  promptWorkflow: 4,
  policyGuardrails: 7,
  forecastVariance: 5,
  roadmap90: 3,
  warehouseMigration: 0,
  automationDag: 2,
  modelMonitoring: 4,
  privacyAnalytics: 1,
  managerLiteracy: 6,
  buildBuyMatrix: 7,
  caseStudyProof: 3,
  geminiImport: 2,
  workspaceProduct: 0,
};

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function buildSpec(post: ArticleVisualPost): VisualSpec {
  const hash = hashString(`${post.slug}:${post.category}:${post.title}`);
  const motif = MOTIF_BY_SLUG[post.slug] ?? FALLBACK_MOTIFS[hash % FALLBACK_MOTIFS.length];
  const palette = PALETTE_BANK[MOTIF_PALETTE[motif] ?? hash % PALETTE_BANK.length];

  return {
    hash,
    motif,
    palette,
    offset: hash % 31,
  };
}

function Panel({
  x,
  y,
  width,
  height,
  radius = 10,
  fill,
  stroke,
  strokeWidth = 2,
  children,
}: {
  x: SvgLength;
  y: SvgLength;
  width: SvgLength;
  height: SvgLength;
  radius?: SvgLength;
  fill?: string;
  stroke?: string;
  strokeWidth?: SvgLength;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={stroke ? strokeWidth : undefined}
      />
      {children}
    </g>
  );
}

function Line({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 3,
  dashed,
}: {
  x1: SvgLength;
  y1: SvgLength;
  x2: SvgLength;
  y2: SvgLength;
  color: string;
  width?: SvgLength;
  dashed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeDasharray={dashed ? "7 8" : undefined}
      strokeLinecap="round"
      strokeWidth={width}
    />
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  dashed,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dashed?: boolean;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const leftX = x2 - Math.cos(angle - 0.55) * 13;
  const leftY = y2 - Math.sin(angle - 0.55) * 13;
  const rightX = x2 - Math.cos(angle + 0.55) * 13;
  const rightY = y2 - Math.sin(angle + 0.55) * 13;

  return (
    <g>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} color={color} dashed={dashed} />
      <path d={`M${leftX} ${leftY}L${x2} ${y2}L${rightX} ${rightY}`} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </g>
  );
}

function Label({
  x,
  y,
  children,
  color,
  size = 18,
  anchor = "middle",
}: {
  x: SvgLength;
  y: SvgLength;
  children: ReactNode;
  color: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily="Inter, Arial, sans-serif"
      fontSize={size}
      fontWeight="700"
      letterSpacing="0"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

function MiniLines({
  x,
  y,
  widths,
  color,
}: {
  x: number;
  y: number;
  widths: number[];
  color: string;
}) {
  return (
    <g>
      {widths.map((width, index) => (
        <rect key={`${x}-${y}-${width}-${index}`} x={x} y={y + index * 16} width={width} height="7" rx="3.5" fill={color} opacity={index === 0 ? 0.75 : 0.45} />
      ))}
    </g>
  );
}

function Check({ x, y, color, width = 5 }: { x: number; y: number; color: string; width?: number }) {
  return (
    <path
      d={`M${x} ${y + 10}L${x + 12} ${y + 22}L${x + 34} ${y - 8}`}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={width}
    />
  );
}

function Warning({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x + 24} ${y}L${x + 48} ${y + 44}H${x}Z`} fill="#FFFFFF" stroke={color} strokeLinejoin="round" strokeWidth="3" />
      <Line x1={x + 24} y1={y + 15} x2={x + 24} y2={y + 28} color={color} width={4} />
      <circle cx={x + 24} cy={y + 36} r="3" fill={color} />
    </g>
  );
}

function Cloud({ x, y, color, fill = "#FFFFFF" }: { x: number; y: number; color: string; fill?: string }) {
  return (
    <path
      d={`M${x + 36} ${y + 72}H${x + 126}C${x + 148} ${y + 72} ${x + 166} ${y + 56} ${x + 166} ${y + 34}C${x + 166} ${y + 14} ${x + 150} ${y} ${x + 130} ${y}C${x + 118} ${y} ${x + 106} ${y + 6} ${x + 99} ${y + 16}C${x + 88} ${y + 4} ${x + 72} ${y - 2} ${x + 54} ${y + 2}C${x + 33} ${y + 7} ${x + 20} ${y + 24} ${x + 20} ${y + 43}C${x + 8} ${y + 47} ${x} ${y + 58} ${x} ${y + 70}C${x} ${y + 71} ${x + 12} ${y + 72} ${x + 36} ${y + 72}Z`}
      fill={fill}
      stroke={color}
      strokeWidth="4"
      strokeLinejoin="round"
    />
  );
}

function Cylinder({ x, y, width, height, color, fill }: { x: number; y: number; width: number; height: number; color: string; fill: string }) {
  return (
    <g>
      <ellipse cx={x + width / 2} cy={y} rx={width / 2} ry="13" fill={fill} stroke={color} strokeWidth="3" />
      <path d={`M${x} ${y}V${y + height}C${x} ${y + height + 17} ${x + width} ${y + height + 17} ${x + width} ${y + height}V${y}`} fill={fill} stroke={color} strokeWidth="3" />
      <ellipse cx={x + width / 2} cy={y + height} rx={width / 2} ry="13" fill={fill} stroke={color} strokeWidth="3" />
    </g>
  );
}

function Chip({ x, y, size, color, fill }: { x: number; y: number; size: number; color: string; fill: string }) {
  const pinOffsets = [14, 30, 46, 62];

  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx="14" fill={fill} stroke={color} strokeWidth="4" />
      {pinOffsets.map((offset) => (
        <g key={offset}>
          <Line x1={x - 16} y1={y + offset} x2={x} y2={y + offset} color={color} width={3} />
          <Line x1={x + size} y1={y + offset} x2={x + size + 16} y2={y + offset} color={color} width={3} />
          <Line x1={x + offset} y1={y - 16} x2={x + offset} y2={y} color={color} width={3} />
          <Line x1={x + offset} y1={y + size} x2={x + offset} y2={y + size + 16} color={color} width={3} />
        </g>
      ))}
      <circle cx={x + size / 2} cy={y + size / 2} r="16" fill={color} opacity="0.2" />
      <circle cx={x + size / 2} cy={y + size / 2} r="6" fill={color} />
    </g>
  );
}

function BrowserFrame({
  x,
  y,
  width,
  height,
  palette,
  darkHeader = false,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  palette: Palette;
  darkHeader?: boolean;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="18" fill={palette.panel} stroke={palette.muted} strokeWidth="2" />
      <path d={`M${x} ${y + 20}C${x} ${y + 9} ${x + 9} ${y} ${x + 20} ${y}H${x + width - 20}C${x + width - 9} ${y} ${x + width} ${y + 9} ${x + width} ${y + 20}V${y + 38}H${x}Z`} fill={darkHeader ? palette.ink : palette.bg2} />
      <circle cx={x + 21} cy={y + 19} r="5" fill={palette.accent3} />
      <circle cx={x + 39} cy={y + 19} r="5" fill={palette.accent2} />
      <circle cx={x + 57} cy={y + 19} r="5" fill={palette.accent} />
      {children}
    </g>
  );
}

function Backdrop({ spec, gradientId, patternId }: { spec: VisualSpec; gradientId: string; patternId: string }) {
  const { palette, motif, offset } = spec;

  if (["biCockpit", "modelMonitoring", "workspaceProduct"].includes(motif)) {
    return (
      <g>
        <rect width="640" height="360" fill="#0F172A" />
        <path d="M0 302C98 268 168 286 242 314C332 348 428 344 640 260V360H0Z" fill={palette.accent} opacity="0.14" />
        <circle cx={520 - offset} cy="76" r="112" fill={palette.accent2} opacity="0.14" />
        <rect width="640" height="360" fill={`url(#${patternId})`} opacity="0.13" />
      </g>
    );
  }

  if (["roadmap90", "buildBuyMatrix", "caseStudyProof"].includes(motif)) {
    return (
      <g>
        <rect width="640" height="360" fill={palette.bg} />
        <path d="M0 70H640V154H0Z" fill={palette.bg2} />
        <path d="M0 276H640V360H0Z" fill={palette.accent} opacity="0.08" />
        <circle cx={86 + offset} cy="276" r="64" fill={palette.accent2} opacity="0.13" />
      </g>
    );
  }

  if (["greeceWeb", "bookingCalendar", "analyticsConversion", "landingFunnel"].includes(motif)) {
    return (
      <g>
        <rect width="640" height="360" fill={`url(#${gradientId})`} />
        <path d="M-40 288C88 222 178 264 292 214C404 165 466 86 680 130V360H-40Z" fill={palette.accent2} opacity="0.11" />
        <circle cx="564" cy="74" r="76" fill={palette.accent3} opacity="0.11" />
      </g>
    );
  }

  return (
    <g>
      <rect width="640" height="360" fill={`url(#${gradientId})`} />
      <rect width="640" height="360" fill={`url(#${patternId})`} opacity="0.45" />
      <circle cx={88 + offset} cy="306" r="78" fill={palette.accent} opacity="0.07" />
      <circle cx={552 - offset} cy="72" r="88" fill={palette.accent2} opacity="0.09" />
    </g>
  );
}

function sceneGreeceWeb(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <BrowserFrame x={46} y={58} width={344} height={236} palette={palette}>
        <rect x="78" y="124" width="128" height="30" rx="8" fill={palette.accent} opacity="0.22" />
        <rect x="78" y="174" width="206" height="9" rx="4.5" fill={palette.muted} />
        <rect x="78" y="198" width="160" height="9" rx="4.5" fill={palette.muted} opacity="0.7" />
        <rect x="78" y="232" width="74" height="24" rx="9" fill={palette.ink} />
        <path d="M206 252C244 252 260 234 300 234H348" fill="none" stroke={palette.accent2} strokeWidth="5" strokeLinecap="round" />
      </BrowserFrame>
      <Panel x="428" y="82" width="138" height="198" radius={22} fill={palette.panel} stroke={palette.muted}>
        <rect x="454" y="112" width="86" height="11" rx="5.5" fill={palette.ink} />
        <path d="M478 180C494 150 522 150 536 180C520 188 494 188 478 180Z" fill={palette.accent2} opacity="0.18" stroke={palette.accent2} strokeWidth="4" />
        <path d="M508 136C486 150 470 174 468 210C492 214 522 214 548 204C540 176 528 150 508 136Z" fill={palette.accent} opacity="0.18" stroke={palette.accent} strokeWidth="3" />
        <circle cx="508" cy="172" r="10" fill={palette.accent3} />
        <Label x="508" y="250" color={palette.ink} size={22}>
          GR
        </Label>
      </Panel>
    </g>
  );
}

function sceneBiCockpit(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <rect x="46" y="54" width="548" height="252" rx="22" fill="#111827" stroke="#334155" strokeWidth="2" />
      <rect x="74" y="86" width="112" height="184" rx="12" fill="#1F2937" />
      <rect x="214" y="86" width="158" height="78" rx="12" fill="#F8FAFC" />
      <rect x="398" y="86" width="158" height="78" rx="12" fill="#F8FAFC" />
      <rect x="214" y="190" width="342" height="80" rx="14" fill="#F8FAFC" />
      <Label x="130" y="126" color="#FFFFFF" size={19}>
        KPI
      </Label>
      <MiniLines x={98} y={156} widths={[64, 48, 70]} color="#94A3B8" />
      <path d="M242 136H344" stroke={palette.accent} strokeLinecap="round" strokeWidth="12" />
      <path d="M426 136H528" stroke={palette.accent2} strokeLinecap="round" strokeWidth="12" />
      <path d="M244 238C288 202 326 246 372 216C418 188 458 206 526 206" fill="none" stroke={palette.accent3} strokeLinecap="round" strokeWidth="6" />
      <circle cx="506" cy="224" r="24" fill="none" stroke={palette.accent2} strokeWidth="6" />
      <path d="M506 224L522 206" stroke="#111827" strokeLinecap="round" strokeWidth="4" />
    </g>
  );
}

function sceneSemanticStar(spec: VisualSpec) {
  const { palette } = spec;
  const nodes = [
    { x: 76, y: 78, label: "Date", color: palette.accent },
    { x: 452, y: 78, label: "Customer", color: palette.accent2 },
    { x: 86, y: 236, label: "Product", color: palette.accent3 },
    { x: 446, y: 236, label: "Region", color: palette.ink },
  ];

  return (
    <g>
      <Panel x="250" y="132" width="140" height="96" radius={14} fill={palette.ink} stroke={palette.ink}>
        <Label x="320" y="166" color="#FFFFFF" size={19}>
          Fact
        </Label>
        <rect x="286" y="186" width="68" height="9" rx="4.5" fill={palette.accent2} />
      </Panel>
      {nodes.map((node) => (
        <g key={node.label}>
          <Panel x={node.x} y={node.y} width="122" height="58" radius={10} fill={palette.panel} stroke={node.color}>
            <Label x={node.x + 61} y={node.y + 36} color={node.color} size={17}>
              {node.label}
            </Label>
          </Panel>
        </g>
      ))}
      <Arrow x1={198} y1={108} x2={250} y2={154} color={palette.muted} />
      <Arrow x1={452} y1={108} x2={390} y2={154} color={palette.muted} />
      <Arrow x1={208} y1={264} x2={250} y2={210} color={palette.muted} dashed />
      <Arrow x1={446} y1={264} x2={390} y2={210} color={palette.muted} dashed />
      <Panel x="280" y="64" width="80" height="38" radius={19} fill={palette.accent3} stroke={palette.accent3}>
        <Label x="320" y="88" color="#FFFFFF" size={16}>
          DAX
        </Label>
      </Panel>
    </g>
  );
}

function sceneAiUseCases(spec: VisualSpec) {
  const { palette } = spec;
  const cards = [
    { x: 72, y: 72, label: "Leads", color: palette.accent },
    { x: 418, y: 74, label: "Docs", color: palette.accent2 },
    { x: 74, y: 232, label: "Support", color: palette.accent3 },
    { x: 422, y: 232, label: "BI", color: palette.ink },
  ];

  return (
    <g>
      <Chip x={268} y={126} size={104} color={palette.accent} fill="#FFFFFF" />
      <Label x="320" y="187" color={palette.accent} size={24}>
        AI
      </Label>
      {cards.map((card) => (
        <g key={card.label}>
          <Panel x={card.x} y={card.y} width="128" height="64" radius={12} fill={palette.panel} stroke={card.color}>
            <Label x={card.x + 64} y={card.y + 40} color={card.color} size={17}>
              {card.label}
            </Label>
          </Panel>
        </g>
      ))}
      <Line x1="200" y1="104" x2="268" y2="154" color={palette.muted} />
      <Line x1="418" y1="106" x2="372" y2="154" color={palette.muted} />
      <Line x1="202" y1="264" x2="268" y2="210" color={palette.muted} dashed />
      <Line x1="422" y1="264" x2="372" y2="210" color={palette.muted} dashed />
    </g>
  );
}

function sceneDataFoundation(spec: VisualSpec) {
  const { palette } = spec;
  const layers = [
    { y: 242, width: 392, label: "Trusted Data", color: palette.ink },
    { y: 198, width: 330, label: "Metrics", color: palette.accent2 },
    { y: 154, width: 266, label: "Models", color: palette.accent },
    { y: 110, width: 196, label: "AI", color: palette.accent3 },
  ];

  return (
    <g>
      {layers.map((layer) => {
        const x = 320 - layer.width / 2;
        return (
          <g key={layer.label}>
            <rect x={x} y={layer.y} width={layer.width} height="34" rx="10" fill={layer.color} opacity={layer.label === "Trusted Data" ? 1 : 0.86} />
            <Label x="320" y={layer.y + 23} color="#FFFFFF" size={16}>
              {layer.label}
            </Label>
          </g>
        );
      })}
      <Panel x="92" y="84" width="110" height="74" radius={12} fill={palette.panel} stroke={palette.muted}>
        <MiniLines x={116} y={112} widths={[54, 70, 42]} color={palette.muted} />
      </Panel>
      <Panel x="438" y="86" width="112" height="72" radius={12} fill={palette.panel} stroke={palette.muted}>
        <rect x="464" y="112" width="58" height="18" rx="6" fill={palette.accent2} opacity="0.22" />
        <Check x={478} y={120} color={palette.accent2} width={4} />
      </Panel>
    </g>
  );
}

function sceneCloudMigration(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="58" y="92" width="132" height="158" radius={12} fill={palette.panel} stroke={palette.muted}>
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 3 }).map((__, column) => (
            <rect key={`${row}-${column}`} x={82 + column * 30} y={120 + row * 26} width="20" height="12" rx="3" fill={row === 0 ? palette.accent3 : palette.muted} opacity={row === 0 ? 1 : 0.58} />
          )),
        )}
      </Panel>
      <Arrow x1={206} y1={172} x2={282} y2={172} color={palette.accent} />
      <Cloud x={282} y={112} color={palette.accent2} fill="#FFFFFF" />
      <Arrow x1={464} y1={172} x2={520} y2={172} color={palette.accent} />
      <Cylinder x={512} y={128} width={72} height={104} color={palette.ink} fill="#FFFFFF" />
      <Label x="548" y="184" color={palette.ink} size={16}>
        DWH
      </Label>
    </g>
  );
}

function sceneMlopsRelease(spec: VisualSpec) {
  const { palette } = spec;
  const steps = [
    { x: 70, label: "Train", color: palette.accent },
    { x: 236, label: "Deploy", color: palette.accent2 },
    { x: 402, label: "Monitor", color: palette.accent3 },
  ];

  return (
    <g>
      <rect x="76" y="174" width="488" height="12" rx="6" fill={palette.muted} />
      {steps.map((step, index) => (
        <g key={step.label}>
          <Panel x={step.x} y={118} width="132" height="72" radius={14} fill={palette.panel} stroke={step.color}>
            <Label x={step.x + 66} y={162} color={step.color} size={17}>
              {step.label}
            </Label>
          </Panel>
          <circle cx={step.x + 66} cy="180" r="16" fill={step.color} />
          {index < steps.length - 1 ? <Arrow x1={step.x + 142} y1={154} x2={step.x + 166} y2={154} color={palette.muted} /> : null}
        </g>
      ))}
      <Panel x="210" y="232" width="220" height="44" radius={22} fill={palette.ink} stroke={palette.ink}>
        <Label x="320" y="260" color="#FFFFFF" size={16}>
          production path
        </Label>
      </Panel>
    </g>
  );
}

function sceneGdprShield(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="62" y="82" width="244" height="190" radius={16} fill={palette.panel} stroke={palette.muted}>
        {["Consent", "Access", "Retention", "Audit"].map((item, index) => (
          <g key={item}>
            <circle cx="94" cy={124 + index * 36} r="9" fill={index < 3 ? palette.accent2 : "#FFFFFF"} stroke={palette.accent2} strokeWidth="3" />
            {index < 3 ? <Check x={88} y={114 + index * 36} color="#FFFFFF" width={3} /> : null}
            <Label x="126" y={130 + index * 36} color={palette.ink} size={15} anchor="start">
              {item}
            </Label>
          </g>
        ))}
      </Panel>
      <path d="M436 72L542 112V178C542 234 488 264 450 276C412 264 358 234 358 178V112L436 72Z" fill="#FFFFFF" stroke={palette.accent2} strokeWidth="5" />
      <path d="M418 164V142C418 122 432 110 450 110C468 110 482 122 482 142V164" fill="none" stroke={palette.ink} strokeLinecap="round" strokeWidth="6" />
      <rect x="404" y="160" width="92" height="72" rx="13" fill={palette.accent2} />
      <circle cx="450" cy="193" r="9" fill="#FFFFFF" />
      <Line x1="450" y1="202" x2="450" y2="216" color="#FFFFFF" width={5} />
    </g>
  );
}

function sceneAiRisk(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="64" y="78" width="224" height="204" radius={14} fill={palette.panel} stroke={palette.muted}>
        <Line x1="176" y1="102" x2="176" y2="258" color={palette.muted} width={2} />
        <Line x1="88" y1="180" x2="264" y2="180" color={palette.muted} width={2} />
        <rect x="92" y="112" width="70" height="52" rx="8" fill={palette.accent2} opacity="0.18" />
        <rect x="190" y="112" width="70" height="52" rx="8" fill={palette.accent3} opacity="0.22" />
        <rect x="92" y="196" width="70" height="52" rx="8" fill={palette.accent} opacity="0.16" />
        <rect x="190" y="196" width="70" height="52" rx="8" fill={palette.ink} opacity="0.1" />
      </Panel>
      <Chip x={378} y={96} size={96} color={palette.accent} fill="#FFFFFF" />
      <Warning x={416} y={220} color={palette.accent3} />
      <Arrow x1={326} y1={174} x2={378} y2={150} color={palette.muted} dashed />
      <Label x="176" y="306" color={palette.ink} size={17}>
        risk matrix
      </Label>
    </g>
  );
}

function sceneAnalyticsConversion(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <BrowserFrame x={56} y={62} width={326} height={226} palette={palette}>
        <rect x="88" y="120" width="152" height="28" rx="8" fill={palette.accent} opacity="0.2" />
        <rect x="88" y="174" width="210" height="9" rx="4.5" fill={palette.muted} />
        <rect x="88" y="198" width="132" height="9" rx="4.5" fill={palette.muted} />
        <rect x="88" y="234" width="84" height="24" rx="8" fill={palette.ink} />
      </BrowserFrame>
      <path d="M394 118H534L500 178H428Z" fill={palette.accent2} opacity="0.18" stroke={palette.accent2} strokeWidth="4" strokeLinejoin="round" />
      <path d="M428 178H500L484 232H444Z" fill={palette.accent3} opacity="0.22" stroke={palette.accent3} strokeWidth="4" strokeLinejoin="round" />
      <rect x="444" y="246" width="42" height="34" rx="8" fill={palette.accent2} />
      <Arrow x1={382} y1={178} x2={420} y2={178} color={palette.accent} />
      <circle cx="514" cy="98" r="24" fill={palette.accent3} />
      <Label x="514" y="105" color="#FFFFFF" size={18}>
        3x
      </Label>
    </g>
  );
}

function sceneRedesignAudit(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="52" y="76" width="242" height="204" radius={16} fill={palette.panel} stroke={palette.muted}>
        <rect x="80" y="112" width="160" height="18" rx="6" fill={palette.muted} />
        <rect x="80" y="156" width="120" height="10" rx="5" fill={palette.muted} />
        <rect x="80" y="182" width="150" height="10" rx="5" fill={palette.muted} opacity="0.7" />
        <Warning x={208} y={214} color={palette.accent3} />
      </Panel>
      <Panel x="346" y="76" width="242" height="204" radius={16} fill={palette.panel} stroke={palette.accent2}>
        <rect x="374" y="112" width="138" height="26" rx="8" fill={palette.accent2} opacity="0.18" />
        <path d="M374 210C414 178 450 220 496 176C518 156 536 152 560 154" fill="none" stroke={palette.accent2} strokeLinecap="round" strokeWidth="5" />
        <Check x={516} y={220} color={palette.accent2} />
      </Panel>
      <Label x="320" y="186" color={palette.ink} size={25}>
        before / after
      </Label>
    </g>
  );
}

function sceneBookingCalendar(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="74" y="74" width="260" height="214" radius={18} fill={palette.panel} stroke={palette.muted}>
        <rect x="74" y="74" width="260" height="48" rx="18" fill={palette.accent} />
        <Label x="204" y="106" color="#FFFFFF" size={18}>
          Booking
        </Label>
        {Array.from({ length: 12 }).map((_, index) => (
          <rect
            key={index}
            x={100 + (index % 4) * 50}
            y={146 + Math.floor(index / 4) * 38}
            width="34"
            height="24"
            rx="6"
            fill={index === 5 || index === 10 ? palette.accent2 : palette.bg2}
            stroke={index === 5 || index === 10 ? palette.accent2 : palette.muted}
          />
        ))}
      </Panel>
      <Panel x="406" y="100" width="132" height="176" radius={22} fill={palette.ink} stroke={palette.ink}>
        <rect x="434" y="130" width="76" height="9" rx="4.5" fill="#FFFFFF" opacity="0.85" />
        <rect x="434" y="166" width="76" height="42" rx="10" fill={palette.accent3} />
        <Check x={454} y={176} color="#FFFFFF" />
        <rect x="434" y="236" width="76" height="12" rx="6" fill={palette.accent2} />
      </Panel>
      <Arrow x1={338} y1={188} x2={404} y2={188} color={palette.accent} />
    </g>
  );
}

function sceneLandingFunnel(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="62" y="76" width="186" height="210" radius={16} fill={palette.panel} stroke={palette.muted}>
        <rect x="90" y="112" width="126" height="24" rx="8" fill={palette.accent} opacity="0.2" />
        <rect x="90" y="158" width="106" height="9" rx="4.5" fill={palette.muted} />
        <rect x="90" y="182" width="126" height="9" rx="4.5" fill={palette.muted} />
        <rect x="90" y="226" width="86" height="24" rx="8" fill={palette.ink} />
      </Panel>
      <path d="M306 98H524L486 168H344Z" fill={palette.accent2} opacity="0.15" stroke={palette.accent2} strokeWidth="4" strokeLinejoin="round" />
      <path d="M344 168H486L460 232H370Z" fill={palette.accent} opacity="0.16" stroke={palette.accent} strokeWidth="4" strokeLinejoin="round" />
      <path d="M370 232H460L446 280H384Z" fill={palette.accent3} opacity="0.24" stroke={palette.accent3} strokeWidth="4" strokeLinejoin="round" />
      <Label x="416" y="314" color={palette.ink} size={17}>
        signup flow
      </Label>
    </g>
  );
}

function sceneRequirementsBoard(spec: VisualSpec) {
  const { palette } = spec;
  const notes = [
    { x: 82, y: 92, label: "KPIs", color: palette.accent3 },
    { x: 226, y: 92, label: "Users", color: palette.accent2 },
    { x: 370, y: 92, label: "Data", color: palette.accent },
    { x: 154, y: 206, label: "Refresh", color: palette.accent },
    { x: 306, y: 206, label: "Access", color: palette.accent3 },
  ];

  return (
    <g>
      <rect x="54" y="68" width="532" height="228" rx="18" fill={palette.panel} stroke={palette.muted} strokeWidth="2" />
      {notes.map((note) => (
        <g key={note.label}>
          <rect x={note.x} y={note.y} width="104" height="64" rx="8" fill={note.color} opacity="0.18" stroke={note.color} strokeWidth="2" />
          <Label x={note.x + 52} y={note.y + 39} color={note.color} size={15}>
            {note.label}
          </Label>
        </g>
      ))}
      <Line x1="134" y1="156" x2="206" y2="206" color={palette.muted} />
      <Line x1="278" y1="156" x2="258" y2="206" color={palette.muted} dashed />
      <Line x1="422" y1="156" x2="358" y2="206" color={palette.muted} />
      <Panel x="438" y="214" width="104" height="40" radius={20} fill={palette.ink} stroke={palette.ink}>
        <Label x="490" y="240" color="#FFFFFF" size={15}>
          Define
        </Label>
      </Panel>
    </g>
  );
}

function sceneKpiDictionary(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <path d="M136 76H426C458 76 482 100 482 132V284H188C156 284 136 264 136 236Z" fill={palette.ink} />
      <path d="M174 98H468C486 98 500 112 500 130V286H206C188 286 174 272 174 254Z" fill="#FFFFFF" stroke={palette.muted} strokeWidth="3" />
      <rect x="206" y="126" width="72" height="24" rx="8" fill={palette.accent3} />
      <rect x="298" y="126" width="112" height="12" rx="6" fill={palette.muted} />
      <rect x="206" y="176" width="210" height="10" rx="5" fill={palette.muted} />
      <rect x="206" y="204" width="162" height="10" rx="5" fill={palette.muted} opacity="0.72" />
      <Label x="242" y="144" color="#FFFFFF" size={15}>
        KPI
      </Label>
      <rect x="500" y="130" width="34" height="58" rx="8" fill={palette.accent2} />
      <rect x="500" y="200" width="34" height="58" rx="8" fill={palette.accent} />
    </g>
  );
}

function sceneToolComparison(spec: VisualSpec) {
  const { palette } = spec;
  const tools = [
    { x: 66, label: "Power BI", color: palette.accent3 },
    { x: 254, label: "Tableau", color: palette.accent2 },
    { x: 442, label: "Looker", color: palette.accent },
  ];

  return (
    <g>
      {tools.map((tool, index) => (
        <g key={tool.label}>
          <Panel x={tool.x} y="84" width="132" height="184" radius={16} fill={palette.panel} stroke={tool.color}>
            <circle cx={tool.x + 66} cy="130" r="28" fill={tool.color} opacity="0.18" />
            <rect x={tool.x + 36} y="176" width="60" height="10" rx="5" fill={tool.color} />
            <rect x={tool.x + 28} y="208" width="76" height="8" rx="4" fill={palette.muted} />
            <rect x={tool.x + 38} y="230" width="56" height="8" rx="4" fill={palette.muted} opacity="0.72" />
          </Panel>
          <Label x={tool.x + 66} y="306" color={palette.ink} size={index === 0 ? 15 : 16}>
            {tool.label}
          </Label>
        </g>
      ))}
      <Line x1="214" y1="176" x2="238" y2="176" color={palette.muted} dashed />
      <Line x1="402" y1="176" x2="426" y2="176" color={palette.muted} dashed />
    </g>
  );
}

function sceneQualityChecklist(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="64" y="80" width="222" height="204" radius={16} fill={palette.panel} stroke={palette.muted}>
        {["Schema", "Nulls", "Freshness", "Owners"].map((item, index) => (
          <g key={item}>
            <rect x="96" y={116 + index * 36} width="22" height="22" rx="6" fill={index === 2 ? "#FFFFFF" : palette.accent2} stroke={index === 2 ? palette.accent3 : palette.accent2} strokeWidth="3" />
            {index === 2 ? <Line x1="101" y1="127" x2="113" y2="127" color={palette.accent3} width={4} /> : <Check x={99} y={116 + index * 36} color="#FFFFFF" width={3} />}
            <Label x="136" y={132 + index * 36} color={palette.ink} size={15} anchor="start">
              {item}
            </Label>
          </g>
        ))}
      </Panel>
      <Cylinder x={386} y={104} width={96} height={118} color={palette.accent} fill="#FFFFFF" />
      <Warning x={464} y={218} color={palette.accent3} />
      <Arrow x1={300} y1={176} x2={380} y2={166} color={palette.accent2} />
    </g>
  );
}

function sceneCustomer360(spec: VisualSpec) {
  const { palette } = spec;
  const sources = [
    { x: 78, y: 86, label: "CRM", color: palette.accent },
    { x: 452, y: 86, label: "Web", color: palette.accent2 },
    { x: 86, y: 236, label: "Sales", color: palette.accent3 },
    { x: 442, y: 236, label: "Support", color: palette.ink },
  ];

  return (
    <g>
      <circle cx="320" cy="180" r="72" fill="#FFFFFF" stroke={palette.accent2} strokeWidth="5" />
      <circle cx="320" cy="158" r="22" fill={palette.accent2} opacity="0.24" />
      <path d="M274 222C286 196 354 196 366 222" fill="none" stroke={palette.accent2} strokeWidth="7" strokeLinecap="round" />
      <Label x="320" y="278" color={palette.ink} size={17}>
        customer 360
      </Label>
      {sources.map((source) => (
        <g key={source.label}>
          <Panel x={source.x} y={source.y} width="116" height="54" radius={12} fill={palette.panel} stroke={source.color}>
            <Label x={source.x + 58} y={source.y + 34} color={source.color} size={15}>
              {source.label}
            </Label>
          </Panel>
        </g>
      ))}
      <Line x1="194" y1="114" x2="270" y2="152" color={palette.muted} />
      <Line x1="452" y1="114" x2="370" y2="152" color={palette.muted} />
      <Line x1="202" y1="264" x2="270" y2="212" color={palette.muted} dashed />
      <Line x1="442" y1="264" x2="370" y2="212" color={palette.muted} dashed />
    </g>
  );
}

function sceneDocumentWorkflow(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="70" y="92" width="118" height="158" radius={12} fill={palette.panel} stroke={palette.muted}>
        <path d="M158 92V126H188" fill="none" stroke={palette.muted} strokeWidth="3" />
        <MiniLines x={96} y={140} widths={[54, 70, 46, 64]} color={palette.muted} />
      </Panel>
      <Arrow x1={204} y1={174} x2={270} y2={174} color={palette.accent} />
      <Chip x={278} y={126} size={96} color={palette.accent} fill="#FFFFFF" />
      <Arrow x1={390} y1={174} x2={452} y2={174} color={palette.accent} />
      <Panel x="466" y="98" width="108" height="148" radius={14} fill={palette.panel} stroke={palette.accent2}>
        <Label x="520" y="136" color={palette.accent2} size={16}>
          Review
        </Label>
        <Check x={502} y={164} color={palette.accent2} />
        <MiniLines x={492} y={214} widths={[54, 38]} color={palette.muted} />
      </Panel>
    </g>
  );
}

function scenePromptWorkflow(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="58" y="88" width="260" height="188" radius={16} fill={palette.ink} stroke={palette.ink}>
        <Label x="90" y="126" color="#FFFFFF" size={17} anchor="start">
          Prompt
        </Label>
        <rect x="88" y="150" width="188" height="12" rx="6" fill="#FFFFFF" opacity="0.82" />
        <rect x="88" y="180" width="140" height="10" rx="5" fill={palette.accent3} />
        <rect x="88" y="210" width="170" height="10" rx="5" fill="#FFFFFF" opacity="0.45" />
      </Panel>
      {[
        { x: 386, y: 82, label: "Input", color: palette.accent },
        { x: 430, y: 164, label: "Rules", color: palette.accent2 },
        { x: 386, y: 246, label: "Output", color: palette.accent3 },
      ].map((step, index, steps) => (
        <g key={step.label}>
          <Panel x={step.x} y={step.y} width="116" height="44" radius={22} fill="#FFFFFF" stroke={step.color}>
            <Label x={step.x + 58} y={step.y + 28} color={step.color} size={15}>
              {step.label}
            </Label>
          </Panel>
          {index < steps.length - 1 ? <Arrow x1={step.x + 58} y1={step.y + 46} x2={steps[index + 1].x + 58} y2={steps[index + 1].y - 2} color={palette.muted} /> : null}
        </g>
      ))}
    </g>
  );
}

function scenePolicyGuardrails(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Chip x={270} y={116} size={100} color={palette.accent2} fill="#FFFFFF" />
      <path d="M204 96V254M436 96V254" stroke={palette.ink} strokeLinecap="round" strokeWidth="8" />
      <path d="M214 112H426M214 160H426M214 208H426" stroke={palette.ink} strokeLinecap="round" strokeWidth="5" opacity="0.65" />
      <Panel x="72" y="102" width="116" height="128" radius={14} fill={palette.panel} stroke={palette.accent3}>
        <Label x="130" y="142" color={palette.accent3} size={16}>
          Policy
        </Label>
        <MiniLines x={100} y={166} widths={[52, 62, 42]} color={palette.muted} />
      </Panel>
      <Panel x="452" y="102" width="116" height="128" radius={14} fill={palette.panel} stroke={palette.accent}>
        <Label x="510" y="142" color={palette.accent} size={16}>
          Access
        </Label>
        <Check x={492} y={172} color={palette.accent} />
      </Panel>
    </g>
  );
}

function sceneForecastVariance(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="62" y="70" width="516" height="222" radius={18} fill={palette.panel} stroke={palette.muted}>
        <Line x1="106" y1="250" x2="534" y2="250" color={palette.muted} width={2} />
        <Line x1="106" y1="104" x2="106" y2="250" color={palette.muted} width={2} />
        <path d="M110 232C170 210 224 200 282 180C344 158 406 126 530 104V192C410 180 342 208 282 226C224 244 168 254 110 262Z" fill={palette.accent2} opacity="0.16" />
        <path d="M110 232C170 210 224 200 282 180C344 158 406 126 530 104" fill="none" stroke={palette.accent2} strokeLinecap="round" strokeWidth="5" />
        <path d="M110 236C178 228 236 222 294 226C358 230 424 238 530 232" fill="none" stroke={palette.accent3} strokeDasharray="8 9" strokeLinecap="round" strokeWidth="5" />
      </Panel>
      <Warning x={482} y={222} color={palette.accent3} />
    </g>
  );
}

function sceneRoadmap90(spec: VisualSpec) {
  const { palette } = spec;
  const lanes = [
    { x: 72, day: "0-30", color: palette.accent },
    { x: 250, day: "31-60", color: palette.accent2 },
    { x: 428, day: "61-90", color: palette.accent3 },
  ];

  return (
    <g>
      <Label x="320" y="74" color={palette.ink} size={34}>
        90 days
      </Label>
      {lanes.map((lane) => (
        <Panel key={lane.day} x={lane.x} y="106" width="138" height="170" radius={16} fill={palette.panel} stroke={lane.color}>
          <Label x={lane.x + 69} y="144" color={lane.color} size={18}>
            {lane.day}
          </Label>
          <MiniLines x={lane.x + 30} y={172} widths={[78, 58, 72, 46]} color={palette.muted} />
        </Panel>
      ))}
      <Arrow x1={212} y1={192} x2={246} y2={192} color={palette.muted} />
      <Arrow x1={390} y1={192} x2={424} y2={192} color={palette.muted} />
    </g>
  );
}

function sceneWarehouseMigration(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="62" y="92" width="142" height="154" radius={12} fill={palette.panel} stroke={palette.muted}>
        <Label x="133" y="126" color={palette.ink} size={15}>
          Sheets
        </Label>
        {Array.from({ length: 12 }).map((_, index) => (
          <rect key={index} x={88 + (index % 3) * 30} y={148 + Math.floor(index / 3) * 22} width="20" height="10" rx="3" fill={index % 4 === 0 ? palette.accent3 : palette.muted} opacity={index % 4 === 0 ? 1 : 0.58} />
        ))}
      </Panel>
      <Arrow x1={218} y1={174} x2={306} y2={174} color={palette.accent} />
      <path d="M350 128H542V268H350Z" fill="#FFFFFF" stroke={palette.accent2} strokeWidth="4" />
      <path d="M350 128L446 82L542 128" fill="#FFFFFF" stroke={palette.accent2} strokeLinejoin="round" strokeWidth="4" />
      <Line x1="382" y1="154" x2="382" y2="268" color={palette.muted} width={3} />
      <Line x1="446" y1="154" x2="446" y2="268" color={palette.muted} width={3} />
      <Line x1="510" y1="154" x2="510" y2="268" color={palette.muted} width={3} />
      <Label x="446" y="218" color={palette.accent2} size={18}>
        Warehouse
      </Label>
    </g>
  );
}

function sceneAutomationDag(spec: VisualSpec) {
  const { palette } = spec;
  const nodes = [
    { x: 86, y: 94, label: "Source", color: palette.accent },
    { x: 258, y: 84, label: "dbt", color: palette.accent3 },
    { x: 254, y: 204, label: "Airflow", color: palette.accent2 },
    { x: 430, y: 144, label: "BI", color: palette.ink },
  ];

  return (
    <g>
      {nodes.map((node) => (
        <Panel key={node.label} x={node.x} y={node.y} width="126" height="58" radius={12} fill={palette.panel} stroke={node.color}>
          <Label x={node.x + 63} y={node.y + 36} color={node.color} size={16}>
            {node.label}
          </Label>
        </Panel>
      ))}
      <Arrow x1={212} y1={124} x2={258} y2={112} color={palette.muted} />
      <Arrow x1={212} y1={124} x2={254} y2={230} color={palette.muted} dashed />
      <Arrow x1={384} y1={114} x2={430} y2={164} color={palette.muted} />
      <Arrow x1={380} y1={232} x2={430} y2={182} color={palette.muted} />
      <circle cx="320" cy="174" r="38" fill={palette.accent2} opacity="0.15" stroke={palette.accent2} strokeWidth="3" />
      <path d="M320 142V206M288 174H352" stroke={palette.accent2} strokeLinecap="round" strokeWidth="4" />
    </g>
  );
}

function sceneModelMonitoring(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <rect x="58" y="68" width="524" height="226" rx="20" fill="#111827" stroke="#334155" strokeWidth="2" />
      <Label x="106" y="112" color="#FFFFFF" size={18} anchor="start">
        model monitor
      </Label>
      <Line x1="100" y1="246" x2="536" y2="246" color="#475569" width={2} />
      <Line x1="100" y1="132" x2="100" y2="246" color="#475569" width={2} />
      <path d="M104 224C162 210 188 190 242 198C304 208 340 148 390 154C442 160 464 206 532 182" fill="none" stroke={palette.accent2} strokeLinecap="round" strokeWidth="5" />
      <path d="M104 196C166 190 214 182 272 184C340 188 404 196 532 164" fill="none" stroke={palette.accent3} strokeDasharray="9 10" strokeLinecap="round" strokeWidth="4" />
      <Warning x={438} y={102} color={palette.accent3} />
    </g>
  );
}

function scenePrivacyAnalytics(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <BrowserFrame x={62} y={72} width={276} height={216} palette={palette}>
        <rect x="96" y="126" width="106" height="18" rx="6" fill={palette.accent} opacity="0.2" />
        <path d="M100 238C146 206 190 246 238 198C260 176 282 170 308 176" fill="none" stroke={palette.accent2} strokeLinecap="round" strokeWidth="5" />
      </BrowserFrame>
      <Panel x="402" y="94" width="146" height="166" radius={18} fill={palette.panel} stroke={palette.muted}>
        <Label x="475" y="130" color={palette.ink} size={16}>
          Consent
        </Label>
        {[0, 1, 2].map((index) => (
          <g key={index}>
            <rect x="426" y={154 + index * 34} width="84" height="18" rx="9" fill={index === 1 ? palette.accent2 : palette.muted} opacity={index === 1 ? 1 : 0.62} />
            <circle cx={index === 1 ? 496 : 440} cy={163 + index * 34} r="11" fill="#FFFFFF" stroke={index === 1 ? palette.accent2 : palette.muted} strokeWidth="2" />
          </g>
        ))}
      </Panel>
      <Line x1="352" y1="180" x2="394" y2="180" color={palette.muted} dashed />
    </g>
  );
}

function sceneManagerLiteracy(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="70" y="84" width="202" height="186" radius={18} fill={palette.panel} stroke={palette.muted}>
        <circle cx="128" cy="140" r="24" fill={palette.accent3} opacity="0.22" />
        <path d="M88 220C106 184 154 184 174 220" fill="none" stroke={palette.accent3} strokeLinecap="round" strokeWidth="7" />
        <Label x="180" y="146" color={palette.ink} size={30}>
          ?
        </Label>
      </Panel>
      <Panel x="340" y="72" width="210" height="206" radius={18} fill={palette.panel} stroke={palette.accent2}>
        <rect x="374" y="216" width="28" height="28" rx="5" fill={palette.accent} />
        <rect x="422" y="178" width="28" height="66" rx="5" fill={palette.accent2} />
        <rect x="470" y="134" width="28" height="110" rx="5" fill={palette.accent3} />
        <Line x1="372" y1="244" x2="520" y2="244" color={palette.muted} width={2} />
        <Label x="445" y="112" color={palette.ink} size={16}>
          better questions
        </Label>
      </Panel>
      <Arrow x1={280} y1={178} x2={336} y2={178} color={palette.accent} />
    </g>
  );
}

function sceneBuildBuyMatrix(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="98" y="72" width="444" height="224" radius={18} fill={palette.panel} stroke={palette.muted}>
        <Line x1="320" y1="98" x2="320" y2="270" color={palette.muted} width={2} />
        <Line x1="126" y1="184" x2="514" y2="184" color={palette.muted} width={2} />
        <rect x="142" y="112" width="138" height="50" rx="10" fill={palette.accent2} opacity="0.17" />
        <rect x="360" y="112" width="138" height="50" rx="10" fill={palette.accent} opacity="0.17" />
        <rect x="142" y="206" width="138" height="50" rx="10" fill={palette.accent3} opacity="0.22" />
        <rect x="360" y="206" width="138" height="50" rx="10" fill={palette.ink} opacity="0.1" />
        <Label x="211" y="144" color={palette.accent2} size={18}>
          Buy
        </Label>
        <Label x="429" y="144" color={palette.accent} size={18}>
          Build
        </Label>
        <Label x="211" y="238" color={palette.accent3} size={16}>
          Configure
        </Label>
        <Label x="429" y="238" color={palette.ink} size={16}>
          Custom
        </Label>
      </Panel>
    </g>
  );
}

function sceneCaseStudyProof(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="72" y="84" width="160" height="204" radius={16} fill={palette.panel} stroke={palette.muted}>
        <rect x="100" y="116" width="104" height="78" rx="10" fill={palette.accent} opacity="0.18" />
        <MiniLines x={102} y={220} widths={[92, 62, 80]} color={palette.muted} />
      </Panel>
      <Panel x="258" y="70" width="150" height="232" radius={16} fill={palette.ink} stroke={palette.ink}>
        <Label x="333" y="120" color="#FFFFFF" size={18}>
          Proof
        </Label>
        <Check x={314} y={156} color={palette.accent3} width={6} />
        <rect x="294" y="230" width="78" height="12" rx="6" fill="#FFFFFF" opacity="0.7" />
      </Panel>
      <Panel x="434" y="102" width="126" height="154" radius={16} fill={palette.panel} stroke={palette.accent2}>
        <Label x="497" y="142" color={palette.accent2} size={16}>
          Result
        </Label>
        <path d="M466 214C488 178 514 196 536 164" fill="none" stroke={palette.accent2} strokeLinecap="round" strokeWidth="6" />
      </Panel>
    </g>
  );
}

function sceneGeminiImport(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <Panel x="64" y="92" width="160" height="126" radius={18} fill={palette.panel} stroke={palette.muted}>
        <rect x="92" y="124" width="84" height="18" rx="9" fill={palette.accent} opacity="0.2" />
        <rect x="112" y="160" width="74" height="18" rx="9" fill={palette.accent2} opacity="0.22" />
      </Panel>
      <Panel x="254" y="132" width="132" height="76" radius={14} fill={palette.ink} stroke={palette.ink}>
        <Label x="320" y="178" color="#FFFFFF" size={18}>
          JSON
        </Label>
      </Panel>
      <Panel x="416" y="82" width="154" height="164" radius={18} fill={palette.panel} stroke={palette.accent}>
        <circle cx="493" cy="142" r="38" fill={palette.accent} opacity="0.18" />
        <path d="M493 104L502 132L530 142L502 152L493 180L484 152L456 142L484 132Z" fill={palette.accent} />
        <Label x="493" y="220" color={palette.accent} size={17}>
          Gemini
        </Label>
      </Panel>
      <Arrow x1={226} y1={154} x2={254} y2={154} color={palette.accent2} />
      <Arrow x1={386} y1={170} x2={416} y2={166} color={palette.accent2} />
    </g>
  );
}

function sceneWorkspaceProduct(spec: VisualSpec) {
  const { palette } = spec;

  return (
    <g>
      <rect x="52" y="58" width="536" height="248" rx="22" fill="#111827" stroke="#334155" strokeWidth="2" />
      <rect x="80" y="92" width="128" height="180" rx="14" fill="#1F2937" />
      <rect x="232" y="92" width="316" height="76" rx="14" fill="#F8FAFC" />
      <rect x="232" y="192" width="146" height="80" rx="14" fill="#F8FAFC" />
      <rect x="402" y="192" width="146" height="80" rx="14" fill="#F8FAFC" />
      <Label x="112" y="128" color="#FFFFFF" size={17} anchor="start">
        TMDL
      </Label>
      <rect x="112" y="158" width="62" height="48" rx="10" fill={palette.accent2} />
      <path d="M268 132H406" stroke={palette.accent} strokeLinecap="round" strokeWidth="12" />
      <path d="M268 230C298 202 328 244 354 214" fill="none" stroke={palette.accent2} strokeLinecap="round" strokeWidth="5" />
      <Check x={462} y={216} color={palette.accent3} />
    </g>
  );
}

function renderScene(spec: VisualSpec) {
  switch (spec.motif) {
    case "greeceWeb":
      return sceneGreeceWeb(spec);
    case "biCockpit":
      return sceneBiCockpit(spec);
    case "semanticStar":
      return sceneSemanticStar(spec);
    case "aiUseCases":
      return sceneAiUseCases(spec);
    case "dataFoundation":
      return sceneDataFoundation(spec);
    case "cloudMigration":
      return sceneCloudMigration(spec);
    case "mlopsRelease":
      return sceneMlopsRelease(spec);
    case "gdprShield":
      return sceneGdprShield(spec);
    case "aiRisk":
      return sceneAiRisk(spec);
    case "analyticsConversion":
      return sceneAnalyticsConversion(spec);
    case "redesignAudit":
      return sceneRedesignAudit(spec);
    case "bookingCalendar":
      return sceneBookingCalendar(spec);
    case "landingFunnel":
      return sceneLandingFunnel(spec);
    case "requirementsBoard":
      return sceneRequirementsBoard(spec);
    case "kpiDictionary":
      return sceneKpiDictionary(spec);
    case "toolComparison":
      return sceneToolComparison(spec);
    case "qualityChecklist":
      return sceneQualityChecklist(spec);
    case "customer360":
      return sceneCustomer360(spec);
    case "documentWorkflow":
      return sceneDocumentWorkflow(spec);
    case "promptWorkflow":
      return scenePromptWorkflow(spec);
    case "policyGuardrails":
      return scenePolicyGuardrails(spec);
    case "forecastVariance":
      return sceneForecastVariance(spec);
    case "roadmap90":
      return sceneRoadmap90(spec);
    case "warehouseMigration":
      return sceneWarehouseMigration(spec);
    case "automationDag":
      return sceneAutomationDag(spec);
    case "modelMonitoring":
      return sceneModelMonitoring(spec);
    case "privacyAnalytics":
      return scenePrivacyAnalytics(spec);
    case "managerLiteracy":
      return sceneManagerLiteracy(spec);
    case "buildBuyMatrix":
      return sceneBuildBuyMatrix(spec);
    case "caseStudyProof":
      return sceneCaseStudyProof(spec);
    case "geminiImport":
      return sceneGeminiImport(spec);
    case "workspaceProduct":
      return sceneWorkspaceProduct(spec);
  }
}

export function ArticleVisual({ post, className }: ArticleVisualProps) {
  const spec = buildSpec(post);
  const { palette } = spec;
  const idSuffix = spec.hash.toString(36);
  const gradientId = `article-gradient-${idSuffix}`;
  const patternId = `article-pattern-${idSuffix}`;

  return (
    <div className={cn("h-full w-full overflow-hidden bg-gray-100", className)}>
      <svg
        role="img"
        aria-label={`${post.title} article illustration`}
        className="h-full w-full"
        viewBox="0 0 640 360"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.bg} />
            <stop offset="100%" stopColor={palette.bg2} />
          </linearGradient>
          <pattern id={patternId} width="38" height="38" patternUnits="userSpaceOnUse">
            <path d="M38 0H0V38" fill="none" stroke={palette.muted} strokeWidth="1" opacity="0.38" />
          </pattern>
        </defs>
        <Backdrop spec={spec} gradientId={gradientId} patternId={patternId} />
        {renderScene(spec)}
      </svg>
    </div>
  );
}
