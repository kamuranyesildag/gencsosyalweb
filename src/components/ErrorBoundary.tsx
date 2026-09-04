import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Bir şeyler ters gitti</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Uygulama yüklenirken beklenmeyen bir hata oluştu.</p>
            {this.state.error && (
              <pre className="text-left text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-xl overflow-auto text-red-500 mb-6 max-h-64">
                {this.state.error.toString()}
                <br />
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}
