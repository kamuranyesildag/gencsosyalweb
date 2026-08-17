const fs = require('fs');

const landingContent = `import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  Hexagon, Users, Zap, Shield, Sparkles, Heart, Rocket, 
  Code, Smartphone, Globe, MessageCircle, Share2, 
  Bookmark, Bell, Search, Image as ImageIcon, Send, Github
} from 'lucide-react';

export function Landing() {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'profile'>('feed');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pb-12 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto pt-12 pb-20 px-4 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
          <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-200 relative z-10">
            <Hexagon className="w-16 h-16 fill-current" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]"
        >
          Gençlerin ürettiği, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">gençler için sosyal platform.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-500 font-medium mb-10 max-w-3xl leading-relaxed"
        >
          Fikirlerini özgürce paylaş, teknoloji topluluklarını keşfet ve projelerini sergile. Sınırların olmadığı modern bir ağ deneyimine hazır mısın?
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-10 relative"
        >
          <Link 
            to="/register" 
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Kayıt Ol
            <Sparkles className="w-5 h-5" />
          </Link>
          <a 
            href="#nasil-calisiyor" 
            className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            Nasıl Çalışıyor?
          </a>
        </motion.div>
      </section>

      {/* 2. SHOWCASE (MOCKUPS) */}
      <section id="nasil-calisiyor" className="w-full max-w-7xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-gray-900 rounded-[2.5rem] p-4 md:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Gerçek Bir Sosyal Deneyim</h2>
            <p className="text-gray-400 text-lg">Keşfetmeye hemen başlayın.</p>
          </div>

          {/* Interactive Mockup Tabs */}
          <div className="flex justify-center gap-2 mb-8 relative z-10 flex-wrap">
            <button onClick={() => setActiveTab('feed')} className={\`px-6 py-2.5 rounded-full font-bold text-sm transition-all \${activeTab === 'feed' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}\`}>Ana Akış</button>
            <button onClick={() => setActiveTab('messages')} className={\`px-6 py-2.5 rounded-full font-bold text-sm transition-all \${activeTab === 'messages' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}\`}>Mesajlaşma</button>
            <button onClick={() => setActiveTab('profile')} className={\`px-6 py-2.5 rounded-full font-bold text-sm transition-all \${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}\`}>Profil & Projeler</button>
          </div>

          {/* Mockup Container */}
          <div className="bg-gray-100 rounded-2xl md:rounded-[2rem] overflow-hidden border-8 border-gray-800 relative z-10 shadow-2xl max-w-4xl mx-auto min-h-[500px] flex">
            
            {/* Feed Mockup */}
            {activeTab === 'feed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col md:flex-row bg-gray-50 h-full">
                <div className="hidden md:flex flex-col w-64 p-4 border-r border-gray-200 gap-2 h-[500px] bg-white">
                  <div className="font-bold text-xl mb-4 flex items-center gap-2"><Hexagon className="text-indigo-600 w-6 h-6 fill-current"/> Genç Sosyal</div>
                  {['Ana Sayfa', 'Keşfet', 'Bildirimler', 'Mesajlar', 'Yer İmleri', 'Profil'].map((item, i) => (
                    <div key={i} className={\`p-3 rounded-xl font-semibold flex items-center gap-3 \${i === 0 ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}\`}>
                      <div className="w-5 h-5 rounded-md bg-current opacity-50"></div> {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4 md:p-6 overflow-hidden h-[500px]">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-10 bg-gray-50 rounded-xl mb-3 flex items-center px-4 text-gray-400 text-sm">Neler oluyor?</div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 text-indigo-500"><ImageIcon className="w-5 h-5"/></div>
                        <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold opacity-50">Paylaş</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 shrink-0"></div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">Ahmet Yılmaz <span className="font-normal text-gray-500">@ahmety</span></div>
                        <div className="text-sm text-gray-800 mt-1">Teknofest için hazırladığımız otonom araç projesinin ilk test sürüşünü başarıyla tamamladık! 🚀 🚗 #teknofest #deneyap</div>
                      </div>
                    </div>
                    <div className="w-full h-40 bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-purple-200 opacity-50"></div>
                    </div>
                    <div className="flex gap-6 text-gray-500">
                      <div className="flex items-center gap-1.5 text-sm hover:text-red-500"><Heart className="w-4 h-4"/> 1.2B</div>
                      <div className="flex items-center gap-1.5 text-sm hover:text-green-500"><Share2 className="w-4 h-4"/> 342</div>
                      <div className="flex items-center gap-1.5 text-sm hover:text-blue-500"><MessageCircle className="w-4 h-4"/> 89</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Messages Mockup */}
            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex bg-white h-[500px]">
                <div className="w-full md:w-80 border-r border-gray-100 flex flex-col">
                  <div className="p-4 border-b border-gray-100 font-bold text-lg">Mesajlar</div>
                  <div className="p-4">
                    <div className="bg-gray-100 p-2.5 rounded-xl flex items-center gap-2 text-gray-400 text-sm">
                      <Search className="w-4 h-4" /> Kullanıcı ara...
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={\`p-4 flex gap-3 items-center border-b border-gray-50 cursor-pointer \${i === 1 ? 'bg-indigo-50/50' : ''}\`}>
                        <div className={\`w-12 h-12 rounded-full shrink-0 \${i===1 ? 'bg-pink-500' : 'bg-gray-300'}\`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <div className="font-bold text-sm truncate text-gray-900">Zeynep K.</div>
                            <div className="text-xs text-gray-400">12:45</div>
                          </div>
                          <div className="text-xs text-gray-500 truncate">Proje kodlarını GitHub'a pushladım...</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden md:flex flex-1 flex-col bg-gray-50">
                  <div className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-pink-500 shrink-0"></div>
                    <div className="font-bold text-gray-900">Zeynep K.</div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col gap-4">
                    <div className="self-start bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm text-sm">
                      Selam, dünkü toplantıdaki notları inceledin mi?
                    </div>
                    <div className="self-end bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm text-sm">
                      Evet, az önce baktım. API entegrasyonu tarafı gayet temiz görünüyor.
                    </div>
                    <div className="self-start bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm text-sm">
                      Süper! Proje kodlarını GitHub'a pushladım, kontrol edebilirsin. 🚀
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t border-gray-100">
                    <div className="bg-gray-100 rounded-full flex items-center px-4 py-2 gap-3">
                      <input type="text" placeholder="Bir mesaj yaz..." className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900 py-1" readOnly/>
                      <div className="bg-indigo-600 p-2 rounded-full text-white"><Send className="w-4 h-4"/></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Mockup */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-[500px] overflow-hidden bg-white">
                <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                <div className="px-6 relative pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-24 h-24 bg-white rounded-full p-1 -mt-12 relative z-10 border-4 border-white shadow-sm">
                      <div className="w-full h-full bg-indigo-500 rounded-full"></div>
                    </div>
                    <div className="border border-gray-200 rounded-full px-4 py-1.5 text-sm font-bold text-gray-900">Profili Düzenle</div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Yazılım Geliştirici</h2>
                    <p className="text-gray-500 text-sm">@dev_gencc</p>
                  </div>
                  <p className="mt-3 text-sm text-gray-800">
                    Full-stack developer. Open source meraklısı. T3 Vakfı Gönüllüsü & Deneyap Eğitmeni 💻🚀
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><Github className="w-4 h-4"/> github.com/devgencc</div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="text-sm"><span className="font-bold text-gray-900">1.2B</span> Takipçi</div>
                    <div className="text-sm"><span className="font-bold text-gray-900">250</span> Takip Edilen</div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                  <div className="bg-gray-100 h-24 rounded-xl border border-gray-200"></div>
                  <div className="bg-gray-100 h-24 rounded-xl border border-gray-200"></div>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </section>

      {/* 3. YOUTH SECTION */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4">
        <div className="bg-indigo-50 rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full blur-[80px] opacity-50 pointer-events-none"></div>
          
          <div className="flex-1 relative z-10">
            <div className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-full inline-block text-sm mb-6 shadow-sm border border-indigo-100">
              Üreten Gençler İçin
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Kendi Projelerini Sergile, <br/>Topluluklara Katıl</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
              Teknoloji tutkunu gençler için özel olarak tasarlanmış bir deneyim. Öğrenci projeleri, teknoloji takımları, atölye çalışmaları ve yeteneklerini sergileyebileceğin modern bir platform.
            </p>
            <ul className="space-y-4">
              {[
                'GitHub profillerini entegre et',
                'Teknofest, Deneyap ve diğer teknoloji projelerini paylaş',
                'İlgi alanına göre yazılım, tasarım veya donanım toplulukları bul',
                'Eğitmenler ve diğer geliştiricilerle doğrudan iletişim kur'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 w-full relative z-10 hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Code className="w-6 h-6"/></div>
                  <h4 className="font-bold text-gray-900 mb-1">Yazılım Kulüpleri</h4>
                  <p className="text-sm text-gray-500">Kodlarını paylaş, PR review iste.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4"><Rocket className="w-6 h-6"/></div>
                  <h4 className="font-bold text-gray-900 mb-1">Teknofest Takımları</h4>
                  <p className="text-sm text-gray-500">Takım arkadaşı bul, güncellemeleri duyur.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Zap className="w-6 h-6"/></div>
                  <h4 className="font-bold text-gray-900 mb-1">Deneyap Atölyeleri</h4>
                  <p className="text-sm text-gray-500">Projelerini geniş kitlelere tanıt.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><Users className="w-6 h-6"/></div>
                  <h4 className="font-bold text-gray-900 mb-1">T3 Vakfı Gönüllüleri</h4>
                  <p className="text-sm text-gray-500">Gönüllü ağındaki arkadaşlarınla iletişimde kal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">İhtiyacın Olan Her Şey</h2>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">Sade, güçlü ve kullanıcı dostu arayüz. Genç Sosyal, bir sosyal medyadan beklediğin tüm temel özellikleri en yüksek performansta sunar.</p>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: <Image className="w-6 h-6"/>, title: 'Gönderi Paylaşımı', desc: 'Metin, resim veya linkleri anında takipçilerinle paylaş.' },
            { icon: <Heart className="w-6 h-6"/>, title: 'Beğeni ve Etkileşim', desc: 'İçerikleri beğen, yorum yap, fikirlerini özgürce belirt.' },
            { icon: <Share2 className="w-6 h-6"/>, title: 'Repost Sistemi', desc: 'Beğendiğin içerikleri kendi profilinde tekrar paylaş.' },
            { icon: <MessageCircle className="w-6 h-6"/>, title: 'Özel Mesajlaşma', desc: 'Arkadaşlarınla gerçek zamanlı ve güvenli şekilde konuş.' },
            { icon: <Search className="w-6 h-6"/>, title: 'Akıllı Keşfet', desc: 'Trendleri ve yeni insanları kolayca bul.' },
            { icon: <Bell className="w-6 h-6"/>, title: 'Anında Bildirim', desc: 'Hesabınla ilgili hiçbir gelişmeyi kaçırma.' },
            { icon: <Bookmark className="w-6 h-6"/>, title: 'Yer İmleri', desc: 'Önemli içerikleri kaydet, sonra tekrar oku.' },
            { icon: <Shield className="w-6 h-6"/>, title: 'Gizlilik Kontrolleri', desc: 'Profilini kimlerin göreceğine sen karar ver.' },
          ].map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants} className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-all text-left group">
              <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {idx === 0 ? <ImageIcon className="w-6 h-6" /> : feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. SOCIAL PROOF & CTA */}
      <section className="w-full py-20 px-4 mt-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-tr from-indigo-900 to-purple-900 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Kendi topluluğunu oluşturmaya hazır mısın?</h2>
            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto font-medium">Gençler için tasarlandı. Üreten gençlerin buluşma noktası olan Genç Sosyal'de hemen yerini al.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-white text-indigo-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Hemen Ücretsiz Kayıt Ol
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-white/10 text-white backdrop-blur-md border border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
              >
                Zaten hesabın var mı?
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
`
fs.writeFileSync('src/pages/Landing.tsx', landingContent);
console.log("Generated new Landing.tsx");
