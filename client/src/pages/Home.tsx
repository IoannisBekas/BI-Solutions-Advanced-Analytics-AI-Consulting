import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ServicesSection } from "@/components/sections/Services";
import { ClientMap } from "@/components/sections/ClientMap";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.png";
import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.png";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ServicesSection />

        <ClientMap />

        {/* Selected Works Preview */}
        <section className="py-24 bg-black text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">Selected Works</h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <ScrollReveal delay={0.1}>
                <a
                  href="https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/UNICEF%20OIAI%20Country-Office%20Audit%20Reports.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 border border-white/10">
                    <img
                      src={unicefDashboard}
                      alt="UNICEF Audit Reports Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors">UNICEF Audit Compliance</h3>
                  <p className="text-gray-400 text-sm">Risk Management / Strategy</p>
                </a>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className="lg:mt-12">
                <a
                  href="https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/IAEA%20-%20Global%20Water%20Analysis%20Laboratory%20Network.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 border border-white/10">
                    <img
                      src={iaeaDashboard}
                      alt="IAEA Water Analysis Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors">IAEA Scientific Analysis</h3>
                  <p className="text-gray-400 text-sm">Data Science / Laboratory Network</p>
                </a>
              </ScrollReveal>

              <ScrollReveal delay={0.3} className="lg:mt-24">
                <a
                  href="https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/World%20Bank%20HR%20Dashboard.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 border border-white/10">
                    <img
                      src={ifcDashboard}
                      alt="IFC HR Analyst Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors">IFC Talent Strategy</h3>
                  <p className="text-gray-400 text-sm">HR Analytics / Operations</p>
                </a>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
