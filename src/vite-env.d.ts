/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MP_SERVER_URL?: string;
  readonly VITE_MP_SERVER_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
