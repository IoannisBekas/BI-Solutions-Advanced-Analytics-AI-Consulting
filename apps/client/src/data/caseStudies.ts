import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.webp";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.webp";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.webp";

export interface CaseStudySnapshotItem {
  label: string;
  value: string;
}

export interface CaseStudy {
  slug: string;
  translatedLocales?: readonly ("en" | "el" | "de")[];
  title: string;
  cardTitle: string;
  seoTitle: string;
  seoDescription: string;
  relationship: string;
  relationshipNote: string;
  summary: string;
  challenge: string;
  image: string;
  imageAlt: string;
  snapshot: CaseStudySnapshotItem[];
  constraints: string[];
  approach: string[];
  delivered: string[];
  outcomes: string[];
  evidenceLabel: string;
  evidenceSource?: "github" | "linkedin";
  evidenceCtaLabel?: string;
  evidenceHref: string;
  evidenceDescription: string;
  relatedService: {
    label: string;
    href: string;
  };
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "risenfire-workforce-reporting",
    title: "Power BI workforce and capacity reporting for Risenfire",
    cardTitle: "Risenfire workforce & capacity reporting",
    seoTitle: "Risenfire Power BI Workforce Reporting Case Study",
    seoDescription: "How BI Solutions Group built Power BI workload and availability reporting for Risenfire, connecting Dataverse data with a refreshed reporting layer.",
    relationship: "Client project · Public delivery account",
    relationshipNote: "Risenfire is a fire safety and suppression company in Orangeville, Ontario. This account uses only the project information already published by BI Solutions Group on LinkedIn. The illustration explains the reported workflow; it is not a client dashboard screenshot. No quantified business outcome is claimed.",
    summary: "A Power BI workload and availability dashboard connecting operational data from Common Data Service / Dataverse to a centralized reporting layer for team capacity, scheduled work, and project workload.",
    challenge: "Risenfire needed a clearer view of who was booked, who had hours available, and where the workload was coming from. The project addressed an HR analytics and workload-management challenge, with the goal of replacing manual tracking with a refreshed reporting process.",
    image: "/assets/case-studies/risenfire-workflow.svg",
    imageAlt: "Workflow illustration of Dataverse operational data feeding a Power BI semantic model and workforce reporting for Risenfire; not a dashboard screenshot",
    snapshot: [
      { label: "Client", value: "Risenfire · Orangeville, Ontario" },
      { label: "Sector context", value: "Fire safety and suppression" },
      { label: "Platform", value: "Power BI Service and Dataverse" },
      { label: "Reporting focus", value: "Worker availability and project capacity" },
    ],
    constraints: [
      "Bring availability, scheduled work, and project workload into one reporting view.",
      "Keep operational reporting connected to its data source and refresh status.",
      "Make the reporting usable for executive review and mobile access.",
    ],
    approach: [
      "Designed the Power BI semantic model and connected Common Data Service / Dataverse as the backend data source.",
      "Worked on database management and data validation, scheduled refresh configuration, and Power BI Service lineage review.",
      "Organized worker availability, capacity, scheduled planned work, assigned hours, remaining workload, and project details into a centralized reporting layer.",
    ],
    delivered: [
      "A Power BI workforce workload and availability dashboard.",
      "Dataverse connectivity, a semantic model, and scheduled refresh configuration.",
      "Capacity and project reporting with executive usability and mobile friendliness considered in delivery.",
    ],
    outcomes: [
      "The published project account describes a centralized view of worker availability, scheduled work, assigned hours, remaining workload, project details, and refresh status.",
      "The intended operational benefit was to replace manual tracking with refreshed reporting. Time savings, financial returns, and adoption results have not been quantified in this public account.",
    ],
    evidenceLabel: "Read the public project account",
    evidenceSource: "linkedin",
    evidenceCtaLabel: "View the LinkedIn project account",
    evidenceHref: "https://www.linkedin.com/posts/ioannisbekas_heres-what-we-managed-to-do-with-dave-parfitt-activity-7482097945606062080-MgQz",
    evidenceDescription: "The founder's public LinkedIn post shares the BI Solutions Group delivery account. It is a first-party account of the project, rather than an independent review or a public dashboard.",
    translatedLocales: ["en"],
    relatedService: { label: "Power BI consulting", href: "/services/power-bi-consulting" },
  },
  {
    slug: "unicef-audit-compliance",
    title: "A clearer way to explore country-office audit risk and implementation",
    cardTitle: "UNICEF-style audit compliance dashboard",
    seoTitle: "Audit Compliance Power BI Case Study",
    seoDescription:
      "An independent Power BI analysis showing how audit ratings, risks, expenditure, and recommendation progress fit into one reporting flow.",
    relationship: "Independent portfolio analysis",
    relationshipNote:
      "This demonstration was created independently with mock data. It was not commissioned by, affiliated with, or endorsed by UNICEF.",
    summary:
      "A four-page Power BI demonstration that brings audit ratings, country risk, expenditure, and recommendation implementation into one navigable reporting experience.",
    challenge:
      "Country-office audit reporting spans several audiences and questions: where risk is concentrated, how audit ratings vary, and whether recommendations are being implemented. The portfolio brief was to make those questions explorable without losing the detail behind each office.",
    image: unicefDashboard,
    imageAlt:
      "Independent Power BI demonstration of a country-office audit compliance dashboard",
    snapshot: [
      { label: "Sector context", value: "International development and audit" },
      { label: "Role", value: "Independent dashboard design and development" },
      { label: "Format", value: "Four-page interactive Power BI report" },
      { label: "Data", value: "Synthetic demonstration dataset" },
    ],
    constraints: [
      "Separate high-level oversight from the detail required to investigate one office.",
      "Represent audit ratings, expenditure, geography, and implementation status in a coherent flow.",
      "Use synthetic data while preserving a realistic reporting structure.",
    ],
    approach: [
      "Started with the decisions each audience would need to make, then separated overview, risk, and implementation views.",
      "Used consistent year, status, and observation-group filters so questions can carry across report pages.",
      "Connected map views with detailed tables to keep geographic patterns traceable to underlying records.",
    ],
    delivered: [
      "An executive landing page with audit-result summaries and a global office map.",
      "An audit overview with rating, expenditure, status, and country-level detail.",
      "A geographic risk map aligned with the same filter context.",
      "An implementation tracker for recommendations made, completed, and outstanding.",
    ],
    outcomes: [
      "A single demonstration flow for moving from portfolio-level audit status to country-office detail.",
      "Clear separation between audit outcomes, mapped risk, and recommendation follow-through.",
      "A reusable example of how Power BI can support governance and compliance reporting.",
    ],
    evidenceLabel: "View the project notes on GitHub",
    evidenceHref:
      "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/UNICEF%20OIAI%20Country-Office%20Audit%20Reports.md",
    evidenceDescription:
      "The public project notes document the report pages, filters, mock-data status, and interactive demonstration.",
    relatedService: {
      label: "Business Intelligence & Power BI",
      href: "/services#business-intelligence-semantic-modeling",
    },
  },
  {
    slug: "iaea-scientific-analysis",
    title: "Global laboratory measurements made comparable across place and time",
    cardTitle: "IAEA-style scientific analysis dashboard",
    seoTitle: "Scientific Analysis Power BI Case Study",
    seoDescription:
      "An independent Power BI portfolio analysis showing a global water laboratory monitoring experience across regions, dates, water types, and isotope measures.",
    relationship: "Independent portfolio analysis",
    relationshipNote:
      "This demonstration was created independently with representative laboratory data. It was not commissioned by, affiliated with, or endorsed by the IAEA.",
    summary:
      "An interactive monitoring concept for comparing isotope concentration, temperature, pH, and measurement context across laboratories, regions, and time periods.",
    challenge:
      "Scientific monitoring data becomes difficult to compare when laboratories, geographies, dates, water types, and measurement dimensions all need to remain visible. The portfolio brief was to create a compact view that supports both global scanning and specific comparisons.",
    image: iaeaDashboard,
    imageAlt:
      "Independent Power BI demonstration of a global water laboratory analysis dashboard",
    snapshot: [
      { label: "Sector context", value: "Scientific and environmental monitoring" },
      { label: "Role", value: "Independent dashboard design and development" },
      { label: "Format", value: "Interactive Power BI monitoring view" },
      { label: "Data", value: "Representative demonstration measurements" },
    ],
    constraints: [
      "Preserve the context of region, country, date, water type, isotope, and measurement accuracy.",
      "Make time-series behavior readable without hiding the current pH and temperature context.",
      "Fit a broad monitoring workflow into one focused analytical interface.",
    ],
    approach: [
      "Organized the interface around comparison dimensions that a scientific user would repeatedly change.",
      "Paired filterable time-series charts with current summary measures for faster orientation.",
      "Kept region and country selection explicit so global patterns remain connected to local observations.",
    ],
    delivered: [
      "Region and country filters spanning Africa, the Americas, Asia, and Europe.",
      "Date, water-type, isotope-type, and measurement-accuracy controls.",
      "Time-series views for isotope concentration and temperature.",
      "A current average pH indicator and an integrated feedback entry point.",
    ],
    outcomes: [
      "A coherent demonstration of global-to-local laboratory monitoring in Power BI.",
      "Comparable views across location, time, water type, and measurement context.",
      "A reusable reporting pattern for environmental, scientific, and quality-control datasets.",
    ],
    evidenceLabel: "View the project notes on GitHub",
    evidenceHref:
      "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/IAEA%20-%20Global%20Water%20Analysis%20Laboratory%20Network.md",
    evidenceDescription:
      "The public project notes document the filters, measurements, representative-data status, and interactive demonstration.",
    relatedService: {
      label: "Business Intelligence & Power BI",
      href: "/services#business-intelligence-semantic-modeling",
    },
  },
  {
    slug: "ifc-talent-strategy",
    title: "Recruitment data connected from application funnel to candidate detail",
    cardTitle: "IFC-style talent analytics dashboard",
    seoTitle: "Talent Analytics Power BI Case Study",
    seoDescription:
      "An independent Power BI analysis showing how recruitment activity, funnel stages, sources, and applicant detail work together.",
    relationship: "Independent portfolio analysis",
    relationshipNote:
      "This demonstration was created independently with fully synthetic data. It was not commissioned by, affiliated with, or endorsed by IFC or the World Bank Group.",
    summary:
      "A two-page Power BI demonstration connecting global recruitment activity and funnel analysis with drill-through applicant, role, interview, and hiring detail.",
    challenge:
      "Recruitment reporting must serve several levels at once: leadership needs a global funnel view, while recruiters and hiring managers need to inspect an individual application. The portfolio brief was to connect both without turning the dashboard into a dense data table.",
    image: ifcDashboard,
    imageAlt:
      "Independent Power BI demonstration of a global talent acquisition dashboard",
    snapshot: [
      { label: "Sector context", value: "Global talent acquisition" },
      { label: "Role", value: "Independent dashboard design and development" },
      { label: "Format", value: "Two-page interactive Power BI report" },
      { label: "Data", value: "Fully synthetic demonstration dataset" },
    ],
    constraints: [
      "Connect leadership-level recruitment activity with record-level applicant investigation.",
      "Keep source, location, diversity, qualifications, and funnel status available for comparison.",
      "Model realistic recruitment logic without using personal or organizational data.",
    ],
    approach: [
      "Structured the first page around the application funnel and the dimensions that influence it.",
      "Used a dedicated drill-through page to protect readability while preserving applicant detail.",
      "Grouped candidate, job, interview, and hiring information into a consistent review flow.",
    ],
    delivered: [
      "A global application funnel from applied through screened, interviewed, and hired.",
      "Breakdowns for candidate source, gender, education, referral, relocation, and location.",
      "A drill-through applicant view with experience, salary, assessment, and feedback context.",
      "Role metadata covering recruiter, department, grade, and employment type.",
    ],
    outcomes: [
      "A clear demonstration of how strategic workforce indicators and operational applicant detail can coexist.",
      "A traceable path from funnel patterns to the underlying candidate and role context.",
      "A reusable Power BI pattern for recruitment, workforce planning, and talent intelligence.",
    ],
    evidenceLabel: "View the project notes on GitHub",
    evidenceHref:
      "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/World%20Bank%20HR%20Dashboard.md",
    evidenceDescription:
      "The public project notes document the report pages, recruitment logic, synthetic-data status, and interactive demonstration.",
    relatedService: {
      label: "Business Intelligence & Power BI",
      href: "/services#business-intelligence-semantic-modeling",
    },
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((caseStudy) => caseStudy.slug === slug);
}
