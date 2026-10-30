import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Footer } from "@/components/layout/Footer";
import { trackEvent } from "@/lib/analytics";
import { RestaurantLeadForm } from "./RestaurantLeadForm";
import { withAssetBase, withSiteBase } from "@/lib/site";
import "./restaurant-landing.css";

export function RestaurantCta({
  children = "Αξιολόγηση καταστήματος",
  secondary = false,
  landingPage,
  placement = "hero",
}: {
  children?: ReactNode;
  secondary?: boolean;
  landingPage: "ordering" | "transition";
  placement?: "hero" | "header" | "mobile_sticky";
}) {
  return (
    <a className={`restaurant-button${secondary ? " restaurant-button--light" : ""}`} href="#axiologisi" onClick={() => trackEvent("restaurant_cta_click", { landing_page: landingPage, placement })}>
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
          <h2 id="restaurant-assessment-title">Το δικό σου κανάλι<br />ξεκινά εδώ.</h2>
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
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [showMobileCta, setShowMobileCta] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".restaurant-hero__actions");
    const assessment = document.getElementById("axiologisi");
    if (!hero || !assessment) return;
    let heroPassed = false;
    let assessmentReached = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroPassed = entry.boundingClientRect.bottom <= 0;
        if (entry.target === assessment) assessmentReached = entry.boundingClientRect.top <= window.innerHeight;
      }
      setShowMobileCta(heroPassed && !assessmentReached);
    });
    observer.observe(hero);
    observer.observe(assessment);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="restaurant-page" lang="el">
      <Seo title={title} description={description} path="/online-paraggelies" translatedLocales={["el"]} />
      <header className="restaurant-header">
        <div className="restaurant-container restaurant-header__inner">
          <a href={withSiteBase("/el/")} className="restaurant-brand" aria-label="BI Solutions Group — αρχική σελίδα">
            <img src={withAssetBase("bi-solutions-logo.png")} width="40" height="40" alt="" />
            <span>BI Solutions Group<span>Advanced Analytics & AI Consulting</span></span>
          </a>
          <nav className="restaurant-header__nav" aria-label="Πλοήγηση για την εστίαση">
            <a href={withSiteBase("/el/")}>Αρχική</a>
            <a href="#paradeigma">Δες το demo</a>
            <a href="#plano-metavasis">Πώς ξεκινάμε</a>
          </nav>
          <div className="restaurant-header__cta"><RestaurantCta landingPage="ordering" placement="header"><span className="restaurant-header__cta-full">Δωρεάν αξιολόγηση</span><span className="restaurant-header__cta-short">Αξιολόγηση</span></RestaurantCta></div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} translate="no">{children}</main>
      <Footer />
      {showMobileCta && <div className="restaurant-mobile-cta" role="region" aria-label="Αξιολόγηση καταστήματος"><RestaurantCta landingPage="ordering" placement="mobile_sticky">Ζήτησε δωρεάν αξιολόγηση</RestaurantCta></div>}
    </div>
  );
}
