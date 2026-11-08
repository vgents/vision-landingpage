import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, QrCode } from 'lucide-react';
import { PAY_COPY, PAYMENT_COPY } from '../data/checkout';
import { checkoutErrorMessage, payLinkView, submitPayLink, type PayOutcome } from '../lib/checkout';
import { approvedMessage, formatBRL, mercadoPagoPublicKey, type PayOrderSummary } from '../lib/payment';
import { handleLinkClick } from '../lib/router';
import { CardPayment, Notice } from '../components/payment/CardPayment';
import { PixPayment } from '../components/payment/PixPayment';
import type { PaymentError } from '../components/payment/types';
import { useStatusPolling } from '../components/payment/useStatusPolling';

type PayError = Extract<PayOutcome, { kind: 'error' }>;

type State =
  | { status: 'loading' }
  | { status: 'pay'; order: PayOrderSummary; notice?: string }
  | { status: 'pending'; order: PayOrderSummary; message: string }
  | { status: 'approved'; order: PayOrderSummary }
  | { status: 'error'; outcome: PayError };

type Tab = 'card' | 'pix';

/** Destino do link do e-mail: o pagamento (cartão ou Pix) acontece aqui mesmo. */
export const PayLinkPage: React.FC<{ orderId: string | null; token: string | null }> = ({ orderId, token }) => {
  const [state, setState] = useState<State>(
    orderId && token
      ? { status: 'loading' }
      : { status: 'error', outcome: { kind: 'error', code: 'invalid_link', message: checkoutErrorMessage('invalid_link') } },
  );

  useEffect(() => {
    if (!orderId || !token) return;
    let alive = true;
    submitPayLink(orderId, token).then((outcome) => {
      if (!alive) return;
      if (outcome.kind === 'redirect') {
        // Modo de reversão: o servidor ainda manda para o Checkout Pro.
        window.location.assign(outcome.url);
        return;
      }
      setState(outcome.kind === 'pay' ? { status: 'pay', order: outcome.order } : { status: 'error', outcome });
    });
    return () => {
      alive = false;
    };
  }, [orderId, token]);

  const fail = (error: PaymentError) => {
    const orderKind = state.status === 'pay' || state.status === 'pending' ? state.order.kind : undefined;
    setState({ status: 'error', outcome: { ...error, ...(orderKind ? { orderKind } : {}) } });
  };

  // Cartão em análise: segue consultando até sair uma decisão (o Pix do pedido já foi cancelado).
  useStatusPolling(state.status === 'pending', orderId ?? '', token ?? '', (status) => {
    if (state.status !== 'pending') return;
    const order = state.order;
    if (status === 'approved') setState({ status: 'approved', order });
    else if (status === 'invalid_link') fail({ kind: 'error', code: 'invalid_link', message: checkoutErrorMessage('invalid_link') });
    else if (status === 'rejected') setState({ status: 'pay', order: { ...order, pix: null }, notice: PAYMENT_COPY.rejectedDefault });
    else fail({ kind: 'error', code: 'expired', message: checkoutErrorMessage('expired') });
  });

  const centered = state.status !== 'pay' && state.status !== 'pending';

  return (
    <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className={`glass-panel rounded-3xl p-5 sm:p-10 ${centered ? 'text-center' : ''}`} data-pay-state={state.status}>
          {state.status === 'loading' && (
            <>
              <Eyebrow />
              <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-5">{PAY_COPY.opening}</h1>
              <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" aria-label={PAY_COPY.loading} />
            </>
          )}
          {state.status === 'error' && (
            <>
              <Eyebrow />
              <PayErrorView view={payLinkView(state.outcome)} code={state.outcome.code} />
            </>
          )}
          {state.status === 'approved' && <Approved order={state.order} />}
          {state.status === 'pending' && (
            <>
              <OrderHeader order={state.order} />
              <div
                role="status"
                className="flex items-start gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent-soft/40 text-sm text-cream-strong"
              >
                <Loader2 className="w-4 h-4 shrink-0 mt-0.5 text-accent animate-spin" />
                <span>
                  <span className="block font-medium">{PAYMENT_COPY.pending}</span>
                  <span className="block text-cream/80 mt-1">{state.message}</span>
                </span>
              </div>
            </>
          )}
          {state.status === 'pay' && orderId && token && (
            <PayPanel
              order={state.order}
              orderId={orderId}
              token={token}
              notice={state.notice}
              onApproved={() => setState((s) => (s.status === 'pay' ? { status: 'approved', order: s.order } : s))}
              onPending={(message) =>
                setState((s) => (s.status === 'pay' ? { status: 'pending', order: { ...s.order, pix: null }, message } : s))
              }
              onFatal={fail}
              onCardSubmit={() =>
                // O servidor cancela o Pix pendente antes de um cartão: o QR do pedido não volta mais.
                setState((s) => (s.status === 'pay' && s.order.pix ? { ...s, order: { ...s.order, pix: null } } : s))
              }
            />
          )}
        </div>
      </div>
    </main>
  );
};

const Eyebrow: React.FC = () => (
  <p className="text-[11px] uppercase tracking-widest text-accent-strong mb-2">{PAY_COPY.eyebrow}</p>
);

const OrderHeader: React.FC<{ order: PayOrderSummary }> = ({ order }) => (
  <header className="mb-6">
    <Eyebrow />
    <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-2 break-words">{order.title}</h1>
    <p className="text-sm text-muted">
      {PAYMENT_COPY.amountLabel}{' '}
      <span className="text-2xl font-semibold text-cream-strong ml-1 tabular-nums" data-amount-cents={order.amount_cents}>
        {formatBRL(order.amount_cents)}
      </span>
    </p>
  </header>
);

const TABS: { id: Tab; label: string; Icon: typeof CreditCard }[] = [
  { id: 'card', label: PAYMENT_COPY.tabCard, Icon: CreditCard },
  { id: 'pix', label: PAYMENT_COPY.tabPix, Icon: QrCode },
];

const PayPanel: React.FC<{
  order: PayOrderSummary;
  orderId: string;
  token: string;
  notice?: string;
  onApproved: () => void;
  onPending: (message: string) => void;
  onFatal: (error: PaymentError) => void;
  onCardSubmit: () => void;
}> = ({ order, orderId, token, notice, onApproved, onPending, onFatal, onCardSubmit }) => {
  // Pix já aberto no pedido (ou cartão sem chave pública): abre direto no Pix.
  const [tab, setTab] = useState<Tab>(() => (order.pix || !mercadoPagoPublicKey() ? 'pix' : 'card'));
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ card: null, pix: null });

  // Envio de cartão ou geração de Pix em andamento: as abas ficam travadas.
  const [busy, setBusy] = useState(false);
  const [cardSubmits, setCardSubmits] = useState(0);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (busy) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next: Tab = tab === 'card' ? 'pix' : 'card';
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const callbacks = {
    onApproved,
    onPending,
    onFatal,
    onBusyChange: setBusy,
    onCardSubmit: () => {
      setCardSubmits((n) => n + 1);
      onCardSubmit();
    },
  };

  return (
    <>
      <OrderHeader order={order} />
      {notice && (
        <div className="mb-4">
          <Notice tone="warn" message={notice} detail={PAYMENT_COPY.rejectedRetry} />
        </div>
      )}
      <div role="tablist" aria-label={PAYMENT_COPY.tabsLabel} className="grid grid-cols-2 gap-2 mb-5" onKeyDown={onKeyDown}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            id={`pay-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`pay-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            disabled={busy}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-wait inline-flex items-center justify-center gap-2 ${
              tab === id
                ? 'bg-accent-soft/50 border-accent/60 text-cream-strong'
                : 'bg-ink-deep/70 border-cream/12 text-cream/75 hover:border-cream/25'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* O Brick só existe com a aba Cartão aberta: trocar de aba o desmonta. */}
      <div id="pay-panel-card" role="tabpanel" aria-labelledby="pay-tab-card" hidden={tab !== 'card'} className="min-w-0">
        {tab === 'card' && <CardPayment order={order} orderId={orderId} token={token} {...callbacks} />}
      </div>
      {/* O Pix fica montado: um QR aberto continua sendo consultado mesmo com a aba Cartão à vista. */}
      <div id="pay-panel-pix" role="tabpanel" aria-labelledby="pay-tab-pix" hidden={tab !== 'pix'} className="min-w-0">
        <PixPayment order={order} orderId={orderId} token={token} cardSubmits={cardSubmits} {...callbacks} />
      </div>
    </>
  );
};

const Approved: React.FC<{ order: PayOrderSummary }> = ({ order }) => (
  <>
    <Eyebrow />
    <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-5">{PAYMENT_COPY.approvedTitle}</h1>
    <div
      role="status"
      data-tone="success"
      className="inline-flex items-start gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent-soft/40 text-sm text-cream-strong text-left"
    >
      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
      <span>{approvedMessage(order.kind)}</span>
    </div>
    {order.kind === 'new' && <p className="text-xs text-muted mt-4">{PAYMENT_COPY.approvedNewNote}</p>}
  </>
);

const PayErrorView: React.FC<{ view: ReturnType<typeof payLinkView>; code: string }> = ({ view, code }) => {
  const success = view.tone === 'success';
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-5">{view.title}</h1>
      <div
        role={success ? 'status' : 'alert'}
        data-error-code={code}
        data-tone={view.tone}
        className={
          success
            ? 'inline-flex items-start gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent-soft/40 text-sm text-cream-strong text-left'
            : 'inline-flex items-start gap-3 px-4 py-3 rounded-xl border border-warn/30 bg-warn/10 text-sm text-warn text-left'
        }
      >
        <Icon className={success ? 'w-4 h-4 shrink-0 mt-0.5 text-accent' : 'w-4 h-4 shrink-0 mt-0.5'} />
        <span>{view.message}</span>
      </div>
      {view.showNewOrder && (
        <div className="mt-8">
          <a
            href="/planos"
            onClick={(event) => handleLinkClick(event, '/planos')}
            className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors inline-flex"
          >
            {PAY_COPY.newOrder}
          </a>
        </div>
      )}
    </>
  );
};
