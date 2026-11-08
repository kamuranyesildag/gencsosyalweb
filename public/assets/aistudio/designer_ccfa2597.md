# Genç Sosyal — Tasarım Rehberi

## 1. Ürün kimliği

**Ürün:** Genç Sosyal  
**Web sitesi:** https://gencsosyal.com  
**Konumlandırma:** Gençlerin paylaşım yapabildiği, projelerini sergileyebildiği, topluluklara katılabildiği ve birlikte üretim yapabildiği Türkiye merkezli gençlik sosyal ağı.

Genç Sosyal sıradan bir sosyal medya kopyası değildir. Sosyal akışın yanında gençlik projeleri, topluluklar, teknoloji ve inovasyon, Gençlik Ligi, TEKNOFEST Köşesi ve Genç Quiz gibi alanları bir araya getirir.

Arayüz dili Türkçe olmalıdır. Ürün adı her yerde **Genç Sosyal** olarak yazılmalıdır.

## 2. Görsel hedef

Arayüz; modern, sade, güven veren, gençlere hitap eden ve gerçek bir ürün kalitesinde olmalıdır.

Tasarım ilkeleri:
- Koyu lacivert, beyaz, mavi ve dengeli nötr tonlar kullan.
- Okunabilir tipografi ve belirgin görsel hiyerarşi kur.
- Tutarlı boşluk, hizalama, kenarlık ve bileşen ölçüleri kullan.
- Kartlarda ölçülü kenarlık ve hafif gölge tercih et.
- İkonlar aynı aileden ve aynı görsel ağırlıkta olsun.
- Açık ve koyu temayı destekle.
- Masaüstü, tablet ve mobil için ayrı ayrı düşünülmüş duyarlı düzenler oluştur.
- Erişilebilir kontrast, görünür odak durumu ve klavye kullanımını gözet.

Kaçınılacaklar:
- Cyberpunk, neon ve aşırı parlak renkler.
- Her yerde gradient veya cam/bulanıklık efekti.
- Gereksiz animasyonlar ve dekoratif arka planlar.
- Her bileşeni aşırı yuvarlak hap şekline dönüştürmek.
- Karmaşık, sıkışık veya kurumsal yönetim panelini andıran sosyal akış.
- Başka bir sosyal ağın birebir kopyası.

## 3. Tasarım sistemi

Tasarım kararlarını ortaklaştır:
- Renk değişkenleri ve tema token'ları.
- Tipografi ölçeği.
- Boşluk ölçeği.
- Kenarlık, köşe yarıçapı ve gölge değerleri.
- Buton, giriş alanı, kart, avatar, rozet, sekme, menü, modal ve toast stilleri.
- Yükleniyor, boş içerik, hata ve başarılı işlem durumları.

Bir bileşenin her sayfada farklı görünmesine izin verme. Var olan tasarım sistemi varsa önce onu incele ve tutarlı biçimde geliştir; gereksiz ikinci bir sistem oluşturma.

## 4. Ürün alanları ve ekranlar

Mevcut uygulamada bulunan rotaları ve özellikleri esas al. Aşağıdaki alanlar ürünün tasarım kapsamını tanımlar; kaynak kodda bulunmayan yeni özellikleri varmış gibi gösterme.

- Ana sayfa ve sosyal akış
- Keşfet ve arama
- Gönderi oluşturma
- Gönderi ayrıntısı ve yorumlar
- Bildirimler
- Mesajlaşma
- Kaydedilenler
- Topluluk dizini ve topluluk ayrıntısı
- Kullanıcı profili
- Gençlik projeleri ve proje ayrıntısı
- Hashtag sayfaları
- Gençlik Ligi
- TEKNOFEST Köşesi
- Genç Quiz ve yarışma odası
- Hesap, gizlilik ve güvenlik ayarları
- Giriş, kayıt, OTP ve şifre yenileme
- Profil tamamlama
- Yönetici ve moderasyon alanları

## 5. Ana akış

Ana akış sosyal deneyimin merkezidir:
- Gönderi oluşturma alanı kolay bulunmalı.
- Gönderi kartları metin, görsel, video ve mevcut içerik türlerini okunaklı göstermeli.
- Kullanıcı adı, avatar, tarih ve varsa doğrulanmış rozet net görünmeli.
- Beğeni, yorum, yeniden paylaşım, kaydetme ve diğer eylemler yalnızca mevcut özelliklere göre gösterilmeli.
- Sağ/yan alanlar ana içeriğin önüne geçmemeli.
- Boş, yükleniyor ve hata durumları tasarlanmalı.

## 6. Profil, proje ve topluluk deneyimi

Profil sayfaları kullanıcının kimliğini, paylaşımlarını ve projelerini anlaşılır biçimde sunmalı. Proje alanı; proje başlığı, açıklaması, görseli ve kaynakta bulunan diğer bilgileri öne çıkarmalı. Topluluklar keşfedilebilir olmalı ve topluluk ayrıntı sayfasında içerik ile üyelik bilgileri net sunulmalı.

Kaynak kodda bulunmayan takip, rozet, proje alanı veya topluluk işlemi uydurma.

## 7. Mesajlaşma ve bildirimler

Mesajlaşma arayüzü konuşma listesi ile aktif konuşmayı açıkça ayırmalı. Mobilde bu iki alan arasında rahat geçiş sağlanmalı. Bildirimlerde okunmuş/okunmamış ayrımı, ilgili içeriğe yönlendirme ve boş durumlar tutarlı olmalı.

Özel mesaj içeriğini örnek veya sahte kullanıcı verileriyle gerçekmiş gibi gösterme.

## 8. Duyarlı tasarım

**Masaüstü:** İçerik genişliği dengeli olmalı. Yan paneller yalnızca değer kattığında kullanılmalı. Ana içerik görsel olarak öncelikli olmalı.

**Tablet:** Gereksiz yan paneller daraltılmalı veya uygun biçimde taşınmalı. Dokunmatik etkileşimler rahat olmalı.

**Mobil:** Masaüstü ekranını yalnızca küçültme. Mobil gezinmeyi açık ve kolay erişilebilir tasarla. Kartlar ve formlar ekran genişliğine uyum sağlamalı. Yatay taşma olmamalı. Dokunma hedefleri yeterli büyüklükte olmalı. Modal ve alt menüler birbirinin üzerine hatalı biçimde binmemeli.

## 9. Erişilebilirlik ve etkileşim

- Anlamlı başlık hiyerarşisi kullan.
- Form alanlarında görünür etiketler bulunsun.
- Klavye odağı görünür olsun.
- Sadece renkle anlam aktarma.
- Hareket azaltma tercihine saygı göster.
- Buton gibi görünen her öğe gerçek bir eyleme karşılık gelmeli.
- İşlem sürerken yükleniyor ve hata geri bildirimi sunulmalı.

## 10. Stitch tasarımlarının uygulamaya aktarılması

Google Stitch çıktıları görsel ve bileşen referansıdır. Mevcut uygulamanın mimarisini, rotalarını veya backend sözleşmelerini kendiliğinden değiştirme yetkisi vermez.

Tasarımı mevcut kod tabanına uyarlarken:
- Önce mevcut bileşenleri ve stilleri incele.
- Tekrarlanan bileşenleri ortaklaştır.
- Var olan işlevleri ve veri akışını koru.
- Tasarımda görünen ancak uygulamada bulunmayan işlevleri sahte biçimde çalışıyor gösterme.
- Tasarım ile mevcut işlev arasında fark varsa bunu raporla ve güvenli bir uyarlama öner.
