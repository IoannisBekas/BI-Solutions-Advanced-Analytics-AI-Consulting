import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Languages,
  Loader2,
  Mail,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ResourcePageHero } from "@/components/sections/ResourcePageHero";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import {
  aiLearningProducts,
  learningExperienceOptions,
  learningRoleOptions,
  recommendLearningProduct,
  type LearningExperience,
  type LearningLanguage,
  type LearningRole,
} from "@shared/aiLearningProducts";

const PRODUCT_LOCALES = ["en", "el"] as const;

const copy = {
  en: {
    title: "Find your AI learning pack",
    description:
      "Find a practical AI learning PDF for your experience and interests. Explore 16 professional prompt packs in English and Greek, delivered by email.",
    eyebrow: "Digital products · Practical AI learning",
    heading: "Learn AI by doing something useful.",
    intro:
      "Start with a task you understand. Find a pack for your interests, practice with real prompts, and learn how to check and improve the results.",
    roles: "16 areas of practice",
    prompts: "100 prompts per pack",
    languages: "English & Greek",
    finder: "Find your starting point",
    finderNote:
      "Three quick choices. See your recommendation before sharing your email.",
    steps: ["Your experience", "Your interests", "Your language"],
    step: "Step",
    of: "of",
    experienceTitle: "How familiar are you with AI?",
    experienceNote: "This helps us suggest how to practice with your pack.",
    roleTitle: "Where would you like to use AI?",
    roleNote: "Choose a familiar area. You can explore a different pack later.",
    roleLabel: "Your area of interest",
    rolePlaceholder: "Choose an area",
    exploring: "I’m exploring — help me choose",
    exploringNote:
      "We’ll suggest marketing exercises as an approachable starting point. You can change the pack before requesting it.",
    languageTitle: "Which language would you like to learn in?",
    languageNote:
      "Choose the language of your PDF. The same 100 exercises are available in both versions.",
    english: "English",
    greek: "Ελληνικά",
    languageHelp: "Your PDF and delivery email will use this language.",
    back: "Back",
    next: "Continue",
    recommend: "Find my pack",
    change: "Change my choices",
    sideTitle: "A practical way to learn.",
    sideIntro:
      "Each exercise gives you a task, the context to add, and a way to review the answer.",
    sideSteps: [
      "Add your own context",
      "Try the prompt in your AI tool",
      "Check the result and refine it",
    ],
    sideNote:
      "Downloadable PDFs. Use them with your own AI tool; tool access is separate.",
    result: "Your recommended starting point",
    resultNote:
      "Selected for your interests. Your experience shapes the practice plan below.",
    exploreResult:
      "You’re exploring, so start with marketing tasks and a familiar example. You can choose any of the 16 packs instead.",
    outcomes: "What you’ll practice",
    sample: "A real exercise from this pack",
    practice: "How to start",
    format: "Full PDF · 100 prompts",
    edition: "PDF language",
    switchPack: "Choose another pack",
    emailTitle: "Get the full pack by email.",
    emailIntro:
      "We’ll send a private download link for your selected PDF. Access is free; no payment is needed.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    send: "Email me the full PDF",
    sending: "Sending your link…",
    privacy:
      "We use your email and choices to deliver this pack. This does not subscribe you to marketing emails.",
    privacyLink: "Privacy policy",
    sentTitle: "Your pack is on its way.",
    sent: "We’ve sent a download link to",
    sentNote:
      "The link is valid for 7 days. Check your spam folder if it doesn’t arrive, and wait a minute before requesting another.",
    resend: "Send another link",
    error: "We couldn’t send your link. Please try again.",
    unavailable:
      "Email delivery is temporarily unavailable. Please try again later.",
    cooldown: "Please wait a minute before requesting another email.",
    rateLimit: "Too many requests. Please try again later.",
    browse: "Explore all 16 learning packs",
    browseNote:
      "Choose a familiar subject and learn through tasks you can put into practice.",
    choose: "Explore this pack",
    catalog: "The collection",
    footnote:
      "These products help you practice using AI for professional tasks. Each prompt includes inputs, an instruction, and a check for reviewing the result.",
  },
  el: {
    title: "Βρες το πακέτο σου για πρακτική με AI",
    description:
      "Διάλεξε ένα PDF για να μάθεις να χρησιμοποιείς AI στην πράξη. 16 επαγγελματικά πακέτα prompts στα ελληνικά και αγγλικά, με αποστολή μέσω email.",
    eyebrow: "Ψηφιακά προϊόντα · Πρακτική με AI",
    heading: "Μάθε AI κάνοντας κάτι χρήσιμο.",
    intro:
      "Ξεκίνα με μια εργασία που γνωρίζεις. Βρες το κατάλληλο πακέτο, δοκίμασε πραγματικά prompts και μάθε να ελέγχεις και να βελτιώνεις τα αποτελέσματα.",
    roles: "16 πεδία πρακτικής",
    prompts: "100 prompts ανά πακέτο",
    languages: "Ελληνικά & αγγλικά",
    finder: "Βρες από πού να ξεκινήσεις",
    finderNote:
      "Τρεις σύντομες επιλογές. Δες την πρότασή μας πριν δώσεις το email σου.",
    steps: ["Η εμπειρία σου", "Τα ενδιαφέροντά σου", "Η γλώσσα σου"],
    step: "Βήμα",
    of: "από",
    experienceTitle: "Πόσο εξοικειωμένος είσαι με το AI;",
    experienceNote:
      "Έτσι θα σου προτείνουμε πώς να εξασκηθείς με το πακέτο σου.",
    roleTitle: "Πού θα ήθελες να χρησιμοποιήσεις AI;",
    roleNote:
      "Διάλεξε ένα πεδίο που γνωρίζεις. Μπορείς να δοκιμάσεις άλλο πακέτο αργότερα.",
    roleLabel: "Το πεδίο που σε ενδιαφέρει",
    rolePlaceholder: "Διάλεξε ένα πεδίο",
    exploring: "Ακόμη το ψάχνω — βοήθησέ με να διαλέξω",
    exploringNote:
      "Θα προτείνουμε ασκήσεις μάρκετινγκ ως αφετηρία. Μπορείς να αλλάξεις πακέτο πριν το ζητήσεις.",
    languageTitle: "Σε ποια γλώσσα θέλεις να εξασκηθείς;",
    languageNote:
      "Διάλεξε τη γλώσσα του PDF σου. Οι ίδιες 100 ασκήσεις υπάρχουν και στις δύο εκδόσεις.",
    english: "English",
    greek: "Ελληνικά",
    languageHelp: "Το PDF και το email αποστολής θα είναι σε αυτή τη γλώσσα.",
    back: "Πίσω",
    next: "Συνέχεια",
    recommend: "Βρες το πακέτο μου",
    change: "Άλλαξε τις επιλογές μου",
    sideTitle: "Μαθαίνεις μέσα από την πράξη.",
    sideIntro:
      "Κάθε άσκηση σου δίνει μια εργασία, τα στοιχεία που θα προσθέσεις και έναν τρόπο να ελέγξεις την απάντηση.",
    sideSteps: [
      "Πρόσθεσε τα δικά σου στοιχεία",
      "Δοκίμασε το prompt στο εργαλείο AI σου",
      "Έλεγξε και βελτίωσε το αποτέλεσμα",
    ],
    sideNote:
      "PDF για λήψη. Τα χρησιμοποιείς με το δικό σου εργαλείο AI· η πρόσβαση σε αυτό δεν περιλαμβάνεται.",
    result: "Η προτεινόμενη αφετηρία σου",
    resultNote:
      "Με βάση τα ενδιαφέροντά σου. Η εμπειρία σου καθορίζει το πλάνο πρακτικής παρακάτω.",
    exploreResult:
      "Αφού ακόμη το ψάχνεις, ξεκίνα με μια γνώριμη εργασία μάρκετινγκ. Μπορείς να διαλέξεις οποιοδήποτε από τα 16 πακέτα.",
    outcomes: "Σε τι θα εξασκηθείς",
    sample: "Μια πραγματική άσκηση του πακέτου",
    practice: "Πώς να ξεκινήσεις",
    format: "Πλήρες PDF · 100 prompts",
    edition: "Γλώσσα PDF",
    switchPack: "Διάλεξε άλλο πακέτο",
    emailTitle: "Πάρε το πλήρες πακέτο με email.",
    emailIntro:
      "Θα σου στείλουμε έναν ιδιωτικό σύνδεσμο λήψης για το PDF σου. Η πρόσβαση είναι δωρεάν, χωρίς πληρωμή.",
    emailLabel: "Διεύθυνση email",
    emailPlaceholder: "you@example.com",
    send: "Στείλε μου το πλήρες PDF",
    sending: "Στέλνουμε τον σύνδεσμό σου…",
    privacy:
      "Χρησιμοποιούμε το email και τις επιλογές σου για να στείλουμε το πακέτο. Δεν σε εγγράφουμε σε λίστα διαφημιστικών email.",
    privacyLink: "Πολιτική απορρήτου",
    sentTitle: "Το πακέτο σου έρχεται.",
    sent: "Στείλαμε σύνδεσμο λήψης στο",
    sentNote:
      "Ο σύνδεσμος ισχύει για 7 ημέρες. Αν δεν φτάσει, έλεγξε τα ανεπιθύμητα και περίμενε ένα λεπτό πριν ζητήσεις νέο.",
    resend: "Στείλε νέο σύνδεσμο",
    error: "Δεν καταφέραμε να στείλουμε τον σύνδεσμο. Δοκίμασε ξανά.",
    unavailable:
      "Η αποστολή email δεν είναι διαθέσιμη αυτή τη στιγμή. Δοκίμασε αργότερα.",
    cooldown: "Περίμενε ένα λεπτό πριν ζητήσεις νέο email.",
    rateLimit: "Έγιναν πολλές προσπάθειες. Δοκίμασε ξανά αργότερα.",
    browse: "Εξερεύνησε και τα 16 πακέτα",
    browseNote:
      "Διάλεξε ένα γνώριμο αντικείμενο και μάθε μέσα από εργασίες που μπορείς να εφαρμόσεις.",
    choose: "Δες αυτό το πακέτο",
    catalog: "Η συλλογή",
    footnote:
      "Τα προϊόντα σε βοηθούν να εξασκηθείς στη χρήση AI για επαγγελματικές εργασίες. Κάθε prompt περιλαμβάνει στοιχεία εισόδου, οδηγίες και έναν έλεγχο του αποτελέσματος.",
  },
};

export default function AiLearningProducts() {
  const { locale } = useLocale();
  const isGreek = locale === "el";
  const c = copy[isGreek ? "el" : "en"];
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<LearningExperience | "">("");
  const [role, setRole] = useState<LearningRole | "exploring" | "">("");
  const [language, setLanguage] = useState<LearningLanguage>(
    isGreek ? "el" : "en",
  );
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const finderRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMoved = useRef(false);
  const actualRole = role === "exploring" ? aiLearningProducts[0].role : role;
  const recommendation =
    actualRole && experience
      ? recommendLearningProduct(actualRole, experience, language)
      : null;
  const product = recommendation?.product;

  useEffect(() => {
    if (!hasMoved.current) return;
    finderRef.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const goTo = (nextStep: number) => {
    if (status === "sending") return;
    hasMoved.current = true;
    setStatus("idle");
    setError("");
    setStep(nextStep);
  };

  const chooseProduct = (selectedRole: LearningRole) => {
    if (status === "sending") return;
    setRole(selectedRole);
    goTo(experience ? 3 : 0);
    finderRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || !experience || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const apiOrigin = (import.meta.env.VITE_AI_LEARNING_API_URL || "")
        .trim()
        .replace(/\/+$/, "");
      const response = await fetch(`${apiOrigin}/api/ai-learning/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: product.role,
          experience,
          language,
          website,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.success !== true) {
        setError(
          response.status === 429
            ? Number(response.headers.get("Retry-After")) > 0 &&
              Number(response.headers.get("Retry-After")) <= 60
              ? c.cooldown
              : c.rateLimit
            : response.status === 503
              ? c.unavailable
              : c.error,
        );
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError(c.error);
      setStatus("error");
    }
  };

  const radioClass = (selected: boolean) =>
    cn(
      "flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-colors focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2",
      selected
        ? "border-black bg-stone-50"
        : "border-gray-200 bg-white hover:border-gray-400",
    );
  const buttonClass =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500";

  return (
    <div className="resource-page min-h-screen bg-[#f5f3f0] font-sans text-gray-950" data-hero-overlay="true">
      <Seo
        title={c.title}
        description={c.description}
        path="/resources/ai-prompt-packs"
        translatedLocales={PRODUCT_LOCALES}
      />
      <Navbar />
      <main lang={locale === "de" ? "en" : undefined} translate={locale === "de" ? "no" : undefined}>
        <ResourcePageHero
          eyebrow={c.eyebrow}
          title={c.heading}
          description={c.intro}
          footer={
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/75">
              {[
                { icon: BookOpen, label: c.roles },
                { icon: FileText, label: c.prompts },
                { icon: Languages, label: c.languages },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          }
        />

        <section
          ref={finderRef}
          id="find-your-pack"
          className="site-container scroll-mt-28 px-6 py-20 md:px-12 md:py-24"
          aria-label={c.finder}
        >
          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-black/[0.03]">
            <div className="border-b border-gray-200 px-6 py-6 sm:px-9">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                {step < 3 ? c.finder : c.result}
              </p>
              {step < 3 ? (
                <>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {c.finderNote}
                  </p>
                  <ol
                    className="mt-6 grid grid-cols-3 gap-3"
                    aria-label={c.finder}
                  >
                    {c.steps.map((label, index) => (
                      <li
                        key={label}
                        className={cn(
                          "border-t-2 pt-3 text-xs font-medium sm:text-sm",
                          step >= index
                            ? "border-black text-gray-900"
                            : "border-gray-200 text-gray-500",
                        )}
                        aria-current={step === index ? "step" : undefined}
                      >
                        <span className="mr-1.5 inline-block">
                          {index < step ? (
                            <Check
                              className="inline h-3.5 w-3.5"
                              aria-label={
                                isGreek ? "Ολοκληρώθηκε" : "Completed"
                              }
                            />
                          ) : (
                            `0${index + 1}`
                          )}
                        </span>
                        {label}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-gray-600">
                  {role === "exploring" ? c.exploreResult : c.resultNote}
                </p>
              )}
            </div>

            {step < 3 ? (
              <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <form
                  className="min-w-0 p-6 sm:p-9"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (
                      (step === 0 && experience) ||
                      (step === 1 && role) ||
                      step === 2
                    )
                      goTo(step + 1);
                  }}
                >
                  <p className="mb-3 text-xs font-semibold text-gray-500">
                    {c.step} {step + 1} {c.of} 3
                  </p>
                  <h2
                    ref={headingRef}
                    tabIndex={-1}
                    className="font-heading text-2xl font-bold leading-tight tracking-tight outline-none sm:text-3xl"
                  >
                    {[c.experienceTitle, c.roleTitle, c.languageTitle][step]}
                  </h2>
                  <p className="mb-7 mt-3 text-sm leading-relaxed text-gray-600">
                    {[c.experienceNote, c.roleNote, c.languageNote][step]}
                  </p>
                  {step === 0 && (
                    <fieldset className="space-y-3">
                      <legend className="sr-only">{c.experienceTitle}</legend>
                      {learningExperienceOptions.map((option) => (
                        <label
                          key={option.value}
                          className={radioClass(experience === option.value)}
                        >
                          <input
                            className="mt-1 h-4 w-4 shrink-0 accent-black"
                            type="radio"
                            name="experience"
                            value={option.value}
                            checked={experience === option.value}
                            onChange={() => setExperience(option.value)}
                            required
                          />
                          <span>
                            <span className="block text-sm font-semibold">
                              {isGreek ? option.labelEl : option.label}
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                              {isGreek
                                ? option.descriptionEl
                                : option.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  )}
                  {step === 1 && (
                    <div>
                      <label
                        htmlFor="learning-role"
                        className="mb-2 block text-sm font-semibold"
                      >
                        {c.roleLabel}
                      </label>
                      <div className="relative">
                        <select
                          id="learning-role"
                          className="min-h-14 w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-4 pr-11 text-sm text-gray-950"
                          value={role}
                          onChange={(event) =>
                            setRole(event.target.value as typeof role)
                          }
                          required
                        >
                          <option value="" disabled>
                            {c.rolePlaceholder}
                          </option>
                          <option value="exploring">{c.exploring}</option>
                          {learningRoleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {isGreek ? option.labelEl : option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
                          aria-hidden="true"
                        />
                      </div>
                      {role === "exploring" && (
                        <p className="mt-4 rounded-xl bg-stone-50 p-4 text-sm leading-relaxed text-gray-600">
                          {c.exploringNote}
                        </p>
                      )}
                    </div>
                  )}
                  {step === 2 && (
                    <fieldset className="space-y-3">
                      <legend className="sr-only">{c.languageTitle}</legend>
                      {(
                        [
                          { value: "en", label: c.english },
                          { value: "el", label: c.greek },
                        ] as const
                      ).map((option) => (
                        <label
                          key={option.value}
                          className={radioClass(language === option.value)}
                        >
                          <input
                            className="mt-0.5 h-4 w-4 accent-black"
                            type="radio"
                            name="language"
                            value={option.value}
                            checked={language === option.value}
                            onChange={() => setLanguage(option.value)}
                          />
                          <span
                            className="text-base font-semibold"
                            lang={option.value}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))}
                      <p className="text-xs leading-relaxed text-gray-500">
                        {c.languageHelp}
                      </p>
                    </fieldset>
                  )}
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
                    {step > 0 ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
                        onClick={() => goTo(step - 1)}
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {c.back}
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="submit"
                      className={buttonClass}
                      disabled={
                        (step === 0 && !experience) || (step === 1 && !role)
                      }
                    >
                      {step === 2 ? c.recommend : c.next}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
                <aside className="bi-proof-grid border-t border-white/10 bg-black p-6 text-white sm:p-9 lg:border-l lg:border-t-0">
                  <BookOpen
                    className="mb-6 h-8 w-8"
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />
                  <h3 className="font-heading text-2xl font-bold leading-tight tracking-tight text-white">
                    {c.sideTitle}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-300">
                    {c.sideIntro}
                  </p>
                  <ol className="my-7 space-y-5">
                    {c.sideSteps.map((text, index) => (
                      <li
                        className="flex items-start gap-3 text-sm leading-relaxed text-gray-200"
                        key={text}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/25 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ol>
                  <p className="border-t border-white/15 pt-5 text-xs leading-relaxed text-gray-300">
                    {c.sideNote}
                  </p>
                </aside>
              </div>
            ) : (
              product &&
              recommendation && (
                <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                  <div className="min-w-0 p-6 sm:p-9">
                    <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
                      <span className="rounded-full bg-stone-100 px-3 py-1.5">
                        {c.format}
                      </span>
                      <span className="rounded-full bg-stone-100 px-3 py-1.5">
                        {language === "el" ? c.greek : c.english}
                      </span>
                    </div>
                    <h2
                      ref={headingRef}
                      tabIndex={-1}
                      className="font-heading text-3xl font-bold leading-tight tracking-tight outline-none sm:text-4xl"
                    >
                      {isGreek ? product.nameEl : product.name}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-gray-600">
                      {isGreek ? product.descriptionEl : product.description}
                    </p>
                    <h3 className="mb-3 mt-7 text-sm font-semibold">
                      {c.outcomes}
                    </h3>
                    <ul className="space-y-3">
                      {(isGreek ? product.outcomesEl : product.outcomes).map(
                        (outcome) => (
                          <li
                            key={outcome}
                            className="flex gap-3 text-sm leading-relaxed text-gray-600"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-gray-900"
                              aria-hidden="true"
                            />
                            {outcome}
                          </li>
                        ),
                      )}
                    </ul>
                    <div className="my-7 rounded-2xl border border-gray-200 bg-stone-50 p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {c.sample}
                      </p>
                      <p className="font-heading text-lg font-bold">
                        {isGreek
                          ? product.sample.titleEl
                          : product.sample.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {isGreek
                          ? product.sample.outcomeEl
                          : product.sample.outcome}
                      </p>
                    </div>
                    <h3 className="mb-3 text-sm font-semibold">{c.practice}</h3>
                    <ol className="space-y-3">
                      {recommendLearningProduct(
                        product.role,
                        experience as LearningExperience,
                        isGreek ? "el" : "en",
                      ).startingSteps.map((text, index) => (
                        <li
                          key={text}
                          className="flex gap-3 text-sm leading-relaxed text-gray-600"
                        >
                          <span className="font-semibold text-gray-900">
                            0{index + 1}
                          </span>
                          {text}
                        </li>
                      ))}
                    </ol>
                    <button
                      className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4"
                      type="button"
                      onClick={() => goTo(0)}
                      disabled={status === "sending"}
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      {c.change}
                    </button>
                  </div>
                  <aside className="bi-proof-grid min-w-0 border-t border-white/10 bg-black p-6 text-white sm:p-9 lg:border-l lg:border-t-0">
                    {status === "sent" ? (
                      <div role="status" aria-live="polite">
                        <CheckCircle2
                          className="mb-5 h-10 w-10"
                          strokeWidth={1.4}
                          aria-hidden="true"
                        />
                        <h3 className="font-heading text-2xl font-bold text-white">
                          {c.sentTitle}
                        </h3>
                        <p className="mt-4 break-words text-sm leading-relaxed text-gray-200">
                          {c.sent} <strong>{email.trim()}</strong>.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-gray-300">
                          {c.sentNote}
                        </p>
                        <button
                          type="button"
                          className="mt-6 min-h-11 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                          onClick={() => setStatus("idle")}
                        >
                          {c.resend}
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={submitEmail}
                        aria-busy={status === "sending"}
                      >
                        <Mail
                          className="mb-5 h-8 w-8"
                          strokeWidth={1.4}
                          aria-hidden="true"
                        />
                        <h3 className="font-heading text-2xl font-bold leading-tight tracking-tight text-white">
                          {c.emailTitle}
                        </h3>
                        <p className="mb-6 mt-4 text-sm leading-relaxed text-gray-300">
                          {c.emailIntro}
                        </p>
                        <label
                          className="mb-2 block text-sm font-semibold"
                          htmlFor="pack-switch"
                        >
                          {c.switchPack}
                        </label>
                        <select
                          id="pack-switch"
                          className="mb-5 min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 disabled:opacity-60"
                          value={product.role}
                          disabled={status === "sending"}
                          onChange={(event) => {
                            setRole(event.target.value as LearningRole);
                            setStatus("idle");
                          }}
                        >
                          {learningRoleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {isGreek ? option.labelEl : option.label}
                            </option>
                          ))}
                        </select>
                        <label
                          className="mb-2 block text-sm font-semibold"
                          htmlFor="pdf-language"
                        >
                          {c.edition}
                        </label>
                        <select
                          id="pdf-language"
                          className="mb-5 min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 disabled:opacity-60"
                          value={language}
                          disabled={status === "sending"}
                          onChange={(event) => {
                            setLanguage(event.target.value as LearningLanguage);
                            setStatus("idle");
                          }}
                        >
                          <option value="en">English</option>
                          <option value="el">Ελληνικά</option>
                        </select>
                        <label
                          className="mb-2 block text-sm font-semibold"
                          htmlFor="learning-email"
                        >
                          {c.emailLabel}
                        </label>
                        <input
                          id="learning-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          maxLength={254}
                          required
                          value={email}
                          disabled={status === "sending"}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder={c.emailPlaceholder}
                          className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-950 placeholder:text-gray-500 disabled:opacity-60"
                          aria-describedby={
                            error
                              ? "learning-email-error learning-email-privacy"
                              : "learning-email-privacy"
                          }
                        />
                        <div className="hidden" aria-hidden="true">
                          <label htmlFor="learning-website">Website</label>
                          <input
                            id="learning-website"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={(event) => setWebsite(event.target.value)}
                          />
                        </div>
                        {error && (
                          <p
                            id="learning-email-error"
                            className="mt-3 text-sm leading-relaxed text-red-300"
                            role="alert"
                          >
                            {error}
                          </p>
                        )}
                        <button
                          type="submit"
                          className={cn(buttonClass, "mt-4 w-full bg-white text-gray-950 hover:bg-gray-200 disabled:bg-white/20 disabled:text-white/70")}
                          disabled={status === "sending"}
                        >
                          {status === "sending" ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Mail className="h-4 w-4" aria-hidden="true" />
                          )}
                          {status === "sending" ? c.sending : c.send}
                        </button>
                        <p
                          id="learning-email-privacy"
                          className="mt-4 text-xs leading-relaxed text-gray-300"
                        >
                          {c.privacy}{" "}
                          <Link
                            href="/privacy-policy"
                            className="underline underline-offset-2"
                          >
                            {c.privacyLink}
                          </Link>
                          .
                        </p>
                      </form>
                    )}
                  </aside>
                </div>
              )
            )}
          </div>
        </section>

        <section
          className="bi-proof-grid bg-black py-20 text-white md:py-24"
          aria-label={c.catalog}
        >
          <div className="site-container px-6 md:px-12">
            <details className="group rounded-[2rem] border border-white/15 bg-white/[0.03] p-6 sm:p-9">
              <summary className="cursor-pointer font-heading text-2xl font-bold leading-tight text-white marker:text-gray-400 sm:text-3xl">
                <span className="inline-block align-middle">{c.browse}</span>
              </summary>
              <p className="mb-8 mt-4 text-sm leading-relaxed text-gray-300">
                {c.browseNote}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {aiLearningProducts.map((item, index) => (
                  <article
                    key={item.id}
                    className="flex min-w-0 flex-col rounded-[1.5rem] border border-white/15 bg-white/[0.04] p-6 transition-colors hover:border-white/30 hover:bg-white/[0.07]"
                  >
                    <span className="mb-5 text-xs font-semibold tracking-[0.16em] text-gray-400">
                      {String(index + 1).padStart(2, "0")} / PDF
                    </span>
                    <h3 className="font-heading text-lg font-bold leading-tight text-white">
                      {isGreek ? item.nameEl : item.name}
                    </h3>
                    <p className="mb-6 mt-3 flex-1 text-sm leading-relaxed text-gray-300">
                      {isGreek ? item.descriptionEl : item.description}
                    </p>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-between gap-2 text-left text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white disabled:cursor-not-allowed disabled:text-gray-400"
                      onClick={() => chooseProduct(item.role)}
                      disabled={status === "sending"}
                    >
                      {c.choose}
                      <ArrowRight
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </button>
                  </article>
                ))}
              </div>
          </details>
            <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-gray-400">
              {c.footnote}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
