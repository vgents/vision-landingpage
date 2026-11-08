import React from 'react';
import { CheckCircle2, Clock, XCircle, Download, RotateCcw } from 'lucide-react';
import { RESULT_COPY } from '../data/checkout';
import { handleLinkClick } from '../lib/router';

type Variant = 'confirmada' | 'pendente' | 'erro';

interface CheckoutResultPageProps {
  variant: Variant;
  approved?: boolean;
  orderId?: string | null;
}

const ICON = { confirmada: CheckCircle2, pendente: Clock, erro: XCircle };
const TONE = {
  confirmada: 'bg-ok/10 border-ok/25 text-ok',
  pendente: 'bg-warn/10 border-warn/25 text-warn',
  erro: 'bg-cream/5 border-cream/15 text-cream/80',
};

export const CheckoutResultPage: React.FC<CheckoutResultPageProps> = ({ variant, approved = false, orderId }) => {
  const copy =
    variant === 'confirmada' && !approved
        ? RESULT_COPY.confirmadaIncerta
        : RESULT_COPY[variant];
  const Icon = ICON[variant];

  return (
    <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 text-center" data-result={variant}>
          <span className={`inline-flex w-14 h-14 rounded-2xl border items-center justify-center mb-5 ${TONE[variant]}`}>
            <Icon className="w-7 h-7" />
          </span>
          <p className="text-[11px] uppercase tracking-widest text-accent-strong mb-2">{copy.eyebrow}</p>
          <h1 className="text-2xl sm:text-4xl font-light text-cream-strong tracking-tight mb-4">{copy.title}</h1>
          <p className="text-sm sm:text-base text-cream/80 leading-relaxed mb-3">{copy.body}</p>
          {copy.note && <p className="text-xs text-muted leading-relaxed mb-3">{copy.note}</p>}
          {orderId && (
            <p className="text-[11px] text-soft mt-4 break-all">
              {RESULT_COPY.orderLabel} {orderId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            {variant === 'erro' && (
              <a
                href="/planos"
                onClick={(event) => handleLinkClick(event, '/planos')}
                className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {RESULT_COPY.retry}
              </a>
            )}
            <a
              href="/#downloads"
              onClick={(event) => handleLinkClick(event, '/#downloads')}
              className={`px-5 py-3 rounded-xl font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 ${
                variant === 'erro'
                  ? 'bg-cream/5 hover:bg-cream/10 border border-cream/15 text-cream'
                  : 'bg-accent hover:bg-accent-strong text-ink-deep shadow-lg shadow-accent/20'
              }`}
            >
              <Download className="w-4 h-4" />
              {RESULT_COPY.download}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
