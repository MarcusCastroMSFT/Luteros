"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

interface SubscribeProps {
  className?: string;
  title?: string;
  description?: string;
  source?: string;
}

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error';

// Client-side quick validation (lightweight version for instant feedback)
function quickValidateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim().toLowerCase()
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Por favor, insira um e-mail válido (ex: nome@email.com)',
    }
  }

  const [localPart, domain] = trimmedEmail.split('@')
  
  // Check for very short local parts
  if (localPart.length < 2) {
    return {
      isValid: false,
      error: 'E-mail muito curto',
    }
  }

  // Check for obvious fake patterns (client-side only)
  const obviousFakePatterns = [
    /^test[0-9]*$/i,
    /^fake[0-9]*$/i,
    /^aaa+$/i,
    /^asdf+$/i,
    /^qwerty[0-9]*$/i,
    /^[0-9]+$/i, // All numbers
    /^(.)\1{3,}$/i, // Repeating characters like "aaaa"
  ]

  for (const pattern of obviousFakePatterns) {
    if (pattern.test(localPart)) {
      return {
        isValid: false,
        error: 'Por favor, use seu e-mail real',
      }
    }
  }

  // Check for blocked test domains
  const blockedDomains = ['example.com', 'test.com', 'fake.com', 'mailinator.com']
  if (blockedDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'Este domínio de e-mail não é permitido',
    }
  }

  return { isValid: true }
}

export function Subscribe({ 
  className = "",
  title = "Newsletter",
  description = "Inscreva-se em nossa newsletter e receba conteúdos exclusivos diretamente no seu e-mail.",
  source = "footer"
}: SubscribeProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    // Client-side validation
    const validationResult = quickValidateEmail(trimmedEmail);
    if (!validationResult.isValid) {
      setStatus('error');
      setErrorMessage(validationResult.error || 'E-mail inválido');
      inputRef.current?.focus();
      return;
    }

    setStatus('loading');
    setErrorMessage("");
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: trimmedEmail,
          source 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar inscrição');
      }

      setStatus('success');
      setEmail("");
      toast.success(data.message || 'Inscrição realizada com sucesso!');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);

    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Erro ao processar inscrição';
      setErrorMessage(message);
      toast.error(message);
      
      // Reset to idle after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleBlur = () => {
    if (email.trim()) {
      const validationResult = quickValidateEmail(email);
      if (!validationResult.isValid) {
        setStatus('error');
        setErrorMessage(validationResult.error || 'E-mail inválido');
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">
        {description}
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Mail 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
            />
            <Input
              ref={inputRef}
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                // Clear error when user starts typing
                if (status === 'error' && errorMessage) {
                  setStatus('idle');
                  setErrorMessage("");
                }
              }}
              onBlur={handleBlur}
              className={`h-10 pl-9 pr-4 text-base transition-colors ${
                status === 'error' 
                  ? 'border-red-400 focus-visible:ring-red-400 bg-red-50/50' 
                  : status === 'success' 
                    ? 'border-green-500 bg-green-50/50' 
                    : ''
              }`}
              disabled={status === 'loading' || status === 'success'}
              aria-label="Endereço de e-mail"
              aria-invalid={status === 'error'}
              aria-describedby={errorMessage ? "email-error" : undefined}
            />
          </div>
          <Button 
            type="submit" 
            size="sm"
            disabled={status === 'loading' || status === 'success' || !email.trim()}
            className={`px-3 cursor-pointer h-10 min-w-[44px] transition-all ${
              status === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : ''
            }`}
            aria-label={status === 'loading' ? 'Enviando...' : 'Inscrever-se'}
          >
            {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {status === 'success' && <Check size={16} />}
            {(status === 'idle' || status === 'error') && <Send size={16} />}
            <span className="sr-only">
              {status === 'loading' ? 'Enviando...' : 'Inscrever-se na newsletter'}
            </span>
          </Button>
        </div>
        
        {/* Error message */}
        <div 
          className={`overflow-hidden transition-all duration-200 ${
            errorMessage ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <p 
            id="email-error" 
            className="text-xs text-red-500 flex items-center gap-1" 
            role="alert"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {errorMessage}
          </p>
        </div>

        {/* Success message */}
        <div 
          className={`overflow-hidden transition-all duration-200 ${
            status === 'success' ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <p className="text-xs text-green-600 flex items-center gap-1" role="status">
            <Check size={12} />
            Inscrição realizada com sucesso!
          </p>
        </div>
      </form>
    </div>
  );
}