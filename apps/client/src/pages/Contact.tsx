import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowRight,
  Calendar,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PublicPageHero } from "@/components/sections/PublicPageHero";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const contactSummary = [
  {
    label: "Response style",
    value: "Direct scoping for analytics, AI, BI, and product work",
  },
  {
    label: "Meeting options",
    value: "Async review, call, or a structured consultation slot",
  },
  {
    label: "Best fit",
    value: "Teams that need a concrete next step, not generic advice",
  },
];

const contactMethods = [
  {
    icon: Calendar,
    title: "Book a consultation",
    description: "Schedule a focused session to scope the work or review the current bottleneck.",
    href: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2AmeaTgf0_WRSHIy9kwRUy603-E-4T9Mz8TfQosOodm16fT1pB92IgypC23negth62NxmeY_I2?gv=true",
    external: true,
  },
  {
    icon: MapPin,
    title: "Visit us",
    description: "See the business profile and location details on Google Maps.",
    href: "https://www.google.com/maps?cid=14385966453624892543",
    external: true,
  },
  {
    icon: Star,
    title: "Read and leave a review",
    description: "Check client feedback or add your own rating after a project.",
    href: "https://g.page/r/CX_slm3UIaXHEAE/review",
    external: true,
  },
];

const inquiryChecklist = [
  "What you are trying to improve or launch",
  "The current tooling or workflow involved",
  "Any deadline, rollout window, or operating constraint",
  "Whether you need advisory support, implementation, or both",
];

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Message sent successfully. We will be in touch soon.");
        reset();
      } else {
        toast.error(result.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Contact BI Solutions"
        description="Contact BI Solutions Group to discuss analytics strategy, Power BI projects, AI consulting, or product partnerships."
        path="/contact"
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={MessageSquare}
          eyebrow="Start the conversation"
          title="Bring the problem, the product idea, or the system that needs to work better."
          description="BI Solutions can help scope analytics delivery, AI implementation, reporting modernization, semantic-model review, or a focused product build. The fastest path is to describe the bottleneck and the outcome you need."
          footer={
            <div className="grid gap-4 md:grid-cols-3">
              {contactSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base font-medium leading-relaxed text-gray-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <section className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;

                return (
                  <ScrollReveal key={method.title} delay={index * 0.06} width="100%">
                    <a
                      href={method.href}
                      target={method.external ? "_blank" : undefined}
                      rel={method.external ? "noopener noreferrer" : undefined}
                      className="block rounded-[2rem] border border-gray-200 bg-white px-6 py-6 shadow-xl shadow-black/[0.04] transition-transform hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold font-heading tracking-tight text-gray-950">
                            {method.title}
                          </h2>
                          <p className="mt-3 text-base leading-relaxed text-gray-600">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  </ScrollReveal>
                );
              })}

              <ScrollReveal delay={0.22} width="100%">
                <div className="rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Mail className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-heading tracking-tight text-gray-950">
                        What to include in the message
                      </h2>
                      <p className="mt-3 text-base leading-relaxed text-gray-600">
                        A short, concrete brief makes the first response much more useful.
                      </p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {inquiryChecklist.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal width="100%">
              <div className="rounded-[2rem] border border-gray-200 bg-white px-6 py-6 shadow-2xl shadow-black/[0.06] md:px-8 md:py-8">
                <div className="border-b border-gray-100 pb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Send a message
                  </p>
                  <h2 className="mt-3 text-3xl font-bold font-heading tracking-tight text-gray-950">
                    Tell us what needs to move.
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-gray-600">
                    This form is best for project scoping, product questions,
                    partnerships, and implementation requests.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Name
                      </label>
                      <Input
                        {...register("name")}
                        placeholder="John Doe"
                        className={`h-12 border-gray-200 bg-gray-50 focus-visible:ring-black ${
                          errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      {errors.name ? (
                        <span className="text-xs text-red-500">{errors.name.message}</span>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Email
                      </label>
                      <Input
                        {...register("email")}
                        placeholder="john@example.com"
                        className={`h-12 border-gray-200 bg-gray-50 focus-visible:ring-black ${
                          errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      {errors.email ? (
                        <span className="text-xs text-red-500">{errors.email.message}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Subject
                    </label>
                    <Input
                      {...register("subject")}
                      placeholder="Project inquiry"
                      className={`h-12 border-gray-200 bg-gray-50 focus-visible:ring-black ${
                        errors.subject ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                    />
                    {errors.subject ? (
                      <span className="text-xs text-red-500">{errors.subject.message}</span>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Message
                    </label>
                    <Textarea
                      {...register("message")}
                      placeholder="Describe the workflow, system, or product you want to improve."
                      className={`min-h-[180px] resize-y border-gray-200 bg-gray-50 p-4 focus-visible:ring-black ${
                        errors.message ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                    />
                    {errors.message ? (
                      <span className="text-xs text-red-500">{errors.message.message}</span>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-full bg-black text-base text-white hover:bg-gray-800"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send message"
                    )}
                  </Button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
