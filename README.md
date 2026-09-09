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

Uygulama tamamen Docker mimarisi üzerine kuruludur. Uygulamayı sunucuda veya yerel bilgisayarınızda çalıştırabilmek için aşağıdaki yazılımların kurulu olması gereklidir:

- **Docker**
- **Docker Compose**

---

## 🚀 Kurulum ve Çalıştırma (Docker Compose)

Genç Sosyal, tüm servisleriyle (Uygulama, PostgreSQL, Veritabanı Migration, Nginx) birlikte sadece `docker-compose.yml` kullanılarak ayağa kaldırılacak şekilde tasarlanmıştır. Herhangi bir yerel Node.js veya PM2 kurulumuna gerek yoktur.

### 1. Projeyi Klonlayın
```bash
git clone <repo-adresi>
cd genc-sosyal
```

### 2. Çevresel Değişkenleri (Environment Variables) Ayarlayın
Kök dizinde bulunan `.env.example` dosyasını kopyalayarak `.env` adında yeni bir dosya oluşturun:
```bash
cp .env.example .env
```
`.env` dosyasını açıp gerekli tüm alanları (PostgreSQL bilgileri, JWT secret'lar, SMTP ayarları vb.) doldurun.

### 3. Uygulamayı Başlatın
Tüm sistemi inşa edip arka planda çalıştırmak için aşağıdaki komutu kullanın:
```bash
docker compose up -d --build
```

Bu komut sırasıyla şunları gerçekleştirir:
1. `gencsosyal-postgres`: PostgreSQL veritabanını başlatır.
2. `gencsosyal-migrate`: Drizzle ORM ile veritabanı tablolarını (migration) oluşturur.
3. `gencsosyal-app`: Uygulamayı derleyip (build) production modunda çalıştırır.
4. `gencsosyal-nginx`: Nginx reverse proxy'yi başlatarak 80 portuna gelen istekleri uygulamaya yönlendirir.

Tüm servisler "healthy" durumuna geldiğinde uygulamanız Nginx üzerinden **http://localhost** veya yapılandırdığınız domain adresinde yayında olacaktır.

---

## 📂 Depolama ve Volume Mantığı

Uygulamadaki kalıcı veriler (database ve upload edilen dosyalar) Docker Volume ile korunmaktadır:

- `postgres_data`: Veritabanı dosyaları.
- `uploads_data:/app/uploads`: Kullanıcıların yüklediği görseller ve medya dosyaları.

> **Uyarı:** `uploads_data:/app/uploads` mantığı şu an yerel container izolasyonunu korumaktadır ancak **Production için ileride AWS S3 veya Cloudflare R2'ye geçilecektir**. Bu mimari, verilerin daha güvenli saklanması ve sunucunun bağımsız şekilde yatay ölçeklenebilmesi (horizontal scaling) için gereklidir.

---

## ⚙️ Nginx ve Cloudflare Ayarları

Projeyle birlikte gelen Nginx yapılandırması (`nginx/default.conf`), Cloudflare proxy'si arkasında çalışacak şekilde ayarlanmıştır. Nginx konfigürasyonunuz şuna benzer:

```nginx
server {
    listen 80;
    server_name _;
    
    # Cloudflare real IP pass ayarları
    # ...
    
    location / {
        proxy_pass http://gencsosyal-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Cloudflare kullandığınızda `X-Forwarded-Proto` ve WebSocket `Upgrade` bağlantıları da sorunsuz şekilde aktarılacaktır.

## 🔍 SEO ve Keşfedilebilirlik (Production Deployment Checklist)

Uygulamanız canlıya alındığında arama motorlarında doğru indexlenebilmesi için aşağıdaki adımları tamamlayın.

### 1. Domain ve Çevresel Değişkenler
`.env` dosyanızdaki `VITE_PUBLIC_URL` ve `APP_URL` değişkenlerini üretim (production) domaininiz ile değiştirin. 
Örneğin:
```env
VITE_PUBLIC_URL=https://gencsosyal.com
APP_URL=https://gencsosyal.com
```
*Bu değişkenler, `robots.txt` Sitemap URL'sini, canonical linkleri ve Open Graph verilerini doğru şekilde oluşturmak için gereklidir.*

### 2. Google Search Console Hazırlığı
1. [Google Search Console](https://search.google.com/search-console)'a gidin.
2. Domaininizi (veya URL prefix'inizi) ekleyin.
3. Domain doğrulama (DNS TXT record vb.) işlemlerini tamamlayın.
4. **Sitemap Ekleme:** Sol menüden "Site Haritaları"na (Sitemaps) tıklayın ve `https://gencsosyal.com/sitemap.xml` adresini gönderin.
5. URL denetimi yaparak önemli sayfaların (`/`, `/explore`, `/profile/username`) düzgün çalışıp çalışmadığını kontrol edebilirsiniz.
*(Not: Google'ın sayfalarınızı indexleme süresi tamamen kendi algoritmalarına bağlıdır ve garanti edilemez.)*

### 3. Bing Webmaster Tools
1. [Bing Webmaster Tools](https://www.bing.com/webmasters/)'a gidin.
2. Sitenizi doğrulayın (veya Google Search Console'dan içe aktarın).
3. `https://gencsosyal.com/sitemap.xml` haritanızı Bing'e gönderin.

### 4. Güvenlik ve Gizlilik
- `messages`, `settings`, `admin`, `notifications` gibi gizli alanlar sistemsel olarak `<meta name="robots" content="noindex, nofollow" />` ile korunmaktadır.
- Sitemap'iniz sadece public ve izin verilen (isPrivate: false, allowSearchEngineIndexing: true vb.) içerikleri listeler.
- Yapısal Veri (JSON-LD) entegrasyonu mevcuttur ve uygulamanın türüne göre (`Organization`, `ProfilePage`, `SocialMediaPosting` vb.) dinamik olarak sayfalarınıza eklenir.

### 5. AI Search Optimization
Projenin root dizininde veya public alanında `/llms.txt` eklenmiştir. Bu dosya, AI tarayıcılarına platformunuzun ne olduğuyla ilgili temel ve resmi marka bilgilerini verir. (Resmi bir standart değildir, emerging bir convention'dır).
