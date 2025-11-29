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
      title: "Accounting & Finance",
      icon: accountingIcon,
      items: ["Tax Planning", "Bookkeeping", "Financial Analysis", "Payroll Management"]
    },
    {
      title: "Legal Counsel",
      icon: legalIcon,
      items: ["Corporate Law", "GDPR Compliance", "Intellectual Property", "Contract Review"]
    },
    {
      title: "Business Consulting",
      icon: consultingIcon,
      items: ["Market Strategy", "Operational Efficiency", "Risk Management", "Digital Transformation"]
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
              We offer a holistic range of professional services designed to help your business thrive in the modern economy.
            </p>
          </ScrollReveal>

          <div className="space-y-24">
            {servicesList.map((service, index) => (
              <ScrollReveal key={index} className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className={`order-2 md:order-${index % 2 === 0 ? '1' : '2'}`}>
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-sm p-4 mb-8">
                      <img src={service.icon} alt={service.title} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6">{service.title}</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      Detailed professional services tailored to your specific industry needs and regulatory requirements.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {service.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                          <div className="w-2 h-2 rounded-full bg-black" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`order-1 md:order-${index % 2 === 0 ? '2' : '1'}`}>
                    <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden relative">
                      <img src={service.icon} alt="" className="w-full h-full object-cover opacity-80 scale-150 blur-3xl absolute inset-0" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <img src={service.icon} alt="" className="w-1/2 h-1/2 object-contain drop-shadow-2xl" />
                      </div>
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
