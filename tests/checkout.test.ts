import { describe, expect, test } from 'vitest';
import { SUPABASE_ANON_KEY } from '../src/data/cloud';
import {
  checkoutErrorMessage,
  isAllowedCheckoutUrl,
  payLinkView,
  resendCheckout,
  submitPayLink,
  singleFlight,
  submitCheckout,
  validateCheckoutForm,
  type CheckoutForm,
} from '../src/lib/checkout';

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
    expect(validateCheckoutForm({ ...ok, companyName: '' }, 'team')).toHaveProperty('companyName');
    expect(validateCheckoutForm({ ...ok, companyName: '' }, 'solo')).toEqual({});
  });
  test('terms, name and e-mail', () => {
    expect(validateCheckoutForm({ ...ok, acceptTerms: false }, 'solo')).toHaveProperty('acceptTerms');
    expect(validateCheckoutForm({ ...ok, buyerName: '  ' }, 'solo')).toHaveProperty('buyerName');
    expect(validateCheckoutForm({ ...ok, buyerName: 'a'.repeat(121) }, 'solo')).toHaveProperty('buyerName');
    expect(validateCheckoutForm({ ...ok, buyerEmail: 'ana@x' }, 'solo')).toHaveProperty('buyerEmail');
    expect(validateCheckoutForm({ ...ok, buyerEmail: ' Ana@X.com ' }, 'solo')).toEqual({});
    expect(validateCheckoutForm(ok, 'team')).toEqual({});
  });
});

const ORDER = '0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e';
const created = { order_id: 'o1', next: 'check_email', email: 'ana@x.com' };

describe('submitCheckout', () => {
  test('team body carries choice, seats and company, never a price', async () => {
    const seen: Seen = {};
    await submitCheckout('team', 5, { ...ok, buyerName: ' Ana ', buyerEmail: ' Ana@X.com ' }, fakeFetch(200, created, seen));
    expect(seen.url).toMatch(/\/functions\/v1\/checkout-create$/);
    expect(seen.init?.method).toBe('POST');
    expect((seen.init?.headers as Record<string, string>).apikey).toBe(SUPABASE_ANON_KEY);
    const body = JSON.parse(String(seen.init?.body));
    expect(body).toEqual({ choice: 'team', seats: 5, buyer_name: 'Ana', buyer_email: 'ana@x.com', company_name: 'Acme', accept_terms: true });
    expect(Object.keys(body).filter((k) => /price|cents|amount|total/i.test(k))).toEqual([]);
  });

  test('solo forces one seat and drops company', async () => {
    const seen: Seen = {};
    await submitCheckout('solo', 9, ok, fakeFetch(200, created, seen));
    expect(JSON.parse(String(seen.init?.body))).toEqual({ choice: 'solo', seats: 1, buyer_name: 'Ana', buyer_email: 'ana@x.com', accept_terms: true });
  });

  test('check_email carries order and e-mail', async () => {
    expect(await submitCheckout('solo', 1, ok, fakeFetch(200, created))).toEqual({ kind: 'check_email', orderId: 'o1', email: 'ana@x.com' });
  });

  test('server error maps to local copy', async () => {
    const res = await submitCheckout('solo', 1, ok, fakeFetch(409, { error: 'already_has_solo', message: 'x' }));
    expect(res).toMatchObject({ kind: 'error', code: 'already_has_solo', message: 'Este e-mail já tem o plano Somente eu ativo. Entre no app.' });
  });

  test('validation error points to the form field', async () => {
    const res = await submitCheckout('team', 2, ok, fakeFetch(400, { error: 'validation_error', field: 'company_name', message: 'x' }));
    expect(res).toMatchObject({ kind: 'error', code: 'validation_error', field: 'companyName' });
  });

  test('unexpected 200 body is an error, never a silent success', async () => {
    expect((await submitCheckout('solo', 1, ok, fakeFetch(200, { ok: true }))).kind).toBe('error');
  });

  test('network failure is reported', async () => {
    const res = await submitCheckout('solo', 1, ok, (async () => {
      throw new TypeError('offline');
    }) as typeof fetch);
    expect(res).toMatchObject({ kind: 'error', code: 'network_error' });
  });

  test('every known code has its own copy', () => {
    const fallback = checkoutErrorMessage('???');
    for (const code of ['validation_error', 'already_has_solo', 'already_in_team', 'rate_limited', 'mp_unavailable', 'email_failed', 'server_misconfigured', 'network_error', 'expired', 'already_paid', 'invalid_link']) {
      expect(checkoutErrorMessage(code)).not.toBe(fallback);
    }
  });
});

describe('resendCheckout', () => {
  test('sends resend body to the same endpoint', async () => {
    const seen: Seen = {};
    const res = await resendCheckout('o1', ' Ana@X.com ', fakeFetch(200, created, seen));
    expect(seen.url).toMatch(/checkout-create$/);
    expect(JSON.parse(String(seen.init?.body))).toEqual({ resend_order_id: 'o1', buyer_email: 'ana@x.com' });
    expect(res.kind).toBe('check_email');
  });
  test('410 is expired', async () => {
    expect(await resendCheckout('o1', 'a@x.com', fakeFetch(410, { error: 'expired' }))).toMatchObject({ kind: 'error', code: 'expired' });
  });
});

describe('submitPayLink', () => {
  const mp = 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1';
  test('posts order and token, redirects only to allowed hosts', async () => {
    const seen: Seen = {};
    expect(await submitPayLink(ORDER, 'tok', fakeFetch(200, { next: 'redirect', redirect_url: mp }, seen))).toEqual({ kind: 'redirect', url: mp });
    expect(seen.url).toMatch(/checkout-pay$/);
    expect(JSON.parse(String(seen.init?.body))).toEqual({ order_id: ORDER, token: 'tok' });
    expect(await submitPayLink(ORDER, 'tok', fakeFetch(200, { next: 'redirect', redirect_url: 'https://evil.example/x' }))).toMatchObject({ kind: 'error', code: 'server_error' });
  });
  test('statuses map to copy', async () => {
    const cases: [number, string, string][] = [
      [410, 'expired', 'Este link venceu. Faça o pedido de novo.'],
      [409, 'already_paid', 'Pagamento já confirmado. Confira seu e-mail para entrar.'],
      [404, 'invalid_link', 'Link inválido ou substituído por um mais recente. Use o último e-mail ou o botão Pagar mensalidade no app.'],
      [429, 'rate_limited', checkoutErrorMessage('rate_limited')],
      [502, 'mp_unavailable', checkoutErrorMessage('mp_unavailable')],
    ];
    for (const [status, code, message] of cases) {
      expect(await submitPayLink(ORDER, 't', fakeFetch(status, {}))).toEqual({ kind: 'error', code, message });
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

describe('429 rate limit', () => {
  test('429 with or without a body shows the friendly message', async () => {
    for (const body of [{ error: 'rate_limited' }, {}]) {
      const res = await submitCheckout('solo', 1, ok, fakeFetch(429, body));
      expect(res).toMatchObject({ kind: 'error', code: 'rate_limited' });
      expect((res as { message: string }).message).toMatch(/Muitas tentativas.*minutos/);
    }
  });
});

describe('payLinkView (link vencido ou já pago)', () => {
  test('o kind do pedido vem do corpo do erro', async () => {
    expect(await submitPayLink(ORDER, 't', fakeFetch(410, { error: 'expired', kind: 'renewal' }))).toMatchObject({ code: 'expired', orderKind: 'renewal' });
    expect(await submitPayLink(ORDER, 't', fakeFetch(409, { error: 'already_paid', kind: 'seats' }))).toMatchObject({ code: 'already_paid', orderKind: 'seats' });
    expect(await submitPayLink(ORDER, 't', fakeFetch(410, { error: 'expired', kind: 'outro' }))).not.toHaveProperty('orderKind');
  });

  test('vencido de mensalidade ou vagas manda gerar outro no app, sem "fazer o pedido de novo"', () => {
    for (const orderKind of ['renewal', 'seats'] as const) {
      const view = payLinkView({ kind: 'error', code: 'expired', message: 'x', orderKind });
      expect(view).toMatchObject({
        tone: 'error',
        message: 'Este link venceu. Gere um novo em Minha equipe → Pagar mensalidade no app.',
        showNewOrder: false,
      });
    }
  });

  test('vencido de pedido novo mantém o texto e o botão de pedir de novo', () => {
    const message = checkoutErrorMessage('expired');
    expect(payLinkView({ kind: 'error', code: 'expired', message, orderKind: 'new' })).toMatchObject({ tone: 'error', message, showNewOrder: true });
    expect(payLinkView({ kind: 'error', code: 'expired', message })).toMatchObject({ tone: 'error', message, showNewOrder: true });
  });

  test('já pago é uma página de sucesso', () => {
    const view = payLinkView({ kind: 'error', code: 'already_paid', message: checkoutErrorMessage('already_paid') });
    expect(view).toMatchObject({ tone: 'success', message: 'Pagamento já confirmado. Confira seu e-mail para entrar.', showNewOrder: false });
    expect(view.title).not.toBe('Não foi possível abrir o pagamento');
  });

  test('outros erros seguem como erro', () => {
    expect(payLinkView({ kind: 'error', code: 'invalid_link', message: 'm' })).toMatchObject({ tone: 'error', message: 'm', showNewOrder: false, title: 'Não foi possível abrir o pagamento' });
  });
});
