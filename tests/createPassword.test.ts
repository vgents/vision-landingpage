import { describe, expect, test } from 'vitest';
import { SUPABASE_ANON_KEY } from '../src/data/cloud';
import { classifyUpdateError, confirmAccount, readAuthFragment, validateNewPassword } from '../src/lib/createPassword';

describe('readAuthFragment', () => {
  test('session links', () => {
    expect(readAuthFragment('#access_token=a&refresh_token=b&type=invite')).toEqual({ kind: 'session', linkType: 'invite' });
    expect(readAuthFragment('#access_token=a&type=recovery')).toEqual({ kind: 'session', linkType: 'recovery' });
    expect(readAuthFragment('#access_token=a&type=magiclink')).toEqual({ kind: 'session', linkType: 'other' });
  });
  test('expired or used link', () => {
    expect(readAuthFragment('#error=access_denied&error_code=otp_expired&error_description=x')).toEqual({ kind: 'expired' });
  });
  test('other errors keep the description', () => {
    expect(readAuthFragment('#error=server_error&error_code=unexpected_failure&error_description=Algo+falhou')).toEqual({
      kind: 'error',
      description: 'Algo falhou',
    });
  });
  test('no fragment', () => {
    expect(readAuthFragment('')).toEqual({ kind: 'none' });
    expect(readAuthFragment('#downloads')).toEqual({ kind: 'none' });
  });
});

describe('validateNewPassword', () => {
  test('rules', () => {
    expect(validateNewPassword('', '', true)).not.toBeNull();
    expect(validateNewPassword('', '', false)).toBeNull();
    expect(validateNewPassword('1234567', '1234567', true)).not.toBeNull();
    expect(validateNewPassword('12345678', '12345679', true)).not.toBeNull();
    expect(validateNewPassword('12345678', '12345678', true)).toBeNull();
    expect(validateNewPassword('1234567', '1234567', false)).not.toBeNull();
  });
});

type Seen = { url?: string; init?: RequestInit };
function fakeFetch(status: number, body: unknown, seen: Seen = {}): typeof fetch {
  return (async (url: RequestInfo | URL, init?: RequestInit) => {
    seen.url = String(url);
    seen.init = init;
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

describe('confirmAccount', () => {
  test('confirm sends bearer token and maps status', async () => {
    const seen: Seen = {};
    const res = await confirmAccount(
      'tok',
      fakeFetch(200, { status: 'provisioned', org_name: 'Acme', plan_name: 'Start-up' }, seen),
    );
    const headers = seen.init?.headers as Record<string, string>;
    expect(seen.url).toMatch(/\/functions\/v1\/account-confirm$/);
    expect(seen.init?.method).toBe('POST');
    expect(headers.Authorization).toBe('Bearer tok');
    expect(headers.apikey).toBe(SUPABASE_ANON_KEY);
    expect(res).toEqual({ ok: true, status: 'provisioned', orgName: 'Acme', planName: 'Start-up' });
  });

  test('statuses without names', async () => {
    expect(await confirmAccount('tok', fakeFetch(200, { status: 'nothing_pending' }))).toEqual({
      ok: true,
      status: 'nothing_pending',
    });
  });

  test('confirm 401 maps to unauthorized', async () => {
    expect(await confirmAccount('tok', fakeFetch(401, { error: 'unauthorized' }))).toEqual({ ok: false, code: 'unauthorized' });
  });

  test('5xx and unknown bodies map to server_error', async () => {
    expect(await confirmAccount('tok', fakeFetch(500, { error: 'server_error' }))).toEqual({ ok: false, code: 'server_error' });
    expect(await confirmAccount('tok', fakeFetch(200, { status: 'weird' }))).toEqual({ ok: false, code: 'server_error' });
  });

  test('network failure', async () => {
    const res = await confirmAccount('tok', (async () => {
      throw new TypeError('offline');
    }) as typeof fetch);
    expect(res).toEqual({ ok: false, code: 'network_error' });
  });
});

describe('classifyUpdateError', () => {
  test('separates same password, weak password and network failures', () => {
    expect(classifyUpdateError({ code: 'same_password' })).toBe('same');
    expect(classifyUpdateError({ code: 'weak_password' })).toBe('weak');
    expect(classifyUpdateError({ name: 'AuthRetryableFetchError', status: 0 })).toBe('network');
    expect(classifyUpdateError({ code: 'unexpected', status: 500 })).toBe('other');
  });
});

describe('confirmAccount email_not_verified', () => {
  test('403 email_not_verified gets its own outcome and copy', async () => {
    const out = await confirmAccount('tok', fakeFetch(403, { error: 'email_not_verified', message: 'x' }));
    expect(out).toEqual({ ok: false, code: 'email_not_verified' });
    expect(CREATE_PASSWORD_COPY.confirmEmailNotVerified).toMatch(/Primeiro acesso/);
  });
  test('other 403 stays a server error', async () => {
    expect(await confirmAccount('tok', fakeFetch(403, { error: 'forbidden' }))).toEqual({ ok: false, code: 'server_error' });
  });
});
