import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { trackEvent, trackLeadConversion } from "@/lib/analytics";
import { withSiteBase } from "@/lib/site";
import {
  buildRestaurantLeadPayload,
  isRestaurantLeadAcknowledged,
  readRestaurantAttribution,
  restaurantFulfilmentOptions,
  restaurantGoalOptions,
  restaurantPlatformOptions,
  restaurantRoleOptions,
  restaurantTimingOptions,
  validateRestaurantLead,
  type RestaurantAttribution,
  type RestaurantLandingPage,
  type RestaurantLeadValues,
} from "@/lib/restaurantLead";
import "./RestaurantLeadForm.css";

const initialValues: RestaurantLeadValues = {
  name: "", company: "", area: "", phone: "", email: "", role: "", platforms: [],
  goal: "", fulfilment: "", timing: "", consent: false, website: "",
};

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";
const CONTACT_INSTAGRAM = "https://www.instagram.com/bisolutions.group/";

export function RestaurantLeadForm({ landingPage }: { landingPage: RestaurantLandingPage }) {
  const [values, setValues] = useState<RestaurantLeadValues>(initialValues);
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const platformsField = useRef<HTMLFieldSetElement>(null);
  const hasStarted = useRef(false);
  const submitLock = useRef(false);
  const previousStep = useRef(step);
  const attribution = useRef<RestaurantAttribution>({ landingPath: "", campaign: {} });

  useEffect(() => {
    attribution.current = readRestaurantAttribution(window.location.search, window.location.pathname);
  }, []);

  useEffect(() => {
    if (previousStep.current !== step) stepHeading.current?.focus();
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    if (status === "error" || status === "success") feedback.current?.focus();
  }, [status]);

  function update<Field extends keyof RestaurantLeadValues>(field: Field, value: RestaurantLeadValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function trackStart() {
    if (hasStarted.current) return;
    hasStarted.current = true;
    trackEvent("restaurant_form_start", { landing_page: landingPage });
  }

  function togglePlatform(platform: string) {
    setValues((current) => ({
      ...current,
      platforms: current.platforms.includes(platform)
        ? current.platforms.filter((selected) => selected !== platform)
        : platform === "Καμία"
          ? [platform]
          : [...current.platforms.filter((selected) => selected !== "Καμία"), platform],
    }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    setError("");

    if (step === 1) {
      const blankField = !values.company.trim() ? "company" : !values.area.trim() ? "area" : null;
      if (blankField) {
        setError(blankField === "company" ? "Συμπλήρωσε το όνομα του καταστήματος." : "Συμπλήρωσε την περιοχή του καταστήματος.");
        const input = event.currentTarget.elements.namedItem(blankField);
        if (input instanceof HTMLInputElement) input.focus();
        return;
      }
      if (!values.platforms.length) {
        setError("Επίλεξε τις πλατφόρμες με τις οποίες συνεργάζεσαι ή την επιλογή «Καμία».");
        platformsField.current?.focus();
        return;
      }
      setStatus("idle");
      setStep(2);
      trackEvent("restaurant_form_step", { landing_page: landingPage, step: 2 });
      return;
    }

    const validation = validateRestaurantLead(values);
    if (!validation.success) {
      setError(values.website ? "Δεν ήταν δυνατή η υποβολή. Δοκίμασε ξανά." : "Έλεγξε τα στοιχεία σου και συμπλήρωσε έναν έγκυρο αριθμό τηλεφώνου και email.");
      setStatus("error");
      return;
    }

    submitLock.current = true;
    setStatus("submitting");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildRestaurantLeadPayload(values, landingPage, attribution.current)),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!isRestaurantLeadAcknowledged(response.ok, payload)) throw new Error("Unconfirmed contact submission");
      setStatus("success");
      trackLeadConversion();
      trackEvent("restaurant_form_submit", { landing_page: landingPage });
    } catch {
      setError("Δεν επιβεβαιώθηκε η αποστολή του αιτήματος. Τα στοιχεία σου παραμένουν εδώ για να δοκιμάσεις ξανά. Μπορείς επίσης να επικοινωνήσεις μαζί μας στο Instagram.");
      setStatus("error");
      trackEvent("restaurant_form_error", { landing_page: landingPage, reason: "submission" });
    } finally {
      window.clearTimeout(timeout);
      submitLock.current = false;
    }
  }

  if (status === "success") {
    return (
      <div className="restaurant-lead restaurant-lead-success" ref={feedback} tabIndex={-1} role="status">
        <span className="restaurant-lead-success-icon"><Check aria-hidden="true" size={25} /></span>
        <p className="restaurant-lead-eyebrow">Η υποβολή ολοκληρώθηκε</p>
        <h3>Το επόμενο βήμα ξεκινά από το κατάστημά σου.</h3>
        <p>Ευχαριστούμε. Θα εξετάσουμε όσα μοιράστηκες και θα επικοινωνήσουμε μαζί σου για να δούμε τις ανάγκες και τις επιλογές σου.</p>
        <p className="restaurant-lead-note">Η υποβολή αφορά μόνο αυτό το αίτημα. Δεν σε εγγράφει σε newsletter.</p>
      </div>
    );
  }

  return (
    <form className="restaurant-lead" onSubmit={handleSubmit} onFocus={trackStart} aria-label="Αξιολόγηση καταστήματος για απευθείας παραγγελίες">
      <div className="restaurant-lead-progress" aria-label={`Βήμα ${step} από 2`}>
        <span className={step === 1 ? "is-current" : "is-complete"}><b>1</b> Το κατάστημα</span>
        <span aria-hidden="true" className="restaurant-lead-progress-line" />
        <span className={step === 2 ? "is-current" : ""}><b>2</b> Επικοινωνία</span>
      </div>

      <h3 ref={stepHeading} tabIndex={-1}>{step === 1 ? "Πες μας πού βρίσκεσαι σήμερα." : "Πώς θα επικοινωνήσουμε μαζί σου;"}</h3>
      <p className="restaurant-lead-intro">{step === 1 ? "Λίγες πληροφορίες για μια συζήτηση που αφορά πραγματικά την επιχείρησή σου." : "Θα χρησιμοποιήσουμε τα στοιχεία σου για να απαντήσουμε στο συγκεκριμένο αίτημα."}</p>
      <p className="restaurant-lead-required">Όλα τα πεδία είναι υποχρεωτικά.</p>

      <fieldset className="restaurant-lead-fields" disabled={status === "submitting"}>
        <legend className="restaurant-lead-sr-only">{step === 1 ? "Στοιχεία καταστήματος" : "Στοιχεία επικοινωνίας"}</legend>
        {step === 1 ? (
          <>
            <div className="restaurant-lead-grid">
              <label htmlFor="restaurant-company">Όνομα καταστήματος<input id="restaurant-company" name="company" autoComplete="organization" required maxLength={150} value={values.company} onChange={(event) => update("company", event.target.value)} placeholder="π.χ. Το Καφέ της Γειτονιάς" /></label>
              <label htmlFor="restaurant-area">Πόλη / περιοχή<input id="restaurant-area" name="area" autoComplete="address-level2" required maxLength={100} value={values.area} onChange={(event) => update("area", event.target.value)} placeholder="π.χ. Παγκράτι, Αθήνα" /></label>
            </div>
            <label htmlFor="restaurant-role">Ο ρόλος σου<select id="restaurant-role" name="role" required value={values.role} onChange={(event) => update("role", event.target.value)}><option value="" disabled>Επίλεξε ρόλο</option>{restaurantRoleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <fieldset className="restaurant-lead-platforms" ref={platformsField} tabIndex={-1} aria-describedby={error && !values.platforms.length ? "restaurant-form-error" : undefined}>
              <legend>Με ποιες πλατφόρμες συνεργάζεσαι;</legend>
              <p>Μπορείς να επιλέξεις περισσότερες από μία.</p>
              <div className="restaurant-lead-platform-options">{restaurantPlatformOptions.map((platform) => <label key={platform}><input type="checkbox" name="platforms" value={platform} checked={values.platforms.includes(platform)} onChange={() => togglePlatform(platform)} /><span>{platform}</span></label>)}</div>
            </fieldset>
            <label htmlFor="restaurant-goal">Τι θέλεις να αλλάξεις;<select id="restaurant-goal" name="goal" required value={values.goal} onChange={(event) => update("goal", event.target.value)}><option value="" disabled>Επίλεξε τον στόχο σου</option>{restaurantGoalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label htmlFor="restaurant-fulfilment">Πώς εξυπηρετείς διανομή ή παραλαβή;<select id="restaurant-fulfilment" name="fulfilment" required value={values.fulfilment} onChange={(event) => update("fulfilment", event.target.value)}><option value="" disabled>Επίλεξε τον τρόπο εξυπηρέτησης</option>{restaurantFulfilmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label htmlFor="restaurant-timing">Πότε σκέφτεσαι να ξεκινήσεις;<select id="restaurant-timing" name="timing" required value={values.timing} onChange={(event) => update("timing", event.target.value)}><option value="" disabled>Επίλεξε χρονικό ορίζοντα</option>{restaurantTimingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </>
        ) : (
          <>
            <label htmlFor="restaurant-name">Ονοματεπώνυμο<input id="restaurant-name" name="name" autoComplete="name" required maxLength={100} value={values.name} onChange={(event) => update("name", event.target.value)} /></label>
            <div className="restaurant-lead-grid">
              <label htmlFor="restaurant-phone">Τηλέφωνο<input id="restaurant-phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40} value={values.phone} onChange={(event) => update("phone", event.target.value)} placeholder="π.χ. 69XXXXXXXX" /></label>
              <label htmlFor="restaurant-email">Email<input id="restaurant-email" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={(event) => update("email", event.target.value)} placeholder="π.χ. name@example.gr" /></label>
            </div>
            <div className="restaurant-lead-summary"><span>Για το κατάστημα</span><strong>{values.company}</strong><span>{values.area}</span></div>
            <label className="restaurant-lead-consent"><input type="checkbox" name="consent" required checked={values.consent} onChange={(event) => update("consent", event.target.checked)} /><span>Συμφωνώ να χρησιμοποιηθούν τα στοιχεία μου και οι πληροφορίες προέλευσης της σελίδας για την απάντηση στο αίτημά μου. Διάβασα την <a href={withSiteBase("/el/privacy-policy")} target="_blank" rel="noopener noreferrer">Πολιτική απορρήτου</a>.</span></label>
            <p className="restaurant-lead-note">Χωρίς εγγραφή σε newsletter. Η αξιολόγηση δεν αποτελεί δέσμευση αγοράς.</p>
          </>
        )}
        <div className="restaurant-lead-honeypot" aria-hidden="true"><label htmlFor="restaurant-website">Ιστότοπος<input id="restaurant-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} /></label></div>
      </fieldset>

      {error && <div id="restaurant-form-error" className="restaurant-lead-error" role="alert" ref={feedback} tabIndex={-1}><p>{error}</p>{status === "error" && <a href={CONTACT_INSTAGRAM} target="_blank" rel="noopener noreferrer">Επικοινώνησε μαζί μας στο Instagram <ArrowRight size={15} aria-hidden="true" /></a>}</div>}

      <div className="restaurant-lead-actions">
        {step === 2 && <button type="button" className="restaurant-lead-back" onClick={() => { setError(""); setStatus("idle"); setStep(1); }} disabled={status === "submitting"}><ArrowLeft size={16} aria-hidden="true" /> Πίσω</button>}
        <button type="submit" className="restaurant-lead-submit" disabled={status === "submitting"}>
          {status === "submitting" ? <><Loader2 size={18} className="restaurant-lead-spin" aria-hidden="true" /> Αποστολή…</> : step === 1 ? <>Συνέχεια στα στοιχεία επικοινωνίας <ArrowRight size={18} aria-hidden="true" /></> : <>Ζήτησε αξιολόγηση <ArrowRight size={18} aria-hidden="true" /></>}
        </button>
      </div>
      <p className="restaurant-lead-footnote">{step === 1 ? "Τα στοιχεία του καταστήματος αποστέλλονται μόνο όταν ολοκληρώσεις το δεύτερο βήμα." : "Ελέγχουμε πρώτα τις ανάγκες σου και συζητάμε το κατάλληλο επόμενο βήμα."}</p>
    </form>
  );
}
