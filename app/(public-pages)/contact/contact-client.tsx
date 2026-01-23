'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Users,
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
import { cn } from '@/lib/utils';

// =============================================================================
// CONSTANTS
// =============================================================================

const contactReasons = [
  { value: 'general', label: 'Informações Gerais', icon: MessageSquare },
  { value: 'support', label: 'Suporte Técnico', icon: HelpCircle },
  { value: 'courses', label: 'Dúvidas sobre Cursos', icon: Users },
  { value: 'partnership', label: 'Parcerias', icon: Users },
  { value: 'other', label: 'Outro', icon: MessageSquare },
];

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Responderemos em até 24 horas',
    value: 'contato@lutteros.com.br',
    href: 'mailto:contato@lutteros.com.br',
  },
  {
    icon: Phone,
    title: 'Telefone',
    description: 'Segunda a Sexta, 9h às 18h',
    value: '+55 (11) 9999-9999',
    href: 'tel:+5511999999999',
  },
  {
    icon: MapPin,
    title: 'Endereço',
    description: 'Visite nosso escritório',
    value: 'São Paulo, SP - Brasil',
    href: null,
  },
  {
    icon: Clock,
    title: 'Horário de Atendimento',
    description: 'Estamos disponíveis',
    value: 'Seg - Sex: 9h às 18h',
    href: null,
  },
];

const faqs = [
  {
    question: 'Qual o prazo de resposta?',
    answer: 'Respondemos todas as mensagens em até 24 horas úteis.',
  },
  {
    question: 'Posso agendar uma reunião?',
    answer: 'Sim! Após o primeiro contato, podemos agendar uma chamada de vídeo.',
  },
  {
    question: 'Vocês oferecem suporte por WhatsApp?',
    answer: 'Atualmente nosso suporte é via email e telefone durante horário comercial.',
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

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  // Brazilian phone format: allow various formats
  const phoneRegex = /^[\d\s()+-]{10,20}$/;
  return phoneRegex.test(phone);
};

const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters while preserving legitimate content
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

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

  // Name validation
  const cleanName = sanitizeInput(data.name);
  if (!cleanName) {
    errors.name = 'Nome é obrigatório';
  } else if (cleanName.length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  } else if (cleanName.length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres';
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(cleanName)) {
    errors.name = 'Nome contém caracteres inválidos';
  }

  // Email validation
  const cleanEmail = sanitizeInput(data.email).toLowerCase();
  if (!cleanEmail) {
    errors.email = 'Email é obrigatório';
  } else if (!validateEmail(cleanEmail)) {
    errors.email = 'Digite um email válido';
  }

  // Phone validation (optional)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Digite um telefone válido';
  }

  // Reason validation
  if (!data.reason) {
    errors.reason = 'Selecione um motivo de contato';
  }

  // Subject validation (optional but with limits)
  if (data.subject && data.subject.length > 200) {
    errors.subject = 'Assunto deve ter no máximo 200 caracteres';
  }

  // Message validation
  const cleanMessage = sanitizeInput(data.message);
  if (!cleanMessage) {
    errors.message = 'Mensagem é obrigatória';
  } else if (cleanMessage.length < 10) {
    errors.message = 'Mensagem deve ter pelo menos 10 caracteres';
  } else if (cleanMessage.length > 2000) {
    errors.message = 'Mensagem deve ter no máximo 2000 caracteres';
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
          "text-sm font-medium",
          showError && "text-red-600"
        )}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {showError ? (
        <p className="text-sm text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-500">{hint}</p>
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
  
  // Security: Honeypot field (hidden from users, bots will fill it)
  const [honeypot, setHoneypot] = useState('');
  
  // Security: Track submission time to detect bot rapid submissions
  const formLoadTime = useRef(Date.now());
  
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate if field was already touched
    if (touched[name]) {
      validateField(name, value);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validateForm(formData);
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name as keyof ValidationErrors] }));
  }, [formData]);

  const handleReasonChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, reason: value }));
    setTouched(prev => ({ ...prev, reason: true }));
    
    // Clear reason error when selected
    setErrors(prev => ({ ...prev, reason: undefined }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security: Check honeypot (should be empty)
    if (honeypot) {
      // Bot detected - silently "succeed" to not reveal detection
      console.warn('Bot submission detected');
      setIsSubmitted(true);
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
    setLastSubmitTime(Date.now());

    try {
      // Sanitize data before sending
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email).toLowerCase(),
        phone: sanitizeInput(formData.phone),
        reason: formData.reason,
        subject: sanitizeInput(formData.subject),
        message: sanitizeInput(formData.message),
      };

      // TODO: Replace with actual API call
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sanitizedData),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSubmitted(true);
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    formLoadTime.current = Date.now();
  }, []);

  // Character count for message
  const messageLength = formData.message.length;
  const messageMaxLength = 2000;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Entre em Contato"
        description="Estamos aqui para ajudar. Envie sua mensagem e responderemos o mais breve possível."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contato' },
        ]}
      />

      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Obrigado por entrar em contato. Nossa equipe responderá sua mensagem em até 24 horas úteis.
                  </p>
                  <Button onClick={resetForm} variant="outline" className="cursor-pointer">
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Envie sua Mensagem
                    </h2>
                    <p className="text-gray-600">
                      Preencha o formulário abaixo e entraremos em contato.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                            "transition-colors",
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
                            "transition-colors",
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
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('phone')}
                          maxLength={20}
                          autoComplete="tel"
                          aria-invalid={touched.phone && !!errors.phone}
                          className={cn(
                            "transition-colors",
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
                              "transition-colors",
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
                          "transition-colors",
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
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('message')}
                          maxLength={messageMaxLength}
                          aria-invalid={touched.message && !!errors.message}
                          className={cn(
                            "transition-colors resize-none",
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

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto cursor-pointer"
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
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Informações de Contato
              </h3>
              <div className="space-y-5">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{info.title}</p>
                      <p className="text-sm text-gray-500 mb-1">{info.description}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm text-primary hover:underline"
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Perguntas Frequentes
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
              <Button variant="link" asChild className="mt-4 p-0 h-auto cursor-pointer">
                <a href="/faq">Ver todas as perguntas →</a>
              </Button>
            </div>

            {/* Help Center CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Precisa de ajuda rápida?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Visite nossa Central de Ajuda para encontrar respostas para as dúvidas mais comuns.
              </p>
              <Button asChild variant="outline" className="w-full cursor-pointer">
                <a href="/help">Acessar Central de Ajuda</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
