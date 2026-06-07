# Bonusaki Wallet and Onboarding Roadmap

This document separates what can be sold now from what needs more platform
work.

## Ready now for a paid pilot

- public product page
- public mock-data demo
- signed single-use reward token foundation
- reward validation and redemption endpoints
- admin campaign summary endpoint
- QR batch generation
- cashier SOP
- manual merchant onboarding
- manual support

## Apple Wallet and Google Wallet

The current demo shows a wallet-style reward preview. Real production wallet
passes require external platform setup:

- Apple Developer account with Wallet/PassKit certificates and pass type ID
- signed `.pkpass` generation and hosting
- Google Wallet API issuer access and pass class/object configuration
- secure pass update/revocation process
- production testing on real iOS and Android devices

Official references:

- Apple PassKit: https://developer.apple.com/documentation/passkit/
- Google Wallet Generic Passes: https://developers.google.com/wallet/generic

Pilot recommendation:

- use the current web pass/public code validation for the first cafe
- add real wallet passes only after one pilot proves merchant demand
- price wallet-pass infrastructure as a paid upgrade or higher tier

## Merchant self-onboarding

Not ready as fully automated SaaS. For the first cafe, use manual onboarding:

1. collect merchant details
2. agree campaign rules
3. generate QR batch
4. configure production secrets
5. train cashier
6. monitor campaign manually

Future self-service requirements:

- merchant account creation
- campaign builder
- reward editor
- QR batch manager
- staff users and role permissions
- billing/subscription integration
- merchant dashboard
- audit logs and export

## Multi-merchant dashboard

Current state is suitable for one controlled pilot campaign. A finished
multi-merchant dashboard should be scoped separately.

Minimum next dashboard scope:

- merchant selector
- campaign selector
- issued/redeemed/open/expired counts
- event trend
- reward distribution
- QR batch list
- cashier staff list
- CSV export

## Fraud controls

Ready now:

- signed reward tokens
- stored token hashes
- public code validation
- single-use redemption status
- cashier PIN
- daily issue limit
- audit timestamps

Still needed for scale:

- per-QR batch limits
- per-device or per-email throttling
- merchant staff accounts instead of shared PIN
- abuse dashboard
- campaign pause controls
- automated anomaly alerts
