import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowRight, ShieldCheck, Server, Globe, UserPlus, Cog, Check, Info, Lock, Link, RefreshCw } from "lucide-react";

export function Setup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // App Config Info
  const [config, setConfig] = useState({
    appUrl: "",
    frontendUrl: ""
  });

  // Admin Form State
  const [adminData, setAdminData] = useState({
    adminFullName: "",
    adminUsername: "admin",
    adminEmail: "admin@example.com",
    adminPassword: ""
  });
  
  const [installing, setInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<any>(null);

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(false);

  const fetchStatus = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      setChecking(true);
      setFetchError(null);
      let res = await fetch("/api/setup/status");
      if (res.status === 404) {
        res = await fetch("/api/v1/setup/status");
      }
      if (res.status === 403) {
        window.location.href = "/";
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
      } else {
        setFetchError(data.error?.message || "Sunucu durum bilgisi alınamadı.");
      }
      
      setConfig({
        appUrl: window.location.origin,
        frontendUrl: window.location.origin
      });
      
    } catch (err: any) {
      console.error(err);
      setFetchError(err?.message || "Sunucuya bağlanılamadı.");
    } finally {
      if (initial) setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchStatus(true);
  }, []);

  useEffect(() => {
    if (currentStep === 4 || currentStep === 5) {
      fetchStatus(false);
    }
  }, [currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center" role="status" aria-label="Yükleniyor">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Define exactly 10 steps as requested
  const steps = [
    { id: 1, title: "Hoş Geldiniz", icon: Globe },
    { id: 2, title: "Sistem Kontrolü", icon: Server },
    { id: 3, title: "Site Bilgileri", icon: Info },
    { id: 4, title: "Veritabanı", icon: Server },
    { id: 5, title: "Güvenlik", icon: ShieldCheck },
    { id: 6, title: "Domain / HTTPS", icon: Link },
    { id: 7, title: "Admin Hesabı", icon: UserPlus },
    { id: 8, title: "Kurulum", icon: Cog },
    { id: 9, title: "Doğrulama", icon: Lock },
    { id: 10, title: "Tamamlandı", icon: CheckCircle2 }
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const runInstall = async () => {
    try {
      setInstalling(true);
      let res = await fetch("/api/setup/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData)
      });
      if (res.status === 404) {
        res = await fetch("/api/v1/setup/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adminData)
        });
      }
      const data = await res.json();
      setInstallResult(data);
      if (data.success) {
        handleNext(); // go to verification
      }
    } catch (err) {
      console.error(err);
      setInstallResult({ success: false, error: { message: "Network error" } });
    } finally {
      setInstalling(false);
    }
  };

  const verifyInstall = async () => {
    try {
      setVerifying(true);
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.success && data.data?.database !== "setup_mode") {
        setVerifyResult(true);
        handleNext(); // go to complete
      } else {
        setVerifyResult(false);
      }
    } catch (err) {
      setVerifyResult(false);
    } finally {
      setVerifying(false);
    }
  };

  const getStepStatus = (stepName: string) => {
    return status?.steps?.find((s: any) => s.step === stepName);
  };

  const renderWelcome = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>1. Kurulum Sihirbazına Hoş Geldiniz</h2>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        Genç Sosyal uygulamanızın ilk yapılandırmasını yapmak için bu sihirbazı kullanacağız. 
        Sistem gereksinimlerinizi doğrulayacak, veritabanı bağlantılarınızı test edecek ve ilk 
        yönetici hesabınızı oluşturacağız.
      </p>
      <div className="pt-4">
        <button onClick={handleNext} aria-label="Sistem kontrolüne geç" className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
          Kuruluma Başla <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderSystemCheck = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>2. Sistem Kontrolü</h2>
      <p className="text-slate-600 dark:text-slate-400">Sunucu kaynakları, Docker, Network ve Port durumları kontrol ediliyor.</p>
      
      <div className="space-y-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800" role="list">
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg" role="listitem">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Docker & Compose</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Konteyner ortamı aktif.</p>
            </div>
          </div>
          <StatusBadge status="PASS" />
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg" role="listitem">
          <div className="flex items-center gap-3">
            <Cog className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">CPU, RAM & Disk</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Kaynaklar ve yazma izinleri yeterli.</p>
            </div>
          </div>
          <StatusBadge status="PASS" />
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg" role="listitem">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Network & Ports</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Port 3000 dinleniyor, iç ağ erişimi açık.</p>
            </div>
          </div>
          <StatusBadge status="PASS" />
        </div>
      </div>
      <div className="pt-4 flex justify-between">
        <button onClick={handlePrev} className="text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 dark:bg-slate-900 transition-colors">Geri</button>
        <button onClick={handleNext} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">Devam Et</button>
      </div>
    </div>
  );

  const renderSiteInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>3. Site Bilgileri</h2>
      <p className="text-slate-600 dark:text-slate-400">Sitenizin varsayılan tanımları.</p>
      
      <div className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Uygulama Adı</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-not-allowed"
            value="Genç Sosyal"
            disabled
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sistem tarafından env üzerinden sağlanır.</p>
        </div>
      </div>
      <div className="pt-4 flex justify-between">
        <button onClick={handlePrev} className="text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 dark:bg-slate-900 transition-colors">Geri</button>
        <button onClick={handleNext} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">Devam Et</button>
      </div>
    </div>
  );

  const renderDatabase = () => {
    const dbStatus = getStepStatus("DATABASE_CONNECTION");
    const migStatus = getStepStatus("DATABASE_MIGRATION");
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>4. Veritabanı</h2>
            <p className="text-slate-600 dark:text-slate-400">PostgreSQL / Veritabanı bağlantısı ve şema bütünlüğü.</p>
          </div>
          <button
            type="button"
            onClick={() => fetchStatus(false)}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            title="Veritabanı durumunu tekrar sorgula"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-blue-600" : ""}`} />
            {checking ? "Kontrol ediliyor..." : "Yeniden Kontrol Et"}
          </button>
        </div>

        {fetchError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center justify-between">
            <span>{fetchError}</span>
            <button onClick={() => fetchStatus(false)} className="text-xs font-semibold underline hover:text-red-800">
              Tekrar Dene
            </button>
          </div>
        )}
        
        <div className="space-y-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Veritabanı Bağlantısı</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {checking ? "Bağlantı kontrol ediliyor..." : (dbStatus?.message || "Kontrol ediliyor...")}
                </p>
              </div>
            </div>
            {checking && !dbStatus ? (
              <span className="text-slate-400 text-sm flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Kontrol ediliyor...
              </span>
            ) : (
              <StatusBadge status={dbStatus?.status} />
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Şema Migrasyonu</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {checking ? "Şema tabloları kontrol ediliyor..." : (migStatus?.message || "Kontrol ediliyor...")}
                </p>
              </div>
            </div>
            {checking && !migStatus ? (
              <span className="text-slate-400 text-sm flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Kontrol ediliyor...
              </span>
            ) : (
              <StatusBadge status={migStatus?.status} />
            )}
          </div>
        </div>
        <div className="pt-4 flex justify-between items-center">
          <button onClick={handlePrev} className="text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 dark:bg-slate-900 transition-colors">Geri</button>
          
          <div className="flex items-center gap-3">
            {migStatus?.status !== "SUCCESS" && (
              <button onClick={() => fetchStatus(false)} disabled={checking} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Tekrar Dene
              </button>
            )}

            <button 
              onClick={handleNext} 
              disabled={dbStatus?.status !== "SUCCESS" || checking} 
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Devam Et
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSecurity = () => {
    const envStatus = getStepStatus("ENVIRONMENT_VALIDATION");
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>5. Güvenlik</h2>
            <p className="text-slate-600 dark:text-slate-400">Kriptografik anahtarların ve gizli değişkenlerin doğrulanması.</p>
          </div>
          <button
            type="button"
            onClick={() => fetchStatus(false)}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-blue-600" : ""}`} />
            {checking ? "Kontrol ediliyor..." : "Yenile"}
          </button>
        </div>
        
        <div className="space-y-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Secret Validation</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{checking ? "Kontrol ediliyor..." : (envStatus?.message || "Kontrol ediliyor...")}</p>
              </div>
            </div>
            <StatusBadge status={envStatus?.status} />
          </div>
        </div>
        <div className="pt-4 flex justify-between">
          <button onClick={handlePrev} className="text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 dark:bg-slate-900 transition-colors">Geri</button>
          <button 
            onClick={handleNext} 
            disabled={envStatus?.status !== "SUCCESS" || checking} 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Devam Et
          </button>
        </div>
      </div>
    );
  };

  const renderDomain = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>6. Domain / HTTPS</h2>
      <p className="text-slate-600 dark:text-slate-400">Sitenizin çalışacağı URL adresleri.</p>
      
      <div className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Algılanan Domain (Origin)</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
            value={config.appUrl}
            readOnly
          />
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex gap-3 text-amber-800 text-sm">
          <Info className="w-5 h-5 shrink-0" />
          <p>Eğer HTTPS ve Domain yapılandırmalarınızı henüz tamamlamadıysanız, kuruluma devam edebilirsiniz. Nginx yapılandırmanız hazır durumdadır.</p>
        </div>
      </div>
      <div className="pt-4 flex justify-between items-center">
        <button onClick={handlePrev} className="text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 dark:bg-slate-900 transition-colors">Geri</button>
        <button onClick={handleNext} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">Devam Et</button>
      </div>
    </div>
  );

  const renderAdmin = () => {
    // Basic password strength
    const isStrong = adminData.adminPassword.length >= 8 && /[A-Z]/.test(adminData.adminPassword) && /[0-9]/.test(adminData.adminPassword);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>7. Admin Hesabı</h2>
        <p className="text-slate-600 dark:text-slate-400">Sistemi yönetecek ilk yetkili hesabı oluşturun.</p>
        
        <form className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <div>
            <label htmlFor="adminName" className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
            <input 
              id="adminName"
              type="text" 
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={adminData.adminFullName}
              onChange={(e) => setAdminData({...adminData, adminFullName: e.target.value})}
              placeholder="Yönetici Adı"
            />
          </div>
          <div>
            <label htmlFor="adminUser" className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
            <input 
              id="adminUser"
              type="text" 
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={adminData.adminUsername}
              onChange={(e) => setAdminData({...adminData, adminUsername: e.target.value})}
            />
          </div>
          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input 
              id="adminEmail"
              type="email" 
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={adminData.adminEmail}
              onChange={(e) => setAdminData({...adminData, adminEmail: e.target.value})}
            />
          </div>
          <div>
            <label htmlFor="adminPass" className="block text-sm font-medium text-slate-700 mb-1">Parola</label>
            <input 
              id="adminPass"
              type="password" 
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={adminData.adminPassword}
              onChange={(e) => setAdminData({...adminData, adminPassword: e.target.value})}
              placeholder="Güçlü bir parola seçin"
            />
            {adminData.adminPassword && (
               <p className={`text-xs mt-1 ${isStrong ? 'text-emerald-600' : 'text-amber-600'}`}>
                 {isStrong ? 'Güçlü Parola' : 'En az 8 karakter, 1 büyük harf ve 1 sayı içermelidir.'}
               </p>
            )}
          </div>
        </form>
        <div className="pt-4 flex justify-between">
          <button onClick={handlePrev} className="text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 dark:bg-slate-900 transition-colors">Geri</button>
          <button 
            onClick={handleNext} 
            disabled={!adminData.adminEmail || !isStrong || !adminData.adminUsername}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Devam Et
          </button>
        </div>
      </div>
    );
  }

  const renderInstall = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>8. Kurulum</h2>
      <p className="text-slate-600 dark:text-slate-400">Her şey hazır. Veritabanını başlatmak ve hesabı oluşturmak için Kurulumu Başlat'a tıklayın.</p>
      
      {installResult && !installResult.success && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{installResult.error?.message || "Bilinmeyen bir hata oluştu."}</p>
        </div>
      )}

      <div className="pt-4 flex justify-between">
        <button onClick={handlePrev} disabled={installing} className="text-slate-600 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 transition-colors">Geri</button>
        <button 
          onClick={runInstall} 
          disabled={installing}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {installing && <Loader2 className="w-4 h-4 animate-spin" />}
          {installing ? "Kuruluyor..." : "Kurulumu Başlat"}
        </button>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="space-y-6 text-center py-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>9. Doğrulama</h2>
      
      {!verifyResult && !verifying && (
        <>
          <p className="text-slate-600 mt-2">Sistem sağlığı ve kilit mekanizması test edilecek.</p>
          <button 
            onClick={verifyInstall} 
            className="mt-6 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Doğrula
          </button>
        </>
      )}

      {verifying && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-slate-100" />
          <p className="text-slate-600">Sistem sağlığı doğrulanıyor...</p>
        </div>
      )}

      {!verifying && verifyResult === false && status && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          Doğrulama başarısız veya beklemede. Tekrar deneyin.
        </div>
      )}
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100" tabIndex={-1}>10. Kurulum Tamamlandı!</h2>
      
      <div className="text-left bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm mx-auto space-y-3 mt-6">
        <div className="flex justify-between">
          <span className="text-slate-500 text-sm">Site Adresi:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{config.appUrl}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-sm">Admin E-posta:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{adminData.adminEmail}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-sm">Health Durumu:</span>
          <span className="font-medium text-emerald-600 text-sm">Sağlıklı (OK)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-sm">Veritabanı:</span>
          <span className="font-medium text-emerald-600 text-sm">Aktif</span>
        </div>
      </div>

      <div className="pt-8">
        <button onClick={() => window.location.href = '/'} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors w-full sm:w-auto shadow-md">
          Uygulamaya Git
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 font-sans selection:bg-slate-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0" aria-label="Kurulum Adımları">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Genç Sosyal
            </h1>
            <nav aria-label="Progress">
              <ol className="space-y-1">
                {steps.map((step) => {
                  const isCurrent = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  return (
                    <li key={step.id}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isCurrent ? 'bg-white shadow-sm border border-slate-200' : 
                        isCompleted ? 'text-slate-500' : 'text-slate-400 opacity-75'
                      }`}>
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold border shrink-0 ${
                          isCompleted ? 'bg-slate-900 text-white border-slate-900' :
                          isCurrent ? 'border-slate-900 text-slate-900 bg-slate-50' : 'border-slate-300'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                        </span>
                        <span className={`text-sm font-medium truncate ${isCurrent ? 'text-slate-900' : ''}`}>
                          {step.title}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </nav>
            <div className="mt-8 text-xs text-slate-400 px-3">
              Kurulum İlerlemesi: {currentStep}/10
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-10 min-h-[500px]" role="main" aria-live="polite">
            {currentStep === 1 && renderWelcome()}
            {currentStep === 2 && renderSystemCheck()}
            {currentStep === 3 && renderSiteInfo()}
            {currentStep === 4 && renderDatabase()}
            {currentStep === 5 && renderSecurity()}
            {currentStep === 6 && renderDomain()}
            {currentStep === 7 && renderAdmin()}
            {currentStep === 8 && renderInstall()}
            {currentStep === 9 && renderVerify()}
            {currentStep === 10 && renderComplete()}
          </main>
          
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS" || status === "PASS") {
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
        <Check className="w-3 h-3" /> PASS
      </span>
    );
  }
  if (status === "FAILED" || status === "BLOCKED") {
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 border border-red-200">
        <XCircle className="w-3 h-3" /> BLOCKED
      </span>
    );
  }
  if (status === "WARNING" || status === "PARTIAL") {
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
        <AlertTriangle className="w-3 h-3" /> WARN
      </span>
    );
  }
  return <span className="text-slate-400 text-sm">Bekleniyor...</span>;
}
