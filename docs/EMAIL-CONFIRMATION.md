# Registration confirmation through GHL

Import the local `.env.ghl` into Vercel Production and redeploy (the full `.env.vercel` also includes these values). New variables: `GHL_API_TOKEN`, `GHL_LOCATION_ID`, `GHL_FROM_EMAIL`. The actual configured sender is the user-provided GHL address with the display name AFC. Do not substitute an unverified address/domain.

Flow: registration creates an unconfirmed account with zero points; GHL matches/creates the email contact, adds the `afc` tag without replacing other tags, and sends only the confirmation email. The email opens a confirmation page; the user clicks Confirm email there. This explicit POST avoids email security scanners activating accounts by simply fetching links. Then the user signs in with their password. Successful confirmation credits 100 welcome points exactly once.

Links expire after 24 hours; only SHA-256 token hashes are stored in the database. Tokens travel in a URL fragment, not server query strings, and are removed from the address bar after loading. Replays and expired tokens are rejected. No automatic sign-in occurs from an email link. Resends require the account email/password and are limited to once per minute in addition to shared authentication limits. Existing links remain valid until expiry or successful confirmation; a failed send removes only its own token.

New online accounts cannot authenticate or use authenticated APIs before confirmation. Existing accounts are grandfathered by the additive migration, preserving the administrator. Local demo registration continues without sending real emails. Existing GHL tags and DND preferences are not overwritten, and the app does not enroll contacts in campaigns or workflows. Check that your own GHL automations do not send marketing messages when contacts or the `afc` tag are added.

GHL integration needs contact write and conversation message write permissions, plus a configured sending service. API acceptance is not proof of inbox delivery. Delivery errors leave the account unconfirmed and permit a resend from the sign-in form. Do not expose API tokens or confirmation links in logs.

The explicitly authorized delivery test sends a clearly labeled test email, adds `afc`, and does not create or confirm an AFC user account:

```powershell
node --env-file=.env.vercel node_modules/tsx/dist/cli.mjs scripts/test-confirmation-email.ts AUTHORIZED_RECIPIENT
```

Tests cover hash storage, expiry, replay/concurrent confirmation, one-time credit, and the contact/tag/email request payloads. The delivery test was accepted by GHL on 2026-10-14; recipient confirmation of inbox delivery remains separate.

API references: [Send email](https://marketplace.gohighlevel.com/docs/2021-07-28/ghl/conversations/send-a-new-message/), [Upsert contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/), [Add tags](https://marketplace.gohighlevel.com/docs/ghl/contacts/add-tags/).
