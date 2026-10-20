# AI Learning digital products

The `/resources/ai-prompt-packs` subpage (Greek: `/el/resources/ai-prompt-packs`) helps a visitor choose a practical AI learning pack by professional role, AI experience and PDF language. Submitting their email sends access to the full selected PDF. It does not enroll them in marketing or create an account.

## Prepare the private PDFs

Only the 16 numbered packs in each language are included. The extra Greek samples and supporting PDFs are excluded. The filename mapping lives in `shared/aiLearningProducts.ts`.

From the repository root, prepare the source directory:

```powershell
npm run ai-learning:prepare -- "C:\Users\bekas\Downloads\Yannis on AI & Data Science\b2b-plug-and-play\output\pdf"
```

The staging command copies the allowlisted files into `<DATA_DIR>/ai-learning-pdfs` by default. Set `AI_LEARNING_PDF_DIR` to choose another private directory. Preserve the `English/` and `Greek/` subfolders and exact catalog filenames when provisioning the production volume. Never put these PDFs in `apps/client/public`, `dist/public`, a public bucket or a public Git repository. They are streamed through the access route.

## Configure delivery

Deploy the Express backend with persistent private storage for the dedicated `ai-learning.db` SQLite file and PDFs. This feature does not use or migrate the main `bisolutions.db` users database. Configure:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key for transactional email. |
| `AI_LEARNING_FROM_EMAIL` | Verified sending address, optionally including a display name. Uses `CONTACT_FROM_EMAIL` only if explicitly configured. |
| `APP_URL` | Absolute public HTTP(S) website URL for links back to the pack finder. Also used for downloads when the API and website share a host. |
| `AI_LEARNING_API_URL` | Optional trusted backend origin that overrides `APP_URL` for download links. Useful when the website and API use different hosts. |
| `VITE_AI_LEARNING_API_URL` | Optional frontend build-time backend origin when the website uses a separate host. Empty means same-origin API calls. |
| `DATA_DIR` | Persistent private directory containing `bisolutions.db`. Default `./data`. |
| `AI_LEARNING_DATA_DIR` | Private persistent directory containing the dedicated `ai-learning.db` delivery database. Defaults to `DATA_DIR` (or `./data`). Can use a separate volume without changing the main users database. |
| `AI_LEARNING_PDF_DIR` | Optional private PDF directory. Default `<DATA_DIR>/ai-learning-pdfs`. |

For split hosting, add the website's exact origin to `ALLOWED_ORIGINS` on Express and build the website with `VITE_AI_LEARNING_API_URL` set to the backend origin. GitHub Pages alone cannot run the API, store private access records or send email. Use a running backend such as the existing Railway deployment. Download links use the configured backend origin, never the request's `Host` header.

For a dedicated Railway feature volume mounted at `/app/ai-learning`, set `AI_LEARNING_DATA_DIR=/app/ai-learning` and `AI_LEARNING_PDF_DIR=/app/ai-learning/pdfs`. Deploy so the volume is actually mounted before uploading the prepared `English/` and `Greek/` folders into its `pdfs/` directory. Confirm the running container's mount first; do not place a new volume over the existing main users database, change `DATA_DIR`, or copy a local `bisolutions.db` over production data. Both the dedicated delivery database and the private PDFs then survive deployment together.

Delivery remains unavailable if the API key, explicit sender, valid website/backend URL or selected PDF is missing. The page reports an error instead of claiming an email was sent. Resend acceptance confirms that the email was submitted to the provider; it does not prove inbox delivery. Each email also includes a language-specific link to the website pack finder so the learner can choose another pack or request a fresh access link.

## API behavior

`POST /api/ai-learning/access` accepts JSON:

```json
{
  "email": "learner@example.com",
  "role": "marketing",
  "experience": "novice",
  "language": "en",
  "website": ""
}
```

Roles must match the shared catalog. Experience is `novice`, `tried-ai` or `regular`; language is `en` or `el`. The optional `website` honeypot must be empty. The response is `{ "success": true }` only after Resend accepts the email and the delivery record is stored. Validation returns 400, throttling 429, missing configuration/files 503 and delivery failure 502, all with a safe `message`.

Each IP may make five access requests per hour, in addition to the application's global API limiter. An email address has a 60-second cooldown across all packs. The reservation is stored before sending, preventing simultaneous requests from bypassing the cooldown, and is removed if sending fails.

`GET /api/ai-learning/download/:token` streams only the selected PDF. Access links contain 32 random bytes, last seven days, and may be reused until expiry. Only a SHA-256 hash of the token is stored. Undelivered, unknown and malformed tokens return 404; expired links return 410. Download responses use `Content-Type: application/pdf`, attachment disposition, `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer` and no-index headers. Application request logging must redact the token segment; configure reverse-proxy and hosting access logs likewise if they log complete URLs.

For invalid, expired or unavailable download requests, browsers explicitly accepting `text/html` receive a simple recovery page with a clickable link back to the website pack finder. API clients continue to receive JSON. Recovery links use only trusted configured `APP_URL`; the download token, email and private file path are not reflected in the page.

## Data and retention

The `ai_learning_access` table in the dedicated `ai-learning.db` records the email, selected role, AI experience, PDF language, request time, token hash, expiry, delivery acceptance, and first successful verified download plus latest download time. SQLite uses WAL mode. It contains no newsletter subscription or user account. Records older than 30 days are removed when an AI Learning API request next runs. An idle deployment performs cleanup on its next request, so backup retention and idle storage require the operator's normal retention controls. Do not export these records into a marketing audience without a separate user request.

## Verify before launch

1. Prepare all 32 catalog PDFs in private storage and confirm they are absent from public build output.
2. Run `npm run check` and `npm run test:ai-learning`. The tests stub Resend and send no external email; the same delivery tests run in CI.
3. With deployment configuration present, select a real pack and request one delivery to an address you control. Check the full PDF language and role, a bad token, an expired link and the repeat-request cooldown.
4. Confirm application and infrastructure logs redact download tokens. Confirm the privacy notice and operator retention settings describe the actual deployment.
