import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";

export function Privacy() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Gizlilik Politikası | Genç Sosyal";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 py-6 sm:py-10 px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden w-full max-w-3xl mx-auto">
        <div className="border-b border-slate-100 p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Geri"
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Gizlilik Politikası
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-900">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 sm:p-10 text-slate-700 leading-relaxed text-sm sm:text-base space-y-8">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              1. Genel Bilgilendirme
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Genç Sosyal olarak kişisel verilerinizin gizliliğine ve güvenliğine en üst düzeyde
              önem veriyoruz. Bu politika, platformu kullandığınızda verilerinizin nasıl toplandığını,
              işlendiğini ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              2. Toplanan Veriler
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm sm:text-base">
              <li>
                <strong className="text-slate-900">Hesap Bilgileri:</strong> Kullanıcı adı, e-posta
                adresi, ad soyad ve isteğe bağlı profil detayları.
              </li>
              <li>
                <strong className="text-slate-900">İçerik ve Etkileşim:</strong> Gönderileriniz,
                yorumlarınız, projeleriniz, beğenileriniz ve mesajlarınız.
              </li>
              <li>
                <strong className="text-slate-900">Teknik Loglar:</strong> Güvenlik ve performans
                amacıyla toplanan erişim ve cihaz kayıtları.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              3. Çerezler ve Oturum Yönetimi
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Platformumuzda yalnızca oturum doğrulaması ve kullanıcı tercihlerini hatırlamak
              amacıyla gerekli güvenlik çerezleri kullanılmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              4. Veri Güvenliği ve Haklarınız
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Verileriniz endüstri standardı şifreleme yöntemleriyle korunur. Dilediğiniz zaman
              hesabınızı silebilir veya verilerinizin silinmesini talep edebilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
