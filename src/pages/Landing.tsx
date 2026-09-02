import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  ArrowRight,
  Code2,
  Users,
  MessageSquare,
  Sparkles,
  Github,
  Rocket,
  ShieldCheck,
  Zap,
  LayoutTemplate
} from 'lucide-react';

export function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="w-full min-h-screen bg-white selection:bg-slate-900 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto pt-24 pb-20 px-6 sm:px-8 lg:px-12 flex flex-col items-center text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 text-slate-800 text-sm font-semibold mb-8"
        >
          <Sparkles className="w-4 h-4 text-slate-600" />
          <span>Genç Sosyal Yenilendi</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6 max-w-4xl leading-[1.05]"
        >
          Geleceği Kodlayan Gençlerin <br className="hidden sm:block" />
          <span className="text-slate-400">Buluşma Noktası.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-500 font-medium mb-10 max-w-2xl leading-relaxed"
        >
          Açık kaynak projelerini sergile, yazılım kulüplerini keşfet, takım arkadaşı bul ve sadece üreten gençlere özel bu teknoloji ağında yerini al.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link 
            to="/register" 
            className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Hemen Katıl
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            to="/explore" 
            className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-base hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center"
          >
            Platformu Keşfet
          </Link>
        </motion.div>
      </section>

      {/* 2. BENTO GRID FEATURES */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">Geliştirici Odaklı Üretildi</h2>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">Sıradan sosyal medyanın gürültüsünden uzak. Tamamen üretkenlik ve işbirliği üzerine tasarlandı.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Bento Box 1: Large */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-100 flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10 mb-8 max-w-md">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Proje Portföyün</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Geliştirdiğin yazılımları, GitHub repolarını ve tasarımlarını kendi özel alanında sergile. Diğer geliştiricilerden geri bildirim al.
              </p>
            </div>
            {/* Minimal UI Decor */}
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-64 h-64 bg-white rounded-full opacity-60 pointer-events-none blur-3xl"></div>
          </motion.div>

          {/* Bento Box 2: Tall */}
          <motion.div variants={itemVariants} className="bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col group overflow-hidden relative">
            <div className="relative z-10 mb-8">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Takımını Kur</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Teknofest, hackathon veya açık kaynak projelerin için nitelikli takım arkadaşları bul.
              </p>
            </div>
          </motion.div>

          {/* Bento Box 3: Standard */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col shadow-sm group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-colors">
              <MessageSquare className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Gerçek Zamanlı Sohbet</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Kulüp üyeleriyle veya proje arkadaşlarınla anında iletişim kur, fikirleri tartış.
            </p>
          </motion.div>

          {/* Bento Box 4: Standard */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col shadow-sm group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-colors">
              <Rocket className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Topluluklara Katıl</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              İlgi alanlarına özel toplulukları keşfet, etkinlikleri takip et ve ağını genişlet.
            </p>
          </motion.div>

          {/* Bento Box 5: Standard */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col shadow-sm group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-colors">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Temiz ve Güvenli</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Gelişmiş raporlama ve doğrulama sistemiyle toksik kitlelerden tamamen arındırılmış ortam.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* 3. METRICS / STATS (Clean text-based) */}
      <section className="w-full bg-slate-50 py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-slate-200/60">
            {[
              { value: "Modüler", label: "Profil Yapısı" },
              { value: "%100", label: "Açık Ekosistem" },
              { value: "Sıfır", label: "Gereksiz Algoritma" },
              { value: "Odaklı", label: "Üretkenlik" },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SPONSOR SECTION */}
      <section className="w-full max-w-7xl mx-auto py-24 px-6 sm:px-8 lg:px-12 text-center">
        <div className="inline-flex flex-col items-center">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">Altyapı Sponsorumuz</span>
          <a 
            href="https://www.bilhost.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="px-10 py-8 bg-white border border-slate-100 rounded-3xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
              <img 
                src="https://www.bilhost.com/assets/images/logo.svg" 
                alt="Bilhost Logo" 
                className="h-10 md:h-12 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
            </div>
          </a>
          <p className="text-slate-400 font-medium text-sm mt-6">
            Genç Sosyal'in kesintisiz altyapısı Bilhost tarafından sağlanmaktadır.
          </p>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pb-24">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Bize Katılmaya Hazır mısın?</h2>
            <p className="text-lg text-slate-400 mb-10 font-medium leading-relaxed">
              Fikirlerini gerçeğe dönüştüren gençlerin arasında yerini al. Kayıt olmak tamamen ücretsiz.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-base hover:bg-slate-100 transition-all shadow-xl"
              >
                Ücretsiz Hesap Oluştur
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-slate-700 transition-all border border-slate-700"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-100 py-10 text-center text-slate-500 font-medium text-sm">
        <p>&copy; {new Date().getFullYear()} Genç Sosyal. Tüm hakları saklıdır.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/terms" className="hover:text-slate-900 transition-colors">Kullanım Koşulları</Link>
          <Link to="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik Politikası</Link>
        </div>
      </footer>

    </div>
  );
}
