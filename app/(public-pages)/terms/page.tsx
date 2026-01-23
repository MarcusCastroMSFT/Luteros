import { PageHeader } from '@/components/common/pageHeader';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Termos de Uso"
        description="Condições para uso da plataforma lutteros"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Termos de Uso' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 space-y-8">
          
          <div className="text-sm text-gray-600 mb-8">
            <p><strong>Última atualização:</strong> 21 de setembro de 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              1. Aceitação dos Termos
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar a plataforma lutteros, você concorda em cumprir e estar vinculado a estes 
                Termos de Uso. Se você não concorda com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
              <div className="bg-gradient-to-r from-brand-50 to-brand-100 border-l-4 border-brand-500 p-4 my-6 rounded-lg">
                <p className="text-brand-800 font-medium">
                  <strong>Importante:</strong> Nossa plataforma trata de temas sensíveis relacionados à saúde sexual. 
                  Ao usar nossos serviços, você confirma ter idade mínima de 18 anos ou consentimento parental 
                  se for menor de idade.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              2. Descrição dos Serviços
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">A lutteros oferece:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Conteúdo Educativo:</strong> Artigos, cursos e recursos sobre saúde sexual e reprodutiva</li>
                <li><strong>Consultas Online:</strong> Sessões com especialistas credenciados</li>
                <li><strong>Comunidade:</strong> Fóruns seguros para discussão (sempre respeitosos e moderados)</li>
                <li><strong>Recursos Especializados:</strong> Ferramentas e materiais desenvolvidos por profissionais</li>
              </ul>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  <strong>Natureza dos Serviços:</strong> Nossos serviços são exclusivamente educacionais e informativos. 
                  Não constituem diagnóstico médico, tratamento ou aconselhamento médico profissional.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              3. Elegibilidade e Registro
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Requisitos de Idade:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>18+ anos:</strong> Uso completo da plataforma</li>
                <li><strong>13-17 anos:</strong> Uso permitido com consentimento parental e supervisão</li>
                <li><strong>Menores de 13 anos:</strong> Uso não permitido</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800">Responsabilidades do Usuário:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a confidencialidade de sua conta</li>
                <li>Usar a plataforma de forma responsável e respeitosa</li>
                <li>Notificar sobre qualquer uso não autorizado de sua conta</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              4. Conduta do Usuário
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Comportamento Esperado:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Tratar todos os usuários com respeito e dignidade</li>
                <li>Manter discussões construtivas e educativas</li>
                <li>Respeitar a privacidade e confidencialidade de outros usuários</li>
                <li>Usar linguagem apropriada e respeitosa</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800">Comportamentos Proibidos:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Assédio, discriminação ou intimidação</li>
                <li>Compartilhamento de conteúdo pornográfico ou explícito não educativo</li>
                <li>Spam, propaganda não autorizada ou conteúdo comercial</li>
                <li>Divulgação de informações pessoais de terceiros</li>
                <li>Tentativas de hackear ou comprometer a segurança da plataforma</li>
                <li>Uso de múltiplas contas para contornar restrições</li>
              </ul>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-800 font-medium">
                  <strong>Tolerância Zero:</strong> Temos política de tolerância zero para assédio sexual, 
                  discriminação ou qualquer forma de abuso em nossa plataforma.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              5. Conteúdo e Propriedade Intelectual
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Nosso Conteúdo:</h3>
              <p className="text-gray-700 leading-relaxed">
                Todo o conteúdo da lutteros (textos, imagens, vídeos, cursos) é protegido por direitos autorais 
                e propriedade intelectual. É permitido o uso pessoal e educativo, mas não a reprodução comercial 
                sem autorização expressa.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800">Seu Conteúdo:</h3>
              <p className="text-gray-700 leading-relaxed">
                Ao compartilhar conteúdo em nossa plataforma (posts, comentários, perguntas), você:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Mantém a propriedade de seu conteúdo original</li>
                <li>Concede à lutteros licença para usar, exibir e distribuir o conteúdo na plataforma</li>
                <li>Garante que possui os direitos necessários sobre o conteúdo</li>
                <li>Aceita que podemos moderar ou remover conteúdo inadequado</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              6. Consultas e Serviços Profissionais
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Natureza das Consultas:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>São de natureza educacional e informativa</li>
                <li>Não substituem consulta médica presencial</li>
                <li>Não estabelecem relação médico-paciente formal</li>
                <li>Devem ser complementadas com acompanhamento médico adequado</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800">Responsabilidades:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Nossos Especialistas:</strong> Fornecer informações precisas e atualizadas dentro de sua expertise</li>
                <li><strong>Usuários:</strong> Buscar atendimento médico adequado para questões de saúde específicas</li>
              </ul>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  <strong>Emergências Médicas:</strong> Em caso de emergência médica, procure imediatamente 
                  atendimento médico presencial ou ligue para os serviços de emergência.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              7. Pagamentos e Reembolsos
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Serviços Pagos:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Consultas individuais com especialistas</li>
                <li>Cursos premium e conteúdo especializado</li>
                <li>Assinaturas para acesso completo à plataforma</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800">Política de Reembolso:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Consultas:</strong> Reembolso integral se canceladas com 24h de antecedência</li>
                <li><strong>Cursos:</strong> Reembolso em até 7 dias se menos de 20% do conteúdo foi acessado</li>
                <li><strong>Assinaturas:</strong> Cancelamento a qualquer momento, sem reembolso proporcional</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              8. Privacidade e Confidencialidade
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                A proteção de sua privacidade é fundamental para nós. Consulte nossa 
                <a href="/privacy" className="text-brand-600 hover:text-brand-700 underline">
                  Política de Privacidade
                </a> para detalhes completos sobre como protegemos suas informações pessoais.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800">Confidencialidade Especial:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Todas as consultas são confidenciais</li>
                <li>Dados de saúde recebem proteção adicional</li>
                <li>Participação em fóruns pode ser anônima</li>
                <li>Nunca compartilhamos informações pessoais para fins comerciais</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              9. Limitação de Responsabilidade
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed"><strong>A lutteros não se responsabiliza por:</strong></p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Decisões tomadas com base em informações da plataforma</li>
                <li>Resultados de tratamentos médicos</li>
                <li>Danos indiretos ou consequenciais</li>
                <li>Interrupções temporárias do serviço</li>
                <li>Conteúdo gerado por usuários</li>
              </ul>
              
              <p className="text-gray-700 leading-relaxed">
                Nossos serviços são fornecidos &ldquo;como estão&rdquo; e &ldquo;conforme disponíveis&rdquo;. 
                Recomendamos sempre buscar aconselhamento médico profissional para questões de saúde.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              10. Moderação e Suspensão
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Nosso Direito:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Moderar todo o conteúdo da plataforma</li>
                <li>Remover conteúdo inadequado</li>
                <li>Suspender ou banir contas que violem estes termos</li>
                <li>Alterar ou descontinuar serviços</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800">Processo de Recurso:</h3>
              <p className="text-gray-700 leading-relaxed">
                Usuários suspensos podem entrar em contato conosco para esclarecimentos e possível 
                reversão da decisão, desde que demonstrem mudança de comportamento.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              11. Alterações nos Termos
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar estes termos periodicamente. Alterações significativas serão comunicadas 
                com pelo menos 30 dias de antecedência através de email ou aviso na plataforma.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              12. Lei Aplicável e Jurisdição
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida no 
                foro da comarca de [Cidade], Brasil.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              13. Contato
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">Para questões sobre estes termos:</p>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="text-gray-800"><strong>Email:</strong> legal@lutteros.com</p>
                <p className="text-gray-800"><strong>Telefone:</strong> (11) 9999-9999</p>
                <p className="text-gray-800"><strong>Endereço:</strong> [Endereço da empresa]</p>
                <p className="text-gray-800"><strong>Horário de Atendimento:</strong> Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}