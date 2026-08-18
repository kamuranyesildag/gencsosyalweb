# Genç Sosyal

Genç Sosyal, React, Vite, Node.js (Express) ve PostgreSQL (Drizzle ORM) kullanılarak modern web standartlarında geliştirilmiş, performansı ve mobil deneyimi ön planda tutan bir sosyal medya platformudur.

## Teknolojik Altyapı
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand (State Management), Framer Motion (Animasyonlar), React Router v8
- **Backend:** Node.js, Express v5, TypeScript
- **Veritabanı:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT, Zod Validation, Argon2 şifreleme, OTP, 2FA
- **Güvenlik:** Helmet, Rate Limit, CORS, XSS Koruması

## Gereksinimler
Uygulamayı kendi ortamınızda (local) çalıştırabilmek için aşağıdaki yazılımların kurulu olması gereklidir:
- **Node.js:** v20.x veya daha üstü (LTS Önerilen)
- **PostgreSQL:** v14 veya daha üstü bir veritabanı sunucusu

---

## 🚀 Yerel Kurulum Talimatları

### 1. Projeyi Klonlayın ve Bağımlılıkları Yükleyin

Projenin kök dizinine gidin ve bağımlılıkları yüklemek için npm kullanın:

```bash
npm install
```

### 2. Çevresel Değişkenleri (Environment Variables) Ayarlayın

Projenin çalışması için veritabanı bağlantısı, JWT gizli anahtarları ve e-posta (SMTP) ayarlarını yapılandırmanız gerekir.

Kök dizinde bulunan `.env.example` dosyasını kopyalayarak `.env` adında yeni bir dosya oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını bir metin editörü ile açın ve aşağıdaki değerleri kendinize göre güncelleyin:

```env
# Server Port
PORT=3000
NODE_ENV="development"

# Database URL (PostgreSQL bağlantı stringiniz)
# Format: postgresql://kullanici_adi:sifre@localhost:5432/veritabani_adi
DATABASE_URL="postgresql://postgres:sifreniz@localhost:5432/genc_sosyal"

# Security (Kimlik doğrulama için karmaşık ve güvenli metinler girin)
JWT_SECRET="gizli-anahtar-1"
JWT_REFRESH_SECRET="gizli-anahtar-2"
JWT_EMAIL_SECRET="gizli-anahtar-3"
JWT_2FA_SECRET="gizli-anahtar-4"
ENCRYPTION_KEY="32-karakterli-guvenli-anahtar"

ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Frontend URL (CORS ve email linkleri için)
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"

# --- Opsiyonel SMTP Ayarları ---
# E-posta doğrulama ve şifre sıfırlama için doldurabilirsiniz.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=senin-mailin@gmail.com
SMTP_PASS=uygulama-parolasi
SMTP_FROM="Genç Sosyal <noreply@localhost.com>"
```

### 3. Veritabanını Hazırlayın

Ayarladığınız PostgreSQL veritabanına uygulamanın tablolarını aktarmanız (migrate) gerekmektedir. Drizzle ORM bu işlemi sizin için otomatik yapar.

```bash
# Tabloları veritabanına aktarmak için
npm run db:push
```

*(Geliştirme sürecinde Drizzle stüdyosunu açıp veritabanını görsel olarak yönetmek isterseniz `npm run db:studio` komutunu kullanabilirsiniz.)*

### 4. Geliştirme Sunucusunu Başlatın

Uygulamanızı geliştirmek ve test etmek için (Hem Vite frontend hem de Express backend aynı anda çalışacaktır):

```bash
npm run dev
```

Sunucu başarıyla başladığında, tarayıcınızdan şu adrese giderek Genç Sosyal'i kullanabilirsiniz:
👉 **http://localhost:3000**

---

## 📦 Production (Üretim) Kurulumu

Uygulamayı bir sunucuya (VDS, VPS, Heroku, Render, vb.) deploy etmek için:

**1. Projeyi Derleyin (Build):**
```bash
npm run build
```
Bu komut; 
- Frontend'i statik dosyalar olarak `dist/` klasörüne derler.
- Backend'i `dist/server.cjs` olarak tekil bir dosyaya paketler.
- Veritabanı migrasyon dosyasını `dist/migrate.cjs` olarak paketler.

**2. Production Sunucusunu Başlatın:**
```bash
npm run start
```
Bu komut, derlenmiş Node.js sunucusunu (`dist/server.cjs`) çalıştırır. Production ortamında `.env` dosyanızda `NODE_ENV="production"` olduğundan ve URL/SMTP ayarlarınızın canlı domaininize uygun olduğundan emin olun.

---

## 🛠 Kullanılan NPM Script'leri

- `npm run dev` : Uygulamayı geliştirme modunda başlatır (`tsx` ile).
- `npm run build` : Uygulamayı production için derler.
- `npm run start` : Derlenmiş (build edilmiş) projeyi başlatır.
- `npm run lint` : TypeScript hata denetimi yapar.
- `npm run db:push` : Şema değişikliklerini veritabanına doğrudan uygular.
- `npm run db:generate` : SQL migrasyon dosyalarını oluşturur.
- `npm run db:migrate` : Oluşturulan migrasyon dosyalarını veritabanına uygular.
- `npm run db:studio` : Drizzle Studio'yu başlatarak veritabanı paneli açar.
