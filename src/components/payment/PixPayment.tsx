import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Loader2, QrCode, RefreshCw } from 'lucide-react';
import { PAYMENT_COPY } from '../../data/checkout';
import { checkoutErrorMessage } from '../../lib/checkout';
import {
  formatCountdown,
  newAttemptId,
  pixSecondsLeft,
  processPayment,
  type PayOrderSummary,
  type PixData,
} from '../../lib/payment';
import { Notice } from './CardPayment';
import { FATAL_PAYMENT_CODES, type PaymentCallbacks } from './types';
import { useStatusPolling } from './useStatusPolling';

type Props = PaymentCallbacks & { order: PayOrderSummary; orderId: string; token: string; cardSubmits: number };

/** Pix: gera o QR Code, mostra o copia e cola e o prazo, e consulta o status até aprovar ou expirar. */
export const PixPayment: React.FC<Props> = ({ order, orderId, token, onApproved, onPending, onFatal, onBusyChange, cardSubmits }) => {
  const [pix, setPix] = useState<PixData | null>(order.pix);
  const [secondsLeft, setSecondsLeft] = useState(() => (order.pix ? pixSecondsLeft(order.pix.expires_at) : 0));
  const [expired, setExpired] = useState(() => !!order.pix && pixSecondsLeft(order.pix.expires_at) === 0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generatingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Cada envio de cartão incrementa `cardSubmits`: o servidor cancela o Pix pendente, o QR some.
  useEffect(() => {
    if (cardSubmits === 0) return;
    setPix(null);
    setExpired(false);
  }, [cardSubmits]);

  // Contagem regressiva até `expires_at`.
  useEffect(() => {
    if (!pix || expired) return;
    const update = () => {
      const left = pixSecondsLeft(pix.expires_at);
      setSecondsLeft(left);
      if (left === 0) setExpired(true);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [pix, expired]);

  useStatusPolling(!!pix && !expired, orderId, token, (status) => {
    if (status === 'approved') onApproved();
    else if (status === 'invalid_link') onFatal({ kind: 'error', code: 'invalid_link', message: checkoutErrorMessage('invalid_link') });
    else if (status === 'expired') setExpired(true);
    else {
      setPix(null);
      setError(PAYMENT_COPY.rejectedDefault);
    }
  });

  async function generate() {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setGenerating(true);
    setError(null);
    onBusyChange(true);
    let outcome;
    try {
      outcome = await processPayment(orderId, token, { method: 'pix', payer: { email: order.buyer_email }, attempt_id: newAttemptId() });
    } finally {
      generatingRef.current = false;
      onBusyChange(false);
    }
    if (outcome.kind === 'approved') return onApproved();
    if (outcome.kind === 'error' && FATAL_PAYMENT_CODES.has(outcome.code)) return onFatal(outcome);
    if (outcome.kind === 'pending' && !outcome.pix) return onPending(outcome.message);
    if (!mountedRef.current) return;
    setGenerating(false);
    if (outcome.kind === 'pending' && outcome.pix) {
      setPix(outcome.pix);
      setSecondsLeft(pixSecondsLeft(outcome.pix.expires_at));
      setExpired(pixSecondsLeft(outcome.pix.expires_at) === 0);
      return;
    }
    setError(outcome.message);
  }

  const button = (label: string, Icon: typeof QrCode) => (
    <button
      type="button"
      onClick={generate}
      disabled={generating}
      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-accent hover:bg-accent-strong disabled:opacity-60 disabled:cursor-wait text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors inline-flex items-center justify-center gap-2"
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {generating ? PAYMENT_COPY.pixGenerating : label}
    </button>
  );

  return (
    <div className="space-y-4">
      {error && <Notice tone="warn" message={error} />}

      {!pix ? (
        <>
          <p className="text-sm text-cream/75 leading-relaxed">{PAYMENT_COPY.pixIntro}</p>
          {button(PAYMENT_COPY.pixGenerate, QrCode)}
        </>
      ) : expired ? (
        <>
          <Notice tone="warn" message={PAYMENT_COPY.pixExpired} />
          {button(PAYMENT_COPY.pixRegenerate, RefreshCw)}
        </>
      ) : (
        <div className="space-y-4" data-pix-open>
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${pix.qr_code_base64}`}
              alt={PAYMENT_COPY.pixQrAlt}
              width={220}
              height={220}
              className="w-[220px] max-w-full h-auto rounded-xl bg-white p-2"
            />
          </div>
          <PixCode code={pix.qr_code} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="inline-flex items-center gap-2 text-cream/80" role="status">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              {PAYMENT_COPY.pixWaiting}
            </span>
            <span className="text-muted tabular-nums" aria-live="off">
              {PAYMENT_COPY.pixExpiresIn(formatCountdown(secondsLeft))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const PixCode: React.FC<{ code: string }> = ({ code }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      return;
    } catch {
      // Sem a API (http, permissão negada): seleciona para o comprador copiar.
    }
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
    try {
      if (document.execCommand('copy')) setCopied(true);
    } catch {
      // Fica selecionado; Ctrl/Cmd+C resolve.
    }
  }

  return (
    <div>
      <label htmlFor="pix-code" className="block text-sm text-cream/85 mb-1.5">
        {PAYMENT_COPY.pixCodeLabel}
      </label>
      <div className="flex gap-2 min-w-0">
        <input
          id="pix-code"
          ref={inputRef}
          readOnly
          value={code}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-ink-deep/70 border border-cream/12 text-cream text-xs font-mono outline-none focus:border-accent/60"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 px-4 rounded-xl border border-cream/15 bg-cream/5 hover:bg-cream/10 text-cream text-sm inline-flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
          <span aria-live="polite">{copied ? PAYMENT_COPY.pixCopied : PAYMENT_COPY.pixCopy}</span>
        </button>
      </div>
    </div>
  );
};
