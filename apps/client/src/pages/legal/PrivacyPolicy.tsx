import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const CONTACT_EMAIL = "BekasYannis@gmail.com";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy Policy"
        description="Privacy policy and data protection information for BI Solutions Group, in compliance with GDPR."
        path="/privacy-policy"
      />
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-[2.65rem] sm:text-5xl md:text-7xl font-bold font-heading mb-4 leading-[1.05]">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-400 mb-12">Last updated: March 2026</p>
          </ScrollReveal>

          <div className="space-y-12 text-gray-700 leading-relaxed">
            <ScrollReveal delay={0.05}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  1. Data Controller
                </h2>
                <p>
                  BI Solutions Group, based in Greece, is the controller of the
                  personal data processed through this website and our services.
                </p>
                <p className="mt-2">
                  Contact email:{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline text-black">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
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
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
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
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  4. Data Retention
                </h2>
                <p>
                  Account data is retained while your account remains active.
                  You may request account deletion at any time. After deletion,
                  personal data is deleted within 30 days unless a longer
                  retention period is required by law or necessary to resolve a
                  dispute.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
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
                  To exercise your rights, email{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline text-black">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  6. Cookies
                </h2>
                <p className="mb-3">
                  We use cookies to operate the website, improve the user
                  experience, and understand service usage.
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
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
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
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
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
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
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
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  10. Contact
                </h2>
                <p>
                  For questions about this privacy policy or your personal data,
                  contact us:
                </p>
                <p className="mt-3">
                  <strong>BI Solutions Group</strong>
                  <br />
                  Email:{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline text-black">
                    {CONTACT_EMAIL}
                  </a>
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
      </main>
      <Footer />
    </div>
  );
}
