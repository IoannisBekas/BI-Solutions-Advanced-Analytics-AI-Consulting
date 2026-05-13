import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Loader2, Briefcase, Scale, Calculator, Languages, ShieldCheck, TriangleAlert, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdvisorRoleId = "accountant" | "lawyer" | "consultant";
type AdvisorLanguage = "greek" | "english";
type AdvisorVerification = "grounded" | "unverified";
type AdvisorConfidence = "high" | "medium" | "low";

type AdvisorSource = {
  title: string;
  uri: string;
};

type AdvisorResponse = {
  success?: boolean;
  answer?: string;
  sources?: AdvisorSource[];
  verification?: AdvisorVerification;
  asOf?: string | null;
  confidence?: AdvisorConfidence;
  requiresReview?: boolean;
  refusalReason?: string | null;
  error?: string;
  message?: string;
};

const roles: Array<{ id: AdvisorRoleId; label: string; englishLabel: string; icon: typeof Calculator }> = [
  { id: "accountant", label: "Λογιστής", englishLabel: "accountant", icon: Calculator },
  { id: "lawyer", label: "Δικηγόρος", englishLabel: "lawyer", icon: Scale },
  { id: "consultant", label: "Σύμβουλος", englishLabel: "consultant", icon: Briefcase },
];

const languages: Array<{ id: AdvisorLanguage; label: string }> = [
  { id: "greek", label: "EL" },
  { id: "english", label: "EN" },
];

function getAdvisorError(data: AdvisorResponse, status: number) {
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (status === 429) {
    return "Rate limit reached. Please wait a moment and try again.";
  }
  return "Unable to process your request. Please try again.";
}

export function AIAdvisor() {
  const [selectedRole, setSelectedRole] = useState<AdvisorRoleId>(roles[0].id);
  const [language, setLanguage] = useState<AdvisorLanguage>("greek");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const selectedRoleMeta = roles.find(r => r.id === selectedRole) || roles[0];

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
          question: question.trim(),
          language,
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({})) as AdvisorResponse;

      if (!res.ok || !data.success || typeof data.answer !== "string") {
        setError(getAdvisorError(data, res.status));
        return;
      }

      setResponse({
        ...data,
        sources: Array.isArray(data.sources) ? data.sources : [],
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("AI Advisor error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute inset-x-6 top-10 h-[28rem] rounded-[2rem] bi-hero-backdrop" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white mb-6 shadow-lg shadow-black/20">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-4xl font-bold font-heading mb-4">Greek AI Professional Advisor</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Select a professional role and ask a question. Our AI, trained on Greek law and business practices, will provide an initial guidance.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
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
                      setError(null);
                    }}
                    className={cn(
                      "flex flex-col md:flex-row items-center justify-center gap-2 py-3 md:py-4 px-2 rounded-lg transition-all duration-300 relative overflow-hidden",
                      isSelected ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? "text-black" : "text-current")} />
                    <span className="text-xs md:text-sm font-medium">{role.label}</span>
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

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Languages className="w-4 h-4" />
                <span>Response language</span>
              </div>
              <div className="inline-flex w-fit rounded-lg bg-gray-100 p-1">
                {languages.map((item) => {
                  const isSelected = language === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setLanguage(item.id);
                        setResponse(null);
                        setError(null);
                      }}
                      className={cn(
                        "h-8 min-w-12 rounded-md px-3 text-sm font-semibold transition-colors",
                        isSelected ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800",
                      )}
                      aria-pressed={isSelected}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex flex-col gap-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                 <div className="relative">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={language === "english"
                      ? `Ask the ${selectedRoleMeta.englishLabel}...`
                      : `Ρωτήστε τον/την ${selectedRoleMeta.label}...`}
                    className="h-14 pl-4 pr-14 text-lg bg-white border-gray-200 focus:ring-black/10 focus:border-black transition-all rounded-xl shadow-sm"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!question.trim() || isLoading}
                    className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-black hover:bg-gray-800 text-white transition-all"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                 </div>
              </form>

              <AnimatePresence mode="wait">
                {(response || error) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-black/10" />
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full text-white flex items-center justify-center flex-shrink-0 mt-1",
                          error ? "bg-red-600" : "bg-black",
                        )}>
                          {error ? <TriangleAlert className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className="space-y-3 min-w-0">
                          <p className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                            AI Response ({selectedRoleMeta.label})
                          </p>
                          {error ? (
                            <p className="text-gray-800 leading-relaxed text-lg">
                              {error}
                            </p>
                          ) : response && (
                            <>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium",
                                  response.verification === "grounded"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-700",
                                )}>
                                  {response.verification === "grounded"
                                    ? <ShieldCheck className="w-3.5 h-3.5" />
                                    : <TriangleAlert className="w-3.5 h-3.5" />}
                                  {response.verification === "grounded" ? "Official sources verified" : "Needs current-source review"}
                                </span>
                                {response.asOf && (
                                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-gray-600 border border-gray-200">
                                    As of {response.asOf}
                                  </span>
                                )}
                                {response.confidence && (
                                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-gray-600 border border-gray-200">
                                    Confidence {response.confidence}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                                {response.answer}
                              </p>
                              {(response.requiresReview || response.refusalReason) && (
                                <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                  {response.refusalReason || "Review this answer against current official sources before acting."}
                                </p>
                              )}
                              {response.sources && response.sources.length > 0 && (
                                <div className="pt-1">
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Sources
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {response.sources.map((source) => (
                                      <a
                                        key={source.uri}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex max-w-full items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-black"
                                      >
                                        <span className="truncate">{source.title || source.uri}</span>
                                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
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
  );
}
