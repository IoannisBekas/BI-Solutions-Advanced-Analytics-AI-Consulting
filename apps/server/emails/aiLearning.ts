import type { LearningLanguage } from "../../../shared/aiLearningProducts";

interface AiLearningEmailOptions {
  language: LearningLanguage;
  title: string;
  downloadUrl: string;
  finderUrl: string;
  websiteOrigin: string;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export function composeAiLearningEmail({ language, title, downloadUrl, finderUrl, websiteOrigin }: AiLearningEmailOptions) {
  const copy = language === "el" ? {
    subject: `Τα 100 AI prompts σου: ${title}`,
    preheader: "Το PDF σου είναι έτοιμο. Διάλεξε ένα prompt και προσάρμοσέ το στα μέτρα σου.",
    heading: "Το pack σου είναι έτοιμο.",
    introduction: "Ένα πρακτικό σημείο εκκίνησης για να βάλεις το AI στη δουλειά σου.",
    details: "100 prompts · PDF στα Ελληνικά",
    action: "Κατέβασε το PDF σου",
    expiry: "Ο σύνδεσμος ισχύει για 7 ημέρες.",
    coachHeading: "Μια συμβουλή από τον Γιάννη",
    coachTip: "Ξεκίνα με ένα prompt. Συμπλήρωσε τα πεδία με τα στοιχεία σου και επικόλλησέ το στο AI chat σου. Έλεγξε την απάντηση πριν τη χρησιμοποιήσεις.",
    founder: "Ιωάννης Μπέκας",
    founderRole: "Ιδρυτής της BI Solutions Group",
    recovery: "Άλλο pack ή νέος σύνδεσμος;",
    recoveryAction: "Επιστροφή στο AI Learning",
    privacy: "Αυτό το email αφορά μόνο το PDF που ζήτησες. Δεν σε εγγράφει σε newsletter.",
    avatarAlt: "Ο Γιάννης, ο οδηγός σου στο AI",
  } : {
    subject: `Your 100 AI prompts: ${title}`,
    preheader: "Your PDF is ready. Choose one prompt and make it your own.",
    heading: "Your pack is ready.",
    introduction: "A practical starting point for putting AI to work in your day.",
    details: "100 prompts · English PDF",
    action: "Download your pack",
    expiry: "This link is valid for 7 days.",
    coachHeading: "A quick tip from Yannis",
    coachTip: "Start with one prompt. Replace the fields with your details and paste it into your AI chat. Check the answer before using it.",
    founder: "Ioannis Bekas",
    founderRole: "Founder, BI Solutions Group",
    recovery: "Another pack or a fresh link?",
    recoveryAction: "Return to AI Learning",
    privacy: "This email delivers only the PDF you requested. It does not subscribe you to a newsletter.",
    avatarAlt: "Yannis, your AI learning coach",
  };
  const logoUrl = new URL("/assets/brand/bi-solutions-group-mark.png", websiteOrigin).href;
  const mascotUrl = new URL("/assets/email/ai-learning/ioannis-mascot.png", websiteOrigin).href;
  const websiteLabel = new URL(websiteOrigin).hostname;
  const html = `<!doctype html>
<html lang="${escapeHtml(language)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${escapeHtml(copy.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#f4f1eb;color:#171717;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;font-size:1px;line-height:1px;color:#f4f1eb;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(copy.preheader)}</div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f1eb" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:28px 12px;">
      <!--[if mso]><table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;">
        <tr><td style="padding:0 12px 24px;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td width="42" valign="middle"><img src="${escapeHtml(logoUrl)}" alt="" width="32" height="32" style="display:block;width:32px;height:32px;border:0;"></td>
              <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:21px;font-weight:700;letter-spacing:0.2px;color:#171717;">BI Solutions Group</td>
            </tr>
          </table>
        </td></tr>
        <tr><td bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e4dfd6;border-radius:18px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:32px 24px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2px;font-weight:700;color:#746d61;">AI LEARNING</td></tr>
            <tr><td style="padding:0 24px 16px;"><h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:36px;font-weight:700;letter-spacing:-0.7px;color:#171717;">${escapeHtml(copy.heading)}</h1></td></tr>
            <tr><td style="padding:0 24px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#5b574f;">${escapeHtml(copy.introduction)}</td></tr>
            <tr><td style="padding:0 24px 24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f7f5f0" style="width:100%;background-color:#f7f5f0;border:1px solid #ece7dd;border-radius:8px;border-collapse:separate;">
                <tr><td style="padding:20px 20px 8px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:27px;font-weight:700;color:#171717;">${escapeHtml(title)}</td></tr>
                <tr><td style="padding:0 20px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#746d61;">${escapeHtml(copy.details)}</td></tr>
              </table>
            </td></tr>
            <tr><td align="left" style="padding:0 24px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;">
                <tr><td align="center" bgcolor="#171717" style="background-color:#171717;border:1px solid #171717;border-radius:24px;mso-padding-alt:14px 24px;">
                  <a href="${escapeHtml(downloadUrl)}" style="display:inline-block;padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:700;text-decoration:none;color:#ffffff;mso-padding-alt:0;">${escapeHtml(copy.action)}</a>
                </td></tr>
              </table>
            </td></tr>
            <tr><td align="left" style="padding:12px 24px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#746d61;">${escapeHtml(copy.expiry)}</td></tr>
            <tr><td style="padding:0 24px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border-top:1px solid #ece7dd;">
                <tr><td width="72" valign="top" style="padding:24px 16px 0 0;"><img src="${escapeHtml(mascotUrl)}" alt="${escapeHtml(copy.avatarAlt)}" width="56" height="56" style="display:block;width:56px;height:56px;border:0;border-radius:50%;"></td>
                  <td valign="top" style="padding-top:24px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 8px;font-size:14px;line-height:21px;font-weight:700;color:#171717;">${escapeHtml(copy.coachHeading)}</p>
                    <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#5b574f;">${escapeHtml(copy.coachTip)}</p>
                    <p style="margin:0;font-size:13px;line-height:20px;color:#171717;font-weight:700;">${escapeHtml(copy.founder)}</p>
                    <p style="margin:0;font-size:12px;line-height:19px;color:#746d61;">${escapeHtml(copy.founderRole)}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:22px 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#746d61;">
          <p style="margin:0 0 12px;">${escapeHtml(copy.recovery)} <a href="${escapeHtml(finderUrl)}" style="color:#5b574f;text-decoration:underline;">${escapeHtml(copy.recoveryAction)}</a></p>
          <p style="margin:0 0 12px;">${escapeHtml(copy.privacy)}</p>
          <p style="margin:0;">BI Solutions Group &middot; <a href="${escapeHtml(websiteOrigin)}" style="color:#746d61;text-decoration:none;">${escapeHtml(websiteLabel)}</a></p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;
  const text = [
    copy.heading,
    copy.introduction,
    `${title}\n${copy.details}`,
    `${copy.action}: ${downloadUrl}`,
    copy.expiry,
    `${copy.coachHeading}\n${copy.coachTip}`,
    `${copy.founder}\n${copy.founderRole}`,
    `${copy.recovery}\n${copy.recoveryAction}: ${finderUrl}`,
    copy.privacy,
    `BI Solutions Group · ${websiteOrigin}`,
  ].join("\n\n");

  return { subject: copy.subject, html, text };
}
