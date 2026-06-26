import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrainCircuit,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";

export interface ServiceMetric {
  label: string;
  value: string;
}

export interface ServicePage {
  slug: string;
  path: string;
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  navLabel: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  metrics: ServiceMetric[];
  items: string[];
  outcomes: string[];
  delivery: string[];
  useCases: string[];
}

export const servicePages: ServicePage[] = [
  {
    slug: "advanced-analytics-ai",
    path: "/services/advanced-analytics-ai",
    icon: BrainCircuit,
    title: "AI and automation workflows",
    shortTitle: "AI automation",
    navLabel: "AI & automation",
    description:
      "Build predictive, analytical, and AI-assisted workflows that move from exploration into repeatable operating tools.",
    seoTitle: "AI & Automation Workflow Consulting",
    seoDescription:
      "AI and automation workflow consulting from BI Solutions, covering predictive models, analytical systems, practical AI workflows, and adoption support.",
    keywords: [
      "AI consulting Greece",
      "advanced analytics consulting",
      "predictive analytics",
      "AI workflow design",
    ],
    heroEyebrow: "Prediction, automation, and adoption",
    heroTitle:
      "AI and automation workflows that move beyond experiments.",
    heroDescription:
      "A focused service pillar for turning data questions, predictive models, and AI ideas into usable workflows that support real decisions.",
    metrics: [
      { label: "Core methods", value: "Statistics, ML, AI workflows" },
      { label: "Working style", value: "Prototype to operating tool" },
      { label: "Best fit", value: "Teams with decisions to improve" },
    ],
    items: [
      "Predictive modeling and statistical analysis",
      "Python, R, and SQL analytical delivery",
      "AI use-case framing and prompt workflow design",
      "Decision-support models and adoption playbooks for business teams",
    ],
    outcomes: [
      "Predictive models tied to business questions instead of isolated model demos",
      "AI-assisted workflows that reduce repeated analysis, drafting, or review work",
      "Clearer interpretation of model outputs, uncertainty, and operational limits",
      "Reusable analytical assets that can be maintained after the initial engagement",
    ],
    delivery: [
      "Use-case framing to define the decision, data inputs, expected output, and adoption path",
      "Exploratory analysis and feature design using Python, R, SQL, or platform-native tooling",
      "Model development, validation, and explanation for the target business workflow",
      "Documentation and enablement so internal teams can understand and operate the result",
    ],
    useCases: [
      "Forecasting demand, risk, churn, revenue, funding, or operational pressure",
      "Building AI-assisted review, classification, summarization, or recommendation workflows",
      "Turning recurring analytical questions into repeatable decision-support tools",
    ],
  },
  {
    slug: "business-intelligence-semantic-modeling",
    path: "/services/business-intelligence-semantic-modeling",
    icon: BarChart3,
    title: "Business intelligence and semantic modeling",
    shortTitle: "Business intelligence",
    navLabel: "BI & semantic modeling",
    description:
      "Design reporting layers, semantic models, and governance structures that make dashboards easier to trust and maintain.",
    seoTitle: "Business Intelligence & Semantic Modeling Services",
    seoDescription:
      "Power BI, Tableau, Looker, dashboard, KPI, and semantic model consulting from BI Solutions for trusted reporting systems.",
    keywords: [
      "business intelligence consulting Greece",
      "Power BI consulting",
      "Tableau consulting",
      "Looker consulting",
      "semantic model review",
      "dashboard development",
    ],
    heroEyebrow: "Reporting that teams can trust",
    heroTitle:
      "Business intelligence and semantic modeling services for clearer decisions.",
    heroDescription:
      "A focused service for dashboards, metrics, semantic models, and reporting systems that need structure, performance, and governance.",
    metrics: [
      { label: "Core tools", value: "Power BI, Tableau, Looker" },
      { label: "Delivery focus", value: "Models, dashboards, governance" },
      { label: "Best fit", value: "Teams with reporting friction" },
    ],
    items: [
      "Power BI, Tableau, and Looker delivery",
      "Semantic model review and optimization",
      "Metric design and KPI structure",
      "Governance for reporting consistency",
    ],
    outcomes: [
      "Dashboards built around decision workflows, not just visual output",
      "Semantic models that improve trust, reuse, performance, and maintainability",
      "Clear KPI definitions so teams do not argue over competing numbers",
      "Governance habits that reduce reporting drift as the organization grows",
    ],
    delivery: [
      "Reporting audit across data sources, dashboards, measures, owners, and user pain points",
      "Semantic model design or review covering relationships, measures, naming, and performance",
      "Dashboard delivery with stakeholder review, iteration, and business-facing documentation",
      "Governance recommendations for access, change control, metric ownership, and refresh cadence",
    ],
    useCases: [
      "Power BI reports are slow, inconsistent, or hard to maintain",
      "Executives need one version of the truth across departments",
      "A company wants dashboards that connect financial, operational, and customer data",
    ],
  },
  {
    slug: "website-app-development",
    path: "/services/website-app-development",
    icon: MonitorSmartphone,
    title: "Website and app development",
    shortTitle: "Web development",
    navLabel: "Website & app development",
    description:
      "Ship modern marketing sites and focused web apps that connect positioning, workflow, and analytics into one product surface.",
    seoTitle: "Website & Web App Development in Greece",
    seoDescription:
      "BI Solutions builds modern websites, landing pages, booking flows, dashboards, and web applications for Greek and international businesses.",
    keywords: [
      "website development Greece",
      "web app development Greece",
      "website development Athens",
      "κατασκευή ιστοσελίδων",
      "κατασκευή web εφαρμογών",
    ],
    heroEyebrow: "Websites, landing pages, and web apps",
    heroTitle:
      "Website and web app development for businesses that need more than a template.",
    heroDescription:
      "A focused service for corporate websites, service-business pages, booking flows, AI-powered products, and analytics-aware web apps.",
    metrics: [
      { label: "Delivery formats", value: "Websites, web apps, dashboards" },
      { label: "Core stack", value: "React, TypeScript, Tailwind" },
      { label: "Best fit", value: "Businesses needing a sharper digital surface" },
    ],
    items: [
      "Corporate websites and launch pages",
      "Web applications and internal tools",
      "Product landing pages with shared brand systems",
      "Frontend implementation with analytics-aware UX",
    ],
    outcomes: [
      "A modern web presence that explains the offer clearly and supports conversion",
      "Fast, responsive interfaces built around the audience and workflow",
      "Analytics-aware implementation so traffic, behavior, and outcomes can be measured",
      "A web surface that can connect to future dashboards, AI workflows, or internal tools",
    ],
    delivery: [
      "Discovery around audience, offer, conversion path, content, and operating constraints",
      "Information architecture, page structure, visual direction, and implementation plan",
      "Frontend build with responsive UI, forms, analytics hooks, and launch-ready deployment",
      "Post-launch support for content updates, performance review, and practical improvements",
    ],
    useCases: [
      "A business needs a professional website or landing page with clearer positioning",
      "A service provider needs booking, contact, or lead-capture workflows",
      "A product idea needs an app-like web interface connected to analytics or AI features",
    ],
  },
  {
    slug: "data-strategy-governance",
    path: "/services/data-strategy-governance",
    icon: ShieldCheck,
    title: "Data strategy and cloud foundations",
    shortTitle: "Data foundations",
    navLabel: "Data strategy & cloud",
    description:
      "Set the architecture, quality, access, and governance foundations so teams can scale analytics and AI without losing control.",
    seoTitle: "Data Strategy & Cloud Foundations Services",
    seoDescription:
      "BI Solutions helps organizations design data strategy, cloud foundations, governance, access controls, quality rules, and GDPR-aware analytics processes.",
    keywords: [
      "data strategy consulting",
      "cloud data foundation",
      "cloud migration consulting",
      "data governance Greece",
      "GDPR data governance",
      "data quality framework",
    ],
    heroEyebrow: "Architecture, quality, and operating rules",
    heroTitle:
      "Data strategy and cloud foundations for analytics that can scale.",
    heroDescription:
      "A focused service pillar for defining how data is moved, owned, trusted, documented, accessed, and used across reporting, analytics, and AI.",
    metrics: [
      { label: "Core coverage", value: "Cloud, quality, access, lineage" },
      { label: "Compliance lens", value: "GDPR-aware operations" },
      { label: "Best fit", value: "Teams scaling analytics usage" },
    ],
    items: [
      "Azure, AWS, GCP, Snowflake, BigQuery, and Databricks planning",
      "Data quality and lineage design",
      "Access controls and governance workflows",
      "GDPR-aware process design",
      "Documentation and stewardship frameworks",
    ],
    outcomes: [
      "A clearer target-state architecture for data, reporting, and operational systems",
      "Clear ownership around core datasets, metrics, and reporting assets",
      "Reduced risk from uncontrolled data access, undocumented transformations, and shadow reports",
      "Better trust in dashboards and AI workflows because source and quality rules are explicit",
      "Governance that supports delivery instead of slowing every project down",
    ],
    delivery: [
      "Assessment of systems, data assets, owners, access patterns, quality risks, and documentation gaps",
      "Cloud and governance model covering ingestion, storage, stewardship, access, change control, lineage, and escalation paths",
      "Metric and data-quality rules that can be adopted by BI, analytics, and business teams",
      "Practical documentation templates and operating guidance for ongoing governance",
    ],
    useCases: [
      "A company wants to move reporting from local files or legacy servers into a managed cloud setup",
      "Multiple teams use conflicting numbers for the same KPI",
      "Sensitive data is used across reports or AI workflows without enough operating control",
      "A company wants to scale BI and analytics while keeping trust, ownership, and compliance clear",
    ],
  },
];

const servicePillarSlugs = [
  "business-intelligence-semantic-modeling",
  "advanced-analytics-ai",
  "data-strategy-governance",
  "website-app-development",
] as const;

export const servicePillarPages = servicePillarSlugs
  .map((slug) => servicePages.find((service) => service.slug === slug))
  .filter((service): service is ServicePage => Boolean(service));

export const legacyServiceRedirects: Record<string, string> = {
  "digital-transformation-cloud-migration": "/services/data-strategy-governance",
  "mlops-productionization": "/services/advanced-analytics-ai",
  "ai-literacy-change-management": "/services/advanced-analytics-ai",
  "website-web-app-development": "/services/website-app-development",
};

export function getServicePageBySlug(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}
