import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Terms of Service"
        description="Terms of service for BI Solutions Group products and consulting services."
        path="/terms-of-service"
      />
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-[2.65rem] sm:text-5xl md:text-7xl font-bold font-heading mb-4 leading-[1.05]">
              Όροι Χρήσης
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
                By using BI Solutions Group services, you agree to these terms. Our AI Advisor provides
                general business guidance and should not replace professional advice. Quantus provides
                research analysis for informational purposes only and does not constitute investment
                advice. AI-generated content may contain inaccuracies. We retain intellectual property
                rights over our platform. Liability is limited to the maximum extent permitted by law.
                These terms are governed by Greek law with disputes resolved in the courts of
                Thessaloniki, Greece.
              </p>
            </div>
          </ScrollReveal>

          {/* Main Content in Greek */}
          <div className="space-y-12 text-gray-700 leading-relaxed">
            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  1. Περιγραφή Υπηρεσιών
                </h2>
                <p>
                  Η <strong>BI Solutions Group</strong> παρέχει υπηρεσίες συμβουλευτικής επιχειρήσεων,
                  ανάλυσης δεδομένων, τεχνητής νοημοσύνης και ψηφιακού μετασχηματισμού. Τα προϊόντα
                  μας περιλαμβάνουν:
                </p>
                <ul className="space-y-2 ml-4 mt-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>AI Advisor:</strong> Σύμβουλος τεχνητής νοημοσύνης που παρέχει γενικές επιχειρηματικές κατευθύνσεις</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Quantus:</strong> Πλατφόρμα ανάλυσης αγορών και έρευνας μετοχών</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span><strong>Power BI Solutions:</strong> Εργαλεία και λύσεις Business Intelligence</span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  2. Λογαριασμοί Χρηστών
                </h2>
                <p>
                  Για τη χρήση ορισμένων υπηρεσιών απαιτείται η δημιουργία λογαριασμού. Είστε υπεύθυνοι
                  για τη διατήρηση της εμπιστευτικότητας των στοιχείων σύνδεσής σας και για όλες τις
                  δραστηριότητες που πραγματοποιούνται μέσω του λογαριασμού σας. Πρέπει να μας
                  ενημερώσετε αμέσως για οποιαδήποτε μη εξουσιοδοτημένη χρήση του λογαριασμού σας.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  3. Αποδεκτή Χρήση
                </h2>
                <p className="mb-3">Κατά τη χρήση των υπηρεσιών μας, συμφωνείτε να μην:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Παραβιάζετε νόμους ή κανονισμούς</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Παρεμβαίνετε στη λειτουργία ή την ασφάλεια της πλατφόρμας</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Χρησιμοποιείτε αυτοματοποιημένα εργαλεία για πρόσβαση στις υπηρεσίες χωρίς άδεια</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Μεταδίδετε κακόβουλο λογισμικό ή επιβλαβές περιεχόμενο</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                    <span>Αναπαράγετε ή μεταπωλείτε τις υπηρεσίες μας χωρίς γραπτή συγκατάθεση</span>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  4. Περιεχόμενο Τεχνητής Νοημοσύνης
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
                  <p className="text-sm font-medium text-black mb-2">Σημαντική Αποποίηση Ευθύνης</p>
                  <p className="text-sm text-gray-600">
                    Ο <strong>AI Advisor</strong> παρέχει γενικές επιχειρηματικές κατευθύνσεις και δεν
                    αντικαθιστά επαγγελματικές συμβουλές (νομικές, λογιστικές, φορολογικές ή άλλες).
                    Το <strong>Quantus</strong> παρέχει αναλύσεις αγορών και έρευνα για ενημερωτικούς
                    σκοπούς μόνο και δεν αποτελεί επενδυτική συμβουλή.
                  </p>
                </div>
                <p>
                  Το περιεχόμενο που παράγεται από τεχνητή νοημοσύνη ενδέχεται να περιέχει ανακρίβειες
                  ή σφάλματα. Οι χρήστες πρέπει να επαληθεύουν ανεξάρτητα τις πληροφορίες πριν λάβουν
                  σημαντικές αποφάσεις. Η BI Solutions Group δεν φέρει ευθύνη για αποφάσεις που
                  βασίζονται αποκλειστικά σε περιεχόμενο που παράγεται από AI.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  5. Πνευματική Ιδιοκτησία
                </h2>
                <p>
                  Όλο το περιεχόμενο, ο σχεδιασμός, ο κώδικας, τα εμπορικά σήματα και τα λοιπά στοιχεία
                  πνευματικής ιδιοκτησίας του ιστότοπου και των υπηρεσιών μας ανήκουν στην BI Solutions Group
                  ή στους αδειοδότες μας. Απαγορεύεται η αντιγραφή, αναπαραγωγή, διανομή ή τροποποίηση
                  οποιουδήποτε στοιχείου χωρίς προηγούμενη γραπτή συγκατάθεση.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  6. Περιορισμός Ευθύνης
                </h2>
                <p>
                  Στο μέγιστο βαθμό που επιτρέπεται από τον νόμο, η BI Solutions Group δεν ευθύνεται
                  για τυχόν έμμεσες, αποθετικές, ειδικές ή παρεπόμενες ζημίες που προκύπτουν από τη
                  χρήση ή την αδυναμία χρήσης των υπηρεσιών μας. Οι υπηρεσίες παρέχονται "ως έχουν"
                  χωρίς καμία εγγύηση, ρητή ή σιωπηρή.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  7. Τερματισμός
                </h2>
                <p>
                  Διατηρούμε το δικαίωμα να αναστείλουμε ή να τερματίσουμε την πρόσβασή σας στις
                  υπηρεσίες μας σε περίπτωση παραβίασης αυτών των όρων χρήσης, χωρίς προηγούμενη
                  ειδοποίηση. Μπορείτε να τερματίσετε τη χρήση των υπηρεσιών μας ανά πάσα στιγμή
                  διαγράφοντας τον λογαριασμό σας.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  8. Εφαρμοστέο Δίκαιο & Επίλυση Διαφορών
                </h2>
                <p>
                  Οι παρόντες όροι διέπονται και ερμηνεύονται σύμφωνα με το <strong>Ελληνικό Δίκαιο</strong>.
                  Για οποιαδήποτε διαφορά προκύψει από τη χρήση των υπηρεσιών μας, αρμόδια είναι τα
                  δικαστήρια της <strong>Θεσσαλονίκης, Ελλάδα</strong>. Πριν την προσφυγή σε δικαστική
                  οδό, ενθαρρύνουμε τον φιλικό διακανονισμό μέσω email στο{" "}
                  <a href="mailto:ibekas@ihu.gr" className="underline text-black">ibekas@ihu.gr</a>.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  9. Τροποποιήσεις Όρων
                </h2>
                <p>
                  Διατηρούμε το δικαίωμα να τροποποιούμε τους παρόντες όρους χρήσης ανά πάσα στιγμή.
                  Οι ενημερωμένοι όροι θα δημοσιεύονται σε αυτήν τη σελίδα. Η συνεχιζόμενη χρήση
                  των υπηρεσιών μας μετά τις αλλαγές συνιστά αποδοχή των νέων όρων.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold font-heading text-black mb-4">
                  10. Επικοινωνία
                </h2>
                <p>
                  Για ερωτήσεις σχετικά με τους όρους χρήσης, επικοινωνήστε μαζί μας:
                </p>
                <p className="mt-3">
                  <strong>BI Solutions Group</strong><br />
                  Email:{" "}
                  <a href="mailto:ibekas@ihu.gr" className="underline text-black">ibekas@ihu.gr</a>
                </p>
                <p className="mt-4">
                  Δείτε επίσης την{" "}
                  <Link href="/privacy-policy" className="underline text-black">
                    Πολιτική Απορρήτου
                  </Link>{" "}
                  μας.
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
