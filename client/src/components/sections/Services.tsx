import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const services = [
  {
    title: "Digital Transformation & Cloud Migration",
    description: "Move from on-premise, Excel-based processes to secure, cloud-native data platforms (Azure, AWS, GCP; Snowflake, BigQuery, Databricks). Enable real-time analytics, collaboration, and scale.",
    delay: 0.1
  },
  {
    title: "Advanced Analytics & Statistical Modeling",
    description: "Design predictive, prescriptive, and diagnostic analytics using Python/R and SQL. Forecasting, classification, clustering, A/B testing, causal inference tied to business KPIs and OKRs.",
    delay: 0.2
  },
  {
    title: "Business Intelligence & Data Visualization",
    description: "Build executive dashboards and self-service analytics with Power BI, Tableau, and Looker. Governed semantic models, DAX/MDX, row-level security, certified datasets.",
    delay: 0.3
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ScrollReveal key={index} delay={service.delay} className="h-full">
              <Card className="h-full p-8 border-gray-100 shadow-none hover:shadow-xl hover:border-gray-200 transition-all duration-500 group bg-gray-50/50 hover:bg-white">
                <h3 className="text-2xl font-bold font-heading mb-4 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>

                <p className="text-gray-500 leading-relaxed mb-8">
                  {service.description}
                </p>
                <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:translate-x-2 transition-transform duration-300 cursor-pointer">
                  Learn more <div className="w-8 h-[1px] bg-black ml-4 group-hover:w-12 transition-all" />
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
