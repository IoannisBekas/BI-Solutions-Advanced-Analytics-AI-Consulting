import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <ScrollReveal>
                <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8">Let's Talk</h1>
                <p className="text-xl text-gray-600 mb-12">
                  Have a project in mind? We'd love to hear from you. Send us a message and we'll get back to you shortly.
                </p>
              </ScrollReveal>

              <div className="space-y-8">
                <ScrollReveal delay={0.1}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Email</h3>
                      <p className="text-gray-600">hello@cactusclone.com</p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Phone</h3>
                      <p className="text-gray-600">+30 210 1234567</p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.3}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Office</h3>
                      <p className="text-gray-600">Kifisias Avenue 100<br/>Athens, Greece 11526</p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>

            <ScrollReveal delay={0.4} className="bg-gray-50 p-8 md:p-12 rounded-3xl">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Name</label>
                    <Input placeholder="John Doe" className="bg-white border-gray-200 h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Email</label>
                    <Input placeholder="john@example.com" className="bg-white border-gray-200 h-12" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Subject</label>
                  <Input placeholder="Project Inquiry" className="bg-white border-gray-200 h-12" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Message</label>
                  <textarea 
                    className="w-full min-h-[150px] p-4 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-y" 
                    placeholder="Tell us about your project..."
                  />
                </div>

                <Button className="w-full h-14 text-lg bg-black text-white hover:bg-gray-800 rounded-lg transition-all">
                  Send Message
                </Button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
