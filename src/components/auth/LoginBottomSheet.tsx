import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useNavigate, Link } from "react-router";
import {
  X,
  Heart,
  Rocket,
  Users,
  MessageCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  Bookmark,
  Trophy,
} from "lucide-react";
import { useAuthModalStore } from "../../context/useAuthModal";
import { useAuthStore } from "../../context/useAuth";

const G_PATH = "M 78 28 A 36 36 0 1 0 85 52 L 52 52";

const G_TRAIL_LAYERS = [
  { color: "#EA4335", delay: 0.05 },
  { color: "#FBBC05", delay: 0.13 },
  { color: "#34A853", delay: 0.21 },
  { color: "#2563EB", delay: 0.29 },
] as const;

const FEATURE_ITEMS = [
  {
    icon: Heart,
    title: "Gönderilerle etkileşime geç ve kaydet",
    description: "Beğen, yorum yap ve ilham veren içerikleri koleksiyonuna ekle.",
    iconWrap:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 ring-1 ring-rose-500/15",
  },
  {
    icon: Rocket,
    title: "Kendi projelerini ve fikirlerini paylaş",
    description: "Çalışmalarını profilinde sergile, topluluktan geri bildirim al.",
    iconWrap:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-blue-500/15",
  },
  {
    icon: Users,
    title: "Üretici topluluklarla doğrudan iletişim kur",
    description: "Genç Quiz odalarına katıl, mesajlaş ve yeni bağlantılar kur.",
    iconWrap:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 ring-1 ring-indigo-500/15",
  },
] as const;

export function LoginBottomSheet() {
  const { isOpen, closeModal } = useAuthModalStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  // Lock body scroll & close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, closeModal]);

  if (isAuthenticated) return null;

  return typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-5"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              aria-describedby="auth-modal-desc"
            >
              {/* Soft Frosted Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm"
                onClick={closeModal}
                aria-hidden="true"
              />

              {/* Main Modal / Mobile Bottom Sheet */}
              <motion.div
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { y: 40, opacity: 0, scale: 0.96 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { y: 0, opacity: 1, scale: 1 }
                }
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { y: 32, opacity: 0, scale: 0.97 }
                }
                transition={{
                  type: "spring",
                  damping: 26,
                  stiffness: 340,
                  mass: 0.85,
                }}
                className="relative w-full sm:max-w-[448px] bg-white dark:bg-[#0B1329] rounded-t-[32px] sm:rounded-[28px] border border-slate-200/90 dark:border-white/[0.1] shadow-[0_28px_70px_-15px_rgba(15,23,42,0.28)] dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.75)] overflow-hidden z-10 flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Editorial Hero Visual Strip */}
                <div className="relative px-6 pt-3 sm:pt-6 pb-5 bg-gradient-to-b from-blue-50/90 via-indigo-50/35 to-transparent dark:from-blue-950/40 dark:via-indigo-950/15 dark:to-transparent overflow-hidden">
                  {/* Mobile Grab Handle */}
                  <div className="flex justify-center pb-3 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-slate-300/80 dark:bg-slate-700" />
                  </div>

                  {/* Close Button (≥44px touch hitbox) */}
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Pencereyi kapat"
                    className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer z-20"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Animated Center Brand Cluster with Floating Micro-Icons */}
                  <div className="relative flex items-center justify-center pt-1 pb-2">
                    {/* Left floating micro-icon: Bookmark */}
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 12, scale: 0.7 }}
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, x: 0, scale: 1, y: [0, -4, 0] }
                      }
                      transition={{
                        opacity: { duration: 0.3, delay: 0.25 },
                        x: { duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 3.2, delay: 0.65, repeat: Infinity, ease: "easeInOut" },
                      }}
                      aria-hidden="true"
                      className="w-9 h-9 rounded-2xl bg-white dark:bg-[#131F3F] border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center justify-center text-rose-500 -mr-2 mt-4 -rotate-6"
                    >
                      <Bookmark className="w-4 h-4 fill-rose-500/15" />
                    </motion.div>

                    {/* Center Animated 4-Color Trail "G" Emblem */}
                    <motion.div
                      initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative z-10 w-16 h-16 rounded-[22px] bg-white dark:bg-[#111B33] border border-slate-200/90 dark:border-white/12 shadow-[0_12px_30px_-8px_rgba(37,99,235,0.28)] flex items-center justify-center mx-3"
                    >
                      <svg
                        width="38"
                        height="38"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        {G_TRAIL_LAYERS.map((layer, index) =>
                          shouldReduceMotion ? (
                            index === G_TRAIL_LAYERS.length - 1 ? (
                              <path
                                key={layer.color}
                                d={G_PATH}
                                fill="none"
                                stroke={layer.color}
                                strokeWidth="14"
                                strokeLinecap="butt"
                              />
                            ) : null
                          ) : (
                            <motion.path
                              key={layer.color}
                              d={G_PATH}
                              fill="none"
                              stroke={layer.color}
                              strokeWidth="14"
                              strokeLinecap="butt"
                              strokeDasharray="260"
                              initial={{ strokeDashoffset: 260 }}
                              animate={{ strokeDashoffset: 0 }}
                              transition={{
                                duration: 0.95,
                                delay: layer.delay,
                                ease: [0.65, 0, 0.35, 1],
                              }}
                            />
                          )
                        )}
                      </svg>
                    </motion.div>

                    {/* Right floating micro-icon: Message & Trophy */}
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -12, scale: 0.7 }}
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, x: 0, scale: 1, y: [0, -5, 0] }
                      }
                      transition={{
                        opacity: { duration: 0.3, delay: 0.32 },
                        x: { duration: 0.4, delay: 0.32, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 0.4, delay: 0.32, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 3.6, delay: 0.9, repeat: Infinity, ease: "easeInOut" },
                      }}
                      aria-hidden="true"
                      className="w-9 h-9 rounded-2xl bg-white dark:bg-[#131F3F] border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 -ml-2 -mt-3 rotate-6"
                    >
                      <MessageCircle className="w-4 h-4 fill-blue-500/15" />
                    </motion.div>

                    {/* Secondary subtle trophy icon bottom-right */}
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.6 }}
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, scale: 1, y: [0, 3, 0] }
                      }
                      transition={{
                        opacity: { duration: 0.3, delay: 0.4 },
                        scale: { duration: 0.35, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 2.9, delay: 1.1, repeat: Infinity, ease: "easeInOut" },
                      }}
                      aria-hidden="true"
                      className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200/70 dark:border-amber-500/20 flex items-center justify-center text-amber-500 ml-1 mt-7 -rotate-3"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>

                  {/* Brand Eyebrow & Headline */}
                  <div className="text-center mt-2.5 max-w-sm mx-auto">
                    <motion.p
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.08 }}
                      className="text-xs font-bold tracking-wide text-blue-600 dark:text-blue-400 mb-1.5"
                    >
                      Genç Sosyal
                    </motion.p>
                    <motion.h2
                      id="auth-modal-title"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="text-[22px] sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight text-balance"
                    >
                      Topluluğa katıl, deneyimi kaçırma!
                    </motion.h2>
                    <motion.p
                      id="auth-modal-desc"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, delay: 0.17, ease: [0.16, 1, 0.3, 1] }}
                      className="text-[13.5px] sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed"
                    >
                      Beğenmek, yorum yapmak, projelerini paylaşmak ve diğer gençlerle bağlantı kurmak için giriş yap veya anında kaydol.
                    </motion.p>
                  </div>
                </div>

                {/* Scrollable Body: Feature Rows + Action Stack */}
                <div className="px-6 pb-6 sm:pb-7 pt-1 overflow-y-auto">
                  {/* Staggered Animated Feature List (clean hairline separation, zero nested box clutter) */}
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.07] border-y border-slate-100 dark:border-white/[0.07] my-3">
                    {FEATURE_ITEMS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.title}
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.32,
                            delay: 0.2 + idx * 0.07,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="flex items-start gap-3.5 py-3.5 group"
                        >
                          <motion.div
                            initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.78, rotate: -6 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 22,
                              delay: 0.22 + idx * 0.07,
                            }}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${item.iconWrap}`}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </motion.div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {item.title}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Primary & Secondary Action Buttons */}
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-2.5 mt-5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        navigate("/register");
                      }}
                      className="group relative w-full h-12 px-5 rounded-2xl bg-gradient-to-r from-[#0F2557] via-[#2563EB] to-[#4F46E5] hover:brightness-105 active:scale-[0.98] text-white font-bold text-sm shadow-[0_10px_24px_-6px_rgba(37,99,235,0.45)] flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1329]"
                    >
                      <UserPlus className="w-4 h-4 shrink-0" />
                      <span>Ücretsiz Hesap Oluştur</span>
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        navigate("/login");
                      }}
                      className="w-full h-12 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.07] dark:hover:bg-white/[0.12] active:scale-[0.98] text-slate-900 dark:text-white font-bold text-sm border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <LogIn className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>Hesabım Var, Giriş Yap</span>
                    </button>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full h-10 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Şimdilik gezinmeye devam et
                    </button>
                  </motion.div>

                  {/* Legal Footer */}
                  <p className="text-center text-[11.5px] text-slate-400 dark:text-slate-500 mt-3 pb-safe leading-relaxed">
                    Devam ederek{" "}
                    <Link
                      to="/terms"
                      onClick={closeModal}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Kullanım Şartları
                    </Link>
                    ,{" "}
                    <Link
                      to="/privacy"
                      onClick={closeModal}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Gizlilik Politikası
                    </Link>{" "}
                    ve{" "}
                    <Link
                      to="/kvkk"
                      onClick={closeModal}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      KVKK Aydınlatma Metni
                    </Link>
                    &apos;ni kabul etmiş olursunuz.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;
}
