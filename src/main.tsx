import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Handle Vite dynamic import chunk reload errors (prevents blank screen on updates)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const now = Date.now();
  const lastReload = Number(sessionStorage.getItem('gencsosyal_preload_reload') || 0);
  if (now - lastReload > 15000) {
    sessionStorage.setItem('gencsosyal_preload_reload', now.toString());
    window.location.reload();
  }
});

// Catch unhandled dynamic module errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason?.toString() || '';
  if (
    reason.includes('Failed to fetch dynamically imported module') ||
    reason.includes('Loading chunk') ||
    reason.includes('error loading dynamic script')
  ) {
    event.preventDefault();
    const now = Date.now();
    const lastReload = Number(sessionStorage.getItem('gencsosyal_preload_reload') || 0);
    if (now - lastReload > 15000) {
      sessionStorage.setItem('gencsosyal_preload_reload', now.toString());
      window.location.reload();
    }
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
