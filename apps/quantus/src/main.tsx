import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

restoreGitHubPagesRoute();

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations
      .filter((registration) => registration.scope.includes('/quantus/'))
      .forEach((registration) => {
        void registration.unregister();
      });
  });

  if ('caches' in window) {
    void caches.keys().then((keys) => {
      keys
        .filter((key) => key.startsWith('quantus-') || key.startsWith('workbox'))
        .forEach((key) => {
          void caches.delete(key);
        });
    });
  }
}

function restoreGitHubPagesRoute() {
  const redirectKey = '__bisolutions_redirect__';

  try {
    const pendingRoute = sessionStorage.getItem(redirectKey);
    if (!pendingRoute) {
      return;
    }

    sessionStorage.removeItem(redirectKey);
    const redirectUrl = new URL(pendingRoute, window.location.origin);
    if (redirectUrl.origin !== window.location.origin) {
      return;
    }

    const restoredRoute = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
    if (restoredRoute !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, '', restoredRoute);
    }
  } catch (error) {
    console.warn('Unable to restore GitHub Pages route for Quantus.', error);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
