import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
