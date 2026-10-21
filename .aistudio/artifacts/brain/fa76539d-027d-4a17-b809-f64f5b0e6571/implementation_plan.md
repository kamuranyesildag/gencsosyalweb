# Genç Sosyal — Bütünsel Modern Arayüz Dönüşüm Planı

Genç Sosyal'in tüm platform sayfalarını (Profil, Keşfet, Mesajlaşma, TEKNOFEST, Projeler, Topluluklar ve Quiz) premium frosted glass, derin lacivert ve buz mavisi estetiğiyle birleştiren, zengin kart önizlemeleri ve genişletilmiş medya alanlarıyla kullanıcı deneyimini üst seviyeye taşıyan kapsamlı dönüşüm planı.

## Kullanıcı İncelemesi ve Kritik Kararlar

> [!IMPORTANT]
> Kullanıcı tercihleri doğrultusunda belirlenen üç ana ilke tüm sayfalarda tavizsiz şekilde uygulanacaktır:
> 1. **Dönüşüm Kapsamı**: Yalnızca ana sayfa ile sınırlı kalmayıp, Profil, Keşfet, Mesajlar, TEKNOFEST, Projeler, Topluluklar ve Quiz dahil olmak üzere **tüm platform sayfalarının bütünsel dönüşümü** sağlanacaktır.
> 2. **Görsel DNA**: Aşırı neon/cyberpunk yerine **premium frosted glass (buzlu cam) yüzeyler**, açık temada **buz mavisi & ferah beyaz**, koyu temada **derin gece laciverti (`#080E1A`, `#0B1329`)** ve asil mavi aksanlar kullanılacaktır.
> 3. **Etkileşim & Medya**: Standart dar görseller yerine **zengin kart önizlemeleri**, genişletilmiş yüksek çözünürlüklü medya pencereleri ve dokunmatik ekranlara uyumlu akıcı mikro etkileşimler uygulanacaktır.

---

## 1. Genel Bakış ve Temel Konsept

- **Ne Yapıyor**: Genç Sosyal'in tüm modüllerini tek bir tasarım dili çatısı altında toplar; profil kartlarından sohbet baloncuklarına, TEKNOFEST proje vitrinlerinden quiz panellerine kadar her sayfayı modern, saydam, hafif ve ferah bir deneyime kavuşturur.
- **Hedef Kitle**: Türkiye'nin teknoloji üreten, proje geliştiren, sosyalleşen ve yarışmalara hazırlanan gençliği; lise ve üniversite toplulukları, bağımsız geliştiriciler ve maker'lar.
- **Temel Değer**: Görsel karmaşayı ortadan kaldırarak kullanıcının projelerine, paylaşımlarına ve topluluk iletişimine odaklanan, dünya standartlarında premium bir sosyal platform deneyimi sunmak.

---

## 2. Kullanıcı Deneyimi ve Görsel Tasarım

### Ana Sayfa ve Modül Akışları

1. **Profil Sayfası (`Profile.tsx`)**:
   - Yüksek çözünürlüklü geniş panoramik kapak görseli ve yumuşak cam efektli profil avatar rozeti.
   - Cam yüzeyli istatistik kartları (takipçi, takip edilen, proje sayısı, TEKNOFEST dereceleri).
   - "Projelerim", "Gönderiler", "Medya" ve "Topluluklar" için yatay kaydırılabilir, aktif sekmesi asil mavi parıltılı cam sekme çubuğu.
   - İki kolonlu ferah masaüstü yerleşimi, mobilde tek sütunlu ergonomik başparmak akışı.

2. **Keşfet & Arama (`Explore.tsx`, `HashtagDetail.tsx`)**:
   - Üstte cam arama giriş çubuğu, anlık etiket filtreleme hapları.
   - Zengin medya kartları içeren çok sütunlu duvar (masonry/grid) akışı; video ve görseller için genişletilmiş 16:9 ve 4:5 en-boy oranları.
   - "Haftanın Parlayan Projeleri" ve "Önerilen Üreticiler" için yatay kaydırmalı cam vitrinler.

3. **Mesajlaşma Paneli (`Messages.tsx`, `MessageDetail.tsx`)**:
   - Sol tarafta frosted cam arka planlı sohbet listesi, çevrim içi durumu belirten zarif zümrüt yeşili halkalar.
   - Sağ tarafta akıcı konuşma penceresi; giden mesajlar için hafif mavi cam kabarcıklar, gelen mesajlar için yarı saydam beyaz/koyu lacivert kartlar.
   - Alt kısımda görsel/eklenti yükleme butonlu, odaklandığında yumuşak mavi parlayan cam mesaj yazma alanı.

4. **TEKNOFEST & Projeler (`Teknofest.tsx`, `Projects.tsx`, `ProjectDetail.tsx`)**:
   - Proje detaylarında büyük görsel galeri ve prototip video oynatıcı alanı.
   - Takım üyeleri için avatarlı cam rozetler, kullanılan teknolojiler için mikro cam etiketler (React, IoT, ROS, PyTorch).
   - "Takıma Katıl" ve "Destek Ol" butonları için derinlikli asil mavi birincil butonlar.

5. **Topluluklar & Genç Quiz (`Communities.tsx`, `GencQuiz.tsx`, `QuizRoom.tsx`)**:
   - Topluluk vitrininde geniş kapaklı cam kulüp kartları.
   - Quiz odasında büyük tipografik zamanlayıcı sayacı, 4 seçenekli basma derinliğine sahip cam cevap butonları ve puan tablosu.

### Görsel Kimlik, Tipografi ve Renkler
- **Font Ailesi**: `Plus Jakarta Sans` (birincil başlıklar ve kullanıcı adları için 600/700/800 ağırlıklar), `Inter` (okunabilir gövde metinleri).
- **Açık Tema**: Arka plan `#F8FAFC`, yüzeyler `rgba(255, 255, 255, 0.82)`, kenarlıklar `rgba(226, 232, 240, 0.8)`.
- **Koyu Tema**: Arka plan `#080E1A` (gece laciverti), yüzeyler `#0B1329` ve `#101C38`, kenarlıklar `rgba(255, 255, 255, 0.08)`.
- **Vurgu Rengi**: Asil Mavi (`#2563EB` / `#3B82F6`), durum renkleri için Zümrüt (`#059669`) ve Gül Pembesi (`#E11D48`).

---

## 3. Temel Ürün Kararları ve Tercihler

- **Karar 1: Bütünsel vs. Parçalı Tasarım**:
  - *Seçim*: Tüm sayfaların ortak bir tasarım motoruna bağlanması.
  - *Gerekçe*: Kullanıcı ana sayfadan profile veya mesajlara geçtiğinde tasarım kopukluğu yaşamamalı; uygulama tek vücut hâlinde hissettirmelidir.
- **Karar 2: Kontrollü Cam Efekti ve Performans Dengesi**:
  - *Seçim*: Aşırı blur katmanları yerine 3 seviyeli cam hiyerarşisi (`glass-nav`, `glass-card`, `glass-popover`) ve `@supports not (backdrop-filter)` fallback'i.
  - *Gerekçe*: Düşük donanımlı mobil cihazlarda GPU tüketimini minimize ederken 60fps kaydırma performansını korumak.
- **Karar 3: Zengin Kart ve Genişletilmiş Medya Formatı**:
  - *Seçim*: Gönderi ve projelerdeki görselleri küçük küçük kırpmak yerine, tam genişlikte 16:9 / 4:3 oranlı modern lightbox destekli kartlara taşımak.
  - *Gerekçe*: Görsel projelerin, 3D çizimlerin ve TEKNOFEST fotoğraflarının hak ettiği etkileyicilikte sergilenmesini sağlamak.

---

## 4. Teknik Mimari ve Sayfa Dönüşüm Haritası

```
┌────────────────────────────────────────────────────────────────────────┐
│                   GENÇ SOSYAL MODERN UI MİMARİSİ                       │
├────────────────────────────────────────────────────────────────────────┤
│  GLOBAL SHELL: AppHeader (Glass) + DesktopSidebar + MobileBottomNav    │
├──────────────────┬───────────────────┬─────────────────────────────────┤
│  SOSYAL AKIŞ     │  KEŞİF & İLETİŞİM │  ÜRETİM & YARIŞMA               │
│  ───────────     │  ──────────────── │  ────────────────               │
│  • Feed.tsx      │  • Explore.tsx    │  • Teknofest.tsx                │
│  • PostCard.tsx  │  • Messages.tsx   │  • Projects.tsx                 │
│  • Profile.tsx   │  • Communities.tsx│  • GencQuiz.tsx                 │
│  • Bookmarks.tsx │  • Notifications  │  • YouthLeague.tsx              │
├──────────────────┴───────────────────┴─────────────────────────────────┤
│  DESIGN SYSTEM TOKENS: index.css + design-tokens.ts                    │
│  (Plus Jakarta Sans, Liquid Glass, Deep Navy, Ice Blue, Soft Hairline) │
└────────────────────────────────────────────────────────────────────────┘
```

### Uygulama Adımları Sırası

1. **Adım 1: Profil Sayfası Modernizasyonu (`src/pages/Profile.tsx`)**:
   - Kapak görseli, avatar rozeti, istatistik cam çipleri, sekme navigasyonu ve proje ızgarasının dönüştürülmesi.
2. **Adım 2: Keşfet ve Bildirimler (`src/pages/Explore.tsx`, `Notifications.tsx`, `Bookmarks.tsx`)**:
   - Arama kutusu, trend etiketleri ve bildirim filtreleme kartlarının cam arayüze geçirilmesi.
3. **Adım 3: Mesajlaşma Deneyimi (`src/pages/Messages.tsx`, `MessageDetail.tsx`)**:
   - Sohbet listesi, mesaj baloncukları, medya önizlemeleri ve giriş alanının yenilenmesi.
4. **Adım 4: TEKNOFEST, Projeler ve Topluluklar (`src/pages/Teknofest.tsx`, `Projects.tsx`, `Communities.tsx`)**:
   - Yarışma galerisi, proje vitrini ve topluluk kulüp kartlarının genişletilmiş medya oranlarına kavuşturulması.
5. **Adım 5: Gamification & Ayarlar (`src/pages/GencQuiz.tsx`, `QuizRoom.tsx`, `Settings.tsx`)**:
   - Quiz soru ekranları, puan tabloları ve ayarlar panellerinin tamamlanması.
6. **Adım 6: Derleme ve Performans Doğrulaması**:
   - `compile_applet` ve `lint_applet` ile tüm sayfalardaki tip ve build doğrulamalarının yapılması.
