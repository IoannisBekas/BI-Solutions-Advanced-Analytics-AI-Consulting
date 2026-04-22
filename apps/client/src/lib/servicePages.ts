import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrainCircuit,
  Cloud,
  GitBranch,
  GraduationCap,
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
    slug: "digital-transformation-cloud-migration",
    path: "/services/digital-transformation-cloud-migration",
    icon: Cloud,
    title: "Digital transformation and cloud migration",
    shortTitle: "Cloud migration",
    navLabel: "Cloud & transformation",
    description:
      "Modernize data foundations, migrate reporting stacks, and design cloud-native architecture that can scale beyond one-off dashboard work.",
    seoTitle: "Digital Transformation & Cloud Migration Services",
    seoDescription:
      "BI Solutions supports cloud migration, data platform modernization, and digital transformation delivery for organizations in Greece and Europe.",
    keywords: [
      "digital transformation Greece",
      "cloud migration consulting",
      "data platform modernization",
      "Azure AWS GCP migration",
    ],
    heroEyebrow: "Cloud, modernization, and delivery",
    heroTitle:
      "Digital transformation and cloud migration services for data-driven teams.",
    heroDescription:
      "A dedicated service room for moving legacy reporting, scattered data flows, and manual operating habits into scalable cloud and analytics foundations.",
    metrics: [
      { label: "Core platforms", value: "Azure, AWS, GCP" },
      { label: "Delivery focus", value: "Migration, modernization, adoption" },
      { label: "Best fit", value: "Teams outgrowing manual reporting" },
    ],
    items: [
      "Azure, AWS, and GCP migration planning",
      "Snowflake, BigQuery, and Databricks delivery",
      "Data platform architecture and environment design",
      "Operational reporting modernization",
    ],
    outcomes: [
      "A clearer target-state architecture for data, reporting, and operational systems",
      "Reduced dependence on fragile spreadsheets, manual refreshes, and disconnected files",
      "Cloud environments structured for governance, performance, and future analytics work",
      "Migration plans that connect technical delivery with business continuity",
    ],
    delivery: [
      "Current-state assessment of systems, data sources, owners, and reporting dependencies",
      "Cloud architecture design covering ingestion, storage, transformation, access, and cost controls",
      "Migration backlog with sequencing, risks, platform choices, and implementation milestones",
      "Hands-on delivery support for the data platform, reporting layer, and stakeholder handoff",
    ],
    useCases: [
      "A company wants to move reporting from local files or legacy servers into a managed cloud setup",
      "Leadership needs one operating view across finance, customers, operations, or commercial activity",
      "A team is preparing for Power BI, AI, or advanced analytics but lacks a stable data foundation",
    ],
  },
  {
    slug: "advanced-analytics-ai",
    path: "/services/advanced-analytics-ai",
    icon: BrainCircuit,
    title: "Advanced analytics and AI",
    shortTitle: "Analytics & AI",
    navLabel: "Advanced analytics & AI",
    description:
      "Build predictive, analytical, and AI-assisted workflows that move from exploration into repeatable operating tools.",
    seoTitle: "Advanced Analytics & AI Consulting",
    seoDescription:
      "Advanced analytics and AI consulting from BI Solutions, covering predictive models, statistical analysis, and practical AI workflows.",
    keywords: [
      "AI consulting Greece",
      "advanced analytics consulting",
      "predictive analytics",
      "AI workflow design",
    ],
    heroEyebrow: "Prediction, automation, and decision support",
    heroTitle:
      "Advanced analytics and AI services that move beyond experiments.",
    heroDescription:
      "A dedicated service room for turning data questions, predictive models, and AI ideas into usable workflows that support real decisions.",
    metrics: [
      { label: "Core methods", value: "Statistics, ML, AI workflows" },
      { label: "Working style", value: "Prototype to operating tool" },
      { label: "Best fit", value: "Teams with decisions to improve" },
    ],
    items: [
      "Predictive modeling and statistical analysis",
      "Python, R, and SQL analytical delivery",
      "AI use-case framing and prompt workflow design",
      "Decision-support models for business teams",
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
    slug: "mlops-productionization",
    path: "/services/mlops-productionization",
    icon: GitBranch,
    title: "MLOps and productionization",
    shortTitle: "MLOps",
    navLabel: "MLOps & production",
    description:
      "Turn models, pipelines, and AI experiments into maintainable systems with versioning, orchestration, and delivery controls.",
    seoTitle: "MLOps & AI Productionization Services",
    seoDescription:
      "BI Solutions helps teams productionize analytics, ML, and AI workflows with CI/CD, orchestration, documentation, and operating controls.",
    keywords: [
      "MLOps consulting",
      "AI productionization",
      "machine learning operations",
      "analytics CI/CD",
    ],
    heroEyebrow: "From notebook to maintained system",
    heroTitle:
      "MLOps and productionization for analytics and AI workflows.",
    heroDescription:
      "A dedicated service room for making models, pipelines, and AI workflows easier to deploy, monitor, version, and hand over.",
    metrics: [
      { label: "Core controls", value: "Versioning, orchestration, CI/CD" },
      { label: "Delivery focus", value: "Maintainable systems" },
      { label: "Best fit", value: "Teams scaling ML or AI delivery" },
    ],
    items: [
      "Feature stores and model registries",
      "CI/CD for analytics and ML workflows",
      "Airflow and dbt orchestration patterns",
      "Production-readiness and handoff design",
    ],
    outcomes: [
      "Model and pipeline delivery that is repeatable instead of dependent on one laptop",
      "Clear versioning for code, data transformations, features, and model artifacts",
      "Deployment workflows with fewer manual steps and better auditability",
      "Operational documentation that makes ownership transfer realistic",
    ],
    delivery: [
      "Production-readiness review of existing notebooks, scripts, jobs, and model assets",
      "Repository, environment, and CI/CD setup for analytics and ML delivery",
      "Orchestration design for scheduled pipelines, model refreshes, and quality checks",
      "Monitoring, documentation, and handoff patterns for internal ownership",
    ],
    useCases: [
      "A model works in development but needs a reliable production path",
      "A data science team wants consistent deployment, testing, and documentation habits",
      "AI or analytics workflows need scheduled refresh, access controls, and operational visibility",
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
      "A dedicated service room for dashboards, metrics, semantic models, and reporting systems that need structure, performance, and governance.",
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
      "A dedicated service room for corporate websites, service-business pages, booking flows, AI-powered products, and analytics-aware web apps.",
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
    title: "Data strategy and governance",
    shortTitle: "Data governance",
    navLabel: "Data strategy & governance",
    description:
      "Set the operating rules around quality, access, and compliance so teams can scale analytics without losing control.",
    seoTitle: "Data Strategy & Governance Services",
    seoDescription:
      "BI Solutions helps organizations design data strategy, governance, access controls, quality rules, and GDPR-aware analytics processes.",
    keywords: [
      "data strategy consulting",
      "data governance Greece",
      "GDPR data governance",
      "data quality framework",
    ],
    heroEyebrow: "Quality, access, and operating rules",
    heroTitle:
      "Data strategy and governance services for analytics that can scale.",
    heroDescription:
      "A dedicated service room for defining how data is owned, trusted, documented, accessed, and used across reporting, analytics, and AI.",
    metrics: [
      { label: "Core coverage", value: "Quality, access, lineage" },
      { label: "Compliance lens", value: "GDPR-aware operations" },
      { label: "Best fit", value: "Teams scaling analytics usage" },
    ],
    items: [
      "Data quality and lineage design",
      "Access controls and governance workflows",
      "GDPR-aware process design",
      "Documentation and stewardship frameworks",
    ],
    outcomes: [
      "Clear ownership around core datasets, metrics, and reporting assets",
      "Reduced risk from uncontrolled data access, undocumented transformations, and shadow reports",
      "Better trust in dashboards and AI workflows because source and quality rules are explicit",
      "Governance that supports delivery instead of slowing every project down",
    ],
    delivery: [
      "Assessment of data assets, owners, access patterns, quality risks, and documentation gaps",
      "Governance model covering stewardship, access, change control, lineage, and escalation paths",
      "Metric and data-quality rules that can be adopted by BI, analytics, and business teams",
      "Practical documentation templates and operating guidance for ongoing governance",
    ],
    useCases: [
      "Multiple teams use conflicting numbers for the same KPI",
      "Sensitive data is used across reports or AI workflows without enough operating control",
      "A company wants to scale BI and analytics while keeping trust, ownership, and compliance clear",
    ],
  },
  {
    slug: "ai-literacy-change-management",
    path: "/services/ai-literacy-change-management",
    icon: GraduationCap,
    title: "AI literacy and change management",
    shortTitle: "AI literacy",
    navLabel: "AI literacy & change",
    description:
      "Help teams adopt AI and analytics responsibly with practical enablement, not abstract transformation language.",
    seoTitle: "AI Literacy & Change Management Services",
    seoDescription:
      "AI literacy, analytics enablement, executive briefings, and practical change management support from BI Solutions.",
    keywords: [
      "AI literacy training",
      "AI change management",
      "analytics enablement",
      "responsible AI workshops",
    ],
    heroEyebrow: "Training, adoption, and responsible use",
    heroTitle:
      "AI literacy and change management for teams adopting new tools.",
    heroDescription:
      "A dedicated service room for helping teams understand AI, use analytics responsibly, and build habits that survive after the workshop ends.",
    metrics: [
      { label: "Formats", value: "Briefings, workshops, playbooks" },
      { label: "Audience", value: "Executives and operating teams" },
      { label: "Best fit", value: "Teams adopting AI in real work" },
    ],
    items: [
      "Executive briefings and AI rollout support",
      "Company-wide training and team workshops",
      "Responsible AI playbooks",
      "Operating guidance for new delivery habits",
    ],
    outcomes: [
      "Shared language around AI capabilities, limitations, risks, and practical use cases",
      "Clearer adoption paths for teams that need to use AI without weakening quality or trust",
      "Playbooks that translate responsible AI principles into day-to-day operating habits",
      "Training that connects directly to existing business workflows and data realities",
    ],
    delivery: [
      "Audience and maturity assessment to shape the right enablement format",
      "Executive or team workshops focused on practical AI, analytics, and workflow adoption",
      "Responsible AI guidance covering privacy, data handling, review habits, and escalation",
      "Follow-up materials and operating playbooks for sustained adoption",
    ],
    useCases: [
      "Leadership wants a grounded AI briefing before approving tools or pilots",
      "Teams are already using AI informally and need safer, clearer operating habits",
      "A company wants training tied to its own workflows rather than generic AI theory",
    ],
  },
];

export function getServicePageBySlug(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}
