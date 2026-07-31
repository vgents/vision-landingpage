/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origem do feed de releases de onde o instalador é servido.
   * Definida no ambiente de build (ex.: variável de projeto na Vercel), nunca
   * versionada — assim a infraestrutura de distribuição não fica documentada
   * no repositório e trocar de endpoint não exige um commit.
   */
  readonly VITE_DOWNLOAD_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
