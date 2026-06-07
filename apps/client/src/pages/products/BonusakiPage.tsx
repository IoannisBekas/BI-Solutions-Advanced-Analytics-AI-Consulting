import {
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  Gift,
  LineChart,
  QrCode,
  ShieldCheck,
  Smartphone,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProductPageHero } from "@/components/sections/ProductPageHero";
import { Seo } from "@/components/seo/Seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { withPublicSiteOrigin, withSiteBase } from "@/lib/site";

const BONUSAKI_DEMO_URL =
  import.meta.env.VITE_BONUSAKI_DEMO_URL ||
  withPublicSiteOrigin("/bonusaki/demo/");

const heroHighlights = [
  {
    label: "Customer entry",
    value: "Unique QR codes turn everyday purchases into instant scratch-and-win moments.",
    icon: QrCode,
  },
  {
    label: "Reward flow",
    value: "Prizes land in a wallet-style pass so customers can redeem without installing an app.",
    icon: Smartphone,
  },
  {
    label: "Merchant view",
    value: "Campaign stats, prize weights, redemptions, and customer capture live in one dashboard.",
    icon: Store,
  },
];

const features = [
  {
    icon: QrCode,
    title: "QR-Led Acquisition",
    description:
      "Each cup, receipt, or package can carry a unique scan entry that starts the customer flow immediately.",
  },
  {
    icon: Gift,
    title: "Every-Scan-Wins Mechanics",
    description:
      "Merchants can tune prize tiers while keeping the experience simple: every valid scan resolves to one reward.",
  },
  {
    icon: Smartphone,
    title: "Wallet-First Redemption",
    description:
      "The demo shows the intended wallet-pass handoff and a cashier flow for valid, used, and invalid rewards.",
  },
  {
    icon: LineChart,
    title: "Merchant Campaign Analytics",
    description:
      "Operators can inspect scans, redemption rates, reward distribution, and probability weights from the merchant view.",
  },
  {
    icon: ShieldCheck,
    title: "Single-Use Control Model",
    description:
      "The public demo uses mock data, while the pilot API supports signed, single-use redemption tokens when production controls are enabled.",
  },
  {
    icon: BadgeCheck,
    title: "Local-Business Fit",
    description:
      "Bonusaki is shaped for cafes, food service, and quick-service businesses that need lightweight loyalty without another app install.",
  },
];

const launchChecklist = [
  "Open the public Bonusaki demo on the BI Solutions domain.",
  "Try the customer scratch-card flow, merchant dashboard, and cashier validation states.",
  "Use the product page to discuss a merchant pilot with real campaign rules, cashier controls, and prize inventory.",
];

const bonusakiFaqs = [
  {
    question: "What is Bonusaki?",
    answer:
      "Bonusaki is a scratch-and-win loyalty product concept for local merchants. Customers scan a QR code, play for an instant reward, and redeem the prize through a wallet-style pass.",
  },
  {
    question: "Is the public Bonusaki demo connected to production data?",
    answer:
      "No. The hosted demo is UI-only and uses mock data so visitors can inspect the customer, merchant, and cashier experience safely.",
  },
  {
    question: "Is Bonusaki ready for a real merchant pilot?",
    answer:
      "The public product and demo are live, and the server has a production-pilot foundation for signed rewards, validation, redemption, and audit logs. A real pilot still needs merchant rules, prize inventory, and production secrets before live customers scan campaign QR codes.",
  },
  {
    question: "Who is Bonusaki built for?",
    answer:
      "It is designed for cafes, food service, and local retailers that want a low-friction campaign mechanic tied to real purchases and email capture.",
  },
];

export default function BonusakiPage() {
  const trackBonusakiClick = (action: string) => {
    trackEvent("bonusaki_product_click", {
      action,
      product: "bonusaki",
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Bonusaki | Scratch-and-Win Loyalty Demo"
        description="Bonusaki is a QR-led scratch-and-win loyalty product demo for cafes and local merchants, with customer, merchant, and cashier flows."
        path={PRODUCT_ROUTE_ALIASES.bonusaki}
        keywords={[
          "Bonusaki",
          "scratch and win loyalty",
          "QR loyalty campaign",
          "cafe loyalty app",
          "wallet pass redemption",
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: "Bonusaki",
              url: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.bonusaki}`,
              description:
                "QR-led scratch-and-win loyalty product demo for local merchants.",
            },
            {
              "@type": "SoftwareApplication",
              name: "Bonusaki",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.bonusaki}`,
              publisher: {
                "@type": "Organization",
                name: "BI Solutions Group",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: bonusakiFaqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.bisolutions.group/" },
                { "@type": "ListItem", position: 2, name: "Products", item: "https://www.bisolutions.group/products" },
                { "@type": "ListItem", position: 3, name: "Bonusaki", item: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.bonusaki}` },
              ],
            },
          ],
        }}
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <section className="relative overflow-hidden">
          <ScrollReveal width="100%">
            <ProductPageHero
              icon={Gift}
              eyebrow="QR loyalty product demo"
              title="Bonusaki"
              description="A scratch-and-win loyalty engine for cafes and local merchants: customers scan, play, receive a reward, and redeem it through a wallet-style cashier flow."
              actions={(
                <>
                  <Button
                    asChild
                    className="rounded-full bg-black px-8 text-white hover:bg-gray-800"
                  >
                    <a
                      href={BONUSAKI_DEMO_URL}
                      onClick={() => trackBonusakiClick("open_demo_hero")}
                    >
                      Open Bonusaki demo
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-gray-300 px-8"
                  >
                    <a
                      href={withSiteBase("/contact")}
                      onClick={() => trackBonusakiClick("discuss_rollout")}
                    >
                      Discuss a rollout
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </>
              )}
              footer={(
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {heroHighlights.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-5"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {item.label}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-gray-700">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </ScrollReveal>
        </section>

        <section className="px-6 py-16 md:px-12">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal width="100%">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600">
                  <Gift className="h-4 w-4" />
                  Product workflow
                </div>
                <h2 className="mt-6 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                  Loyalty that starts at the point of purchase.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">
                  Bonusaki is built around a simple loop: scan, capture, reward,
                  redeem, and measure. The public demo keeps that loop visible
                  across customer, merchant, and cashier surfaces.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <ScrollReveal
                    key={feature.title}
                    delay={index * 0.06}
                    width="100%"
                    className="h-full"
                  >
                    <Card className="h-full rounded-3xl border-gray-200 bg-white/90 p-6 shadow-lg shadow-black/5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold font-heading tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {feature.description}
                      </p>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 px-6 py-16 md:px-12">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <ScrollReveal width="100%">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600">
                  <QrCode className="h-4 w-4" />
                  Hosted preview
                </div>
                <h2 className="mt-6 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                  Try the full demo flow under BI Solutions.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">
                  The hosted demo is deliberately mock-data only. It is meant to
                  show the end-to-end experience without exposing production
                  merchant data, payment flows, or live redemption records.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    asChild
                    className="rounded-full bg-black px-8 text-white hover:bg-gray-800"
                  >
                    <a
                      href={BONUSAKI_DEMO_URL}
                      onClick={() => trackBonusakiClick("open_demo_preview")}
                    >
                      Launch demo
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-gray-300 px-8"
                  >
                    <a
                      href={withSiteBase("/products")}
                      onClick={() => trackBonusakiClick("back_to_products")}
                    >
                      Back to products
                    </a>
                  </Button>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} width="100%">
              <Card className="rounded-3xl border-gray-200 bg-white p-6 shadow-xl shadow-black/5">
                <h3 className="text-2xl font-bold font-heading tracking-tight">
                  Demo checklist
                </h3>
                <div className="mt-6 space-y-4">
                  {launchChecklist.map((item, index) => (
                    <div key={item} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-sm leading-relaxed text-gray-600">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        <section className="px-6 py-16 md:px-12">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal width="100%">
              <h2 className="text-4xl font-bold font-heading tracking-tight">
                Bonusaki FAQ
              </h2>
            </ScrollReveal>
            <div className="mt-8 space-y-4">
              {bonusakiFaqs.map((faq, index) => (
                <ScrollReveal
                  key={faq.question}
                  delay={index * 0.06}
                  width="100%"
                >
                  <Card className="rounded-3xl border-gray-200 bg-white p-6 shadow-lg shadow-black/5">
                    <h3 className="text-lg font-bold font-heading tracking-tight">
                      {faq.question}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
