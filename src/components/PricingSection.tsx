import React, { useEffect, useState } from 'react';
import { Check, Users, BadgeCheck } from 'lucide-react';
import { PLANS_COPY } from '../data/plans';
import { fetchSeatPricing, formatPrice } from '../lib/plans';
import { handleLinkClick } from '../lib/router';
import { DEFAULT_SEAT_PRICING, seatPriceCents, type SeatPricing } from '../lib/seatPricing';

interface PricingSectionProps {
  /** `id` da seção, para âncora na landing. */
  id?: string;
  /** Aviso acima dos cartões. */
  notice?: string;
}

/**
 * Dois cartões: Somente eu e Tenho uma equipe. Começa pela tabela estática
 * (nada pisca vazio) e troca pela tabela `seat_pricing` quando a busca responde.
 */
export const PricingSection: React.FC<PricingSectionProps> = ({ id, notice }) => {
  const [pricing, setPricing] = useState<SeatPricing>(DEFAULT_SEAT_PRICING);
  const [source, setSource] = useState<'loading' | 'remote' | 'fallback'>('loading');

  useEffect(() => {
    let alive = true;
    fetchSeatPricing().then((res) => {
      if (!alive) return;
      setPricing(res.pricing);
      setSource(res.source);
    });
    return () => {
      alive = false;
    };
  }, []);

  const cards = [
    {
      key: 'solo' as const,
      name: PLANS_COPY.solo.name,
      tagline: PLANS_COPY.solo.tagline,
      lead: null,
      price: formatPrice(pricing.base_cents),
      unit: PLANS_COPY.perMonth,
      seats: null,
      features: PLANS_COPY.solo.features,
      highlighted: false,
    },
    {
      key: 'team' as const,
      name: PLANS_COPY.team.name,
      tagline: PLANS_COPY.team.tagline,
      lead: PLANS_COPY.team.from,
      price: formatPrice(seatPriceCents(pricing, pricing.tier2_from)),
      unit: PLANS_COPY.team.perSeatMonth,
      seats: PLANS_COPY.team.range(pricing.max_seats),
      features: PLANS_COPY.team.features,
      highlighted: true,
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8 max-w-4xl mx-auto" aria-busy={source === 'loading'}>
          {cards.map((card) => {
            const href = `/compra?escolha=${card.key}`;
            return (
              <div
                key={card.key}
                data-plan={card.key}
                className={`glass-card glass-card-hover rounded-3xl p-5 sm:p-7 flex flex-col ${
                  card.highlighted ? 'border-accent/40 shadow-2xl shadow-accent/10' : ''
                }`}
              >
                <h3 className="text-lg font-medium text-cream-strong leading-snug mb-2">{card.name}</h3>
                <p className="text-xs text-muted leading-relaxed mb-5">{card.tagline}</p>

                <div className="mb-5">
                  {card.lead && <span className="block text-xs text-muted mb-1">{card.lead}</span>}
                  <span className="text-4xl font-semibold text-cream-strong">{card.price}</span>
                  <span className="text-sm text-muted ml-1.5">{card.unit}</span>
                </div>

                {card.seats && (
                  <div className="flex items-center gap-2 text-sm text-cream/85 mb-5">
                    <Users className="w-4 h-4 text-accent shrink-0" />
                    <span>{card.seats}</span>
                  </div>
                )}

                <ul className="space-y-2 mb-6 text-xs text-cream/75 flex-1">
                  {card.features.map((feature) => (
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
                    card.highlighted
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
