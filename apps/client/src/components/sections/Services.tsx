import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const services = [
  {
    title: "Digital Transformation & Cloud Migration",
    description: "Move from on-premise, Excel-based processes to secure, cloud-native data platforms (Azure, AWS, GCP; Snowflake, BigQuery, Databricks). Enable real-time analytics, collaboration, and scale.",
    path: "/services/digital-transformation-cloud-migration",
    delay: 0.1
  },
  {
    title: "Advanced Analytics & AI Consulting",
    description: "Frame practical AI workflows, predictive analytics, forecasting, classification, and decision-support systems around clear business outcomes and review controls.",
    path: "/services/advanced-analytics-ai",
    delay: 0.2
  },
  {
    title: "BI & Semantic Modeling",
    description: "Build trusted dashboards, reusable semantic models, KPI definitions, access rules, and reporting systems across Power BI, Tableau, Looker, and similar BI tools.",
    path: "/services/business-intelligence-semantic-modeling",
    delay: 0.3
  },
  {
    title: "Website & Web App Development",
    description: "Design and build modern websites, landing pages, booking flows, internal tools, dashboards, and web applications connected to analytics and lead quality.",
    path: "/services/website-app-development",
    delay: 0.4
  }
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <ScrollReveal width="100%">
            <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight">
              Core capabilities to <br /> drive your success.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link href="/services" className="flex items-center gap-2 text-sm font-semibold text-black group hover:gap-3 transition-all">
              View all services
              <div className="w-8 h-[1px] bg-black group-hover:w-12 transition-all" />
            </Link>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ScrollReveal key={index} delay={service.delay} className="h-full">
              <Link href={service.path} className="block h-full">
                <Card className="h-full p-8 border-gray-100 shadow-none hover:shadow-xl hover:border-gray-200 transition-all duration-500 group bg-gray-50/50 hover:bg-white">
                  <h3 className="text-2xl font-bold font-heading mb-4 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-gray-500 leading-relaxed mb-8">
                    {service.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:translate-x-2 transition-transform duration-300">
                    Learn more <div className="w-8 h-[1px] bg-black ml-4 group-hover:w-12 transition-all" />
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
