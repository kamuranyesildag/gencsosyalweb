import nodemailer from "nodemailer";
import { db } from "../../src/db/index.js";
import { systemSettings } from "../../src/db/schema.js";
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
    if (s.key && s.key.startsWith('smtp_')) {
      config[s.key] = s.value;
    }
  }
  
  let pass = config['smtp_pass'] || process.env.SMTP_PASS;
  if (config['smtp_pass']) {
    try {
      pass = decryptString(config['smtp_pass']);
    } catch (e) {
      console.warn("SMTP şifresi çözülemedi, fallback kullanılacak.");
    }
  }

  const host = config['smtp_host'] || process.env.SMTP_HOST;
  const user = config['smtp_user'] || process.env.SMTP_USER;
  const isConfigured = Boolean(host && user && pass);

  return {
    isConfigured,
    host: host || "smtp.ethereal.email",
    port: parseInt(config['smtp_port'] || process.env.SMTP_PORT || "587"),
    secure: (config['smtp_secure'] || process.env.SMTP_SECURE) === "true",
    user,
    pass,
    from: config['smtp_from'] || process.env.SMTP_FROM || '"Genç Sosyal" <noreply@gencsosyal.com>',
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
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });
};

const escapeHtml = (unsafe: string) => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// --- MODERN EMAIL TEMPLATES ---

const baseTemplate = (title: string, preheader: string, content: string) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background-color: #000000; padding: 24px; text-align: center; }
    .header-logo { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: -0.5px; }
    .content { padding: 32px; }
    .title { font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #111827; }
    .text { margin-top: 0; margin-bottom: 24px; font-size: 16px; color: #4b5563; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #000000; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { font-size: 13px; color: #6b7280; margin: 0; }
    .info-box { background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .info-row { margin-bottom: 8px; font-size: 14px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-weight: 600; color: #374151; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #111827; color: #e5e7eb; }
      .container { background-color: #1f2937; border: 1px solid #374151; }
      .header { background-color: #000000; }
      .title { color: #f9fafb; }
      .text { color: #d1d5db; }
      .btn { background-color: #ffffff; color: #000000 !important; }
      .footer { background-color: #111827; border-top-color: #374151; }
      .footer-text { color: #9ca3af; }
      .info-box { background-color: #374151; }
      .info-label { color: #e5e7eb; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${escapeHtml(preheader)}</div>
  <div class="container">
    <div class="header">
      <h1 class="header-logo">Genç Sosyal</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Genç Sosyal. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendOtpVerificationEmail = async (to: string, displayName: string, otpCode: string): Promise<{ sent: boolean }> => {
  const config = await getSmtpConfig();

  // If SMTP is not fully configured, log the OTP clearly to server console for admin
  if (!config.isConfigured) {
    console.log(`\n=======================================================\n📧 [GENÇ SOSYAL] E-POSTA DOĞRULAMA KODU\nAlıcı: ${to} (${displayName || 'Kullanıcı'})\n🔑 Doğrulama Kodu: ${otpCode}\nℹ️ SMTP sunucusu henüz yapılandırılmadığı için test kodu terminale yazdırıldı.\n=======================================================\n`);
    return { sent: false };
  }

  try {
    const transporter = await getTransporter();
    const html = baseTemplate(
      "E-posta Doğrulama Kodunuz",
      `Genç Sosyal kayıt doğrulama kodunuz: ${otpCode}`,
      `
        <h2 class="title">E-posta Doğrulama Kodunuz</h2>
        <p class="text">Merhaba ${escapeHtml(displayName || 'Kullanıcı')},</p>
        <p class="text">Genç Sosyal hesabınızı oluşturmak ve e-posta adresinizi doğrulamak için aşağıdaki 6 haneli tek kullanımlık güvenlik kodunu kullanın:</p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; font-family: monospace, Consolas, sans-serif; border: 1px solid #334155; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);">
            ${escapeHtml(otpCode)}
          </div>
        </div>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Geçerlilik Süresi:</span> 10 Dakika</div>
          <div class="info-row"><span class="info-label">Güvenlik Uyarısı:</span> Bu kodu hiç kimseyle paylaşmayın. Genç Sosyal ekibi sizden asla doğrulama kodunuzu istemez.</div>
        </div>
        <p class="text" style="font-size: 13px; color: #64748b; margin-top: 20px;">Bu işlemi siz başlatmadıysanız veya hesap açmadıysanız, bu e-postayı dikkate almayabilirsiniz.</p>
      `
    );

    const text = `Genç Sosyal\n\nE-posta Doğrulama Kodunuz: ${otpCode}\n\nBu kod 10 dakika boyunca geçerlidir.\nGüvenliğiniz için bu kodu kimseyle paylaşmayın.`;

    await transporter.sendMail({
      from: config.from,
      to,
      subject: "Genç Sosyal - E-posta Doğrulama Kodunuz",
      html,
      text,
    });
    console.log(`[SMTP] Doğrulama kodu e-postası başarıyla gönderildi: ${to}`);
    return { sent: true };
  } catch (err: any) {
    console.warn(`[SMTP] E-posta gönderilemedi (${err?.message}). Kod terminale yazdırıldı.`);
    console.log(`\n=======================================================\n📧 [FALLBACK OTP KODU] Alıcı: ${to}\n🔑 KOD: ${otpCode}\n=======================================================\n`);
    return { sent: false };
  }
};

export const sendVerificationEmail = async (to: string, displayName: string, verifyLink: string) => {
  const config = await getSmtpConfig();
  if (!config.isConfigured) {
    console.log(`\n📧 [DOĞRULAMA BAĞLANTISI] Alıcı: ${to} -> ${verifyLink}\n`);
    return;
  }

  try {
    const transporter = await getTransporter();
    const html = baseTemplate(
      "E-posta Adresinizi Doğrulayın",
      "Genç Sosyal'e hoş geldiniz! Lütfen hesabınızı doğrulamak için e-postanızı onaylayın.",
      `
        <h2 class="title">E-posta Adresinizi Doğrulayın</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">Genç Sosyal'e katıldığınız için teşekkür ederiz. Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.</p>
        <div class="btn-container">
          <a href="${verifyLink}" class="btn">E-postamı Doğrula</a>
        </div>
        <p class="text" style="font-size: 14px;">Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı dikkate almayabilirsiniz.</p>
      `
    );

    const text = `Genç Sosyal\n\nMüşteri e-postanızı doğrulamak için aşağıdaki bağlantıya tıklayın:\n${verifyLink}\n\nBu isteği siz başlatmadıysanız bu e-postayı dikkate almayabilirsiniz.`;

    await transporter.sendMail({
      from: config.from,
      to,
      subject: "Genç Sosyal - E-posta Doğrulama",
      html,
      text,
    });
  } catch (err: any) {
    console.warn(`[SMTP] Doğrulama linki e-postası gönderilemedi (${err?.message}). Link: ${verifyLink}`);
  }
};

export const sendPasswordResetEmail = async (to: string, displayName: string, resetLink: string) => {
  const config = await getSmtpConfig();
  if (!config.isConfigured) {
    console.log(`\n🔑 [ŞİFRE SIFIRLAMA BAĞLANTISI] Alıcı: ${to} -> ${resetLink}\n`);
    return;
  }

  try {
    const transporter = await getTransporter();
    const html = baseTemplate(
      "Şifrenizi Sıfırlayın",
      "Şifrenizi sıfırlamak için gerekli bağlantı bu e-postada yer almaktadır.",
      `
        <h2 class="title">Şifrenizi Sıfırlayın</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>
        <div class="btn-container">
          <a href="${resetLink}" class="btn">Şifremi Sıfırla</a>
        </div>
        <p class="text" style="font-size: 14px;">Bu bağlantı 15 dakika boyunca geçerlidir. Eğer bu talebi siz yapmadıysanız, hesabınız güvendedir ve bu e-postayı dikkate almayabilirsiniz.</p>
      `
    );

    const text = `Genç Sosyal\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n${resetLink}\n\nBu bağlantı 15 dakika geçerlidir. Bu isteği siz başlatmadıysanız bu e-postayı dikkate almayabilirsiniz.`;

    await transporter.sendMail({
      from: config.from,
      to,
      subject: "Genç Sosyal - Şifre Sıfırlama Talebi",
      html,
      text,
    });
  } catch (err: any) {
    console.warn(`[SMTP] Şifre sıfırlama e-postası gönderilemedi (${err?.message}). Link: ${resetLink}`);
  }
};

export const sendSecurityAlertEmail = async (to: string, displayName: string, action: string, date: string, device?: string, os?: string, browser?: string, ipAddress?: string) => {
  const config = await getSmtpConfig();
  if (!config.isConfigured) {
    console.log(`\n⚠️ [GÜVENLİK BİLDİRİMİ] Alıcı: ${to} -> İşlem: ${action}, Tarih: ${date}\n`);
    return;
  }

  try {
    const transporter = await getTransporter();
    let detailsHtml = '';
    if (device || os || browser || ipAddress) {
      detailsHtml = `
        <div class="info-box">
          ${device || os || browser ? `<div class="info-row"><span class="info-label">Cihaz/Tarayıcı:</span> ${escapeHtml(browser || '')} ${escapeHtml(os ? '· ' + os : '')} ${escapeHtml(device ? '(' + device + ')' : '')}</div>` : ''}
          ${ipAddress ? `<div class="info-row"><span class="info-label">IP Adresi:</span> ${escapeHtml(ipAddress)}</div>` : ''}
          <div class="info-row"><span class="info-label">Zaman:</span> ${escapeHtml(date)}</div>
        </div>
      `;
    } else {
      detailsHtml = `
        <div class="info-box">
          <div class="info-row"><span class="info-label">İşlem:</span> ${escapeHtml(action)}</div>
          <div class="info-row"><span class="info-label">Tarih:</span> ${escapeHtml(date)}</div>
        </div>
      `;
    }
    
    const html = baseTemplate(
      "Güvenlik Uyarısı: Yeni Giriş Algılandı",
      "Hesabınıza yeni bir giriş veya şüpheli işlem tespit edildi.",
      `
        <h2 class="title">Yeni Bir Giriş Algılandı</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">Hesabınızla ilgili yeni bir güvenlik olayı tespit ettik. Aşağıdaki detayları kontrol edin:</p>
        ${detailsHtml}
        <p class="text" style="font-size: 14px;">Eğer bu işlemi siz yaptıysanız, bu e-postayı görmezden gelebilirsiniz. Ancak siz yapmadıysanız, lütfen derhal şifrenizi değiştirin ve diğer tüm oturumları kapatın.</p>
      `
    );

    const text = `Genç Sosyal - Güvenlik Bildirimi\n\nYeni işlem algılandı:\n${action}\nTarih: ${date}\n\nEğer bu işlemi siz yapmadıysanız lütfen şifrenizi değiştirin.`;

    await transporter.sendMail({
      from: config.from,
      to,
      subject: "Genç Sosyal - Güvenlik Uyarısı",
      html,
      text,
    });
  } catch (err: any) {
    console.warn(`[SMTP] Güvenlik uyarısı e-postası gönderilemedi (${err?.message})`);
  }
};

export const sendVerificationStatusEmail = async (to: string, displayName: string, status: "approved" | "rejected") => {
  const config = await getSmtpConfig();
  if (!config.isConfigured) {
    console.log(`\n🏷️ [DOĞRULAMA DURUMU] Alıcı: ${to} -> ${status}\n`);
    return;
  }

  try {
    const transporter = await getTransporter();
    const title = status === "approved" ? "Doğrulama Başvurunuz Onaylandı" : "Doğrulama Başvurunuz Reddedildi";
    const bodyText = status === "approved" 
      ? "Tebrikler! Mavi Tik (Onaylı Hesap) başvurunuz incelendi ve onaylandı. Artık profilinizde onay rozeti görünecektir."
      : "Üzgünüz, Mavi Tik (Onaylı Hesap) başvurunuz kriterlerimizi karşılamadığı için şu anda onaylanamadı. İlerleyen zamanlarda tekrar başvuru yapabilirsiniz.";
    
    const html = baseTemplate(
      title,
      status === "approved" ? "Tebrikler, hesabınız onaylandı." : "Başvuru sonucunuz belli oldu.",
      `
        <h2 class="title">${title}</h2>
        <p class="text">Merhaba ${escapeHtml(displayName)},</p>
        <p class="text">${bodyText}</p>
        <p class="text" style="font-size: 14px; margin-top: 30px;">Genç Sosyal topluluğunun bir parçası olduğunuz için teşekkür ederiz.</p>
      `
    );

    const text = `Genç Sosyal\n\n${title}\n\nMerhaba ${displayName},\n${bodyText}`;

    await transporter.sendMail({
      from: config.from,
      to,
      subject: `Genç Sosyal - ${title}`,
      html,
      text,
    });
  } catch (err: any) {
    console.warn(`[SMTP] Doğrulama durum bildirimi gönderilemedi (${err?.message})`);
  }
};

export const sendSmtpTestEmail = async (to: string) => {
  const config = await getSmtpConfig();
  if (!config.isConfigured) {
    throw new Error("SMTP ayarları henüz yapılandırılmamış. Lütfen Sunucu (Host), Kullanıcı ve Parola alanlarını doldurun.");
  }
  const transporter = await getTransporter();
  
  const html = baseTemplate(
    "Genç Sosyal SMTP Testi",
    "SMTP yapılandırması başarıyla test edildi.",
    `
      <h2 class="title">Genç Sosyal SMTP Testi</h2>
      <p class="text">Merhaba,</p>
      <p class="text">Eğer bu e-postayı görüyorsanız, Admin Panel üzerinden yapılan SMTP e-posta gönderim yapılandırması başarıyla çalışıyor demektir.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Sunucu:</span> ${escapeHtml(config.host || "")}</div>
        <div class="info-row"><span class="info-label">Port:</span> ${config.port}</div>
        <div class="info-row"><span class="info-label">Güvenlik (SSL/TLS):</span> ${config.secure ? "Evet" : "Hayır"}</div>
      </div>
      <p class="text" style="font-size: 14px;">Bu otomatik bir test mesajıdır.</p>
    `
  );

  const text = `Genç Sosyal SMTP Testi\n\nE-posta sunucu yapılandırması başarıyla tamamlandı.`;

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Genç Sosyal - SMTP Test E-postası",
    html,
    text,
  });
};
