import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  FileText,
  Shield,
  Scale,
  BadgeCheck,
  Users,
  Rocket,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useSEO } from "../hooks/useSEO";

export function Terms() {
  const navigate = useNavigate();

  useSEO({
    title: "Kullanım Şartları ve Topluluk Kuralları | Genç Sosyal",
    description:
      "Genç Sosyal platformu kullanım şartları, üyelik sözleşmesi, proje ve fikri mülkiyet hakları, mavi tik doğrulama kuralları ve moderasyon ilkeleri.",
    canonicalPath: "/terms",
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.1] transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Gizlilik Politikası</span>
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs"
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
          <header className="border-b border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-10 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Üyelik Sözleşmesi &amp; Topluluk Kuralları • Sürüm 2026.2
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Kullanım Şartları ve Hizmet Koşulları
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Bu Kullanım Şartları, Genç Sosyal platformuna erişiminizi, hesap oluşturmanızı,
                  proje ve içerik paylaşımlarınızı, topluluk yönetimini ve doğrulama süreçlerini
                  düzenleyen bağlayıcı kuralları içerir.
                </p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 pt-1 tabular-nums">
                  Yürürlük ve Son Güncelleme Tarihi: 10 Kasım 2026
                </p>
              </div>
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <FileText className="w-7 h-7" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200/60 dark:border-white/[0.06]">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <Rocket className="w-4 h-4 text-blue-500" />
                  <span>Üretici Hakları</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Paylaştığınız yazılım, tasarım ve TEKNOFEST projelerinin fikri mülkiyeti size ve
                  takımınıza aittir.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                  <span>Adil Doğrulama</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mavi tik yalnızca kriterleri sağlayan özgün hesaplara verilir; manipülasyon
                  durumunda geri alınır.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Güvenli Topluluk</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Zorbalık, nefret söylemi, bot etkileşim ve spam faaliyetlerine sıfır tolerans
                  uygulanır.
                </p>
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-10 space-y-8 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  1
                </span>
                Genel Hükümler ve Hizmetin Tanımı
              </h2>
              <p>
                Genç Sosyal; gençlerin, öğrencilerin, geliştiricilerin, teknoloji takımlarının ve
                toplulukların gönderi paylaşabildiği, projelerini sergileyebildiği, ekip arkadaşı
                bulabildiği ve bilgi yarışmalarına katılabildiği sosyal bir üretim platformudur.
                Platformda hesap oluşturarak veya hizmetleri kullanarak bu Kullanım Şartlarını
                kabul etmiş sayılırsınız.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  2
                </span>
                Üyelik, Yaş Sınırları ve Hesap Güvenliği
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Doğru Bilgi Beyanı:</strong> Kayıt sırasında geçerli bir e-posta adresi
                  ve doğru doğum tarihi bilgisi vermekle yükümlüsünüz.
                </li>
                <li>
                  <strong>10 Ekim 2026 Yönetmeliği ve Yaş Sınıflandırması:</strong> 15 yaş altı
                  kullanıcıların platformda standart hesap açması mevzuat gereği kısıtlanmıştır.
                  15-18 yaş aralığındaki genç kullanıcılar için çocuk güvenliği kuralları,
                  varsayılan takipçi görünürlüğü ve ebeveyn denetimi hükümleri uygulanır.
                </li>
                <li>
                  <strong>Hesap Güvenliği:</strong> Şifrenizin ve varsa İki Faktörlü Doğrulama
                  (2FA) kurtarma kodlarınızın gizliliğinden tamamen kullanıcı sorumludur.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  3
                </span>
                İçerik Mülkiyeti, Projeler ve Ortak Yayınlar
              </h2>
              <p>
                Platformda paylaştığınız gönderi, görsel, kaynak kodu bağlantısı, makale ve
                projelerin fikri mülkiyet hakları size aittir. İçeriğinizi herkese açık olarak
                paylaştığınızda, Genç Sosyal&apos;e bu içeriği platform akışında, arama
                sonuçlarında ve ilgili topluluk sayfalarında görüntüleme, indeksleme ve teknik
                olarak çoğaltma konusunda münhasır olmayan, ücretsiz bir gösterim lisansı vermiş
                olursunuz. Başkasına ait telifli içerikleri veya projeleri kendinize aitmiş gibi
                paylaşmak yasaktır.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  4
                </span>
                Mavi Tik (Doğrulanmış Hesap) Kuralları
              </h2>
              <p>
                Genç Sosyal&apos;de Mavi Tik rozeti; hesabın gerçek bir kişiyi, içerik üreticisini,
                kurumu, aktif bir topluluğu veya özgün bir projeyi temsil ettiğini gösterir.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Mavi tik otomatik verilmez ve hiçbir şekilde satın alınamaz veya devredilemez.
                </li>
                <li>
                  Başvuru için asgari şartları (en az 1.000 gerçek takipçi veya aktif proje/topluluk
                  varlığı, en az 90 gün hesap yaşı, %100 tamamlanmış profil, son 30 günde düzenli
                  etkinlik ve temiz topluluk sicili) karşılamak mavi tikin otomatik onaylanacağı
                  anlamına gelmez.
                </li>
                <li>
                  Yanıltıcı beyanda bulunan, sahte/bot takipçi satın alan, kullanıcı adını veya
                  hesap kimliğini doğrulama sonrasında kötüye kullanan ya da topluluk kurallarını
                  ihlal eden hesapların mavi tik rozeti yönetici kararıyla derhâl geri alınır
                  (`revoked`).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  5
                </span>
                Topluluk Standartları ve Yasaklı Davranışlar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Taciz, Nefret Söylemi ve Zorbalık</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Kişilere veya gruplara yönelik hakaret, siber zorbalık, ayrımcılık, tehdit ve
                    hedef gösterme kesinlikle yasaktır.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Platform Manipülasyonu ve Bot Etkileşim</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Takipçi satın alma, otomatik botlarla beğeni/yorum/puan üretme ve Genç Lig /
                    Genç Quiz yarışmalarında hile yapma yasaktır.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Kişisel Verilerin İfşası (Doxxing)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Başka bireylerin kimlik bilgilerini, telefon numaralarını, adreslerini veya özel
                    yazışmalarını izinsiz paylaşmak yasaktır.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Zararlı Yazılım ve Sistem Güvenliği İhlali</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    API uç noktalarına aşırı yük bindirme, yetkisiz erişim denemesi ve zararlı
                    bağlantı paylaşımı hesabın kalıcı olarak kapatılması sebebidir.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  6
                </span>
                Moderasyon, Yaptırımlar ve İtiraz Hakkı (Appeals)
              </h2>
              <p>
                Genç Sosyal; topluluk güvenliğini korumak amacıyla otomatik içerik filtreleme ve
                yetkili moderatör incelemesini birlikte kullanır. Topluluk kurallarını ihlal eden
                içerikler yayından kaldırılabilir ve ilgili hesaplar geçici veya kalıcı olarak
                askıya alınabilir. Hesabı askıya alınan kullanıcılar, askıya alınma ekranı
                (`/account-suspended`) üzerinden insan incelemesi talep ederek resmî itiraz
                başvurusunda bulunma hakkına sahiptir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  7
                </span>
                Yürürlük ve Güncellemeler
              </h2>
              <p>
                Genç Sosyal, yasal mevzuat değişiklikleri veya yeni platform özellikleri
                doğrultusunda bu Kullanım Şartlarını güncelleyebilir. Güncellenen metinler
                yayınlandığı tarihte yürürlüğe girer ve önemli değişiklikler sistem duyuruları
                üzerinden kullanıcılara bildirilir.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
