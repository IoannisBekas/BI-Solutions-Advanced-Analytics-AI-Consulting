import type { ServiceDetail } from "./serviceDetails";

export const specialistServiceDetails: ServiceDetail[] = [
  {
    slug: "power-bi-performance-audit",
    path: "/services/power-bi-performance-audit",
    title: "Power BI performance audit",
    seoTitle: "Power BI Performance Audit · Semantic Models and DAX",
    description:
      "Find what slows an existing Power BI report. Get a timed baseline, a review of the semantic model and DAX, and a prioritized remediation plan.",
    eyebrow: "Power BI · Fixed-scope diagnostic",
    introduction:
      "When Power BI pages take too long to open or filters stall, establish where the time goes before changing the model. We examine an agreed report and its semantic model, identify the main bottlenecks, and explain which changes are worth making first.",
    need: "business-intelligence",
    startingPoint:
      "Choose one report and the actions users complain about most. We agree the diagnostic scope, access, and fee before work begins.",
    fit: [
      "A finance or operations report is slow to open, filter, or drill into during daily use.",
      "DAX measures, relationships, or a large model have grown harder to debug as the report expanded.",
      "The team needs an independent review before spending time on a rebuild or changing capacity.",
    ],
    deliverables: [
      {
        title: "A reproducible baseline",
        description: "Record timings for agreed interactions and capture the filters and test conditions. Separate time spent by visuals, queries, data sources, and refresh where the available tools allow.",
      },
      {
        title: "Semantic model and DAX review",
        description: "Check the model grain, relationships, filters, storage mode, and measures used by slow visuals. Review refresh dependencies where they affect the reported symptoms.",
      },
      {
        title: "An ordered remediation plan",
        description: "Document the observations, proposed changes, effort, and dependencies. Agree which measures or reports need reconciliation when changes are implemented.",
      },
    ],
    stages: [
      { title: "Agree what to measure", description: "Select the report pages, user actions, representative filters, and comparison conditions." },
      { title: "Inspect and isolate", description: "Use the available timings and model or query diagnostics to distinguish likely causes." },
      { title: "Review the findings", description: "Walk through the baseline, recommendations, and retest plan. Implementation can be scoped separately." },
    ],
    prerequisites: [
      "The report name and examples of actions that feel slow.",
      "Approved access to the report and semantic model, or a sanitized export with relevant timings.",
      "A report owner who can verify that changes preserve the intended numbers and filters.",
    ],
    scopeDrivers: [
      "Number of report pages, measures, models, and slow interactions in scope",
      "Access to diagnostics and the ability to run controlled comparisons",
      "DirectQuery, capacity, gateway, or source-system dependencies",
    ],
    maintenance:
      "Use the recorded baseline and reconciliation checks when measure definitions, data volumes, or report layouts change.",
    questions: [
      {
        question: "Can you review a model without production access?",
        answer: "An approved report or model export can support a model review. Measuring tenant, gateway, and source behavior may require a supervised session or diagnostics shared by your team.",
      },
      {
        question: "Does the audit include fixing slow measures?",
        answer: "The diagnostic covers the baseline, findings, and remediation plan. We can agree a separate implementation scope, including retesting the same actions and checking figures against the source.",
      },
    ],
    resources: [
      {
        label: "Building clean Power BI semantic models",
        href: "/blog/semantic-modeling-power-bi-clean-models",
        description: "Practical guidance on model grain, relationships, and shared business definitions.",
      },
      {
        label: "Semantic model analysis workspace",
        href: "/blog/power-bi-solutions-semantic-model-analysis-workspace",
        description: "What a model export can reveal before a performance investigation.",
      },
    ],
    relatedService: { label: "Power BI consulting", href: "/services/power-bi-consulting" },
    translatedLocales: ["en"],
  },
  {
    slug: "dataverse-power-bi-reporting",
    path: "/services/dataverse-power-bi-reporting",
    title: "Dataverse to Power BI reporting",
    seoTitle: "Dataverse to Power BI Reporting Consulting",
    description:
      "Build Power BI reporting from Microsoft Dataverse with reconciled measures, agreed access and refresh settings, and a documented semantic model.",
    eyebrow: "Microsoft Dataverse · Power BI",
    introduction:
      "When your team works in Power Apps or Dynamics 365 and still exports spreadsheets to report on progress, build reporting from the Dataverse records that drive the operation. We map the relevant tables and permissions, agree the metrics, and deliver a Power BI model the business can maintain.",
    need: "business-intelligence",
    startingPoint:
      "Pick the first reporting workflow, such as capacity, service backlog, or project delivery, and identify who uses the numbers today.",
    fit: [
      "Operations staff track assignments, work orders, or cases in Dataverse and rebuild management reports in Excel.",
      "Teams need historical or cross-team reporting with common measures and a predictable refresh schedule.",
      "An existing Dataverse report has inconsistent totals, slow data access, or unclear ownership.",
    ],
    deliverables: [
      {
        title: "Source and access design",
        description: "Map tables, keys, lookups, and status fields. Agree the connection approach against data size, latency, environment access, and how report viewers should be restricted.",
      },
      {
        title: "A reconciled semantic model",
        description: "Model the agreed reporting grain and write measures for the decisions in scope. Check example periods and records against approved Dataverse views or extracts.",
      },
      {
        title: "Reporting and a refresh handoff",
        description: "Build the first reporting pages and document refresh setup, ownership, access roles, and how to respond when an upstream field or workflow changes.",
      },
    ],
    stages: [
      { title: "Map the operation", description: "Identify the source environment, core entities, intended users, and existing reports." },
      { title: "Agree the first release", description: "Define the metrics, reporting grain, access, and refresh expectations." },
      { title: "Build and reconcile", description: "Connect approved data, validate totals, and review the report with the people who will use it." },
      { title: "Publish and document", description: "Agree who maintains the model, verifies refreshes, and approves future metric changes." },
    ],
    prerequisites: [
      "An owner for the Dataverse environment and a person who can validate the proposed KPIs.",
      "The relevant tables, audience, and approved connection or sample process.",
      "Examples of current reports, filters, or reconciliation rules.",
    ],
    scopeDrivers: [
      "Number of entities, relationships, source environments, and data volumes",
      "Refresh frequency, connector approach, and security requirements",
      "Complexity of KPI definitions and reconciliation to existing reporting",
    ],
    maintenance:
      "The handoff identifies who monitors refresh, how to update the model when Dataverse changes, and which checks to run before publishing updates.",
    questions: [
      {
        question: "Can you connect a custom Power Apps application?",
        answer: "Yes, when its relevant records are accessible in Dataverse. The scope depends on table design, relationships, permissions, and how results must be shared.",
      },
      {
        question: "Will Power BI inherit Dataverse permissions?",
        answer: "The design depends on the connection and publishing setup. We agree the report audience and separately verify any required workspace permissions and row-level security.",
      },
    ],
    resources: [
      {
        label: "Dashboard requirements before a Power BI build",
        href: "/blog/dashboard-requirements-before-power-bi-build",
        description: "Define the decisions, measures, and audience the report needs to serve.",
      },
    ],
    caseStudy: {
      title: "Risenfire workforce and capacity reporting",
      href: "/case-studies/risenfire-workforce-reporting",
      description: "Client work connecting Dataverse to Power BI for workforce availability, assigned hours, and project capacity reporting.",
    },
    relatedService: { label: "Power BI consulting", href: "/services/power-bi-consulting" },
    translatedLocales: ["en"],
  },
  {
    slug: "microsoft-fabric-migration",
    path: "/services/microsoft-fabric-migration",
    title: "Microsoft Fabric migration assessment",
    seoTitle: "Microsoft Fabric Migration Consulting",
    description:
      "Assess a move from SQL Server or Azure Synapse to Microsoft Fabric. Map reporting dependencies and define a pilot, validation checks, and cutover plan.",
    eyebrow: "Data engineering · Migration assessment",
    introduction:
      "Before moving data and reporting to Microsoft Fabric, identify what needs to move, what can stay, and where compatibility or access could interrupt reporting. Start with one reporting workload and use the findings to decide whether to migrate, redesign, or defer it.",
    need: "data-strategy",
    startingPoint:
      "Bring one critical report and the pipelines, tables, and Power BI semantic model behind it. We agree the assessment scope and fee before work starts.",
    fit: [
      "Your team is evaluating Fabric for workloads in SQL Server, Azure Synapse, or an existing Power BI estate.",
      "A migration timeline depends on keeping recurring finance or operations reports available throughout the transition.",
      "You need to understand workload compatibility, access requirements, and capacity assumptions before choosing a migration approach.",
    ],
    deliverables: [
      {
        title: "Workload inventory and dependency map",
        description: "Trace the selected reports through semantic models, schedules, pipelines, tables, and source systems. Record their owners, access requirements, and operating constraints.",
      },
      {
        title: "Target design and pilot scope",
        description: "Compare Fabric Warehouse or Lakehouse options for the workload, flag compatibility gaps, and agree what a representative pilot should demonstrate.",
      },
      {
        title: "Validation and cutover plan",
        description: "Define how to compare source and target data, reconcile agreed measures, test access and refresh, and decide when to switch or revert.",
      },
    ],
    stages: [
      { title: "Define migration success", description: "Agree the reporting workload, deadlines, owners, and checks that must pass." },
      { title: "Assess the current estate", description: "Review dependencies, access, and operational history to locate risks and questions for the pilot." },
      { title: "Scope a representative pilot", description: "Select a workload small enough to test and broad enough to cover the relevant data and reporting dependencies." },
      { title: "Prioritize the migration", description: "Review findings and agree what to move first, what requires redesign, and how to validate each release." },
    ],
    prerequisites: [
      "An owner for the reporting workload and someone who can confirm access rules and business results.",
      "A list of source systems and sample refresh schedules, data volumes, and usage patterns.",
      "Approved visibility into the relevant source and Fabric environments for any pilot work.",
    ],
    scopeDrivers: [
      "Number of data sources, pipelines, models, and downstream reporting dependencies",
      "SQL or pipeline compatibility, data volumes, and workload schedules",
      "Capacity, identity, security, and parallel-run requirements",
    ],
    maintenance:
      "The migration plan names owners for refresh, access, reconciliation, and capacity checks after cutover. Ongoing implementation or support can be scoped separately.",
    questions: [
      {
        question: "Does the assessment include a full migration?",
        answer: "The assessment maps the workload, identifies risks, and defines what to pilot and validate. Implementation is scoped separately after reviewing the findings.",
      },
      {
        question: "Can we keep existing reports running during a migration?",
        answer: "A parallel run may be appropriate for critical reports. The plan specifies how to compare both environments and when the reporting owner can approve switching over.",
      },
    ],
    resources: [
      {
        label: "Cloud migration for analytics teams",
        href: "/blog/cloud-migration-analytics-teams-manual-reports",
        description: "Prepare the data and reporting workflows before moving to a new platform.",
      },
      {
        label: "Building clean Power BI semantic models",
        href: "/blog/semantic-modeling-power-bi-clean-models",
        description: "Review model grain, relationships, and shared metric definitions before changing a reporting platform.",
      },
    ],
    relatedService: { label: "Power BI consulting", href: "/services/power-bi-consulting" },
    translatedLocales: ["en"],
  },
  {
    slug: "ai-document-processing",
    path: "/services/ai-document-processing",
    title: "AI document processing",
    seoTitle: "AI Document Processing Consulting and Automation",
    description:
      "Pilot AI document intake, field extraction, and exception routing with representative examples, accuracy checks, and clear human review.",
    eyebrow: "Applied AI · Document workflows",
    introduction:
      "If finance, operations, or professional services staff spend time opening attachments, copying fields, and routing exceptions, start with one document workflow. We define the outputs users need, test them on approved examples, and work out how they can be reviewed before they reach a business system.",
    need: "ai-automation",
    startingPoint:
      "Pick one document family with a known owner and a repeatable next action. Agree the fields, examples, and conditions that require manual review.",
    fit: [
      "Staff copy predictable fields from incoming PDFs, scans, invoices, or intake forms.",
      "The team needs to classify documents and send them to the right queue or reviewer.",
      "Existing automation struggles when a field is missing, a layout changes, or the input is unreadable.",
    ],
    deliverables: [
      {
        title: "Intake and extraction pilot",
        description: "Use approved document examples to decide where templates, OCR, rules, or an AI model are appropriate. Return agreed fields in a format that reviewers or downstream systems can use.",
      },
      {
        title: "Exception handling and review",
        description: "Route missing, conflicting, or low-confidence values for human review. Agree who can correct a record and when a document must be rejected or escalated.",
      },
      {
        title: "Evaluation and integration plan",
        description: "Compare outputs against accepted examples at the field level. Track exception volume, corrections, cost, and handling time before expanding the scope.",
      },
    ],
    stages: [
      { title: "Map the workflow", description: "Name the intake channel, output systems, reviewers, and errors that matter most." },
      { title: "Test representative inputs", description: "Use approved examples that include common layouts, variations, and difficult documents." },
      { title: "Review the results", description: "Compare against verified fields and agree the thresholds for routing and escalation." },
      { title: "Plan production handoff", description: "Define the access, integration, monitoring, and review ownership required for rollout." },
    ],
    prerequisites: [
      "Approved sample documents and verified outputs for the fields that matter.",
      "An owner who understands the workflow and can set review rules.",
      "Agreed restrictions for sensitive documents, model access, storage, and retention.",
    ],
    scopeDrivers: [
      "Document variation, language, quality, and volume",
      "Depth of validation and review needed for decisions",
      "Access and integration options for intake and downstream systems",
    ],
    maintenance:
      "After rollout, review extraction and routing when document layouts, source systems, or business rules change.",
    questions: [
      {
        question: "Can AI read any incoming document automatically?",
        answer: "Extraction quality depends on format, scan quality, layout, and fields. A representative pilot identifies what can be handled automatically and which cases require review.",
      },
      {
        question: "Do we need to send real documents with our inquiry?",
        answer: "Describe the workflow, document types, and typical volume in your brief. Share files only after access and data-handling arrangements are agreed.",
      },
    ],
    resources: [
      {
        label: "AI document workflows for professional services",
        href: "/blog/ai-document-workflows-professional-services",
        description: "Design considerations for intake, extraction, verification, and reviewing exceptions.",
      },
      {
        label: "Monitoring AI workflows",
        href: "/blog/model-monitoring-ai-workflows",
        description: "How to check quality, cost, and latency after the workflow ships.",
      },
    ],
    relatedService: { label: "AI workflow automation", href: "/services/ai-automation" },
    translatedLocales: ["en"],
  },
];
