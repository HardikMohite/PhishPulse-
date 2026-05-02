/// <reference types="vite/client" />

// Allows importing *.b64 files (and any file) with ?raw — Vite returns the
// raw file contents as a plain string, which we then prefix with a data URL.
declare module '*?raw' {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.css";
declare module "*.scss";

declare module "*.module.css";
declare module "*.module.scss";

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_INCIDENT_GATE_LOCKED: false;
  readonly VITE_GATE_REQUIREMENT: false;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}