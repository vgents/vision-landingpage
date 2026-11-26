import { describe, expect, test, vi } from 'vitest';
import { signIn, signUp, verifySignupCode, resendSignupCode, type AuthLike } from '../src/lib/account';

function fakeAuth(over: Partial<AuthLike['auth']> = {}): AuthLike & { auth: { [k: string]: ReturnType<typeof vi.fn> } } {
  return {
    auth: {
      signUp: vi.fn(async () => ({ data: {}, error: null })),
      signInWithPassword: vi.fn(async () => ({ data: { session: { access_token: 't' } }, error: null })),
      verifyOtp: vi.fn(async () => ({ data: { session: { access_token: 't' } }, error: null })),
      resend: vi.fn(async () => ({ data: {}, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      getSession: vi.fn(async () => ({ data: { session: null } })),
      ...over,
    },
  } as never;
}

describe('signIn', () => {
  test('signIn maps email_not_confirmed', async () => {
    const c = fakeAuth({ signInWithPassword: vi.fn(async () => ({ data: {}, error: { code: 'email_not_confirmed', message: 'Email not confirmed', status: 400 } })) as never });
    expect(await signIn('a@b.co', 'senha-longa-1', c)).toEqual({ ok: false, code: 'email_not_confirmed' });
  });
  test('signIn maps invalid_credentials', async () => {
    const c = fakeAuth({ signInWithPassword: vi.fn(async () => ({ data: {}, error: { code: 'invalid_credentials', message: 'x', status: 400 } })) as never });
    expect(await signIn('a@b.co', 'senha-longa-1', c)).toEqual({ ok: false, code: 'invalid_credentials' });
  });
  test('maps rate limits, network and unknown', async () => {
    const mk = (error: object) => fakeAuth({ signInWithPassword: vi.fn(async () => ({ data: {}, error })) as never });
    expect(await signIn('a@b.co', 'x', mk({ code: 'over_request_rate_limit', message: '' }))).toEqual({ ok: false, code: 'rate_limited' });
    expect(await signIn('a@b.co', 'x', mk({ name: 'AuthRetryableFetchError', status: 0, message: '' }))).toEqual({ ok: false, code: 'network' });
    expect(await signIn('a@b.co', 'x', mk({ message: 'boom' }))).toEqual({ ok: false, code: 'unknown' });
  });
  test('returns the access token on success', async () => {
    expect(await signIn('a@b.co', 'x', fakeAuth())).toEqual({ ok: true, accessToken: 't' });
  });
});

describe('signUp', () => {
  test('signUp rejects weak password before calling Supabase', async () => {
    const c = fakeAuth();
    expect(await signUp('a@b.co', 'curta', c)).toEqual({ ok: false, code: 'weak_password' });
    expect(c.auth.signUp).not.toHaveBeenCalled();
  });
  test('signUp envia signup_product vision', async () => {
    const c = fakeAuth();
    await signUp('a@b.co', 'senha-longa-1', c);
    expect(c.auth.signUp).toHaveBeenCalledWith({ email: 'a@b.co', password: 'senha-longa-1', options: { data: { signup_product: 'vision' } } });
  });
  test('calls auth.signUp and maps weak_password from the server', async () => {
    const c = fakeAuth();
    expect(await signUp('a@b.co', 'senha-longa-1', c)).toEqual({ ok: true });
    const w = fakeAuth({ signUp: vi.fn(async () => ({ data: {}, error: { code: 'weak_password', message: '' } })) as never });
    expect(await signUp('a@b.co', 'senha-longa-1', w)).toEqual({ ok: false, code: 'weak_password' });
  });
});

describe('otp', () => {
  test('verifies with type signup and resends', async () => {
    const c = fakeAuth();
    expect(await verifySignupCode('a@b.co', '123456', c)).toEqual({ ok: true, accessToken: 't' });
    expect(c.auth.verifyOtp).toHaveBeenCalledWith({ email: 'a@b.co', token: '123456', type: 'signup' });
    expect(await resendSignupCode('a@b.co', c)).toEqual({ ok: true });
    expect(c.auth.resend).toHaveBeenCalledWith({ type: 'signup', email: 'a@b.co' });
  });
});
