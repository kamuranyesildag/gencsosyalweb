import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Shield,
  Lock,
  EyeOff,
  BadgeCheck,
  UserCheck,
  Server,
  FileText,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { useSEO } from "../hooks/useSEO";

export function Privacy() {
  const navigate = useNavigate();

  useSEO({
    title: "Gizlilik Politikası ve Veri Güvenliği | Genç Sosyal",
    description:
      "Genç Sosyal kullanıcı gizliliği, kişisel verilerin korunması, çocuk ve genç güvenliği, mavi tik belge gizliliği ve bilgi güvenliği ilkeleri.",
    canonicalPath: "/privacy",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Legal Center Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0D121D] p-4 sm:px-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </button>

          <nav
            aria-label="Yasal Metinler Menüsü"
            className="flex flex-wrap items-center gap-2"
          >
            <Link
              to="/privacy"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Gizlilik Politikası</span>
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.1] transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kullanım Şartları</span>
            </Link>
            <Link
              to="/kvkk"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.1] transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>KVKK Aydınlatma Metni</span>
            </Link>
          </nav>
        </div>

        {/* Main Document Card */}
        <article className="bg-white dark:bg-[#0D121D] rounded-3xl shadow-xs border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
          {/* Header Banner */}
          <header className="border-b border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-10 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Resmî Yasal Doküman • Sürüm 2026.2
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Gizlilik Politikası ve Veri Güvenliği İlkeleri
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Genç Sosyal; gençlerin projelerini geliştirdiği, topluluklar kurduğu ve bilgi
                  ürettiği bağımsız bir sosyal üretim platformudur. Bu politika, verilerinizin
                  nasıl korunduğunu, hangi amaçlarla işlendiğini ve gizlilik kontrollerinizi açıklar.
                </p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 pt-1 tabular-nums">
                  Yürürlük ve Son Güncelleme Tarihi: 10 Kasım 2026
                </p>
              </div>
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Shield className="w-7 h-7" />
              </div>
            </div>

            {/* Key Privacy Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200/60 dark:border-white/[0.06]">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>Veri Satışı Yoktur</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Kişisel verileriniz üçüncü taraf reklam ağlarına veya veri simsarlarına asla
                  satılmaz ve devredilmez.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Genç &amp; Çocuk Koruması</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  15-18 yaş grubundaki genç hesaplar için varsayılan görünürlük, ekran süresi ve
                  ebeveyn denetimi korumaları uygulanır.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                  <span>Korumalı Doğrulama</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mavi tik başvurularında T.C. Kimlik Numarası talep edilmez; referans kayıtları
                  herkese açık paylaşılmaz.
                </p>
              </div>
            </div>
          </header>

          {/* Content Sections */}
          <div className="p-6 sm:p-10 space-y-8 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  1
                </span>
                Genel Bilgilendirme ve Kapsam
              </h2>
              <p>
                Genç Sosyal (&quot;Platform&quot;), kullanıcılarının ifade özgürlüğünü, proje
                üretimini ve bilgi güvenliğini merkeze alan bir sosyal ağdır. Bu Gizlilik
                Politikası; web uygulamamız, API servislerimiz, gerçek zamanlı mesajlaşma ve
                yarışma modüllerimiz (Genç Lig, Genç Quiz, TEKNOFEST Köşesi) üzerinden sunulan tüm
                hizmetleri kapsar.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  2
                </span>
                Toplanan ve İşlenen Veriler
              </h2>
              <p>
                Platformun sağlıklı çalışması, güvenliğin sağlanması ve kullanıcı deneyiminin
                sunulabilmesi için yalnızca gerekli olan asgari veriler işlenir:
              </p>
              <ul className="space-y-2.5 pl-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">
                      Hesap ve Profil Verileri:
                    </strong>{" "}
                    Kullanıcı adı, e-posta adresi, Argon2 ile özetlenmiş (hashlenmiş) parola,
                    görünen ad, biyografi, profil/kapak görseli, konum, web sitesi bağlantısı,
                    ilgi alanları ve yaş grubu doğrulama durumu.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">
                      Üretim, Topluluk ve Etkileşim Verileri:
                    </strong>{" "}
                    Paylaştığınız gönderiler, alıntılar, anket oyları, yorumlar, sergilediğiniz
                    projeler, katıldığınız topluluklar, yer imleri ve kullanıcılar arası mesajlaşma
                    kayıtları.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">
                      Mavi Tik Doğrulama Başvuru Verileri:
                    </strong>{" "}
                    Doğrulama başvurusu yaptığınızda seçilen kategori (Bireysel, İçerik Üreticisi,
                    Kurum/Marka, Topluluk, Proje), başvuru açıklaması, destekleyici bağlantılar ve
                    yalnızca yetkili yöneticilerin erişebildiği korumalı belge referans özetleri.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">
                      Güvenlik ve Oturum Kayıtları:
                    </strong>{" "}
                    Yetkisiz erişimleri ve spam saldırılarını önlemek amacıyla tutulan oturum
                    belirteçleri (JWT / Refresh Token), iki faktörlü doğrulama (2FA) tercihleri ve
                    güvenlik denetim kayıtları (`security_audit_logs`).
                  </div>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  3
                </span>
                Genç ve Çocuk Kullanıcıların Gizliliği (10 Ekim 2026 Yönetmeliği)
              </h2>
              <p>
                Genç Sosyal, gençlerin dijital güvenliğini ve refahını korumak amacıyla özel
                gizlilik kalkanları uygular:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>15-18 Yaş Genç Hesap Koruması (`isMinor`):</strong> Genç kullanıcıların
                  paylaşımları varsayılan olarak herkese açık keşfet akışlarına ve arama
                  motorlarına kapatılır; yalnızca onaylı takipçilerine görünür.
                </li>
                <li>
                  <strong>Ebeveyn Denetimi ve Dijital Refah:</strong> Ebeveyn eşleştirme kodu ile
                  günlük ekran süresi sınırı, gece modu kısıtlaması (22:00 – 07:00) ve mesajlaşma
                  kısıtlamaları şeffaf biçimde yönetilir.
                </li>
                <li>
                  <strong>Hassas Kimlik Verisi Yasağı:</strong> Genç kullanıcılardan hiçbir koşulda
                  açık T.C. Kimlik Numarası veya kimlik belgesi fotoğrafı talep edilmez; yaş
                  doğrulama kayıtlarında yalnızca anonimleştirilmiş doğrulama durumu saklanır.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  4
                </span>
                Mavi Tik Doğrulama Sürecinde Gizlilik
              </h2>
              <p>
                Mavi tik doğrulama başvurularında uygunluk kriterleri (gerçek takipçi sayısı,
                90 günlük hesap yaşı, profil bütünlüğü, son 30 gün aktifliği ve etkileşim
                güvenilirliği) doğrudan sunucu tarafında mevcut platform verileriniz üzerinden
                otomatik olarak hesaplanır. Sunduğunuz kurumsal veya proje referans bilgileri
                herkese açık URL olarak yayınlanmaz; yalnızca başvuru sahibi ve yetkili sistem
                yöneticileri (`ADMIN`) tarafından görüntülenebilir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  5
                </span>
                Görünürlük Kontrolleri ve Gizlilik Tercihleriniz
              </h2>
              <p>
                <strong>Ayarlar &gt; Gizlilik &amp; Engelleme</strong> menüsü üzerinden aşağıdaki
                kontrolleri dilediğiniz an değiştirebilirsiniz:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Gizli Hesap (`isPrivate`):</strong> Hesabınızı gizliye aldığınızda
                  yalnızca onayladığınız takipçiler gönderilerinizi görebilir.
                </li>
                <li>
                  <strong>Arama Motoru İndeksleme İzni:</strong> Profilinizin dış arama
                  motorlarında listelenip listelenmeyeceğini belirleyebilirsiniz.
                </li>
                <li>
                  <strong>Mesaj ve Bahsetme (Mention) İzinleri:</strong> Size kimlerin doğrudan
                  mesaj gönderebileceğini veya gönderilerde sizden bahsedebileceğini (`Herkes`,
                  `Takip Ettiklerim`, `Hiç Kimse`) seçebilirsiniz.
                </li>
                <li>
                  <strong>Ekran Görüntüsü Koruması:</strong> Profilinizde caydırıcı ekran görüntüsü
                  koruma katmanını etkinleştirebilirsiniz.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  6
                </span>
                Çerezler (Cookies) ve Teknik Güvenlik Önlemleri
              </h2>
              <p>
                Genç Sosyal&apos;de üçüncü taraf reklam veya çapraz site takip çerezleri
                kullanılmaz. Yalnızca güvenli oturum yönetimi (`HttpOnly` yenileme çerezleri),
                tema/dil tercihleri ve CSRF/XSS saldırılarına karşı güvenlik doğrulaması için
                zorunlu teknik depolama birimleri kullanılır. Parolalarınız <strong>Argon2</strong>{" "}
                algoritmasıyla, iki faktörlü doğrulama anahtarlarınız ise şifrelenmiş olarak
                korunur.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  7
                </span>
                Veri Saklama Süresi, Hesap Silme ve İletişim
              </h2>
              <p>
                Hesabınızı <strong>Ayarlar &gt; Hesap Güvenliği</strong> bölümünden dilediğiniz
                zaman kalıcı olarak silebilirsiniz. Hesap silme işlemi gerçekleştiğinde profiliniz,
                gönderileriniz, yorumlarınız ve oturum anahtarlarınız ilişkili veritabanı
                kayıtlarından (`ON DELETE CASCADE`) temizlenir; yalnızca mevzuat gereği tutulması
                zorunlu olan trafik ve güvenlik kayıtları yasal süre boyunca muhafaza edilir.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  6698 sayılı KVKK kapsamındaki yasal haklarınız ve veri işleme envanteri için{" "}
                  <Link
                    to="/kvkk"
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    KVKK Aydınlatma Metni
                  </Link>{" "}
                  sayfamızı inceleyebilirsiniz.
                </div>
                <Link
                  to="/kvkk"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shrink-0"
                >
                  Aydınlatma Metnine Git
                </Link>
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
