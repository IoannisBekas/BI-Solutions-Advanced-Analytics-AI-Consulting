import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import {
  projectNeedGroups,
  projectNeedOptions,
  projectTimingOptions,
  resolveProjectNeed,
  resolveProjectTiming,
} from "@/lib/projectIntent";

const serviceNeedMap: Record<string, FormValues["need"]> = {
  "business-intelligence-semantic-modeling": "business-intelligence",
  "ai-business-intelligence": "business-intelligence",
  "advanced-analytics-ai": "ai-automation",
  "ai-strategy-readiness": "ai-automation",
  "ai-automation-consulting": "ai-automation",
  "generative-ai-llm-consulting": "ai-automation",
  "predictive-analytics-machine-learning": "ai-automation",
  "ai-governance-literacy-adoption": "ai-automation",
  "mlops-model-monitoring": "ai-automation",
  "ai-consulting-greece": "ai-automation",
  "data-strategy-governance": "data-strategy",
  "website-app-development": "web-app",
  "content-operations-automation": "content-operations",
  "data-career-enablement-mentorship": "team-enablement",
};

const budgetOptions = [
  "Not decided yet",
  "Under €5,000",
  "€5,000–€15,000",
  "€15,000–€40,000",
  "€40,000+",
] as const;

type FormValues = {
  name: string;
  email: string;
  company: string;
  need: string;
  description: string;
  timing: string;
  budget: string;
  consent: boolean;
};

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/**
 * Where the brief is posted.
 *
 * The site is served as static files, so the bundled Express route at
 * /api/contact only exists when the server is deployed too — on static hosting
 * it answers 403 and every submission fails. Setting VITE_CONTACT_ENDPOINT to a
 * form service (Formspree, Web3Forms) points submissions at that instead, with
 * no code change. Both accept this JSON shape.
 */
const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";

const initialFormValues: FormValues = {
  name: "",
  email: "",
  company: "",
  need: "",
  description: "",
  timing: "",
  budget: "",
  consent: false,
};

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-950 shadow-sm shadow-black/[0.02] outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-2 focus:ring-black/10";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Start a project with BI Solutions Group",
  url: "https://www.bisolutions.group/start-a-project",
  description:
    "Share a business intelligence, AI, data strategy, automation, digital product, content operations, managed support, enablement, or mentorship requirement with BI Solutions Group.",
};

export default function StartProject() {
  const [form, setForm] = useState<FormValues>(initialFormValues);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const hasTrackedStart = useRef(false);
  const hasTrackedValidationError = useRef(false);
  const attribution = useRef({ source: "direct", context: "start-project-page" });
  const isMentorship = form.need === "career-mentorship";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service")?.trim().toLowerCase() || "";
    const product = params.get("product")?.trim().toLowerCase() || "";
    const demo = params.get("demo")?.trim().toLowerCase() || "";
    const article = params.get("article")?.trim() || "";
    const matchingNeed = resolveProjectNeed(
      params.get("need") ||
        serviceNeedMap[service] ||
        (product ? "product-walkthrough" : ""),
    );
    const matchingTiming = resolveProjectTiming(params.get("timing"));

    if (matchingNeed || matchingTiming) {
      setForm((current) => ({
        ...current,
        need: matchingNeed?.value ?? current.need,
        timing: matchingTiming?.label ?? current.timing,
      }));
    }

    let referrer = "direct";
    if (document.referrer) {
      try {
        referrer = new URL(document.referrer).hostname;
      } catch {
        referrer = "referral";
      }
    }

    const contextParts = [
      service && `service:${service}`,
      product && `product:${product}`,
      demo && `demo:${demo}`,
      article && `article:${article}`,
    ].filter(Boolean);

    attribution.current = {
      source: (params.get("source")?.trim() || referrer).slice(0, 200),
      context: (
        params.get("context")?.trim() ||
        contextParts.join(" | ") ||
        "start-project-page"
      ).slice(0, 300),
    };
  }, []);

  const updateField = <Field extends keyof FormValues>(
    field: Field,
    value: FormValues[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const trackFormStart = () => {
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;
    trackEvent("contact_form_start", {
      source: attribution.current.source,
      context: attribution.current.context,
      selected_need: form.need || undefined,
    });
  };

  const handleInvalid = () => {
    if (hasTrackedValidationError.current) return;
    hasTrackedValidationError.current = true;
    trackEvent("contact_form_error", {
      reason: "validation",
      selected_need: form.need || undefined,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    hasTrackedValidationError.current = false;

    const selectedNeed =
      projectNeedOptions.find((option) => option.value === form.need)?.label ??
      form.need;
    const message = [
      `Company or career stage: ${form.company}`,
      `Enquiry type: ${selectedNeed}`,
      `Desired timing: ${form.timing}`,
      isMentorship
        ? "Budget range: Not requested"
        : `Budget range: ${form.budget || "Not provided"}`,
      "Privacy consent: Yes",
      "",
      "Enquiry details:",
      form.description,
      "",
      "Submission context:",
      `Source: ${attribution.current.source}`,
      `Context: ${attribution.current.context}`,
      `Page: ${window.location.pathname}`,
    ].join("\n");

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `New enquiry — ${selectedNeed}`,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Contact request failed with status ${response.status}`);
      }

      setStatus("success");
      trackEvent("contact_form_submit", {
        selected_need: form.need,
        desired_timing: form.timing,
        budget_range: isMentorship
          ? "not_requested"
          : form.budget || "not_provided",
        source: attribution.current.source,
        context: attribution.current.context,
      });
    } catch (error) {
      console.error("Unable to submit project enquiry:", error);
      setStatus("error");
      trackEvent("contact_form_error", {
        reason: "submission",
        selected_need: form.need,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Seo
        title="Start a Project"
        description="Tell BI Solutions Group about your BI, AI, data, automation, web application, or mentorship need and get a considered next step."
        path="/start-a-project"
        keywords={[
          "hire Power BI consultant",
          "international AI consultant",
          "business intelligence project",
          "international data strategy consultant",
          "fractional data leadership",
          "managed analytics support",
          "content operations consulting",
          "corporate AI training",
          "data career mentorship",
        ]}
        structuredData={structuredData}
      />
      <Navbar />

      <main className="relative overflow-hidden pb-24 pt-32 md:pb-32 md:pt-40">
        <div className="bi-hero-backdrop pointer-events-none absolute inset-x-0 top-0 h-[34rem]" />
        <div className="site-container relative grid gap-12 px-6 md:px-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <section className="lg:sticky lg:top-36 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {isMentorship ? "Mentorship enquiry" : "Start a project"}
            </p>
            <h1 className="mt-6 max-w-xl text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              {isMentorship
                ? "Bring your goal. We’ll shape the right next step."
                : "Bring the problem. We’ll clarify the right next step."}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Share the essentials about your reporting, AI, data, automation,
              digital product, content operation, team capability, or career
              goal. Your brief helps make the first conversation focused and
              useful.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-sm">
                <h2 className="text-base font-semibold">A useful starting point</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  A business bottleneck, repeated workflow, reporting gap,
                  product idea, or career goal is enough. You do not need a
                  finished technical specification or learning plan.
                </p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-sm">
                <h2 className="text-base font-semibold">A considered response</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  The brief is reviewed before the next step is suggested. If
                  the work is not a good fit, that will be made clear as well.
                </p>
              </div>
            </div>

          </section>

          <section
            aria-labelledby="project-form-title"
            className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl shadow-black/[0.06] sm:p-8 lg:p-10"
          >
            {status === "success" ? (
              <div
                className="flex min-h-[36rem] flex-col items-start justify-center"
                role="status"
                aria-live="polite"
              >
                <h2 className="text-3xl sm:text-4xl">Your brief was sent.</h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600">
                  Thank you for sharing the context. BI Solutions Group will
                  review the request and follow up using the email address you
                  provided.
                </p>
                <Button asChild variant="outline" className="mt-8 h-11 rounded-full px-6">
                  <Link href="/">Return to the homepage</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 id="project-form-title" className="text-2xl sm:text-3xl">
                  {isMentorship
                    ? "Tell us about your career goals"
                    : "Tell us about the project"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Fields marked with an asterisk are required.
                </p>

                <form
                  className="mt-8 space-y-6"
                  onFocusCapture={trackFormStart}
                  onInvalidCapture={handleInvalid}
                  onSubmit={handleSubmit}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-800">
                      Name <span aria-hidden="true">*</span>
                      <input
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        maxLength={200}
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        className={fieldClassName}
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-800">
                      {isMentorship ? "Email" : "Work email"}{" "}
                      <span aria-hidden="true">*</span>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        className={fieldClassName}
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-gray-800">
                    {isMentorship ? "Current role or career stage" : "Company"}{" "}
                    <span aria-hidden="true">*</span>
                    <input
                      name="company"
                      type="text"
                      autoComplete={isMentorship ? "off" : "organization"}
                      required
                      maxLength={200}
                      value={form.company}
                      onChange={(event) => updateField("company", event.target.value)}
                      placeholder={
                        isMentorship
                          ? "For example: entry level, data analyst, BI developer"
                          : undefined
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-800">
                    What would you like to achieve? <span aria-hidden="true">*</span>
                    <select
                      name="need"
                      required
                      value={form.need}
                      onChange={(event) => updateField("need", event.target.value)}
                      className={fieldClassName}
                    >
                      <option value="" disabled>
                        Select the closest option
                      </option>
                      {projectNeedGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-800">
                    {isMentorship ? "Career goals and support needed" : "Project description"}{" "}
                    <span aria-hidden="true">*</span>
                    <textarea
                      name="description"
                      required
                      rows={7}
                      maxLength={3000}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder={
                        isMentorship
                          ? "What is your current experience, where do you want to go next, and what would you like help with?"
                          : "What needs to improve, who will use the result, and what would a useful outcome look like?"
                      }
                      className={`${fieldClassName} min-h-44 resize-y py-3 leading-relaxed`}
                    />
                  </label>

                  <div
                    className={`grid gap-6 ${isMentorship ? "" : "sm:grid-cols-2"}`}
                  >
                    <label className="text-sm font-medium text-gray-800">
                      Desired timing <span aria-hidden="true">*</span>
                      <select
                        name="timing"
                        required
                        value={form.timing}
                        onChange={(event) =>
                          updateField("timing", event.target.value)
                        }
                        className={fieldClassName}
                      >
                        <option value="" disabled>
                          Select a timeframe
                        </option>
                        {projectTimingOptions.map((option) => (
                          <option key={option.value} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {!isMentorship && (
                      <label className="text-sm font-medium text-gray-800">
                        Budget range <span className="text-gray-400">(optional)</span>
                        <select
                          name="budget"
                          value={form.budget}
                          onChange={(event) =>
                            updateField("budget", event.target.value)
                          }
                          className={fieldClassName}
                        >
                          <option value="">Prefer not to say</option>
                          {budgetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                    <input
                      name="consent"
                      type="checkbox"
                      required
                      checked={form.consent}
                      onChange={(event) =>
                        updateField("consent", event.target.checked)
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-black"
                    />
                    <span>
                      I agree that BI Solutions Group may use this information to
                      respond to my enquiry. See the{" "}
                      <Link
                        href="/privacy-policy"
                        className="font-medium text-black underline decoration-black/20 underline-offset-4 hover:decoration-black"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {status === "error" ? (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-900"
                    >
                      We could not send your brief. Please wait a moment and
                      try again.
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    className="h-12 w-full rounded-full text-base sm:w-auto sm:px-7"
                  >
                    {status === "submitting"
                      ? "Sending…"
                      : isMentorship
                        ? "Send mentorship enquiry"
                        : "Send project brief"}
                    {status !== "submitting" ? (
                      <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                    ) : null}
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
