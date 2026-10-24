# Implementation Plan - Akış Sayfası Modernizasyon & Liquid Glass Tasarımı

Kullanıcının geri bildirimleri doğrultusunda, platformun **Akış (Feed)** sayfasını ve ilgili bileşenlerini modern **Liquid Glass (Buzlu Cam / Glassmorphism)** estetiği, gelişmiş sıralama/filtreleme sekmeleri ve zengin mikro etkileşimler ile profesyonel standartlara yükseltiyoruz.

---

## 1. Tasarım & Görsel Stil (Liquid Glass Aesthetics)

- **Buzlu Cam Yüzeyler (`backdrop-blur-md / backdrop-blur-xl`)**:
  - Akış başlığı (Header), gönderi oluşturma kutusu (Composer), filtre barı ve sağ yan panel kartlarına yarı saydam frosted glass görünümü (`bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/50 shadow-lg shadow-black/5`).
  - Gönderi kartları üzerinde dinamik hover buğulanması ve hafif parıltı efektleri.
- **Tipografi ve Yerleşim Dengesi**:
  - Zero-pill metadata kuralına uygun temiz metin ayrıştırıcıları (`·`).
  - Dinamik akış başlığı, pürüzsüz sekme geçiş göstergeleri.

---

## 2. Akış Filtreleme ve Sıralama Özellikleri

- **Sıralama Anahtarı (Sorting Toggle)**:
  - **Popüler** (Etkileşimi ve beğeni/yeniden paylaşımı yüksek olanlar) vs **En Yeni** (Kronolojik akış) hızlı geçiş anahtarı.
- **Kategori Filtre Sekmeleri (Filter Chips)**:
  - **Tümü**, **Medya** (sadece görsel/video içerenler), **Anketler** (anketli gönderiler), **Tartışmalar** (yorum sayısı yüksek gönderiler) sekmeleri.
- **Sekme Durumu Yönetimi**:
  - Seçili sekme değiştiğinde akışın pürüzsüz animasyonla süzülmesi ve istemci tarafında instant filtreleme/sunucu API parametre desteği.

---

## 3. Mikro Etkileşimler & Hızlı Gezinti

- **Kayan Yeni Gönderi Bildirimi (Floating New Posts Pill)**:
  - Yeni bir gönderi geldiğinde akışın üstünde beliren, tıklandığında akışın en üstüne pürüzsüzce kaydıran ve yeni gönderileri yükleyen cam buton (`backdrop-blur-lg bg-indigo-600/90 text-white`).
- **Klavye Kısayolları (Keyboard Navigation Shortcuts)**:
  - `j` / `k`: Sonraki / Önceki gönderiye odaklanma.
  - `l`: Odaklanılan gönderiyi beğenme.
  - `r`: Odaklanılan gönderiyi yeniden paylaşma.
  - `c`: Yeni gönderi yazma penceresine odaklanma.
  - `?`: Kısayollar bilgi penceresini açma/kapama.
- **Haptik & Sesli Geri Bildirim Esnekliği**:
  - Beğenme, re-post ve medya açma etkileşimlerinde tarayıcı `navigator.vibrate` haptik desteği ve pürüzsüz Framer Motion animasyonları.

---

## 4. Uygulama Adımları

1. **Yardımcı Modüller**:
   - `src/hooks/useKeyboardShortcuts.ts`: Klavye gezinti ve odaklanma hook'u.
   - `src/utils/haptics.ts`: Tarayıcı haptik titreşim yardımcı fonksiyonları.

2. **Bileşen Güncellemeleri**:
   - `src/pages/Feed.tsx`: Liquid glass sticky header, filtreleme barı, kayan yeni gönderi uyarısı ve klavye kısayolları modalı.
   - `src/components/PostCard.tsx`: Glassmorphism kart stili, klavye ile seçilme stili (focus ring & smooth highlight), buğulu buton efektleri.
   - `src/components/FeedSuggestedUsers.tsx` & Yan Paneller: Liquid glass kart çerçeveleri.

3. **Kontrol ve Test (Verification)**:
   - `compile_applet` ile TypeScript derleme doğrulaması.
   - Klavye gezintisi ve filtrelerin çalışma testi.

---

## Uygunluk ve İlerleme Onayı

Lütfen planı inceleyip **Proceed** / **Devam Et** butonuna tıklayarak kodlama aşamasına geçişi onaylayın.
