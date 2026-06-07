# Bonusaki Campaign Rules Template

Complete this before generating real QR codes.

## Merchant

- merchant legal name:
- public display name:
- location:
- contact person:
- contact phone:
- contact email:

## Campaign

- campaign name:
- start date:
- end date:
- daily play limit:
- reward expiration: 30 days recommended
- QR placements: cups / receipts / table cards / posters / other
- customer entry requirement: purchase required / no purchase / staff assisted

## Reward table

Keep the total weight at 100.

| Reward | Customer text | Weight | Daily max | Total max | Merchant cost per redemption | Notes |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Free coffee | Free coffee | 10 | 10 | 100 | EUR 1.20 | High perceived value |
| Free soft drink | Free soft drink | 15 | 15 | 150 | EUR 0.80 | Low cost |
| Free fries | Free fries side | 20 | 20 | 200 | EUR 0.90 | Food attach |
| Dessert discount | 30% off dessert | 20 | 20 | 200 | EUR 0.70 | Safer than free dessert |
| Burger discount | 20% off burger | 25 | 25 | 250 | EUR 1.50 | Bigger prize |
| Grand prize | Free lunch for two | 10 | 1 | 10 | EUR 8.00 | Optional, use strict cap |

## Economics check

Estimate expected reward cost:

```text
Expected reward cost per play =
  sum(reward weight as decimal * merchant cost per redemption * expected redemption rate)
```

Conservative example:

- expected scans: 1,000
- expected redemption rate: 40%
- average reward cost if redeemed: EUR 1.20
- expected merchant reward cost: 1,000 * 0.40 * EUR 1.20 = EUR 480

The campaign should be approved only if the merchant understands the expected
reward cost.

## Fraud controls

- reward can be redeemed once only
- cashier validates public code or token before honoring reward
- reward screenshots are not enough
- QR batch can be paused if codes are copied or abused
- suspicious activity owner:
- emergency contact:

## Customer data

- collect email: yes / no
- marketing consent copy:
- privacy notice location:
- customer support contact:

## Approval

Merchant approved by:

Provider approved by:

Date:
