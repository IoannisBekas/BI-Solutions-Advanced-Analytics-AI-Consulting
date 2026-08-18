import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.png";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.png";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.png";

export interface CaseStudySnapshotItem {
  label: string;
  value: string;
}

export interface CaseStudy {
  slug: string;
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
  evidenceHref: string;
  evidenceDescription: string;
  relatedService: {
    label: string;
    href: string;
  };
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "unicef-audit-compliance",
    title: "A clearer way to explore country-office audit risk and implementation",
    cardTitle: "UNICEF-style audit compliance dashboard",
    seoTitle: "Audit Compliance Power BI Case Study",
    seoDescription:
      "An independent Power BI portfolio analysis showing how country-office audit ratings, risks, expenditure, and recommendation progress can be explored in one reporting flow.",
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
      "An independent Power BI portfolio analysis showing how recruitment activity, funnel stages, candidate sources, diversity, and applicant detail can work together.",
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
