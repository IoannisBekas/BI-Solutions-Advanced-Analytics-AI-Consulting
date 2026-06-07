# Bonusaki Pilot Support Runbook

## Support promise

For the first paid pilot, use manual support. Do not sell 24/7 SLA unless it is
priced and staffed.

Recommended promise:

- business-hours support by phone/email
- critical campaign pause requests handled as soon as possible
- non-critical changes within 1 business day

## Contacts

- Provider owner:
- Provider phone:
- Provider email:
- Merchant owner:
- Merchant manager phone:
- Cashier lead:

## Pre-launch checklist

- signed pilot agreement
- paid setup invoice
- approved campaign rules
- QR batch generated
- privacy notice approved
- cashier PIN created
- cashier SOP delivered
- production secrets configured
- campaign health endpoint checked
- cafe staff trained

## Daily operations

- check campaign is live
- check event counts are plausible
- check redemptions vs issued rewards
- ask merchant if staff saw any confusion
- log requested campaign changes

## Incident types

### Duplicate reward complaint

1. Ask for public reward code.
2. Validate status in admin/API.
3. If already redeemed, check redeemed time and cashier ID.
4. If system error is possible, issue manual merchant-approved replacement.
5. Record the case.

### QR code abuse

1. Identify QR batch or source.
2. Pause campaign or affected batch.
3. Notify merchant.
4. Generate replacement QR batch if needed.
5. Adjust rules or daily limits.

### Cashier PIN leak

1. Disable or rotate `BONUSAKI_CASHIER_PIN`.
2. Tell merchant manager.
3. Retrain staff.
4. Review redemptions during suspected leak window.

### Wrong reward economics

1. Pause campaign if reward cost is too high.
2. Update reward weights and daily max caps.
3. Ask merchant to approve new rules in writing.
4. Relaunch with a new campaign version.

## Pilot report

Minimum report:

- scans / demo plays
- issued rewards
- redeemed rewards
- redemption rate
- top rewards
- suspicious or invalid attempts
- recommendations for next month
