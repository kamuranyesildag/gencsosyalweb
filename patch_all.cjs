const fs = require('fs');

// 1. Role mismatch (auth.ts middleware)
let authMw = fs.readFileSync('server/middleware/auth.ts', 'utf8');
authMw = authMw.replace(
  /if \(req\.user\.role !== role && req\.user\.role !== "ADMIN"\) \{/g,
  `if (req.user.role.toUpperCase() !== role.toUpperCase() && req.user.role.toUpperCase() !== "ADMIN") {`
);
fs.writeFileSync('server/middleware/auth.ts', authMw);

// 2. SMTP Decrypt logic error (mailer.ts)
let mailer = fs.readFileSync('server/utils/mailer.ts', 'utf8');
const mailerOld = `    } catch (e) {
      // In case it's an old plaintext password, fallback to it
      pass = config['smtp_pass'];
    }`;
const mailerNew = `    } catch (e) {
      throw new Error("SMTP şifresi çözülemedi. Lütfen ayarları kontrol edin.");
    }`;
mailer = mailer.replace(mailerOld, mailerNew);
fs.writeFileSync('server/utils/mailer.ts', mailer);

// 3. Cryptographic weakness (encryption.ts)
let encryption = fs.readFileSync('server/utils/encryption.ts', 'utf8');
const encOld = `    console.warn("WARNING: ENCRYPTION_KEY ayarlı değil, JWT_SECRET türetilmiş anahtar kullanılıyor - production için önerilmez.");
    const fallbackSecret = process.env.JWT_SECRET || "dev_fallback_secret_do_not_use_in_prod!";
    return crypto.scryptSync(fallbackSecret, "salt", 32);`;
const encNew = `    console.warn("WARNING: ENCRYPTION_KEY ayarlı değil, izole bir fallback anahtar kullanılıyor - production için önerilmez.");
    const fallbackSecret = "isolated_dev_fallback_secret_only_for_local_development";
    return crypto.scryptSync(fallbackSecret, "salt", 32);`;
encryption = encryption.replace(encOld, encNew);
fs.writeFileSync('server/utils/encryption.ts', encryption);

// 4. Username validation error message (auth.ts validators)
let validators = fs.readFileSync('server/validators/auth.ts', 'utf8');
validators = validators.replace(
  /\.regex\(\/\^\[a-zA-Z0-9_\]\+\$\/, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir\."\)/g,
  `.regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adında Türkçe karakter (ç,ğ,ı,ö,ş,ü) ve boşluk kullanılamaz.")`
);
fs.writeFileSync('server/validators/auth.ts', validators);

console.log('All patches applied');
