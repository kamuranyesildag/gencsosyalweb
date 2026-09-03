import React, { useState } from "react";
import { Palette, Save, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "../ui/Button";
import { useThemeStore, ThemeMode } from "../../context/useTheme";

interface SettingsAppearanceProps {
  showMsg: (text: string, type?: "success" | "error") => void;
}

export function SettingsAppearance({ showMsg }: SettingsAppearanceProps) {
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const [animations, setAnimations] = useState(true);

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    showMsg(`${mode === "dark" ? "Koyu" : mode === "light" ? "Açık" : "Sistem"} tema aktif edildi.`, "success");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showMsg("Görünüm tercihleri başarıyla kaydedildi.", "success");
    }, 300);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Görünüm & Tema
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Uygulamanın renk temasını ve arayüz animasyon tercihlerini belirleyin.
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Tema Tercihi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Light */}
              <button
                type="button"
                onClick={() => handleSelectTheme("light")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all text-center group ${
                  theme === "light"
                    ? "border-slate-900 dark:border-white bg-slate-100/60 dark:bg-slate-800 shadow-xs ring-4 ring-slate-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    theme === "light"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-amber-600 group-hover:bg-amber-50"
                  }`}
                >
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Açık Tema</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Gündüz kullanımı için
                  </div>
                </div>
              </button>

              {/* Dark */}
              <button
                type="button"
                onClick={() => handleSelectTheme("dark")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all text-center group ${
                  theme === "dark"
                    ? "border-indigo-600 dark:border-indigo-400 bg-slate-100/60 dark:bg-slate-800 shadow-xs ring-4 ring-indigo-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    theme === "dark"
                      ? "bg-slate-900 text-slate-100 dark:bg-indigo-600 dark:text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-200"
                  }`}
                >
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Koyu Tema</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Gece ve düşük ışık için
                  </div>
                </div>
              </button>

              {/* System */}
              <button
                type="button"
                onClick={() => handleSelectTheme("system")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all text-center group ${
                  theme === "system"
                    ? "border-slate-900 dark:border-white bg-slate-100/60 dark:bg-slate-800 shadow-xs ring-4 ring-slate-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    theme === "system"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"
                  }`}
                >
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Sistem Teması</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Cihaz ayarlarını izle
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Animation Switch */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Arayüz Animasyonları
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                Menü geçişlerinde, sekme değişimlerinde ve butonlarda akıcı mikro animasyonları etkinleştirin.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={animations}
                onChange={(e) => setAnimations(e.target.checked)}
              />
              <div className="w-12 h-6.5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Save className="w-4 h-4" />}
            className="rounded-2xl font-bold w-full sm:w-auto shadow-xs"
          >
            Görünüm Ayarlarını Kaydet
          </Button>
        </div>
      </div>
    </form>
  );
}
