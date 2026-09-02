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
