import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { RestaurantIllustration } from "@/components/restaurant/RestaurantIllustration";
import paroliCover from "@/assets/case-studies/paroli-cover.webp";
import paroliCoverMobile from "@/assets/case-studies/paroli-cover-800.webp";
import foodHero from "@/assets/restaurant/food-hero.webp";
import foodHeroMobile from "@/assets/restaurant/food-hero-800.webp";
import restaurantOwner from "@/assets/restaurant/restaurant-owner.webp";
import restaurantOwnerMobile from "@/assets/restaurant/restaurant-owner-800.webp";
import { withSiteBase } from "@/lib/site";
import {
  RestaurantAssessment,
  RestaurantCta,
  RestaurantFaq,
  RestaurantLandingLayout,
} from "@/components/restaurant/RestaurantLandingLayout";

const steps = [
  { illustration: "menu", title: "Το μενού σου", description: "Προϊόντα, κατηγορίες και επιλογές, με την ταυτότητα του καταστήματός σου." },
  { illustration: "order", title: "Η παραγγελία", description: "Καλάθι και σαφής ολοκλήρωση για διανομή ή παραλαβή από το κατάστημα." },
  { illustration: "receive", title: "Η λήψη στο κατάστημα", description: "Ο τρόπος ειδοποίησης και διαχείρισης σχεδιάζεται γύρω από τη λειτουργία σου." },
  { illustration: "fulfil", title: "Η εξυπηρέτηση", description: "Η ομάδα σου ετοιμάζει την παραγγελία και αναλαμβάνει την παράδοση ή την παραλαβή." },
] as const;

const faqs = [
  { question: "Πρέπει να φύγω αμέσως από efood, Wolt ή BOX;", answer: "Η αξιολόγηση μπορεί να αφορά είτε σταδιακή μείωση της εξάρτησης είτε πλήρη αποχώρηση. Πρώτα εξετάζουμε τη διανομή, τους επαναλαμβανόμενους πελάτες και το πραγματικό κόστος κάθε επιλογής. Η απόφαση εξαρτάται και από τις συμφωνίες που έχεις με τους σημερινούς συνεργάτες σου." },
  { question: "Ποιος κάνει τη διανομή;", answer: "Το σύστημα παραγγελιών δεν περιλαμβάνει από μόνο του στόλο διανομέων. Χρειάζεται δική σου δυνατότητα διανομής, ξεχωριστή συνεργασία ή παραλαβή από το κατάστημα. Αυτό είναι από τα πρώτα θέματα της αξιολόγησης." },
  { question: "Πόσο κοστίζει η κατασκευή και η λειτουργία;", answer: "Η προσφορά διαχωρίζει εγκατάσταση, λειτουργία, υποστήριξη και τυχόν εξωτερικές υπηρεσίες. Οι πληρωμές, η διανομή και η διαφήμιση μπορεί να έχουν επιπλέον κόστος. Η τελική τιμή προκύπτει αφού οριστεί το εύρος του δικού σου έργου." },
  { question: "Μπορεί να συνδεθεί με το σύστημα που χρησιμοποιώ;", answer: "Οι συνδέσεις με POS, εκτυπωτές, ERP ή παρόχους πληρωμών εξετάζονται πριν την προσφορά. Η δυνατότητα και το κόστος εξαρτώνται από τα συγκεκριμένα συστήματα και τις διαθέσιμες διασυνδέσεις τους." },
  { question: "Αν σταματήσω τις πλατφόρμες, θα κρατήσω όλες τις παραγγελίες;", answer: "Δεν μπορεί να δοθεί τέτοια εγγύηση. Ένα μέρος των πελατών μπορεί να μην ακολουθήσει στο δικό σου κανάλι. Γι’ αυτό εξετάζουμε ρεαλιστικά πόσες παραγγελίες μπορούν να μεταφερθούν και πώς επηρεάζεται το περιθώριο κέρδους σου." },
  { question: "Πώς θα μάθουν οι πελάτες το νέο μου site;", answer: "Το πλάνο μπορεί να περιλαμβάνει τα δικά σου κανάλια, όπως το site, τα κοινωνικά δίκτυα και το Google Business Profile, καθώς και επικοινωνία προς πελάτες όπου επιτρέπεται. Η δημιουργία ενός site από μόνη της δεν φέρνει αυτόματα παραγγελίες." },
  { question: "Το PAROLI είναι πραγματικό έργο πελάτη;", answer: "Το PAROLI παρουσιάζεται εδώ ως ανεξάρτητο δείγμα σχεδιασμού και εμπειρίας απευθείας παραγγελίας. Δεν αποτελεί μαρτυρία πελάτη ή απόδειξη οικονομικών αποτελεσμάτων και το demo δεν αποστέλλει πραγματικές παραγγελίες." },
];

export default function RestaurantOrdering() {
  return (
    <RestaurantLandingLayout title="Δικό σου σύστημα παραγγελιών και πλάνο μετάβασης" description="Θέλεις να μειώσεις την εξάρτηση από efood, Wolt ή BOX; Δες το δικό σου σύστημα παραγγελιών, το demo και το πλάνο μετάβασης. Ζήτησε δωρεάν αρχική αξιολόγηση.">
      <div className="restaurant-hero-stage">
      <nav className="restaurant-container restaurant-breadcrumb" aria-label="Διαδρομή σελίδας"><a href={withSiteBase("/el/")}>BI Solutions Group</a><span aria-hidden="true">/</span><span aria-current="page">Λύσεις για την εστίαση</span></nav>
      <section className="restaurant-container restaurant-hero restaurant-hero--ordering" aria-labelledby="ordering-title">
        <div className="restaurant-hero__copy">
          <p className="restaurant-eyebrow"><span className="restaurant-status-dot" />Για ιδιοκτήτες εστίασης · Απευθείας παραγγελίες</p>
          <h1 id="ordering-title">Απόφυγε τις<br /><em>υπέρογκες χρεώσεις</em><br />των πλατφορμών.</h1>
          <p className="restaurant-hero__description">Δικό σου site. Απευθείας παραγγελίες. Αν σκέφτεσαι να μειώσεις την εξάρτηση από efood, Wolt ή BOX, σχεδιάζουμε το σύστημα και τη μετάβαση γύρω από το δικό σου κατάστημα.</p>
          <div className="restaurant-hero__actions"><RestaurantCta landingPage="ordering">Ζήτησε δωρεάν αξιολόγηση</RestaurantCta><a href="#paradeigma" className="restaurant-text-link">Δες το παράδειγμα <ArrowDown size={16} aria-hidden="true" /></a></div>
          <p className="restaurant-hero__footnote">Δωρεάν αρχική αξιολόγηση. Χωρίς δέσμευση υλοποίησης.</p>
        </div>
        <figure className="restaurant-showcase">
          <div className="restaurant-showcase__scene">
            <img className="restaurant-showcase__food" src={foodHero} srcSet={`${foodHeroMobile} 800w, ${foodHero} 960w`} sizes="(min-width: 851px) 36vw, (min-width: 601px) 540px, calc(100vw - 40px)" alt="Burger, πίτα, πατάτες και καφές σε πάγκο καταστήματος εστίασης" width="960" height="1200" fetchPriority="high" />
            <span className="restaurant-showcase__badge">Το δικό σου φαγητό.</span>
            <a className="restaurant-showcase__demo" href="https://ioannisbekas.github.io/paroli/" target="_blank" rel="noopener noreferrer" aria-label="Δες το ανεξάρτητο demo παραγγελιών PAROLI σε νέα καρτέλα">
              <span className="restaurant-showcase__browser"><span aria-hidden="true">● ● ●</span>Το δικό σου site <ArrowUpRight size={13} aria-hidden="true" /></span>
              <img src={paroliCoverMobile} alt="Προεπισκόπηση του demo PAROLI με μενού και καλάθι παραγγελίας" width="800" height="450" />
              <span className="restaurant-showcase__demo-label"><Check size={15} aria-hidden="true" />Απευθείας στο κατάστημά σου.</span>
            </a>
          </div>
          <figcaption><strong>Η επωνυμία σου. Σε κάθε παραγγελία.</strong><span>Ενδεικτική παρουσίαση με το demo PAROLI.</span></figcaption>
        </figure>
      </section>
      </div>

      <div className="restaurant-audience-strip"><div className="restaurant-container"><span>Για καταστήματα με τη δική τους ταυτότητα.</span><strong>Καφέ</strong><strong>Ψητοπωλεία</strong><strong>Εστιατόρια</strong><strong>Takeaway</strong></div></div>

      <section className="restaurant-section restaurant-container" aria-labelledby="ordering-flow-title">
        <div className="restaurant-section__heading"><div><p className="restaurant-eyebrow">Η διαδρομή της παραγγελίας</p><h2 id="ordering-flow-title">Το δικό σου μενού.<br />Οι δικές σου παραγγελίες.</h2></div><p>Από την επιλογή του πελάτη μέχρι τη λήψη στο κατάστημα, σχεδιάζουμε μια ροή που μπορείς να χρησιμοποιείς καθημερινά.</p></div>
        <ol className="restaurant-flow">{steps.map(({ illustration, title, description }, index) => <li key={title}><span className="restaurant-flow__number">0{index + 1}</span><RestaurantIllustration kind={illustration} /><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </section>

      <section id="paradeigma" className="restaurant-demo-section" aria-labelledby="ordering-demo-title">
        <div className="restaurant-container restaurant-demo-section__grid">
          <div><p className="restaurant-eyebrow">Δες την ιδέα στην πράξη</p><h2 id="ordering-demo-title">Η δική σου επωνυμία,<br />σε κάθε βήμα.</h2><p>Το PAROLI δείχνει πώς μπορούν να συνδυαστούν παρουσίαση καταστήματος, κατάλογος και καλάθι σε μια ενιαία εμπειρία.</p><a className="restaurant-button restaurant-button--light" href="https://ioannisbekas.github.io/paroli/" target="_blank" rel="noopener noreferrer">Άνοιξε το demo PAROLI <ArrowUpRight size={18} aria-hidden="true" /></a><p className="restaurant-demo-section__disclaimer">Ανεξάρτητο δείγμα παρουσίασης. Δεν είναι ενεργό σύστημα παραγγελιών πελάτη.</p></div>
          <figure className="restaurant-demo-preview"><div className="restaurant-showcase__browser"><span aria-hidden="true">● ● ●</span>PAROLI · Δείγμα online παραγγελιών</div><a href="https://ioannisbekas.github.io/paroli/" target="_blank" rel="noopener noreferrer" aria-label="Άνοιγμα του ανεξάρτητου demo PAROLI σε νέα καρτέλα"><img src={paroliCover} alt="Σελίδα του demo PAROLI: μενού ψητοπωλείου, επιλογή καταστήματος και καλάθι" width="2880" height="1620" loading="lazy" /></a><figcaption>Μενού, επιλογές και καλάθι. Δες ολόκληρη την εμπειρία στο demo.</figcaption></figure>
        </div>
      </section>

      <section id="plano-metavasis" className="restaurant-section restaurant-container" aria-labelledby="transition-plan-title">
        <div className="restaurant-section__heading restaurant-transition-heading">
          <div><p className="restaurant-eyebrow">Πώς ξεκινάμε μαζί</p><h2 id="transition-plan-title">Λιγότερη εξάρτηση.<br />Με συγκεκριμένο πλάνο.</h2><p className="restaurant-transition-intro">Εξετάζουμε τους πελάτες σου, τη δυνατότητα διανομής ή παραλαβής και το συνολικό κόστος. Έτσι, το σύστημα και η μετάβαση σχεδιάζονται ως ένα έργο.</p></div>
          <figure className="restaurant-transition-photo"><img src={restaurantOwner} srcSet={`${restaurantOwnerMobile} 800w, ${restaurantOwner} 1200w`} sizes="(min-width: 851px) 35vw, (min-width: 601px) 45vw, calc(100vw - 40px)" alt="Εικαστική απεικόνιση επαγγελματία εστίασης που οργανώνει τις παραγγελίες του με tablet" width="1200" height="800" loading="lazy" /></figure>
        </div>
        <ol className="restaurant-transition-steps"><li><RestaurantIllustration kind="customers" /><span>01 / Αποτύπωση</span><h3>Βλέπουμε πώς<br />λειτουργείς σήμερα.</h3><p>Παραγγελίες, πραγματικές χρεώσεις, επαναλαμβανόμενοι πελάτες και δυνατότητα διανομής. Συζητάμε τι θέλεις να αλλάξεις.</p></li><li><RestaurantIllustration kind="cost" /><span>02 / Σύγκριση</span><h3>Υπολογίζουμε<br />το συνολικό κόστος.</h3><p>Συγκρίνουμε τις χρεώσεις που αποφεύγονται με τα κόστη του δικού σου καναλιού και τις παραγγελίες που μπορεί να μη μεταφερθούν.</p></li><li><RestaurantIllustration kind="plan" /><span>03 / Υλοποίηση</span><h3>Σχεδιάζουμε σύστημα<br />και βήματα μετάβασης.</h3><p>Ορίζουμε μενού, λήψη παραγγελιών, διανομή ή παραλαβή, υποστήριξη και τρόπο ενημέρωσης των πελατών σου.</p></li></ol>
      </section>

      <RestaurantAssessment landingPage="ordering" />
      <RestaurantFaq items={faqs} />
    </RestaurantLandingLayout>
  );
}
