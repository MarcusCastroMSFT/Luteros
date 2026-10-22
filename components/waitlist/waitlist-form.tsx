'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { quickValidateEmail } from '@/lib/email-quick-validation';
import { cn } from '@/lib/utils';

type Audience = 'doctors' | 'general';
type Status = 'idle' | 'loading' | 'success';

const AUDIENCE_OPTIONS: { value: Audience; label: string; hint: string }[] = [
  { value: 'doctors', label: 'Profissional de saúde', hint: 'Médicos, psicólogos, fisioterapeutas e outras áreas' },
  { value: 'general', label: 'Outro interesse', hint: 'Estudante, pesquisador ou público em geral' },
];

const fieldClass =
  'h-12 w-full rounded-lg border border-brand-600/25 bg-white px-4 text-base text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-brand-600/50 focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-600/15 disabled:opacity-70 aria-[invalid=true]:border-red-500 motion-reduce:transition-none';

export function WaitlistForm({ className }: { className?: string }) {
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === 'loading') return;

    const validation = email.trim() ? quickValidateEmail(email) : { isValid: false, error: 'Informe seu e-mail.' };
    const nextEmailError = validation.isValid ? '' : validation.error ?? 'E-mail inválido';
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
        body: JSON.stringify({ email: email.trim(), audience, consent }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível registrar seu interesse agora. Tente novamente.');
      }
      setStatus('success');
    } catch (error) {
      setStatus('idle');
      setFormError(error instanceof Error ? error.message : 'Não foi possível registrar seu interesse agora. Tente novamente.');
    }
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
      <p className="mb-8 text-base leading-[1.7] text-slate-600">Deixe seu e-mail e avisamos quando a assinatura abrir.</p>

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
