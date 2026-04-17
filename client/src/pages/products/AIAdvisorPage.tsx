import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Loader2, Briefcase, Scale, Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";

type AdvisorLanguage = "greek" | "english";
type AdvisorConfidence = "high" | "medium" | "low";
type AdvisorVerification = "grounded" | "unverified";
type AdvisorSource = {
  title: string;
  uri: string;
};

const roles = [
  {
    id: "accountant",
    label: {
      greek: "Λογιστής",
      english: "Accountant",
    },
    icon: Calculator,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "lawyer",
    label: {
      greek: "Δικηγόρος",
      english: "Lawyer",
    },
    icon: Scale,
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "consultant",
    label: {
      greek: "Σύμβουλος",
      english: "Consultant",
    },
    icon: Briefcase,
    color: "bg-emerald-100 text-emerald-600",
  },
];

const languageOptions: Array<{ id: AdvisorLanguage; label: string }> = [
  { id: "greek", label: "Ελληνικά" },
  { id: "english", label: "English" },
];

const languageCopy: Record<
  AdvisorLanguage,
  {
    languageLabel: string;
    checkingAvailability: string;
    advisorUnavailable: string;
    askRole: (roleLabel: string) => string;
    retry: string;
    responseLabel: string;
    generating: string;
    networkError: string;
    sourcesLabel: string;
    groundedLabel: string;
    unverifiedLabel: string;
    asOfLabel: string;
    confidenceLabel: string;
    requiresReviewLabel: string;
    confidenceValues: Record<AdvisorConfidence, string>;
  }
> = {
  greek: {
    languageLabel: "Γλώσσα Απάντησης",
    checkingAvailability: "Έλεγχος διαθεσιμότητας advisor...",
    advisorUnavailable: "Ο advisor δεν είναι διαθέσιμος αυτή τη στιγμή. Δοκιμάστε ξανά αργότερα.",
    askRole: (roleLabel) => `Ρωτήστε τον ${roleLabel}...`,
    retry: "Επανάληψη",
    responseLabel: "AI Απάντηση",
    generating: "Δημιουργία απάντησης…",
    networkError: "Σφάλμα δικτύου. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.",
    sourcesLabel: "Πηγές",
    groundedLabel: "Επαληθεύτηκε με τρέχουσες διαδικτυακές πηγές.",
    unverifiedLabel: "Δεν ήταν δυνατή η πλήρης επαλήθευση τρεχουσών πηγών για αυτή την απάντηση.",
    asOfLabel: "Ημερομηνία Αναφοράς",
    confidenceLabel: "Επίπεδο Εμπιστοσύνης",
    requiresReviewLabel: "Απαιτείται επαγγελματικός έλεγχος πριν από χρήση.",
    confidenceValues: {
      high: "Υψηλό",
      medium: "Μεσαίο",
      low: "Χαμηλό",
    },
  },
  english: {
    languageLabel: "Response Language",
    checkingAvailability: "Checking advisor availability...",
    advisorUnavailable: "The advisor is currently unavailable. Please try again later.",
    askRole: (roleLabel) => `Ask the ${roleLabel}...`,
    retry: "Retry",
    responseLabel: "AI Response",
    generating: "Generating response…",
    networkError: "Network error. Please check your connection and try again.",
    sourcesLabel: "Sources",
    groundedLabel: "Verified with current web sources.",
    unverifiedLabel: "Current source verification was not fully available for this answer.",
    asOfLabel: "As Of",
    confidenceLabel: "Confidence",
    requiresReviewLabel: "Professional review is recommended before use.",
    confidenceValues: {
      high: "High",
      medium: "Medium",
      low: "Low",
    },
  },
};

const advisorFaqs = [
  {
    question: "What is the Greek AI Professional Advisor best used for?",
    answer:
      "It is best for first-pass professional guidance across accounting, legal, and consulting workflows where teams need structured responses in Greek.",
  },
  {
    question: "Can I rely on responses without review?",
    answer:
      "No. Responses are intended as guided support and should be reviewed by qualified professionals before operational use.",
  },
  {
    question: "How is this different from a generic AI chat?",
    answer:
      "It uses role-specific prompts and domain framing for Greek professional contexts instead of a broad one-size-fits-all assistant.",
  },
];

export default function AIAdvisorPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0].id);
  const [language, setLanguage] = useState<AdvisorLanguage>("greek");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<AdvisorSource[]>([]);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<AdvisorConfidence>("low");
  const [requiresReview, setRequiresReview] = useState(false);
  const [refusalReason, setRefusalReason] = useState<string | null>(null);
  const [verification, setVerification] = useState<AdvisorVerification>("unverified");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [advisorStatus, setAdvisorStatus] = useState<"checking" | "ready" | "unavailable">("checking");
  const abortRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<{ role: string; question: string; language: AdvisorLanguage } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAdvisorAvailability() {
      try {
        const res = await fetch("/api/ai-advisor/health");
        if (!res.ok) {
          throw new Error("Unable to load advisor status.");
        }

        const data = await res.json() as { configured?: boolean };
        if (!cancelled) {
          setAdvisorStatus(data.configured ? "ready" : "unavailable");
        }
      } catch (error) {
        console.error("AI Advisor status error:", error);
        if (!cancelled) {
          setAdvisorStatus("unavailable");
        }
      }
    }

    void checkAdvisorAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  const submitRequest = useCallback(async (role: string, q: string, requestLanguage: AdvisorLanguage) => {
    if (advisorStatus !== "ready") {
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setResponse(null);
    setSources([]);
    setAsOf(null);
    setConfidence("low");
    setRequiresReview(false);
    setRefusalReason(null);
    setVerification("unverified");
    setErrorMsg(null);
    lastRequestRef.current = { role, question: q, language: requestLanguage };

    try {
      const res = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question: q, language: requestLanguage }),
        signal: controller.signal,
      });

      const data = await res.json() as {
        success?: boolean;
        answer?: string;
        error?: string;
        code?: string;
        sources?: AdvisorSource[];
        verification?: AdvisorVerification;
        asOf?: string | null;
        confidence?: AdvisorConfidence;
        requiresReview?: boolean;
        refusalReason?: string | null;
      };

      if (data.success) {
        setAdvisorStatus("ready");
        setResponse(data.answer ?? "No response generated.");
        setSources(Array.isArray(data.sources) ? data.sources : []);
        setAsOf(typeof data.asOf === "string" ? data.asOf : null);
        setConfidence(
          data.confidence === "high" || data.confidence === "medium" || data.confidence === "low"
            ? data.confidence
            : "low",
        );
        setRequiresReview(Boolean(data.requiresReview));
        setRefusalReason(typeof data.refusalReason === "string" && data.refusalReason ? data.refusalReason : null);
        setVerification(data.verification === "grounded" ? "grounded" : "unverified");
      } else {
        if (data.code === "ADVISOR_UNAVAILABLE" || res.status === 503) {
          setAdvisorStatus("unavailable");
          setErrorMsg(null);
          return;
        }

        setErrorMsg(data.error || "Unable to process your request. Please try again.");
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("AI Advisor error:", error);
      setErrorMsg(languageCopy[requestLanguage].networkError);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [advisorStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || advisorStatus !== "ready") return;
    submitRequest(selectedRole, question.trim(), language);
  };

  const handleRetry = () => {
    if (lastRequestRef.current) {
      submitRequest(
        lastRequestRef.current.role,
        lastRequestRef.current.question,
        lastRequestRef.current.language,
      );
    }
  };

  const copy = languageCopy[language];
  const selectedRoleLabel = roles.find((role) => role.id === selectedRole)?.label[language];
  const isAdvisorChecking = advisorStatus === "checking";
  const isAdvisorUnavailable = advisorStatus === "unavailable";
  const inputPlaceholder = isAdvisorChecking
    ? copy.checkingAvailability
    : isAdvisorUnavailable
      ? copy.advisorUnavailable
      : copy.askRole(selectedRoleLabel ?? "");

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Greek AI Professional Advisor | AI Guidance for Professional Teams"
        description="Ask role-based AI questions for accounting, legal, and consulting workflows with Greek-language guidance and domain framing."
        path={PRODUCT_ROUTE_ALIASES.aiAdvisor}
        keywords={[
          "Greek AI Professional Advisor",
          "AI for accountants Greece",
          "AI legal assistant Greece",
          "AI consulting guidance",
          "Greek professional AI workflows",
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: "Greek AI Professional Advisor",
              url: `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.aiAdvisor}`,
              description:
                "Role-based AI guidance for accounting, legal, and consulting workflows.",
            },
            {
              "@type": "Service",
              name: "Greek AI Professional Advisor",
              serviceType: "Professional AI workflow guidance",
              provider: {
                "@type": "Organization",
                name: "BI Solutions Group",
              },
              areaServed: {
                "@type": "Country",
                name: "Greece",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: advisorFaqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://bisolutions.group/" },
                { "@type": "ListItem", position: 2, name: "Products", item: "https://bisolutions.group/products" },
                { "@type": "ListItem", position: 3, name: "Greek AI Professional Advisor", item: `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.aiAdvisor}` },
              ],
            },
          ],
        }}
      />
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <ScrollReveal className="text-center mb-12" width="100%">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white mb-6 shadow-lg shadow-black/20">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-4xl font-bold font-heading mb-4">Greek AI Professional Advisor</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Select a professional role and ask a question. Our AI, trained on Greek law and business practices, will provide an initial guidance.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} width="100%">
              <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-xl p-2 md:p-8 rounded-2xl overflow-hidden">
                
                {/* Role Selection */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 bg-gray-100/50 p-1.5 rounded-xl">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setSelectedRole(role.id);
                          setResponse(null);
                          setSources([]);
                          setAsOf(null);
                          setConfidence("low");
                          setRequiresReview(false);
                          setRefusalReason(null);
                          setVerification("unverified");
                        }}
                        className={cn(
                          "flex flex-col md:flex-row items-center justify-center gap-2 py-3 md:py-4 px-2 rounded-lg transition-all duration-300 relative overflow-hidden",
                          isSelected ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isSelected ? "text-black" : "text-current")} />
                        <span className="text-xs md:text-sm font-medium">{role.label[language]}</span>
                        {isSelected && (
                          <motion.div
                            layoutId="activeRole"
                            className="absolute inset-0 border-2 border-black/5 rounded-lg pointer-events-none"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Chat Interface */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {copy.languageLabel}
                    </p>
                    <div className="inline-flex w-fit rounded-full bg-gray-100 p-1">
                      {languageOptions.map((option) => {
                        const isSelected = option.id === language;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setLanguage(option.id);
                              setResponse(null);
                              setSources([]);
                              setAsOf(null);
                              setConfidence("low");
                              setRequiresReview(false);
                              setRefusalReason(null);
                              setVerification("unverified");
                              setErrorMsg(null);
                            }}
                            className={cn(
                              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                              isSelected
                                ? "bg-white text-black shadow-sm"
                                : "text-gray-500 hover:text-gray-800",
                            )}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                     <div className="relative">
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={inputPlaceholder}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        enterKeyHint="send"
                        data-gramm="false"
                        data-gramm_editor="false"
                        data-enable-grammarly="false"
                        disabled={isAdvisorChecking || isAdvisorUnavailable || isLoading}
                        className="h-14 pl-4 pr-14 text-lg bg-white border-gray-200 focus:ring-black/10 focus:border-black transition-all rounded-xl shadow-sm"
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={!question.trim() || isLoading || isAdvisorChecking || isAdvisorUnavailable}
                        className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-black hover:bg-gray-800 text-white transition-all"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                     </div>
                  </form>

                  {isAdvisorUnavailable && (
                    <motion.div
                      key="advisor-unavailable"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                    >
                      {copy.advisorUnavailable}
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {errorMsg && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-200 text-sm flex items-center justify-between gap-4"
                      >
                        <span>{errorMsg}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetry}
                          className="flex-shrink-0 gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> {copy.retry}
                        </Button>
                      </motion.div>
                    )}
                    {isLoading && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-black/10" />
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <p className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                              {copy.responseLabel} ({roles.find((role) => role.id === selectedRole)?.label[language]})
                            </p>
                            <div className="space-y-2.5 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded-md w-full" />
                              <div className="h-4 bg-gray-200 rounded-md w-5/6" />
                              <div className="h-4 bg-gray-200 rounded-md w-4/6" />
                            </div>
                            <p className="text-xs text-gray-400 mt-3">{copy.generating}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {response && (
                      <motion.div
                        key="response"
                        initial={{ opacity: 0, height: 0, y: 20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-black/10" />
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="space-y-2">
                              <p className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                                {copy.responseLabel} ({roles.find((role) => role.id === selectedRole)?.label[language]})
                              </p>
                              <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                                {response}
                              </p>
                              <div className="pt-2">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    verification === "grounded" ? "text-emerald-700" : "text-amber-700",
                                  )}
                                >
                                  {verification === "grounded" ? copy.groundedLabel : copy.unverifiedLabel}
                                </p>
                              </div>
                              {(asOf || refusalReason || requiresReview) && (
                                <div className="grid gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                                  {asOf && (
                                    <p>
                                      <span className="font-semibold text-gray-900">{copy.asOfLabel}:</span> {asOf}
                                    </p>
                                  )}
                                  <p>
                                    <span className="font-semibold text-gray-900">{copy.confidenceLabel}:</span>{" "}
                                    {copy.confidenceValues[confidence]}
                                  </p>
                                  {requiresReview && (
                                    <p className="font-medium text-amber-700">{copy.requiresReviewLabel}</p>
                                  )}
                                  {refusalReason && (
                                    <p className="font-medium text-amber-700">{refusalReason}</p>
                                  )}
                                </div>
                              )}
                              {sources.length > 0 && (
                                <div className="pt-3">
                                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                    {copy.sourcesLabel}
                                  </p>
                                  <div className="mt-3 space-y-2">
                                    {sources.map((source) => (
                                      <a
                                        key={source.uri}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                                      >
                                        <span className="block font-medium text-gray-900">{source.title}</span>
                                        <span className="mt-1 block break-all text-xs text-gray-500">{source.uri}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-4xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <Card className="rounded-2xl border-gray-200 bg-white p-6 shadow-lg md:p-8">
              <h2 className="text-3xl font-bold font-heading tracking-tight">Advisor FAQ</h2>
              <div className="mt-5 space-y-4">
                {advisorFaqs.map((faq) => (
                  <div key={faq.question} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
