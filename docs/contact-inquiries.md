# Contact inquiry delivery

The Express contact endpoint validates its input and writes the inquiry to `contact-inquiries.db` before requesting an email from Resend. The form receives a reference after storage succeeds. A `200` response means Resend accepted the email. A `202` response means the inquiry is recorded and its notification is pending or needs review. Resend acceptance does not confirm arrival in the inbox.

## Deployment

- Keep the contact database on a persistent, private volume. The directory resolves in this order: `CONTACT_DATA_DIR`, `$RAILWAY_VOLUME_MOUNT_PATH/contact`, `DATA_DIR`, then `./data`. With the Railway volume mounted at `/app/ai-learning`, the default production path is `/app/ai-learning/contact/contact-inquiries.db`. Leave the main application's `DATA_DIR` in place.
- Set `RESEND_API_KEY`, `CONTACT_RECIPIENT_EMAIL`, and `CONTACT_FROM_EMAIL` on the Express service. The sender needs to be verified in Resend. If any value is missing, the inquiry is still captured and the notification stays pending.
- Optionally set `CONTACT_ALERT_WEBHOOK_URL` to a private Slack-compatible HTTPS webhook. A notification failure or missing email configuration triggers one alert attempt per inquiry. The alert contains only the inquiry reference and a delivery error code. Its outcome does not affect inquiry capture or email retries.
- Confirm the database survives a restart and send a labeled inquiry through the public form before relying on delivery. Match its reference in SQLite, Resend activity and the inbox. Keep database access and backups restricted because they contain form submissions.

## Investigating a notification

Open the private database from the Railway service or an authorized backup. This query lists delivery state and error codes without displaying the form contents. Timestamps are Unix milliseconds.

```sql
SELECT id, delivery_status, delivery_attempts, delivery_error, provider_email_id, alert_attempted_at, created_at
FROM contact_inquiries
ORDER BY created_at DESC
LIMIT 50;
```

The server retries due notifications after startup and then once a minute, spacing individual attempts from one minute up to one hour. It reuses the same provider idempotency key. Automatic retries stop 23 hours after the first provider attempt, within the provider's 24-hour idempotency window. Inquiries with expired retries remain in `needs_review` for recovery. For those inquiries, check Resend activity for the `[Contact <first 8 characters of id>]` subject prefix and check the inbox before taking further action. Use the saved submission to follow up when you confirm it needs a response.
