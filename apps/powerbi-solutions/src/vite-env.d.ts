/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_MODEL?: string;
  readonly VITE_POWERBI_SOLUTIONS_API_BASE?: string;
  readonly VITE_POWERBI_SOLUTIONS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
