import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface StoredInquiry extends ContactInquiry {
  delivery_status: "pending" | "accepted" | "needs_review";
  delivery_attempts: number;
}

const MINUTE = 60_000;
// Resend remembers an idempotency key for 24 hours. Leave time for the final request to settle.
const RETRY_WINDOW = 23 * 60 * MINUTE;

export function openContactInquiryStore() {
  const volume = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  const directory = process.env.CONTACT_DATA_DIR?.trim() ||
    (volume ? path.join(volume, "contact") : process.env.DATA_DIR?.trim() || path.join(process.cwd(), "data"));
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const db = new Database(path.join(directory, "contact-inquiries.db"));

  try {
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = FULL");
    db.pragma("busy_timeout = 5000");
    db.exec(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        delivery_status TEXT NOT NULL DEFAULT 'pending'
          CHECK (delivery_status IN ('pending', 'accepted', 'needs_review')),
        delivery_attempts INTEGER NOT NULL DEFAULT 0,
        first_attempt_at INTEGER,
        next_attempt_at INTEGER NOT NULL,
        accepted_at INTEGER,
        provider_email_id TEXT,
        delivery_error TEXT,
        alert_attempted_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS contact_inquiries_due
        ON contact_inquiries (next_attempt_at) WHERE delivery_status = 'pending';
    `);
    db.transaction(() => {
      const columns = db.pragma("table_info(contact_inquiries)") as { name: string }[];
      if (!columns.some(column => column.name === "alert_attempted_at")) {
        db.exec("ALTER TABLE contact_inquiries ADD COLUMN alert_attempted_at INTEGER");
      }
    }).immediate();
  } catch (error) {
    db.close();
    throw error;
  }

  const insert = db.prepare(`
    INSERT INTO contact_inquiries (id, name, email, subject, message, created_at, next_attempt_at)
    VALUES (@id, @name, @email, @subject, @message, @now, @now)
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `);
  const find = db.prepare("SELECT * FROM contact_inquiries WHERE id = ?");
  const getDue = db.prepare(`
    SELECT id FROM contact_inquiries
    WHERE delivery_status = 'pending' AND next_attempt_at <= ?
    ORDER BY next_attempt_at
    LIMIT 10
  `);
  const reserve = db.prepare(`
    UPDATE contact_inquiries
    SET delivery_attempts = delivery_attempts + 1,
        first_attempt_at = COALESCE(first_attempt_at, @now),
        next_attempt_at = @now + MIN(@minute * (1 << MIN(delivery_attempts, 6)), 60 * @minute)
    WHERE id = @id AND delivery_status = 'pending' AND next_attempt_at <= @now
      AND (first_attempt_at IS NULL OR first_attempt_at > @deadline)
    RETURNING *
  `);
  const recordResult = db.prepare(`
    UPDATE contact_inquiries
    SET delivery_status = @status, provider_email_id = @providerId,
        accepted_at = @acceptedAt, delivery_error = @error
    WHERE id = @id AND delivery_attempts = @attempts AND delivery_status = 'pending'
  `);
  const recordMissingConfig = db.prepare(`
    UPDATE contact_inquiries SET delivery_error = 'notification_not_configured'
    WHERE id = ? AND delivery_status = 'pending'
      AND delivery_error IS NOT 'notification_not_configured'
  `);
  const reserveAlert = db.prepare(`
    UPDATE contact_inquiries SET alert_attempted_at = ?
    WHERE id = ? AND delivery_status = 'pending' AND alert_attempted_at IS NULL
  `);
  const expireRetries = db.prepare(`
    UPDATE contact_inquiries
    SET delivery_status = 'needs_review', delivery_error = COALESCE(delivery_error, 'notification_unconfirmed')
    WHERE delivery_status = 'pending' AND first_attempt_at <= ? AND next_attempt_at <= ?
    RETURNING id
  `);

  return {
    capture(inquiry: ContactInquiry) {
      return (insert.get({ ...inquiry, now: Date.now() }) || find.get(inquiry.id)) as StoredInquiry;
    },
    due(now: number) {
      return getDue.all(now) as { id: string }[];
    },
    reserve(id: string, now: number) {
      return reserve.get({ id, now, minute: MINUTE, deadline: now - RETRY_WINDOW }) as StoredInquiry | undefined;
    },
    recordAttempt(inquiry: StoredInquiry, result: { providerId: string } | { error: string }) {
      const accepted = "providerId" in result;
      return recordResult.run({
        id: inquiry.id,
        attempts: inquiry.delivery_attempts,
        status: accepted ? "accepted" : "pending",
        providerId: accepted ? result.providerId : null,
        acceptedAt: accepted ? Date.now() : null,
        error: accepted ? null : result.error,
      }).changes === 1;
    },
    recordMissingConfig(id: string) {
      return recordMissingConfig.run(id).changes === 1;
    },
    reserveAlert(id: string) {
      return reserveAlert.run(Date.now(), id).changes === 1;
    },
    expireRetries(now: number) {
      return expireRetries.all(now - RETRY_WINDOW, now) as { id: string }[];
    },
    close() {
      db.close();
    },
  };
}
