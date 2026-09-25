import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isChunkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isChunkError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const message = error?.message || error?.toString() || "";
    const isChunkError =
      message.includes("dynamically imported module") ||
      message.includes("Loading chunk") ||
      message.includes("error loading dynamic script") ||
      message.includes("Failed to fetch") ||
      message.includes("Preload");

    return { hasError: true, error, isChunkError };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Genç Sosyal ErrorBoundary caught an error]:", error, errorInfo);

    // If chunk loading failed after a new deployment, auto-refresh once to get fresh assets
    const message = error?.message || error?.toString() || "";
    const isChunkError =
      message.includes("dynamically imported module") ||
      message.includes("Loading chunk") ||
      message.includes("error loading dynamic script");

    if (isChunkError && typeof window !== "undefined") {
      const now = Date.now();
      const lastReload = Number(sessionStorage.getItem("gencsosyal_last_chunk_reload") || 0);
      // Only reload if we haven't reloaded in the last 15 seconds
      if (now - lastReload > 15000) {
        sessionStorage.setItem("gencsosyal_last_chunk_reload", now.toString());
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    try {
      // Clear any cached session flags that might be stale
      sessionStorage.removeItem("gencsosyal_last_chunk_reload");
    } catch {}
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A10] p-4 text-slate-900 dark:text-white font-sans transition-colors">
          <div className="bg-white dark:bg-[#0E131F] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 text-center max-w-md w-full">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4 text-xl font-bold">
              GS
            </div>
            
            <h2 className="text-xl font-bold mb-2">
              {this.state.isChunkError ? "Uygulama Güncellendi" : "Bir şeyler ters gitti"}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              {this.state.isChunkError
                ? "Platform yeni bir sürüme güncellendi. Yeni bileşenlerin yüklenebilmesi için sayfayı yenilemeniz gerekmektedir."
                : "Sayfa yüklenirken beklenmedik bir durum oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün."}
            </p>

            {this.state.error && process.env.NODE_ENV !== "production" && (
              <details className="text-left mb-6">
                <summary className="text-xs text-slate-500 cursor-pointer hover:underline mb-2">
                  Hata Detayı (Geliştirici)
                </summary>
                <pre className="text-[11px] bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-auto text-red-500 max-h-40">
                  {this.state.error.toString()}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Sayfayı Yenile
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium text-sm transition-all active:scale-95 cursor-pointer"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
