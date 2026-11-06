import { describe, expect, test } from 'vitest';
import { SUPABASE_ANON_KEY } from '../src/data/cloud';
import { FALLBACK_PLANS } from '../src/data/plans';
import {
  checkoutErrorMessage,
  isAllowedCheckoutUrl,
  singleFlight,
  submitCheckout,
  validateCheckoutForm,
  type CheckoutForm,
} from '../src/lib/checkout';

const INDIVIDUAL = FALLBACK_PLANS.find((p) => p.id === 'individual')!;
const STARTUP = FALLBACK_PLANS.find((p) => p.id === 'startup')!;
const ok: CheckoutForm = { buyerName: 'Ana', buyerEmail: 'ana@x.com', companyName: 'Acme', acceptTerms: true };

type Seen = { url?: string; init?: RequestInit };
function fakeFetch(status: number, body: unknown, seen: Seen = {}): typeof fetch {
  return (async (url: RequestInfo | URL, init?: RequestInit) => {
    seen.url = String(url);
    seen.init = init;
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

describe('validateCheckoutForm', () => {
  test('company required only when the plan asks for it', () => {
    expect(validateCheckoutForm({ ...ok, companyName: '' }, STARTUP)).toHaveProperty('companyName');
    expect(validateCheckoutForm({ ...ok, companyName: '' }, INDIVIDUAL)).toEqual({});
  });
  test('terms, name and e-mail', () => {
    expect(validateCheckoutForm({ ...ok, acceptTerms: false }, INDIVIDUAL)).toHaveProperty('acceptTerms');
    expect(validateCheckoutForm({ ...ok, buyerName: '  ' }, INDIVIDUAL)).toHaveProperty('buyerName');
    expect(validateCheckoutForm({ ...ok, buyerName: 'a'.repeat(121) }, INDIVIDUAL)).toHaveProperty('buyerName');
    expect(validateCheckoutForm({ ...ok, buyerEmail: 'ana@x' }, INDIVIDUAL)).toHaveProperty('buyerEmail');
    expect(validateCheckoutForm({ ...ok, buyerEmail: ' Ana@X.com ' }, INDIVIDUAL)).toEqual({});
    expect(validateCheckoutForm(ok, STARTUP)).toEqual({});
  });
});

describe('submitCheckout', () => {
  test('sends normalized email and omits empty company', async () => {
    const seen: Seen = {};
    await submitCheckout(
      'individual',
      { ...ok, buyerName: ' Ana ', buyerEmail: ' Ana@X.com ', companyName: '  ' },
      fakeFetch(200, { order_id: 'o1', status: 'awaiting_confirmation', next: 'check_email' }, seen),
    );
    expect(seen.url).toMatch(/\/functions\/v1\/checkout-create$/);
    expect(seen.init?.method).toBe('POST');
    expect((seen.init?.headers as Record<string, string>).apikey).toBe(SUPABASE_ANON_KEY);
    const body = JSON.parse(String(seen.init?.body));
    expect(body).toEqual({ plan_id: 'individual', buyer_name: 'Ana', buyer_email: 'ana@x.com', accept_terms: true });
  });

  test('sends company when filled', async () => {
    const seen: Seen = {};
    await submitCheckout('startup', ok, fakeFetch(200, { order_id: 'o1', next: 'check_email' }, seen));
    expect(JSON.parse(String(seen.init?.body)).company_name).toBe('Acme');
  });

  test('free response becomes check_email', async () => {
    const res = await submitCheckout(
      'individual',
      ok,
      fakeFetch(200, { order_id: 'o1', status: 'awaiting_confirmation', next: 'check_email' }),
    );
    expect(res).toEqual({ kind: 'check_email', orderId: 'o1' });
  });

  test('paid response becomes redirect', async () => {
    const res = await submitCheckout(
      'empresas',
      ok,
      fakeFetch(200, { order_id: 'o2', status: 'pending', next: 'redirect', redirect_url: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1' }),
    );
    expect(res).toEqual({ kind: 'redirect', url: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1' });
  });

  test('server error maps to local copy', async () => {
    const res = await submitCheckout('individual', ok, fakeFetch(409, { error: 'already_in_team', message: 'x' }));
    expect(res.kind).toBe('error');
    if (res.kind !== 'error') return;
    expect(res.code).toBe('already_in_team');
    expect(res.message).toBe(checkoutErrorMessage('already_in_team'));
    expect(res.message).not.toBe('x');
  });

  test('validation error points to the form field', async () => {
    const res = await submitCheckout(
      'startup',
      ok,
      fakeFetch(400, { error: 'validation_error', field: 'company_name', message: 'x' }),
    );
    expect(res).toMatchObject({ kind: 'error', code: 'validation_error', field: 'companyName' });
  });

  test('unexpected 200 body is an error, never a silent success', async () => {
    const res = await submitCheckout('individual', ok, fakeFetch(200, { ok: true }));
    expect(res.kind).toBe('error');
  });

  test('network failure is reported', async () => {
    const res = await submitCheckout('individual', ok, (async () => {
      throw new TypeError('offline');
    }) as typeof fetch);
    expect(res).toMatchObject({ kind: 'error', code: 'network_error' });
  });

  test('every known code has its own copy', () => {
    const fallback = checkoutErrorMessage('???');
    for (const code of [
      'validation_error',
      'invalid_plan',
      'already_in_team',
      'rate_limited',
      'mp_unavailable',
      'email_failed',
      'server_misconfigured',
      'network_error',
    ]) {
      expect(checkoutErrorMessage(code)).not.toBe(fallback);
    }
  });
});

describe('singleFlight (submitting state)', () => {
  test('double click creates a single order', async () => {
    let calls = 0;
    const guard = singleFlight(async () => {
      calls += 1;
      return 'ok';
    });
    const [a, b] = await Promise.all([guard.run(), guard.run()]);
    expect(calls).toBe(1);
    expect([a, b]).toEqual(['ok', null]);
    expect(guard.busy).toBe(true);
    guard.release();
    await guard.run();
    expect(calls).toBe(2);
  });
});

describe('isAllowedCheckoutUrl', () => {
  test('accepts Mercado Pago hosts over https', () => {
    for (const u of [
      'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1',
      'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=1',
      'https://mercadopago.com.br/x',
    ]) {
      expect(isAllowedCheckoutUrl(u)).toBe(true);
    }
  });
  test('rejects other hosts, http, lookalikes and credentials', () => {
    for (const u of [
      'https://evil.example/x',
      'http://www.mercadopago.com.br/x',
      'https://www.mercadopago.com.br.evil.example/x',
      'https://evilmercadopago.com.br/x',
      'https://user:pw@www.mercadopago.com.br/x',
      'javascript:alert(1)',
      'not a url',
    ]) {
      expect(isAllowedCheckoutUrl(u)).toBe(false);
    }
  });
  test('submitCheckout refuses a redirect to a foreign host', async () => {
    const res = await submitCheckout('individual', ok, (async () =>
      new Response(JSON.stringify({ next: 'redirect', redirect_url: 'https://evil.example/pay' }), { status: 200 })) as typeof fetch);
    expect(res).toMatchObject({ kind: 'error', code: 'server_error' });
  });
});

describe('singleFlight on failure', () => {
  test('a throwing call releases the guard', async () => {
    const guard = singleFlight(async () => {
      throw new Error('boom');
    });
    await expect(guard.run()).rejects.toThrow('boom');
    expect(guard.busy).toBe(false);
  });
});
