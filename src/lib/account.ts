import { MIN_PASSWORD_LENGTH } from './createPassword';
import { getAuthClient } from './authClient';

export type AccountErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'rate_limited'
  | 'network'
  | 'unknown';

export type AccountResult = { ok: true } | { ok: false; code: AccountErrorCode };
export type SessionResult = { ok: true; accessToken: string | null } | { ok: false; code: AccountErrorCode };

interface AuthErrorLike {
  code?: string;
  name?: string;
  status?: number;
  message?: string;
}

/** O pedaço do cliente Supabase que usamos (injetável nos testes). */
export interface AuthLike {
  auth: {
    signUp(args: { email: string; password: string }): Promise<{ data: unknown; error: AuthErrorLike | null }>;
    signInWithPassword(args: { email: string; password: string }): Promise<{ data: { session?: { access_token: string } | null } | unknown; error: AuthErrorLike | null }>;
    verifyOtp(args: { email: string; token: string; type: 'signup' }): Promise<{ data: { session?: { access_token: string } | null } | unknown; error: AuthErrorLike | null }>;
    resend(args: { type: 'signup'; email: string }): Promise<{ data: unknown; error: AuthErrorLike | null }>;
    signOut(): Promise<{ error: AuthErrorLike | null }>;
    getSession(): Promise<{ data: { session: { access_token: string } | null } }>;
  };
}

/** Avisa a barra de navegação (e quem mais ouvir) que entrou ou saiu. */
const announce = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('vision-auth'));
};

const defaultClient = () => getAuthClient() as unknown as Promise<AuthLike>;

/** Erro do Supabase Auth → código da landing. Por `code` primeiro; mensagem só como reserva. */
export function mapAuthError(error: AuthErrorLike): AccountErrorCode {
  switch (error.code) {
    case 'invalid_credentials':
      return 'invalid_credentials';
    case 'email_not_confirmed':
      return 'email_not_confirmed';
    case 'weak_password':
      return 'weak_password';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'rate_limited';
  }
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) return 'network';
  const msg = (error.message ?? '').toLowerCase();
  if (!error.code) {
    if (msg.includes('invalid login credentials')) return 'invalid_credentials';
    if (msg.includes('email not confirmed')) return 'email_not_confirmed';
    if (msg.includes('rate limit')) return 'rate_limited';
    if (msg.includes('failed to fetch') || msg.includes('network')) return 'network';
  }
  return 'unknown';
}

async function guarded<T>(run: () => Promise<T>, onError: (code: AccountErrorCode) => T): Promise<T> {
  try {
    return await run();
  } catch {
    return onError('network');
  }
}

export async function signUp(email: string, password: string, client?: AuthLike): Promise<AccountResult> {
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, code: 'weak_password' };
  return guarded(
    async () => {
      const c = client ?? (await defaultClient());
      const { error } = await c.auth.signUp({ email, password });
      return error ? { ok: false as const, code: mapAuthError(error) } : { ok: true as const };
    },
    (code) => ({ ok: false, code }),
  );
}

function sessionOutcome(data: unknown, error: AuthErrorLike | null): SessionResult {
  if (error) return { ok: false, code: mapAuthError(error) };
  const token = (data as { session?: { access_token?: string } | null } | null)?.session?.access_token ?? null;
  return { ok: true, accessToken: token };
}

export async function verifySignupCode(email: string, code: string, client?: AuthLike): Promise<SessionResult> {
  return guarded(
    async () => {
      const c = client ?? (await defaultClient());
      const { data, error } = await c.auth.verifyOtp({ email, token: code.trim(), type: 'signup' });
      const out = sessionOutcome(data, error);
      if (out.ok && !client) announce();
      return out;
    },
    (code) => ({ ok: false, code }),
  );
}

export async function resendSignupCode(email: string, client?: AuthLike): Promise<AccountResult> {
  return guarded(
    async () => {
      const c = client ?? (await defaultClient());
      const { error } = await c.auth.resend({ type: 'signup', email });
      return error ? { ok: false as const, code: mapAuthError(error) } : { ok: true as const };
    },
    (code) => ({ ok: false, code }),
  );
}

export async function signIn(email: string, password: string, client?: AuthLike): Promise<SessionResult> {
  return guarded(
    async () => {
      const c = client ?? (await defaultClient());
      const { data, error } = await c.auth.signInWithPassword({ email, password });
      const out = sessionOutcome(data, error);
      if (out.ok && !client) announce();
      return out;
    },
    (code) => ({ ok: false, code }),
  );
}

export async function signOut(client?: AuthLike): Promise<void> {
  try {
    const c = client ?? (await defaultClient());
    await c.auth.signOut();
    if (!client) announce();
  } catch {
    /* sem rede: a sessão da aba some ao fechar */
  }
}

export async function currentAccessToken(client?: AuthLike): Promise<string | null> {
  try {
    const c = client ?? (await defaultClient());
    const { data } = await c.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}
