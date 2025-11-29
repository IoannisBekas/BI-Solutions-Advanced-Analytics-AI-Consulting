import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ServicesSection } from "@/components/sections/Services";
import { AIAdvisor } from "@/components/sections/AIAdvisor";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import portfolio1 from "@assets/generated_images/modern_website_mockup_for_portfolio_item_1.png";
import portfolio2 from "@assets/generated_images/modern_website_mockup_for_portfolio_item_2.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ServicesSection />
        
        {/* Featured Projects */}
        <section className="py-24 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">Recent Projects</h2>
              <p className="text-gray-400 mt-4 max-w-2xl">
                See how we've helped businesses transform their data operations and unlock new insights.
              </p>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <ScrollReveal delay={0.1}>
                <div className="group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-6">
                    <img 
                      src={portfolio1} 
                      alt="Project 1" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Enterprise Analytics Platform</h3>
                  <p className="text-gray-400 mb-4">Cloud Migration / Data Warehouse</p>
                  <Button variant="link" className="p-0 h-auto text-white hover:text-gray-300">
                    View Case Study →
                  </Button>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2} className="md:mt-24">
                <div className="group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-6">
                    <img 
                      src={portfolio2} 
                      alt="Project 2" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">ML Model Deployment</h3>
                  <p className="text-gray-400 mb-4">MLOps / Predictive Analytics</p>
                  <Button variant="link" className="p-0 h-auto text-white hover:text-gray-300">
                    View Case Study →
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <AIAdvisor />
      </main>
      <Footer />
    </div>
  );
}
