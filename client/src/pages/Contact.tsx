import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Loader2, Star, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "0246063d-239b-44b8-96bf-df146771b309",
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          from_name: "BI Solutions Contact Form",
          to_email: "bekasyannis@gmail.com",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully! We'll be in touch soon.");
        reset();
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error("Form submission error:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <ScrollReveal width="100%" className="overflow-visible">
                <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8">Let's Talk</h1>
                <p className="text-xl text-gray-600 mb-12">
                  Have a project in mind? We'd love to hear from you. Send us a message and we'll get back to you shortly.
                </p>

                <div className="space-y-6">
                  <a
                    href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2AmeaTgf0_WRSHIy9kwRUy603-E-4T9Mz8TfQosOodm16fT1pB92IgypC23negth62NxmeY_I2?gv=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-lg hover:text-gray-600 transition-colors group p-2 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold">Book a Consultation</div>
                      <div className="text-gray-500 text-sm">Schedule a meeting with us</div>
                    </div>
                  </a>

                  <a
                    href="https://www.google.com/maps/place/BI+Solutions+%7C+BEKAS+IOANNIS+-+%CE%9C%CE%A0%CE%95%CE%9A%CE%91%CE%A3+%CE%99%CE%A9%CE%91%CE%9D%CE%9D%CE%97%CE%A3/@51.2072,-79.19775,3z/data=!3m1!4b1!4m6!3m5!1s0x8b72b1c0bdff5865:0xc7a521d46d96ec7f!8m2!3d51.2072!4d-79.19775!16s%2Fg%2F11p5znwz2w?entry=ttu&g_ep=EgoyMDI1MDIyNS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-lg hover:text-gray-600 transition-colors group p-2 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold">Visit Us</div>
                      <div className="text-gray-500 text-sm">Find us on Google Maps</div>
                    </div>
                  </a>

                  <div
                    className="flex items-center gap-4 text-lg p-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold">Email Us</div>
                      <div className="text-gray-500 text-sm">Fill in the form</div>
                    </div>
                  </div>

                  <a
                    href="https://g.page/r/CX_slm3UIaXHEAE/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-lg hover:text-gray-600 transition-colors group p-2 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                      <div className="font-bold">Rate Us</div>
                      <div className="text-gray-500 text-sm">Leave a 5-star review</div>
                    </div>
                  </a>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.4} className="bg-gray-50/50 p-8 md:p-12 rounded-3xl border border-gray-100">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Name</label>
                    <Input
                      {...register("name")}
                      placeholder="John Doe"
                      className={`bg-white border-gray-200 h-12 focus-visible:ring-black ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Email</label>
                    <Input
                      {...register("email")}
                      placeholder="john@example.com"
                      className={`bg-white border-gray-200 h-12 focus-visible:ring-black ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Subject</label>
                  <Input
                    {...register("subject")}
                    placeholder="Project Inquiry"
                    className={`bg-white border-gray-200 h-12 focus-visible:ring-black ${errors.subject ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.subject && <span className="text-xs text-red-500">{errors.subject.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Message</label>
                  <Textarea
                    {...register("message")}
                    className={`w-full min-h-[150px] p-4 rounded-md border border-gray-200 bg-white focus-visible:ring-black resize-y ${errors.message ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    placeholder="Tell us about your project..."
                  />
                  {errors.message && <span className="text-xs text-red-500">{errors.message.message}</span>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg bg-black text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
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
