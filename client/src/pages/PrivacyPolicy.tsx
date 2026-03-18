import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy Policy"
        description="Privacy policy for BI Solutions Group — how we collect, use, and protect your personal data in accordance with GDPR."
        path="/privacy"
      />
      <Navbar />
      <main id="main-content" className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: March 18, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">1. Data Controller</h2>
              <p>
                BI Solutions | BEKAS IOANNIS ("we", "us", "our") is the data controller responsible for your personal data.
                We are registered in Greece and operate the website bisolutions.group.
              </p>
              <p>
                Contact email for data-related inquiries: <a href="mailto:bekasyannis@gmail.com" className="underline">bekasyannis@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">2. Data We Collect</h2>
              <p>We collect the following categories of personal data:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Contact form submissions:</strong> Name, email address, subject, and message content when you use our contact form.</li>
                <li><strong>Account data:</strong> Email address and hashed password when you create an account for our products (Quantus Investing, Power BI Solutions, Greek AI Professional Advisor).</li>
                <li><strong>Analytics data:</strong> Anonymized usage data collected via Google Analytics 4, including pages visited, session duration, device type, and approximate geographic location. This data is only collected with your consent.</li>
                <li><strong>Technical data:</strong> IP address, browser type, and operating system transmitted automatically when you visit our site.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">3. How We Use Your Data</h2>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>To respond to your contact form inquiries.</li>
                <li>To provide access to our product platforms and authenticate users.</li>
                <li>To improve our website and services based on aggregated analytics (with your consent).</li>
                <li>To comply with legal obligations under Greek and EU law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">4. Legal Basis for Processing</h2>
              <p>We process personal data under the following legal bases as defined in GDPR Article 6:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Consent (Art. 6(1)(a)):</strong> For analytics cookies and marketing communications.</li>
                <li><strong>Contractual necessity (Art. 6(1)(b)):</strong> To provide our product services to registered users.</li>
                <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> To operate and improve our website and respond to inquiries.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">5. Data Sharing</h2>
              <p>We do not sell your personal data. We may share data with the following third parties:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Google Analytics (Google LLC):</strong> Anonymized site usage data, only after you consent to analytics cookies.</li>
                <li><strong>Resend (email service):</strong> Your name, email, and message content when you submit the contact form, solely for email delivery.</li>
                <li><strong>Anthropic:</strong> Query content submitted to our AI Advisor product, used only for generating responses and not stored by us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">6. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Contact form data: Retained in our email system for the duration needed to respond to your inquiry, then deleted.</li>
                <li>Account data: Retained for as long as you maintain an active account. You may request deletion at any time.</li>
                <li>Analytics data: Retained by Google Analytics for up to 14 months, then automatically deleted.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">7. Your Rights (GDPR)</h2>
              <p>Under the General Data Protection Regulation, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Access</strong> — Request a copy of your personal data.</li>
                <li><strong>Rectification</strong> — Request correction of inaccurate data.</li>
                <li><strong>Erasure</strong> — Request deletion of your data ("right to be forgotten").</li>
                <li><strong>Restrict processing</strong> — Request we limit how we use your data.</li>
                <li><strong>Data portability</strong> — Receive your data in a structured, machine-readable format.</li>
                <li><strong>Object</strong> — Object to processing based on legitimate interest.</li>
                <li><strong>Withdraw consent</strong> — Withdraw consent at any time for consent-based processing.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email us at <a href="mailto:bekasyannis@gmail.com" className="underline">bekasyannis@gmail.com</a>.
                We will respond within 30 days as required by GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">8. Cookies</h2>
              <p>
                We use cookies on our website. For full details on which cookies we use and how to manage them,
                please see our <a href="/cookies" className="underline font-medium">Cookie Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">9. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data,
                including HTTPS encryption, password hashing (bcrypt), and secure server infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">10. Supervisory Authority</h2>
              <p>
                If you believe your data protection rights have been violated, you have the right to lodge a complaint with the
                Hellenic Data Protection Authority (HDPA / ΑΠΔΠΧ): <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer" className="underline">www.dpa.gr</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. Any changes will be posted on this page with an updated date.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
