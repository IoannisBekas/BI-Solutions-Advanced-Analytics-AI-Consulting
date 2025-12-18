import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { BarChart3, Scale, Handshake } from "lucide-react";

export default function Services() {
  const servicesList = [
    {
      title: "Digital Transformation & Cloud Migration",
      icon: BarChart3,
      items: ["Azure / AWS / GCP", "Snowflake / BigQuery", "Databricks", "Data Platform Architecture"]
    },
    {
      title: "Advanced Analytics & AI",
      icon: Scale,
      items: ["Predictive Modeling", "Statistical Analysis", "ML Engineering", "Python / R / SQL"]
    },
    {
      title: "MLOps & Productionization",
      icon: Handshake,
      items: ["Feature Stores", "Model Registries", "CI/CD Pipelines", "Airflow / dbt"]
    },
    {
      title: "Business Intelligence",
      icon: BarChart3,
      items: ["Power BI / Tableau", "Looker Dashboards", "Semantic Modeling", "Data Governance"]
    },
    {
      title: "Data Strategy & Governance",
      icon: Scale,
      items: ["Data Quality", "Lineage & Cataloging", "Compliance (GDPR)", "Access Controls"]
    },
    {
      title: "AI Literacy & Change Management",
      icon: Handshake,
      items: ["Executive Briefings", "Company-wide Training", "Responsible AI", "Playbooks"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8">Our Expertise</h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-20">
              End-to-end analytics, AI, and data engineering services. From strategy and architecture to delivery and managed support.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {servicesList.map((service, index) => (
              <ScrollReveal key={index} delay={index * 0.05} className="w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <service.icon className="w-8 h-8 text-black" strokeWidth={1.5} />
                    <h2 className="text-xl font-bold">{service.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
