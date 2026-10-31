# Translation quality review — dev proposal

Status: approved by the user for publication on 1 November 2026. The following records the reviewed changes and validation evidence.

The English homepage strip “Remote consulting for US teams”, including its two promotional links, has been removed. The dedicated service pages remain available.

## Review coverage

Reviewed 974 source-text entries matched to public pages, 36 paragraphs containing inline links, the native English/Greek/German navigation and page catalogues, all 19 articles, the 25 website/app project descriptions, and the AI learning interface and its 16 pack descriptions. This includes headings, paragraphs, metadata, forms, consent text, legal-page wording and accessible labels.

The proposal adds or revises 466 curated translation entries, alongside corrections in the native page catalogues. The generated dictionary remains intact; reviewed wording takes priority over automatic output.

## Main corrections

| Context | Previous wording | Proposed wording |
| --- | --- | --- |
| Greek article: data foundations | «καλύτερα ιδρύματα» | «καλύτερες υποδομές» |
| Greek topic: prompt engineering | «Άμεση Μηχανική» | «Σχεδιασμός prompts» |
| German topic: prompt engineering | “Schnelles Engineering” | “Prompt Engineering” |
| German semantic-model article: tables | “Tische” | “Tabellen” |
| Greek article: lead quality | «σύστημα ποιότητας μολύβδου» | «σύστημα προσέλκυσης κατάλληλων αιτημάτων συνεργασίας» |
| Delivery backlog | «ανεκτέλεστο αρχείο παράδοσης» / “Lieferrückstand” | «λίστα εργασιών προς υλοποίηση» / “Umsetzungs-Backlog” |
| Data responsibility | Property-ownership wording | Clearly named responsible people and responsibilities |
| Recruitment analysis | Software-application and military-recruitment wording | Job applications, selection stages and recruitment |
| Privacy claims | “GDPR-aware” strengthened to “DSGVO-konform” | “DSGVO-orientiert”, retaining the source's qualification |
| Greek profile | Mixed English/Greek role and sidebar «Σύνδεση» | «Επιστήμονας δεδομένων και προγραμματιστής AI» and «Επικοινωνία» |
| Review controls | English position labels and opening confirmation in every language | Localized labels, ratings and confirmation text |

Other corrections cover literal translations of “brief”, “qualified enquiry”, “productionization”, “ship”, “fulfillment”, “minor” and “foundation”; malformed translated HTML; changed product names; and sentences split incorrectly around links.

Greek and German article covers now use the existing SVG illustration component with localized topic and diagram labels. This removes baked-in English headings from the on-page graphics. English pages keep their reviewed image covers. Social-preview images retain their existing assets.

Article search now also matches translated titles, summaries and tags, with accent-insensitive matching. Result counts and topic descriptions use complete locale-specific phrases, including correct singular and plural forms.

The automatic DOM translator previously translated technical metadata too: for example, Greek `og:type="article"` became `άρθρο`, and `robots="index,follow"` became `ευρετήριο, ακολουθήστε`. Metadata translation now permits readable text fields only, preserving technical directives and social-card types after the page loads.

The English account-data sentence now clearly says that the password is stored as a hash. It no longer ambiguously suggests that names and email addresses are also hashed. The translated text follows that clarification.

## Language conventions

- Greek public-site copy uses polite plural forms. The educational AI finder keeps its existing informal singular voice consistently. Gendered wording in its experience question was removed.
- German uses the formal “Sie”, “KI”, “Leistungen”, “Datengrundlagen”, “Content-Prozesse” and “Weiterbildung und Mentoring” consistently where applicable.
- Product names, recognized technical names and official certificate titles remain recognizable. Technical concepts are explained in normal business language when a literal translation would obscure their meaning.
- Reviews retain their complete original wording and chronological order. Their English text now declares its language for assistive technology. Prerendering now respects `translate="no"`, fixing the initial HTML that previously auto-translated seven quotations before the browser restored their originals. A build check verifies all nine complete quotations in every language.
- Routes, project identifiers, canonical URLs and available-language declarations retain their existing structure. Localized metadata wording was improved.

## Existing language availability

The AI learning PDFs remain available in English and Greek. The German resource route retains its existing English fallback and English canonical URL. Dedicated US and specialist landing pages retain their existing English-only availability. These are deliberate language boundaries, rather than newly generated German duplicates.

## Prevention and verification

Translation generation now protects HTML markup and product names before calling the translator and refuses damaged or missing protected tokens. A small live translation check succeeded in Greek and German. SEO validation checks the resulting link markup against the source in all 72 localized rich-text fragments; eleven regression tests cover token protection, native-copy preservation and the hydration bridge.

The production-build review also found that the hydration bridge could mistake an already localized heading or navigation label for automatically translated copy elsewhere on the page. It now preserves the original sequence of both kinds of text, preventing React from discarding correctly rendered translated pages during hydration.

Validation evidence is saved under `output/translation-review/` and `output/playwright/translation-review/`. Checks include TypeScript, the full production build, SEO/prerender checks, encoding checks, 564 standard responsive page checks, 129 edge-width checks, interaction checks in three languages, and focused checks of expanded services, final profile copy, verbatim reviews and their localized controls.

Final production-preview checks also passed for 152 localized article-cover renderings at four viewport widths, article search in all three languages, nine additional profile layouts, and all nine complete review quotations on each language's homepage. The removed strip is absent in every homepage variant. The SEO checks passed for 191 sitemap routes, including the raw-HTML translation audit of 121 Greek and German pages.

The final production-build browser audit passed all 188 route/language cases at 390px, with no horizontal overflow, clipped text, React hydration errors or translated technical metadata. Results are saved in `output/playwright/translation-production/after.json`.

Technical terminology was cross-checked against [Microsoft Learn's semantic-model guidance](https://learn.microsoft.com/el-gr/fabric/data-warehouse/semantic-models) and [star-schema guidance](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema/).

## Pages to approve

- [English homepage](http://127.0.0.1:5001/)
- [Greek services](http://127.0.0.1:5001/el/services)
- [Greek profile](http://127.0.0.1:5001/el/about)
- [Greek article example](http://127.0.0.1:5001/el/blog/prompt-workflow-design-business-teams)
- [German article example](http://127.0.0.1:5001/de/blog/prompt-workflow-design-business-teams)
- [German services](http://127.0.0.1:5001/de/services)
- [Greek project enquiry](http://127.0.0.1:5001/el/start-a-project)

Representative screenshots:

- Greek article: [before](../output/translation-review/article-el-before.png) / [after](../output/translation-review/article-el-after.png)
- German article: [before](../output/translation-review/article-de-before.png) / [after](../output/translation-review/article-de-after.png)
- [Localized German article graphic](../output/translation-review/cover-de-after.png)
- [Greek profile after corrections](../output/translation-review/about-el-after.png)
