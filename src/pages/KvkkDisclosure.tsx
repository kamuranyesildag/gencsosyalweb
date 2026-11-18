import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Scale,
  Shield,
  FileText,
  Database,
  UserCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useSEO } from "../hooks/useSEO";

export function KvkkDisclosure() {
  const navigate = useNavigate();

  useSEO({
    title: "KVKK Aydınlatma Metni | Genç Sosyal",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında Genç Sosyal veri sorumlusu aydınlatma metni, işlenen veri kategorileri, hukuki sebepler ve ilgili kişi hakları.",
    canonicalPath: "/kvkk",
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.1] transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kullanım Şartları</span>
            </Link>
            <Link
              to="/kvkk"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs"
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
                  6698 Sayılı Kanun Uyarınca • Sürüm 2026.2
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu
                  (&quot;KVKK&quot;) m. 10 ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde
                  Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca Genç Sosyal kullanıcılarını
                  bilgilendirmek amacıyla hazırlanmıştır.
                </p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 pt-1 tabular-nums">
                  Yürürlük ve Son Güncelleme Tarihi: 10 Kasım 2026
                </p>
              </div>
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Scale className="w-7 h-7" />
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-10 space-y-8 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  1
                </span>
                Veri Sorumlusunun Kimliği
              </h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca kişisel verileriniz, veri
                sorumlusu sıfatıyla <strong>Genç Sosyal Dijital Üretim ve Teknoloji Platformu</strong>{" "}
                tarafından aşağıda açıklanan kapsamda, hukuka ve dürüstlük kurallarına uygun,
                doğru ve güncel olarak, belirli, açık ve meşru amaçlarla bağlantılı ve ölçülü
                biçimde işlenmektedir.
              </p>
            </section>

            {/* Section 2: Data Inventory Table */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  2
                </span>
                İşlenen Kişisel Veri Kategorileri, Amaçları ve Hukuki Sebepleri
              </h2>
              <p>
                Platformumuzda işlenen kişisel veri kategorileri, işleme amaçları ve KVKK m. 5
                kapsamındaki hukuki sebepleri aşağıda tablo hâlinde sunulmuştur:
              </p>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-white/[0.04] text-slate-900 dark:text-white font-bold border-b border-slate-200/80 dark:border-white/[0.08]">
                      <th className="p-3.5">Veri Kategorisi</th>
                      <th className="p-3.5">İşlenen Veri Türleri</th>
                      <th className="p-3.5">İşleme Amacı ve Hukuki Sebebi (KVKK m.5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.06]">
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white align-top">
                        Kimlik ve Profil Verisi
                      </td>
                      <td className="p-3.5 align-top">
                        Kullanıcı adı, görünen ad, doğum tarihi / yaş grubu statüsü, biyografi,
                        profil fotoğrafı.
                      </td>
                      <td className="p-3.5 align-top">
                        Üyelik sözleşmesinin kurulması ve ifası (m.5/2-c), 10 Ekim 2026 çocuk ve
                        genç güvenliği mevzuatına uyum (m.5/2-ç).
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white align-top">
                        İletişim Verisi
                      </td>
                      <td className="p-3.5 align-top">
                        E-posta adresi, isteğe bağlı web sitesi bilgisi ve ebeveyn denetimi
                        eşleştirme e-postası.
                      </td>
                      <td className="p-3.5 align-top">
                        Hesap doğrulaması (OTP), güvenlik bildirimleri ve sözleşmenin ifası
                        (m.5/2-c), hukuki yükümlülük (m.5/2-ç).
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white align-top">
                        Kullanıcı İşlem ve Üretim Verisi
                      </td>
                      <td className="p-3.5 align-top">
                        Gönderiler, yorumlar, projeler, topluluk üyelikleri, yarışma (Genç Lig /
                        Quiz) skorları, mesajlaşmalar.
                      </td>
                      <td className="p-3.5 align-top">
                        Platform hizmetlerinin sunulması (m.5/2-c) ve ilgili kişinin kendisi
                        tarafından alenileştirilmiş olması (m.5/2-d).
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white align-top">
                        Mavi Tik Doğrulama Verisi
                      </td>
                      <td className="p-3.5 align-top">
                        Başvuru kategorisi, özgünlük açıklaması, destekleyici bağlantılar ve
                        korumalı referans belge özetleri.
                      </td>
                      <td className="p-3.5 align-top">
                        Bir hakkın tesisi, kullanılması veya korunması (m.5/2-e) ve veri
                        sorumlusunun meşru menfaati (m.5/2-f).
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white align-top">
                        İşlem Güvenliği Verisi
                      </td>
                      <td className="p-3.5 align-top">
                        Argon2 parola özeti, IP özeti, oturum kayıtları, 2FA durumu, moderasyon ve
                        güvenlik denetim kayıtları.
                      </td>
                      <td className="p-3.5 align-top">
                        5651 sayılı Kanun ve bilgi güvenliği yükümlülüklerinin yerine getirilmesi
                        (m.5/2-a, m.5/2-ç) ve meşru menfaat (m.5/2-f).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  3
                </span>
                Kişisel Verilerin Toplanma Yöntemi
              </h2>
              <p>
                Kişisel verileriniz; Genç Sosyal web arayüzü ve mobil uyumlu uygulama ekranları
                üzerinden doldurduğunuz üyelik, profil düzenleme, proje oluşturma, mavi tik
                doğrulama başvurusu ve destek/itiraz formları aracılığıyla tamamen veya kısmen
                otomatik elektronik yöntemlerle toplanmaktadır.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  4
                </span>
                Kişisel Verilerin Aktarılması
              </h2>
              <p>
                Kişisel verileriniz üçüncü taraf reklam şirketlerine veya pazarlama kuruluşlarına
                kesinlikle aktarılmaz. Verileriniz yalnızca:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Kullanıcının kendi tercihiyle herkese açık (`PUBLIC`) olarak paylaştığı profil,
                  gönderi, topluluk ve proje içeriklerinin platform kullanıcılarına gösterilmesi,
                </li>
                <li>
                  Kanunen yetkili kamu kurum ve kuruluşlarının veya adli makamların mevzuata uygun
                  yazılı taleplerinin yerine getirilmesi (KVKK m. 8/2-a)
                </li>
              </ul>
              <p>amaçlarıyla sınırlı olarak paylaşılabilir.</p>
            </section>

            {/* Section 5: KVKK Article 11 Rights */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  5
                </span>
                İlgili Kişinin KVKK Madde 11 Kapsamındaki Hakları
              </h2>
              <p>KVKK&apos;nın 11. maddesi uyarınca veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {[
                  "Kişisel verilerinizin işlenip işlenmediğini öğrenme,",
                  "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,",
                  "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,",
                  "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,",
                  "Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,",
                  "KVKK m. 7’de öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme,",
                  "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,",
                  "Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] text-xs sm:text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Application Method */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                  6
                </span>
                Başvuru ve Hakların Kullanılması
              </h2>
              <p>
                KVKK kapsamındaki düzeltme, gizlilik tercihi değiştirme ve hesap/veri silme
                haklarınızı doğrudan <strong>Ayarlar</strong> menüsü içerisindeki{" "}
                <em>Profil</em>, <em>Hesap Güvenliği</em> ve <em>Gizlilik &amp; Engelleme</em>{" "}
                sekmelerinden anında kullanabilirsiniz. Ayrıca tüm veri sahibi başvurularınızı
                platform içi <strong>Ayarlar &gt; Yardım &amp; Destek</strong> modülü üzerinden
                veri sorumlusuna iletebilirsiniz. Başvurularınız niteliğine göre en geç 30 (otuz)
                gün içinde ücretsiz olarak sonuçlandırılır.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
