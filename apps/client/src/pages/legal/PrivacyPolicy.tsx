import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "@/i18n/LocaleProvider";

export default function PrivacyPolicy() {
  const { locale } = useLocale();
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy Policy"
        description="Privacy policy and data protection information for BI Solutions Group."
        path="/privacy-policy"
      />
      <Navbar />
      <main className="page-main">
        <PublicPageHero
          icon={ShieldCheck}
          eyebrow="Legal"
          title="Privacy Policy"
          description="How BI Solutions Group handles personal data, cookies, analytics, and service information."
          footer={<p className="text-sm text-gray-600">{locale === "el" ? "Τελευταία ενημέρωση: 30 Οκτωβρίου 2026" : locale === "de" ? "Zuletzt aktualisiert: 30. Oktober 2026" : "Last updated: October 30, 2026"}</p>}
        />

        <section className="site-container reading-panel">
          <div className="content-panel">
            <div className="reading-width mx-auto space-y-12 text-gray-700 leading-relaxed">
            <ScrollReveal delay={0.05}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  1. Data Controller
                </h2>
                <p>
                  BI Solutions Group, based in Greece, is the controller of the
                  personal data processed through this website and our services.
                </p>
                <p className="mt-2">
                  Privacy enquiries can be submitted through the{" "}
                  <Link href="/start-a-project" className="underline text-black">
                    project enquiry form
                  </Link>
                  .
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  2. Personal Data We Collect
                </h2>
                <p className="mb-3">We may collect the following categories of data:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Account data:</strong> Name, email address, and
                      password stored in hashed form.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Usage data:</strong> Information about how you use
                      our services, including interactions with AI Advisor and
                      Quantus.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Technical data:</strong> IP address, browser type,
                      operating system, device information, and cookies.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Contact data:</strong> Information you provide
                      through contact forms or direct email.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Digital product delivery:</strong> Your email,
                      selected pack, AI experience, PDF language, request time,
                      and download time when you request an AI learning product.
                      We use these details to send your selected PDF through
                      Resend and support access. Requesting a pack does not
                      subscribe you to marketing emails.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Bonusaki pilot data:</strong> If a live merchant
                      pilot is enabled, reward issue and redemption records,
                      signed redemption tokens, cashier validation activity,
                      merchant campaign data, and hashed customer email values
                      where an email is provided.
                    </span>
                  </li>
                </ul>
                <p className="mt-4">
                  {locale === "el"
                    ? "Στα αιτήματα αξιολόγησης συστημάτων παραγγελιών συλλέγουμε τα στοιχεία επικοινωνίας σας, το κατάστημα, την περιοχή, τον ρόλο σας, τις πλατφόρμες που χρησιμοποιείτε, τον τρόπο διανομής και τον επιθυμητό χρόνο αλλαγής. Μαζί με το αίτημα αποστέλλονται η σελίδα προέλευσης και οι διαθέσιμες ενδείξεις καμπάνιας από το URL. Τα χρησιμοποιούμε για να αξιολογήσουμε και να απαντήσουμε στο αίτημά σας μέσω της υπηρεσίας αποστολής email. Η υποβολή δεν αποτελεί εγγραφή σε newsletter ή διαφημιστικό κοινό."
                    : locale === "de"
                      ? "Bei Anfragen zu Bestellsystemen erfassen wir Kontaktdaten, Betrieb, Standort, Rolle, verwendete Plattformen, Liefermöglichkeiten und den gewünschten Wechselzeitpunkt. Die Einstiegsseite und verfügbare Kampagnenangaben aus der URL werden mit der Anfrage übermittelt. Wir verwenden diese Informationen, um die Anfrage über unseren E-Mail-Dienst zu prüfen und zu beantworten. Die Anfrage meldet Sie weder für einen Newsletter noch für eine Werbezielgruppe an."
                      : "Restaurant ordering enquiries include your contact details, business, area, role, current platforms, fulfilment arrangements and intended timing. The enquiry also includes its landing page and available campaign labels from the URL. We use this information to assess and respond to your enquiry through our email delivery service. Submitting an enquiry does not subscribe you to a newsletter or an advertising audience."}
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  3. Legal Bases for Processing
                </h2>
                <p className="mb-3">
                  We process personal data under the GDPR on the following legal bases:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Consent:</strong> For cookies, newsletters, and
                      optional services where consent is required.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Contract performance:</strong> To provide services
                      you request or use.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Legitimate interests:</strong> To improve our
                      services, protect our platform, and communicate with users.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Legal obligation:</strong> Where processing is
                      required by applicable law.
                    </span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  4. Data Retention
                </h2>
                <p>
                  Account data is retained while your account remains active.
                  You may request account deletion at any time. After deletion,
                  personal data is deleted within 30 days unless a longer
                  retention period is required by law or necessary to resolve a
                  dispute.
                </p>
                <p className="mt-3">
                  Digital product download links expire after 7 days. Delivery
                  records become eligible for deletion after 30 days and are
                  removed on the next product access or download request.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  5. Your GDPR Rights
                </h2>
                <p className="mb-3">
                  Subject to applicable law, you may have the right to:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Request access to your personal data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Request correction of inaccurate or incomplete data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Request deletion of your personal data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Request restriction of processing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Object to processing based on legitimate interests.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Request data portability.</span>
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise your rights, submit a request through the{" "}
                  <Link href="/start-a-project" className="underline text-black">
                    project enquiry form
                  </Link>
                  .
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  6. Cookies
                </h2>
                <p className="mb-3">
                  We use cookies to operate the website, improve the user
                  experience, and understand service usage.
                </p>
                <p className="mb-3">
                  Google Analytics and Google Ads measurement are optional and
                  have separate choices in our cookie notice. Neither is loaded
                  until you permit the relevant measurement. We remember your
                  choices in local storage for up to 180 days. Previous consent
                  to analytics alone does not enable advertising measurement.
                  You can reject both, choose either, or change and withdraw
                  permission using the Cookie settings button. Changing a saved
                  choice may reload the page; save any unfinished form first.
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Essential cookies:</strong> Required for core
                      website functionality, authentication, and security.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Analytics cookies:</strong> Help us understand how
                      visitors use the website.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Preference cookies:</strong> Store user preferences
                      where supported.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Ad measurement cookies:</strong> With your permission,
                      Google Ads uses identifiers and successful enquiry events to
                      measure whether advertising leads to enquiries. We do not
                      send the form's name, email, company, or project description
                      to Google Ads. Enhanced conversions and advertising
                      personalization are not enabled by this implementation.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Bonusaki demo events:</strong> Record
                      privacy-safe actions such as demo views, tab switches,
                      scratch-card interactions, wallet-preview clicks, and
                      cashier simulation outcomes. These events do not include
                      reward secrets or customer email addresses.
                    </span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  7. Third-Party Services
                </h2>
                <p className="mb-3">
                  We may use third-party providers that process data on our behalf:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Anthropic AI:</strong> Used to power AI Advisor
                      responses.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Resend:</strong> Used for email delivery, including
                      contact form submissions and notifications.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Google Analytics:</strong> Used for website
                      analytics if enabled.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>
                      <strong>Google Ads:</strong> Used for advertising measurement
                      when you allow it. Google tags can process online identifiers,
                      page and device information, IP addresses, and enquiry-event
                      information. Google may process data outside your country.
                      See Google's{" "}
                      <a className="underline" href="https://policies.google.com/technologies/partner-sites">
                        information about data from partner sites
                      </a>{" "}
                      for its processing practices.
                    </span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  8. Data Security
                </h2>
                <p>
                  We use technical and organizational safeguards designed to
                  protect personal data, including password hashing, HTTPS, and
                  access controls limiting data access to authorized personnel.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  9. Changes to This Policy
                </h2>
                <p>
                  We may update this privacy policy from time to time. Updates
                  will be posted on this page with the revised update date.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="article-heading text-black mb-4">
                  10. Contact
                </h2>
                <p>
                  For questions about this privacy policy or your personal data,
                  contact us:
                </p>
                <p className="mt-3">
                  <strong>BI Solutions Group</strong>
                  <br />
                  Submit a privacy enquiry through the{" "}
                  <Link href="/start-a-project" className="underline text-black">
                    project enquiry form
                  </Link>
                  .
                </p>
                <p className="mt-3">
                  If you believe your rights have not been respected, you may
                  lodge a complaint with the Hellenic Data Protection Authority at{" "}
                  <a
                    href="https://www.dpa.gr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-black"
                  >
                    www.dpa.gr
                  </a>
                  .
                </p>
              </section>
            </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
