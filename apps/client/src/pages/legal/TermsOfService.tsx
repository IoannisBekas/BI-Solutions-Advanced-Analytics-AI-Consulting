import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Link } from "wouter";

const CONTACT_EMAIL = "BekasYannis@gmail.com";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Terms of Service"
        description="Terms of service for BI Solutions Group products and consulting services."
        path="/terms-of-service"
      />
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-[2.65rem] sm:text-5xl md:text-7xl font-bold font-heading mb-4 leading-[1.05]">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-400 mb-12">Last updated: March 2026</p>
          </ScrollReveal>

          <div className="space-y-12 text-gray-700 leading-relaxed">
            <ScrollReveal delay={0.05}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  1. Services
                </h2>
                <p>
                  BI Solutions Group provides business consulting, data
                  analytics, artificial intelligence, business intelligence, and
                  digital transformation services. Our products and services may
                  include AI Advisor, Quantus, Power BI Solutions, and website
                  or application portfolio services.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  2. User Accounts
                </h2>
                <p>
                  Some services may require an account. You are responsible for
                  keeping your login credentials confidential and for activity
                  under your account. Notify us promptly if you suspect
                  unauthorized use of your account.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  3. Acceptable Use
                </h2>
                <p className="mb-3">When using our services, you agree not to:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Violate applicable laws or regulations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Interfere with platform operation, security, or availability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Use automated access tools without permission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Transmit malicious code or harmful content.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Copy, resell, or redistribute our services without written permission.</span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  4. AI-Generated Content
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
                  <p className="text-sm font-medium text-black mb-2">
                    Important Disclaimer
                  </p>
                  <p className="text-sm text-gray-600">
                    AI Advisor provides general business guidance and does not
                    replace professional legal, accounting, tax, investment, or
                    other specialist advice. Quantus provides market analysis and
                    research for informational purposes only and does not
                    constitute investment advice.
                  </p>
                </div>
                <p>
                  AI-generated content may contain inaccuracies or omissions.
                  Users should independently verify information before making
                  important business, financial, legal, or technical decisions.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  5. Intellectual Property
                </h2>
                <p>
                  The website, platform, code, design, trademarks, content, and
                  related materials are owned by BI Solutions Group or its
                  licensors. You may not copy, reproduce, distribute, modify, or
                  create derivative works from our materials without prior
                  written consent.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  6. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, BI Solutions Group is
                  not liable for indirect, incidental, special, consequential, or
                  punitive damages arising from use of, or inability to use, our
                  services. Services are provided "as is" without warranties of
                  any kind, whether express or implied.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  7. Termination
                </h2>
                <p>
                  We may suspend or terminate access to our services if these
                  terms are violated or if doing so is necessary to protect our
                  platform, users, or legal interests. You may stop using the
                  services at any time.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  8. Governing Law and Disputes
                </h2>
                <p>
                  These terms are governed by Greek law. Any dispute arising from
                  use of our services will be subject to the competent courts of
                  Thessaloniki, Greece. Before starting legal proceedings, we
                  encourage good-faith resolution by contacting{" "}
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
                  9. Changes to These Terms
                </h2>
                <p>
                  We may update these terms from time to time. Updated terms will
                  be posted on this page. Continued use of the services after an
                  update means you accept the revised terms.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  10. Contact
                </h2>
                <p>For questions about these terms, contact us:</p>
                <p className="mt-3">
                  <strong>BI Solutions Group</strong>
                  <br />
                  Email:{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline text-black">
                    {CONTACT_EMAIL}
                  </a>
                </p>
                <p className="mt-4">
                  See our{" "}
                  <Link href="/privacy-policy" className="underline text-black">
                    Privacy Policy
                  </Link>
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
