import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  BrainCircuit,
  Compass,
  Gauge,
  GraduationCap,
  LineChart,
  MonitorSmartphone,
  ShieldCheck,
  Workflow,
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
  techStack?: string[];
  metrics: ServiceMetric[];
  items: string[];
  outcomes: string[];
  delivery: string[];
  useCases: string[];
}

export const servicePages: ServicePage[] = [
  {
    slug: "advanced-analytics-ai",
    path: "/services#advanced-analytics-ai",
    icon: BrainCircuit,
    title: "AI consulting services",
    shortTitle: "AI consulting",
    navLabel: "AI consulting & automation",
    description:
      "Design and deploy production AI systems that automate real work, use governed business knowledge, and remain measurable after launch.",
    seoTitle: "AI Consulting Services & Implementation",
    seoDescription:
      "AI consulting services for strategy, readiness, automation, generative AI, predictive analytics, governance, business intelligence, and production operations.",
    keywords: [
      "AI consultants",
      "AI consulting services",
      "AI consulting company",
      "artificial intelligence consulting",
      "AI implementation consulting",
      "business AI consulting",
      "enterprise AI consulting",
    ],
    heroEyebrow: "Production AI systems, not isolated demos",
    heroTitle: "Move AI from experiments into governed production.",
    heroDescription:
      "We design LLM applications, retrieval systems, document automation, and predictive workflows around your data, controls, and operating reality—then build the path from proof of value to reliable use.",
    techStack: [
      "OpenAI",
      "Azure OpenAI",
      "Python",
      "RAG",
      "Vector databases",
      "MLOps",
    ],
    metrics: [
      { label: "Build scope", value: "LLM, RAG, automation, predictive ML" },
      { label: "Control model", value: "Human review where decisions demand it" },
      { label: "Operating layer", value: "Evaluation, observability, and MLOps" },
    ],
    items: [
      "Production-grade LLM assistants grounded in approved company knowledge",
      "Custom RAG pipelines with retrieval evaluation, permissions, and source traceability",
      "Document intake, classification, extraction, review, and action workflows",
      "Predictive models, deployment pipelines, monitoring, and adoption playbooks",
    ],
    outcomes: [
      "A focused AI investment tied to a measurable workflow rather than a technology showcase",
      "Faster knowledge and document work with explicit approval and escalation points",
      "An evaluation framework for quality, cost, latency, safety, and business usefulness",
      "A maintainable production system with ownership, monitoring, and handover built in",
    ],
    delivery: [
      "Frame the decision, workflow, users, data boundary, risk, and success criteria",
      "Prototype the smallest complete solution and test it with representative material",
      "Engineer integrations, permissions, review controls, telemetry, and evaluation",
      "Launch with named ownership, user guidance, monitoring, and an improvement cadence",
    ],
    useCases: [
      "A promising AI prototype cannot yet meet production quality, governance, or integration requirements",
      "A team spends high-value time searching, summarizing, classifying, or reviewing documents",
      "A predictive or generative workflow needs reliable evaluation, monitoring, and human oversight",
    ],
  },
  {
    slug: "ai-strategy-readiness",
    path: "/services#ai-strategy-readiness",
    icon: Compass,
    title: "AI strategy and readiness consulting",
    shortTitle: "AI strategy",
    navLabel: "AI strategy & readiness",
    description:
      "Assess where AI can create value, prioritize feasible use cases, and turn scattered ideas into a sequenced roadmap with clear ownership.",
    seoTitle: "AI Strategy & Readiness Consulting",
    seoDescription:
      "AI strategy consulting and readiness assessments to prioritize use cases, assess capabilities, and build a practical roadmap for adoption.",
    keywords: [
      "AI strategy consulting",
      "AI readiness assessment",
      "AI roadmap consulting",
      "AI transformation strategy",
      "AI adoption strategy",
      "international AI strategy consulting",
    ],
    heroEyebrow: "Readiness, priorities, and a practical roadmap",
    heroTitle: "Build an AI strategy your organization can act on.",
    heroDescription:
      "BI Solutions Group helps leadership and delivery teams evaluate opportunities, readiness, risks, and dependencies before committing to AI investments.",
    metrics: [
      { label: "Engagement focus", value: "Readiness, priorities, roadmap" },
      { label: "Decision lens", value: "Value, feasibility, risk" },
      { label: "Best fit", value: "Teams moving from interest to action" },
    ],
    items: [
      "AI readiness assessment across data, processes, people, and technology",
      "Use-case discovery and value, feasibility, and risk prioritization",
      "Target-state capabilities, ownership, and operating-model design",
      "Phased roadmap with dependencies, success measures, and business-case inputs",
    ],
    outcomes: [
      "A prioritized portfolio of AI opportunities tied to real business needs",
      "Shared criteria for deciding which ideas to pursue, test, defer, or reject",
      "A sequenced roadmap that reflects current capabilities and dependencies",
      "Clearer ownership across leadership, business, data, technology, and risk teams",
    ],
    delivery: [
      "Stakeholder interviews and an inventory of current data, tools, skills, workflows, and AI initiatives",
      "Readiness assessment covering opportunity, capability, risk, and organizational constraints",
      "Use-case prioritization workshop using agreed business and delivery criteria",
      "Roadmap, operating recommendations, and an executive-ready decision brief",
    ],
    useCases: [
      "Leadership needs a practical AI strategy before approving investment",
      "Several AI pilots exist but priorities, ownership, and next steps are unclear",
      "A team needs to compare build, buy, partner, and process-change options",
    ],
  },
  {
    slug: "ai-automation-consulting",
    path: "/services#ai-automation-consulting",
    icon: Workflow,
    title: "AI automation and workflow consulting",
    shortTitle: "AI automation",
    navLabel: "AI automation & workflows",
    description:
      "Redesign repetitive document, data, and decision processes as controlled AI-assisted workflows that fit existing business operations.",
    seoTitle: "AI Automation & Workflow Consulting",
    seoDescription:
      "AI automation consulting for document, data, and decision workflows, with practical integration, review controls, and adoption support.",
    keywords: [
      "AI automation consulting",
      "AI workflow automation",
      "business process automation AI",
      "intelligent automation services",
      "document workflow automation",
      "international AI automation consulting",
    ],
    heroEyebrow: "Practical automation for repeated business work",
    heroTitle: "Turn repetitive work into controlled AI-assisted workflows.",
    heroDescription:
      "BI Solutions Group maps the current process, identifies where AI is useful, and builds workflows with clear inputs, review points, exceptions, and ownership.",
    metrics: [
      { label: "Core coverage", value: "Documents, data, decisions" },
      { label: "Control model", value: "Human review where needed" },
      { label: "Integration focus", value: "Existing tools and workflows" },
    ],
    items: [
      "Workflow discovery, process mapping, and automation opportunity assessment",
      "Document intake, extraction, classification, validation, and routing",
      "Triggers, handoffs, approval queues, and task orchestration across business tools",
      "System integration, exception handling, audit logs, review controls, and operating guidance",
    ],
    outcomes: [
      "Less repeated handling across document-heavy and information-heavy processes",
      "More consistent outputs through defined inputs, rules, templates, and review steps",
      "Clear escalation paths when an AI-assisted result needs human judgment",
      "A documented workflow that internal teams can understand, operate, and improve",
    ],
    delivery: [
      "Map the current workflow, handoffs, tools, bottlenecks, exceptions, and control requirements",
      "Design and prototype the target process around a representative set of real cases",
      "Integrate required systems and test output quality, review steps, and failure handling",
      "Pilot with users, document the operating process, and refine it from observed usage",
    ],
    useCases: [
      "Classifying, extracting, validating, and routing incoming documents",
      "Coordinating repeated intake, reporting, or approval processes across existing tools",
      "Supporting case triage, compliance review, exception handling, and operational handoffs",
    ],
  },
  {
    slug: "generative-ai-llm-consulting",
    path: "/services#generative-ai-llm-consulting",
    icon: Bot,
    title: "Generative AI and LLM consulting",
    shortTitle: "Generative AI",
    navLabel: "Generative AI & LLMs",
    description:
      "Design useful assistants, retrieval systems, and generative AI applications around approved knowledge, measurable behavior, and business review.",
    seoTitle: "Generative AI & LLM Consulting Services",
    seoDescription:
      "Generative AI and LLM consulting for assistants, RAG systems, prompt workflows, evaluation, integration, and practical business adoption.",
    keywords: [
      "generative AI consulting",
      "LLM consulting",
      "RAG consulting",
      "AI assistant development",
      "enterprise generative AI",
      "LLM application development",
    ],
    heroEyebrow: "Assistants, retrieval, and generative AI applications",
    heroTitle: "Build generative AI tools around real work and trusted knowledge.",
    heroDescription:
      "BI Solutions Group helps organizations design, evaluate, and integrate LLM applications that support specific users, information sources, and operating controls.",
    metrics: [
      { label: "Core capabilities", value: "LLMs, RAG, assistants" },
      { label: "Knowledge sources", value: "Documents, data, approved systems" },
      { label: "Control focus", value: "Evaluation, access, review" },
    ],
    items: [
      "Internal assistants, copilots, and task-specific generative AI applications",
      "Retrieval-augmented generation and enterprise search over approved content",
      "Prompt, system-instruction, structured-output, and evaluation design",
      "Model and provider selection, API integration, access rules, and usage controls",
    ],
    outcomes: [
      "Responses grounded in selected organizational knowledge instead of generic model context",
      "Faster access to relevant information, drafts, and analytical explanations",
      "Visible evaluation criteria for accuracy, relevance, safety, and task completion",
      "A reusable application design that can evolve as models and business needs change",
    ],
    delivery: [
      "Define the users, tasks, source material, expected outputs, risks, and acceptance criteria",
      "Prepare the knowledge, retrieval, permission, and integration design",
      "Build a representative prototype and evaluate it against real test cases",
      "Pilot with users, document limitations, and establish monitoring and improvement routines",
    ],
    useCases: [
      "An internal knowledge assistant for policies, procedures, research, or project material",
      "AI-assisted customer-service, proposal, report, or communication drafting",
      "Retrieval, comparison, synthesis, and question answering across large document collections",
    ],
  },
  {
    slug: "predictive-analytics-machine-learning",
    path: "/services#predictive-analytics-machine-learning",
    icon: LineChart,
    title: "Predictive analytics and machine learning consulting",
    shortTitle: "Predictive analytics",
    navLabel: "Predictive analytics & ML",
    description:
      "Develop forecasting, classification, scoring, and segmentation models that connect analytical evidence to an operational decision.",
    seoTitle: "Predictive Analytics & Machine Learning Consulting",
    seoDescription:
      "Predictive analytics and machine learning consulting for forecasting, classification, segmentation, scoring, and decision-support workflows.",
    keywords: [
      "predictive analytics consulting",
      "machine learning consulting",
      "forecasting services",
      "data science consulting",
      "predictive modeling services",
      "machine learning consulting services",
    ],
    heroEyebrow: "Forecasting, scoring, and decision support",
    heroTitle: "Use predictive analytics to make better-informed decisions.",
    heroDescription:
      "BI Solutions Group develops and validates models around a defined business question, available data, decision window, and practical operating workflow.",
    metrics: [
      { label: "Core methods", value: "Forecasting, classification, scoring" },
      { label: "Analytical tooling", value: "Python, R, SQL" },
      { label: "Validation focus", value: "Backtesting, explanation, review" },
    ],
    items: [
      "Time-series forecasting and scenario analysis",
      "Classification, risk, propensity, and prioritization models",
      "Segmentation, clustering, anomaly detection, and pattern analysis",
      "Feature engineering, model comparison, validation, and explanation",
    ],
    outcomes: [
      "Predictions tied to a defined decision, action, owner, and planning horizon",
      "Transparent model performance, assumptions, uncertainty, and operating limits",
      "Reusable analytical code and documented inputs instead of an isolated model file",
      "Outputs presented in a form that business teams can review and use",
    ],
    delivery: [
      "Define the business question, decision process, target variable, baseline, and success criteria",
      "Assess data suitability and prepare reproducible features and analytical datasets",
      "Train, compare, backtest, validate, and explain candidate approaches",
      "Integrate the selected output into a report, dashboard, application, or operating workflow",
    ],
    useCases: [
      "Forecasting demand, revenue, workload, funding, cash flow, or operational pressure",
      "Estimating churn, propensity, risk, response, or case priority",
      "Detecting unusual activity and helping teams focus limited review capacity",
    ],
  },
  {
    slug: "ai-governance-literacy-adoption",
    path: "/services#ai-governance-literacy-adoption",
    icon: ShieldCheck,
    title: "AI governance, literacy, and adoption consulting",
    shortTitle: "AI governance",
    navLabel: "AI governance & adoption",
    description:
      "Create the policies, roles, controls, learning, and review practices needed to use AI responsibly and turn approved tools into everyday capability.",
    seoTitle: "AI Governance, Literacy & Adoption Consulting",
    seoDescription:
      "AI governance and adoption consulting covering policies, risk controls, AI literacy, responsible use, and EU AI Act-aware operating practices.",
    keywords: [
      "AI governance consulting",
      "responsible AI consulting",
      "AI adoption consulting",
      "EU AI Act readiness",
      "AI policy development",
      "AI risk assessment",
    ],
    heroEyebrow: "Policy, accountability, literacy, and adoption",
    heroTitle: "Put practical governance around how your organization uses AI.",
    heroDescription:
      "BI Solutions Group helps teams inventory AI use, define responsibilities, introduce proportionate controls, and build the knowledge needed for responsible adoption.",
    metrics: [
      { label: "Core coverage", value: "Policy, risk, adoption" },
      { label: "Regulatory lens", value: "EU AI Act and GDPR awareness" },
      { label: "Enablement focus", value: "Roles, training, review" },
    ],
    items: [
      "AI system and use-case inventory with business-focused risk categorization",
      "Responsible-use policies, standards, approval paths, and practical guardrails",
      "Human oversight, documentation, incident, vendor, and escalation procedures",
      "AI literacy, role-based guidance, training, and change-management support",
    ],
    outcomes: [
      "Better visibility into where AI is used, by whom, for what purpose, and with which data",
      "Consistent decision paths for evaluating, approving, monitoring, and retiring AI use cases",
      "Clearer records of ownership, intended use, controls, limitations, and review activity",
      "Stronger adoption because employees understand both permitted uses and practical boundaries",
    ],
    delivery: [
      "Inventory current tools, use cases, vendors, stakeholders, data exposure, and existing controls",
      "Assess governance gaps and prioritize actions according to business context and risk",
      "Define roles, policies, approval paths, templates, controls, and evidence requirements",
      "Support rollout through training, communications, adoption guidance, and a review cadence",
    ],
    useCases: [
      "Employees use generative AI without a shared policy or approved working practices",
      "Models influence important decisions but ownership and human oversight are unclear",
      "An organization needs operational preparation for AI regulation and data-protection expectations",
    ],
  },
  {
    slug: "mlops-model-monitoring",
    path: "/services#mlops-model-monitoring",
    icon: Gauge,
    title: "MLOps and model monitoring services",
    shortTitle: "MLOps",
    navLabel: "MLOps & model monitoring",
    description:
      "Move machine learning and LLM workflows into maintainable operation with versioning, deployment, evaluation, monitoring, and clear ownership.",
    seoTitle: "MLOps & Model Monitoring Services",
    seoDescription:
      "MLOps and model monitoring services for deployment, versioning, evaluation, drift detection, observability, and maintainable AI operations.",
    keywords: [
      "MLOps consulting",
      "model monitoring services",
      "machine learning deployment",
      "AI model productionization",
      "LLM monitoring",
      "ML lifecycle management",
    ],
    heroEyebrow: "Deployment, observability, and model operations",
    heroTitle: "MLOps and model monitoring that keep AI reliable after launch.",
    heroDescription:
      "BI Solutions Group designs the lifecycle around deployed models and LLM applications so versions, evaluations, changes, incidents, and ownership remain visible.",
    metrics: [
      { label: "Core coverage", value: "Deployment, versioning, monitoring" },
      { label: "Workflow types", value: "Machine learning and LLM applications" },
      { label: "Operating focus", value: "Reliability, traceability, ownership" },
    ],
    items: [
      "Deployment architecture, environments, version control, and release workflows",
      "Automated validation, evaluation, testing, and approval gates",
      "Monitoring for performance, drift, output quality, latency, usage, and cost",
      "Runbooks, alerts, rollback, retraining, incident response, and ownership practices",
    ],
    outcomes: [
      "A repeatable path from validated development work to a controlled release",
      "Traceability across data, code, model, prompt, configuration, evaluation, and deployment versions",
      "Earlier visibility into drift, degraded outputs, failed dependencies, and unexpected behavior",
      "Operating documentation that supports maintenance and handover beyond the original build team",
    ],
    delivery: [
      "Audit the current model or LLM workflow, environments, dependencies, risks, and support model",
      "Design the target lifecycle for testing, release, monitoring, feedback, and change control",
      "Implement the agreed deployment, evaluation, observability, and alerting components",
      "Launch with runbooks, ownership, escalation paths, and a practical review cadence",
    ],
    useCases: [
      "A validated model remains in a notebook or manual process and needs production delivery",
      "An LLM application is moving from prototype to a controlled business workflow",
      "Deployed models lack monitoring, version traceability, or a defined response when quality changes",
    ],
  },
  {
    slug: "ai-business-intelligence",
    path: "/services#ai-business-intelligence",
    icon: BarChart3,
    title: "AI and business intelligence consulting",
    shortTitle: "AI-enhanced BI",
    navLabel: "AI & business intelligence",
    description:
      "Add metric-grounded commentary, natural-language access, and reviewable AI assistance to governed business intelligence workflows.",
    seoTitle: "AI & Business Intelligence Consulting",
    seoDescription:
      "AI and business intelligence consulting for automated reporting, Power BI workflows, metric-grounded commentary, and natural-language analysis.",
    keywords: [
      "AI business intelligence consulting",
      "Power BI AI consulting",
      "automated reporting services",
      "AI dashboard insights",
      "automated report generation",
      "AI analytics consulting",
    ],
    heroEyebrow: "AI-assisted reporting and analysis",
    heroTitle: "Make business intelligence more useful with practical AI.",
    heroDescription:
      "BI Solutions Group connects governed metrics, reporting systems, and AI-assisted workflows so teams can find, explain, and act on information more efficiently.",
    metrics: [
      { label: "Core foundation", value: "Governed metrics and semantic models" },
      { label: "Automation scope", value: "Reporting, commentary, Q&A" },
      { label: "Control model", value: "Traceable data and human review" },
    ],
    items: [
      "Integration with existing governed semantic models, KPI definitions, and reporting controls",
      "Automated narrative commentary, summaries, and management-report drafting",
      "Natural-language questions and assistant workflows over governed business data",
      "Scheduled commentary and review queues triggered by approved metric changes",
    ],
    outcomes: [
      "Less repeated manual work when preparing recurring reports and management commentary",
      "Faster access to relevant metrics through guided questions and analytical summaries",
      "Narratives grounded in governed measures instead of disconnected spreadsheet calculations",
      "An AI assistance layer built on governed metrics without replacing the core reporting model",
    ],
    delivery: [
      "Audit current reports, semantic models, metrics, data sources, users, and repeated analytical tasks",
      "Prioritize AI-assisted reporting opportunities according to value, feasibility, and control needs",
      "Build and test the selected reporting, commentary, question-answering, or review workflow",
      "Integrate it into the reporting process with review rules, documentation, and user guidance",
    ],
    useCases: [
      "Producing recurring executive commentary from approved Power BI metrics",
      "Helping users explore governed business data through natural-language questions",
      "Creating structured first drafts for board packs and performance reviews from approved metrics",
    ],
  },
  {
    slug: "business-intelligence-semantic-modeling",
    path: "/services#business-intelligence-semantic-modeling",
    icon: BarChart3,
    title: "Business intelligence and semantic modeling",
    shortTitle: "Business intelligence",
    navLabel: "Business intelligence & Power BI",
    description:
      "Turn fragmented reporting into a governed decision system with reliable Power BI models, trusted KPIs, and fast executive dashboards.",
    seoTitle: "Business Intelligence & Semantic Modeling Services",
    seoDescription:
      "Power BI, Tableau, Looker, dashboard, KPI, and semantic model consulting from BI Solutions for trusted reporting systems.",
    keywords: [
      "international business intelligence consulting",
      "Power BI consulting",
      "Tableau consulting",
      "Looker consulting",
      "semantic model review",
      "dashboard development",
    ],
    heroEyebrow: "One operating view of the business",
    heroTitle: "Turn fragmented reporting into one governed decision system.",
    heroDescription:
      "We engineer Power BI environments, Tabular semantic models, and KPI frameworks that replace competing spreadsheets with fast, explainable reporting leaders can use with confidence.",
    techStack: [
      "Power BI",
      "DAX",
      "Tabular Editor",
      "Microsoft Fabric",
      "Azure",
      "SQL",
      "Power Query",
    ],
    metrics: [
      { label: "Core platform", value: "Power BI and Microsoft Fabric" },
      { label: "Model layer", value: "Tabular, DAX, governed measures" },
      { label: "Decision surface", value: "Executive and operational reporting" },
    ],
    items: [
      "Executive decision hubs and operational Power BI applications",
      "Tabular semantic models with reusable measures and role-based access",
      "DAX, refresh, relationship, and report-performance optimization",
      "KPI dictionaries, ownership rules, release controls, and model documentation",
    ],
    outcomes: [
      "A shared version of performance that finance, operations, and leadership can reconcile",
      "Faster reports and cleaner models that analysts can extend without rebuilding logic",
      "Executive dashboards organised around decisions, exceptions, and accountable owners",
      "Governed KPI definitions that reduce reporting drift as teams and data volumes grow",
    ],
    delivery: [
      "Audit sources, models, reports, measures, refresh paths, owners, and decision friction",
      "Define the KPI contract and engineer the semantic model, security, and performance layer",
      "Design and validate dashboards against real executive and operational workflows",
      "Deploy with documentation, change control, ownership, training, and monitoring",
    ],
    useCases: [
      "Power BI reports are slow, inconsistent, or dependent on duplicated DAX and manual fixes",
      "Leadership receives competing versions of the same KPI from different departments",
      "Financial, operational, and customer data must become one secure decision environment",
    ],
  },
  {
    slug: "website-app-development",
    path: "/services#website-app-development",
    icon: MonitorSmartphone,
    title: "Website and app development",
    shortTitle: "Web development",
    navLabel: "Websites & web apps",
    description:
      "Build fast websites and bespoke web applications that connect clear positioning, conversion journeys, business workflows, and product analytics.",
    seoTitle: "Website & Web App Development Services",
    seoDescription:
      "BI Solutions builds modern websites, landing pages, booking flows, dashboards, and web applications for organizations worldwide.",
    keywords: [
      "international website development",
      "international web app development",
      "custom web application development",
      "κατασκευή ιστοσελίδων",
      "κατασκευή web εφαρμογών",
    ],
    heroEyebrow: "High-performance digital products",
    heroTitle: "Ship a digital product that earns attention and moves work forward.",
    heroDescription:
      "We combine conversion architecture with React and Next.js engineering to build premium websites, customer portals, internal tools, and analytics-connected applications that are ready to measure and evolve.",
    techStack: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Product analytics",
      "Cloud",
    ],
    metrics: [
      { label: "Product surfaces", value: "Websites, portals, and bespoke apps" },
      { label: "Engineering core", value: "Next.js, React, and TypeScript" },
      { label: "Growth layer", value: "Conversion paths and product telemetry" },
    ],
    items: [
      "Corporate and service websites structured around qualified conversion",
      "Customer portals, booking flows, operational tools, and bespoke web apps",
      "Reusable interface systems with responsive, accessible component architecture",
      "Product telemetry, consent-aware analytics, CRM links, and API integrations",
    ],
    outcomes: [
      "A clearer value proposition and shorter path from first visit to qualified enquiry",
      "Fast, responsive journeys designed around the audience's questions and tasks",
      "Reliable behavioural data showing where users engage, hesitate, and convert",
      "A maintainable product foundation that can connect to data, AI, and internal systems",
    ],
    delivery: [
      "Define the audience, proposition, core journeys, content requirements, and success events",
      "Shape the information architecture, interaction model, interface system, and build plan",
      "Engineer responsive pages, application workflows, integrations, analytics, and quality checks",
      "Launch with documentation, measurement, and a prioritised post-release improvement backlog",
    ],
    useCases: [
      "A credible business is losing enquiries because its website does not explain the offer quickly",
      "A manual client or internal workflow needs a secure, purpose-built web application",
      "A new product needs a production interface, integrations, and telemetry—not only a prototype",
    ],
  },
  {
    slug: "data-strategy-governance",
    path: "/services#data-strategy-governance",
    icon: ShieldCheck,
    title: "Data strategy and cloud foundations",
    shortTitle: "Data foundations",
    navLabel: "Data strategy & cloud",
    description:
      "Create the governed cloud data foundation that makes reporting, analytics, and AI trustworthy enough to scale.",
    seoTitle: "Data Strategy & Cloud Foundations Services",
    seoDescription:
      "BI Solutions helps organizations design data strategy, cloud foundations, governance, access controls, quality rules, and GDPR-aware analytics processes.",
    keywords: [
      "data strategy consulting",
      "cloud data foundation",
      "cloud migration consulting",
      "international data governance consulting",
      "GDPR data governance",
      "data quality framework",
    ],
    heroEyebrow: "Cloud architecture with operating discipline",
    heroTitle: "Build the data foundation every decision system depends on.",
    heroDescription:
      "We define the warehouse or lakehouse architecture, quality controls, semantic layer, ownership, and GDPR-aware operating model that let teams scale analytics and AI without losing trust.",
    techStack: [
      "Snowflake",
      "BigQuery",
      "Microsoft Fabric",
      "Databricks",
      "Azure",
      "dbt",
      "SQL",
    ],
    metrics: [
      { label: "Architecture", value: "Warehouse, lakehouse, and semantic layers" },
      { label: "Control plane", value: "Quality, access, lineage, and ownership" },
      { label: "Compliance lens", value: "GDPR-aware data operations" },
    ],
    items: [
      "Target-state cloud architecture across Snowflake, BigQuery, Fabric, Databricks, or Azure",
      "Ingestion, transformation, warehouse or lakehouse, and semantic-layer design",
      "Data contracts, quality tests, cataloguing, lineage, and observability standards",
      "Role-based access, GDPR-aware controls, retention rules, and governance workflows",
      "Ownership maps, stewardship playbooks, and decision-ready implementation roadmaps",
    ],
    outcomes: [
      "A sequenced target architecture aligned to the decisions and workloads the business needs",
      "A single governed route from operational sources to metrics, dashboards, and AI systems",
      "Clear accountability for critical data products, definitions, access, and quality incidents",
      "Lower risk from shadow reporting, undocumented transformations, and uncontrolled data use",
      "Governance that accelerates delivery by making standards and decision rights explicit",
    ],
    delivery: [
      "Map source systems, data flows, consumers, ownership, access, quality risk, and business priorities",
      "Design the target platform, integration patterns, semantic layer, controls, and delivery sequence",
      "Implement priority pipelines, quality gates, access policies, documentation, and stewardship routines",
      "Transfer ownership with operational runbooks, governance forums, and a measurable roadmap",
    ],
    useCases: [
      "Reporting still depends on local files, legacy databases, or fragile point-to-point extracts",
      "Teams calculate the same KPI differently because no governed semantic layer exists",
      "Sensitive data reaches dashboards or AI workflows without sufficient access and lineage controls",
      "Analytics demand is growing faster than the organisation's quality, ownership, and platform standards",
    ],
  },
  {
    slug: "data-career-enablement-mentorship",
    path: "/services#data-career-enablement-mentorship",
    icon: GraduationCap,
    title: "Data career enablement and mentorship",
    shortTitle: "Enablement & mentorship",
    navLabel: "Data career mentorship",
    description:
      "Build a focused path into or through a data career with one-to-one mentorship, practical project guidance, portfolio feedback, and skills development shaped around your goals.",
    seoTitle: "Data Career Mentorship & Professional Upskilling",
    seoDescription:
      "Personalized data career mentorship and upskilling for entry-level candidates, analysts, and experienced professionals across Power BI, SQL, Python, analytics, AI, portfolios, and interviews.",
    keywords: [
      "data career mentorship",
      "data analyst mentor",
      "Power BI mentoring",
      "data analytics career coaching",
      "data professional upskilling",
      "business intelligence mentorship",
      "data science career mentoring",
    ],
    heroEyebrow: "Personal guidance for every career stage",
    heroTitle: "Build the skills, judgment, and portfolio for your next step in data.",
    heroDescription:
      "From a first role in analytics to senior-level growth, mentorship is tailored to your current experience, target role, available time, and the practical evidence employers and clients expect to see.",
    techStack: [
      "Power BI",
      "SQL",
      "Python",
      "Excel",
      "Git & GitHub",
      "AI workflows",
    ],
    metrics: [
      { label: "Career stages", value: "Entry level to senior professional" },
      { label: "Format", value: "One-to-one remote mentorship" },
      { label: "Focus", value: "Skills, projects, portfolio, and interviews" },
    ],
    items: [
      "A personalized skills assessment and career roadmap aligned to a realistic target role",
      "One-to-one sessions across analytics, Power BI, SQL, Python, data modeling, and applied AI",
      "Hands-on guidance for portfolio projects, technical decisions, documentation, and presentation",
      "CV, LinkedIn, interview, case-study, and professional communication feedback",
      "Advanced support for specialists moving toward senior, lead, consulting, or management roles",
    ],
    outcomes: [
      "A clear learning sequence based on your current level instead of a generic course catalogue",
      "Stronger practical skills developed through work you can explain, defend, and improve",
      "A more credible portfolio and professional story for roles, clients, or internal progression",
      "Regular expert feedback, accountability, and course correction as your goals evolve",
    ],
    delivery: [
      "Assess your experience, strengths, gaps, target roles, constraints, and existing portfolio",
      "Define a focused development plan with practical milestones and recommended resources",
      "Work through regular mentoring sessions, exercises, project reviews, and technical feedback",
      "Review progress and refine the roadmap around interviews, opportunities, or new responsibilities",
    ],
    useCases: [
      "You are entering data or analytics and need a structured route from fundamentals to employable work",
      "You already work with data and want to deepen your BI, analytics, engineering, or AI capability",
      "You are an experienced professional preparing for a senior role, consulting work, or leadership responsibility",
    ],
  },
];

const servicePillarSlugs = [
  "business-intelligence-semantic-modeling",
  "advanced-analytics-ai",
  "data-strategy-governance",
  "website-app-development",
  "data-career-enablement-mentorship",
] as const;

export const servicePillarPages = servicePillarSlugs
  .map((slug) => servicePages.find((service) => service.slug === slug))
  .filter((service): service is ServicePage => Boolean(service));

const aiCapabilitySlugs = [
  "ai-strategy-readiness",
  "ai-automation-consulting",
  "generative-ai-llm-consulting",
  "predictive-analytics-machine-learning",
  "ai-governance-literacy-adoption",
  "mlops-model-monitoring",
  "ai-business-intelligence",
] as const;

export const aiCapabilityPages = aiCapabilitySlugs
  .map((slug) => servicePages.find((service) => service.slug === slug))
  .filter((service): service is ServicePage => Boolean(service));

export const legacyServiceRedirects: Record<string, string> = {
  "digital-transformation-cloud-migration": "/services#data-strategy-governance",
  "ai-literacy-change-management": "/services#ai-governance-literacy-adoption",
  "mlops-productionization": "/services#mlops-model-monitoring",
  "website-web-app-development": "/services#website-app-development",
};

export function getServicePageBySlug(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}
