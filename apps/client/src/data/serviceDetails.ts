export interface ServiceDetail {
  slug: string;
  path: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  introduction: string;
  need: string;
  startingPoint: string;
  fit: string[];
  deliverables: { title: string; description: string }[];
  stages: { title: string; description: string }[];
  prerequisites: string[];
  scopeDrivers: string[];
  maintenance: string;
  questions: { question: string; answer: string }[];
  resources: { label: string; href: string; description: string }[];
  demonstration?: { title: string; href: string; description: string };
  relatedService: { label: string; href: string };
}

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "power-bi-consulting",
    path: "/services/power-bi-consulting",
    title: "Power BI consulting",
    seoTitle: "Power BI Consulting & Dashboard Development",
    description:
      "Power BI consulting from BI Solutions Group: semantic models, DAX, dashboards, refresh troubleshooting, documentation, and scoped ongoing support.",
    eyebrow: "Business intelligence · Senior-led delivery",
    introduction:
      "Based in Greece, BI Solutions Group helps teams build, repair, and maintain Power BI reporting through remote international delivery. Work directly with founder Ioannis Bekas to connect the data, define the measures, and give people a reporting system they can understand and use.",
    need: "business-intelligence",
    startingPoint:
      "Bring a slow report, a recurring spreadsheet process, a refresh problem, or a new reporting requirement. We define the useful next step from the problem you have.",
    fit: [
      "Finance and operations teams need consistent KPIs across reports, spreadsheets, and business systems.",
      "An existing Power BI model has slow visuals, difficult DAX, failed refreshes, or unclear relationships.",
      "A growing reporting process needs documented definitions, access rules, and a maintainable handoff.",
    ],
    deliverables: [
      {
        title: "Reporting assessment",
        description:
          "Review the report, data sources, model, refresh process, and intended decisions. Identify the issues and agree a prioritized implementation scope.",
      },
      {
        title: "Semantic models and DAX",
        description:
          "Design tables, relationships, Power Query transformations, and reusable DAX measures around agreed business definitions. Document the logic behind the numbers.",
      },
      {
        title: "Dashboards built for decisions",
        description:
          "Create executive or operational report pages with useful filters, drill paths, clear metric definitions, and the detail needed to investigate exceptions.",
      },
      {
        title: "Refresh, access, and handoff",
        description:
          "Scope scheduled refresh, gateway requirements, workspace access, and row-level security where needed. Review performance and leave operating notes and a walkthrough.",
      },
    ],
    stages: [
      {
        title: "Define the reporting decision",
        description:
          "Agree who uses the report, which decisions it supports, how KPIs are defined, and what a correct result looks like.",
      },
      {
        title: "Review the data and scope",
        description:
          "Inspect approved sample data or the existing setup, identify source and access dependencies, then agree deliverables, responsibilities, and fees.",
      },
      {
        title: "Build and validate",
        description:
          "Develop the model and report in reviewable steps. Reconcile important totals with agreed source records and test filters, access, and refresh behavior.",
      },
      {
        title: "Publish and hand over",
        description:
          "Agree the publishing arrangement, document measures and operation, and walk the team through maintenance. Further support can be scoped separately.",
      },
    ],
    prerequisites: [
      "A named business owner and examples of the decisions or reports that need to improve.",
      "A list of relevant data sources and any existing Power BI files or metric definitions.",
      "Agreement on data handling, permissions, licensing, and access before implementation.",
    ],
    scopeDrivers: [
      "Number, condition, and accessibility of data sources",
      "Complexity of business logic, DAX, and the semantic model",
      "Report pages, audiences, access rules, and refresh requirements",
      "Migration, reconciliation, documentation, and training needs",
    ],
    maintenance:
      "Ongoing support can cover refresh failures, source changes, measure updates, report performance, and new reporting needs. The agreement should name the owner, review cadence, access arrangements, and response expectations; these are defined in the scope.",
    questions: [
      {
        question: "Can you fix an existing Power BI report?",
        answer:
          "Yes. An engagement can begin with a review of the existing file, model, measures, refresh process, or report performance. The assessment determines whether a targeted repair or a broader model change is appropriate.",
      },
      {
        question: "What is the difference between a dashboard and a semantic model?",
        answer:
          "The report is the visual interface people use. The semantic model holds the tables, relationships, calculations, and business definitions behind it. Consulting can address either layer or both, depending on where the problem sits.",
      },
      {
        question: "Can we start with a small, defined problem?",
        answer:
          "Yes. A failing refresh, a specific DAX calculation, or one reporting process can be a useful starting point. We agree what the engagement will investigate or deliver before implementation begins.",
      },
      {
        question: "Do you work with remote and international teams?",
        answer:
          "Yes. BI Solutions Group supports international teams remotely. Meeting times, access requirements, communication, milestones, and handoff arrangements are agreed as part of the project scope.",
      },
      {
        question: "Are Power BI licenses included?",
        answer:
          "Licensing and workspace requirements are reviewed during scoping. Consulting fees and any Microsoft licenses or other platform costs are identified separately so the required setup is clear before delivery.",
      },
      {
        question: "How much does Power BI consulting cost?",
        answer:
          "Fees depend on the sources, model complexity, report scope, validation, access controls, and handoff required. Share the current problem and constraints first; deliverables and fees are agreed before implementation.",
      },
    ],
    resources: [
      {
        label: "Define dashboard requirements",
        href: "/blog/dashboard-requirements-before-power-bi-build",
        description: "Decisions, users, KPIs, sources, refresh needs, and ownership.",
      },
      {
        label: "Understand semantic modeling",
        href: "/blog/semantic-modeling-power-bi-clean-models",
        description: "Why the model matters as much as the visual layer.",
      },
      {
        label: "Meet Ioannis Bekas",
        href: "/about",
        description: "Experience, education, and the person behind the delivery.",
      },
    ],
    demonstration: {
      title: "Explore an audit-compliance reporting concept",
      href: "/case-studies/unicef-audit-compliance",
      description:
        "An independent Power BI portfolio demonstration using synthetic data. Explore how audit results, country risk, and recommendation progress can fit into a reporting flow. This work was not commissioned by, affiliated with, or endorsed by UNICEF.",
    },
    relatedService: {
      label: "AI workflow automation",
      href: "/services/ai-automation",
    },
  },
  {
    slug: "ai-automation",
    path: "/services/ai-automation",
    title: "AI workflow automation",
    seoTitle: "AI Workflow Automation Consulting",
    description:
      "AI workflow automation consulting from BI Solutions Group: process discovery, document workflows, system integration, evaluation, human review, and handoff.",
    eyebrow: "Applied AI · Controlled business workflows",
    introduction:
      "Based in Greece, BI Solutions Group designs and implements AI-assisted workflows for international teams working remotely. Work directly with founder Ioannis Bekas to define useful document, knowledge, and operational automation, connect existing systems, and keep review and ownership clear.",
    need: "ai-automation",
    startingPoint:
      "Bring one repeated task and a few representative examples. We map the inputs, decisions, handoffs, and exceptions before choosing the tools or model.",
    fit: [
      "A team repeatedly reads, classifies, extracts, summarizes, or routes similar documents and requests.",
      "An AI prototype needs integrations, evaluation, permissions, and a clear path into everyday operation.",
      "Work passes between several tools and people, with unclear exceptions or repeated manual re-entry.",
    ],
    deliverables: [
      {
        title: "Workflow and opportunity assessment",
        description:
          "Map the process, current effort, users, source systems, and exceptions. Identify which steps suit rules, AI assistance, or human judgment, then define the pilot scope.",
      },
      {
        title: "Document and knowledge workflows",
        description:
          "Scope intake, extraction, classification, summarization, or retrieval over approved knowledge. Define expected outputs, source traceability, and review requirements.",
      },
      {
        title: "Integration and human review",
        description:
          "Connect agreed systems through available APIs or workflow tools. Implement permissions, validation, approval queues, failure handling, and an auditable handoff where required.",
      },
      {
        title: "Evaluation and operating guidance",
        description:
          "Test representative cases and important failure modes. Document acceptance criteria, monitoring, ownership, recurring usage costs, and the steps for operating or updating the workflow.",
      },
    ],
    stages: [
      {
        title: "Map one useful workflow",
        description:
          "Describe the trigger, inputs, expected output, users, and current handling. Establish the business baseline and the decisions requiring human approval.",
      },
      {
        title: "Prototype with representative cases",
        description:
          "Use approved material to test feasibility and identify difficult cases. Agree measurable acceptance criteria before expanding the implementation.",
      },
      {
        title: "Integrate and evaluate",
        description:
          "Connect the agreed tools and permissions. Test output quality, exceptions, retries, access boundaries, latency, and cost against the defined requirements.",
      },
      {
        title: "Pilot and establish ownership",
        description:
          "Review the workflow with its users, document operation and escalation, and agree monitoring and change responsibilities before broader use.",
      },
    ],
    prerequisites: [
      "A process owner who can explain current steps, difficult cases, and the acceptable level of error.",
      "Representative, approved examples plus the rules for using confidential or personal data.",
      "A list of existing tools, available APIs, access constraints, and the people who can approve changes.",
    ],
    scopeDrivers: [
      "Variation, volume, language, and quality of incoming material",
      "Number of integrations and the capabilities of their APIs",
      "Evaluation, permissions, review, and audit requirements",
      "Hosting, model usage, monitoring, and operational support",
    ],
    maintenance:
      "AI workflows need review when models, prompts, documents, or connected systems change. Support can include failed-run investigation, evaluation updates, quality and usage-cost monitoring, and integration maintenance. Responsibilities and support expectations are agreed separately.",
    questions: [
      {
        question: "What is a suitable first AI automation project?",
        answer:
          "A narrow, repeated process with accessible inputs, a named owner, and a result that can be checked. Document classification, internal summaries, or request triage can be candidates, but suitability depends on your examples, risks, and review requirements.",
      },
      {
        question: "Does every step need an AI model?",
        answer:
          "No. Fixed rules, templates, validation, and conventional integrations often handle predictable steps better. The workflow design identifies where AI interpretation is useful and where deterministic behavior or human judgment is required.",
      },
      {
        question: "Can the workflow use our existing tools?",
        answer:
          "Often, yes. Feasibility depends on available APIs, permissions, licensing, and your environment. The assessment identifies which systems can connect, where a manual handoff remains useful, and whether additional infrastructure is needed.",
      },
      {
        question: "How do you decide whether an AI output is good enough?",
        answer:
          "We agree acceptance criteria using representative cases. Depending on the workflow, evaluation can cover field accuracy, missing information, source support, routing decisions, error handling, latency, cost, and the need for human correction.",
      },
      {
        question: "How is sensitive business data handled?",
        answer:
          "Data handling, access, model providers, retention requirements, and review controls are agreed before implementation. Use the initial enquiry to describe the workflow and its constraints; do not include confidential documents or personal data.",
      },
      {
        question: "How much does AI workflow automation cost?",
        answer:
          "Implementation fees depend on process complexity, integrations, data preparation, evaluation, and controls. Model usage, hosting, platform subscriptions, and ongoing support can add recurring costs. These dependencies are reviewed when agreeing scope and fees.",
      },
    ],
    resources: [
      {
        label: "AI document workflows",
        href: "/blog/ai-document-workflows-professional-services",
        description: "A practical introduction for professional-service teams.",
      },
      {
        label: "From a prompt to a repeatable process",
        href: "/blog/prompt-workflow-design-business-teams",
        description: "Inputs, outputs, review points, and operating rules.",
      },
      {
        label: "Monitor a workflow after launch",
        href: "/blog/model-monitoring-ai-workflows",
        description: "Quality, cost, latency, and changes over time.",
      },
    ],
    relatedService: {
      label: "Power BI consulting",
      href: "/services/power-bi-consulting",
    },
  },
];

export function getServiceDetailBySlug(slug: string) {
  return serviceDetails.find((service) => service.slug === slug);
}
