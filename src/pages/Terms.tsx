import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Shield, FileText } from "lucide-react";
import { Button } from "../components/ui/Button";

export function Terms() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Hizmet Şartları | Genç Sosyal";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50 py-6 sm:py-10 px-4">
      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden w-full max-w-3xl mx-auto">
        <div className="border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Geri"
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Hizmet Şartları
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 sm:p-10 text-slate-700 leading-relaxed text-sm sm:text-base space-y-8">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              1. Genel Hükümler ve Hizmetin Tanımı
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Genç Sosyal platformuna hoş geldiniz. Bu Kullanım Şartları ("Şartlar"), Genç Sosyal
              platformuna erişiminizi ve kullanımınızı düzenler. Hizmetimizi kullanarak bu şartlara
              uymayı kabul etmiş sayılırsınız. Genç Sosyal, gençlerin projelerini sergilediği, içerik
              ürettiği ve topluluk kurduğu güvenli ve modern bir sosyal altyapıdır.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              2. Hesap Güvenliği ve Kullanıcı Sorumlulukları
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Platforma üye olurken doğru ve güncel bilgiler sağlamakla yükümlüsünüz. Hesabınızın ve
              şifrenizin güvenliğini sağlamak tamamen sizin sorumluluğunuzdadır. Hesabınız üzerinden
              gerçekleştirilen tüm işlemlerden sorumlu olduğunuzu unutmayınız.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              3. İçerik ve Fikri Mülkiyet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Platformda paylaştığınız tüm içeriklerin (yazı, görsel, proje vb.) mülkiyeti size
              aittir. Başkalarının fikri mülkiyet ve telif haklarını ihlal eden içerikler paylaşmak
              kesinlikle yasaktır.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              4. Topluluk Standartları ve Yasaklı Davranışlar
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              <li>Nefret söylemi, taciz, zorbalık ve şiddet teşviki yasaktır.</li>
              <li>Otomasyon araçları ile spam veya kötüye kullanım amaçlı trafik üretilemez.</li>
              <li>Kullanıcıların gizliliğini ihlal eden kişisel veriler paylaşılamaz.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              5. Moderasyon ve Fesih
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Genç Sosyal, kurallara uymayan veya platform huzurunu bozan hesap ve içerikleri
              uyarıda bulunmaksızın askıya alma veya silme hakkını saklı tutar.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
