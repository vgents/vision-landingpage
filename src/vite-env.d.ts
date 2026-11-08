/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origem do feed de releases de onde o instalador é servido.
   * Definida no ambiente de build (ex.: variável de projeto na Vercel), nunca
   * versionada — assim a infraestrutura de distribuição não fica documentada
   * no repositório e trocar de endpoint não exige um commit.
   */
  readonly VITE_DOWNLOAD_ORIGIN?: string;
  /**
   * Chave PÚBLICA do Mercado Pago (Card Payment Brick). Sem ela o cartão fica
   * indisponível na página de pagamento e só o Pix funciona.
   */
  readonly VITE_MP_PUBLIC_KEY?: string;
  /** Só no `npm run dev`: Supabase local para o ensaio do sandbox (ignorado no build). */
  readonly VITE_SUPABASE_URL?: string;
  /** Só no `npm run dev`: chave anon do Supabase local (vale só com VITE_SUPABASE_URL). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
