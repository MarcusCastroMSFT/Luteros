'use client';

import React, { useState } from 'react';
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
  Loader2
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

export function ContactPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReasonChange = (value: string) => {
    setFormData((prev) => ({ ...prev, reason: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.reason || !formData.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Mensagem enviada com sucesso!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      reason: '',
      subject: '',
      message: '',
    });
    setIsSubmitted(false);
  };

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
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Obrigado por entrar em contato. Nossa equipe responderá sua mensagem em até 24 horas úteis.
                  </p>
                  <Button onClick={resetForm} variant="outline">
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

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Motivo do Contato *</Label>
                        <Select value={formData.reason} onValueChange={handleReasonChange}>
                          <SelectTrigger>
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Resumo do seu contato"
                        value={formData.subject}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Descreva detalhadamente sua dúvida ou solicitação..."
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto"
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
              <Button variant="link" asChild className="mt-4 p-0 h-auto">
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
              <Button asChild variant="outline" className="w-full">
                <a href="/help">Acessar Central de Ajuda</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
