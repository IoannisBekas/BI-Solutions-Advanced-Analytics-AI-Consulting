# Seven semantic-model checks to run before a Power BI model spreads

Status: **editorial draft — not submitted**

Proposed destination: Microsoft Fabric Community Blog

Proposed author: Ioannis Bekas

## Standfirst

A Power BI report can look finished while the semantic model beneath it is already becoming difficult to trust. These seven checks turn model review into a repeatable release habit before unclear relationships, duplicated measures, weak security, or undocumented assumptions spread into more reports.

## The report canvas is not the whole product

Most Power BI reviews begin with what a stakeholder can see: filters, charts, labels, colors, and navigation. Those details matter, but they are downstream of a more important product—the semantic model that defines how business data is organized and interpreted.

The model determines which rows can be combined, how filters propagate, which calculations become shared definitions, what users are permitted to see, and whether another report author can build safely without reverse-engineering the original file. Once several reports depend on the same model, a small modeling shortcut can become a repeated operational problem.

The right time to review a semantic model is therefore not after every report has copied its assumptions. Review it before reuse, endorsement, or wider distribution.

This article describes seven checks I use as a practical release gate. It is not a demand for one perfect architecture. Each check asks the model owner to make an intentional decision, test it, and leave evidence that the next person can understand.

## 1. State the grain before reviewing the diagram

For every table that behaves like a fact table, complete this sentence:

> One row represents ________.

Examples might be one invoice line, one employee-day assignment, one support case, or one monthly account balance. If two developers complete the sentence differently, the model is not ready for a relationship or measure review.

Mixed grain is a common source of totals that look plausible but change under filtering. A table containing both transaction rows and pre-aggregated monthly rows may produce valid numbers in one visual and double counting in another. The diagram alone will not reveal that mistake.

Also identify which tables are dimensions and which are facts. Microsoft’s star-schema guidance describes dimensions as the structures used for filtering and grouping and facts as the structures used for summarization. It recommends that fact tables load data at a consistent grain.

**Evidence to leave:** a one-line grain description for each fact-like table, its business key, expected uniqueness, and the refresh period represented by the rows.

## 2. Make every relationship explainable

Review each relationship for four properties:

- the columns joined;
- cardinality;
- active or inactive status;
- cross-filter direction.

Do not approve a relationship only because Power BI accepted it. Confirm that the “one” side is actually unique at refresh time and that the relationship represents the business process.

Treat bidirectional filtering as an explicit design decision. It can solve particular patterns, including some bridge-table scenarios, but Microsoft recommends minimizing it because it can create confusing filter behavior and additional query work. If a relationship filters both ways, document the user requirement that justifies it and the test that proves there is no ambiguous path.

Inactive relationships need the same discipline. Record which measures activate them and why. Otherwise a future author may create a second relationship or calculation that produces a different answer to the same question.

**Evidence to leave:** a relationship exception list covering every many-to-many, bidirectional, inactive, or one-to-one relationship.

## 3. Treat measures as governed interfaces

A measure is not just a DAX expression. It is a public interface through which report authors and users consume business logic.

Start by identifying calculations that appear more than once. Consolidate equivalent logic into an explicit measure instead of repeating visual-level calculations or near-duplicate DAX. Then review:

- business name and description;
- owning subject area or display folder;
- format string and unit;
- treatment of blanks, zero, and incomplete periods;
- time context and currency assumptions;
- source owner for the definition.

Names such as `Total`, `Value`, or `Rate` are rarely sufficient in a shared model. “Recognized Revenue,” “Open Workload Hours,” or “On-Time Delivery Rate” gives a future author a better chance of selecting the intended measure.

Technical columns should not compete with governed measures in the field list. Hide identifiers, relationship columns, and raw numeric fields when report authors should use an approved measure instead. Hiding is a usability control, not a security control; sensitive fields require an appropriate security design.

**Evidence to leave:** a measure dictionary containing the name, definition, format, owner, exceptions, and one reconciliation example for every decision-critical KPI.

## 4. Test dates as business logic, not decoration

Date tables often look simple until the business asks several different time questions.

Confirm that the primary date table is contiguous across the required period and that month names sort by month number. Then identify every role a date can play: order date, ship date, approval date, close date, snapshot date, or another business event.

If one dimension supports several roles, document whether the model uses role-playing dimensions, inactive relationships activated in measures, or another pattern. The choice matters less than making the behavior predictable.

Test incomplete periods deliberately. A month-to-date calculation can be technically valid and still mislead users if the current month contains only one refreshed day. Record the refresh cutoff and decide whether incomplete periods should display, be flagged, or be excluded from comparisons.

**Evidence to leave:** the approved calendar range, fiscal rules, week definition, role-playing strategy, and incomplete-period behavior.

## 5. Validate security with representative users

Security review should happen against the model and the published experience, not only against a role expression in Power BI Desktop.

For row-level security, Microsoft recommends efficient model design and generally filtering dimension tables so active relationships propagate the restriction. Review the complete path from the secured dimension to every relevant fact table. A disconnected or inactive path can make a correct-looking rule ineffective.

Use representative test identities or groups for each expected access pattern. Include at least:

- a normal user in one role;
- a user assigned to multiple roles if that is possible;
- a user with no mapping;
- an administrator or model owner whose permissions differ from a consumer;
- a user whose organizational attributes recently changed.

Record the expected visible totals for each test identity. “The page opened” is not a sufficient security test.

**Evidence to leave:** role purpose, group mapping owner, test identities, expected results, actual results, and the date of the last validation.

## 6. Measure performance under a realistic interaction

Do not optimize a model only by file size or by how quickly the initial page opens on the developer’s machine.

Choose a small set of representative interactions: opening the busiest page, changing a high-cardinality slicer, drilling to detail, and evaluating the most complex measure. Use Power BI Performance Analyzer to capture visual load duration and separate DAX-query time from rendering or other work.

Then review model-level causes:

- unnecessary columns or historical rows in Import models;
- high-cardinality fields that do not support a business question;
- storage mode and source-database behavior for DirectQuery or composite models;
- relationship complexity and avoidable bidirectional paths;
- DAX expressions that repeat expensive work;
- refresh duration, failure behavior, and gateway dependencies.

Record a baseline before refactoring and repeat the same interaction afterward. This avoids declaring a performance improvement based on two different pages, filter states, or machines.

**Evidence to leave:** the tested report state, filter context, device or environment, visual timings, refresh duration, model size, and before/after date.

## 7. Make the model reviewable as an artifact

A model is easier to govern when its definition can be inspected, compared, and discussed outside a sequence of screenshots.

Power BI projects can represent semantic-model metadata as TMDL files, and Power BI Desktop’s TMDL view can script model objects and preview changes as a before-and-after diff. That makes tables, measures, relationships, descriptions, and other properties easier to search and review.

Text representation does not automatically create good governance. Decide:

- where the authoritative model definition lives;
- who reviews changes;
- which checks run before release;
- how a model version maps to the published workspace item;
- how an unsafe change is rolled back;
- where exceptions and business approvals are recorded.

Be especially careful with object renames and external edits. Microsoft notes that renaming fields can break report visuals and that external metadata changes can create inconsistencies. Preview the diff, test dependent reports, and keep the change small enough to review.

**Evidence to leave:** a versioned definition or export, change summary, reviewer, test result, release identifier, and rollback path.

## The one-page release gate

Before a semantic model is reused, endorsed, or connected to more reports, the owner should be able to answer yes to the following:

- [ ] Every fact-like table has one documented grain.
- [ ] Relationship columns, cardinalities, active state, and filter directions are intentional.
- [ ] Every relationship exception has a stated requirement and test.
- [ ] Decision-critical measures have definitions, owners, formats, and reconciliation examples.
- [ ] Date roles, fiscal rules, refresh cutoffs, and incomplete-period behavior are explicit.
- [ ] Security roles have been validated with representative users and expected totals.
- [ ] Performance was measured with a reproducible interaction and baseline.
- [ ] The model definition, review evidence, release version, and rollback path are retained.

If several answers are “not yet,” the model may still be useful for exploration. It is not yet ready to become shared infrastructure.

## Why this matters more as AI reaches the semantic layer

The same design qualities that help human report authors also help AI-assisted analytics: clear names, stable relationships, governed measures, descriptions, security boundaries, and documented intent.

That does not make an AI-generated answer automatically correct. Microsoft’s current Copilot guidance explicitly tells teams to prepare and evaluate semantic models and reminds users that AI outputs can vary. A clean model gives an assistant better grounding; validation and human judgment still remain part of the workflow.

The practical goal is not a model that merely passes a technical inspection. It is a model whose answers, limitations, and changes can be explained to the people who depend on it.

## References

- Microsoft Learn, “Understand star schema and the importance for Power BI”: https://learn.microsoft.com/en-au/power-bi/guidance/star-schema
- Microsoft Learn, “Bi-directional relationship guidance”: https://learn.microsoft.com/en-us/power-bi/guidance/relationships-bidirectional-filtering
- Microsoft Learn, “Row-level security guidance in Power BI Desktop”: https://learn.microsoft.com/en-us/power-bi/guidance/rls-guidance
- Microsoft Learn, “Optimization guide for Power BI”: https://learn.microsoft.com/en-us/power-bi/guidance/power-bi-optimization
- Microsoft Learn, “Use Performance Analyzer to examine report performance”: https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-performance-analyzer
- Microsoft Learn, “Work with TMDL view”: https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-tmdl-view
- Microsoft Learn, “Power BI Desktop projects”: https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-overview
- Microsoft Learn, “Copilot in Power BI: Prepare a semantic model for AI”: https://learn.microsoft.com/en-us/power-bi/create-reports/tutorial-copilot-power-bi-prepare-model

## Editorial and submission checklist

- [ ] Ioannis confirms that every practice reflects his real delivery experience.
- [ ] The final author biography is approved.
- [ ] Microsoft Fabric Community author access is granted.
- [ ] The destination editor confirms whether external links and the references section are permitted.
- [ ] No confidential model, client, tenant, screenshot, or performance data is included.
- [ ] The article is edited for the destination rather than copied unchanged from the BI Solutions website.
- [ ] Ioannis approves the final rendered draft before submission.
