import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import accountingIcon from "@assets/generated_images/abstract_3d_icon_for_accounting_services.png";
import legalIcon from "@assets/generated_images/abstract_3d_icon_for_legal_services.png";
import consultingIcon from "@assets/generated_images/abstract_3d_icon_for_business_consulting.png";

export default function Services() {
  const servicesList = [
    {
      title: "Digital Transformation & Cloud Migration",
      icon: accountingIcon,
      items: ["Azure / AWS / GCP", "Snowflake / BigQuery", "Databricks", "Data Platform Architecture"]
    },
    {
      title: "Advanced Analytics & AI",
      icon: legalIcon,
      items: ["Predictive Modeling", "Statistical Analysis", "ML Engineering", "Python / R / SQL"]
    },
    {
      title: "MLOps & Productionization",
      icon: consultingIcon,
      items: ["Feature Stores", "Model Registries", "CI/CD Pipelines", "Airflow / dbt"]
    },
    {
      title: "Business Intelligence",
      icon: accountingIcon,
      items: ["Power BI / Tableau", "Looker Dashboards", "Semantic Modeling", "Data Governance"]
    },
    {
      title: "Data Strategy & Governance",
      icon: legalIcon,
      items: ["Data Quality", "Lineage & Cataloging", "Compliance (GDPR)", "Access Controls"]
    },
    {
      title: "AI Literacy & Change Management",
      icon: consultingIcon,
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
                    <h2 className="text-xl font-bold mb-4">{service.title}</h2>
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
