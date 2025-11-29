import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Cloud, BarChart3, Cpu, Database, Lock, Zap, Users, Briefcase } from "lucide-react";

const servicesList = [
  {
    title: "Digital Transformation & Cloud Migration",
    description: "Migrate to cloud-native data platforms with real-time analytics and collaboration capabilities.",
    icon: Cloud,
    color: "from-blue-500 to-blue-600",
    details: ["Azure / AWS / GCP", "Snowflake / BigQuery / Databricks", "Real-time Analytics", "Scalable Infrastructure"]
  },
  {
    title: "Advanced Analytics & Statistical Modeling",
    description: "Predictive, prescriptive, and diagnostic analytics aligned with business KPIs and OKRs.",
    icon: BarChart3,
    color: "from-pink-500 to-pink-600",
    details: ["Forecasting & Classification", "A/B Testing & Causal Inference", "Python / R / SQL", "Business-Aligned Metrics"]
  },
  {
    title: "Business Intelligence & Data Visualization",
    description: "Executive dashboards and self-service analytics with governed semantic models.",
    icon: Database,
    color: "from-cyan-500 to-cyan-600",
    details: ["Power BI / Tableau / Looker", "Governed Semantic Models", "Row-Level Security", "Certified Datasets"]
  },
  {
    title: "Data Strategy & Governance",
    description: "Define comprehensive data strategy with governance, quality, and compliance frameworks.",
    icon: Lock,
    color: "from-emerald-500 to-emerald-600",
    details: ["GDPR / ISO 27001 Compliance", "Data Quality & Lineage", "Governance Frameworks", "Risk Management"]
  },
  {
    title: "MLOps & Productionization",
    description: "Deploy and monitor ML models at scale with feature stores and drift management.",
    icon: Cpu,
    color: "from-orange-500 to-orange-600",
    details: ["Feature Stores & Model Registry", "Monitoring & Drift Detection", "Airflow / dbt Orchestration", "Automated ETL/ELT"]
  },
  {
    title: "Agile Data & AI Delivery",
    description: "Implement agile operating models with CI/CD for rapid time-to-value.",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
    details: ["SCRUM / KANBAN", "CI/CD Pipelines", "Agile Product Backlog", "Stakeholder Alignment"]
  },
  {
    title: "AI Literacy & Change Management",
    description: "Build organizational AI literacy and data-driven culture with training programs.",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
    details: ["Executive Briefings", "Company-Wide Training", "Responsible AI", "Enablement Playbooks"]
  },
  {
    title: "End-to-End Delivery & Managed Services",
    description: "Full lifecycle project delivery from discovery through production support.",
    icon: Briefcase,
    color: "from-red-500 to-red-600",
    details: ["Project Management", "PMO Services", "Managed Analytics", "SLA-Based Support"]
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8">Our Services</h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-20">
              Comprehensive data and AI solutions covering the entire value chain—from strategy to deployment and ongoing management.
            </p>
          </ScrollReveal>

          <div className="space-y-24">
            {servicesList.map((service, index) => {
              const Icon = service.icon;
              return (
                <ScrollReveal key={index} className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className={`order-2 md:order-${index % 2 === 0 ? '1' : '2'}`}>
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${service.color} p-3 mb-8 shadow-lg`}>
                        <Icon className="w-full h-full text-white" strokeWidth={1.5} />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                        {service.description}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {service.details.map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`order-1 md:order-${index % 2 === 0 ? '2' : '1'}`}>
                      <div className={`aspect-square bg-gradient-to-br ${service.color} rounded-3xl overflow-hidden relative opacity-20`}>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
