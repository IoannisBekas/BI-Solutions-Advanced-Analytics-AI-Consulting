import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Cookie Policy"
        description="Cookie policy for BI Solutions Group — what cookies we use, why, and how to manage your preferences."
        path="/cookies"
      />
      <Navbar />
      <main id="main-content" className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: March 18, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">1. What Are Cookies</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help the site
                remember your preferences and understand how you interact with it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">2. Cookies We Use</h2>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-black border-b border-gray-200">Cookie</th>
                      <th className="text-left p-3 font-semibold text-black border-b border-gray-200">Provider</th>
                      <th className="text-left p-3 font-semibold text-black border-b border-gray-200">Purpose</th>
                      <th className="text-left p-3 font-semibold text-black border-b border-gray-200">Duration</th>
                      <th className="text-left p-3 font-semibold text-black border-b border-gray-200">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-mono text-xs">bisolutions-cookie-consent</td>
                      <td className="p-3">BI Solutions</td>
                      <td className="p-3">Stores your cookie consent preference</td>
                      <td className="p-3">365 days</td>
                      <td className="p-3">Essential</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-mono text-xs">_ga</td>
                      <td className="p-3">Google Analytics</td>
                      <td className="p-3">Distinguishes unique visitors</td>
                      <td className="p-3">2 years</td>
                      <td className="p-3">Analytics</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-mono text-xs">_ga_*</td>
                      <td className="p-3">Google Analytics</td>
                      <td className="p-3">Maintains session state</td>
                      <td className="p-3">2 years</td>
                      <td className="p-3">Analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">3. Essential Cookies</h2>
              <p>
                Essential cookies are required for the website to function and cannot be disabled. These include
                the cookie consent preference cookie and authentication tokens for our product platforms
                (stored in localStorage, not as cookies).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">4. Analytics Cookies</h2>
              <p>
                We use Google Analytics 4 (GA4) to understand how visitors interact with our website. These cookies
                are only set after you consent to analytics cookies via our cookie banner. GA4 data is anonymized
                and we do not use it to personally identify you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">5. Managing Your Preferences</h2>
              <p>
                When you first visit our site, a cookie consent banner will appear allowing you to accept or decline
                analytics cookies. You can change your preference at any time by:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Clearing your browser cookies and revisiting the site to see the banner again.</li>
                <li>Using your browser settings to block or delete specific cookies.</li>
              </ul>
              <p className="mt-3">
                Note: Disabling all cookies may affect the functionality of our products.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">6. Third-Party Cookies</h2>
              <p>
                We use Google Analytics, which is a service provided by Google LLC (USA). Google may transfer
                data outside the EU. Google has committed to adequate data protection measures under the
                EU-US Data Privacy Framework.
              </p>
              <p className="mt-3">
                Learn more about Google's privacy practices: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Google Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mt-8 mb-3">7. Contact</h2>
              <p>
                For questions about our use of cookies, contact us at <a href="mailto:bekasyannis@gmail.com" className="underline">bekasyannis@gmail.com</a>.
              </p>
              <p className="mt-3">
                See also our <a href="/privacy" className="underline font-medium">Privacy Policy</a> for more information on how we handle your personal data.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
