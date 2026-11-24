/// <reference types="vite/client" />

interface ImportMetaEnv {
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
