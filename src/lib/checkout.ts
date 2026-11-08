import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../data/cloud';
import { CHECKOUT_ERROR_DEFAULT, CHECKOUT_ERROR_MESSAGES, CHECKOUT_FIELD_MESSAGES } from '../data/checkout';
import type { PlanChoice } from './seatPricing';

export type CheckoutForm = { buyerName: string; buyerEmail: string; companyName: string; acceptTerms: boolean };

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export type CheckoutOutcome =
  | { kind: 'check_email'; orderId: string; email: string }
  | { kind: 'error'; code: string; message: string; field?: keyof CheckoutForm };

const MAX_TEXT = 120;

/** Hosts do Mercado Pago para onde o servidor pode mandar o comprador. */
const CHECKOUT_HOSTS = new Set(['www.mercadopago.com.br', 'sandbox.mercadopago.com.br', 'mercadopago.com.br']);

/** Só `https` em host do Mercado Pago, sem credenciais embutidas. */
export function isAllowedCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && CHECKOUT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
/** Mesmo padrão do servidor (`team-rules.ts`). */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export function validateCheckoutForm(form: CheckoutForm, choice: PlanChoice): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = form.buyerName.trim();
  if (!name || name.length > MAX_TEXT) errors.buyerName = CHECKOUT_FIELD_MESSAGES.buyerName;
  if (!EMAIL_RE.test(normalizeEmail(form.buyerEmail))) errors.buyerEmail = CHECKOUT_FIELD_MESSAGES.buyerEmail;
  const company = form.companyName.trim();
  if (choice === 'team' && (!company || company.length > MAX_TEXT)) {
    errors.companyName = CHECKOUT_FIELD_MESSAGES.companyName;
  }
  if (!form.acceptTerms) errors.acceptTerms = CHECKOUT_FIELD_MESSAGES.acceptTerms;
  return errors;
}

export function checkoutErrorMessage(code: string): string {
  return CHECKOUT_ERROR_MESSAGES[code] ?? CHECKOUT_ERROR_DEFAULT;
}

const SERVER_FIELDS: Record<string, keyof CheckoutForm> = {
  buyer_name: 'buyerName',
  buyer_email: 'buyerEmail',
  company_name: 'companyName',
  accept_terms: 'acceptTerms',
};

function errorOutcome(code: string, serverField?: unknown): CheckoutOutcome {
  const field = typeof serverField === 'string' ? SERVER_FIELDS[serverField] : undefined;
  if (code === 'validation_error' && field) {
    return { kind: 'error', code, field, message: CHECKOUT_FIELD_MESSAGES[field] };
  }
  return { kind: 'error', code, message: checkoutErrorMessage(code) };
}

async function postCreate(body: Record<string, unknown>, fetchImpl: typeof fetch): Promise<CheckoutOutcome> {
  let res: Response;
  try {
    res = await fetchImpl(`${FUNCTIONS_URL}/checkout-create`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return errorOutcome('network_error');
  }

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    return errorOutcome(
      typeof data?.error === 'string' ? data.error : res.status === 429 ? 'rate_limited' : 'server_error',
      data?.field,
    );
  }
  if (data?.next === 'check_email' && typeof data.order_id === 'string' && typeof data.email === 'string') {
    return { kind: 'check_email', orderId: data.order_id, email: data.email };
  }
  return errorOutcome('server_error');
}

/**
 * Cria o pedido em `checkout-create`. O corpo leva só escolha e quantidade:
 * o preço é sempre calculado no servidor.
 */
export function submitCheckout(
  choice: PlanChoice,
  seats: number,
  form: CheckoutForm,
  fetchImpl: typeof fetch = fetch,
): Promise<CheckoutOutcome> {
  const company = form.companyName.trim();
  return postCreate(
    {
      choice,
      seats: choice === 'solo' ? 1 : seats,
      buyer_name: form.buyerName.trim(),
      buyer_email: normalizeEmail(form.buyerEmail),
      ...(choice === 'team' && company ? { company_name: company } : {}),
      accept_terms: true,
    },
    fetchImpl,
  );
}

/** Reenvia o e-mail do pedido já criado (mesmo endpoint, outro corpo). */
export function resendCheckout(orderId: string, email: string, fetchImpl: typeof fetch = fetch): Promise<CheckoutOutcome> {
  return postCreate({ resend_order_id: orderId, buyer_email: normalizeEmail(email) }, fetchImpl);
}

export type PayOutcome = { kind: 'redirect'; url: string } | { kind: 'error'; code: string; message: string };

/** Troca o link do e-mail (`pedido` + `t`) pelo endereço de pagamento do Mercado Pago. */
export async function submitPayLink(
  orderId: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PayOutcome> {
  const fail = (code: string): PayOutcome => ({ kind: 'error', code, message: checkoutErrorMessage(code) });
  let res: Response;
  try {
    res = await fetchImpl(`${FUNCTIONS_URL}/checkout-pay`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, token }),
    });
  } catch {
    return fail('network_error');
  }
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (res.ok) {
    if (data?.next === 'redirect' && typeof data.redirect_url === 'string' && isAllowedCheckoutUrl(data.redirect_url)) {
      return { kind: 'redirect', url: data.redirect_url };
    }
    return fail('server_error');
  }
  const byStatus: Record<number, string> = { 410: 'expired', 409: 'already_paid', 404: 'invalid_link', 429: 'rate_limited', 502: 'mp_unavailable' };
  const code = byStatus[res.status] ?? (typeof data?.error === 'string' && data.error in CHECKOUT_ERROR_MESSAGES ? data.error : 'server_error');
  return fail(code);
}

/**
 * Envio único: enquanto uma chamada está em andamento, as seguintes recebem
 * `null` sem chamar nada (clique duplo em "Confirmar pedido" = um pedido só).
 * `release()` libera para uma nova tentativa depois de um erro.
 */
export function singleFlight<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  let busy = false;
  return {
    get busy() {
      return busy;
    },
    async run(...args: A): Promise<R | null> {
      if (busy) return null;
      busy = true;
      try {
        return await fn(...args);
      } catch (error) {
        busy = false;
        throw error;
      }
    },
    release() {
      busy = false;
    },
  };
}
