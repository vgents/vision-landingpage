import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../data/cloud';

let client: Promise<SupabaseClient> | null = null;

/**
 * Cliente de conta (entrar / criar conta / baixar), separado do cliente de
 * `/criar-senha`. A sessão vive só no `sessionStorage` da aba. Sem renovação
 * automática: um token vencido vira 401 e leva de volta ao login. A landing
 * nunca chama `session-claim`, para não derrubar a sessão do app.
 */
export function getAuthClient(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        storage: window.sessionStorage,
        storageKey: 'vision-landing-auth',
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }),
  );
  return client;
}
