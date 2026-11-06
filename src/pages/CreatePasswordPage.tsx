import React, { useEffect, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { KeyRound, Loader2, CheckCircle2, LinkIcon, AlertCircle, Download } from 'lucide-react';
import { CREATE_PASSWORD_COPY as COPY } from '../data/checkout';
import { classifyUpdateError, confirmAccount, readAuthFragment, validateNewPassword, type ConfirmOutcome } from '../lib/createPassword';
import { getSupabase } from '../lib/supabase';
import { handleLinkClick } from '../lib/router';

type LinkType = 'invite' | 'recovery' | 'other';

type PageState =
  | { step: 'loading' }
  | { step: 'expired' }
  /** Sem fragmento (recarregou depois de usar o link, ou abriu a página direto). */
  | { step: 'no-session' }
  | { step: 'error' }
  | { step: 'form'; linkType: LinkType; session: Session; client: SupabaseClient }
  | { step: 'done'; orgName?: string; planName?: string };

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-ink-deep/70 border border-cream/12 text-cream-strong text-base sm:text-sm outline-none transition-colors focus:border-accent/60';

function confirmErrorMessage(code: Extract<ConfirmOutcome, { ok: false }>['code']): string {
  if (code === 'unauthorized') return COPY.confirmUnauthorized;
  if (code === 'email_not_verified') return COPY.confirmEmailNotVerified;
  if (code === 'network_error') return COPY.confirmNetwork;
  return COPY.confirmServer;
}

/** Tira o fragmento da barra de endereço: recarregar não reabre um link já usado. */
function dropFragment() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

export const CreatePasswordPage: React.FC = () => {
  // Lido no primeiro render, antes de o supabase-js existir e limpar o fragmento.
  const [fragment] = useState(() => readAuthFragment(window.location.hash));
  const [state, setState] = useState<PageState>(() =>
    fragment.kind === 'expired'
      ? { step: 'expired' }
      : fragment.kind === 'error'
        ? { step: 'error' }
        : fragment.kind === 'none'
          ? { step: 'no-session' }
          : { step: 'loading' },
  );
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** A senha já foi gravada: numa nova tentativa (confirmAccount falhou) não regrava. */
  const passwordSaved = useRef(false);

  useEffect(() => {
    if (fragment.kind === 'error' || fragment.kind === 'expired') dropFragment();
    if (fragment.kind !== 'session') return;
    let alive = true;
    (async () => {
      try {
        const client = await getSupabase();
        const { data } = await client.auth.getSession();
        if (!alive) return;
        setState(
          data.session
            ? { step: 'form', linkType: fragment.linkType, session: data.session, client }
            : { step: 'no-session' },
        );
      } catch {
        dropFragment();
        if (alive) setState({ step: 'no-session' });
      }
    })();
    return () => {
      alive = false;
    };
  }, [fragment]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state.step !== 'form' || saving) return;
    const required = state.linkType === 'invite';
    const invalid = validateNewPassword(password, confirm, required);
    setFormError(invalid);
    if (invalid) return;

    setSaving(true);
    if (password && !passwordSaved.current) {
      const { error } = await state.client.auth.updateUser({ password });
      const kind = error ? classifyUpdateError(error) : null;
      // `same`: a senha já é essa (tentativa anterior gravou); segue para confirmar.
      if (error && kind !== 'same') {
        setSaving(false);
        setFormError(kind === 'network' ? COPY.confirmNetwork : kind === 'weak' ? COPY.passwordWeak : COPY.confirmServer);
        return;
      }
      passwordSaved.current = true;
    }
    const outcome = await confirmAccount(state.session.access_token);
    if ('code' in outcome) {
      setSaving(false);
      setFormError(confirmErrorMessage(outcome.code));
      return;
    }
    await state.client.auth.signOut({ scope: 'local' }).catch(() => undefined);
    dropFragment();
    setPassword('');
    setConfirm('');
    const done = outcome as Extract<ConfirmOutcome, { ok: true }>;
    setState({ step: 'done', orgName: done.orgName, planName: done.planName });
  };

  return (
    <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 min-h-[70vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-10" data-create-password={state.step}>
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-[11px] uppercase tracking-widest mb-5">
            <KeyRound className="w-3.5 h-3.5" />
            {COPY.eyebrow}
          </p>

          {state.step === 'loading' && (
            <p className="flex items-center gap-3 text-sm text-cream/80" role="status">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              {COPY.loading}
            </p>
          )}

          {(state.step === 'expired' || state.step === 'no-session' || state.step === 'error') && (
            <div>
              <span className="inline-flex w-12 h-12 rounded-2xl border bg-warn/10 border-warn/25 text-warn items-center justify-center mb-4">
                <LinkIcon className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-3">
                {state.step === 'error' ? COPY.errorTitle : COPY.expiredTitle}
              </h1>
              <p className="text-sm text-cream/80 leading-relaxed">
                {state.step === 'error' ? COPY.errorBody : COPY.expiredBody}
              </p>
            </div>
          )}

          {state.step === 'form' && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-3">
                  {state.linkType === 'invite' ? COPY.inviteTitle : COPY.recoveryTitle}
                </h1>
                <p className="text-sm text-cream/75 leading-relaxed">
                  {state.linkType === 'invite' ? COPY.inviteIntro : COPY.recoveryIntro}
                </p>
                {state.session.user.email && (
                  <p className="text-xs text-muted mt-3">{state.session.user.email}</p>
                )}
              </div>

              {state.linkType !== 'invite' && (
                <p className="text-sm text-cream-strong font-medium">{COPY.recoveryOptional}</p>
              )}

              <div>
                <label htmlFor="new-password" className="block text-sm text-cream/85 mb-1.5">
                  {COPY.passwordLabel}
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  aria-invalid={!!formError}
                  aria-describedby="new-password-hint"
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <p id="new-password-hint" className="text-xs text-muted mt-1.5">{COPY.passwordHint}</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm text-cream/85 mb-1.5">
                  {COPY.confirmLabel}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  aria-invalid={!!formError}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 px-4 py-3 rounded-xl border border-warn/30 bg-warn/10 text-sm text-warn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong disabled:opacity-60 disabled:cursor-wait text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? COPY.saving : state.linkType === 'invite' ? COPY.submitInvite : COPY.submitRecovery}
              </button>
            </form>
          )}

          {state.step === 'done' && (
            <div>
              <span className="inline-flex w-12 h-12 rounded-2xl border bg-ok/10 border-ok/25 text-ok items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-light text-cream-strong tracking-tight mb-3">
                {COPY.doneTitle}
              </h1>
              {(state.orgName || state.planName) && (
                <p className="text-sm text-cream/85 mb-4">
                  {state.orgName
                    ? COPY.doneTeam(state.orgName, state.planName)
                    : COPY.donePlanOnly(state.planName!)}
                </p>
              )}
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-cream/80 mb-7">
                {COPY.doneSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <a
                href="/#downloads"
                onClick={(event) => handleLinkClick(event, '/#downloads')}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {COPY.download}
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
