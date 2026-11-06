import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../data/cloud';

let client: Promise<SupabaseClient> | null = null;

/**
 * Cliente único, criado só quando a página Criar senha precisa dele (o
 * supabase-js fica fora do pacote da landing). Fluxo implícito: a sessão vem no
 * fragmento do link do e-mail, e nada é guardado no navegador.
 */
export function getSupabase(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: false, autoRefreshToken: false },
    }),
  );
  return client;
}
