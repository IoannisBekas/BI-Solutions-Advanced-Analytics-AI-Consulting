import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { DeviceMockup } from "@/components/DeviceMockup";
import portfolio1 from "@assets/generated_images/modern_website_mockup_for_portfolio_item_1.png";
import portfolio2 from "@assets/generated_images/modern_website_mockup_for_portfolio_item_2.png";
import portfolio3 from "@assets/generated_images/modern_website_mockup_for_portfolio_item_3.png";

const projects = [
  { id: 1, title: "Lumina Fashion", category: "E-commerce", image: portfolio1, size: "large" },
  { id: 2, title: "FinFlow App", category: "Mobile Design", image: portfolio2, size: "small" },
  { id: 3, title: "Archistudio", category: "Branding", image: portfolio3, size: "small" },
  { id: 4, title: "Urban Pulse", category: "Web Development", image: portfolio1, size: "small" },
  { id: 5, title: "Neon Tech", category: "Product Design", image: portfolio2, size: "large" },
];

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8">Selected Work</h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-20">
              A collection of projects that define our approach to digital design and development.
            </p>
          </ScrollReveal>

          {/* Device Mockup Section */}
          <div className="mb-24 pb-12 border-b border-gray-200">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Dashboard Showcases</h2>
              <p className="text-lg text-gray-600 mb-12">
                View our data analytics dashboards across different devices
              </p>
            </ScrollReveal>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 shadow-md">
              <DeviceMockup 
                desktopImage="/dashboard-water.png"
                tabletImage="/dashboard-hr.png"
                mobileImage="/dashboard-audit.png"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <ScrollReveal 
                key={project.id} 
                delay={index * 0.1}
                className={project.size === "large" ? "md:col-span-2" : ""}
              >
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl mb-6 bg-gray-100">
                    <div className={`aspect-[${project.size === "large" ? "21/9" : "4/3"}]`}>
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{project.title}</h3>
                      <p className="text-gray-500">{project.category}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
                      <span className="text-lg leading-none mb-1">↗</span>
                    </div>
                  </div>
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
