/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RUNTIME_TRANSPORT?: "local" | "remote";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

