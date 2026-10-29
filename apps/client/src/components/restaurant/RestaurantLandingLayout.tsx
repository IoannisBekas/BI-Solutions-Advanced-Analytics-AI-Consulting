import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/CookieConsent";
import { RestaurantLeadForm } from "./RestaurantLeadForm";
import { restaurantCampaignHref } from "@/lib/restaurantLead";
import { withAssetBase, withSiteBase } from "@/lib/site";
import "./restaurant-landing.css";

export function RestaurantCampaignLink({
  path,
  children,
  className,
}: {
  path: string;
  children: ReactNode;
  className?: string;
}) {
  const [href, setHref] = useState(withSiteBase(path));
  useEffect(() => {
    setHref(restaurantCampaignHref(withSiteBase(path), window.location.search));
  }, [path]);
  return <a href={href} className={className}>{children}</a>;
}

export function RestaurantCta({
  children = "Αξιολόγηση καταστήματος",
  secondary = false,
}: {
  children?: ReactNode;
  secondary?: boolean;
}) {
  return (
    <a className={`restaurant-button${secondary ? " restaurant-button--light" : ""}`} href="#axiologisi">
      <span>{children}</span><ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

export function RestaurantFaq({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <section className="restaurant-section restaurant-container restaurant-faq" aria-labelledby="restaurant-faq-title">
      <div>
        <p className="restaurant-eyebrow">Πριν αποφασίσεις</p>
        <h2 id="restaurant-faq-title">Οι ερωτήσεις που<br />αξίζει να κάνεις.</h2>
      </div>
      <div className="restaurant-faq__items">
        {items.map(({ question, answer }) => (
          <details key={question}>
            <summary>{question}<Plus size={19} aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function RestaurantAssessment({ landingPage }: { landingPage: "ordering" | "transition" }) {
  return (
    <section id="axiologisi" className="restaurant-assessment" aria-labelledby="restaurant-assessment-title">
      <div className="restaurant-container restaurant-assessment__grid">
        <div className="restaurant-assessment__intro">
          <p className="restaurant-eyebrow">Ας δούμε το δικό σου κατάστημα</p>
          <h2 id="restaurant-assessment-title">Το επόμενο βήμα<br />ξεκινά από εσένα.</h2>
          <p>Πες μας πώς λειτουργείς σήμερα και τι θέλεις να αλλάξεις. Θα εξετάσουμε μαζί αν ένα δικό σου κανάλι παραγγελιών ταιριάζει στην επιχείρησή σου.</p>
          <ul className="restaurant-checks">
            <li><Check size={18} aria-hidden="true" />Σύντομη αρχική αξιολόγηση, χωρίς χρέωση.</li>
            <li><Check size={18} aria-hidden="true" />Συγκεκριμένη πρόταση με βάση τις ανάγκες σου.</li>
            <li><Check size={18} aria-hidden="true" />Καμία δέσμευση για την υλοποίηση.</li>
          </ul>
          <div className="restaurant-assessment__note">
            <span className="restaurant-monogram" aria-hidden="true">BI</span>
            <div><strong>BI Solutions Group</strong><span>Από την αξιολόγηση μέχρι την παράδοση.</span></div>
          </div>
        </div>
        <RestaurantLeadForm landingPage={landingPage} />
      </div>
    </section>
  );
}

export function RestaurantLandingLayout({
  page,
  title,
  description,
  children,
}: {
  page: "ordering" | "transition";
  title: string;
  description: string;
  children: ReactNode;
}) {
  const path = page === "ordering" ? "/online-paraggelies" : "/meiosi-kostous-delivery";
  return (
    <div className="restaurant-page" lang="el" translate="no">
      <Seo title={title} description={description} path={path} translatedLocales={["el"]} />
      <header className="restaurant-header">
        <div className="restaurant-container restaurant-header__inner">
          <a href={withSiteBase("/el/")} className="restaurant-brand" aria-label="BI Solutions Group — αρχική σελίδα">
            <img src={withAssetBase("assets/brand/bi-solutions-group-mark.png")} width="38" height="38" alt="" />
            <span>BI SOLUTIONS<span>GROUP</span></span>
          </a>
          <nav className="restaurant-header__nav" aria-label="Σελίδες για την εστίαση">
            <RestaurantCampaignLink path="/el/online-paraggelies" className={page === "ordering" ? "is-active" : undefined}>Το δικό σου σύστημα</RestaurantCampaignLink>
            <RestaurantCampaignLink path="/el/meiosi-kostous-delivery" className={page === "transition" ? "is-active" : undefined}>Πλάνο μετάβασης</RestaurantCampaignLink>
          </nav>
          <a href="#axiologisi" className="restaurant-header__cta">Ας μιλήσουμε <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="restaurant-footer">
        <div className="restaurant-container restaurant-footer__inner">
          <div><strong>BI Solutions Group</strong><p>Ψηφιακά συστήματα για πραγματικές επιχειρήσεις.</p></div>
          <div className="restaurant-footer__links">
            <a href={withSiteBase("/el/privacy-policy")}>Απόρρητο</a>
            <a href={withSiteBase("/el/terms-of-service")}>Όροι χρήσης</a>
            <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}>Ρυθμίσεις cookies</button>
            <a href={withSiteBase("/el/start-a-project")}>Επικοινωνία <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
