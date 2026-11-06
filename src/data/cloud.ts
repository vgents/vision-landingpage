/**
 * Endereço público do Supabase do Vision e a chave pública (publishable/anon,
 * pública por desenho: só alcança o que a RLS e as Edge Functions permitem a um
 * visitante). Nunca colocar aqui o token do Mercado Pago nem a chave service role.
 */
export const SUPABASE_URL = "https://ikhoiuytcrnrpjmnsfek.supabase.co";

export const SUPABASE_ANON_KEY = "sb_publishable_5kkN0IimsB5U5qs0fQizUg_-8R6dZVG";

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
