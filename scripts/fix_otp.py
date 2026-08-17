import re

with open("server/routes/auth.ts", "r") as f:
    content = f.read()

target = """    sendOtpVerificationEmail(email, displayName || 'Kullanıcı', otpCode).catch((err) => {
      console.error("Failed to resend OTP email:", err);
    });

    res.json({
      success: true,
      data: {
        message: "Yeni doğrulama kodu e-posta adresinize gönderildi.",
        cooldownSeconds: 60,
        expiresInSeconds: 600
      }
    });"""

replacement = """    try {
      await sendOtpVerificationEmail(email, displayName || 'Kullanıcı', otpCode);
    } catch (err) {
      console.error("Failed to resend OTP email:", err);
      return res.status(500).json({
        success: false,
        error: { code: "SMTP_ERROR", message: "E-posta gönderimi başarısız oldu." }
      });
    }

    res.json({
      success: true,
      data: {
        message: "Yeni doğrulama kodu e-posta adresinize gönderildi.",
        cooldownSeconds: 60,
        expiresInSeconds: 600
      }
    });"""

content = content.replace(target, replacement)

with open("server/routes/auth.ts", "w") as f:
    f.write(content)
