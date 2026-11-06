import { CREATE_PASSWORD_COPY } from '../data/checkout';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../data/cloud';

export type AuthFragment =
  | { kind: 'session'; linkType: 'invite' | 'recovery' | 'other' }
  | { kind: 'expired' }
  | { kind: 'error'; description: string }
  | { kind: 'none' };

/**
 * Lê o fragmento que o Supabase Auth deixa no link do e-mail (fluxo
 * implícito). Precisa rodar ANTES de o supabase-js limpar o fragmento.
 */
export function readAuthFragment(hash: string): AuthFragment {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const errorCode = params.get('error_code');
  const error = params.get('error');
  if (errorCode === 'otp_expired') return { kind: 'expired' };
  if (errorCode || error) {
    return { kind: 'error', description: params.get('error_description') ?? errorCode ?? error ?? '' };
  }
  if (params.get('access_token')) {
    const type = params.get('type');
    return { kind: 'session', linkType: type === 'invite' || type === 'recovery' ? type : 'other' };
  }
  return { kind: 'none' };
}

export type UpdateErrorKind = 'same' | 'weak' | 'network' | 'other';

/** Classifica o erro de `auth.updateUser` para escolher a mensagem (ou seguir adiante). */
export function classifyUpdateError(error: { code?: string; name?: string; status?: number } | null | undefined): UpdateErrorKind {
  if (!error) return 'other';
  if (error.code === 'same_password') return 'same';
  if (error.code === 'weak_password') return 'weak';
  if (error.name === 'AuthRetryableFetchError' || error.status === 0 || (error.status === undefined && error.name === 'TypeError')) {
    return 'network';
  }
  return 'other';
}

/** Mesmo mínimo do app (`CloudAuthCard`). Vazio só vale quando a senha é opcional. */
export const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(password: string, confirm: string, required: boolean): string | null {
  if (!password && !confirm) return required ? CREATE_PASSWORD_COPY.passwordRequired : null;
  if (password.length < MIN_PASSWORD_LENGTH) return CREATE_PASSWORD_COPY.passwordTooShort;
  if (password !== confirm) return CREATE_PASSWORD_COPY.passwordMismatch;
  return null;
}

const CONFIRM_STATUSES = ['provisioned', 'already_provisioned', 'member_activated', 'nothing_pending'] as const;
type ConfirmStatus = (typeof CONFIRM_STATUSES)[number];

export type ConfirmOutcome =
  | { ok: true; status: ConfirmStatus; orgName?: string; planName?: string }
  | { ok: false; code: 'unauthorized' | 'network_error' | 'server_error' };

/** Chama `account-confirm` com o token da sessão aberta pelo link. */
export async function confirmAccount(accessToken: string, fetchImpl: typeof fetch = fetch): Promise<ConfirmOutcome> {
  let res: Response;
  try {
    res = await fetchImpl(`${FUNCTIONS_URL}/account-confirm`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
  } catch {
    return { ok: false, code: 'network_error' };
  }
  if (res.status === 401) return { ok: false, code: 'unauthorized' };
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const status = data?.status;
  if (!res.ok || !CONFIRM_STATUSES.includes(status as ConfirmStatus)) return { ok: false, code: 'server_error' };
  return {
    ok: true,
    status: status as ConfirmStatus,
    ...(typeof data?.org_name === 'string' && data.org_name ? { orgName: data.org_name } : {}),
    ...(typeof data?.plan_name === 'string' && data.plan_name ? { planName: data.plan_name } : {}),
  };
}
