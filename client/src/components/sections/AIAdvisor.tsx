import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Loader2, Database, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const roles = [
  { id: "engineer", label: "Data Engineer", icon: Database, color: "bg-blue-100 text-blue-600" },
  { id: "analyst", label: "ML Specialist", icon: Zap, color: "bg-purple-100 text-purple-600" },
  { id: "strategist", label: "Analytics Lead", icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
];

const mockResponses: Record<string, string[]> = {
  engineer: [
    "For scalable data pipelines, we recommend a cloud-native architecture using Apache Spark with Delta Lake on Databricks. This enables ACID transactions, time travel, and unified analytics.",
    "Implement a medallion architecture (Bronze, Silver, Gold layers) with dbt for transformation logic, ensuring data quality and lineage tracking across your ETL/ELT workflows.",
    "Consider Snowflake's native integrations with Python/Java UDFs for custom transformations, combined with Airflow for orchestration to handle complex dependency management."
  ],
  analyst: [
    "For predictive modeling, start with feature engineering using statistical methods, then apply ensemble models (Random Forest, XGBoost). Validate with time-series cross-validation.",
    "Implement A/B testing frameworks with proper sample size calculations and effect detection. Use causal inference (propensity score matching, CATE) to isolate true treatment effects.",
    "Deploy models via MLflow model registry, integrate with FastAPI for inference endpoints, and set up automated monitoring for data drift and prediction drift detection."
  ],
  strategist: [
    "Build a governance framework with clear data ownership, quality metrics (SLA-based monitoring), and self-service analytics platforms. Establish CDO and data councils for alignment.",
    "Develop OKRs tied to data initiatives: reduce decision latency, improve forecast accuracy, enable real-time personalization. Track adoption and ROI quarterly.",
    "Create an AI literacy program: executive workshops on AI limitations, responsible AI guidelines, and ethical use cases. Build a center of excellence for scaling best practices."
  ]
};

export function AIAdvisor() {
  const [selectedRole, setSelectedRole] = useState(roles[0].id);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse(null);

    setTimeout(() => {
      const roleResponses = mockResponses[selectedRole];
      const randomResponse = roleResponses[Math.floor(Math.random() * roleResponses.length)];
      setResponse(randomResponse);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-6 shadow-lg shadow-blue-600/20">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-4xl font-bold font-heading mb-4">Data & AI Expert Assistant</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Get expert guidance on data engineering, machine learning, and analytics strategies from our specialized advisors.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-xl p-2 md:p-8 rounded-2xl overflow-hidden">
            
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-1.5 rounded-xl">
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
                      isSelected ? "bg-white text-black shadow-md border border-blue-200" : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? "text-blue-600" : "text-current")} />
                    <span className="text-xs md:text-sm font-medium">{role.label}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="activeRole"
                        className="absolute inset-0 border-2 border-blue-600/20 rounded-lg pointer-events-none"
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
                    placeholder={`Ask the ${roles.find(r => r.id === selectedRole)?.label}...`}
                    className="h-14 pl-4 pr-14 text-lg bg-white border-gray-200 focus:ring-blue-600/10 focus:border-blue-600 transition-all rounded-xl shadow-sm"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!question.trim() || isLoading}
                    className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                 </div>
              </form>

              <AnimatePresence mode="wait">
                {response && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-purple-600" />
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-sm text-blue-700 uppercase tracking-wider">
                            Expert Guidance ({roles.find(r => r.id === selectedRole)?.label})
                          </p>
                          <p className="text-gray-800 leading-relaxed text-base">
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
  );
}
