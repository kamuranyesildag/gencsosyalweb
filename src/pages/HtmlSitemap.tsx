import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Compass, FolderKanban, Users, Tag, Shield, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { useSEO } from "../hooks/useSEO";
import { fetchApi } from "../lib/api";

export function HtmlSitemap() {
  useSEO({
    title: "Site Haritası — Tüm Sayfalar ve Dizin | Genç Sosyal",
    description: "Genç Sosyal platformundaki tüm açık projelere, topluluklara, quiz odalarına ve bilgi sayfalarına hızlı ve kolay erişim dizini.",
    canonicalPath: "/sitemap",
  });

  const [communities, setCommunities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);

  useEffect(() => {
    fetchApi("/communities?limit=8").then(r => r.json()).then(j => {
      if (j.success && Array.isArray(j.data)) setCommunities(j.data);
    }).catch(() => {});

    fetchApi("/projects?limit=8").then(r => r.json()).then(j => {
      if (j.success && Array.isArray(j.data)) setProjects(j.data);
    }).catch(() => {});

    fetchApi("/hashtags?limit=12").then(r => r.json()).then(j => {
      if (j.success && Array.isArray(j.data)) setHashtags(j.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <header className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Genç Sosyal Site Haritası
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base">
          Arama motorları ve kullanıcılar için Genç Sosyal üzerindeki tüm açık, indekslenebilir sayfalar, üretici projeleri ve topluluk dizini.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Hubs */}
        <section className="bg-white dark:bg-[#0D121D] p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ana Sayfalar</h2>
          </div>
          <ul className="space-y-2.5">
            <li>
              <Link to="/" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>Ana Sayfa</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </Link>
            </li>
            <li>
              <Link to="/explore" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>Keşfet</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </Link>
            </li>
            <li>
              <Link to="/projects" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>Tüm Projeler</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </Link>
            </li>
            <li>
              <Link to="/communities" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>Topluluklar</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </Link>
            </li>
          </ul>
        </section>

        {/* Legal & Engine */}
        <section className="bg-white dark:bg-[#0D121D] p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dizin & Yasal</h2>
          </div>
          <ul className="space-y-2.5">
            <li>
              <Link to="/privacy" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>Gizlilik Politikası</span>
                <FileText className="w-4 h-4 opacity-50" />
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>Kullanım Şartları</span>
                <FileText className="w-4 h-4 opacity-50" />
              </Link>
            </li>
            <li>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>XML Site Haritası (Crawler)</span>
                <ExternalLink className="w-4 h-4 opacity-50" />
              </a>
            </li>
            <li>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                <span>Robots.txt Protokolü</span>
                <ExternalLink className="w-4 h-4 opacity-50" />
              </a>
            </li>
          </ul>
        </section>

        {/* Communities */}
        {communities.length > 0 && (
          <section className="bg-white dark:bg-[#0D121D] p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Açık Topluluklar</h2>
            </div>
            <ul className="space-y-2.5">
              {communities.map((c) => (
                <li key={c.id}>
                  <Link to={`/communities/${c.slug}`} className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                    <span className="truncate">{c.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-50 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="bg-white dark:bg-[#0D121D] p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Üretici Projeleri</h2>
            </div>
            <ul className="space-y-2.5">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between text-sm font-medium">
                    <span className="truncate">{p.title}</span>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{p.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <section className="bg-white dark:bg-[#0D121D] p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Popüler Etiketler</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((h) => (
                <Link
                  key={h.id || h.name}
                  to={`/hashtags/${encodeURIComponent(h.name)}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                >
                  #{h.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
