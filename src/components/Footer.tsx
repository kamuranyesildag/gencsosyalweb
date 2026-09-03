import React from "react";
import { Link } from "react-router";
import { Sparkles, Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Hexagon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Genç Sosyal
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Gençlerin ürettiği, projelerini paylaştığı ve topluluklar kurduğu modern sosyal platform.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <Link to="/explore" className="hover:text-slate-900 dark:text-slate-100 transition-colors">
                  Keşfet
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-slate-900 dark:text-slate-100 transition-colors">
                  Projeler
                </Link>
              </li>
              <li>
                <Link to="/communities" className="hover:text-slate-900 dark:text-slate-100 transition-colors">
                  Topluluklar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">Yasal & Kurumsal</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <Link to="/privacy" className="hover:text-slate-900 dark:text-slate-100 transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-slate-900 dark:text-slate-100 transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-medium text-slate-400">
          <p>&copy; {new Date().getFullYear()} Genç Sosyal. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
