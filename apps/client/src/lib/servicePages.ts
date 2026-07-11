import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  BrainCircuit,
  Compass,
  Gauge,
  LineChart,
  MapPin,
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
    title: "AI consulting services",
    shortTitle: "AI consulting",
    navLabel: "AI consulting services",
    description:
      "Plan, build, govern, and operate AI systems across strategy, automation, generative AI, predictive analytics, business intelligence, and model operations.",
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
    heroEyebrow: "Strategy, automation, analytics, and implementation",
    heroTitle:
      "AI consulting services from strategy to production.",
    heroDescription:
      "BI Solutions Group helps organizations prioritize AI opportunities, build working solutions, connect them to data and reporting systems, and operate them with clear controls.",
    metrics: [
      { label: "Coverage", value: "Strategy, GenAI, automation, ML" },
      { label: "Delivery", value: "Assess, design, build, integrate" },
      { label: "Operations", value: "Governance, adoption, monitoring" },
    ],
    items: [
      "AI strategy, readiness assessment, use-case prioritization, and roadmaps",
      "AI automation, generative AI, LLM assistants, and document workflows",
      "Predictive analytics, machine learning, business intelligence, and automated reporting",
      "AI governance, adoption, MLOps, monitoring, and operating-model support",
    ],
    outcomes: [
      "A prioritized path from AI opportunity through implementation and adoption",
      "Working AI and analytical systems tied to specific users, decisions, and business processes",
      "Clear evaluation, review, governance, and monitoring practices around deployed workflows",
      "Reusable delivery assets that internal teams can understand, maintain, and improve",
    ],
    delivery: [
      "Discover the business goals, workflows, available data, systems, risks, and current AI activity",
      "Prioritize the right strategy, automation, generative AI, predictive, BI, or governance work",
      "Design, prototype, validate, and integrate the selected solution with stakeholder review",
      "Document the result and establish adoption, ownership, monitoring, and continuous improvement",
    ],
    useCases: [
      "Leadership needs an AI roadmap and a credible sequence from opportunity to investment",
      "A team needs to automate document, reporting, analytical, or knowledge-intensive work",
      "An AI or machine learning prototype needs integration, governance, monitoring, and adoption",
    ],
  },
  {
    slug: "ai-strategy-readiness",
    path: "/services/ai-strategy-readiness",
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
      "AI strategy consulting Greece",
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
    path: "/services/ai-automation-consulting",
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
      "AI automation consulting Greece",
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
    path: "/services/generative-ai-llm-consulting",
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
    path: "/services/predictive-analytics-machine-learning",
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
      "machine learning consultant Greece",
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
    path: "/services/ai-governance-literacy-adoption",
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
    path: "/services/mlops-model-monitoring",
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
    path: "/services/ai-business-intelligence",
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
    slug: "ai-consulting-greece",
    path: "/services/ai-consulting-greece",
    icon: MapPin,
    title: "AI consulting services in Greece",
    shortTitle: "AI consulting Greece",
    navLabel: "AI consulting in Greece",
    description:
      "Practical AI strategy, automation, generative AI, predictive analytics, governance, and implementation support for organizations in Greece.",
    seoTitle: "AI Consulting Services in Greece",
    seoDescription:
      "AI consulting in Greece for strategy, automation, generative AI, predictive analytics, governance, business intelligence, and implementation.",
    keywords: [
      "AI consulting Greece",
      "AI consultants Greece",
      "AI consulting services Greece",
      "AI consulting company Greece",
      "AI automation Greece",
      "generative AI consulting Greece",
    ],
    heroEyebrow: "AI consulting for organizations in Greece",
    heroTitle: "Practical AI consulting for businesses and organizations in Greece.",
    heroDescription:
      "BI Solutions Group helps Greece-based teams move from AI interest to a practical roadmap, a working solution, and an operating process suited to their systems, capacity, and European obligations.",
    metrics: [
      { label: "Service coverage", value: "Strategy through operation" },
      { label: "Delivery focus", value: "Business workflows and practical use cases" },
      { label: "Regional context", value: "Greece and the European Union" },
    ],
    items: [
      "AI opportunity and readiness assessment shaped around team size, data maturity, budget, and existing operations in Greece",
      "Document, knowledge, and reporting workflows that may involve Greek- and English-language business content",
      "Integration with the Microsoft 365, Power BI, web, and data tools already used by the organization",
      "GDPR-aware governance, EU AI Act preparation, vendor review, adoption, and operating guidance",
    ],
    outcomes: [
      "A shortlist of AI opportunities suited to the organization's operating reality instead of a generic trend list",
      "A focused pilot tied to a Greek business workflow, named owner, approved data boundary, and review rule",
      "Controls and documentation shaped around GDPR, European AI requirements, and internal risk tolerance",
      "A maintainable workflow and handover materials that fit the capacity of the internal team",
    ],
    delivery: [
      "Discover the business goals, Greek operating context, workflows, available data, systems, constraints, and current AI activity",
      "Prioritize a use case against business value, delivery effort, language needs, privacy, and organizational readiness",
      "Prototype and validate the workflow using representative material and the people who will review its output",
      "Integrate the selected solution and establish ownership, guidance, monitoring, and a practical improvement cadence",
    ],
    useCases: [
      "A Greek business wants to identify a realistic first AI use case before investing",
      "A professional-services team needs a controlled assistant for Greek- and English-language documents",
      "An organization wants AI connected to its Power BI, Microsoft 365, data, or web workflows",
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

const aiLocationSlugs = ["ai-consulting-greece"] as const;

export const aiLocationPages = aiLocationSlugs
  .map((slug) => servicePages.find((service) => service.slug === slug))
  .filter((service): service is ServicePage => Boolean(service));

export const legacyServiceRedirects: Record<string, string> = {
  "digital-transformation-cloud-migration": "/services/data-strategy-governance",
  "ai-literacy-change-management": "/services/ai-governance-literacy-adoption",
  "mlops-productionization": "/services/mlops-model-monitoring",
  "website-web-app-development": "/services/website-app-development",
};

export function getServicePageBySlug(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}
