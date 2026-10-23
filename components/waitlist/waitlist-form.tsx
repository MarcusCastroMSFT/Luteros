'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { quickValidateEmail } from '@/lib/email-quick-validation';
import { cn } from '@/lib/utils';

type Audience = 'doctors' | 'general';
type Status = 'idle' | 'loading' | 'success';

// Anonymous visitors cannot be looked up on the server, so this browser remembers that it already joined.
const JOINED_KEY = 'lutteros:waitlist-joined';
const joinedListeners = new Set<() => void>();

function subscribeJoined(listener: () => void) {
  joinedListeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    joinedListeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function setJoinedHere(joined: boolean) {
  if (joined) window.localStorage.setItem(JOINED_KEY, '1');
  else window.localStorage.removeItem(JOINED_KEY);
  joinedListeners.forEach((listener) => listener());
}

type JoinedHere = 'unknown' | 'yes' | 'no';
const readJoinedHere = (): JoinedHere => (window.localStorage.getItem(JOINED_KEY) === '1' ? 'yes' : 'no');
const readJoinedOnServer = (): JoinedHere => 'unknown';

const AUDIENCE_OPTIONS: { value: Audience; label: string; hint: string }[] = [
  { value: 'doctors', label: 'Profissional de saúde', hint: 'Médicos, psicólogos, fisioterapeutas e outras áreas' },
  { value: 'general', label: 'Outro interesse', hint: 'Estudante, pesquisador ou público em geral' },
];

const fieldClass =
  'h-12 w-full rounded-lg border border-brand-600/25 bg-white px-4 text-base text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-brand-600/50 focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-600/15 disabled:opacity-70 aria-[invalid=true]:border-red-500 motion-reduce:transition-none';

export function WaitlistForm({ className }: { className?: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const accountEmail = user?.email ?? null;
  const joinedHere = useSyncExternalStore(subscribeJoined, readJoinedHere, readJoinedOnServer);
  const [accountStatus, setAccountStatus] = useState<{ email: string; onList: boolean } | null>(null);
  const [email, setEmail] = useState('');
  const [audience, setAudience] = useState<Audience | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [emailError, setEmailError] = useState('');
  const [consentError, setConsentError] = useState('');
  const [formError, setFormError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const emailId = useId();
  const emailErrorId = useId();
  const consentId = useId();
  const consentErrorId = useId();

  useEffect(() => {
    if (!accountEmail) return;
    let cancelled = false;
    fetch('/api/waitlist/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { onList?: boolean } | null) => {
        if (!cancelled) setAccountStatus({ email: accountEmail, onList: data?.onList === true });
      })
      .catch(() => {
        if (!cancelled) setAccountStatus({ email: accountEmail, onList: false });
      });
    return () => {
      cancelled = true;
    };
  }, [accountEmail]);

  const accountOnList = accountStatus?.email === accountEmail ? accountStatus.onList : null;
  const checking = authLoading || (accountEmail ? accountOnList === null : joinedHere === 'unknown');
  const isMember = accountEmail ? accountOnList === true : joinedHere === 'yes';
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === 'loading') return;

    const validation = email.trim() ? quickValidateEmail(email) : { isValid: false, error: 'Informe seu e-mail.' };
    const nextEmailError = accountEmail || validation.isValid ? '' : validation.error ?? 'E-mail inválido';
    const nextConsentError = consent ? '' : 'Confirme para entrar na lista de espera.';
    setEmailError(nextEmailError);
    setConsentError(nextConsentError);
    setFormError('');

    if (nextEmailError) return emailRef.current?.focus();
    if (nextConsentError) return consentRef.current?.focus();

    setStatus('loading');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountEmail ? undefined : email.trim(), audience, consent }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível registrar seu interesse agora. Tente novamente.');
      }
      if (!accountEmail) setJoinedHere(true);
      setStatus('success');
    } catch (error) {
      setStatus('idle');
      setFormError(error instanceof Error ? error.message : 'Não foi possível registrar seu interesse agora. Tente novamente.');
    }
  }

  if (checking) {
    return (
      <div
        aria-busy="true"
        aria-label="Verificando sua inscrição"
        className={cn('min-h-[420px] animate-pulse rounded-[12px_48px_12px_12px] border border-brand-600/10 bg-white/50 motion-reduce:animate-none', className)}
      />
    );
  }

  if (isMember && status !== 'success') {
    return (
      <div role="status" className={cn('rounded-[12px_48px_12px_12px] border border-brand-600/20 bg-[#e4eeeb]/70 p-8 sm:p-10', className)}>
        <span aria-hidden="true" className="mb-5 flex size-12 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check className="size-6" />
        </span>
        <h2 className="mb-3 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Você já está na lista</h2>
        <p className="mb-6 text-base leading-[1.8] text-slate-600">
          {accountEmail ? (
            <>Vamos avisar <strong className="font-semibold text-brand-900">{accountEmail}</strong> por e-mail quando a assinatura estiver disponível. Não precisa fazer mais nada.</>
          ) : (
            <>Neste navegador você já pediu aviso. Quando a assinatura estiver disponível, enviamos um e-mail para o endereço que você informou.</>
          )}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/articles" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            Ler artigos <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="/courses" className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-600/30 px-6 font-medium text-brand-700 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            Explorar cursos
          </Link>
        </div>
        {accountEmail ? null : (
          <button
            type="button"
            onClick={() => setJoinedHere(false)}
            className="mt-5 cursor-pointer text-sm font-medium text-brand-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Cadastrar outro e-mail
          </button>
        )}
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div role="status" className={cn('rounded-[12px_48px_12px_12px] border border-brand-600/20 bg-[#e4eeeb]/70 p-8 sm:p-10', className)}>
        <span aria-hidden="true" className="mb-5 flex size-12 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check className="size-6" />
        </span>
        <h2 className="mb-3 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Você está na lista</h2>
        <p className="mb-6 text-base leading-[1.8] text-slate-600">
          Avisaremos por e-mail quando a assinatura estiver disponível. Enquanto isso, os conteúdos gratuitos continuam abertos.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/articles" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            Ler artigos <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="/courses" className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-600/30 px-6 font-medium text-brand-700 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            Explorar cursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn('rounded-[12px_48px_12px_12px] border border-brand-600/20 bg-white/70 p-6 sm:p-10', className)}>
      <h2 className="mb-2 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Entre na lista de espera</h2>
      <p className="mb-8 text-base leading-[1.7] text-slate-600">
        {accountEmail ? (
          <>Avisamos <strong className="font-semibold text-brand-900">{accountEmail}</strong>, o e-mail da sua conta, quando a assinatura abrir.</>
        ) : (
          'Deixe seu e-mail e avisamos quando a assinatura abrir.'
        )}
      </p>

      {accountEmail ? null : (
      <div className="mb-6">
        <label htmlFor={emailId} className="mb-2 block text-sm font-medium text-brand-900">E-mail</label>
        <input
          ref={emailRef}
          id={emailId}
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) setEmailError('');
          }}
          disabled={status === 'loading'}
          aria-required="true"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? emailErrorId : undefined}
          className={fieldClass}
        />
        {emailError ? <p id={emailErrorId} role="alert" className="mt-2 text-sm text-red-600">{emailError}</p> : null}
      </div>
      )}

      <fieldset className="mb-6" disabled={status === 'loading'}>
        <legend className="mb-2 text-sm font-medium text-brand-900">Seu perfil <span className="font-normal text-slate-500">(opcional)</span></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {AUDIENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-600/15 motion-reduce:transition-none',
                audience === option.value ? 'border-brand-600 bg-[#e4eeeb]/70' : 'border-brand-600/25 bg-white hover:border-brand-600/50'
              )}
            >
              <input
                type="radio"
                name="audience"
                value={option.value}
                checked={audience === option.value}
                onChange={() => setAudience(option.value)}
                className="mt-1 size-4 accent-[#198189]"
              />
              <span>
                <span className="block text-base font-medium text-brand-900">{option.label}</span>
                <span className="block text-sm leading-6 text-slate-600">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mb-8">
        <div className="flex items-start gap-3">
          <input
            ref={consentRef}
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              if (consentError) setConsentError('');
            }}
            disabled={status === 'loading'}
            aria-required="true"
            aria-invalid={consentError ? true : undefined}
            aria-describedby={consentError ? consentErrorId : undefined}
            className="mt-1 size-5 shrink-0 accent-[#198189]"
          />
          <label htmlFor={consentId} className="text-sm leading-6 text-slate-600">
            Concordo em receber um e-mail quando a assinatura estiver disponível. Uso seu e-mail apenas para isso, conforme a{' '}
            <Link href="/privacy" className="font-medium text-brand-700 underline-offset-4 hover:underline">Política de privacidade</Link>.
          </label>
        </div>
        {consentError ? <p id={consentErrorId} role="alert" className="mt-2 text-sm text-red-600">{consentError}</p> : null}
      </div>

      {formError ? <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p> : null}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-brand-600 px-7 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 disabled:cursor-default disabled:opacity-80 sm:w-auto motion-reduce:transition-none"
      >
        {status === 'loading' ? <Loader2 aria-hidden="true" className="size-5 animate-spin" /> : null}
        {status === 'loading' ? 'Enviando...' : 'Entrar na lista de espera'}
      </button>
    </form>
  );
}
