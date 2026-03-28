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
import { PRODUCT_ROUTES } from "@/lib/routes";

const roles = [
  { id: "accountant", label: "Λογιστής", icon: Calculator, color: "bg-blue-100 text-blue-600" },
  { id: "lawyer", label: "Δικηγόρος", icon: Scale, color: "bg-amber-100 text-amber-600" },
  { id: "consultant", label: "Σύμβουλος", icon: Briefcase, color: "bg-emerald-100 text-emerald-600" },
];

export default function AIAdvisorPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0].id);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [advisorStatus, setAdvisorStatus] = useState<"checking" | "ready" | "unavailable">("checking");
  const abortRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<{ role: string; question: string } | null>(null);

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

  const submitRequest = useCallback(async (role: string, q: string) => {
    if (advisorStatus !== "ready") {
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setResponse(null);
    setErrorMsg(null);
    lastRequestRef.current = { role, question: q };

    try {
      const res = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question: q }),
        signal: controller.signal,
      });

      const data = await res.json() as {
        success?: boolean;
        answer?: string;
        error?: string;
        code?: string;
      };

      if (data.success) {
        setAdvisorStatus("ready");
        setResponse(data.answer ?? "No response generated.");
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
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [advisorStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || advisorStatus !== "ready") return;
    submitRequest(selectedRole, question.trim());
  };

  const handleRetry = () => {
    if (lastRequestRef.current) {
      submitRequest(lastRequestRef.current.role, lastRequestRef.current.question);
    }
  };

  const selectedRoleLabel = roles.find((role) => role.id === selectedRole)?.label;
  const isAdvisorChecking = advisorStatus === "checking";
  const isAdvisorUnavailable = advisorStatus === "unavailable";
  const inputPlaceholder = isAdvisorChecking
    ? "Checking advisor availability..."
    : isAdvisorUnavailable
      ? "Advisor temporarily unavailable"
      : `Ask the ${selectedRoleLabel}...`;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Greek AI Professional Advisor"
        description="Use the BI Solutions Greek AI Professional Advisor for guided questions across accounting, legal, and consulting workflows."
        path={PRODUCT_ROUTES.aiAdvisor}
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

                {/* Chat Interface */}
                <div className="flex flex-col gap-6">
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
                      The advisor is currently unavailable. Please try again later.
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
                          <RotateCcw className="w-3.5 h-3.5" /> Retry
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
                              AI Response ({roles.find(r => r.id === selectedRole)?.label})
                            </p>
                            <div className="space-y-2.5 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded-md w-full" />
                              <div className="h-4 bg-gray-200 rounded-md w-5/6" />
                              <div className="h-4 bg-gray-200 rounded-md w-4/6" />
                            </div>
                            <p className="text-xs text-gray-400 mt-3">Generating response…</p>
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
                                AI Response ({roles.find(r => r.id === selectedRole)?.label})
                              </p>
                              <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                                {response}
                              </p>
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
      </main>
      <Footer />
    </div>
  );
}
