/**
 * Endereço público do Supabase do Vision e a chave pública (publishable/anon,
 * pública por desenho: só alcança o que a RLS e as Edge Functions permitem a um
 * visitante). Nunca colocar aqui o token do Mercado Pago nem a chave service role.
 */
const PRODUCTION_URL = "https://ikhoiuytcrnrpjmnsfek.supabase.co";
const PRODUCTION_ANON_KEY = "sb_publishable_5kkN0IimsB5U5qs0fQizUg_-8R6dZVG";

// Só no `npm run dev`: apontar para um Supabase local (ensaio do sandbox do
// Mercado Pago sem tocar a produção). O build de produção ignora as duas variáveis.
const devUrl = import.meta.env.DEV ? import.meta.env.VITE_SUPABASE_URL?.trim() : undefined;
const devKey = import.meta.env.DEV ? import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() : undefined;

export const SUPABASE_URL = devUrl || PRODUCTION_URL;

export const SUPABASE_ANON_KEY = (devUrl && devKey) || PRODUCTION_ANON_KEY;

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
