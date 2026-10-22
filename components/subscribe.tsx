"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { quickValidateEmail } from "@/lib/email-quick-validation";
import { cn } from "@/lib/utils";

interface SubscribeProps {
  className?: string;
  title?: string;
  description?: string;
  source?: string;
  /** "dark" is meant for the footer band over the deep teal background. */
  variant?: "light" | "dark";
  hideHeading?: boolean;
}

type SubscribeStatus = "idle" | "loading" | "success" | "error";

export function Subscribe({
  className = "",
  title = "Newsletter",
  description = "Inscreva-se em nossa newsletter e receba conteúdos exclusivos diretamente no seu e-mail.",
  source = "footer",
  variant = "light",
  hideHeading = false,
}: SubscribeProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const dark = variant === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus("error");
      setErrorMessage("Informe seu e-mail para se inscrever.");
      inputRef.current?.focus();
      return;
    }

    const validationResult = quickValidateEmail(trimmedEmail);
    if (!validationResult.isValid) {
      setStatus("error");
      setErrorMessage(validationResult.error || "E-mail inválido");
      inputRef.current?.focus();
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar inscrição");
      }

      setStatus("success");
      setEmail("");
      toast.success(data.message || "Inscrição realizada com sucesso!");

    } catch (error) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "Erro ao processar inscrição";
      setErrorMessage(message);
      toast.error(message);

    }
  };

  const handleBlur = () => {
    if (email.trim()) {
      const validationResult = quickValidateEmail(email);
      if (!validationResult.isValid) {
        setStatus("error");
        setErrorMessage(validationResult.error || "E-mail inválido");
      }
    }
  };

  const busy = status === "loading" || status === "success";

  return (
    <div className={cn("space-y-3", className)}>
      {hideHeading ? null : (
        <>
          <h3 className={cn("text-lg font-semibold", dark ? "text-white" : "text-text-primary")}>{title}</h3>
          <p className={cn("text-sm", dark ? "text-white/70" : "text-text-secondary")}>{description}</p>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-2" noValidate>
        <div className="flex w-full gap-2">
          <div className="relative min-w-0 flex-1">
            <Mail
              size={16}
              className={cn("pointer-events-none absolute left-4 top-1/2 -translate-y-1/2", dark ? "text-white/50" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error" && errorMessage) {
                  setStatus("idle");
                  setErrorMessage("");
                }
              }}
              onBlur={handleBlur}
              disabled={busy}
              aria-label="Endereço de e-mail"
              aria-invalid={status === "error"}
              aria-describedby={errorMessage ? errorId : undefined}
              className={cn(
                "h-12 w-full rounded-xl border pl-11 pr-4 text-base outline-none transition-[border-color,box-shadow,background-color] duration-200 disabled:opacity-70",
                dark
                  ? "border-white/20 bg-white/10 text-white placeholder:text-white/45 hover:bg-white/15 focus-visible:border-[#7fd3d8] focus-visible:bg-white/15 focus-visible:ring-4 focus-visible:ring-[#7fd3d8]/20"
                  : "border-input bg-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                status === "error" && (dark ? "border-red-300 bg-red-400/10" : "border-red-400 bg-red-50/50"),
                status === "success" && (dark ? "border-emerald-300" : "border-green-500 bg-green-50/50")
              )}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className={cn(
              "group inline-flex h-12 min-w-12 flex-none cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default",
              dark
                ? "bg-[#198189] text-white hover:bg-[#126a71] focus-visible:outline-[#7fd3d8]"
                : "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring",
              status === "success" && "from-emerald-500 to-emerald-600 bg-emerald-600"
            )}
            aria-label={status === "loading" ? "Enviando..." : status === "success" ? "Inscrição realizada" : "Inscrever-se na newsletter"}
          >
            {status === "loading" ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
            {status === "success" ? <Check size={18} aria-hidden="true" /> : null}
            {status === "idle" || status === "error" ? (
              <>
                <span className={dark ? "sr-only" : "hidden sm:inline"}>Inscrever-se</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </>
            ) : null}
          </button>
        </div>

        {errorMessage ? (
          <p
            id={errorId}
            className={cn("text-sm leading-5", dark ? "text-red-200" : "text-red-500")}
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        {status === "success" ? (
          <p className={cn("flex items-center gap-1.5 text-xs", dark ? "text-emerald-200" : "text-green-600")} role="status">
            <Check size={12} aria-hidden="true" />
            Inscrição realizada com sucesso!
          </p>
        ) : null}
      </form>
    </div>
  );
}
