"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface SubscribeProps {
  className?: string;
  title?: string;
  description?: string;
}

export function Subscribe({ 
  className = "",
  title = "Newsletter",
  description = "Inscreva-se em nossa newsletter e receba conteúdos exclusivos diretamente no seu e-mail."
}: SubscribeProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">
        {description}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <Input
          type="email"
          placeholder="Digite seu e-mail ..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-10 px-4 text-base"
          required
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={isSubmitting || !email.trim()}
          className="px-3 cursor-pointer h-10"
        >
          <Send size={16} />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
