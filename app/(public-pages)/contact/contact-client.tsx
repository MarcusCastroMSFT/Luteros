'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/pageHeader';
import { BrandIcon, type BrandIconName } from '@/components/brand/brand-icon';
import { cn } from '@/lib/utils';
import { formatBrazilianPhone } from '@/lib/phone';
import { contactFormSchema, contactReasons } from '@/lib/contact';
import Link from 'next/link';

// =============================================================================
// CONSTANTS
// =============================================================================

const contactInfo: { icon: BrandIconName; title: string; description: string; value: string; href: string | null }[] = [
  {
    icon: 'contact',
    title: 'E-mail',
    description: 'Converse com a equipe',
    value: 'contato@lutteros.com.br',
    href: 'mailto:contato@lutteros.com.br',
  },
  {
    icon: 'discussion',
    title: 'Prazo de resposta',
    description: 'Nosso retorno é por e-mail',
    value: 'Até 48 horas úteis',
    href: null,
  },
];

const faqs = [
  {
    question: 'Qual o prazo de resposta?',
    answer: 'Respondemos todas as mensagens em até 48 horas úteis.',
  },
  {
    question: 'O que devo incluir na mensagem?',
    answer: 'Descreva sua dúvida e, se necessário, informe o curso ou artigo relacionado. Não envie senhas ou dados de cartão.',
  },
  {
    question: 'Vocês oferecem suporte por WhatsApp?',
    answer: 'Utilize este formulário ou o e-mail de contato para falar com a equipe.',
  },
];

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  reason?: string;
  subject?: string;
  message?: string;
}

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  reason: '',
  subject: '',
  message: '',
};

const validateForm = (data: typeof initialFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  const result = contactFormSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && field in data) {
        errors[field as keyof ValidationErrors] ??= issue.message;
      }
    }
  }
  return errors;
};

// =============================================================================
// FORM FIELD COMPONENT
// =============================================================================

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, htmlFor, error, touched, required, children, hint }: FormFieldProps) {
  const showError = touched && error;
  
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={htmlFor} 
        className={cn(
          "text-base font-medium text-brand-900",
          showError && "text-red-600"
        )}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {showError ? (
        <p id={`${htmlFor}-feedback`} role="alert" className="text-sm text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-feedback`} className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ContactPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState('');
  const submissionId = useRef<string | null>(null);
  
  // Security: Honeypot field (hidden from users, bots will fill it)
  const [honeypot, setHoneypot] = useState('');
  
  // Security: Track submission time to detect bot rapid submissions
  const formLoadTime = useRef<number>(0);
  useEffect(() => { formLoadTime.current = Date.now() }, []);

  // Security: Rate limiting - track last submission
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const RATE_LIMIT_MS = 30000; // 30 seconds between submissions

  // Performance: Debounce validation
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate on change with debounce
  const validateField = useCallback((name: string, value: string) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      const tempData = { ...formData, [name]: value };
      const fieldErrors = validateForm(tempData);
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name as keyof ValidationErrors] }));
    }, 300);
  }, [formData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    submissionId.current = null;
    const nextValue = name === 'phone' ? formatBrazilianPhone(value) : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));

    if (name === 'phone') {
      const input = e.currentTarget;
      const cursor = input.selectionStart;
      if (cursor !== null && cursor < value.length) {
        const digitsBeforeCursor = value.slice(0, cursor).replace(/\D/g, '').length;
        let position = 0;
        let digits = 0;
        while (position < nextValue.length && digits < digitsBeforeCursor) {
          if (/\d/.test(nextValue[position])) digits++;
          position++;
        }
        requestAnimationFrame(() => input.setSelectionRange(position, position));
      }
    }
    
    // Validate if field was already touched
    if (touched[name]) {
      validateField(name, nextValue);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validateForm(formData);
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name as keyof ValidationErrors] }));
  }, [formData]);

  const handleReasonChange = useCallback((value: string) => {
    submissionId.current = null;
    setFormData(prev => ({ ...prev, reason: value }));
    setTouched(prev => ({ ...prev, reason: true }));
    
    // Clear reason error when selected
    setErrors(prev => ({ ...prev, reason: undefined }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    
    // Security: Check honeypot (should be empty)
    if (honeypot) {
      console.warn('Bot submission detected');
      setSubmitError('Não foi possível validar o envio. Atualize a página e tente novamente.');
      return;
    }

    // Security: Check if form was filled too quickly (likely a bot)
    const timeSpent = Date.now() - formLoadTime.current;
    if (timeSpent < 3000) { // Less than 3 seconds
      console.warn('Form submitted too quickly');
      toast.error('Por favor, preencha o formulário com calma.');
      return;
    }

    // Security: Rate limiting
    if (lastSubmitTime && Date.now() - lastSubmitTime < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmitTime)) / 1000);
      toast.error(`Aguarde ${remainingSeconds} segundos antes de enviar novamente.`);
      return;
    }

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus first field with error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      element?.focus();
      
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }

    setIsSubmitting(true);

    try {
      submissionId.current ??= crypto.randomUUID();
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website: honeypot, submissionId: submissionId.current }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || 'Não foi possível salvar sua mensagem. Tente novamente.');
      }

      setLastSubmitTime(Date.now());
      setIsSubmitted(true);
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar sua mensagem. Tente novamente.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setSubmitError('');
    submissionId.current = null;
    formLoadTime.current = Date.now();
  }, []);

  // Character count for message
  const messageLength = formData.message.length;
  const messageMaxLength = 2000;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="contact"
        title="Entre em Contato"
        description="Estamos aqui para ajudar. Envie sua mensagem e responderemos o mais breve possível."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contato' },
        ]}
      />

      <div className="mx-auto max-w-[1480px] px-6 pb-20 pt-8 sm:px-10 lg:px-12">
        <div data-reveal-stagger="" className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-[12px_40px_12px_12px] border border-brand-600/15 bg-white/60 p-5 sm:p-8 lg:p-10">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[42%_58%_52%_38%] bg-brand-50">
                    <CheckCircle2 className="size-10 text-brand-600" />
                  </div>
                  <h3 className="mb-3 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Obrigado por entrar em contato. Nossa equipe responderá sua mensagem em até 48 horas úteis.
                  </p>
                  <Button onClick={resetForm} variant="outline" className="cursor-pointer">
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="mb-3 font-[family-name:var(--font-cardo)] text-3xl text-brand-900 sm:text-4xl">
                      Envie sua mensagem
                    </h2>
                    <p className="text-gray-600">
                      Preencha o formulário abaixo e entraremos em contato.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
                    {/* Honeypot field - hidden from users */}
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute -left-[9999px] opacity-0 h-0 w-0"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Nome Completo"
                        htmlFor="name"
                        error={errors.name}
                        touched={touched.name}
                        required
                      >
                        <Input
                          id="name"
                          name="name"
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('name')}
                          maxLength={100}
                          autoComplete="name"
                          aria-invalid={touched.name && !!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          className={cn(
                            "min-h-12 border-brand-600/25 bg-background text-base md:text-base motion-reduce:transition-none",
                            touched.name && errors.name && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                      </FormField>

                      <FormField
                        label="Email"
                        htmlFor="email"
                        error={errors.email}
                        touched={touched.email}
                        required
                      >
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('email')}
                          maxLength={254}
                          autoComplete="email"
                          aria-invalid={touched.email && !!errors.email}
                          className={cn(
                            "min-h-12 border-brand-600/25 bg-background text-base md:text-base motion-reduce:transition-none",
                            touched.email && errors.email && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Telefone"
                        htmlFor="phone"
                        error={errors.phone}
                        touched={touched.phone}
                        hint="Opcional"
                      >
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('phone')}
                          autoComplete="tel"
                          aria-invalid={touched.phone && !!errors.phone}
                          aria-describedby="phone-feedback"
                          className={cn(
                            "min-h-12 border-brand-600/25 bg-background text-base md:text-base motion-reduce:transition-none",
                            touched.phone && errors.phone && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                      </FormField>

                      <FormField
                        label="Motivo do Contato"
                        htmlFor="reason"
                        error={errors.reason}
                        touched={touched.reason}
                        required
                      >
                        <Select 
                          value={formData.reason} 
                          onValueChange={handleReasonChange}
                        >
                          <SelectTrigger 
                            id="reason"
                            aria-invalid={touched.reason && !!errors.reason}
                            className={cn(
                              "min-h-12 w-full border-brand-600/25 bg-background text-base motion-reduce:transition-none",
                              touched.reason && errors.reason && "border-red-500 focus-visible:ring-red-500"
                            )}
                          >
                            <SelectValue placeholder="Selecione um motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            {contactReasons.map((reason) => (
                              <SelectItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    <FormField
                      label="Assunto"
                      htmlFor="subject"
                      error={errors.subject}
                      touched={touched.subject}
                      hint="Opcional - Resumo do seu contato"
                    >
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Resumo do seu contato"
                        value={formData.subject}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('subject')}
                        maxLength={200}
                        aria-invalid={touched.subject && !!errors.subject}
                        className={cn(
                          "min-h-12 border-brand-600/25 bg-background text-base md:text-base motion-reduce:transition-none",
                          touched.subject && errors.subject && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                    </FormField>

                    <FormField
                      label="Mensagem"
                      htmlFor="message"
                      error={errors.message}
                      touched={touched.message}
                      required
                    >
                      <div className="relative">
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Descreva detalhadamente sua dúvida ou solicitação..."
                          rows={10}
                          value={formData.message}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('message')}
                          maxLength={messageMaxLength}
                          aria-invalid={touched.message && !!errors.message}
                          className={cn(
                            "min-h-64 field-sizing-fixed resize-y border-brand-600/25 bg-background text-base md:text-base sm:min-h-72 motion-reduce:transition-none",
                            touched.message && errors.message && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                          <span className={cn(
                            messageLength > messageMaxLength * 0.9 && "text-orange-500",
                            messageLength >= messageMaxLength && "text-red-500"
                          )}>
                            {messageLength}
                          </span>
                          /{messageMaxLength}
                        </div>
                      </div>
                    </FormField>

                    {submitError ? <p role="alert" className="text-sm text-red-600">{submitError}</p> : null}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <Button
                        type="submit"
                        size="lg"
                        className="h-14 w-full cursor-pointer bg-brand-600 text-base shadow-none hover:bg-brand-700 motion-reduce:transition-none sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-gray-500">
                        Campos marcados com <span className="text-red-500">*</span> são obrigatórios
                      </p>
                    </div>
                    </fieldset>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className="rounded-[12px_32px_12px_12px] bg-[#e4eeeb]/60 p-6 sm:p-8">
              <h3 className="mb-6 font-[family-name:var(--font-cardo)] text-2xl text-brand-900">
                Vamos conversar
              </h3>
              <div className="space-y-5">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <BrandIcon kind={info.icon} className="size-14 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{info.title}</p>
                      <p className="text-sm text-gray-500 mb-1">{info.description}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="break-words text-base text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-700">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick FAQ */}
            <div className="rounded-xl border border-brand-600/15 bg-background p-6 sm:p-8">
              <h3 className="mb-6 font-[family-name:var(--font-cardo)] text-2xl text-brand-900">
                Antes de enviar
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {faq.question}
                    </p>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" asChild className="mt-5 h-auto min-h-12 w-full justify-start whitespace-normal px-0 text-base text-brand-700 hover:bg-transparent hover:text-brand-900">
                <Link href="/faq">Ver todas as perguntas →</Link>
              </Button>
            </div>

            {/* Help Center CTA */}
            <div className="rounded-[12px_32px_12px_12px] bg-[#eee5ec] p-6 sm:p-8">
              <h3 className="mb-3 font-[family-name:var(--font-cardo)] text-2xl text-brand-900">
                Sua privacidade importa
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Compartilhe apenas as informações necessárias para entendermos sua solicitação.
              </p>
              <Button asChild variant="outline" className="w-full cursor-pointer">
                <Link href="/privacy">Política de privacidade</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
