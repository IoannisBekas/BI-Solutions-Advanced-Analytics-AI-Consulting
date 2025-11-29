import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Loader2, Briefcase, Scale, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const roles = [
  { id: "accountant", label: "Λογιστής", icon: Calculator, color: "bg-blue-100 text-blue-600" },
  { id: "lawyer", label: "Δικηγόρος", icon: Scale, color: "bg-amber-100 text-amber-600" },
  { id: "consultant", label: "Σύμβουλος", icon: Briefcase, color: "bg-emerald-100 text-emerald-600" },
];

const mockResponses: Record<string, string[]> = {
  accountant: [
    "Σύμφωνα με τον Κώδικα Φορολογίας Εισοδήματος (Ν. 4172/2013), οι δαπάνες αυτές εκπίπτουν εφόσον πραγματοποιούνται προς το συμφέρον της επιχείρησης.",
    "Για την έναρξη ατομικής επιχείρησης απαιτείται εγγραφή στο ΓΕΜΗ και απόδοση ΑΦΜ από την αρμόδια ΔΟΥ.",
    "Ο συντελεστής ΦΠΑ για την κατηγορία αυτή ανέρχεται στο 24%, εκτός αν υπάγεται στις εξαιρέσεις του άρθρου 21."
  ],
  lawyer: [
    "Βάσει του Αστικού Κώδικα, η σύμβαση αυτή απαιτεί έγγραφο τύπο για να είναι έγκυρη.",
    "Η προθεσμία για την άσκηση του ενδίκου μέσου είναι 30 ημέρες από την επίδοση της απόφασης.",
    "Το άρθρο 57 του ΑΚ προστατεύει την προσωπικότητα από προσβολές, παρέχοντας δικαίωμα για άρση της προσβολής και αποζημίωση."
  ],
  consultant: [
    "Για την βελτιστοποίηση της ροής εργασιών, προτείνουμε την εφαρμογή της μεθοδολογίας Lean Management.",
    "Η ανάλυση SWOT δείχνει ότι υπάρχει σημαντική ευκαιρία ανάπτυξης στις νέες αγορές της Νοτιοανατολικής Ευρώπης.",
    "Η στρατηγική τοποθέτηση του προϊόντος απαιτεί επαναξιολόγηση της τιμολογιακής πολιτικής βάσει του ανταγωνισμού."
  ]
};

export default function AIAdvisorPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0].id);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false); // Mock subscription status
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!isSubscriber) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsLoading(true);
    setResponse(null);

    // Simulate API call
    setTimeout(() => {
      const roleResponses = mockResponses[selectedRole];
      const randomResponse = roleResponses[Math.floor(Math.random() * roleResponses.length)];
      setResponse(randomResponse);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <ScrollReveal className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white mb-6 shadow-lg shadow-black/20">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-4xl font-bold font-heading mb-4">AI Professional Advisor</h2>
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
                        placeholder={`Ask the ${roles.find(r => r.id === selectedRole)?.label}...`}
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
                    {response && (
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
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="space-y-2">
                              <p className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                                AI Response ({roles.find(r => r.id === selectedRole)?.label})
                              </p>
                              <p className="text-gray-800 leading-relaxed text-lg">
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

      <AlertDialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl">Subscription Required</AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-gray-600">
              This feature is available only to active customers with an active subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => setShowSubscriptionModal(false)}
              className="rounded-full px-6 bg-black text-white hover:bg-gray-800"
            >
              View Plans
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
