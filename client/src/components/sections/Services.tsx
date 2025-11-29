import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cloud, BarChart3, Cpu, Database, Lock, Zap, Users, Briefcase } from "lucide-react";

const services = [
  {
    title: "Digital Transformation & Cloud Migration",
    description: "Migrate from on-premise and Excel-based processes to secure, cloud-native data platforms (Azure, AWS, GCP; Snowflake, BigQuery, Databricks).",
    icon: Cloud,
    color: "from-blue-500 to-blue-600",
    delay: 0.1
  },
  {
    title: "Agile Data & AI Delivery",
    description: "Implement agile operating models with CI/CD pipelines for BI, data engineering, and ML—accelerating time-to-value.",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
    delay: 0.2
  },
  {
    title: "Advanced Analytics & Statistical Modeling",
    description: "Design predictive, prescriptive, and diagnostic analytics using Python/R and SQL, tied to business KPIs and OKRs.",
    icon: BarChart3,
    color: "from-pink-500 to-pink-600",
    delay: 0.3
  },
  {
    title: "Business Intelligence & Data Visualization",
    description: "Build executive dashboards and self-service analytics with Power BI, Tableau, and Looker with governed semantic models.",
    icon: Database,
    color: "from-cyan-500 to-cyan-600",
    delay: 0.4
  },
  {
    title: "Data Strategy, Governance & Privacy",
    description: "Define data strategy covering quality, lineage, cataloging, access controls, and regulatory compliance (GDPR, ISO 27001).",
    icon: Lock,
    color: "from-emerald-500 to-emerald-600",
    delay: 0.5
  },
  {
    title: "MLOps & Productionization",
    description: "Productionize models with feature stores, model registries, monitoring, and automate ETL/ELT pipelines with Airflow and dbt.",
    icon: Cpu,
    color: "from-orange-500 to-orange-600",
    delay: 0.6
  },
  {
    title: "AI Literacy & Change Management",
    description: "Deliver executive briefings and company-wide training to build AI literacy and establish a data-driven culture.",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
    delay: 0.7
  },
  {
    title: "End-to-End Delivery & Managed Services",
    description: "Full project lifecycle from discovery and architecture to build, deployment, and ongoing support with SLAs.",
    icon: Briefcase,
    color: "from-red-500 to-red-600",
    delay: 0.8
  }
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <ScrollReveal width="100%">
            <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight">
              Comprehensive data <br/> solutions for every challenge.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Button variant="outline" className="rounded-full px-6 group">
              View all services <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <ScrollReveal key={index} delay={service.delay} className="h-full">
                <Card className="h-full p-6 border-gray-100 shadow-none hover:shadow-xl hover:border-gray-200 transition-all duration-500 group bg-gray-50/50 hover:bg-white">
                  <div className="mb-6 relative">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} p-2.5 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-full h-full text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold font-heading mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
