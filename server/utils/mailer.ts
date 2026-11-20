import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/index.js";
import { systemSettings, users, profiles, notificationPreferences } from "../../src/db/schema.js";
import { decryptString } from "./encryption.js";

export const getSmtpConfig = async () => {
  let settings: any[] = [];
  try {
    settings = await db.select().from(systemSettings);
  } catch (e) {
    // In case DB is not yet ready or migrating
  }

  const config: Record<string, string> = {};
  for (const s of settings) {
    if (s.key && s.key.startsWith("smtp_")) {
      config[s.key] = s.value;
    }
  }

  let pass = config["smtp_pass"] || process.env.SMTP_PASS;
  if (config["smtp_pass"]) {
    try {
      pass = decryptString(config["smtp_pass"]);
    } catch (e) {
      console.warn("SMTP şifresi çözülemedi, fallback kullanılacak.");
    }
  }

  const host = config["smtp_host"] || process.env.SMTP_HOST;
  const user = config["smtp_user"] || process.env.SMTP_USER;
  const isConfigured = Boolean(host && user && pass);

  return {
    isConfigured,
    host: host || "smtp.ethereal.email",
    port: parseInt(config["smtp_port"] || process.env.SMTP_PORT || "587", 10),
    secure: (config["smtp_secure"] || process.env.SMTP_SECURE) === "true",
    user,
    pass,
    from: config["smtp_from"] || process.env.SMTP_FROM || '"Genç Sosyal" <noreply@gencsosyal.com>',
  };
};

export const getTransporter = async () => {
  const config = await getSmtpConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_ALLOW_INSECURE_TLS !== "true",
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
};

const isProdEnv = () => process.env.NODE_ENV === "production";
const maskSecretForLog = (secret: string) => (isProdEnv() ? "[REDACTED_IN_PRODUCTION]" : secret);

export const getAppBaseUrl = (): string => {
  const raw = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
};

export const escapeHtml = (unsafe: string | number | null | undefined): string => {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const safeUrl = (href: string): string => {
  const trimmed = (href || "").trim();
  if (!trimmed) return getAppBaseUrl();
  if (trimmed.startsWith("/")) {
    return `${getAppBaseUrl()}${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // fallback to base url
  }
  return getAppBaseUrl();
};

const truncateText = (text: string | null | undefined, maxLen = 180): string => {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
};

const getInitials = (name: string | null | undefined): string => {
  const clean = (name || "GS").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

// Lightweight per-recipient anti-spam cooldown for high-frequency social notifications
const emailThrottleMap = new Map<string, number>();
const MAX_THROTTLE_KEYS = 5000;

const shouldThrottleEmail = (key: string, cooldownMs: number): boolean => {
  const now = Date.now();
  const lastSent = emailThrottleMap.get(key);
  if (lastSent && now - lastSent < cooldownMs) {
    return true;
  }
  if (emailThrottleMap.size > MAX_THROTTLE_KEYS) {
    for (const [k, ts] of emailThrottleMap.entries()) {
      if (now - ts > 15 * 60 * 1000) {
        emailThrottleMap.delete(k);
      }
    }
  }
  emailThrottleMap.set(key, now);
  return false;
};

// --- MODERN GENÇ SOSYAL DESIGN SYSTEM FOR EMAILS ---

type EmailTone = "brand" | "indigo" | "emerald" | "amber" | "rose" | "slate";

interface TonePalette {
  accent: string;
  accentEnd: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  btnBg: string;
  softBg: string;
  softBorder: string;
}

const TONE_PALETTES: Record<EmailTone, TonePalette> = {
  brand: {
    accent: "#2563EB",
    accentEnd: "#4F46E5",
    badgeBg: "#EFF6FF",
    badgeText: "#1D4ED8",
    badgeBorder: "#BFDBFE",
    btnBg: "#2563EB",
    softBg: "#F8FAFC",
    softBorder: "#E2E8F0",
  },
  indigo: {
    accent: "#4F46E5",
    accentEnd: "#7C3AED",
    badgeBg: "#EEF2FF",
    badgeText: "#4338CA",
    badgeBorder: "#C7D2FE",
    btnBg: "#4F46E5",
    softBg: "#F5F3FF",
    softBorder: "#DDD6FE",
  },
  emerald: {
    accent: "#16A34A",
    accentEnd: "#059669",
    badgeBg: "#ECFDF5",
    badgeText: "#047857",
    badgeBorder: "#A7F3D0",
    btnBg: "#059669",
    softBg: "#F0FDF4",
    softBorder: "#BBF7D0",
  },
  amber: {
    accent: "#D97706",
    accentEnd: "#EA580C",
    badgeBg: "#FFFBEB",
    badgeText: "#B45309",
    badgeBorder: "#FDE68A",
    btnBg: "#0F2557",
    softBg: "#FFFBEB",
    softBorder: "#FDE68A",
  },
  rose: {
    accent: "#E11D48",
    accentEnd: "#DB2777",
    badgeBg: "#FFF1F2",
    badgeText: "#BE123C",
    badgeBorder: "#FECDD3",
    btnBg: "#E11D48",
    softBg: "#FFF1F2",
    softBorder: "#FECDD3",
  },
  slate: {
    accent: "#0F2557",
    accentEnd: "#2563EB",
    badgeBg: "#F1F5F9",
    badgeText: "#334155",
    badgeBorder: "#CBD5E1",
    btnBg: "#0F2557",
    softBg: "#F8FAFC",
    softBorder: "#E2E8F0",
  },
};

interface BaseTemplateOptions {
  title: string;
  preheader: string;
  eyebrow: string;
  tone?: EmailTone;
  content: string;
  footerNote?: string;
  showPreferencesLink?: boolean;
}

const renderCtaButton = (label: string, href: string, tone: EmailTone = "brand") => {
  const palette = TONE_PALETTES[tone];
  const targetUrl = escapeHtml(safeUrl(href));
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 24px 0;">
      <tr>
        <td align="left">
          <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="gs-btn" style="display:inline-block;background-color:${palette.btnBg};background-image:linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentEnd} 100%);color:#ffffff !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1;text-decoration:none;padding:15px 28px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 8px 20px -6px rgba(37,99,235,0.45);">
            ${escapeHtml(label)} &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;
};

const renderInfoCard = (rows: { label: string; value: string }[], tone: EmailTone = "slate") => {
  const validRows = rows.filter((r) => r.value && r.value.trim().length > 0);
  if (validRows.length === 0) return "";
  const palette = TONE_PALETTES[tone];

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="gs-soft-card" style="background-color:${palette.softBg};border:1px solid ${palette.softBorder};border-radius:16px;margin:20px 0;">
      <tr>
        <td style="padding:18px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${validRows
              .map(
                (row, idx) => `
              <tr>
                <td class="gs-muted" style="padding:${idx === 0 ? "0 12px 10px 0" : idx === validRows.length - 1 ? "10px 12px 0 0" : "10px 12px 10px 0"};font-size:13px;font-weight:600;color:#64748B;vertical-align:top;width:36%;${idx < validRows.length - 1 ? "border-bottom:1px solid #E2E8F0;" : ""}">
                  ${escapeHtml(row.label)}
                </td>
                <td class="gs-strong" style="padding:${idx === 0 ? "0 0 10px 0" : idx === validRows.length - 1 ? "10px 0 0 0" : "10px 0 10px 0"};font-size:13px;font-weight:600;color:#0F172A;vertical-align:top;text-align:right;word-break:break-word;${idx < validRows.length - 1 ? "border-bottom:1px solid #E2E8F0;" : ""}">
                  ${escapeHtml(row.value)}
                </td>
              </tr>
            `
              )
              .join("")}
          </table>
        </td>
      </tr>
    </table>
  `;
};

const renderActorPreviewCard = (params: {
  actorName: string;
  actorUsername?: string;
  actionSummary: string;
  snippet?: string;
  meta?: string;
  tone?: EmailTone;
}) => {
  const palette = TONE_PALETTES[params.tone || "brand"];
  const initials = escapeHtml(getInitials(params.actorName || params.actorUsername || "GS"));
  const handleText = params.actorUsername ? `@${params.actorUsername}` : "";
  const safeSnippet = truncateText(params.snippet, 220);

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="gs-soft-card" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:18px;margin:20px 0;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="46" valign="top" style="padding-right:14px;">
                <div style="width:42px;height:42px;border-radius:13px;background-color:${palette.accent};background-image:linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentEnd} 100%);color:#FFFFFF;font-size:15px;font-weight:800;line-height:42px;text-align:center;letter-spacing:-0.02em;">
                  ${initials}
                </div>
              </td>
              <td valign="middle">
                <div class="gs-strong" style="font-size:15px;font-weight:700;color:#0F172A;line-height:1.3;">
                  ${escapeHtml(params.actorName)}
                  ${handleText ? `<span class="gs-muted" style="font-weight:500;color:#64748B;font-size:13px;margin-left:4px;">${escapeHtml(handleText)}</span>` : ""}
                </div>
                <div class="gs-text" style="font-size:14px;color:#475569;margin-top:3px;line-height:1.45;">
                  ${escapeHtml(params.actionSummary)}
                </div>
              </td>
            </tr>
          </table>
          ${
            safeSnippet
              ? `
            <div class="gs-quote" style="margin-top:16px;padding:14px 16px;background-color:#FFFFFF;border-left:3px solid ${palette.accent};border-radius:0 12px 12px 0;font-size:14px;line-height:1.6;color:#1E293B;">
              &ldquo;${escapeHtml(safeSnippet)}&rdquo;
            </div>
          `
              : ""
          }
          ${
            params.meta
              ? `<div class="gs-muted" style="margin-top:12px;font-size:12px;font-weight:600;color:#64748B;">${escapeHtml(params.meta)}</div>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
};

const renderLinkFallback = (href: string) => {
  const url = safeUrl(href);
  return `
    <p class="gs-muted" style="margin:20px 0 0 0;font-size:12px;line-height:1.6;color:#64748B;">
      Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınızın adres çubuğuna kopyalayabilirsiniz:<br />
      <a href="${escapeHtml(url)}" style="color:#2563EB;text-decoration:underline;word-break:break-all;">${escapeHtml(url)}</a>
    </p>
  `;
};

const baseTemplate = ({
  title,
  preheader,
  eyebrow,
  tone = "brand",
  content,
  footerNote,
  showPreferencesLink = false,
}: BaseTemplateOptions) => {
  const palette = TONE_PALETTES[tone];
  const appUrl = getAppBaseUrl();
  const settingsUrl = `${appUrl}/settings`;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="tr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(title)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0F172A; }
    .gs-btn:hover { opacity: 0.94 !important; }
    @media only screen and (max-width: 620px) {
      .gs-outer { padding: 16px 10px !important; }
      .gs-card-pad { padding: 26px 20px !important; }
      .gs-header-pad { padding: 22px 20px 18px 20px !important; }
      .gs-footer-pad { padding: 20px !important; }
      .gs-h1 { font-size: 22px !important; }
      .gs-otp { font-size: 28px !important; letter-spacing: 8px !important; padding: 16px 18px !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .gs-canvas { background-color: #070B14 !important; color: #F1F5F9 !important; }
      .gs-card { background-color: #0F172A !important; border-color: #1E293B !important; }
      .gs-header-border { border-bottom-color: #1E293B !important; }
      .gs-brand-name { color: #F8FAFC !important; }
      .gs-h1, .gs-strong { color: #F8FAFC !important; }
      .gs-text { color: #CBD5E1 !important; }
      .gs-muted { color: #94A3B8 !important; }
      .gs-soft-card { background-color: #162033 !important; border-color: #25324B !important; }
      .gs-quote { background-color: #0F172A !important; color: #E2E8F0 !important; }
      .gs-footer { background-color: #0B1220 !important; border-top-color: #1E293B !important; }
      .gs-divider { border-color: #1E293B !important; }
    }
  </style>
</head>
<body class="gs-canvas" style="margin:0;padding:0;background-color:#F1F5F9;">
  <!-- Inbox Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="gs-canvas" style="background-color:#F1F5F9;">
    <tr>
      <td align="center" class="gs-outer" style="padding:36px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
          <!-- Main Email Card -->
          <tr>
            <td class="gs-card" style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:24px;overflow:hidden;box-shadow:0 20px 45px -24px rgba(15,37,87,0.18);">
              <!-- Top Brand Gradient Accent Bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td height="5" style="height:5px;line-height:5px;font-size:0;background-color:${palette.accent};background-image:linear-gradient(90deg, #0F2557 0%, ${palette.accent} 52%, ${palette.accentEnd} 100%);">&nbsp;</td>
                </tr>
              </table>

              <!-- Card Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="gs-header-pad gs-header-border" style="padding:26px 34px 20px 34px;border-bottom:1px solid #F1F5F9;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left" valign="middle">
                          <a href="${escapeHtml(appUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:inline-block;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td valign="middle" style="padding-right:11px;">
                                  <div style="width:36px;height:36px;border-radius:11px;background-color:#0F2557;background-image:linear-gradient(135deg, #0F2557 0%, #2563EB 60%, #6366F1 100%);color:#FFFFFF;font-size:14px;font-weight:900;line-height:36px;text-align:center;letter-spacing:-0.04em;">
                                    GS
                                  </div>
                                </td>
                                <td valign="middle">
                                  <div class="gs-brand-name" style="font-size:17px;font-weight:800;color:#0F172A;letter-spacing:-0.03em;line-height:1.1;">Genç Sosyal</div>
                                  <div class="gs-muted" style="font-size:11px;font-weight:600;color:#64748B;letter-spacing:0.01em;margin-top:2px;">Yeni Nesil Sosyal Platform</div>
                                </td>
                              </tr>
                            </table>
                          </a>
                        </td>
                        <td align="right" valign="middle">
                          <span style="display:inline-block;background-color:${palette.badgeBg};color:${palette.badgeText};border:1px solid ${palette.badgeBorder};font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;padding:6px 11px;border-radius:999px;">
                            ${escapeHtml(eyebrow)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Card Body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="gs-card-pad" style="padding:32px 34px 34px 34px;">
                    ${content}
                  </td>
                </tr>
              </table>

              <!-- Card Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="gs-footer gs-footer-pad" style="background-color:#F8FAFC;border-top:1px solid #E2E8F0;padding:22px 34px;">
                    ${
                      footerNote
                        ? `<p class="gs-muted" style="margin:0 0 12px 0;font-size:12px;line-height:1.6;color:#64748B;">${escapeHtml(footerNote)}</p>`
                        : ""
                    }
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left" valign="middle" class="gs-muted" style="font-size:12px;color:#64748B;line-height:1.5;">
                          &copy; ${year} <strong>Genç Sosyal</strong> &middot; Tüm hakları saklıdır.
                        </td>
                        <td align="right" valign="middle" style="font-size:12px;line-height:1.5;">
                          ${
                            showPreferencesLink
                              ? `<a href="${escapeHtml(settingsUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563EB;font-weight:600;text-decoration:none;">Bildirim Tercihleri</a>`
                              : `<a href="${escapeHtml(appUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563EB;font-weight:600;text-decoration:none;">Platforma Git</a>`
                          }
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sub-footer Meta -->
          <tr>
            <td align="center" class="gs-muted" style="padding:18px 16px 0 16px;font-size:11px;line-height:1.6;color:#94A3B8;">
              Bu e-posta Genç Sosyal bildirim servisi tarafından otomatik olarak gönderilmiştir.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const sendEmailSafely = async (params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  devLogLabel: string;
  devLogDetail?: string;
  throwOnUnconfigured?: boolean;
  throwOnError?: boolean;
}): Promise<{ sent: boolean }> => {
  const config = await getSmtpConfig();

  if (!config.isConfigured) {
    if (params.throwOnUnconfigured) {
      throw new Error(
        "SMTP ayarları henüz yapılandırılmamış. Lütfen Sunucu (Host), Kullanıcı ve Parola alanlarını doldurun."
      );
    }
    console.log(
      `\n📧 [GENÇ SOSYAL · ${params.devLogLabel}] Alıcı: ${params.to}${params.devLogDetail ? ` | ${params.devLogDetail}` : ""} (SMTP yapılandırılmadı)\n`
    );
    return { sent: false };
  }

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: config.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return { sent: true };
  } catch (err: any) {
    if (params.throwOnError) {
      throw err;
    }
    console.warn(`[SMTP] ${params.devLogLabel} e-postası gönderilemedi (${err?.message || "Bilinmeyen hata"}).`);
    return { sent: false };
  }
};

// ============================================================================
// 1. TRANSACTIONAL & SECURITY EMAILS (UPGRADED MODERN TEMPLATES)
// ============================================================================

const buildOtpEmailHtml = (displayName: string, otpCode: string) =>
  baseTemplate({
    title: "E-posta Doğrulama Kodunuz",
    preheader: `Genç Sosyal doğrulama kodunuz: ${otpCode} (10 dakika geçerli)`,
    eyebrow: "Doğrulama",
    tone: "brand",
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        E-posta doğrulama kodunuz hazır
      </h1>
      <p class="gs-text" style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(displayName || "Kullanıcı")}</strong>,
      </p>
      <p class="gs-text" style="margin:0 0 24px 0;font-size:15px;line-height:1.65;color:#475569;">
        Genç Sosyal hesabınızı güvenle oluşturmak için aşağıdaki tek kullanımlık 6 haneli doğrulama kodunu ekrana girin:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
        <tr>
          <td align="center" style="padding:24px 16px;background-color:#0F2557;background-image:linear-gradient(135deg, #0F2557 0%, #1E3A8A 55%, #2563EB 100%);border-radius:18px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#BFDBFE;margin-bottom:10px;">
              TEK KULLANIMLIK GÜVENLİK KODU
            </div>
            <div class="gs-otp" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#FFFFFF;line-height:1.1;padding-left:10px;">
              ${escapeHtml(otpCode)}
            </div>
          </td>
        </tr>
      </table>
      ${renderInfoCard(
        [
          { label: "Geçerlilik Süresi", value: "10 Dakika" },
          { label: "Kullanım", value: "Tek seferlik doğrulama" },
          { label: "Güvenlik İpucu", value: "Bu kodu kimseyle paylaşmayın" },
        ],
        "brand"
      )}
      <p class="gs-muted" style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:#64748B;">
        Bu doğrulama işlemini siz başlatmadıysanız herhangi bir işlem yapmanıza gerek yoktur; bu e-postayı güvenle silebilirsiniz.
      </p>
    `,
    footerNote: "Genç Sosyal ekibi sizden hiçbir zaman doğrulama kodunuzu veya şifrenizi istemez.",
  });

export const sendOtpVerificationEmail = async (
  to: string,
  displayName: string,
  otpCode: string
): Promise<{ sent: boolean }> => {
  const html = buildOtpEmailHtml(displayName, otpCode);
  const text = `Genç Sosyal\n\nMerhaba ${displayName || "Kullanıcı"},\nE-posta Doğrulama Kodunuz: ${otpCode}\n\nBu kod 10 dakika boyunca geçerlidir. Güvenliğiniz için bu kodu kimseyle paylaşmayın.`;

  return sendEmailSafely({
    to,
    subject: `${otpCode} — Genç Sosyal Doğrulama Kodunuz`,
    html,
    text,
    devLogLabel: "OTP DOĞRULAMA",
    devLogDetail: `Kod: ${maskSecretForLog(otpCode)}`,
  });
};

const buildVerificationLinkHtml = (displayName: string, verifyLink: string) =>
  baseTemplate({
    title: "E-posta Adresinizi Doğrulayın",
    preheader: "Hesabınızı aktifleştirmek için tek tıkla e-posta adresinizi onaylayın.",
    eyebrow: "Hesap Onayı",
    tone: "brand",
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        E-posta adresinizi onaylayın
      </h1>
      <p class="gs-text" style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(displayName || "Kullanıcı")}</strong>,
      </p>
      <p class="gs-text" style="margin:0 0 8px 0;font-size:15px;line-height:1.65;color:#475569;">
        Genç Sosyal hesabınızın tüm güvenlik ve bildirim özelliklerini aktif hale getirmek için e-posta adresinizi doğrulamanız gerekiyor.
      </p>
      ${renderCtaButton("E-posta Adresimi Doğrula", verifyLink, "brand")}
      ${renderLinkFallback(verifyLink)}
    `,
    footerNote: "Bu hesabı siz oluşturmadıysanız bu e-postayı dikkate almayabilirsiniz.",
  });

export const sendVerificationEmail = async (to: string, displayName: string, verifyLink: string) => {
  const html = buildVerificationLinkHtml(displayName, verifyLink);
  const text = `Genç Sosyal\n\nMerhaba ${displayName},\nE-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:\n${verifyLink}`;

  await sendEmailSafely({
    to,
    subject: "Genç Sosyal — E-posta Adresinizi Doğrulayın",
    html,
    text,
    devLogLabel: "E-POSTA DOĞRULAMA LİNKİ",
    devLogDetail: `Link: ${maskSecretForLog(verifyLink)}`,
  });
};

const buildPasswordResetHtml = (displayName: string, resetLink: string) =>
  baseTemplate({
    title: "Şifrenizi Sıfırlayın",
    preheader: "Genç Sosyal şifrenizi yenilemek için güvenli sıfırlama bağlantınız hazır.",
    eyebrow: "Şifre Sıfırlama",
    tone: "amber",
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        Yeni bir şifre belirleyin
      </h1>
      <p class="gs-text" style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(displayName || "Kullanıcı")}</strong>,
      </p>
      <p class="gs-text" style="margin:0 0 8px 0;font-size:15px;line-height:1.65;color:#475569;">
        Hesabınız için şifre sıfırlama talebi aldık. Aşağıdaki güvenli bağlantıya tıklayarak yeni şifrenizi hemen oluşturabilirsiniz.
      </p>
      ${renderCtaButton("Şifremi Sıfırla", resetLink, "amber")}
      ${renderInfoCard(
        [
          { label: "Bağlantı Süresi", value: "15 Dakika" },
          { label: "İşlem Tipi", value: "Tek kullanımlık şifre yenileme" },
        ],
        "amber"
      )}
      ${renderLinkFallback(resetLink)}
    `,
    footerNote: "Bu talebi siz yapmadıysanız hesabınız güvendedir; bu e-postayı dikkate almayabilirsiniz.",
  });

export const sendPasswordResetEmail = async (to: string, displayName: string, resetLink: string) => {
  const html = buildPasswordResetHtml(displayName, resetLink);
  const text = `Genç Sosyal\n\nMerhaba ${displayName},\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın (15 dakika geçerlidir):\n${resetLink}`;

  await sendEmailSafely({
    to,
    subject: "Genç Sosyal — Şifre Sıfırlama Talebi",
    html,
    text,
    devLogLabel: "ŞİFRE SIFIRLAMA",
    devLogDetail: `Link: ${maskSecretForLog(resetLink)}`,
  });
};

const buildSecurityAlertHtml = (
  displayName: string,
  action: string,
  date: string,
  device?: string,
  os?: string,
  browser?: string,
  ipAddress?: string
) => {
  const deviceSummary = [browser, os, device ? `(${device})` : ""].filter(Boolean).join(" · ");
  const rows = [
    { label: "İşlem", value: action || "Yeni oturum açıldı" },
    ...(deviceSummary ? [{ label: "Cihaz / Tarayıcı", value: deviceSummary }] : []),
    ...(ipAddress ? [{ label: "IP Adresi", value: ipAddress }] : []),
    { label: "Tarih & Saat", value: date },
  ];

  return baseTemplate({
    title: "Güvenlik Bildirimi",
    preheader: `Hesabınızda yeni bir güvenlik hareketi algılandı: ${action}`,
    eyebrow: "Güvenlik Uyarısı",
    tone: "amber",
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        Hesabınızda yeni bir güvenlik hareketi
      </h1>
      <p class="gs-text" style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(displayName || "Kullanıcı")}</strong>,
      </p>
      <p class="gs-text" style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#475569;">
        Hesabınızı korumak için önemli bir güvenlik olayını sizinle paylaşıyoruz. Aşağıdaki bilgileri inceleyin:
      </p>
      ${renderInfoCard(rows, "amber")}
      <p class="gs-text" style="margin:16px 0 4px 0;font-size:14px;line-height:1.65;color:#475569;">
        Bu işlem size aitse ek bir şey yapmanıza gerek yoktur. Size ait değilse derhal şifrenizi yenileyin ve açık oturumlarınızı sonlandırın.
      </p>
      ${renderCtaButton("Güvenlik Ayarlarını Kontrol Et", "/settings", "amber")}
    `,
    footerNote: "Güvenlik bildirimleri hesap emniyetiniz için her zaman gönderilir.",
  });
};

export const sendSecurityAlertEmail = async (
  to: string,
  displayName: string,
  action: string,
  date: string,
  device?: string,
  os?: string,
  browser?: string,
  ipAddress?: string
) => {
  const html = buildSecurityAlertHtml(displayName, action, date, device, os, browser, ipAddress);
  const text = `Genç Sosyal - Güvenlik Bildirimi\n\nMerhaba ${displayName},\nİşlem: ${action}\nTarih: ${date}${ipAddress ? `\nIP: ${ipAddress}` : ""}\n\nBu işlem size ait değilse lütfen derhal şifrenizi değiştirin.`;

  await sendEmailSafely({
    to,
    subject: "Genç Sosyal — Güvenlik Bildirimi",
    html,
    text,
    devLogLabel: "GÜVENLİK UYARISI",
    devLogDetail: `${action} (${date})`,
  });
};

const buildVerificationStatusHtml = (displayName: string, status: "approved" | "rejected") => {
  const isApproved = status === "approved";
  const title = isApproved ? "Mavi Tik başvurunuz onaylandı" : "Mavi Tik başvurunuz sonuçlandı";

  return baseTemplate({
    title,
    preheader: isApproved
      ? "Tebrikler! Genç Sosyal hesabınız artık onaylı (Mavi Tik) rozetine sahip."
      : "Genç Sosyal onaylı hesap başvurunuz incelendi.",
    eyebrow: isApproved ? "Onaylı Hesap" : "Başvuru Sonucu",
    tone: isApproved ? "emerald" : "slate",
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        ${isApproved ? "Tebrikler, hesabınız onaylandı!" : "Doğrulama başvurunuz incelendi"}
      </h1>
      <p class="gs-text" style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(displayName || "Kullanıcı")}</strong>,
      </p>
      <p class="gs-text" style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:#475569;">
        ${
          isApproved
            ? "Mavi Tik (Onaylı Hesap) başvurunuz inceleme ekibimiz tarafından onaylandı. Onay rozetiniz artık profilinizde, gönderilerinizde ve arama sonuçlarında gururla görünecek."
            : "Mavi Tik (Onaylı Hesap) başvurunuz değerlendirme ekibimiz tarafından incelendi ancak şu an için doğrulama kriterlerimizi tam olarak karşılamadığı tespit edildi."
        }
      </p>
      ${renderInfoCard(
        [
          { label: "Başvuru Durumu", value: isApproved ? "Onaylandı ✓" : "Onaylanamadı" },
          {
            label: "Sonraki Adım",
            value: isApproved
              ? "Rozetiniz profilinizde aktif edildi"
              : "Profilinizi güçlendirip tekrar başvurabilirsiniz",
          },
        ],
        isApproved ? "emerald" : "slate"
      )}
      ${renderCtaButton(isApproved ? "Profilimi Görüntüle" : "Başvuru Detaylarına Bak", "/settings", isApproved ? "emerald" : "brand")}
    `,
    footerNote: "Genç Sosyal topluluğunun bir parçası olduğunuz için teşekkür ederiz.",
  });
};

export const sendVerificationStatusEmail = async (
  to: string,
  displayName: string,
  status: "approved" | "rejected"
) => {
  const isApproved = status === "approved";
  const html = buildVerificationStatusHtml(displayName, status);
  const title = isApproved ? "Doğrulama Başvurunuz Onaylandı" : "Doğrulama Başvurunuz Sonuçlandı";
  const text = `Genç Sosyal\n\n${title}\n\nMerhaba ${displayName},\n${
    isApproved
      ? "Tebrikler! Mavi Tik başvurunuz onaylandı ve profilinizde aktif edildi."
      : "Mavi Tik başvurunuz şu an için onaylanamadı. İlerleyen dönemlerde yeniden başvurabilirsiniz."
  }`;

  await sendEmailSafely({
    to,
    subject: `Genç Sosyal — ${title}`,
    html,
    text,
    devLogLabel: "DOĞRULAMA DURUMU",
    devLogDetail: status,
  });
};

const buildSmtpTestHtml = (config: { host?: string; port?: number; secure?: boolean; from?: string }) =>
  baseTemplate({
    title: "Genç Sosyal SMTP Bağlantı Testi",
    preheader: "SMTP e-posta sunucunuz başarıyla doğrulandı ve yeni tasarım aktif.",
    eyebrow: "SMTP Testi",
    tone: "emerald",
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        SMTP bağlantınız kusursuz çalışıyor
      </h1>
      <p class="gs-text" style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#475569;">
        Bu e-postayı okuyorsanız, Genç Sosyal Admin Paneli üzerinden yapılandırılan SMTP sunucusu ve yeni nesil HTML bildirim şablonları başarıyla aktif edilmiştir.
      </p>
      ${renderInfoCard(
        [
          { label: "SMTP Sunucusu", value: config.host || "smtp.gencsosyal.com" },
          { label: "Port", value: String(config.port || 587) },
          { label: "SSL / TLS", value: config.secure ? "SSL (Aktif)" : "STARTTLS" },
          { label: "Gönderici", value: config.from || "Genç Sosyal" },
          { label: "Test Zamanı", value: new Date().toLocaleString("tr-TR") },
        ],
        "emerald"
      )}
      ${renderCtaButton("Admin Paneline Dön", "/admin", "emerald")}
    `,
    footerNote: "Bu mesaj Admin Paneli SMTP testi kapsamında gönderilmiştir.",
  });

export const sendSmtpTestEmail = async (to: string) => {
  const config = await getSmtpConfig();
  const html = buildSmtpTestHtml(config);
  const text = `Genç Sosyal SMTP Testi\n\nSMTP sunucu yapılandırmanız başarıyla test edildi.\nSunucu: ${config.host}:${config.port}`;

  await sendEmailSafely({
    to,
    subject: "Genç Sosyal — SMTP Bağlantı Testi Başarılı",
    html,
    text,
    devLogLabel: "SMTP TEST",
    throwOnUnconfigured: true,
    throwOnError: true,
  });
};

// ============================================================================
// 2. NEW NOTIFICATION & ENGAGEMENT EMAILS
// ============================================================================

const buildWelcomeEmailHtml = (displayName: string, username: string) =>
  baseTemplate({
    title: "Genç Sosyal'e Hoş Geldin!",
    preheader: `Merhaba ${displayName}, hesabın hazır! Profilini özelleştir, Genç Quiz'e katıl ve topluluğu keşfet.`,
    eyebrow: "Hoş Geldin",
    tone: "brand",
    showPreferencesLink: true,
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.22;">
        Genç Sosyal'e hoş geldin, ${escapeHtml(displayName || username)}!
      </h1>
      <p class="gs-text" style="margin:0 0 22px 0;font-size:15px;line-height:1.68;color:#475569;">
        <strong class="gs-strong" style="color:#0F172A;">@${escapeHtml(username)}</strong> hesabın başarıyla oluşturuldu. Fikirlerini paylaşabileceğin, projelerini sergileyebileceğin ve yeni arkadaşlarla bilgi yarışmalarında yarışabileceğin modern topluluğumuza katıldın.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 22px 0;">
        <tr>
          <td class="gs-soft-card" style="padding:16px 18px;background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:0 0 12px 0;border-bottom:1px solid #E2E8F0;">
                  <div class="gs-strong" style="font-size:14px;font-weight:700;color:#0F172A;">1. Profilini Kişiselleştir</div>
                  <div class="gs-muted" style="font-size:13px;color:#64748B;margin-top:2px;">Özel arka planlar, renk temaları ve kart stilleriyle tarzını yansıt.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
                  <div class="gs-strong" style="font-size:14px;font-weight:700;color:#0F172A;">2. Genç Quiz'de Yarış</div>
                  <div class="gs-muted" style="font-size:13px;color:#64748B;margin-top:2px;">Arkadaşlarınla canlı quiz odaları kur, liderlik tablosunda yüksel.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 0 0;">
                  <div class="gs-strong" style="font-size:14px;font-weight:700;color:#0F172A;">3. Keşfet ve Üret</div>
                  <div class="gs-muted" style="font-size:13px;color:#64748B;margin-top:2px;">Gönderi paylaş, projelerde iş birliği yap ve topluluklara katıl.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      ${renderCtaButton("Profilime Git ve Başla", `/profile/${encodeURIComponent(username)}`, "brand")}
    `,
    footerNote: "E-posta bildirimlerini dilediğin zaman Ayarlar > Bildirimler bölümünden yönetebilirsin.",
  });

export const sendWelcomeEmail = async (to: string, displayName: string, username: string) => {
  const html = buildWelcomeEmailHtml(displayName, username);
  const text = `Genç Sosyal'e Hoş Geldin ${displayName || username}!\n\n@${username} hesabın başarıyla oluşturuldu. Profilini özelleştirmek ve topluluğu keşfetmek için: ${getAppBaseUrl()}/profile/${encodeURIComponent(username)}`;

  await sendEmailSafely({
    to,
    subject: `Genç Sosyal'e Hoş Geldin, ${displayName || username}!`,
    html,
    text,
    devLogLabel: "HOŞ GELDİN",
    devLogDetail: `@${username}`,
  });
};

export type SocialNotificationEmailType =
  | "follow"
  | "follow_request"
  | "follow_accepted"
  | "like"
  | "reaction"
  | "comment"
  | "comment_reply"
  | "mention"
  | "repost"
  | "post_collaborator_invite"
  | "post_collaborator_accepted"
  | "post_collaborator_rejected"
  | "project_collaborator_invite"
  | "project_collaborator_accepted"
  | "project_collaborator_rejected"
  | "system";

export interface SocialNotificationEmailPayload {
  to: string;
  recipientName: string;
  type: SocialNotificationEmailType | string;
  actorName: string;
  actorUsername: string;
  snippet?: string;
  ctaPath?: string;
}

const getSocialNotificationMeta = (type: string, actorName: string, actorUsername: string) => {
  switch (type) {
    case "follow":
      return {
        eyebrow: "Yeni Takipçi",
        tone: "brand" as EmailTone,
        subject: `${actorName} (@${actorUsername}) seni takip etmeye başladı`,
        heading: "Yeni bir takipçin var!",
        actionSummary: "seni Genç Sosyal'de takip etmeye başladı.",
        ctaLabel: "Profilini İncele",
        defaultPath: `/profile/${encodeURIComponent(actorUsername)}`,
      };
    case "follow_request":
      return {
        eyebrow: "Takip İsteği",
        tone: "indigo" as EmailTone,
        subject: `${actorName} sana takip isteği gönderdi`,
        heading: "Yeni bir takip isteğin var",
        actionSummary: "gizli hesabını takip etmek için istek gönderdi.",
        ctaLabel: "İsteği Görüntüle",
        defaultPath: "/notifications",
      };
    case "follow_accepted":
      return {
        eyebrow: "İstek Onaylandı",
        tone: "emerald" as EmailTone,
        subject: `${actorName} takip isteğini kabul etti`,
        heading: "Takip isteğin kabul edildi",
        actionSummary: "takip isteğini onayladı. Artık paylaşımlarını görebilirsin.",
        ctaLabel: "Profiline Git",
        defaultPath: `/profile/${encodeURIComponent(actorUsername)}`,
      };
    case "like":
    case "reaction":
      return {
        eyebrow: "Yeni Etkileşim",
        tone: "rose" as EmailTone,
        subject: `${actorName} paylaşımını beğendi`,
        heading: "Paylaşımın ilgi görüyor!",
        actionSummary: "paylaşımına beğeni bıraktı.",
        ctaLabel: "Gönderiyi Gör",
        defaultPath: "/notifications",
      };
    case "comment":
      return {
        eyebrow: "Yeni Yorum",
        tone: "brand" as EmailTone,
        subject: `${actorName} gönderine yorum yaptı`,
        heading: "Gönderine yeni bir yorum var",
        actionSummary: "paylaşımına bir yorum bıraktı:",
        ctaLabel: "Yorumu Yanıtla",
        defaultPath: "/notifications",
      };
    case "comment_reply":
      return {
        eyebrow: "Yeni Yanıt",
        tone: "brand" as EmailTone,
        subject: `${actorName} yorumuna yanıt verdi`,
        heading: "Yorumuna yeni bir yanıt geldi",
        actionSummary: "yorumuna yanıt yazdı:",
        ctaLabel: "Sohbete Katıl",
        defaultPath: "/notifications",
      };
    case "mention":
      return {
        eyebrow: "Bahsedildin",
        tone: "indigo" as EmailTone,
        subject: `${actorName} bir paylaşımda senden bahsetti`,
        heading: "Bir paylaşımda senden bahsedildi",
        actionSummary: "seni bir gönderide veya yorumda etiketledi:",
        ctaLabel: "Paylaşımı Gör",
        defaultPath: "/notifications",
      };
    case "repost":
      return {
        eyebrow: "Yeniden Paylaşım",
        tone: "emerald" as EmailTone,
        subject: `${actorName} gönderini yeniden paylaştı`,
        heading: "Gönderin yeniden paylaşıldı!",
        actionSummary: "paylaşımını kendi takipçileriyle paylaştı.",
        ctaLabel: "Gönderiye Git",
        defaultPath: "/notifications",
      };
    case "post_collaborator_invite":
    case "project_collaborator_invite":
      return {
        eyebrow: "İş Birliği Daveti",
        tone: "indigo" as EmailTone,
        subject: `${actorName} seni ortak çalışmaya davet etti`,
        heading: "Ortak çalışma daveti aldın",
        actionSummary:
          type === "project_collaborator_invite"
            ? "seni bir projede ortak geliştirici olarak davet etti."
            : "seni bir gönderide ortak yazar olarak davet etti.",
        ctaLabel: "Daveti İncele",
        defaultPath: "/notifications",
      };
    case "post_collaborator_accepted":
    case "project_collaborator_accepted":
      return {
        eyebrow: "İş Birliği Onayı",
        tone: "emerald" as EmailTone,
        subject: `${actorName} iş birliği davetini kabul etti`,
        heading: "İş birliği davetin kabul edildi",
        actionSummary: "ortak çalışma davetini onayladı.",
        ctaLabel: "Detayları Gör",
        defaultPath: "/notifications",
      };
    default:
      return {
        eyebrow: "Yeni Bildirim",
        tone: "brand" as EmailTone,
        subject: "Genç Sosyal — Yeni bir bildirimin var",
        heading: "Yeni bir bildirimin var",
        actionSummary: "seninle yeni bir etkileşimde bulundu.",
        ctaLabel: "Bildirimleri Aç",
        defaultPath: "/notifications",
      };
  }
};

const buildSocialNotificationHtml = (payload: SocialNotificationEmailPayload) => {
  const meta = getSocialNotificationMeta(payload.type, payload.actorName, payload.actorUsername);
  const ctaHref = payload.ctaPath || meta.defaultPath;

  return baseTemplate({
    title: meta.heading,
    preheader: `${payload.actorName} ${meta.actionSummary}`,
    eyebrow: meta.eyebrow,
    tone: meta.tone,
    showPreferencesLink: true,
    content: `
      <h1 class="gs-h1" style="margin:0 0 10px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        ${escapeHtml(meta.heading)}
      </h1>
      <p class="gs-text" style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(payload.recipientName || "Kullanıcı")}</strong>, Genç Sosyal'de yeni bir etkileşim seni bekliyor.
      </p>
      ${renderActorPreviewCard({
        actorName: payload.actorName,
        actorUsername: payload.actorUsername,
        actionSummary: meta.actionSummary,
        snippet: payload.snippet,
        tone: meta.tone,
      })}
      ${renderCtaButton(meta.ctaLabel, ctaHref, meta.tone)}
    `,
    footerNote: "Bu tür bildirim e-postalarını almak istemiyorsan Bildirim Tercihleri sayfasından kapatabilirsin.",
  });
};

export const sendSocialNotificationEmail = async (payload: SocialNotificationEmailPayload) => {
  const meta = getSocialNotificationMeta(payload.type, payload.actorName, payload.actorUsername);
  const html = buildSocialNotificationHtml(payload);
  const ctaUrl = safeUrl(payload.ctaPath || meta.defaultPath);
  const text = `Genç Sosyal\n\nMerhaba ${payload.recipientName},\n${payload.actorName} (@${payload.actorUsername}) ${meta.actionSummary}${payload.snippet ? `\n\n"${truncateText(payload.snippet, 160)}"` : ""}\n\nGörüntülemek için: ${ctaUrl}`;

  await sendEmailSafely({
    to: payload.to,
    subject: `Genç Sosyal — ${meta.subject}`,
    html,
    text,
    devLogLabel: `BİLDİRİM (${payload.type})`,
    devLogDetail: `@${payload.actorUsername} -> ${payload.to}`,
  });
};

// Direct Message Notification Email
export interface NewMessageEmailParams {
  recipientId?: number;
  to: string;
  recipientName: string;
  senderName: string;
  senderUsername: string;
  messagePreview?: string | null;
  hasMedia?: boolean;
  conversationId: number;
}

const buildNewMessageEmailHtml = (params: NewMessageEmailParams) => {
  const snippet = params.messagePreview?.trim()
    ? params.messagePreview
    : params.hasMedia
      ? "Sana bir medya dosyası gönderdi."
      : "Sana yeni bir direkt mesaj gönderdi.";

  return baseTemplate({
    title: `${params.senderName} sana yeni bir mesaj gönderdi`,
    preheader: `${params.senderName}: ${truncateText(snippet, 90)}`,
    eyebrow: "Yeni Mesaj",
    tone: "brand",
    showPreferencesLink: true,
    content: `
      <h1 class="gs-h1" style="margin:0 0 10px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        Yeni bir direkt mesajın var
      </h1>
      <p class="gs-text" style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(params.recipientName || "Kullanıcı")}</strong>, gelen kutunda okunmamış yeni bir mesaj bulunuyor.
      </p>
      ${renderActorPreviewCard({
        actorName: params.senderName,
        actorUsername: params.senderUsername,
        actionSummary: "sana özel bir mesaj gönderdi:",
        snippet,
        tone: "brand",
      })}
      ${renderCtaButton("Mesajı Yanıtla", `/messages?conversation=${params.conversationId}`, "brand")}
    `,
    footerNote: "Direkt mesaj e-posta bildirimlerini Bildirim Tercihleri sayfasından düzenleyebilirsin.",
  });
};

export const sendNewMessageEmail = async (params: NewMessageEmailParams) => {
  // 2-minute anti-spam throttle per recipient + conversation
  if (params.recipientId) {
    const throttleKey = `dm:${params.recipientId}:${params.conversationId}`;
    if (shouldThrottleEmail(throttleKey, 2 * 60 * 1000)) {
      return;
    }
  }

  const html = buildNewMessageEmailHtml(params);
  const text = `Genç Sosyal — Yeni Mesaj\n\nMerhaba ${params.recipientName},\n${params.senderName} (@${params.senderUsername}) sana yeni bir mesaj gönderdi:\n"${truncateText(params.messagePreview || "Medya mesajı", 140)}"\n\nSohbeti aç: ${getAppBaseUrl()}/messages`;

  await sendEmailSafely({
    to: params.to,
    subject: `${params.senderName} sana yeni bir mesaj gönderdi — Genç Sosyal`,
    html,
    text,
    devLogLabel: "YENİ MESAJ",
    devLogDetail: `@${params.senderUsername} -> ${params.to}`,
  });
};

// Genç Quiz Room Invite Email
export interface QuizInviteEmailParams {
  to: string;
  recipientName: string;
  senderName: string;
  senderUsername: string;
  roomTitle: string;
  roomCode: string;
}

const buildQuizInviteEmailHtml = (params: QuizInviteEmailParams) =>
  baseTemplate({
    title: "Genç Quiz Odasına Davet Edildin!",
    preheader: `${params.senderName} seni "${params.roomTitle}" Genç Quiz odasına çağırıyor. Oda Kodu: ${params.roomCode}`,
    eyebrow: "Genç Quiz",
    tone: "indigo",
    showPreferencesLink: true,
    content: `
      <h1 class="gs-h1" style="margin:0 0 10px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        Genç Quiz meydan okumasına hazır mısın?
      </h1>
      <p class="gs-text" style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(params.recipientName || "Kullanıcı")}</strong>, <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(params.senderName)}</strong> (@${escapeHtml(params.senderUsername)}) seni canlı bilgi yarışmasına davet etti!
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
        <tr>
          <td align="center" style="padding:24px 20px;background-color:#312E81;background-image:linear-gradient(135deg, #0F2557 0%, #2563EB 50%, #6366F1 100%);border-radius:18px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#C7D2FE;margin-bottom:6px;">
              ODA ADI
            </div>
            <div style="font-size:19px;font-weight:800;color:#FFFFFF;margin-bottom:14px;line-height:1.3;">
              ${escapeHtml(params.roomTitle)}
            </div>
            <div style="display:inline-block;background-color:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);border-radius:12px;padding:10px 22px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:22px;font-weight:800;letter-spacing:5px;color:#FFFFFF;">
              ${escapeHtml(params.roomCode)}
            </div>
          </td>
        </tr>
      </table>

      ${renderCtaButton("Odaya Hemen Katıl", `/quiz/room/${encodeURIComponent(params.roomCode)}`, "indigo")}
    `,
    footerNote: "Oda başladığında geç kalmamak için bağlantıya hemen tıklayabilirsin.",
  });

export const sendQuizInviteEmail = async (params: QuizInviteEmailParams) => {
  const html = buildQuizInviteEmailHtml(params);
  const text = `Genç Sosyal — Genç Quiz Daveti\n\nMerhaba ${params.recipientName},\n${params.senderName} (@${params.senderUsername}) seni "${params.roomTitle}" Genç Quiz odasına davet etti!\nOda Kodu: ${params.roomCode}\n\nKatılmak için: ${getAppBaseUrl()}/quiz/room/${encodeURIComponent(params.roomCode)}`;

  await sendEmailSafely({
    to: params.to,
    subject: `${params.senderName} seni Genç Quiz'e davet etti! (${params.roomCode})`,
    html,
    text,
    devLogLabel: "QUIZ DAVETİ",
    devLogDetail: `Oda ${params.roomCode} -> ${params.to}`,
  });
};

// Account Moderation & Appeal Result Email
export interface AccountModerationEmailParams {
  to: string;
  displayName: string;
  action: "suspended" | "reactivated" | "appeal_approved" | "appeal_rejected";
  reason?: string | null;
  expiresAt?: Date | string | null;
  adminNote?: string | null;
}

const buildAccountModerationHtml = (params: AccountModerationEmailParams) => {
  const isPositive = params.action === "reactivated" || params.action === "appeal_approved";
  const tone: EmailTone = isPositive ? "emerald" : "rose";

  const copyMap = {
    suspended: {
      eyebrow: "Hesap Durumu",
      heading: "Hesabınız geçici veya kalıcı olarak askıya alındı",
      intro: "Topluluk kurallarımız kapsamında yapılan inceleme sonucunda hesabınıza erişim kısıtlaması uygulandı.",
      ctaLabel: "Durumu İncele ve İtiraz Et",
      ctaHref: "/account-suspended",
    },
    reactivated: {
      eyebrow: "Hesap Aktif",
      heading: "Hesabınız yeniden aktifleştirildi",
      intro: "Hesabınızdaki kısıtlama yönetici ekibimiz tarafından kaldırıldı. Genç Sosyal'i tekrar kullanmaya başlayabilirsiniz.",
      ctaLabel: "Genç Sosyal'e Giriş Yap",
      ctaHref: "/login",
    },
    appeal_approved: {
      eyebrow: "İtiraz Onaylandı",
      heading: "İtirazınız onaylandı ve hesabınız açıldı",
      intro: "Gönderdiğiniz itiraz ekibimiz tarafından detaylı şekilde incelendi, haklı bulundu ve hesabınız yeniden aktif edildi.",
      ctaLabel: "Hesabıma Dön",
      ctaHref: "/login",
    },
    appeal_rejected: {
      eyebrow: "İtiraz Sonucu",
      heading: "İtirazınız değerlendirildi",
      intro: "Gönderdiğiniz itiraz ekibimiz tarafından incelendi ancak mevcut kısıtlama kararının devam etmesine karar verildi.",
      ctaLabel: "Detayları Görüntüle",
      ctaHref: "/account-suspended",
    },
  }[params.action];

  const expiryText = params.expiresAt
    ? new Date(params.expiresAt).toLocaleString("tr-TR")
    : params.action === "suspended"
      ? "Kalıcı / İncelemeye Tabi"
      : "";

  const rows = [
    { label: "Hesap Durumu", value: isPositive ? "Aktif ✓" : "Kısıtlı / Askıda" },
    ...(params.reason ? [{ label: "Gerekçe", value: params.reason }] : []),
    ...(expiryText ? [{ label: "Kısıtlama Süresi", value: expiryText }] : []),
    ...(params.adminNote ? [{ label: "Ekip Notu", value: params.adminNote }] : []),
  ];

  return baseTemplate({
    title: copyMap.heading,
    preheader: copyMap.intro,
    eyebrow: copyMap.eyebrow,
    tone,
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        ${escapeHtml(copyMap.heading)}
      </h1>
      <p class="gs-text" style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(params.displayName || "Kullanıcı")}</strong>,
      </p>
      <p class="gs-text" style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:#475569;">
        ${escapeHtml(copyMap.intro)}
      </p>
      ${renderInfoCard(rows, tone)}
      ${renderCtaButton(copyMap.ctaLabel, copyMap.ctaHref, tone)}
    `,
    footerNote: "Hesap güvenliği ve topluluk standartları ile ilgili bilgilendirmeler zorunlu sistem bildirimidir.",
  });
};

export const sendAccountModerationEmail = async (params: AccountModerationEmailParams) => {
  const html = buildAccountModerationHtml(params);
  const subjectMap = {
    suspended: "Genç Sosyal — Hesap Durumu Bilgilendirmesi",
    reactivated: "Genç Sosyal — Hesabınız Yeniden Aktifleştirildi",
    appeal_approved: "Genç Sosyal — İtirazınız Onaylandı",
    appeal_rejected: "Genç Sosyal — İtiraz İnceleme Sonucu",
  };
  const text = `${subjectMap[params.action]}\n\nMerhaba ${params.displayName},${params.reason ? `\nGerekçe: ${params.reason}` : ""}${params.adminNote ? `\nNot: ${params.adminNote}` : ""}\n\nDetaylar için: ${getAppBaseUrl()}`;

  await sendEmailSafely({
    to: params.to,
    subject: subjectMap[params.action],
    html,
    text,
    devLogLabel: `HESAP DURUMU (${params.action})`,
  });
};

// Support Ticket Confirmation / Reply Email
export interface SupportTicketEmailParams {
  to: string;
  displayName: string;
  ticketId: number;
  subject: string;
  category?: string;
  mode: "created" | "replied" | "resolved";
  messagePreview?: string;
}

const buildSupportTicketEmailHtml = (params: SupportTicketEmailParams) => {
  const isResolved = params.mode === "resolved";
  const tone: EmailTone = isResolved ? "emerald" : "brand";
  const heading =
    params.mode === "created"
      ? "Destek talebiniz bize ulaştı"
      : params.mode === "replied"
        ? "Destek talebinize yeni yanıt geldi"
        : "Destek talebiniz çözümlendi";

  const intro =
    params.mode === "created"
      ? "Destek ekibimiz talebinizi kayda aldı. En kısa sürede inceleyip size geri dönüş yapacağız."
      : params.mode === "replied"
        ? "Genç Sosyal destek ekibi talebinize yeni bir yanıt ekledi."
        : "Destek talebiniz başarıyla sonuçlandırıldı ve kapatıldı.";

  return baseTemplate({
    title: heading,
    preheader: `Talep #${params.ticketId} — ${params.subject}`,
    eyebrow: `Destek #${params.ticketId}`,
    tone,
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        ${escapeHtml(heading)}
      </h1>
      <p class="gs-text" style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(params.displayName || "Kullanıcı")}</strong>,
      </p>
      <p class="gs-text" style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:#475569;">
        ${escapeHtml(intro)}
      </p>
      ${renderInfoCard(
        [
          { label: "Talep Numarası", value: `#${params.ticketId}` },
          { label: "Konu", value: params.subject },
          ...(params.category ? [{ label: "Kategori", value: params.category }] : []),
          {
            label: "Durum",
            value: params.mode === "created" ? "İnceleniyor" : params.mode === "replied" ? "Yanıtlandı" : "Çözümlendi ✓",
          },
        ],
        tone
      )}
      ${
        params.messagePreview
          ? `<div class="gs-quote" style="margin:18px 0;padding:14px 16px;background-color:#F8FAFC;border-left:3px solid ${TONE_PALETTES[tone].accent};border-radius:0 12px 12px 0;font-size:14px;line-height:1.6;color:#1E293B;">${escapeHtml(truncateText(params.messagePreview, 240))}</div>`
          : ""
      }
      ${renderCtaButton("Destek Talebini Görüntüle", "/support", tone)}
    `,
    footerNote: "Ek bilgi eklemek isterseniz Destek Merkezi üzerinden talebinize yanıt verebilirsiniz.",
  });
};

export const sendSupportTicketEmail = async (params: SupportTicketEmailParams) => {
  const html = buildSupportTicketEmailHtml(params);
  const text = `Genç Sosyal Destek (#${params.ticketId})\n\nMerhaba ${params.displayName},\nKonu: ${params.subject}\n${params.messagePreview ? `\nMesaj: ${truncateText(params.messagePreview, 180)}` : ""}\n\nTakip için: ${getAppBaseUrl()}/support`;

  await sendEmailSafely({
    to: params.to,
    subject: `Genç Sosyal Destek #${params.ticketId} — ${params.subject}`,
    html,
    text,
    devLogLabel: `DESTEK (${params.mode})`,
    devLogDetail: `#${params.ticketId}`,
  });
};

// Platform Broadcast / Newsletter Announcement Email
export interface PlatformAnnouncementEmailParams {
  to: string;
  displayName: string;
  title: string;
  message: string;
}

const buildPlatformAnnouncementHtml = (params: PlatformAnnouncementEmailParams) =>
  baseTemplate({
    title: params.title || "Genç Sosyal Duyurusu",
    preheader: truncateText(params.message, 110),
    eyebrow: "Topluluk Duyurusu",
    tone: "brand",
    showPreferencesLink: true,
    content: `
      <h1 class="gs-h1" style="margin:0 0 12px 0;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0F172A;line-height:1.25;">
        ${escapeHtml(params.title || "Genç Sosyal'den Yeni Duyuru")}
      </h1>
      <p class="gs-text" style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#475569;">
        Merhaba <strong class="gs-strong" style="color:#0F172A;">${escapeHtml(params.displayName || "Kullanıcı")}</strong>,
      </p>
      <div class="gs-soft-card" style="padding:20px 22px;background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:18px;font-size:15px;line-height:1.7;color:#1E293B;white-space:pre-line;">
        ${escapeHtml(params.message)}
      </div>
      ${renderCtaButton("Genç Sosyal'de Keşfet", "/", "brand")}
    `,
    footerNote: "Topluluk duyuruları ve bülten e-postalarını Bildirim Tercihleri sayfasından dilediğin zaman kapatabilirsin.",
  });

export const sendPlatformAnnouncementEmail = async (params: PlatformAnnouncementEmailParams) => {
  const html = buildPlatformAnnouncementHtml(params);
  const text = `${params.title || "Genç Sosyal Duyurusu"}\n\nMerhaba ${params.displayName},\n\n${params.message}\n\n${getAppBaseUrl()}`;

  await sendEmailSafely({
    to: params.to,
    subject: `Genç Sosyal — ${params.title || "Yeni Topluluk Duyurusu"}`,
    html,
    text,
    devLogLabel: "PLATFORM DUYURUSU",
  });
};

// ============================================================================
// 3. PREFERENCE-AWARE RECIPIENT HELPER
// ============================================================================

export type PreferenceCategory =
  | "likes"
  | "comments"
  | "mentions"
  | "follows"
  | "messages"
  | "newsletters"
  | "general";

export const getEmailRecipientIfAllowed = async (
  recipientId: number,
  category: PreferenceCategory
): Promise<{ email: string; displayName: string; username: string } | null> => {
  try {
    const [recipient] = await db
      .select({
        email: users.email,
        username: users.username,
        isActive: users.isActive,
        displayName: profiles.displayName,
        emailEnabled: notificationPreferences.emailEnabled,
        likes: notificationPreferences.likes,
        comments: notificationPreferences.comments,
        mentions: notificationPreferences.mentions,
        follows: notificationPreferences.follows,
        messages: notificationPreferences.messages,
        newsletters: notificationPreferences.newsletters,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(notificationPreferences, eq(users.id, notificationPreferences.userId))
      .where(eq(users.id, recipientId))
      .limit(1);

    if (!recipient || !recipient.email || !recipient.isActive) {
      return null;
    }

    // Default values mirror SettingsNotifications & notifications.ts
    const emailEnabled = recipient.emailEnabled ?? true;
    if (!emailEnabled) return null;

    if (category === "likes" && !(recipient.likes ?? true)) return null;
    if (category === "comments" && !(recipient.comments ?? true)) return null;
    if (category === "mentions" && !(recipient.mentions ?? true)) return null;
    if (category === "follows" && !(recipient.follows ?? true)) return null;
    if (category === "messages" && !(recipient.messages ?? true)) return null;
    if (category === "newsletters" && !(recipient.newsletters ?? false)) return null;

    return {
      email: recipient.email,
      displayName: recipient.displayName || recipient.username,
      username: recipient.username,
    };
  } catch (err) {
    console.warn("[Mailer] Kullanıcı bildirim tercihi okunamadı:", err);
    return null;
  }
};

export const checkSocialEmailThrottle = (recipientId: number, categoryKey: string, cooldownMs = 120_000): boolean => {
  return shouldThrottleEmail(`social:${recipientId}:${categoryKey}`, cooldownMs);
};

// ============================================================================
// 4. ADMIN TEMPLATE GALLERY & LIVE PREVIEW CATALOG
// ============================================================================

export interface EmailTemplateDescriptor {
  id: string;
  name: string;
  category: "Güvenlik & Hesap" | "Sosyal Bildirimler" | "Topluluk & Quiz";
  description: string;
  subject: string;
  isNew?: boolean;
}

export const EMAIL_TEMPLATE_CATALOG: EmailTemplateDescriptor[] = [
  {
    id: "welcome",
    name: "Hoş Geldin E-postası",
    category: "Güvenlik & Hesap",
    description: "Yeni kayıt olan üyelere gönderilen ilk karşılama ve başlangıç rehberi.",
    subject: "Genç Sosyal'e Hoş Geldin, Zeynep!",
    isNew: true,
  },
  {
    id: "otp",
    name: "6 Haneli OTP Doğrulama",
    category: "Güvenlik & Hesap",
    description: "Kayıt ve e-posta onayında gönderilen tek kullanımlık doğrulama kodu.",
    subject: "482916 — Genç Sosyal Doğrulama Kodunuz",
  },
  {
    id: "password_reset",
    name: "Şifre Sıfırlama",
    category: "Güvenlik & Hesap",
    description: "15 dakika geçerli güvenli şifre yenileme bağlantısı.",
    subject: "Genç Sosyal — Şifre Sıfırlama Talebi",
  },
  {
    id: "security_alert",
    name: "Güvenlik & Yeni Giriş Uyarısı",
    category: "Güvenlik & Hesap",
    description: "Yeni cihaz, IP adresi veya şifre değişikliklerinde giden güvenlik bildirimi.",
    subject: "Genç Sosyal — Güvenlik Bildirimi",
  },
  {
    id: "verification_approved",
    name: "Mavi Tik Onay Bildirimi",
    category: "Güvenlik & Hesap",
    description: "Onaylı hesap başvurusu kabul edildiğinde gönderilen tebrik maili.",
    subject: "Genç Sosyal — Doğrulama Başvurunuz Onaylandı",
  },
  {
    id: "social_follow",
    name: "Yeni Takipçi Bildirimi",
    category: "Sosyal Bildirimler",
    description: "Biri kullanıcıyı takip ettiğinde veya takip isteği gönderdiğinde gider.",
    subject: "Genç Sosyal — Kerem Kaya (@keremkaya) seni takip etmeye başladı",
    isNew: true,
  },
  {
    id: "social_comment",
    name: "Yeni Yorum & Bahsedilme",
    category: "Sosyal Bildirimler",
    description: "Gönderiye yorum yapıldığında, yanıt verildiğinde veya @etiketleme olduğunda gider.",
    subject: "Genç Sosyal — Elif Demir gönderine yorum yaptı",
    isNew: true,
  },
  {
    id: "social_like",
    name: "Beğeni & Yeniden Paylaşım",
    category: "Sosyal Bildirimler",
    description: "Gönderiler beğeni veya repost aldığında (anti-spam korumalı) gönderilir.",
    subject: "Genç Sosyal — Arda Yılmaz paylaşımını beğendi",
    isNew: true,
  },
  {
    id: "new_message",
    name: "Yeni Direkt Mesaj",
    category: "Sosyal Bildirimler",
    description: "Özel mesaj geldiğinde önizleme kartıyla birlikte gönderilir.",
    subject: "Selin Aksoy sana yeni bir mesaj gönderdi — Genç Sosyal",
    isNew: true,
  },
  {
    id: "quiz_invite",
    name: "Genç Quiz Oda Daveti",
    category: "Topluluk & Quiz",
    description: "Bir arkadaş canlı Genç Quiz odasına davet ettiğinde oda koduyla birlikte gider.",
    subject: "Mert Öztürk seni Genç Quiz'e davet etti! (QZ84K2)",
    isNew: true,
  },
  {
    id: "support_ticket",
    name: "Destek Talebi Bildirimi",
    category: "Topluluk & Quiz",
    description: "Destek talebi oluşturulduğunda veya yanıtlandığında gönderilen takip maili.",
    subject: "Genç Sosyal Destek #1042 — Profil tema ayarları hakkında",
    isNew: true,
  },
  {
    id: "account_moderation",
    name: "Hesap Durumu / İtiraz Sonucu",
    category: "Güvenlik & Hesap",
    description: "Askıya alma, aktif etme ve itiraz sonuçları için resmi bilgilendirme.",
    subject: "Genç Sosyal — İtirazınız Onaylandı",
    isNew: true,
  },
  {
    id: "announcement",
    name: "Topluluk Duyuru Bülteni",
    category: "Topluluk & Quiz",
    description: "Admin panelinden bülten izni olan üyelere gönderilen platform duyurusu.",
    subject: "Genç Sosyal — Yeni Genç Quiz Sezonu Başladı!",
    isNew: true,
  },
  {
    id: "smtp_test",
    name: "SMTP Bağlantı Testi",
    category: "Güvenlik & Hesap",
    description: "Admin panelinden SMTP yapılandırmasını doğrulamak için kullanılan test şablonu.",
    subject: "Genç Sosyal — SMTP Bağlantı Testi Başarılı",
  },
];

export const renderEmailTemplatePreview = async (
  templateId: string
): Promise<{ descriptor: EmailTemplateDescriptor; html: string; text: string }> => {
  const descriptor =
    EMAIL_TEMPLATE_CATALOG.find((t) => t.id === templateId) || EMAIL_TEMPLATE_CATALOG[0];
  const appUrl = getAppBaseUrl();

  switch (descriptor.id) {
    case "welcome":
      return {
        descriptor,
        html: buildWelcomeEmailHtml("Zeynep Aydın", "zeynep"),
        text: "Genç Sosyal'e Hoş Geldin Zeynep!",
      };
    case "otp":
      return {
        descriptor,
        html: buildOtpEmailHtml("Zeynep Aydın", "482916"),
        text: "Genç Sosyal Doğrulama Kodunuz: 482916",
      };
    case "password_reset":
      return {
        descriptor,
        html: buildPasswordResetHtml("Zeynep Aydın", `${appUrl}/reset-password?token=ornek-guvenli-token`),
        text: "Genç Sosyal şifre sıfırlama bağlantınız.",
      };
    case "security_alert":
      return {
        descriptor,
        html: buildSecurityAlertHtml(
          "Zeynep Aydın",
          "Yeni Cihazdan Giriş Yapıldı",
          new Date().toLocaleString("tr-TR"),
          "MacBook Pro",
          "macOS 15",
          "Chrome 134",
          "88.241.12.45"
        ),
        text: "Genç Sosyal Güvenlik Bildirimi",
      };
    case "verification_approved":
      return {
        descriptor,
        html: buildVerificationStatusHtml("Zeynep Aydın", "approved"),
        text: "Tebrikler, Mavi Tik başvurunuz onaylandı!",
      };
    case "social_follow":
      return {
        descriptor,
        html: buildSocialNotificationHtml({
          to: "ornek@gencsosyal.com",
          recipientName: "Zeynep",
          type: "follow",
          actorName: "Kerem Kaya",
          actorUsername: "keremkaya",
          snippet: "Tasarım ve yazılım projelerini ilgiyle takip ediyorum!",
        }),
        text: "Kerem Kaya seni takip etmeye başladı.",
      };
    case "social_comment":
      return {
        descriptor,
        html: buildSocialNotificationHtml({
          to: "ornek@gencsosyal.com",
          recipientName: "Zeynep",
          type: "comment",
          actorName: "Elif Demir",
          actorUsername: "elifdemir",
          snippet: "Yeni profil tasarımın harika olmuş! Özellikle arka plan ve renk geçişi çok şık duruyor.",
          ctaPath: "/notifications",
        }),
        text: "Elif Demir gönderine yorum yaptı.",
      };
    case "social_like":
      return {
        descriptor,
        html: buildSocialNotificationHtml({
          to: "ornek@gencsosyal.com",
          recipientName: "Zeynep",
          type: "like",
          actorName: "Arda Yılmaz",
          actorUsername: "ardayilmaz",
          snippet: "Bugün Genç Quiz'de 10/10 seri yaptım, yeni tasarım müthiş akıcı!",
          ctaPath: "/notifications",
        }),
        text: "Arda Yılmaz paylaşımını beğendi.",
      };
    case "new_message":
      return {
        descriptor,
        html: buildNewMessageEmailHtml({
          to: "ornek@gencsosyal.com",
          recipientName: "Zeynep",
          senderName: "Selin Aksoy",
          senderUsername: "selinaksoy",
          messagePreview: "Selam! Bu akşamki Genç Quiz turnuvası için aynı odada buluşalım mı?",
          conversationId: 12,
        }),
        text: "Selin Aksoy sana yeni bir mesaj gönderdi.",
      };
    case "quiz_invite":
      return {
        descriptor,
        html: buildQuizInviteEmailHtml({
          to: "ornek@gencsosyal.com",
          recipientName: "Zeynep",
          senderName: "Mert Öztürk",
          senderUsername: "mertozturk",
          roomTitle: "Teknoloji & Genel Kültür Maratonu",
          roomCode: "QZ84K2",
        }),
        text: "Mert Öztürk seni Genç Quiz odasına davet etti (QZ84K2).",
      };
    case "support_ticket":
      return {
        descriptor,
        html: buildSupportTicketEmailHtml({
          to: "ornek@gencsosyal.com",
          displayName: "Zeynep Aydın",
          ticketId: 1042,
          subject: "Profil tema ayarları hakkında",
          category: "Hesap & Profil",
          mode: "replied",
          messagePreview:
            "Merhaba Zeynep, profil kişiselleştirme merkezinden arka plan ve vurgu rengini kaydedip anında tüm ziyaretçilerle paylaşabilirsin.",
        }),
        text: "Destek talebiniz #1042 yanıtlandı.",
      };
    case "account_moderation":
      return {
        descriptor,
        html: buildAccountModerationHtml({
          to: "ornek@gencsosyal.com",
          displayName: "Zeynep Aydın",
          action: "appeal_approved",
          adminNote: "İtirazınız incelendi ve hesabınızdaki tüm kısıtlamalar kaldırıldı.",
        }),
        text: "İtirazınız onaylandı ve hesabınız aktif edildi.",
      };
    case "announcement":
      return {
        descriptor,
        html: buildPlatformAnnouncementHtml({
          to: "ornek@gencsosyal.com",
          displayName: "Zeynep",
          title: "Yeni Genç Quiz Sezonu ve Profil Temaları Yayında!",
          message:
            "Merhaba Genç Sosyal ailesi!\n\nYepyeni Profil Kişiselleştirme Merkezi ve baştan tasarlanan Genç Quiz deneyimi artık yayında. Profilini dilediğin gibi tasarla, arkadaşlarınla canlı bilgi yarışmalarına katıl ve haftalık liderlik tablosunda yerini al!",
        }),
        text: "Yeni Genç Quiz Sezonu Yayında!",
      };
    case "smtp_test":
    default: {
      const config = await getSmtpConfig();
      return {
        descriptor,
        html: buildSmtpTestHtml(config),
        text: "Genç Sosyal SMTP Testi başarılı.",
      };
    }
  }
};

export const sendPreviewTemplateTestEmail = async (to: string, templateId?: string) => {
  if (!templateId || templateId === "smtp_test") {
    return sendSmtpTestEmail(to);
  }
  const { descriptor, html, text } = await renderEmailTemplatePreview(templateId);
  await sendEmailSafely({
    to,
    subject: `[Önizleme] ${descriptor.subject}`,
    html,
    text,
    devLogLabel: `ŞABLON TEST (${descriptor.id})`,
    throwOnUnconfigured: true,
    throwOnError: true,
  });
};
