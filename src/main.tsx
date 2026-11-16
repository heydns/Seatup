import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

// ─── Sentry init (monitoring erreurs prod) ──────────────────────────────────
// Le DSN est lu depuis VITE_SENTRY_DSN. Si absent (dev local), Sentry est
// désactivé — pas d'erreur bloquante.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    // En V1 on reste simple : juste le monitoring des erreurs.
    // On activera BrowserTracing + Session Replay en V1.5 selon besoin.
    integrations: [],
    // Sample rate à 1.0 en dev, 0.1 en prod pour maîtriser le coût
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Ignore les erreurs connues sans valeur ajoutée
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      /^Network Error/,
    ],
  });
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
