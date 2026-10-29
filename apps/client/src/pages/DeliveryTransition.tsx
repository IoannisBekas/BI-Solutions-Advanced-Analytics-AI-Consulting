import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { RestaurantIllustration } from "@/components/restaurant/RestaurantIllustration";
import restaurantOwner from "@/assets/restaurant/restaurant-owner.webp";
import restaurantOwnerMobile from "@/assets/restaurant/restaurant-owner-800.webp";
import { withSiteBase } from "@/lib/site";
import {
  RestaurantAssessment,
  RestaurantCampaignLink,
  RestaurantCta,
  RestaurantFaq,
  RestaurantLandingLayout,
} from "@/components/restaurant/RestaurantLandingLayout";

const faqs = [
  { question: "Αν σταματήσω τις πλατφόρμες, θα κρατήσω όλες τις παραγγελίες;", answer: "Δεν μπορεί να δοθεί τέτοια εγγύηση. Ένα μέρος των πελατών μπορεί να μην ακολουθήσει στο δικό σου κανάλι. Γι’ αυτό εξετάζουμε ρεαλιστικά πόσες παραγγελίες μπορούν να μεταφερθούν και πώς επηρεάζεται το περιθώριο κέρδους σου." },
  { question: "Η δική μου ιστοσελίδα σημαίνει μηδενικό κόστος;", answer: "Όχι. Η εγκατάσταση, η λειτουργία, οι ηλεκτρονικές πληρωμές, η διανομή, η υποστήριξη και η προσέλκυση πελατών έχουν δικά τους κόστη. Η αξιολόγηση συγκρίνει τα συνολικά κόστη των επιλογών σου με βάση τα πραγματικά στοιχεία του καταστήματος." },
  { question: "Μπορώ να ξεκινήσω με παραλαβή από το κατάστημα;", answer: "Η παραλαβή μπορεί να εξεταστεί ως αρχικό σενάριο όταν ταιριάζει στον τρόπο που λειτουργεί το κατάστημα. Ο τρόπος παραγγελίας, πληρωμής, ενημέρωσης και παραλαβής ορίζεται στο συμφωνημένο εύρος του έργου." },
  { question: "Πώς θα μάθουν οι πελάτες το νέο μου site;", answer: "Το πλάνο μπορεί να περιλαμβάνει τα δικά σου κανάλια, όπως το site, τα κοινωνικά δίκτυα, το Google Business Profile και επικοινωνία προς πελάτες όπου επιτρέπεται. Τυχόν προώθηση μέσα από συνεργασίες πλατφορμών εξετάζεται σε σχέση με τους όρους τους. Η δημιουργία ενός site από μόνη της δεν φέρνει αυτόματα παραγγελίες." },
];

export default function DeliveryTransition() {
  return (
    <RestaurantLandingLayout page="transition" title="Μείωση κόστους delivery και απευθείας παραγγελίες" description="Σκέφτεσαι να μειώσεις την εξάρτηση από efood, Wolt ή BOX; Αξιολόγησε διανομή, πελατεία και πραγματικά κόστη πριν δημιουργήσεις το δικό σου σύστημα παραγγελιών.">
      <div className="restaurant-hero-stage">
      <nav className="restaurant-container restaurant-breadcrumb" aria-label="Διαδρομή σελίδας"><a href={withSiteBase("/el/")}>BI Solutions Group</a><span aria-hidden="true">/</span><span aria-current="page">Λύσεις για την εστίαση</span></nav>
      <section className="restaurant-container restaurant-hero restaurant-hero--transition" aria-labelledby="transition-title">
        <div className="restaurant-hero__copy">
          <p className="restaurant-eyebrow"><span className="restaurant-status-dot" />Μείωση κόστους delivery · Απευθείας παραγγελίες</p>
          <h1 id="transition-title">Οι προμήθειες<br />κοστίζουν.<br /><em>Πάρε τον έλεγχο.</em></h1>
          <p className="restaurant-hero__description">Αν το κόστος σε κάνει να επανεξετάζεις efood, Wolt ή BOX, ξεκίνα από τα στοιχεία του δικού σου καταστήματος. Δες τι χρειάζεται για απευθείας παραγγελίες και αν η μετάβαση σε συμφέρει.</p>
          <div className="restaurant-hero__actions"><RestaurantCta landingPage="transition">Ζήτησε δωρεάν αξιολόγηση</RestaurantCta><a href="#plano-metavasis" className="restaurant-text-link">Πώς το εξετάζουμε <ArrowDown size={16} aria-hidden="true" /></a></div>
          <p className="restaurant-hero__footnote">Για ιδιοκτήτες εστίασης. Δωρεάν αρχική αξιολόγηση, χωρίς δέσμευση.</p>
        </div>
        <div className="restaurant-decision" aria-label="Οι τρεις πλευρές μιας απόφασης μετάβασης">
          <figure className="restaurant-decision__photo"><img src={restaurantOwner} srcSet={`${restaurantOwnerMobile} 800w, ${restaurantOwner} 1200w`} sizes="(min-width: 851px) 40vw, (min-width: 601px) 560px, calc(100vw - 40px)" alt="Εικαστική απεικόνιση επαγγελματία εστίασης που χρησιμοποιεί tablet στον πάγκο του καταστήματός του" width="1200" height="800" fetchPriority="high" /><figcaption>Η δική σου επιχείρηση.<br /><strong>Οι δικές σου επιλογές.</strong></figcaption></figure>
          <p className="restaurant-decision__title">Πρώτα οι αριθμοί.<br /><em>Μετά η αλλαγή.</em></p>
          <ul><li><RestaurantIllustration kind="customers" /><div><strong>Οι πελάτες που μπορούν να ακολουθήσουν</strong><p>Πόσες παραγγελίες μπορούν ρεαλιστικά να μεταφερθούν;</p></div></li><li><RestaurantIllustration kind="delivery" /><div><strong>Η διανομή που μπορείς να στηρίξεις</strong><p>Δική σου ομάδα, συνεργάτης ή παραλαβή;</p></div></li><li><RestaurantIllustration kind="cost" /><div><strong>Το συνολικό κόστος λειτουργίας</strong><p>Τι αποφεύγεις και τι χρειάζεται να αναλάβεις;</p></div></li></ul>
          <div className="restaurant-decision__bottom"><Check size={17} aria-hidden="true" />Αξιολόγηση με τα δικά σου δεδομένα.</div>
        </div>
      </section>
      </div>

      <section id="plano-metavasis" className="restaurant-section restaurant-container" aria-labelledby="transition-plan-title">
        <div className="restaurant-section__heading"><div><p className="restaurant-eyebrow">Πώς σχεδιάζεται η μετάβαση</p><h2 id="transition-plan-title">Λιγότερη εξάρτηση.<br />Με συγκεκριμένο πλάνο.</h2></div><p>Η μείωση της εξάρτησης και η πλήρης αποχώρηση είναι διαφορετικές αποφάσεις. Το πλάνο ξεκινά από αυτό που θέλεις να πετύχεις.</p></div>
        <ol className="restaurant-transition-steps"><li><RestaurantIllustration kind="customers" /><span>01 / Αποτύπωση</span><h3>Βλέπουμε πώς<br />λειτουργείς σήμερα.</h3><p>Παραγγελίες, χρεώσεις, δυνατότητα διανομής και επαναλαμβανόμενοι πελάτες. Συζητάμε τι θέλεις να αλλάξεις και πότε.</p></li><li><RestaurantIllustration kind="cost" /><span>02 / Σύγκριση</span><h3>Υπολογίζουμε<br />το πραγματικό κόστος.</h3><p>Συγκρίνουμε τις χρεώσεις που αποφεύγονται με τα πρόσθετα κόστη και τις παραγγελίες που ενδέχεται να μη μεταφερθούν.</p></li><li><RestaurantIllustration kind="plan" /><span>03 / Πρόταση</span><h3>Ορίζουμε μια<br />συγκεκριμένη διαδρομή.</h3><p>Αν υπάρχει κατάλληλο σενάριο, προτείνουμε το σύστημα, τη ροή λήψης παραγγελιών και τα βήματα έναρξης.</p></li></ol>
      </section>

      <section className="restaurant-comparison-section" aria-labelledby="transition-comparison-title">
        <div className="restaurant-container"><div className="restaurant-section__heading"><div><p className="restaurant-eyebrow">Διαφορετικά κανάλια, διαφορετικές ανάγκες</p><h2 id="transition-comparison-title">Τι χρειάζεται να<br />συγκρίνεις πραγματικά.</h2></div><p>Οι όροι κάθε πλατφόρμας και κάθε υλοποίησης διαφέρουν. Τα παρακάτω είναι τα θέματα που εξετάζουμε για τη δική σου περίπτωση.</p></div>
          <div className="restaurant-comparison" role="table" aria-label="Θέματα σύγκρισης πλατφόρμας και δικού σου καναλιού">
            <div className="restaurant-comparison__row restaurant-comparison__row--head" role="row"><span role="columnheader">Το ερώτημα</span><strong role="columnheader">Στην πλατφόρμα</strong><strong role="columnheader">Στο δικό σου κανάλι</strong></div>
            <div className="restaurant-comparison__row" role="row"><strong role="rowheader">Πώς έρχεται ο πελάτης;</strong><span role="cell">Μέσα από την παρουσία σου στην πλατφόρμα.</span><span role="cell">Από τα δικά σου κανάλια και τις ενέργειες προώθησης.</span></div>
            <div className="restaurant-comparison__row" role="row"><strong role="rowheader">Ποιος κάνει τη διανομή;</strong><span role="cell">Εξαρτάται από τη συνεργασία και τις υπηρεσίες της.</span><span role="cell">Η δική σου ομάδα, ξεχωριστός συνεργάτης ή παραλαβή.</span></div>
            <div className="restaurant-comparison__row" role="row"><strong role="rowheader">Τι κόστος μετράμε;</strong><span role="cell">Τις πραγματικές χρεώσεις της συμφωνίας σου.</span><span role="cell">Κατασκευή, λειτουργία, πληρωμές, διανομή και προώθηση.</span></div>
            <div className="restaurant-comparison__row" role="row"><strong role="rowheader">Τι αλλάζει στην εμπειρία;</strong><span role="cell">Η παραγγελία ακολουθεί τη ροή της πλατφόρμας.</span><span role="cell">Σχεδιάζεται γύρω από την επωνυμία και τη λειτουργία σου.</span></div>
          </div>
          <p className="restaurant-comparison__footnote">Η προμήθεια που αποφεύγεται δεν ισούται αυτόματα με καθαρό κέρδος.</p>
        </div>
      </section>

      <section className="restaurant-section restaurant-container restaurant-transition-bridge" aria-labelledby="transition-system-title"><div><p className="restaurant-eyebrow">Από το πλάνο στην πράξη</p><h2 id="transition-system-title">Και το δικό σου σύστημα<br />πώς θα μπορούσε να είναι;</h2><p>Δες τη ροή παραγγελίας και το ανεξάρτητο demo παρουσίασης πριν συζητήσουμε τη δική σου υλοποίηση.</p></div><RestaurantCampaignLink path="/el/online-paraggelies" className="restaurant-button">Δες το σύστημα και το demo <ArrowUpRight size={18} aria-hidden="true" /></RestaurantCampaignLink></section>
      <RestaurantAssessment landingPage="transition" />
      <RestaurantFaq items={faqs} />
    </RestaurantLandingLayout>
  );
}
