import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShoppingBag, Users, AlertCircle } from 'lucide-react';
import { CHECKOUT_COPY } from '../data/checkout';
import { FALLBACK_PLANS, type PlanCard } from '../data/plans';
import { singleFlight, submitCheckout, validateCheckoutForm, type CheckoutErrors, type CheckoutForm } from '../lib/checkout';
import { fetchPlans, formatPrice, seatsLabel } from '../lib/plans';
import { handleLinkClick, navigate } from '../lib/router';
import { PlansPage } from './PlansPage';

const EMPTY_FORM: CheckoutForm = { buyerName: '', buyerEmail: '', companyName: '', acceptTerms: false };

type PlanState = { status: 'loading' } | { status: 'found'; plan: PlanCard } | { status: 'missing' };

function usePlan(planId: string | null): PlanState {
  const known = planId ? FALLBACK_PLANS.find((plan) => plan.id === planId) : undefined;
  const [state, setState] = useState<PlanState>(
    !planId ? { status: 'missing' } : known ? { status: 'found', plan: known } : { status: 'loading' },
  );

  useEffect(() => {
    if (!planId) return;
    let alive = true;
    fetchPlans().then(({ plans }) => {
      if (!alive) return;
      const plan = plans.find((p) => p.id === planId);
      setState(plan ? { status: 'found', plan } : { status: 'missing' });
    });
    return () => {
      alive = false;
    };
  }, [planId]);

  return state;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-ink-deep/70 border text-cream-strong placeholder:text-soft text-sm outline-none transition-colors focus:border-accent/60';

export const CheckoutPage: React.FC<{ planId: string | null }> = ({ planId }) => {
  const planState = usePlan(planId);
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [serverError, setServerError] = useState<{ code: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Trava síncrona: o estado do React só muda no próximo render, e um clique duplo chegaria antes. */
  const [guard] = useState(() => singleFlight(submitCheckout));

  if (planState.status === 'missing') {
    return <PlansPage notice={planId ? CHECKOUT_COPY.unknownPlan : CHECKOUT_COPY.choosePlan} />;
  }

  if (planState.status === 'loading') {
    return (
      <main className="pt-32 pb-24 min-h-[70vh] flex items-start justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" aria-label="Carregando" />
      </main>
    );
  }

  const plan = planState.plan;
  const isFree = plan.priceCents === 0;

  const update = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (guard.busy) return;
    const found = validateCheckoutForm(form, plan);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const outcome = await guard.run(plan.id, form);
    if (!outcome) return;

    if (outcome.kind === 'check_email') {
      navigate(`/compra/confirmada?pedido=${encodeURIComponent(outcome.orderId)}&tipo=gratis`);
      return;
    }
    if (outcome.kind === 'redirect') {
      // Continua travado: a página está saindo para o Mercado Pago.
      window.location.assign(outcome.url);
      return;
    }
    guard.release();
    setSubmitting(false);
    if (outcome.field) setErrors({ [outcome.field]: outcome.message });
    else setServerError({ code: outcome.code, message: outcome.message });
  };

  const fieldBorder = (key: keyof CheckoutForm) => (errors[key] ? 'border-warn/60' : 'border-cream/12');

  return (
    <main className="pt-24 sm:pt-28 pb-16 sm:pb-24 min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href="/planos"
          onClick={(event) => handleLinkClick(event, '/planos')}
          className="inline-flex items-center gap-2 text-sm text-cream/70 hover:text-accent-strong transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {CHECKOUT_COPY.changePlan}
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <aside className="lg:col-span-4 glass-card rounded-3xl p-5 sm:p-7" data-checkout-plan={plan.id}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-[11px] uppercase tracking-widest mb-4">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{CHECKOUT_COPY.eyebrow}</span>
            </div>
            <h2 className="text-lg font-medium text-cream-strong leading-snug mb-2">{plan.name}</h2>
            {plan.tagline && <p className="text-xs text-muted leading-relaxed mb-5">{plan.tagline}</p>}
            <div className="text-4xl font-semibold text-cream-strong mb-4">{formatPrice(plan.priceCents)}</div>
            <div className="flex items-center gap-2 text-sm text-cream/85">
              <Users className="w-4 h-4 text-accent shrink-0" />
              <span>{seatsLabel(plan.maxUsers)}</span>
            </div>
          </aside>

          <section className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-3">
              {CHECKOUT_COPY.title}
            </h1>
            <p className="text-sm text-cream/75 leading-relaxed mb-7">{CHECKOUT_COPY.intro}</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="buyer-name" className="block text-sm text-cream/85 mb-1.5">
                  {CHECKOUT_COPY.nameLabel}
                </label>
                <input
                  id="buyer-name"
                  name="name"
                  autoComplete="name"
                  maxLength={120}
                  value={form.buyerName}
                  onChange={(e) => update('buyerName', e.target.value)}
                  aria-invalid={!!errors.buyerName}
                  aria-describedby={errors.buyerName ? 'buyer-name-error' : undefined}
                  className={`${inputClass} ${fieldBorder('buyerName')}`}
                />
                {errors.buyerName && (
                  <p id="buyer-name-error" className="text-xs text-warn mt-1.5">
                    {errors.buyerName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="buyer-email" className="block text-sm text-cream/85 mb-1.5">
                  {CHECKOUT_COPY.emailLabel}
                </label>
                <input
                  id="buyer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.buyerEmail}
                  onChange={(e) => update('buyerEmail', e.target.value)}
                  aria-invalid={!!errors.buyerEmail}
                  aria-describedby="buyer-email-hint"
                  className={`${inputClass} ${fieldBorder('buyerEmail')}`}
                />
                <p id="buyer-email-hint" className={`text-xs mt-1.5 ${errors.buyerEmail ? 'text-warn' : 'text-muted'}`}>
                  {errors.buyerEmail ?? CHECKOUT_COPY.emailHint}
                </p>
              </div>

              {plan.requiresCompany && (
                <div>
                  <label htmlFor="company-name" className="block text-sm text-cream/85 mb-1.5">
                    {CHECKOUT_COPY.companyLabel}
                  </label>
                  <input
                    id="company-name"
                    name="organization"
                    autoComplete="organization"
                    maxLength={120}
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    aria-invalid={!!errors.companyName}
                    aria-describedby="company-name-hint"
                    className={`${inputClass} ${fieldBorder('companyName')}`}
                  />
                  <p
                    id="company-name-hint"
                    className={`text-xs mt-1.5 ${errors.companyName ? 'text-warn' : 'text-muted'}`}
                  >
                    {errors.companyName ?? CHECKOUT_COPY.companyHint}
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-start gap-3 text-sm text-cream/85 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={form.acceptTerms}
                    onChange={(e) => update('acceptTerms', e.target.checked)}
                    aria-invalid={!!errors.acceptTerms}
                    className="mt-0.5 w-4 h-4 accent-[#d97a56] shrink-0"
                  />
                  <span>
                    {CHECKOUT_COPY.termsLead}{' '}
                    <a href="/#faq" className="text-accent-strong underline underline-offset-2">
                      {CHECKOUT_COPY.termsLink}
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-xs text-warn mt-1.5">{errors.acceptTerms}</p>}
              </div>

              {serverError && (
                <div
                  role="alert"
                  data-error-code={serverError.code}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl border border-warn/30 bg-warn/10 text-sm text-warn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {serverError.message}
                    {serverError.code === 'already_in_team' && (
                      <span className="block text-cream/75 mt-1">{CHECKOUT_COPY.alreadyInTeamHint}</span>
                    )}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong disabled:opacity-60 disabled:cursor-wait text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? CHECKOUT_COPY.submitting : isFree ? CHECKOUT_COPY.submit : CHECKOUT_COPY.submitPaid}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};
