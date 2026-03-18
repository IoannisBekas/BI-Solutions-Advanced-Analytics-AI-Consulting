import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Terms of Service"
        description="Terms of service for BI Solutions Group — conditions for using our website and product platforms."
        path="/terms"
      />
      <Navbar />
      <main id="main-content" className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: March 18, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using bisolutions.group and any of our product platforms (Quantus Investing,
                Power BI Solutions, Greek AI Professional Advisor), you agree to be bound by these Terms of Service.
                If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">2. Service Description</h2>
              <p>BI Solutions | BEKAS IOANNIS provides:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Analytics, AI, and data consulting services.</li>
                <li><strong>Quantus Investing:</strong> An AI-native quantitative research platform for institutional-grade market analysis.</li>
                <li><strong>Power BI Solutions:</strong> A semantic model analysis and AI-assisted optimization workspace.</li>
                <li><strong>Greek AI Professional Advisor:</strong> AI-powered guidance for accounting, legal, and business consulting in the Greek market.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">3. User Accounts</h2>
              <p>
                Certain products require account registration. You are responsible for maintaining the confidentiality
                of your credentials and for all activities under your account. You must provide accurate information
                and notify us promptly of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">4. Intellectual Property</h2>
              <p>
                All content on bisolutions.group — including text, graphics, logos, software, and design — is the
                property of BI Solutions | BEKAS IOANNIS or its licensors and is protected by copyright and
                intellectual property laws. You may not reproduce, distribute, or create derivative works without
                our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Use our services for any unlawful purpose.</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts.</li>
                <li>Interfere with or disrupt the operation of our services.</li>
                <li>Scrape, crawl, or use automated tools to extract data without permission.</li>
                <li>Submit false or misleading information through our forms or products.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">6. AI-Generated Content Disclaimer</h2>
              <p>
                Our AI-powered products (Greek AI Professional Advisor, Quantus Investing) generate content using
                artificial intelligence. This content is provided for informational purposes only and does not
                constitute professional financial, legal, or accounting advice. Always consult a qualified
                professional before making decisions based on AI-generated output.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, BI Solutions | BEKAS IOANNIS shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from your use of our
                services. Our total liability for any claim shall not exceed the amount you have paid us in the
                12 months preceding the claim, or 100 EUR, whichever is greater.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">8. Disclaimer of Warranties</h2>
              <p>
                Our services are provided "as is" and "as available" without warranties of any kind, either
                express or implied, including but not limited to implied warranties of merchantability, fitness
                for a particular purpose, and non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access to our services at any time, with or
                without cause, and with or without notice. You may also delete your account at any time by
                contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">10. Governing Law</h2>
              <p>
                These terms are governed by and construed in accordance with the laws of Greece and the European Union.
                Any disputes shall be subject to the exclusive jurisdiction of the courts of Thessaloniki, Greece.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">11. Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of our services after changes
                constitutes acceptance of the updated terms. Material changes will be communicated via the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">12. Contact</h2>
              <p>
                For questions about these terms, contact us at <a href="mailto:bekasyannis@gmail.com" className="underline">bekasyannis@gmail.com</a> or
                through our <a href="/contact" className="underline font-medium">contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
