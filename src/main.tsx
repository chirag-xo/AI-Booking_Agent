import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast'; // 👈 import toaster
import './index.css';

// 👇 Sentry log suppression (safe override)
(function suppressSentryLogs() {
  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes('Sentry Logger')) return;
    originalLog.apply(console, args);
  };

  console.warn = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes('Sentry Logger')) return;
    originalWarn.apply(console, args);
  };

  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.init = () => {};
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <>
        <Toaster position="top-right" /> {/* 👈 Toast container */}
        <App />
      </>
    </AuthProvider>
  </StrictMode>
);
