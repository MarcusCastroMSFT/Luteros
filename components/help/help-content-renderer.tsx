import React from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, BookOpen, Users } from 'lucide-react';

interface HelpContentRendererProps {
  slug: string;
}

export function HelpContentRenderer({ slug }: HelpContentRendererProps) {
  const renderContent = () => {
    switch (slug) {
      case 'create-account':
        return (
          <div className="max-w-none text-gray-900">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
              <div className="flex items-start">
                <AlertCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h4 className="text-blue-800 font-medium mb-2">Antes de começar</h4>
                  <p className="text-blue-700 text-sm mb-0">
                    Certifique-se de ter um email válido e uma conexão estável com a internet. O processo leva apenas alguns minutos.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acesse a página de registro</h2>
            <p className="text-gray-700 mb-4">
              Clique no botão <strong className="font-semibold text-gray-900">&ldquo;Registrar&rdquo;</strong> no canto superior direito da página inicial ou acesse diretamente 
              o link <Link href="/register" className="text-cta-highlight hover:text-cta-highlight/80 cursor-pointer">lutteros.com/register</Link>.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Preencha seus dados básicos</h2>
            <p className="text-gray-700 mb-4">Você precisará fornecer as seguintes informações:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li><strong className="font-semibold text-gray-900">Nome completo:</strong> Use seu nome real para consultas com especialistas</li>
              <li><strong className="font-semibold text-gray-900">Email:</strong> Será usado para login e comunicações importantes</li>
              <li><strong className="font-semibold text-gray-900">Senha segura:</strong> Mínimo 8 caracteres, incluindo letras e números</li>
              <li><strong className="font-semibold text-gray-900">Data de nascimento:</strong> Para verificar se você tem mais de 18 anos</li>
            </ul>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg my-6">
              <div className="flex items-start">
                <CheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h4 className="text-green-800 font-medium mb-2">Dica de segurança</h4>
                  <p className="text-green-700 text-sm mb-0">
                    Use uma senha única que você não utiliza em outros sites. Considere usar um gerenciador de senhas.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Aceite os termos e políticas</h2>
            <p className="text-gray-700 mb-4">
              Leia e aceite nossos <Link href="/terms" className="text-cta-highlight hover:text-cta-highlight/80 cursor-pointer">Termos de Uso</Link> e 
              nossa <Link href="/privacy" className="text-cta-highlight hover:text-cta-highlight/80 cursor-pointer">Política de Privacidade</Link>. 
              É importante entender como protegemos seus dados e quais são seus direitos.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Confirme seu email</h2>
            <p className="text-gray-700 mb-4">
              Após o registro, você receberá um email de confirmação. Clique no link para ativar sua conta. 
              Se não receber o email em alguns minutos, verifique sua pasta de spam.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Complete seu perfil</h2>
            <p className="text-gray-700 mb-4">
              Uma vez confirmado o email, você pode personalizar seu perfil adicionando:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li>Foto de perfil (opcional)</li>
              <li>Breve descrição sobre você</li>
              <li>Áreas de interesse em saúde sexual</li>
              <li>Configurações de privacidade</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Próximos passos</h2>
            <p className="text-gray-700 mb-4">
              Com sua conta criada, você já pode explorar a plataforma! Recomendamos começar com nosso 
              <Link href="/help/first-steps" className="text-cta-highlight hover:text-cta-highlight/80 cursor-pointer"> guia de primeiros passos</Link>.
            </p>

            <div className="bg-brand-50 border border-brand-200 rounded-lg p-6 mt-8">
              <h4 className="text-brand-800 font-medium mb-3">Problemas com o registro?</h4>
              <p className="text-brand-700 text-sm mb-4">
                Se você encontrar dificuldades durante o processo de registro, nossa equipe está pronta para ajudar.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/contact" className="bg-cta-highlight hover:bg-cta-highlight/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer shadow-sm">
                  Contatar Suporte
                </Link>
                <Link href="/faq" className="border border-cta-highlight text-cta-highlight hover:bg-cta-highlight/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  Ver FAQ
                </Link>
              </div>
            </div>
          </div>
        );

      case 'first-steps':
        return (
          <div className="max-w-none text-gray-900">
            <p className="text-xl text-gray-600 mb-8">
              Bem-vindo à lutteros! Este guia vai ajudar você a descobrir todos os recursos da plataforma 
              e começar sua jornada de aprendizado em saúde sexual.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Explorando o Dashboard</h2>
            <p className="text-gray-700 mb-4">
              Após fazer login, você será direcionado ao seu dashboard pessoal, onde encontrará:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li><strong className="font-semibold text-gray-900">Resumo da atividade:</strong> Seus cursos em andamento e consultas agendadas</li>
              <li><strong className="font-semibold text-gray-900">Recomendações:</strong> Conteúdo personalizado baseado nos seus interesses</li>
              <li><strong className="font-semibold text-gray-900">Notificações:</strong> Atualizações importantes e lembretes</li>
              <li><strong className="font-semibold text-gray-900">Progresso:</strong> Acompanhe seu desenvolvimento nos cursos</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Navegando pelo menu principal</h2>
            <p className="text-gray-700 mb-4">O menu principal da lutteros está organizado em seções específicas:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="text-cta-highlight mr-3" size={24} />
                  <h4 className="font-semibold text-gray-900">Cursos</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Conteúdo educativo estruturado sobre diversos temas de saúde sexual e reprodutiva.
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Users className="text-cta-highlight mr-3" size={24} />
                  <h4 className="font-semibold text-gray-900">Especialistas</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Agende consultas educacionais com profissionais credenciados da área.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Personalizando sua experiência</h2>
            <p className="text-gray-700 mb-4">
              Para aproveitar melhor a plataforma, recomendamos personalizar suas configurações:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li>
                <strong className="font-semibold text-gray-900">Áreas de interesse:</strong> Selecione os temas que mais interessam você para receber 
                conteúdo personalizado
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Notificações:</strong> Configure como e quando quer receber alertas e lembretes
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Privacidade:</strong> Defina quem pode ver seu perfil e atividades na comunidade
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Participando da comunidade</h2>
            <p className="text-gray-700 mb-4">
              A comunidade lutteros é um espaço seguro para trocar experiências e tirar dúvidas. 
              Antes de participar, leia nossas 
              <Link href="/help/community-guidelines" className="text-cta-highlight hover:text-cta-highlight/80 cursor-pointer"> diretrizes da comunidade</Link>.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg my-6">
              <h4 className="text-blue-800 font-medium mb-2">Dica importante</h4>
              <p className="text-blue-700 text-sm mb-0">
                Você pode participar da comunidade de forma anônima ou com seu nome real. 
                A escolha é sempre sua e pode ser alterada a qualquer momento.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Recursos mobile</h2>
            <p className="text-gray-700 mb-4">
              A lutteros funciona perfeitamente no seu celular através do navegador. 
              Em breve, também teremos um aplicativo dedicado para iOS e Android.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Precisa de ajuda?</h2>
            <p className="text-gray-700 mb-4">
              Se tiver dúvidas durante sua navegação, você pode:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li>Usar o chat de suporte disponível 24/7</li>
              <li>Consultar nossa <Link href="/faq" className="text-cta-highlight hover:text-cta-highlight/80 cursor-pointer">seção de FAQ</Link></li>
              <li>Entrar em contato por email: suporte@lutteros.com</li>
            </ul>
          </div>
        );

      case 'book-consultation':
        return (
          <div className="max-w-none text-gray-900">
            <p className="text-xl text-gray-600 mb-8">
              As consultas na lutteros são sessões educacionais que ajudam você a esclarecer dúvidas e 
              obter orientações personalizadas sobre saúde sexual e reprodutiva.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-8">
              <h4 className="text-amber-800 font-medium mb-2">Importante saber</h4>
              <p className="text-amber-700 text-sm mb-0">
                Nossas consultas são de natureza educacional e informativa. Para diagnósticos médicos 
                específicos, sempre recomendamos consulta presencial com profissional habilitado.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Escolhendo o especialista</h2>
            <p className="text-gray-700 mb-4">
              Acesse a seção <strong className="font-semibold text-gray-900">&ldquo;Especialistas&rdquo;</strong> no menu principal. Lá você encontrará:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li><strong className="font-semibold text-gray-900">Perfis detalhados:</strong> Formação, especialidades e experiência</li>
              <li><strong className="font-semibold text-gray-900">Avaliações:</strong> Feedback de outros usuários</li>
              <li><strong className="font-semibold text-gray-900">Disponibilidade:</strong> Horários livres em tempo real</li>
              <li><strong className="font-semibold text-gray-900">Valores:</strong> Preços para diferentes tipos de consulta</li>
            </ul>

            <div className="bg-brand-50 border border-brand-200 rounded-lg p-6 mt-8">
              <h4 className="text-brand-800 font-medium mb-3">Precisa de ajuda com o agendamento?</h4>
              <p className="text-brand-700 text-sm mb-4">
                Nossa equipe pode ajudar você a encontrar o especialista ideal e agendar sua consulta.
              </p>
              <Link href="/contact" className="bg-cta-highlight hover:bg-cta-highlight/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer shadow-sm">
                Falar com Suporte
              </Link>
            </div>
          </div>
        );

      // Add more cases for other articles as needed
      default:
        return (
          <div className="max-w-none text-gray-900">
            <p className="text-xl text-gray-600 mb-8">
              Conteúdo em desenvolvimento. Estamos trabalhando para trazer mais informações detalhadas sobre este tópico.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
              <h4 className="text-blue-800 font-medium mb-2">Em breve</h4>
              <p className="text-blue-700 text-sm mb-0">
                Conteúdo detalhado estará disponível em breve. Entre em contato se precisar de ajuda imediata.
              </p>
            </div>

            <p className="text-gray-700 mb-4">
              Enquanto isso, você pode explorar nossos outros recursos de ajuda ou entrar em contato 
              com nossa equipe de suporte.
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              <Link href="/help" className="bg-cta-highlight hover:bg-cta-highlight/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer shadow-sm">
                Voltar ao Centro de Ajuda
              </Link>
              <Link href="/contact" className="border border-cta-highlight text-cta-highlight hover:bg-cta-highlight/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                Contatar Suporte
              </Link>
            </div>
          </div>
        );
    }
  };

  return renderContent();
}
