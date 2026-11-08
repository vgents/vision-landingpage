import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Loader2, MailCheck, Minus, Plus, ShoppingBag, Users } from 'lucide-react';
import { CHECKOUT_COPY } from '../data/checkout';
import { PLANS_COPY } from '../data/plans';
import {
  checkoutErrorMessage,
  resendCheckout,
  singleFlight,
  submitCheckout,
  validateCheckoutForm,
  type CheckoutErrors,
  type CheckoutForm,
} from '../lib/checkout';
import { fetchSeatPricing, formatPrice } from '../lib/plans';
import { handleLinkClick } from '../lib/router';
import { DEFAULT_SEAT_PRICING, monthlyTotalCents, seatBreakdown, type PlanChoice, type SeatPricing } from '../lib/seatPricing';

const EMPTY_FORM: CheckoutForm = { buyerName: '', buyerEmail: '', companyName: '', acceptTerms: false };

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-ink-deep/70 border text-cream-strong placeholder:text-soft text-base sm:text-sm outline-none transition-colors focus:border-accent/60';

type Sent = { orderId: string; email: string };

export const CheckoutPage: React.FC<{ initialChoice: PlanChoice | null }> = ({ initialChoice }) => {
  const [pricing, setPricing] = useState<SeatPricing>(DEFAULT_SEAT_PRICING);
  const [choice, setChoice] = useState<PlanChoice>(initialChoice ?? 'solo');
  const [seats, setSeats] = useState(2);
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [serverError, setServerError] = useState<{ code: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'done' | { error: string }>('idle');
  /** Trava síncrona: o estado do React só muda no próximo render, e um clique duplo chegaria antes. */
  const [guard] = useState(() => singleFlight(submitCheckout));

  useEffect(() => {
    let alive = true;
    fetchSeatPricing().then(({ pricing: p }) => {
      if (alive) setPricing(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  const effectiveSeats = choice === 'solo' ? 1 : seats;
  const total = monthlyTotalCents(pricing, effectiveSeats);
  const breakdown = useMemo(() => seatBreakdown(pricing, effectiveSeats), [pricing, effectiveSeats]);
  const minSeats = 2;
  const clampSeats = (n: number) => Math.min(pricing.max_seats, Math.max(minSeats, Number.isFinite(n) ? Math.trunc(n) : minSeats));

  const update = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (guard.busy) return;
    const found = validateCheckoutForm(form, choice);
    setErrors(found);
    setServerError(null);
    const firstInvalid = (['buyerName', 'buyerEmail', 'companyName', 'acceptTerms'] as const).find((k) => found[k]);
    if (firstInvalid) {
      const ids = { buyerName: 'buyer-name', buyerEmail: 'buyer-email', companyName: 'company-name', acceptTerms: 'accept-terms' };
      document.getElementById(ids[firstInvalid])?.focus();
      return;
    }

    setSubmitting(true);
    let outcome;
    try {
      outcome = await guard.run(choice, effectiveSeats, form);
    } catch {
      guard.release();
      setSubmitting(false);
      setServerError({ code: 'server_error', message: checkoutErrorMessage('server_error') });
      return;
    }
    if (!outcome) return;

    guard.release();
    setSubmitting(false);
    if (outcome.kind === 'check_email') {
      setResendState('idle');
      setSent({ orderId: outcome.orderId, email: outcome.email });
      return;
    }
    if (outcome.field) setErrors({ [outcome.field]: outcome.message });
    else setServerError({ code: outcome.code, message: outcome.message });
  };

  const handleResend = async () => {
    if (!sent || resendState === 'sending') return;
    setResendState('sending');
    const outcome = await resendCheckout(sent.orderId, sent.email);
    if (outcome.kind === 'check_email') setResendState('done');
    else setResendState({ error: outcome.kind === 'error' ? outcome.message : checkoutErrorMessage('server_error') });
  };

  const fieldBorder = (key: keyof CheckoutForm) => (errors[key] ? 'border-warn/60' : 'border-cream/12');

  if (sent) {
    return (
      <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 min-h-[70vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-10 text-center" data-checkout-step="check-email">
            <span className="inline-flex w-14 h-14 rounded-2xl border items-center justify-center mb-5 bg-ok/10 border-ok/25 text-ok">
              <MailCheck className="w-7 h-7" />
            </span>
            <h1 className="text-2xl sm:text-4xl font-light text-cream-strong tracking-tight mb-4">{CHECKOUT_COPY.checkEmailTitle}</h1>
            <p className="text-sm sm:text-base text-cream/80 leading-relaxed mb-3">
              Enviamos o link para <strong className="text-cream-strong break-all">{sent.email}</strong>. Abra seu e-mail para pagar.
            </p>
            <p className="text-xs text-muted leading-relaxed mb-6">{CHECKOUT_COPY.checkEmailNote}</p>
            <div role="status" className="min-h-5 text-xs mb-4">
              {resendState === 'done' && <span className="text-ok">{CHECKOUT_COPY.resent}</span>}
              {typeof resendState === 'object' && <span className="text-warn">{resendState.error}</span>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState === 'sending'}
                className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-strong disabled:opacity-60 disabled:cursor-wait text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                {resendState === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                {resendState === 'sending' ? CHECKOUT_COPY.resending : CHECKOUT_COPY.resend}
              </button>
              <button
                type="button"
                onClick={() => setSent(null)}
                className="px-5 py-3 rounded-xl bg-cream/5 hover:bg-cream/10 border border-cream/15 text-cream font-semibold text-sm transition-colors"
              >
                {CHECKOUT_COPY.wrongEmail}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const choices: { id: PlanChoice; label: string }[] = [
    { id: 'solo', label: PLANS_COPY.solo.name },
    { id: 'team', label: PLANS_COPY.team.name },
  ];

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
          <aside className="lg:col-span-4 glass-card rounded-3xl p-5 sm:p-7" data-checkout-plan={choice}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-[11px] uppercase tracking-widest mb-4">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{CHECKOUT_COPY.eyebrow}</span>
            </div>
            <h2 className="text-lg font-medium text-cream-strong leading-snug mb-1">
              {choice === 'solo' ? PLANS_COPY.solo.name : PLANS_COPY.team.name}
            </h2>
            <p className="text-xs text-muted leading-relaxed mb-5">
              {choice === 'solo' ? PLANS_COPY.solo.tagline : PLANS_COPY.team.tagline}
            </p>
            <p className="text-xs text-muted mb-1">{CHECKOUT_COPY.totalLabel}</p>
            <div className="text-4xl font-semibold text-cream-strong mb-4" aria-live="polite">
              {formatPrice(total)}
              <span className="text-sm text-muted font-normal ml-1.5">{PLANS_COPY.perMonth}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-cream/85 mb-4">
              <Users className="w-4 h-4 text-accent shrink-0" />
              <span>{CHECKOUT_COPY.seatsUnit(effectiveSeats)}</span>
            </div>
            {choice === 'team' && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted mb-2">{CHECKOUT_COPY.breakdownTitle}</p>
                <ul className="space-y-1 text-xs text-cream/75">
                  {breakdown.map((row) => (
                    <li key={row.from}>{CHECKOUT_COPY.breakdownRow(row.from, row.to, formatPrice(row.unit_cents))}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <section className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-3">
              {CHECKOUT_COPY.title}
            </h1>
            <p className="text-sm text-cream/75 leading-relaxed mb-7">{CHECKOUT_COPY.intro}</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <fieldset>
                <legend className="block text-sm text-cream/85 mb-1.5">{CHECKOUT_COPY.choiceLegend}</legend>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  {choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={choice === c.id}
                      onClick={() => setChoice(c.id)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        choice === c.id
                          ? 'bg-accent-soft/50 border-accent/60 text-cream-strong'
                          : 'bg-ink-deep/70 border-cream/12 text-cream/75 hover:border-cream/25'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {choice === 'team' && (
                <div>
                  <label htmlFor="seats" className="block text-sm text-cream/85 mb-1.5">
                    {CHECKOUT_COPY.seatsLabel}
                  </label>
                  <div className="inline-flex items-stretch gap-2">
                    <button
                      type="button"
                      aria-label={CHECKOUT_COPY.seatsMinus}
                      onClick={() => setSeats((n) => clampSeats(n - 1))}
                      disabled={seats <= minSeats}
                      className="w-11 rounded-xl border border-cream/15 bg-cream/5 hover:bg-cream/10 disabled:opacity-40 text-cream flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      id="seats"
                      type="number"
                      inputMode="numeric"
                      min={minSeats}
                      max={pricing.max_seats}
                      value={seats}
                      onChange={(e) => setSeats(clampSeats(e.target.valueAsNumber))}
                      className={`${inputClass} border-cream/12 w-20 text-center`}
                    />
                    <button
                      type="button"
                      aria-label={CHECKOUT_COPY.seatsPlus}
                      onClick={() => setSeats((n) => clampSeats(n + 1))}
                      disabled={seats >= pricing.max_seats}
                      className="w-11 rounded-xl border border-cream/15 bg-cream/5 hover:bg-cream/10 disabled:opacity-40 text-cream flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-1.5">{PLANS_COPY.team.range(pricing.max_seats)}</p>
                </div>
              )}

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
                  <p id="buyer-name-error" role="alert" className="text-xs text-warn mt-1.5">
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
                <p id="buyer-email-hint" role={errors.buyerEmail ? 'alert' : undefined} className={`text-xs mt-1.5 ${errors.buyerEmail ? 'text-warn' : 'text-muted'}`}>
                  {errors.buyerEmail ?? CHECKOUT_COPY.emailHint}
                </p>
              </div>

              {choice === 'team' && (
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
                    role={errors.companyName ? 'alert' : undefined}
                    className={`text-xs mt-1.5 ${errors.companyName ? 'text-warn' : 'text-muted'}`}
                  >
                    {errors.companyName ?? CHECKOUT_COPY.companyHint}
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-start gap-3 text-sm text-cream/85 cursor-pointer">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    name="terms"
                    checked={form.acceptTerms}
                    onChange={(e) => update('acceptTerms', e.target.checked)}
                    aria-invalid={!!errors.acceptTerms}
                    aria-describedby={errors.acceptTerms ? 'accept-terms-error' : undefined}
                    className="mt-0.5 w-4 h-4 accent-[#d97a56] shrink-0"
                  />
                  <span>
                    {CHECKOUT_COPY.termsLead}{' '}
                    <a href="/#faq" className="text-accent-strong underline underline-offset-2">
                      {CHECKOUT_COPY.termsLink}
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && <p id="accept-terms-error" role="alert" className="text-xs text-warn mt-1.5">{errors.acceptTerms}</p>}
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
                {submitting ? CHECKOUT_COPY.submitting : CHECKOUT_COPY.submit}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};
