import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Send,
  Save,
  ShieldCheck,
  Server,
  CheckCircle2,
  RefreshCw,
  Lock,
  Info,
  Eye,
  Monitor,
  Smartphone,
  Sparkles,
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
import { fadeInVariants } from '../../lib/motion';

interface EmailTemplateDescriptor {
  id: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  isNew?: boolean;
}

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

  // Template preview gallery state
  const [templates, setTemplates] = useState<EmailTemplateDescriptor[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('welcome');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  const loadSmtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const [smtpRes, templatesRes] = await Promise.all([
        fetchApi('/admin/smtp'),
        fetchApi('/admin/smtp/templates'),
      ]);
      const smtpJson = await smtpRes.json();
      if (smtpJson.data) {
        setSmtpConfig({
          ...smtpJson.data,
          pass: '',
        });
      }
      if (templatesRes.ok) {
        const templatesJson = await templatesRes.json();
        if (Array.isArray(templatesJson.data)) {
          setTemplates(templatesJson.data);
        }
      }
    } catch (err: any) {
      console.error('Failed to load SMTP config:', err);
      setError(err.message || 'SMTP yapılandırması yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplatePreview = async (templateId: string) => {
    setLoadingPreview(true);
    try {
      const res = await fetchApi(`/admin/smtp/templates/${encodeURIComponent(templateId)}/preview`);
      const json = await res.json();
      if (res.ok && json.data) {
        setPreviewHtml(json.data.html || '');
        setPreviewSubject(json.data.descriptor?.subject || '');
      }
    } catch (err) {
      console.error('Failed to load email template preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    loadSmtp();
  }, []);

  useEffect(() => {
    if (!loading && !error && selectedTemplateId) {
      loadTemplatePreview(selectedTemplateId);
    }
  }, [selectedTemplateId, loading, error]);

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

  const handleSmtpTest = async (e: React.FormEvent, templateIdOverride?: string) => {
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
        body: JSON.stringify({
          email: testEmail.trim(),
          templateId: templateIdOverride || 'smtp_test',
        }),
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
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId);

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
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>SMTP ve E-posta Şablonları</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            SMTP sunucusunu yönetin, modern Genç Sosyal bildirim e-posta şablonlarını canlı önizleyin ve test gönderimi yapın.
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main SMTP Configuration Form */}
            <Card variant="default" padding="lg" className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Sunucu Yapılandırması</h3>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Bağlantıyı Test Et</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Yapılandırılmış sunucu üzerinden anlık deneme e-postası yollayın.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/70 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Test E-postası Hakkında
                  </div>
                  <p>
                    Sistem, belirtilen e-posta adresine yeni nesil Genç Sosyal HTML tasarım şablonuyla anlık test e-postası gönderir.
                  </p>
                </div>

                <form onSubmit={(e) => handleSmtpTest(e, 'smtp_test')} className="space-y-4">
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
                    SMTP Testi Gönder
                  </Button>
                </form>
              </Card>

              <Card variant="flat" padding="md" className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Güvenlik İpuçları
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 leading-relaxed">
                  <li>Gmail için 2 Adımlı Doğrulama ve <strong>Uygulama Şifresi</strong> gereklidir.</li>
                  <li>Port 587 STARTTLS için, Port 465 SSL şifreleme için standarttır.</li>
                  <li>Şifreler veritabanında şifrelenerek saklanmaktadır.</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Live Email Template Gallery & Preview Studio */}
          {templates.length > 0 && (
            <Card variant="default" padding="lg" className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>E-posta Şablon Galerisi ve Canlı Önizleme</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Yenilenen {templates.length} modern e-posta şablonunu masaüstü ve mobil görünümde inceleyin.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewViewport('desktop')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        previewViewport === 'desktop'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Masaüstü
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewViewport('mobile')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        previewViewport === 'mobile'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Mobil
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!testEmail.trim() || testingSmtp}
                    onClick={(e) => handleSmtpTest(e, selectedTemplateId)}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Bu Şablonu Test Et
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Template Selector List */}
                <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {templates.map((tpl) => {
                    const isSelected = tpl.id === selectedTemplateId;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/60 shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-bold truncate ${
                              isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {tpl.name}
                          </span>
                          {tpl.isNew && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white">
                              Yeni
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                          {tpl.category}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Sandboxed Live Preview Canvas */}
                <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/70 overflow-hidden">
                  <div className="px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Konu Satırı
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {previewSubject || activeTemplate?.subject || 'Yükleniyor...'}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Gönderen: {fromName} &lt;{fromEmail}&gt;
                    </span>
                  </div>

                  <div className="flex-1 p-4 sm:p-6 flex justify-center items-start overflow-auto min-h-[540px]">
                    {loadingPreview ? (
                      <div className="w-full max-w-[600px] space-y-4 py-12">
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                      </div>
                    ) : (
                      <iframe
                        title={`E-posta Şablon Önizleme - ${activeTemplate?.name || selectedTemplateId}`}
                        srcDoc={previewHtml}
                        sandbox=""
                        className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-300 ${
                          previewViewport === 'mobile' ? 'w-[375px]' : 'w-full max-w-[640px]'
                        } h-[560px]`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
