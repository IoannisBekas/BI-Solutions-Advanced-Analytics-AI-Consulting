import { ArrowDown, ArrowUpRight, Check, ClipboardCheck, MonitorSmartphone, ShoppingBag, Utensils } from "lucide-react";
import paroliCover from "@/assets/case-studies/paroli-cover.webp";
import {
  RestaurantAssessment,
  RestaurantCampaignLink,
  RestaurantCta,
  RestaurantFaq,
  RestaurantLandingLayout,
} from "@/components/restaurant/RestaurantLandingLayout";

const steps = [
  { icon: Utensils, title: "Το μενού σου", description: "Προϊόντα, κατηγορίες και επιλογές, με την ταυτότητα του καταστήματός σου." },
  { icon: ShoppingBag, title: "Η παραγγελία", description: "Καλάθι και σαφής ολοκλήρωση για διανομή ή παραλαβή από το κατάστημα." },
  { icon: MonitorSmartphone, title: "Η λήψη στο κατάστημα", description: "Ο τρόπος ειδοποίησης και διαχείρισης σχεδιάζεται γύρω από τη λειτουργία σου." },
  { icon: ClipboardCheck, title: "Η εξυπηρέτηση", description: "Η ομάδα σου ετοιμάζει την παραγγελία και αναλαμβάνει την παράδοση ή την παραλαβή." },
];

const faqs = [
  { question: "Πρέπει να φύγω αμέσως από efood, Wolt ή BOX;", answer: "Η αξιολόγηση μπορεί να αφορά είτε σταδιακή μείωση της εξάρτησης είτε πλήρη αποχώρηση. Πρώτα εξετάζουμε τη διανομή, τους επαναλαμβανόμενους πελάτες και το πραγματικό κόστος κάθε επιλογής. Η απόφαση εξαρτάται και από τις συμφωνίες που έχεις με τους σημερινούς συνεργάτες σου." },
  { question: "Ποιος κάνει τη διανομή;", answer: "Το σύστημα παραγγελιών δεν περιλαμβάνει από μόνο του στόλο διανομέων. Χρειάζεται δική σου δυνατότητα διανομής, ξεχωριστή συνεργασία ή παραλαβή από το κατάστημα. Αυτό είναι από τα πρώτα θέματα της αξιολόγησης." },
  { question: "Πόσο κοστίζει η κατασκευή και η λειτουργία;", answer: "Η προσφορά διαχωρίζει εγκατάσταση, λειτουργία, υποστήριξη και τυχόν εξωτερικές υπηρεσίες. Οι πληρωμές, η διανομή και η διαφήμιση μπορεί να έχουν επιπλέον κόστος. Η τελική τιμή προκύπτει αφού οριστεί το εύρος του δικού σου έργου." },
  { question: "Μπορεί να συνδεθεί με το σύστημα που χρησιμοποιώ;", answer: "Οι συνδέσεις με POS, εκτυπωτές, ERP ή παρόχους πληρωμών εξετάζονται πριν την προσφορά. Η δυνατότητα και το κόστος εξαρτώνται από τα συγκεκριμένα συστήματα και τις διαθέσιμες διασυνδέσεις τους." },
  { question: "Το PAROLI είναι πραγματικό έργο πελάτη;", answer: "Το PAROLI παρουσιάζεται εδώ ως ανεξάρτητο δείγμα σχεδιασμού και εμπειρίας απευθείας παραγγελίας. Δεν αποτελεί μαρτυρία πελάτη ή απόδειξη οικονομικών αποτελεσμάτων και το demo δεν αποστέλλει πραγματικές παραγγελίες." },
];

export default function RestaurantOrdering() {
  return (
    <RestaurantLandingLayout page="ordering" title="Σύστημα online παραγγελιών για την εστίαση" description="Δικό σου site παραγγελιών για καφέ, ψητοπωλείο ή εστιατόριο. Δες το δείγμα, τις προϋποθέσεις και ζήτησε δωρεάν αρχική αξιολόγηση για το κατάστημά σου.">
      <section className="restaurant-container restaurant-hero restaurant-hero--ordering" aria-labelledby="ordering-title">
        <div className="restaurant-hero__copy">
          <p className="restaurant-eyebrow"><span className="restaurant-status-dot" />Απευθείας παραγγελίες · Εστίαση</p>
          <h1 id="ordering-title">Οι παραγγελίες σου.<br /><em>Στο δικό σου site.</em></h1>
          <p className="restaurant-hero__description">Δώσε στους πελάτες σου έναν απευθείας τρόπο να παραγγέλνουν. Σχεδιάζουμε το σύστημα γύρω από το μενού, την ομάδα και τη λειτουργία του καταστήματός σου.</p>
          <div className="restaurant-hero__actions"><RestaurantCta>Δες τι ταιριάζει στο κατάστημά σου</RestaurantCta><a href="#paradeigma" className="restaurant-text-link">Δες το παράδειγμα <ArrowDown size={16} aria-hidden="true" /></a></div>
          <p className="restaurant-hero__footnote">Δωρεάν αρχική αξιολόγηση. Χωρίς δέσμευση υλοποίησης.</p>
        </div>
        <figure className="restaurant-preview">
          <div className="restaurant-preview__label"><span className="restaurant-status-dot" />Από το μενού μέχρι το καλάθι</div>
          <a href="https://ioannisbekas.github.io/paroli/" target="_blank" rel="noopener noreferrer" aria-label="Άνοιγμα του ανεξάρτητου demo PAROLI σε νέα καρτέλα"><img src={paroliCover} alt="Δείγμα PAROLI: σελίδα ψητοπωλείου με μενού, επιλογή καταστήματος και καλάθι παραγγελίας" width="2880" height="1620" fetchPriority="high" /></a>
          <figcaption><strong>PAROLI</strong><span>Ανεξάρτητο demo · Δεν στέλνει πραγματικές παραγγελίες</span></figcaption>
        </figure>
      </section>

      <div className="restaurant-audience-strip"><div className="restaurant-container"><span>Για καταστήματα με τη δική τους ταυτότητα.</span><strong>Καφέ</strong><strong>Ψητοπωλεία</strong><strong>Εστιατόρια</strong><strong>Takeaway</strong></div></div>

      <section className="restaurant-section restaurant-container" aria-labelledby="ordering-flow-title">
        <div className="restaurant-section__heading"><div><p className="restaurant-eyebrow">Η διαδρομή της παραγγελίας</p><h2 id="ordering-flow-title">Απλό για τον πελάτη.<br />Πρακτικό για την ομάδα σου.</h2></div><p>Το site είναι η αρχή. Η πραγματική αξία βρίσκεται σε μια ροή που μπορείς να χρησιμοποιείς καθημερινά.</p></div>
        <ol className="restaurant-flow">{steps.map(({ icon: Icon, title, description }, index) => <li key={title}><span className="restaurant-flow__number">0{index + 1}</span><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </section>

      <section id="paradeigma" className="restaurant-demo-section" aria-labelledby="ordering-demo-title">
        <div className="restaurant-container restaurant-demo-section__grid">
          <div><p className="restaurant-eyebrow">Δες την ιδέα στην πράξη</p><h2 id="ordering-demo-title">Η δική σου επωνυμία,<br />σε κάθε βήμα.</h2><p>Το PAROLI δείχνει πώς μπορούν να συνδυαστούν παρουσίαση καταστήματος, κατάλογος και καλάθι σε μια ενιαία εμπειρία.</p><a className="restaurant-button restaurant-button--light" href="https://ioannisbekas.github.io/paroli/" target="_blank" rel="noopener noreferrer">Άνοιξε το demo PAROLI <ArrowUpRight size={18} aria-hidden="true" /></a><p className="restaurant-demo-section__disclaimer">Ανεξάρτητο δείγμα παρουσίασης. Δεν είναι ενεργό σύστημα παραγγελιών πελάτη.</p></div>
          <div className="restaurant-demo-notes"><span className="restaurant-demo-notes__label">Τι σχεδιάζουμε μαζί</span><ul><li><span>01</span><div><h3>Το κατάστημά σου, καθαρά.</h3><p>Επωνυμία, μενού και πληροφορίες που βοηθούν τον πελάτη να επιλέξει.</p></div></li><li><span>02</span><div><h3>Τη ροή που χρειάζεσαι.</h3><p>Παραλαβή ή διανομή, ωράρια και τρόπος λήψης των παραγγελιών.</p></div></li><li><span>03</span><div><h3>Ένα συγκεκριμένο πλάνο.</h3><p>Εύρος έργου, κόστη και υποστήριξη πριν ξεκινήσει η κατασκευή.</p></div></li></ul></div>
        </div>
      </section>

      <section className="restaurant-section restaurant-container restaurant-fit" aria-labelledby="ordering-fit-title">
        <div><p className="restaurant-eyebrow">Πότε έχει περισσότερο νόημα</p><h2 id="ordering-fit-title">Έχεις ήδη πελάτες.<br />Δώσε τους μια άμεση διαδρομή.</h2><p>Ένα δικό σου site χρειάζεται και τρόπο να φέρνεις παραγγελίες σε αυτό. Στην αρχική αξιολόγηση εξετάζουμε τις προϋποθέσεις της δικής σου επιχείρησης.</p><RestaurantCampaignLink path="/el/meiosi-kostous-delivery" className="restaurant-text-link">Σκέφτεσαι αποχώρηση από τις πλατφόρμες; <ArrowUpRight size={17} aria-hidden="true" /></RestaurantCampaignLink></div>
        <ul className="restaurant-fit__list"><li><Check size={20} aria-hidden="true" /><div><h3>Επαναλαμβανόμενη πελατεία</h3><p>Πελάτες που γνωρίζουν το κατάστημα και παραγγέλνουν ξανά.</p></div></li><li><Check size={20} aria-hidden="true" /><div><h3>Διανομή ή παραλαβή</h3><p>Πρακτικός τρόπος να εξυπηρετείς την παραγγελία εκτός πλατφόρμας.</p></div></li><li><Check size={20} aria-hidden="true" /><div><h3>Ομάδα που μπορεί να το λειτουργήσει</h3><p>Κάποιος που ενημερώνει το μενού και διαχειρίζεται τα νέα αιτήματα.</p></div></li></ul>
      </section>

      <RestaurantAssessment landingPage="ordering" />
      <RestaurantFaq items={faqs} />
    </RestaurantLandingLayout>
  );
}
