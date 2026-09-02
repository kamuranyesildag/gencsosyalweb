import React, { useState, useEffect } from 'react';
import { toast } from "../ui/Toast";
import { confirmDialog } from "../ui/ConfirmDialog";
import { fetchApi } from "../../lib/api";
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion } from 'motion/react';
import { slideUpVariants } from '../../lib/motion';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, MessageSquare, FileText, User } from 'lucide-react';

interface ModerationLog {
  id: number;
  entityType: 'POST' | 'COMMENT' | 'PROFILE' | 'PROJECT' | 'PROJECT_COMMENT';
  entityId: number;
  status: 'PENDING' | 'RESOLVED';
  riskLevel: 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  category: string;
  createdAt: string;
  content: string;
  user: {
    id: number;
    username: string;
    displayName: string;
  };
}

export function AdminModeration() {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetchApi('/admin/moderation/queue');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'APPROVE' | 'REJECT') => {
    const isApproved = action === 'APPROVE';
    const confirmed = await confirmDialog({
      title: isApproved ? 'İçeriği Onayla' : 'İçeriği Engelle',
      message: `İçeriği ${isApproved ? 'onaylamak ve yayına almak' : 'engellemek ve yayından kaldırmak'} istediğinize emin misiniz?`,
      confirmLabel: isApproved ? 'Yayınla' : 'Engelle',
      variant: isApproved ? 'primary' : 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await fetchApi(`/admin/moderation/${id}/action`, {
        method: 'POST',
        data: { action }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => prev.filter(log => log.id !== id));
      } else {
        toast.error(data.error?.message || "Hata oluştu");
      }
    } catch (err) {
      console.error(err);
      toast.error("Bağlantı hatası");
    }
  };

  const getRiskColor = (level: string) => {
    if (level === 'HIGH_RISK') return 'danger';
    if (level === 'MEDIUM_RISK') return 'warning';
    if (level === 'LOW_RISK') return 'info';
    return 'success';
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Yükleniyor...</div>;

  return (
    <motion.div variants={slideUpVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Moderasyon Kuyruğu</h2>
          <p className="text-sm text-slate-500 mt-1">Otomatik sistem tarafından işaretlenmiş şüpheli içerikleri inceleyin.</p>
        </div>
        <Badge variant="warning">{logs.length} Bekleyen</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {logs.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Kuyruk Temiz</h3>
              <p className="text-slate-500 text-sm mt-1">İncelenmesi gereken içerik bulunmuyor.</p>
            </Card>
          ) : (
            logs.map(log => (
              <Card key={log.id} className="p-5 flex flex-col gap-4 border-l-4" style={{ borderLeftColor: log.riskLevel === 'HIGH_RISK' ? '#ef4444' : log.riskLevel === 'MEDIUM_RISK' ? '#f59e0b' : '#3b82f6' }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      {log.entityType === 'POST' || log.entityType === 'PROJECT' ? <FileText className="w-5 h-5" /> : log.entityType === 'COMMENT' || log.entityType === 'PROJECT_COMMENT' ? <MessageSquare className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.user.displayName}</span>
                        <span className="text-slate-500 text-sm">@{log.user.username}</span>
                        <Badge variant="secondary" size="sm">{log.entityType}</Badge>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleString('tr-TR')}</div>
                    </div>
                  </div>
                  <Badge variant={getRiskColor(log.riskLevel)}>{log.category}</Badge>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl text-slate-800 text-sm border border-slate-100 relative">
                  {log.content}
                </div>
                
                <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-slate-100">
                  <Button variant="danger" size="sm" onClick={() => handleAction(log.id, 'REJECT')} leftIcon={<XCircle className="w-4 h-4" />}>
                    İçeriği Engelle
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleAction(log.id, 'APPROVE')} leftIcon={<CheckCircle className="w-4 h-4" />}>
                    Yayınlanmasına İzin Ver
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
        
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-500" />
              Sistem Durumu
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Otomatik Motor</span>
                <Badge variant="success">AKTİF</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Algılama Hassasiyeti</span>
                <span className="font-medium">Orta (Heuristic)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Kalıcı Ban Politikası</span>
                <span className="font-medium text-slate-400">Manuel İnceleme</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Sistem içerikleri "SAFE", "LOW_RISK", "MEDIUM_RISK" ve "HIGH_RISK" olarak etiketler. 
              HIGH_RISK içerikler otomatik reddedilir (itiraza açıktır). MEDIUM_RISK içerikler yayınlanmaz ve bu kuyruğa düşer.
            </p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
