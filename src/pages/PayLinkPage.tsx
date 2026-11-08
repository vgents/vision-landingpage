import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { PAY_COPY } from '../data/checkout';
import { checkoutErrorMessage, payLinkView, submitPayLink, type PayOutcome } from '../lib/checkout';
import { handleLinkClick } from '../lib/router';

type State = { status: 'loading' } | { status: 'error'; outcome: Extract<PayOutcome, { kind: 'error' }> };

/** Destino do link do e-mail: troca `pedido` + `t` pelo pagamento no Mercado Pago. */
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
        window.location.assign(outcome.url);
        return;
      }
      setState({ status: 'error', outcome });
    });
    return () => {
      alive = false;
    };
  }, [orderId, token]);

  return (
    <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 text-center" data-pay-state={state.status}>
          <p className="text-[11px] uppercase tracking-widest text-accent-strong mb-2">{PAY_COPY.eyebrow}</p>
          {state.status === 'loading' ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-5">{PAY_COPY.redirecting}</h1>
              <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" aria-label={PAY_COPY.loading} />
            </>
          ) : (
            <PayError view={payLinkView(state.outcome)} code={state.outcome.code} />
          )}
        </div>
      </div>
    </main>
  );
};

const PayError: React.FC<{ view: ReturnType<typeof payLinkView>; code: string }> = ({ view, code }) => {
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
