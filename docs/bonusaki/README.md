# Bonusaki Cafe Pilot Pack

Use this folder when preparing a paid Bonusaki pilot for a cafe or small food
service merchant.

## Recommended offer

- Product: Bonusaki Cafe Pilot
- Scope: QR scratch-and-win campaign for 2 to 4 weeks
- Suggested price: EUR 490 setup plus EUR 149 per month, 3-month minimum
- Deliverables:
  - branded campaign setup
  - QR batch for cups, receipts, posters, or table cards
  - campaign reward rules and odds
  - cashier validation process
  - monthly campaign report
  - manual support during pilot

## Files

- `cafe-pilot-agreement.md` - commercial agreement template.
- `campaign-rules-template.md` - cafe reward and odds worksheet.
- `cashier-sop.md` - cashier process and fraud controls.
- `privacy-notice-template.md` - customer-facing privacy wording.
- `support-runbook.md` - manual support and incident process.
- `wallet-and-onboarding-roadmap.md` - what is ready now vs later.
- `launch-checklist.md` - go/no-go checklist for a real cafe pilot.
- `sample-cafe-pilot.json` - sample QR batch config.

## QR batch generation

Generate a cafe QR pack:

```powershell
node script/bonusaki-generate-qr-batch.cjs --config docs/bonusaki/sample-cafe-pilot.json
```

The script writes SVG QR codes, `manifest.csv`, and a printable `index.html`
into `output/bonusaki-qr/<merchant>-<campaign>-<timestamp>/`.

## Rule

Do not enable `BONUSAKI_PILOT_ENABLED=true` until the signed agreement,
campaign rules, cashier process, privacy notice, and production secrets are in
place.
