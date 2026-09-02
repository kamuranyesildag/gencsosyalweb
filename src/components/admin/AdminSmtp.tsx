import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Send, 
  Save, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Lock,
  Key,
  Info
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Skeleton, SkeletonText } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { toast } from '../ui/Toast';
import { fetchApi } from '../../lib/api';
import { fadeInVariants, slideUpVariants } from '../../lib/motion';

export function AdminSmtp() {
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    passConfigured: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);

  const loadSmtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi('/admin/smtp');
      const json = await res.json();
      if (json.data) {
        setSmtpConfig({
          ...json.data,
          pass: '', // Don't expose password
        });
      }
    } catch (err: any) {
      console.error('Failed to load SMTP config:', err);
      setError(err.message || 'SMTP yapılandırması yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSmtp();
  }, []);

  const handleSmtpSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...smtpConfig };
      if (!payload.pass) delete payload.pass;

      const res = await fetchApi('/admin/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('SMTP ayarları başarıyla kaydedildi.');
        loadSmtp();
      } else {
        const json = await res.json();
        throw new Error(json.error?.message || 'Kaydedilemedi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'SMTP ayarları kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleSmtpTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      toast.error('Lütfen hedef test e-posta adresini girin.');
      return;
    }

    setTestingSmtp(true);
    try {
      const res = await fetchApi('/admin/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Test e-postası başarıyla gönderildi! Gelen kutunuzu kontrol edin.');
      } else {
        throw new Error(json.error?.message || 'SMTP bağlantısı başarısız oldu.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Test e-postası gönderilemedi. Bilgileri kontrol edin.');
    } finally {
      setTestingSmtp(false);
    }
  };

  const fromName = smtpConfig.from?.split('<')[0]?.replace(/"/g, '').trim() || 'Genç Sosyal';
  const fromEmail = smtpConfig.from?.match(/<(.+)>/)?.[1] || 'noreply@gencsosyal.com';

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-slate-900" />
            <span>SMTP ve E-posta Yapılandırması</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kayıt doğrulama, şifre sıfırlama ve sistem bildirim e-postaları için SMTP sunucusu ayarlarını yönetin.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          onClick={loadSmtp}
        >
          Yenile
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          title="SMTP Ayarları Yüklenemedi"
          message={error}
          onRetry={loadSmtp}
        />
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card variant="default" padding="lg" className="lg:col-span-8 space-y-4">
            <Skeleton className="h-6 w-48 rounded-md" />
            <SkeletonText lines={6} />
          </Card>
          <Card variant="default" padding="lg" className="lg:col-span-4 space-y-4">
            <Skeleton className="h-6 w-36 rounded-md" />
            <SkeletonText lines={4} />
          </Card>
        </div>
      )}

      {/* Forms Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main SMTP Configuration Form */}
          <Card variant="default" padding="lg" className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sunucu Yapılandırması</h3>
                <p className="text-xs text-slate-500 font-medium">Posta iletim sunucusuna ait bağlantı parametreleri</p>
              </div>
              <Badge variant="default" size="sm" icon={<Server className="w-3 h-3" />}>
                SMTP Protokolü
              </Badge>
            </div>

            <form onSubmit={handleSmtpSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <Input
                    label="SMTP Host (Sunucu Adresi)"
                    placeholder="smtp.gmail.com, mail.domain.com vb."
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <Input
                    label="Port Numarası"
                    type="number"
                    placeholder="587 / 465"
                    value={smtpConfig.port}
                    onChange={(e) =>
                      setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) || 587 })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <Select
                    label="Güvenlik Modu (SSL / TLS)"
                    value={smtpConfig.secure ? 'true' : 'false'}
                    onChange={(e) =>
                      setSmtpConfig({ ...smtpConfig, secure: e.target.value === 'true' })
                    }
                    options={[
                      { value: 'false', label: 'STARTTLS / TLS (Port 587/25)' },
                      { value: 'true', label: 'SSL / TLS (Port 465)' },
                    ]}
                  />
                </div>

                <div className="sm:col-span-6">
                  <Input
                    label="SMTP Kullanıcı Adı (Username)"
                    placeholder="noreply@domain.com veya API Key"
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Input
                  label="SMTP Şifre (Password / App Password)"
                  type="password"
                  placeholder={
                    smtpConfig.passConfigured
                      ? '•••••••••••• (Değiştirmek için yeni şifre yazın)'
                      : 'SMTP hesap şifresi veya uygulama şifresi'
                  }
                  value={smtpConfig.pass}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                {smtpConfig.passConfigured && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Şifre tanımlı (Güvenlik nedeniyle maskelenmiştir)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <Input
                  label="Gönderen İsmi (From Name)"
                  placeholder="Genç Sosyal"
                  value={fromName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setSmtpConfig({
                      ...smtpConfig,
                      from: `"${newName}" <${fromEmail}>`,
                    });
                  }}
                />

                <Input
                  label="Gönderen E-posta (From Email)"
                  type="email"
                  placeholder="noreply@gencsosyal.com"
                  value={fromEmail}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setSmtpConfig({
                      ...smtpConfig,
                      from: `"${fromName}" <${newEmail}>`,
                    });
                  }}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={saving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  SMTP Ayarlarını Kaydet
                </Button>
              </div>
            </form>
          </Card>

          {/* Test Email Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Bağlantıyı Test Et</h3>
                <p className="text-xs text-slate-500 font-medium">Yapılandırılmış sunucu üzerinden anlık deneme e-postası yollayın.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-900" /> Test E-postası Hakkında
                </div>
                <p>
                  Sistem, belirtilen e-posta adresine Genç Sosyal markalı HTML test mesajı gönderecektir.
                </p>
              </div>

              <form onSubmit={handleSmtpTest} className="space-y-4">
                <Input
                  label="Hedef Test E-posta Adresi"
                  type="email"
                  placeholder="adiniz@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={!testEmail.trim() || testingSmtp}
                  isLoading={testingSmtp}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Test E-postası Gönder
                </Button>
              </form>
            </Card>

            <Card variant="flat" padding="md" className="space-y-2.5 text-xs text-slate-600">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Güvenlik İpuçları
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-500 leading-relaxed">
                <li>Gmail için 2 Adımlı Doğrulama ve <strong>Uygulama Şifresi</strong> gereklidir.</li>
                <li>Port 587 STARTTLS için, Port 465 SSL şifreleme için standarttır.</li>
                <li>Şifreler veritabanında güvenli şekilde saklanmaktadır.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
