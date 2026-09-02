import React, { useEffect, useState } from "react";
import { Check, X, Loader2, UserCheck, Users, AlertCircle } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { api } from "../lib/api";
import { toast } from "./ui/Toast";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { EmptyState } from "./ui/EmptyState";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

type Invite = {
  id: number;
  type: "project" | "post";
  projectId?: number;
  postId?: number;
  title?: string;
  content?: string;
  status: string;
  createdAt: string;
  inviterId: number;
  inviterUsername: string;
  inviterDisplayName: string | null;
  inviterAvatarUrl: string | null;
};

export function SettingsInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/collaborators/invites");
      if (res.data?.success) {
        setInvites(
          [...(res.data.data.projects || []), ...(res.data.data.posts || [])].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Davetler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAction = async (
    type: string,
    id: number,
    status: "accepted" | "rejected"
  ) => {
    try {
      setActionLoading(id);
      const res = await api.patch(`/api/v1/collaborators/invites/${type}/${id}`, {
        status,
      });
      if (res.data?.success) {
        setInvites((prev) => prev.filter((i) => i.id !== id || i.type !== type));
        toast.success(
          status === "accepted" ? "Davet kabul edildi." : "Davet reddedildi."
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-slate-900" />
          Ortak Üretici & Katkı Davetleri
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Diğer geliştiricilerin sizi ortak yazar veya ekip üyesi olarak eklediği davetleri yönetin.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm font-bold border border-rose-200 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        </div>
      ) : invites.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={<Users className="w-8 h-8 text-slate-400" />}
            title="Bekleyen Davet Yok"
            description="Şu anda size gönderilmiş bekleyen bir ortak üretici daveti bulunmuyor."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {invites.map((invite) => (
            <div
              key={`${invite.type}-${invite.id}`}
              className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <Avatar
                  url={invite.inviterAvatarUrl}
                  name={invite.inviterDisplayName || invite.inviterUsername}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {invite.inviterDisplayName || invite.inviterUsername}
                    </span>
                    <Badge variant="secondary" size="sm" isPill>
                      {invite.type === "project" ? "Proje" : "Gönderi"} Daveti
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 line-clamp-1">
                    {invite.type === "project" ? invite.title : invite.content}
                  </p>

                  <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                    {invite.createdAt
                      ? formatDistanceToNow(new Date(invite.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })
                      : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={actionLoading === invite.id}
                  onClick={() =>
                    handleAction(invite.type, invite.id, "accepted")
                  }
                  leftIcon={<Check className="w-4 h-4" />}
                  className="rounded-xl font-bold text-xs"
                >
                  Kabul Et
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={actionLoading === invite.id}
                  onClick={() =>
                    handleAction(invite.type, invite.id, "rejected")
                  }
                  leftIcon={<X className="w-4 h-4 text-rose-600" />}
                  className="rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50"
                >
                  Reddet
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
