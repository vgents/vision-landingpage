import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../data/cloud';

/** Folga: uma sessão que vence em menos que isto já conta como vencida. */
export const EXPIRY_MARGIN_MS = 60_000;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Armazenamento que nunca entrega uma sessão vencida (ou prestes a vencer).
 * `autoRefreshToken: false` só desliga o temporizador: o `getSession()` do
 * supabase-js ainda renova uma sessão dentro da margem de expiração. A landing
 * nunca renova (colidiria com a sessão única do app), então o cliente jamais
 * enxerga uma sessão assim: ela some do armazenamento e a pessoa entra de novo.
 */
export function expiringStorage(base: StorageLike, now: () => number = Date.now): StorageLike {
  return {
    getItem(key) {
      const raw = base.getItem(key);
      if (raw === null) return null;
      try {
        const expiresAt = (JSON.parse(raw) as { expires_at?: unknown } | null)?.expires_at;
        if (typeof expiresAt !== 'number' || expiresAt * 1000 - EXPIRY_MARGIN_MS <= now()) {
          base.removeItem(key);
          return null;
        }
      } catch {
        base.removeItem(key);
        return null;
      }
      return raw;
    },
    setItem: (key, value) => base.setItem(key, value),
    removeItem: (key) => base.removeItem(key),
  };
}

export async function createAuthClient(storage: StorageLike, fetchImpl?: typeof fetch): Promise<SupabaseClient> {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storage,
      storageKey: 'vision-landing-auth',
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    ...(fetchImpl ? { global: { fetch: fetchImpl } } : {}),
  });
}

let client: Promise<SupabaseClient> | null = null;

/**
 * Cliente de conta (entrar / criar conta / baixar), separado do cliente de
 * `/criar-senha`. Sessão só no `sessionStorage` da aba, sem renovação. A landing
 * nunca chama `session-claim`.
 */
export function getAuthClient(): Promise<SupabaseClient> {
  client ??= createAuthClient(expiringStorage(window.sessionStorage));
  return client;
}
