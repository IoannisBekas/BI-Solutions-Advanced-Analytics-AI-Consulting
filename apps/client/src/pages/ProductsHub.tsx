import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import type { Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { withSiteBase } from "@/lib/site";

const products = [
  { name: "Quantus Investing", href: "/quantus/workspace/" },
  { name: "Power BI Solutions", href: "/power-bi-solutions/workspace/" },
  { name: "Bonusaki", href: "/bonusaki/demo/" },
] as const;

const copy: Record<Locale, {
  title: string;
  description: string;
  open: readonly [string, string, string];
  descriptions: readonly [string, string, string];
}> = {
  en: {
    title: "Products & tools",
    description: "Explore our workspaces for investment research, Power BI model diagnostics, and customer loyalty.",
    open: ["Open Quantus", "Open Power BI Solutions", "Try the Bonusaki demo"],
    descriptions: [
      "Research companies and explore market data in a dedicated investment research workspace.",
      "Inspect Power BI semantic models and identify areas to investigate for performance and maintainability.",
      "Explore how a small business can offer digital loyalty rewards to returning customers.",
    ],
  },
  el: {
    title: "Προϊόντα και εργαλεία",
    description: "Εξερευνήστε τα εργαλεία μας για επενδυτική έρευνα, διάγνωση μοντέλων Power BI και επιβράβευση πελατών.",
    open: ["Ανοίξτε το Quantus", "Ανοίξτε το Power BI Solutions", "Δοκιμάστε το Bonusaki"],
    descriptions: [
      "Μελετήστε εταιρείες και εξερευνήστε δεδομένα αγορών σε έναν χώρο επενδυτικής έρευνας.",
      "Εξετάστε σημασιολογικά μοντέλα Power BI και εντοπίστε σημεία προς διερεύνηση για την απόδοση και τη συντήρησή τους.",
      "Δείτε πώς μια μικρή επιχείρηση μπορεί να προσφέρει ψηφιακή επιβράβευση στους πελάτες που επιστρέφουν.",
    ],
  },
  de: {
    title: "Produkte und Tools",
    description: "Entdecken Sie unsere Tools für Investmentrecherche, Power-BI-Modelldiagnose und Kundenbindung.",
    open: ["Quantus öffnen", "Power BI Solutions öffnen", "Bonusaki-Demo ausprobieren"],
    descriptions: [
      "Recherchieren Sie Unternehmen und analysieren Sie Marktdaten in einer eigenen Umgebung für Investmentrecherche.",
      "Prüfen Sie semantische Power-BI-Modelle auf mögliche Verbesserungen bei Leistung und Wartbarkeit.",
      "Sehen Sie, wie kleine Unternehmen wiederkehrende Kunden mit einem digitalen Treueprogramm belohnen können.",
    ],
  },
};

export default function ProductsHub() {
  const { locale } = useLocale();
  const page = copy[locale];

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Seo title={page.title} description={page.description} path="/tools" />
      <Navbar />
      <main className="page-main">
        <div className="site-container py-16 sm:py-24">
          <h1 className="page-title max-w-3xl">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">{page.description}</p>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {products.map(({ name, href }, index) => (
              <li key={href} className="flex flex-col rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight">{name}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{page.descriptions[index]}</p>
                <a
                  href={withSiteBase(href)}
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                >
                  {page.open[index]}
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
