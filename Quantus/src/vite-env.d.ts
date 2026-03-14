/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_QUANTUS_API_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: {
    onRegisteredSW?: (swUrl: string, registration?: ServiceWorkerRegistration) => void;
  }): {
    needRefresh: [boolean];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

declare module 'i18next' {
  const i18n: {
    use(plugin: unknown): typeof i18n;
    init(options: unknown): typeof i18n;
    on(event: string, handler: (...args: unknown[]) => void): void;
  };
  export default i18n;
}

declare module 'react-i18next' {
  export const initReactI18next: unknown;
}
