import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PAYMENT_COPY } from '../../data/checkout';
import {
  cardErrorMessage,
  cardFormToInput,
  loadMercadoPagoSdk,
  mercadoPagoPublicKey,
  newAttemptId,
  processPayment,
  type CardBrickController,
  type CardBrickFormData,
  type PayOrderSummary,
} from '../../lib/payment';
import { FATAL_PAYMENT_CODES, type PaymentCallbacks } from './types';

/** Cores do site (`src/index.css`) aplicadas ao Brick pelas opções de customização. */
const BRICK_STYLE = {
  theme: 'dark',
  customVariables: {
    baseColor: '#d97a56',
    baseColorFirstVariant: '#e8896a',
    baseColorSecondVariant: '#3d2318',
    formBackgroundColor: '#1a1917',
    inputBackgroundColor: '#131211',
    textPrimaryColor: '#f2ede4',
    textSecondaryColor: '#9a9690',
    outlinePrimaryColor: '#4e4b46',
    outlineSecondaryColor: '#272523',
    buttonTextColor: '#131211',
    errorColor: '#e0a95c',
    successColor: '#6fbf87',
    borderRadiusMedium: '12px',
    borderRadiusLarge: '16px',
  },
};

type Props = PaymentCallbacks & { order: PayOrderSummary; orderId: string; token: string };

/**
 * Card Payment Brick do Mercado Pago. Os dados do cartão nunca passam pelo
 * site: o Brick devolve um token, que vai ao `checkout-process`.
 */
export const CardPayment: React.FC<Props> = ({ order, orderId, token, onApproved, onPending, onFatal, onBusyChange, onCardSubmit }) => {
  const publicKey = mercadoPagoPublicKey();
  const [mountKey, setMountKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [sdkFailed, setSdkFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Os callbacks mudam a cada render da página; o Brick guarda os da criação.
  const latest = useRef({ order, orderId, token, onApproved, onPending, onFatal, onBusyChange, onCardSubmit });
  latest.current = { order, orderId, token, onApproved, onPending, onFatal, onBusyChange, onCardSubmit };

  const containerId = `mp-card-brick-${mountKey}`;

  useEffect(() => {
    if (!publicKey) return;
    let alive = true;
    let controller: CardBrickController | null = null;
    setReady(false);
    setSdkFailed(false);

    const onSubmit = async (formData: CardBrickFormData) => {
      const { order: o, orderId: id, token: t } = latest.current;
      latest.current.onCardSubmit();
      latest.current.onBusyChange(true);
      let outcome;
      try {
        outcome = await processPayment(id, t, { ...cardFormToInput(formData, o.buyer_email), attempt_id: newAttemptId() });
      } finally {
        latest.current.onBusyChange(false);
      }
      // O resultado do servidor sempre chega à página, mesmo se este Brick já saiu da tela.
      const cb = latest.current;
      if (outcome.kind === 'approved') return cb.onApproved();
      if (outcome.kind === 'pending') return cb.onPending(outcome.message);
      if (outcome.kind === 'error' && FATAL_PAYMENT_CODES.has(outcome.code)) return cb.onFatal(outcome);
      if (!alive) return;
      // Recusado ou erro passageiro: mostra o motivo e um Brick novo para tentar de novo.
      setNotice(outcome.kind === 'error' ? cardErrorMessage(outcome) : outcome.message);
      setMountKey((k) => k + 1);
    };

    loadMercadoPagoSdk()
      .then((MercadoPago) => {
        if (!alive) return;
        const mp = new MercadoPago(publicKey, { locale: 'pt-BR' });
        return mp
          .bricks()
          .create('cardPayment', containerId, {
            initialization: { amount: latest.current.order.amount_cents / 100, payer: { email: latest.current.order.buyer_email } },
            customization: {
              visual: { style: BRICK_STYLE, hideFormTitle: true },
              paymentMethods: { maxInstallments: 1 },
            },
            callbacks: {
              onReady: () => alive && setReady(true),
              onSubmit,
              onError: (error: { type?: string }) => {
                if (alive && error?.type === 'critical') setSdkFailed(true);
              },
            },
          })
          .then((created) => {
            if (alive) controller = created;
            else created.unmount();
          });
      })
      .catch(() => {
        if (alive) setSdkFailed(true);
      });

    return () => {
      alive = false;
      controller?.unmount();
    };
  }, [publicKey, containerId]);

  if (!publicKey) {
    return <Notice tone="warn" message={PAYMENT_COPY.cardUnavailable} />;
  }

  return (
    <div>
      {notice && (
        <div className="mb-4">
          <Notice tone="warn" message={notice} detail={PAYMENT_COPY.rejectedRetry} />
        </div>
      )}
      {sdkFailed ? (
        <Notice tone="warn" message={PAYMENT_COPY.cardSdkFailed} />
      ) : (
        <>
          {!ready && (
            <div className="flex items-center gap-2 text-sm text-muted py-6 justify-center" role="status">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              {PAYMENT_COPY.cardLoading}
            </div>
          )}
          <div id={containerId} key={containerId} className="min-w-0" />
          <p className="text-xs text-muted mt-3">{PAYMENT_COPY.cardInstallments}</p>
        </>
      )}
    </div>
  );
};

export const Notice: React.FC<{ tone: 'warn' | 'info'; message: string; detail?: string }> = ({ tone, message, detail }) => (
  <div
    role={tone === 'warn' ? 'alert' : 'status'}
    className={
      tone === 'warn'
        ? 'flex items-start gap-3 px-4 py-3 rounded-xl border border-warn/30 bg-warn/10 text-sm text-warn'
        : 'flex items-start gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent-soft/40 text-sm text-cream-strong'
    }
  >
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
    <span>
      {message}
      {detail && <span className="block text-cream/75 mt-1">{detail}</span>}
    </span>
  </div>
);
