import React, { useEffect, useState } from 'react';
import { Check, Users, BadgeCheck } from 'lucide-react';
import { FALLBACK_PLANS, PLANS_COPY, type PlanCard } from '../data/plans';
import { fetchPlans, formatPrice, seatsLabel } from '../lib/plans';
import { handleLinkClick } from '../lib/router';

interface PricingSectionProps {
  /** `id` da seção, para âncora na landing. */
  id?: string;
  /** Aviso acima dos cartões (ex.: plano inválido na compra). */
  notice?: string;
}

/**
 * Cartões dos planos. Começa pela lista estática (nada pisca vazio) e troca
 * pela da tabela `plans` quando a busca responde.
 */
export const PricingSection: React.FC<PricingSectionProps> = ({ id, notice }) => {
  const [plans, setPlans] = useState<PlanCard[]>(FALLBACK_PLANS);
  const [source, setSource] = useState<'loading' | 'remote' | 'fallback'>('loading');

  useEffect(() => {
    let alive = true;
    fetchPlans().then((res) => {
      if (!alive) return;
      setPlans(res.plans);
      setSource(res.source);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id={id} className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-xs uppercase tracking-widest mb-4">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>{PLANS_COPY.eyebrow}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-cream-strong tracking-tight mb-5">
            {PLANS_COPY.titleLead}{' '}
            <span className="text-gradient-aurora font-semibold">{PLANS_COPY.titleAccent}</span>
          </h2>
          <p className="text-cream/75 text-sm sm:text-base leading-relaxed">{PLANS_COPY.intro}</p>
        </div>

        {notice && (
          <div
            role="status"
            className="max-w-2xl mx-auto mb-8 px-4 py-3 rounded-xl border border-warn/30 bg-warn/10 text-warn text-sm text-center"
          >
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8" aria-busy={source === 'loading'}>
          {plans.map((plan, index) => {
            const highlighted = index === 1;
            const href = `/compra?plano=${encodeURIComponent(plan.id)}`;
            return (
              <div
                key={plan.id}
                data-plan={plan.id}
                className={`glass-card glass-card-hover rounded-3xl p-5 sm:p-7 flex flex-col ${
                  highlighted ? 'border-accent/40 shadow-2xl shadow-accent/10' : ''
                }`}
              >
                <h3 className="text-lg font-medium text-cream-strong leading-snug mb-2">{plan.name}</h3>
                {plan.tagline && <p className="text-xs text-muted leading-relaxed mb-5">{plan.tagline}</p>}

                <div className="mb-5">
                  <span className="text-4xl font-semibold text-cream-strong">{formatPrice(plan.priceCents)}</span>
                  {plan.priceCents === 0 && (
                    <span className="block text-xs text-muted mt-1">{PLANS_COPY.perPeriod}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-cream/85 mb-5">
                  <Users className="w-4 h-4 text-accent shrink-0" />
                  <span>
                    {seatsLabel(plan.maxUsers)}
                    <span className="text-muted"> · {PLANS_COPY.ownerIncluded}</span>
                  </span>
                </div>

                <ul className="space-y-2 mb-6 text-xs text-cream/75 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-ok shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={href}
                  onClick={(event) => handleLinkClick(event, href)}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    highlighted
                      ? 'bg-accent hover:bg-accent-strong text-ink-deep shadow-lg shadow-accent/20'
                      : 'bg-cream/5 hover:bg-cream/10 border border-cream/15 text-cream'
                  }`}
                >
                  {PLANS_COPY.choose}
                </a>
              </div>
            );
          })}
        </div>

        {source === 'fallback' && (
          <p className="text-center text-xs text-soft mt-6">{PLANS_COPY.fallbackNotice}</p>
        )}
      </div>
    </section>
  );
};
