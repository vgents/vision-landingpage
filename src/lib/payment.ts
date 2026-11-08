/**
 * Checkout transparente: o pagamento acontece na página do site (cartão pelo
 * Card Payment Brick, Pix com QR Code), sem ir para a página do Mercado Pago.
 * O webhook continua sendo a fonte de verdade; aqui só pedimos e consultamos.
 */
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../data/cloud';
import { CHECKOUT_ERROR_DEFAULT, CHECKOUT_ERROR_MESSAGES, PAYMENT_COPY } from '../data/checkout';
import { formatPrice } from './plans';

export type PayOrderKind = 'new' | 'renewal' | 'seats';

export type PixData = { qr_code: string; qr_code_base64: string; expires_at: string; ticket_url?: string };

/** O que `checkout-pay` devolve em `next: 'pay'`. O valor vem sempre do servidor. */
export type PayOrderSummary = {
  order_id: string;
  kind: PayOrderKind;
  title: string;
  amount_cents: number;
  buyer_email: string;
  pix: PixData | null;
};

export type PayerIdentification = { type: string; number: string };

export type PayMethodInput =
  | {
      method: 'card';
      card_token: string;
      payment_method_id: string;
      issuer_id?: string;
      installments: number;
      payer: { email: string; identification?: PayerIdentification };
    }
  | { method: 'pix'; payer: { email: string; first_name?: string; identification?: PayerIdentification } };

export type ProcessOutcome =
  | { kind: 'approved' }
  | { kind: 'pending'; message: string; pix?: PixData }
  | { kind: 'rejected'; message: string }
  | { kind: 'error'; code: string; message: string };

/** `invalid_link`: o servidor não reconhece mais o link (404/4xx) — final, não se consulta de novo. */
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'invalid_link';

const PAY_ORDER_KINDS: readonly string[] = ['new', 'renewal', 'seats'];

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

export function parsePix(value: unknown): PixData | null {
  if (!isRecord(value) || !isText(value.qr_code) || !isText(value.qr_code_base64) || !isText(value.expires_at)) return null;
  return {
    qr_code: value.qr_code,
    qr_code_base64: value.qr_code_base64,
    expires_at: value.expires_at,
    ...(isText(value.ticket_url) ? { ticket_url: value.ticket_url } : {}),
  };
}

/** Valida o resumo do pedido; qualquer campo fora do formato invalida tudo. */
export function parseOrderSummary(value: unknown): PayOrderSummary | null {
  if (!isRecord(value)) return null;
  const { order_id, kind, title, amount_cents, buyer_email } = value;
  if (!isText(order_id) || !isText(title) || !isText(buyer_email)) return null;
  if (typeof kind !== 'string' || !PAY_ORDER_KINDS.includes(kind)) return null;
  if (typeof amount_cents !== 'number' || !Number.isInteger(amount_cents) || amount_cents <= 0) return null;
  let pix: PixData | null = null;
  if (value.pix != null) {
    pix = parsePix(value.pix);
    if (!pix) return null;
  }
  return { order_id, kind: kind as PayOrderKind, title, amount_cents, buyer_email, pix };
}

function paymentErrorMessage(code: string): string {
  return PAYMENT_COPY.errors[code] ?? CHECKOUT_ERROR_MESSAGES[code] ?? CHECKOUT_ERROR_DEFAULT;
}

async function post(name: string, body: Record<string, unknown>, fetchImpl: typeof fetch) {
  const res = await fetchImpl(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as unknown;
  return { res, data: isRecord(data) ? data : null };
}

const ERROR_BY_STATUS: Record<number, string> = { 400: 'validation_error', 404: 'invalid_link', 409: 'already_paid', 410: 'expired', 429: 'rate_limited', 502: 'mp_unavailable' };
const KNOWN_PROCESS_ERRORS = new Set(['validation_error', 'invalid_link', 'already_paid', 'attempt_reused', 'expired', 'rate_limited', 'mp_unavailable']);

/**
 * Paga o pedido por `checkout-process`. `token` é o do link do e-mail; o token
 * do cartão vai em `card_token`. `attempt_id` deve ser novo a cada envio: o
 * servidor devolve o mesmo pagamento para um id repetido.
 */
export async function processPayment(
  orderId: string,
  token: string,
  input: PayMethodInput & { attempt_id: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ProcessOutcome> {
  const fail = (code: string): ProcessOutcome => ({ kind: 'error', code, message: paymentErrorMessage(code) });
  let res: Response;
  let data: Record<string, unknown> | null;
  try {
    ({ res, data } = await post('checkout-process', { order_id: orderId, token, ...input }, fetchImpl));
  } catch {
    return fail('network_error');
  }
  if (!res.ok) {
    const serverCode = typeof data?.error === 'string' ? data.error : '';
    return fail(KNOWN_PROCESS_ERRORS.has(serverCode) ? serverCode : ERROR_BY_STATUS[res.status] ?? 'server_error');
  }
  const message = isText(data?.message) ? data.message : '';
  switch (data?.status) {
    case 'approved':
      return { kind: 'approved' };
    case 'pending': {
      const pix = parsePix(data.pix);
      return { kind: 'pending', message: message || PAYMENT_COPY.pendingDefault, ...(pix ? { pix } : {}) };
    }
    case 'rejected':
      return { kind: 'rejected', message: message || PAYMENT_COPY.rejectedDefault };
    default:
      return fail('server_error');
  }
}

/**
 * Consulta `checkout-status`. Falha de rede, 429 e 5xx contam como `pending`:
 * a próxima consulta tenta de novo, e nada é afirmado sem o servidor. Outros
 * 4xx (link desconhecido) são finais: `invalid_link`, para não consultar para sempre.
 */
export async function pollPaymentStatus(orderId: string, token: string, fetchImpl: typeof fetch = fetch): Promise<PaymentStatus> {
  try {
    const { res, data } = await post('checkout-status', { order_id: orderId, token }, fetchImpl);
    if (res.status === 409 && data?.error === 'already_paid') return 'approved';
    if (res.status === 410) return 'expired';
    if (res.status >= 400 && res.status < 500 && res.status !== 429) return 'invalid_link';
    if (!res.ok) return 'pending';
    const status = data?.status;
    return status === 'approved' || status === 'rejected' || status === 'expired' ? status : 'pending';
  } catch {
    return 'pending';
  }
}

/** Mensagem de erro na aba Cartão: `attempt_reused` fala de Pix, então lá vira "Tente de novo.". */
export function cardErrorMessage(outcome: Extract<ProcessOutcome, { kind: 'error' }>): string {
  return outcome.code === 'attempt_reused' ? PAYMENT_COPY.cardRetry : outcome.message;
}

/** Formato do `onSubmit` do Card Payment Brick. */
export type CardBrickFormData = {
  token: string;
  payment_method_id: string;
  issuer_id?: string | number | null;
  installments: number;
  payer?: { email?: string; identification?: { type?: string; number?: string } };
};

/** Brick → corpo de `checkout-process` (o `token` do Brick vira `card_token`). */
export function cardFormToInput(form: CardBrickFormData, buyerEmail: string): Extract<PayMethodInput, { method: 'card' }> {
  const issuer = form.issuer_id == null || form.issuer_id === '' ? undefined : String(form.issuer_id);
  const id = form.payer?.identification;
  const identification = id && isText(id.type) && isText(id.number) ? { type: id.type, number: id.number } : undefined;
  return {
    method: 'card',
    card_token: form.token,
    payment_method_id: form.payment_method_id,
    ...(issuer ? { issuer_id: issuer } : {}),
    installments: Number(form.installments) || 1,
    payer: { email: isText(form.payer?.email) ? form.payer.email : buyerEmail, ...(identification ? { identification } : {}) },
  };
}

export const formatBRL = formatPrice;

/** Segundos até `expiresAt` (0 se passou ou se a data é inválida). */
export function pixSecondsLeft(expiresAt: string, now: number = Date.now()): number {
  const end = Date.parse(expiresAt);
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - now) / 1000));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `65` → `01:05`; acima de uma hora, `1:02:05`. */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function approvedMessage(kind: PayOrderKind): string {
  return kind === 'new' ? PAYMENT_COPY.approvedNew : PAYMENT_COPY.approvedTeam;
}

/** Id novo para cada envio ao `checkout-process`. */
export function newAttemptId(): string {
  return crypto.randomUUID();
}

// ---- SDK do Mercado Pago (só no navegador) ----

export type CardBrickController = { unmount: () => void };

export type MercadoPagoInstance = {
  bricks: () => {
    create: (brick: 'cardPayment', containerId: string, settings: Record<string, unknown>) => Promise<CardBrickController>;
  };
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;
  }
}

export const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

let sdkPromise: Promise<NonNullable<Window['MercadoPago']>> | null = null;

/** Carrega o SDK uma vez só; uma falha libera nova tentativa. */
export function loadMercadoPagoSdk(): Promise<NonNullable<Window['MercadoPago']>> {
  if (window.MercadoPago) return Promise.resolve(window.MercadoPago);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MP_SDK_URL;
    script.async = true;
    script.onload = () => (window.MercadoPago ? resolve(window.MercadoPago) : reject(new Error('sdk_missing')));
    script.onerror = () => reject(new Error('sdk_failed'));
    document.head.appendChild(script);
  });
  sdkPromise.catch(() => {
    sdkPromise = null;
  });
  return sdkPromise;
}

/** Chave pública do Mercado Pago (variável do Vercel). Vazia = cartão indisponível. */
export function mercadoPagoPublicKey(): string {
  return (import.meta.env.VITE_MP_PUBLIC_KEY ?? '').trim();
}
