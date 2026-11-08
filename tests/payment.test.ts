import { describe, expect, test } from 'vitest';
import { SUPABASE_ANON_KEY } from '../src/data/cloud';
import { submitPayLink } from '../src/lib/checkout';
import {
  approvedMessage,
  cardErrorMessage,
  cardFormToInput,
  formatBRL,
  formatCountdown,
  openPayState,
  parseOrderSummary,
  pixSecondsLeft,
  pollDelayMs,
  pollPaymentStatus,
  processPayment,
} from '../src/lib/payment';
import { PAYMENT_COPY } from '../src/data/checkout';

const ORDER = '0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e';

type Seen = { url?: string; init?: RequestInit };
function fakeFetch(status: number, body: unknown, seen: Seen = {}): typeof fetch {
  return (async (url: RequestInfo | URL, init?: RequestInit) => {
    seen.url = String(url);
    seen.init = init;
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}
const offline = (async () => {
  throw new TypeError('offline');
}) as typeof fetch;

const pix = { qr_code: '000201...', qr_code_base64: 'iVBORw0KGgo=', expires_at: '2026-11-08T12:30:00Z' };
const order = { order_id: ORDER, kind: 'renewal', title: 'Mensalidade da equipe Acme', amount_cents: 5997, buyer_email: 'ana@x.com', pix: null };

describe('submitPayLink: next pay', () => {
  test('returns the order summary', async () => {
    const res = await submitPayLink(ORDER, 'tok', fakeFetch(200, { next: 'pay', order }));
    expect(res).toEqual({ kind: 'pay', order: { ...order, kind: 'renewal', pix: null, in_flight: false } });
  });
  test('keeps an open Pix from the summary', async () => {
    const res = await submitPayLink(ORDER, 'tok', fakeFetch(200, { next: 'pay', order: { ...order, pix } }));
    expect(res).toMatchObject({ kind: 'pay', order: { pix } });
  });
  test('malformed order is a server error, never a pay page with garbage', async () => {
    for (const bad of [
      { ...order, amount_cents: 'x' },
      { ...order, kind: 'gift' },
      { ...order, title: undefined },
      { ...order, pix: { qr_code: 1 } },
      null,
    ]) {
      expect(await submitPayLink(ORDER, 'tok', fakeFetch(200, { next: 'pay', order: bad }))).toMatchObject({ kind: 'error', code: 'server_error' });
    }
  });
});

describe('parseOrderSummary', () => {
  test('accepts the server shape', () => {
    expect(parseOrderSummary({ ...order, kind: 'new' })?.kind).toBe('new');
    expect(parseOrderSummary({ ...order, amount_cents: -1 })).toBeNull();
  });
});

describe('card in review (in_flight)', () => {
  test('in_flight comes from the server; missing or not true means false', () => {
    expect(parseOrderSummary({ ...order, in_flight: true })?.in_flight).toBe(true);
    expect(parseOrderSummary(order)?.in_flight).toBe(false);
    expect(parseOrderSummary({ ...order, in_flight: 'yes' })?.in_flight).toBe(false);
  });
  test('an order with a card in review opens in the pending view; otherwise in the pay view', () => {
    const inReview = parseOrderSummary({ ...order, in_flight: true })!;
    expect(openPayState(inReview)).toEqual({ status: 'pending', order: inReview, message: PAYMENT_COPY.pendingDefault });
    const open = parseOrderSummary(order)!;
    expect(openPayState(open)).toEqual({ status: 'pay', order: open });
  });
});

describe('pollDelayMs', () => {
  test('10 s for the first 5 minutes, then 20 s', () => {
    expect(pollDelayMs(0)).toBe(10_000);
    expect(pollDelayMs(4 * 60_000 + 59_000)).toBe(10_000);
    expect(pollDelayMs(5 * 60_000)).toBe(20_000);
    expect(pollDelayMs(60 * 60_000)).toBe(20_000);
  });
});

describe('processPayment', () => {
  const card = {
    method: 'card' as const,
    attempt_id: 'a1',
    card_token: 'ctok',
    payment_method_id: 'visa',
    issuer_id: '25',
    installments: 1,
    payer: { email: 'ana@x.com', identification: { type: 'CPF', number: '12345678909' } },
  };

  test('posts to checkout-process with link token and card token apart', async () => {
    const seen: Seen = {};
    const res = await processPayment(ORDER, 'tok', card, fakeFetch(200, { status: 'approved', status_detail: 'accredited', message: 'ok' }, seen));
    expect(res).toEqual({ kind: 'approved' });
    expect(seen.url).toMatch(/\/functions\/v1\/checkout-process$/);
    expect(seen.init?.method).toBe('POST');
    expect((seen.init?.headers as Record<string, string>).apikey).toBe(SUPABASE_ANON_KEY);
    expect(JSON.parse(String(seen.init?.body))).toEqual({ order_id: ORDER, token: 'tok', ...card });
  });

  test('pending with Pix carries the QR', async () => {
    const body = { status: 'pending', status_detail: 'pending_waiting_transfer', message: 'Pague o Pix', pix: { ...pix, ticket_url: 'https://mp/x' } };
    const res = await processPayment(ORDER, 'tok', { method: 'pix', attempt_id: 'a2', payer: { email: 'ana@x.com' } }, fakeFetch(200, body));
    expect(res).toEqual({ kind: 'pending', message: 'Pague o Pix', pix: { ...pix, ticket_url: 'https://mp/x' } });
  });

  test('pending card (in analysis) has no Pix', async () => {
    const res = await processPayment(ORDER, 'tok', card, fakeFetch(200, { status: 'pending', status_detail: 'pending_contingency', message: 'Em análise' }));
    expect(res).toEqual({ kind: 'pending', message: 'Em análise' });
  });

  test('rejected carries the server reason', async () => {
    const res = await processPayment(ORDER, 'tok', card, fakeFetch(200, { status: 'rejected', status_detail: 'cc_rejected_insufficient_amount', message: 'Saldo insuficiente.' }));
    expect(res).toEqual({ kind: 'rejected', message: 'Saldo insuficiente.' });
  });

  test('rejected without a message still says something', async () => {
    const res = await processPayment(ORDER, 'tok', card, fakeFetch(200, { status: 'rejected' }));
    expect(res.kind).toBe('rejected');
    expect(res.kind === 'rejected' && res.message.length > 0).toBe(true);
  });

  test('HTTP errors map to codes with local copy', async () => {
    const cases: [number, unknown, string][] = [
      [400, { error: 'validation_error', field: 'payer.email', message: 'x' }, 'validation_error'],
      [404, { error: 'invalid_link' }, 'invalid_link'],
      [409, { error: 'already_paid' }, 'already_paid'],
      [409, { error: 'attempt_reused', message: 'Gere o Pix de novo.' }, 'attempt_reused'],
      [410, { error: 'expired' }, 'expired'],
      [429, {}, 'rate_limited'],
      [502, {}, 'mp_unavailable'],
      [500, {}, 'server_error'],
    ];
    for (const [status, body, code] of cases) {
      const res = await processPayment(ORDER, 'tok', card, fakeFetch(status, body));
      expect(res).toMatchObject({ kind: 'error', code });
      expect(res.kind === 'error' && res.message.length > 0).toBe(true);
    }
    const reused = await processPayment(ORDER, 'tok', card, fakeFetch(409, { error: 'attempt_reused' }));
    expect(reused).toMatchObject({ message: 'Gere o Pix de novo.' });
  });

  test('unexpected 200 body is an error', async () => {
    expect(await processPayment(ORDER, 'tok', card, fakeFetch(200, { status: 'weird' }))).toMatchObject({ kind: 'error', code: 'server_error' });
  });

  test('network failure is reported', async () => {
    expect(await processPayment(ORDER, 'tok', card, offline)).toMatchObject({ kind: 'error', code: 'network_error' });
  });
});

describe('pollPaymentStatus', () => {
  test('returns the status', async () => {
    for (const status of ['pending', 'approved', 'rejected', 'expired'] as const) {
      const seen: Seen = {};
      expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(200, { status }, seen))).toBe(status);
      expect(seen.url).toMatch(/checkout-status$/);
      expect(JSON.parse(String(seen.init?.body))).toEqual({ order_id: ORDER, token: 'tok' });
    }
  });
  test('failures read as still pending (the next tick tries again)', async () => {
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(500, {}))).toBe('pending');
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(200, { status: '?' }))).toBe('pending');
    expect(await pollPaymentStatus(ORDER, 'tok', offline)).toBe('pending');
  });
  test('a paid order reads as approved', async () => {
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(409, { error: 'already_paid' }))).toBe('approved');
  });
  test('a link the server no longer knows is final, not polled forever', async () => {
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(404, { error: 'invalid_link' }))).toBe('invalid_link');
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(400, { error: 'validation_error' }))).toBe('invalid_link');
  });
  test('rate limit and server failures keep polling', async () => {
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(429, { error: 'rate_limited' }))).toBe('pending');
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(502, {}))).toBe('pending');
  });
  test('an expired link reads as expired', async () => {
    expect(await pollPaymentStatus(ORDER, 'tok', fakeFetch(410, { error: 'expired' }))).toBe('expired');
  });
});

describe('cardErrorMessage', () => {
  test('attempt_reused on the card says try again, not "Gere o Pix"', () => {
    expect(cardErrorMessage({ kind: 'error', code: 'attempt_reused', message: 'Gere o Pix de novo.' })).toBe('Tente de novo.');
    expect(cardErrorMessage({ kind: 'error', code: 'rate_limited', message: 'x' })).toBe('x');
  });
});

describe('cardFormToInput', () => {
  test('maps the Brick form data; the card token goes to card_token', () => {
    const input = cardFormToInput(
      {
        token: 'ctok',
        payment_method_id: 'master',
        issuer_id: '24',
        installments: 1,
        payer: { email: 'ana@x.com', identification: { type: 'CPF', number: '123' } },
      },
      'fallback@x.com',
    );
    expect(input).toEqual({
      method: 'card',
      card_token: 'ctok',
      payment_method_id: 'master',
      issuer_id: '24',
      installments: 1,
      payer: { email: 'ana@x.com', identification: { type: 'CPF', number: '123' } },
    });
  });
  test('falls back to the buyer e-mail and drops empty issuer', () => {
    const input = cardFormToInput({ token: 't', payment_method_id: 'visa', installments: 1, payer: {} }, 'b@x.com');
    expect(input).toEqual({ method: 'card', card_token: 't', payment_method_id: 'visa', installments: 1, payer: { email: 'b@x.com' } });
  });
});

describe('display helpers', () => {
  test('formatBRL', () => {
    expect(formatBRL(5997)).toBe('R$ 59,97');
  });
  test('pix countdown', () => {
    const now = Date.parse('2026-11-08T12:00:00Z');
    expect(pixSecondsLeft('2026-11-08T12:30:00Z', now)).toBe(1800);
    expect(pixSecondsLeft('2026-11-08T11:00:00Z', now)).toBe(0);
    expect(pixSecondsLeft('lixo', now)).toBe(0);
    expect(formatCountdown(1800)).toBe('30:00');
    expect(formatCountdown(65)).toBe('01:05');
    expect(formatCountdown(3725)).toBe('1:02:05');
  });
  test('approved message depends on the order kind', () => {
    expect(approvedMessage('renewal')).toBe('Pagamento confirmado. Pode voltar ao Vision — a equipe já está atualizada.');
    expect(approvedMessage('seats')).toBe('Pagamento confirmado. Pode voltar ao Vision — a equipe já está atualizada.');
    expect(approvedMessage('new')).toBe('Pagamento confirmado. Enviamos o acesso para o seu e-mail.');
  });
});
