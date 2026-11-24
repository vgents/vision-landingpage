import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, UserRound } from 'lucide-react';
import { ACCOUNT_COPY as COPY } from '../data/account';
import {
  resendSignupCode,
  signIn,
  signUp,
  verifySignupCode,
  type AccountErrorCode,
} from '../lib/account';
import { ARTIFACT_FOR_PLATFORM, type PlatformKey } from '../lib/download';
import { navigate } from '../lib/router';
import { startDownload } from '../lib/useAccount';

interface EntrarPageProps {
  next: 'download' | null;
  platform: PlatformKey | null;
  version: string | null;
}

type Tab = 'login' | 'signup';
type Step = { name: 'form' } | { name: 'code'; email: string } | { name: 'done'; message: string | null };

const inputClass =
  'w-full px-4 py-3 rounded-[10px] bg-panel border border-cream/20 hover:border-cream/30 text-cream-strong text-base sm:text-sm outline-none shadow-sm transition-[border-color,box-shadow] focus:border-accent focus:ring-4 focus:ring-accent/20';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EntrarPage: React.FC<EntrarPageProps> = ({ next, platform, version }) => {
  const [tab, setTab] = useState<Tab>('login');
  const [step, setStep] = useState<Step>({ name: 'form' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const wantsDownload = next === 'download' && platform !== null;

  /** Conta pronta: segue para o download pedido, ou volta para os downloads. */
  const finish = async () => {
    if (!wantsDownload || !platform) {
      navigate('/#downloads');
      return;
    }
    const out = await startDownload({ platformKey: platform, artifactType: ARTIFACT_FOR_PLATFORM[platform], version: version ?? undefined });
    if (!alive.current) return;
    setStep({ name: 'done', message: out.started === true ? COPY.startedDownload : out.message });
  };

  const errorText = (c: AccountErrorCode) => COPY.errors[c];

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setInfo(null);
    const mail = email.trim();
    if (!EMAIL_RE.test(mail)) return setError(COPY.errors.invalidEmail);
    setBusy(true);
    try {
      if (tab === 'signup') {
        const out = await signUp(mail, password);
        if (out.ok === false) return setError(errorText(out.code));
        setCode('');
        setStep({ name: 'code', email: mail });
      } else {
        const out = await signIn(mail, password);
        if (out.ok) return await finish();
        if (out.ok === false && out.code === 'email_not_confirmed') {
          await resendSignupCode(mail);
          setCode('');
          setInfo(COPY.errors.email_not_confirmed);
          setStep({ name: 'code', email: mail });
          return;
        }
        if (out.ok === false) setError(errorText(out.code));
      }
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const submitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || step.name !== 'code') return;
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) return setError(COPY.codeInvalid);
    setBusy(true);
    try {
      const out = await verifySignupCode(step.email, code);
      if (out.ok === false) return setError(errorText(out.code));
      if (out.accessToken) return await finish();
      // Código aceito sem sessão: entra com a senha digitada.
      const login = await signIn(step.email, password);
      if (login.ok === true) return await finish();
      setStep({ name: 'form' });
      setTab('login');
      setError(login.ok === false ? errorText(login.code) : COPY.errors.unknown);
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const resend = async () => {
    if (busy || step.name !== 'code') return;
    setError(null);
    setInfo(null);
    const out = await resendSignupCode(step.email);
    if (!alive.current) return;
    if (out.ok === true) setInfo(COPY.resent);
    else setError(errorText(out.code));
  };

  const retryDownload = async () => {
    if (!platform) return;
    setBusy(true);
    const out = await startDownload({ platformKey: platform, artifactType: ARTIFACT_FOR_PLATFORM[platform], version: version ?? undefined });
    if (!alive.current) return;
    setBusy(false);
    setStep({ name: 'done', message: out.started === true ? COPY.startedDownload : out.message });
  };

  return (
    <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 min-h-[70vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-10" data-entrar={step.name}>
          <p className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-[0.08em] mb-5">
            <UserRound className="w-3.5 h-3.5" />
            {COPY.eyebrow}
          </p>

          {step.name === 'form' && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-cream-strong tracking-[-0.035em] mb-3">{COPY.title}</h1>
              <p className="text-sm text-cream/75 leading-relaxed mb-6">{COPY.intro}</p>

              <div role="tablist" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-ink-deep border border-cream/10 mb-6">
                {(['login', 'signup'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => {
                      setTab(t);
                      setError(null);
                    }}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      tab === t ? 'bg-accent text-on-accent' : 'text-cream/80 hover:text-cream-strong'
                    }`}
                  >
                    {t === 'login' ? COPY.tabLogin : COPY.tabSignup}
                  </button>
                ))}
              </div>

              <form onSubmit={submitForm} noValidate className="space-y-5">
                <div>
                  <label htmlFor="entrar-email" className="block text-sm text-cream/85 mb-1.5">{COPY.emailLabel}</label>
                  <input
                    id="entrar-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="entrar-senha" className="block text-sm text-cream/85 mb-1.5">{COPY.passwordLabel}</label>
                  <input
                    id="entrar-senha"
                    type="password"
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  {tab === 'signup' && <p className="text-xs text-muted mt-1.5">{COPY.passwordHint}</p>}
                </div>
                {error && <ErrorLine text={error} />}
                <SubmitButton busy={busy} label={tab === 'login' ? COPY.submitLogin : COPY.submitSignup} />
              </form>
            </>
          )}

          {step.name === 'code' && (
            <form onSubmit={submitCode} noValidate className="space-y-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-cream-strong tracking-[-0.035em] mb-3">{COPY.codeTitle}</h1>
              <p className="text-sm text-cream/75 leading-relaxed">{COPY.codeIntro(step.email)}</p>
              <div>
                <label htmlFor="entrar-codigo" className="block text-sm text-cream/85 mb-1.5">{COPY.codeLabel}</label>
                <input
                  id="entrar-codigo"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className={`${inputClass} tracking-[0.4em] text-center`}
                />
              </div>
              {info && <p className="text-xs text-ok" role="status">{info}</p>}
              {error && <ErrorLine text={error} />}
              <SubmitButton busy={busy} label={COPY.codeSubmit} />
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={resend} className="text-muted hover:text-accent-strong underline underline-offset-2">
                  {COPY.resend}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep({ name: 'form' });
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-muted hover:text-cream-strong"
                >
                  {COPY.backToForm}
                </button>
              </div>
            </form>
          )}

          {step.name === 'done' && (
            <div className="space-y-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-cream-strong tracking-[-0.035em]">{COPY.signedIn}</h1>
              {step.message ? (
                <p className="flex items-start gap-2 text-sm text-cream/85" role="status">
                  <CheckCircle2 className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                  {step.message}
                </p>
              ) : null}
              {wantsDownload && (
                <button
                  type="button"
                  onClick={retryDownload}
                  disabled={busy}
                  className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm disabled:opacity-60"
                >
                  {busy ? COPY.preparing : COPY.retryDownload}
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/#downloads')}
                className="w-full py-3.5 rounded-xl bg-panel hover:bg-accent-tint border border-cream/20 hover:border-accent hover:text-accent shadow-sm text-cream text-sm font-medium"
              >
                {COPY.goDownloads}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const ErrorLine: React.FC<{ text: string }> = ({ text }) => (
  <p className="flex items-start gap-2 text-sm text-warn" role="alert">
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
    {text}
  </p>
);

const SubmitButton: React.FC<{ busy: boolean; label: string }> = ({ busy, label }) => (
  <button
    type="submit"
    disabled={busy}
    className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm shadow-lg shadow-accent/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
  >
    {busy ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        {COPY.working}
      </>
    ) : (
      label
    )}
  </button>
);
