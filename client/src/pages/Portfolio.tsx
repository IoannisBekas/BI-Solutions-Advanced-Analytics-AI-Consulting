import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.png";
import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.png";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.png";
import chaniaTaxImage from "@/assets/partnerships/chania_tax_office.png";

const projects = [
  {
    id: 1,
    title: "UNICEF Audit Reports Dashboard",
    category: "Risk Management / Strategy",
    image: unicefDashboard,
    description: "A comprehensive oversight tool for Member States and senior management to track country-office audits.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/UNICEF%20OIAI%20Country-Office%20Audit%20Reports.md"
  },
  {
    id: 2,
    title: "IAEA Scientific Analysis",
    category: "Data Science / Laboratory Network",
    image: iaeaDashboard,
    description: "Global Water Analysis Laboratory Network dashboard tracking isotope types, measurement accuracy, and result quality.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/IAEA%20-%20Global%20Water%20Analysis%20Laboratory%20Network.md"
  },
  {
    id: 3,
    title: "IFC Talent Strategy",
    category: "HR Analytics / Operations",
    image: ifcDashboard,
    description: "Strategic HR dashboard analyzing global talent acquisition, application sources, and gender distribution.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/World%20Bank%20HR%20Dashboard.md"
  },
  {
    id: 4,
    title: "Chania Tax IKE",
    category: "Strategic Partnership",
    image: chaniaTaxImage,
    description: "Strategic partnership with Chania Tax IKE, delivering advanced analytics and digital transformation solutions.",
    link: "https://chaniatax.gr/"
  }
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
              Transforming complex data into clear, actionable insights through advanced analytics and intuitive design.
            </p>
          </ScrollReveal>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-20">
            {projects.map((project, index) => (
              <ScrollReveal
                key={project.id}
                delay={index * 0.1}
                className="w-full"
              >
                <a
                  href={project.link}
                  target={project.link !== "#" ? "_blank" : undefined}
                  rel={project.link !== "#" ? "noopener noreferrer" : undefined}
                  className={`group block cursor-pointer transition-opacity ${project.link === "#" ? "hover:opacity-100 cursor-default" : "hover:opacity-90"}`}
                  onClick={(e) => project.link === "#" && e.preventDefault()}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-8 bg-gray-100 border border-gray-200">
                    <div className="aspect-[16/9]">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className={`text-3xl font-bold mb-2 ${project.link !== "#" ? "group-hover:underline decoration-2 underline-offset-4" : ""}`}>{project.title}</h3>
                      <p className="text-lg text-gray-500 font-medium mb-4">{project.category}</p>
                      <p className="text-gray-600 max-w-2xl leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    {project.link !== "#" && (
                      <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all flex-shrink-0">
                        <span className="text-xl leading-none mb-1">↗</span>
                      </div>
                    )}
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
