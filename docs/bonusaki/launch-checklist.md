# Bonusaki Cafe Pilot Launch Checklist

Use this as the go/no-go checklist before real customers scan production QR
codes.

## Commercial

- [ ] Merchant agreement signed
- [ ] Setup invoice paid
- [ ] Monthly price and minimum term accepted
- [ ] Reward cost responsibility accepted by merchant
- [ ] Pilot dates confirmed

## Campaign

- [ ] Merchant display name confirmed
- [ ] Campaign start/end dates confirmed
- [ ] Reward table approved
- [ ] Reward weights total 100
- [ ] Daily play limit approved
- [ ] Reward expiration approved
- [ ] Expected reward cost reviewed
- [ ] Staff training scheduled

## QR batch

- [ ] QR batch generated
- [ ] `BONUSAKI_QR_SECRET` set if using signed QR verification
- [ ] `BONUSAKI_REQUIRE_SIGNED_QR=true` only after the signed QR batch is printed
- [ ] QR manifest reviewed
- [ ] Test scan opens correct URL
- [ ] Test one QR cannot issue more than one reward
- [ ] Placement plan approved
- [ ] Print files approved
- [ ] Abused/lost QR pause process explained

## Cashier

- [ ] Cashier PIN set
- [ ] Cashier SOP delivered
- [ ] Manager knows how to handle invalid/used rewards
- [ ] Test valid redemption completed
- [ ] Test duplicate redemption blocked
- [ ] Test invalid code blocked

## Production configuration

- [ ] `BONUSAKI_PILOT_ENABLED=true`
- [ ] `BONUSAKI_TOKEN_SECRET` set, at least 32 characters
- [ ] `BONUSAKI_QR_SECRET` set, at least 32 characters if signed QR verification is required
- [ ] `BONUSAKI_REQUIRE_SIGNED_QR` reviewed
- [ ] `BONUSAKI_CASHIER_PIN` set
- [ ] `BONUSAKI_ADMIN_KEY` set, at least 24 characters
- [ ] `ALLOWED_ORIGINS` includes `https://www.bisolutions.group`
- [ ] `/api/bonusaki/health` shows expected readiness flags
- [ ] `/api/bonusaki/campaign` returns expected campaign
- [ ] `/api/bonusaki/rewards/issue` issues one reward from a real QR
- [ ] `/api/bonusaki/rewards/validate` validates the public code
- [ ] `/api/bonusaki/rewards/redeem` redeems with cashier PIN

## Privacy and support

- [ ] Customer privacy notice approved
- [ ] Email collection and marketing consent decision approved
- [ ] Support owner assigned
- [ ] Merchant escalation contact confirmed
- [ ] Incident log location agreed
- [ ] Campaign pause procedure agreed

## Go/no-go

- [ ] Go
- [ ] No-go

Decision owner:

Date:
