# Genç Sosyal - Mimari Plan ve Proje Planı

## 1. Mimari
Genç Sosyal, sıfırdan geliştirilen, mobil öncelikli, modern bir sosyal medya platformudur.
- **Client**: React (Vite, TS), Tailwind CSS, React Router, Zustand.
- **Server**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL (Docker üzerinde).
- **ORM**: Drizzle ORM.
- **Tasarım**: Modern Soft UI (temiz, yumuşak gölgeli, minimalist, mobil öncelikli).

## 2. Teknoloji Kararları
- **Neden PostgreSQL?**: İlişkisel veri modeli sosyal medya (kullanıcılar, postlar, takipler, beğeniler, mesajlar) için en uygunudur.
- **Neden Drizzle ORM?**: TypeScript ile typesafe, hızlı ve lightweight olması. Schema ile direkt senkronize çalışabilmesi.
- **Neden Express?**: Hızlı backend geliştirme ve Node.js ekosistemiyle esneklik sağlaması. Vite middleware ile tek portta (3000) çalışabilmesi.
- **Neden Argon2?**: Modern parola güvenliği (bcrypt'e modern alternatif, OWASP tavsiyesi).
- **Kimlik Doğrulama**: HttpOnly Secure cookie tabanlı JWT session'ı ile XSS ve CSRF risklerini minimize etmek.

## 3. PostgreSQL Schema Planı
- **users**: id, username, email, password_hash, role, status, created_at, updated_at
- **profiles**: user_id, display_name, bio, avatar, cover_image, website, location, created_at, updated_at
- **posts**: id, user_id, content, created_at, updated_at
- **post_media**: id, post_id, type (image/video), url, created_at
- **likes**: user_id, post_id, created_at (unique constraint ile duplicate engelleme)
- **comments**: id, post_id, user_id, content, created_at
- **follows**: follower_id, following_id, created_at (unique constraint)
- **bookmarks**: user_id, post_id, created_at
- **stories**: id, user_id, media_url, expires_at, created_at
- **messages**: id, sender_id, receiver_id, content, created_at
- **communities**: id, name, slug, description, owner_id, created_at
- **projects**: id, user_id, title, description, category, status, links, created_at

## 4. API Planı (prefix: /api/v1)
- **Auth**: `/auth` (register, login, logout, me, refresh, forgot-password, reset-password)
- **Users**: `/users` (profile, search, follow, unfollow, block)
- **Posts & Feed**: `/posts` (create, list, delete), `/feed` (personalized feed), `/users/:username/posts`
- **Interaction**: `/posts/:id/like`, `/posts/:id/comments`, `/bookmarks`, `/posts/:id/reactions`
- **Media**: `/media` (upload image/video)
- **Stories**: `/stories` (create, view)
- **Messaging**: `/messages` (conversations, direct messages)
- **Communities**: `/communities` (create, join, list)
- **Admin & Moderation**: `/reports`, `/admin`
- **Health**: `/health` (DB status)

## 5. Frontend Route Planı
- `/login`, `/register`, `/forgot-password` (Public)
- `/home`, `/feed`, `/explore`, `/search` (Protected)
- `/profile/:username`, `/settings`, `/bookmarks` (Protected)
- `/messages`, `/messages/:userId` (Protected)
- `/stories`, `/stories/:id` (Protected)
- `/communities`, `/communities/:slug` (Protected)
- `/projects`, `/projects/:id` (Protected)
- `/admin/*` (Admin Protected)

## 6. Component Mimarisi
- `Layouts`: BaseLayout, AuthLayout, AdminLayout
- `UI`: Button, Input, Modal, Avatar, Card, Spinner
- `Features`: 
  - `Post`: PostCard, PostComposer, CommentList, LikeButton
  - `Profile`: ProfileHeader, ProfileTabs, FollowButton
  - `Stories`: StoryCircle, StoryViewer

## 7. Design System
- **Renkler**: Soft neutral arka planlar (slate-50, gray-50). Temiz beyaz kartlar (bg-white). Vurgular için profesyonel mavi/indigo (blue-600) ve yumuşak uyarı renkleri.
- **Tipografi**: Okunabilir sans-serif (Inter veya sistem fontları).
- **Borders & Shadows**: `rounded-xl` / `rounded-2xl`, çok hafif `shadow-sm` gölgeler. Keskin hatlar veya agresif gradientler yasak.
- **Responsive**: Mobil cihazlar için alt navigasyon (BottomNav), masaüstü için yan navigasyon (Sidebar).

## 8. Authentication Mimarisi
- İstek üzerine Express server `argon2` ile şifreleri hashler.
- Başarılı girişte JWT token üretilir ve `HttpOnly`, `Secure` bir cookie ile tarayıcıya gönderilir.
- Frontend, session bilgisini context/Zustand ile yönetir ve sayfa yenilendiğinde `/api/v1/auth/me` ile oturumu doğrular.

## 9. Docker Mimarisi
- **docker-compose.yml**:
  - `db`: PostgreSQL 15 imajı, port 5432, veriler kalıcı volume (`postgres_data`) üzerinde.
  - `app`: Node.js Dockerfile, frontend ve backend'i build edip (`npm run build`), production server'ı (`npm start`) port 3000 üzerinden ayağa kaldırır. Media dosyaları için de ayrı volume (`uploads_data`).

## 10. Test Planı
- **Build/Type Check**: Her adımda `tsc --noEmit` ve `vite build` çalıştırılacak.
- **Manuel Test**: Register -> Login -> Profil düzenleme -> Post atma -> Yorum yapma (E2E testi adımları).
- **Error States**: Yanlış girişler, veritabanı kapalı durumu test edilecek.
