import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy Policy"
        description="Privacy policy and data protection information for BI Solutions Group, in compliance with GDPR."
        path="/privacy-policy"
      />
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4">
              Πολιτική Απορρήτου
            </h1>
            <p className="text-sm text-gray-400 mb-12">
              Τελευταία ενημέρωση: Μάρτιος 2026
            </p>
          </ScrollReveal>

          {/* English Summary */}
          <ScrollReveal delay={0.05}>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-16">
              <h2 className="text-lg font-bold font-heading mb-4">English Summary</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                BI Solutions Group, based in Greece, processes personal data (name, email, hashed
                passwords, usage data) under GDPR. We rely on consent, legitimate interest, and
                contract performance as legal bases. You have the right to access, rectify, erase,
                port, restrict, and object to processing of your data. We use third-party services
                including Anthropic AI, Resend (email delivery), and analytics tools. To exercise your
                rights or request account deletion, contact us at{" "}
                <a href="mailto:ibekas@ihu.gr" className="underline text-black">ibekas@ihu.gr</a>.
              </p>
            </div>
          </ScrollReveal>

          {/* Main Content in Greek */}
          <div className="space-y-12 text-gray-700 leading-relaxed">
            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  1. Υπεύθυνος Επεξεργασίας Δεδομένων
                </h2>
                <p>
                  Υπεύθυνος επεξεργασίας των προσωπικών σας δεδομένων είναι η εταιρεία{" "}
                  <strong>BI Solutions Group</strong>, με έδρα την Ελλάδα.
                </p>
                <p className="mt-2">
                  Email επικοινωνίας:{" "}
                  <a href="mailto:ibekas@ihu.gr" className="underline text-black">ibekas@ihu.gr</a>
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  2. Δεδομένα που Συλλέγουμε
                </h2>
                <p className="mb-3">Συλλέγουμε τα ακόλουθα δεδομένα:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Στοιχεία λογαριασμού:</strong> Όνομα, διεύθυνση email, κωδικός πρόσβασης (αποθηκευμένος σε κρυπτογραφημένη μορφή / hash)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δεδομένα χρήσης:</strong> Πληροφορίες σχετικά με τον τρόπο χρήσης των υπηρεσιών μας, συμπεριλαμβανομένων των αλληλεπιδράσεων με τον AI Advisor και το Quantus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Τεχνικά δεδομένα:</strong> Διεύθυνση IP, τύπος προγράμματος περιήγησης, λειτουργικό σύστημα, cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δεδομένα επικοινωνίας:</strong> Πληροφορίες που παρέχετε μέσω της φόρμας επικοινωνίας</span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  3. Νομική Βάση Επεξεργασίας
                </h2>
                <p className="mb-3">
                  Επεξεργαζόμαστε τα δεδομένα σας βάσει των ακόλουθων νομικών βάσεων σύμφωνα με τον ΓΚΠΔ (GDPR):
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Συγκατάθεση (Άρθρο 6(1)(α)):</strong> Για cookies, newsletters, και προαιρετικές υπηρεσίες</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Εκτέλεση σύμβασης (Άρθρο 6(1)(β)):</strong> Για την παροχή των υπηρεσιών που ζητήσατε</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Έννομο συμφέρον (Άρθρο 6(1)(στ)):</strong> Για τη βελτίωση των υπηρεσιών μας και την ασφάλεια του ιστότοπου</span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  4. Διατήρηση Δεδομένων
                </h2>
                <p>
                  Τα δεδομένα του λογαριασμού σας διατηρούνται για όσο διάστημα διατηρείτε ενεργό λογαριασμό
                  στις υπηρεσίες μας. Μπορείτε να ζητήσετε τη διαγραφή του λογαριασμού σας ανά πάσα στιγμή.
                  Μετά τη διαγραφή, τα δεδομένα σας διαγράφονται εντός 30 ημερών, εκτός εάν η διατήρησή
                  τους απαιτείται από το νόμο.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  5. Τα Δικαιώματά σας (ΓΚΠΔ)
                </h2>
                <p className="mb-3">
                  Σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (ΓΚΠΔ), έχετε τα ακόλουθα δικαιώματα:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δικαίωμα πρόσβασης:</strong> Να ζητήσετε αντίγραφο των δεδομένων σας</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δικαίωμα διόρθωσης:</strong> Να ζητήσετε τη διόρθωση ανακριβών δεδομένων</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δικαίωμα διαγραφής (Άρθρο 17):</strong> Να ζητήσετε τη διαγραφή των δεδομένων σας ("δικαίωμα στη λήθη")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δικαίωμα φορητότητας:</strong> Να λάβετε τα δεδομένα σας σε δομημένη, κοινώς χρησιμοποιούμενη μορφή</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δικαίωμα περιορισμού:</strong> Να ζητήσετε τον περιορισμό της επεξεργασίας</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Δικαίωμα εναντίωσης:</strong> Να αντιταχθείτε στην επεξεργασία των δεδομένων σας</span>
                  </li>
                </ul>
                <p className="mt-4">
                  Για να ασκήσετε τα δικαιώματά σας, στείλτε email στο{" "}
                  <a href="mailto:ibekas@ihu.gr" className="underline text-black">ibekas@ihu.gr</a>{" "}
                  ή χρησιμοποιήστε τη λειτουργία διαγραφής λογαριασμού στις ρυθμίσεις σας.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  6. Cookies
                </h2>
                <p className="mb-3">
                  Ο ιστότοπός μας χρησιμοποιεί cookies για τη βελτίωση της εμπειρίας σας. Τα cookies
                  χωρίζονται στις ακόλουθες κατηγορίες:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Απαραίτητα cookies:</strong> Απαιτούνται για τη λειτουργία του ιστότοπου (π.χ. αυθεντικοποίηση, ασφάλεια)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Cookies ανάλυσης:</strong> Μας βοηθούν να κατανοήσουμε πώς χρησιμοποιείτε τον ιστότοπο</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Cookies λειτουργικότητας:</strong> Αποθηκεύουν τις προτιμήσεις σας</span>
                  </li>
                </ul>
                <p className="mt-3">
                  Μπορείτε να διαχειριστείτε τις προτιμήσεις cookies σας μέσω του banner cookies που
                  εμφανίζεται κατά την πρώτη επίσκεψη ή μέσω των ρυθμίσεων του προγράμματος περιήγησής σας.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  7. Υπηρεσίες Τρίτων
                </h2>
                <p className="mb-3">
                  Χρησιμοποιούμε τις ακόλουθες υπηρεσίες τρίτων που ενδέχεται να επεξεργάζονται δεδομένα:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Anthropic AI:</strong> Για τη λειτουργία του AI Advisor. Τα ερωτήματά σας υποβάλλονται σε επεξεργασία μέσω του API της Anthropic.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Resend:</strong> Για την αποστολή email (φόρμα επικοινωνίας, ειδοποιήσεις)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Google Analytics:</strong> Για την ανάλυση της επισκεψιμότητας του ιστότοπου (εφόσον είναι ενεργοποιημένο)</span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  8. Ασφάλεια Δεδομένων
                </h2>
                <p>
                  Λαμβάνουμε τεχνικά και οργανωτικά μέτρα για την προστασία των δεδομένων σας,
                  συμπεριλαμβανομένης της κρυπτογράφησης κωδικών πρόσβασης, της χρήσης HTTPS και
                  του περιορισμού πρόσβασης στα δεδομένα μόνο σε εξουσιοδοτημένο προσωπικό.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  9. Αλλαγές στην Πολιτική
                </h2>
                <p>
                  Ενδέχεται να ενημερώσουμε αυτήν την πολιτική απορρήτου κατά καιρούς. Οι αλλαγές θα
                  δημοσιεύονται σε αυτήν τη σελίδα με ενημερωμένη ημερομηνία. Σας ενθαρρύνουμε να
                  ελέγχετε τακτικά αυτήν τη σελίδα.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  10. Επικοινωνία
                </h2>
                <p>
                  Για οποιαδήποτε ερώτηση σχετικά με την πολιτική απορρήτου ή τα δεδομένα σας,
                  επικοινωνήστε μαζί μας:
                </p>
                <p className="mt-3">
                  <strong>BI Solutions Group</strong><br />
                  Email:{" "}
                  <a href="mailto:ibekas@ihu.gr" className="underline text-black">ibekas@ihu.gr</a>
                </p>
                <p className="mt-3">
                  Εάν θεωρείτε ότι τα δικαιώματά σας δεν γίνονται σεβαστά, έχετε το δικαίωμα να
                  υποβάλετε καταγγελία στην Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (ΑΠΔΠΧ)
                  στο{" "}
                  <a
                    href="https://www.dpa.gr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-black"
                  >
                    www.dpa.gr
                  </a>.
                </p>
              </section>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
