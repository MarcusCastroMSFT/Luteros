import { PageHeader } from '@/components/common/pageHeader';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Política de Privacidade"
        description="Sua privacidade é nossa prioridade máxima"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Política de Privacidade' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 space-y-8">
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            <p><strong>Última atualização:</strong> 21 de setembro de 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              1. Compromisso com sua Privacidade
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                A Luteros reconhece a natureza sensível e íntima das informações relacionadas à saúde sexual e reprodutiva. 
                Estamos comprometidos em proteger sua privacidade com os mais altos padrões de segurança e confidencialidade. 
                Esta política explica como coletamos, usamos, protegemos e compartilhamos suas informações pessoais.
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-l-4 border-orange-500 dark:border-orange-400 p-4 my-6 rounded-lg">
                <p className="text-orange-800 dark:text-orange-200 font-medium">
                  <strong>Compromisso Especial:</strong> Devido à natureza sensível do conteúdo de saúde sexual, 
                  implementamos medidas de segurança adicionais e nunca compartilhamos dados pessoais com terceiros 
                  para fins comerciais ou publicitários.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              2. Informações que Coletamos
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Informações Fornecidas Voluntariamente:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Nome e informações de contato (email, telefone)</li>
                <li>Dados de perfil (idade, localização geral)</li>
                <li>Perguntas e dúvidas enviadas para nossos especialistas</li>
                <li>Participação em fóruns e comunidades (sempre opcional e anônima se preferir)</li>
                <li>Informações de pagamento (processadas por terceiros seguros)</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Informações Coletadas Automaticamente:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Dados de navegação (páginas visitadas, tempo de permanência)</li>
                <li>Informações técnicas (IP, navegador, dispositivo)</li>
                <li>Cookies essenciais para funcionamento do site</li>
              </ul>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  <strong>Importante:</strong> Nunca solicitamos informações médicas específicas ou 
                  histórico clínico detalhado. Todas as interações são de caráter educativo e informativo.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              3. Como Usamos suas Informações
            </h2>
            <div className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Fornecer nossos serviços:</strong> Responder perguntas, agendar consultas, enviar conteúdo educativo</li>
                <li><strong>Melhorar a experiência:</strong> Personalizar conteúdo relevante e melhorar funcionalidades</li>
                <li><strong>Comunicação:</strong> Enviar atualizações importantes, newsletters (apenas se autorizado)</li>
                <li><strong>Segurança:</strong> Proteger contra uso indevido e garantir ambiente seguro</li>
                <li><strong>Compliance:</strong> Cumprir obrigações legais quando necessário</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              4. Compartilhamento de Informações
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Compartilhamos suas informações apenas nas seguintes situações limitadas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Provedores de Serviço:</strong> Parceiros técnicos essenciais (hosting, pagamentos) sob acordos rigorosos</li>
                <li><strong>Especialistas Credenciados:</strong> Apenas informações necessárias para consultas (com seu consentimento)</li>
                <li><strong>Autoridades Legais:</strong> Apenas quando legalmente obrigatório</li>
              </ul>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-lg">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  <strong>Garantia:</strong> Nunca compartilhamos informações relacionadas à saúde sexual 
                  com empresas de marketing, seguradoras ou outros terceiros comerciais.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              5. Segurança e Proteção de Dados
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Medidas de Segurança Implementadas:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Criptografia:</strong> Todos os dados são criptografados em trânsito e em repouso</li>
                <li><strong>Acesso Restrito:</strong> Apenas pessoal autorizado tem acesso a informações pessoais</li>
                <li><strong>Monitoramento:</strong> Sistemas de detecção de intrusão e monitoramento 24/7</li>
                <li><strong>Backup Seguro:</strong> Backups regulares em ambientes protegidos</li>
                <li><strong>Treinamento:</strong> Equipe treinada em melhores práticas de privacidade</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Medidas Especiais para Conteúdo Sensível:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Anonimização automática de dados sensíveis</li>
                <li>Períodos de retenção reduzidos para informações íntimas</li>
                <li>Protocolos especiais para discussões sobre saúde sexual</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              6. Seus Direitos (LGPD)
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Conforme a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Acesso:</strong> Saber quais dados pessoais possuímos sobre você</li>
                <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou inexatos</li>
                <li><strong>Exclusão:</strong> Pedir a eliminação de dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de dados</li>
                <li><strong>Limitação:</strong> Solicitar limitação do processamento</li>
                <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              7. Cookies e Tecnologias Similares
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Utilizamos cookies para melhorar sua experiência. Você pode controlar o uso de cookies 
                através das configurações do seu navegador.
              </p>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Tipos de Cookies:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Essenciais:</strong> Necessários para funcionamento básico</li>
                <li><strong>Funcionais:</strong> Melhoram a experiência do usuário</li>
                <li><strong>Analíticos:</strong> Nos ajudam a entender como o site é usado (dados anonimizados)</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              8. Retenção de Dados
            </h2>
            <div className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Dados de conta:</strong> Mantidos enquanto a conta estiver ativa</li>
                <li><strong>Histórico de consultas:</strong> 5 anos para fins de acompanhamento</li>
                <li><strong>Dados de navegação:</strong> 12 meses máximo</li>
                <li><strong>Informações sensíveis:</strong> Períodos reduzidos, conforme necessidade</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              9. Transferência Internacional
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Alguns de nossos provedores de serviço podem estar localizados fora do Brasil. 
                Garantimos que todas as transferências seguem padrões internacionais de proteção de dados.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              10. Menores de Idade
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Para usuários entre 13-17 anos, exigimos consentimento parental. Usuários menores de 13 anos 
                não podem usar nossos serviços. Implementamos verificações adicionais para proteger menores.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              11. Atualizações desta Política
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Esta política pode ser atualizada ocasionalmente. Mudanças significativas serão comunicadas 
                com pelo menos 30 dias de antecedência via email ou notificação na plataforma.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              12. Contato e DPO
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200"><strong>Data Protection Officer (DPO):</strong> dpo@luteros.com</p>
                <p className="text-gray-800 dark:text-gray-200"><strong>Email Geral:</strong> privacidade@luteros.com</p>
                <p className="text-gray-800 dark:text-gray-200"><strong>Telefone:</strong> (11) 9999-9999</p>
                <p className="text-gray-800 dark:text-gray-200"><strong>Endereço:</strong> [Endereço da empresa]</p>
                <p className="text-gray-800 dark:text-gray-200"><strong>Horário:</strong> Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
