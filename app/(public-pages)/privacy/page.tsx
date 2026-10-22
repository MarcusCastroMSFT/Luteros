import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { LegalCallout, LegalDocument, LegalLink, LegalList, LegalSection, LegalSub } from '@/components/legal/legal-document'
import { LEGAL_LAST_UPDATED, LUTTEROS_ENTITY as entity } from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Saiba como a lutteros coleta, usa, armazena, compartilha e protege seus dados pessoais, quais são os seus direitos como titular e como exercê-los, conforme a LGPD.',
  alternates: { canonical: `${entity.siteUrl}/privacy` },
}

const sections = [
  { id: 'introducao', title: '1. Introdução' },
  { id: 'controlador', title: '2. Controlador e Encarregado (DPO)' },
  { id: 'dados-coletados', title: '3. Dados que Coletamos' },
  { id: 'dados-sensiveis', title: '4. Dados Sensíveis e Saúde' },
  { id: 'finalidades', title: '5. Finalidades do Tratamento' },
  { id: 'base-legal', title: '6. Bases Legais' },
  { id: 'pagamentos', title: '7. Pagamentos' },
  { id: 'compartilhamento', title: '8. Compartilhamento de Dados' },
  { id: 'comunidade', title: '9. Comunidade e Conteúdo Publicado' },
  { id: 'retencao', title: '10. Retenção de Dados' },
  { id: 'seguranca', title: '11. Segurança da Informação' },
  { id: 'cookies', title: '12. Cookies e Tecnologias' },
  { id: 'direitos', title: '13. Seus Direitos (LGPD)' },
  { id: 'transferencia', title: '14. Transferência Internacional' },
  { id: 'menores', title: '15. Crianças e Adolescentes' },
  { id: 'alteracoes', title: '16. Alterações desta Política' },
  { id: 'contato', title: '17. Contato' },
]

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: entity.siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Política de Privacidade', item: `${entity.siteUrl}/privacy` },
          ],
        }}
      />

      <LegalDocument
        eyebrow="Privacidade e proteção de dados"
        eyebrowIcon={ShieldCheck}
        title="Política de Privacidade"
        intro="Como a lutteros coleta, utiliza, armazena e protege dados pessoais, com atenção especial à natureza íntima da saúde sexual, em conformidade com a LGPD."
        lastUpdated={LEGAL_LAST_UPDATED}
        sections={sections}
      >
        <LegalSection id="introducao" title="1. Introdução">
          <p>
            A <strong>lutteros</strong> (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Empresa&quot;) é uma plataforma de educação em saúde
            sexual e bem-estar, com cursos, artigos, eventos, comunidade e indicação de especialistas. Sabemos que
            informações ligadas à sexualidade são íntimas e merecem o mais alto nível de cuidado.
          </p>
          <p>
            Esta Política de Privacidade (&quot;Política&quot;) explica como tratamos os dados pessoais de quem visita ou utiliza o
            site <LegalLink href={entity.siteUrl}>lutteros.com.br</LegalLink> e seus serviços (em conjunto, a
            &quot;Plataforma&quot;), em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
          </p>
          <LegalCallout title="Nosso compromisso">
            <p>
              Não vendemos dados pessoais e não os compartilhamos com anunciantes, corretoras de dados ou seguradoras.
              Tratamos apenas o necessário para prestar os serviços que você escolheu usar.
            </p>
          </LegalCallout>
        </LegalSection>

        <LegalSection id="controlador" title="2. Controlador e Encarregado (DPO)">
          <p>
            O controlador dos seus dados pessoais é a <strong>{entity.legalName}</strong>, inscrita no CNPJ sob o nº{' '}
            {entity.cnpj}.
          </p>
          <p>
            Para questões sobre o tratamento de dados pessoais, fale com nosso Encarregado pelo e-mail{' '}
            <LegalLink href={`mailto:${entity.privacyEmail}`}>{entity.privacyEmail}</LegalLink>.
          </p>
        </LegalSection>

        <LegalSection id="dados-coletados" title="3. Dados que Coletamos">
          <LegalSub>3.1 Dados fornecidos por você</LegalSub>
          <LegalList>
            <li>Cadastro: nome, e-mail e senha (armazenada apenas de forma criptografada, nunca em texto aberto);</li>
            <li>
              Perfil (opcional): nome de exibição, foto, biografia, telefone, data de nascimento, cargo, empresa e links de
              redes sociais;
            </li>
            <li>Compras: CPF ou CNPJ, necessário para emitir a cobrança, e dados de contato;</li>
            <li>Inscrições em eventos, newsletter e preferências de comunicação;</li>
            <li>Publicações na comunidade, comentários, avaliações e mensagens que você enviar;</li>
            <li>Contatos com o suporte.</li>
          </LegalList>

          <LegalSub>3.2 Dados obtidos de terceiros</LegalSub>
          <LegalList>
            <li>
              Login com Google (opcional): nome, e-mail e foto de perfil informados pelo Google, conforme as permissões que você
              autorizar;
            </li>
            <li>Confirmação de pagamento: status da cobrança informado pelo provedor de pagamentos.</li>
          </LegalList>

          <LegalSub>3.3 Dados coletados automaticamente</LegalSub>
          <LegalList>
            <li>Dados de navegação: páginas acessadas, data e hora, endereço IP, tipo de dispositivo, navegador e sistema operacional;</li>
            <li>Progresso nos cursos: aulas concluídas e percentual de conclusão;</li>
            <li>
              Registros de acesso a conteúdos pagos: endereço IP e navegador usados para assistir às aulas, para proteger o
              conteúdo contra compartilhamento indevido de contas;
            </li>
            <li>Cookies essenciais de sessão (veja a seção 12).</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="dados-sensiveis" title="4. Dados Sensíveis e Saúde">
          <p>
            A Plataforma tem caráter <strong>educativo</strong>. Não solicitamos diagnósticos, exames, receitas ou histórico
            clínico para você usar nossos cursos, artigos e eventos.
          </p>
          <p>
            Ainda assim, informações sobre vida sexual e saúde são <strong>dados pessoais sensíveis</strong> (art. 5º, II, da
            LGPD). Elas podem aparecer, por exemplo, em perguntas a especialistas ou em publicações na comunidade que você
            decidir fazer, ou ser inferidas pelo seu interesse em determinados temas.
          </p>
          <LegalList>
            <li>Tratamos esses dados somente com seu consentimento específico e destacado, ou nas demais hipóteses do art. 11 da LGPD;</li>
            <li>Não os usamos para publicidade, perfilamento comercial ou decisões automatizadas que afetem você;</li>
            <li>
              Recomendamos <strong>não</strong> expor informações de saúde que identifiquem você em áreas públicas da Plataforma.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="finalidades" title="5. Finalidades do Tratamento">
          <LegalList>
            <li>Criar e manter sua conta e autenticar seu acesso;</li>
            <li>Disponibilizar cursos, artigos, eventos e demais conteúdos, e registrar seu progresso;</li>
            <li>Processar compras, emitir cobranças e liberar o acesso após a confirmação do pagamento;</li>
            <li>Enviar e-mails de serviço (confirmações, recuperação de senha, avisos importantes);</li>
            <li>Enviar newsletter e novidades, quando você optar por receber;</li>
            <li>Moderar a comunidade e manter um ambiente respeitoso e seguro;</li>
            <li>Prevenir fraudes, uso indevido e compartilhamento de contas;</li>
            <li>Medir o desempenho do site e melhorar a Plataforma, de forma agregada;</li>
            <li>Cumprir obrigações legais e regulatórias e exercer direitos em processos.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="base-legal" title="6. Bases Legais">
          <LegalList>
            <li>
              <strong>Execução de contrato</strong> (art. 7º, V): conta, acesso a cursos, compras e suporte;
            </li>
            <li>
              <strong>Consentimento</strong> (arts. 7º, I, e 11, I): newsletter, comunicações de marketing e tratamento de dados
              sensíveis que você nos fornecer. Você pode revogá-lo a qualquer momento;
            </li>
            <li>
              <strong>Obrigação legal ou regulatória</strong> (art. 7º, II): guarda de registros fiscais e de acesso;
            </li>
            <li>
              <strong>Legítimo interesse</strong> (art. 7º, IX): segurança, prevenção a fraudes, proteção de conteúdo pago e
              melhoria da Plataforma, sempre respeitando seus direitos e expectativas;
            </li>
            <li>
              <strong>Exercício regular de direitos</strong> (art. 7º, VI): defesa em processos judiciais, administrativos ou
              arbitrais.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="pagamentos" title="7. Pagamentos">
          <p>
            Os pagamentos de cursos são processados pelo <strong>Asaas</strong>, instituição de pagamento. Você paga em uma
            página segura do Asaas, por Pix, boleto ou cartão de crédito.
          </p>
          <LegalList>
            <li>
              <strong>A lutteros não recebe nem armazena</strong> número de cartão, código de segurança ou dados bancários;
            </li>
            <li>
              Guardamos apenas o necessário para a gestão da compra: CPF ou CNPJ, valor, identificador e status da cobrança e
              data de confirmação;
            </li>
            <li>O Asaas trata seus dados como controlador independente, conforme a própria política de privacidade.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="compartilhamento" title="8. Compartilhamento de Dados">
          <p>Compartilhamos dados apenas com quem precisa deles para operar a Plataforma, sob contrato e com dever de confidencialidade:</p>
          <LegalList>
            <li>
              <strong>Hospedagem e infraestrutura:</strong> Vercel (aplicação e métricas de desempenho), Neon (banco de dados) e
              Microsoft Azure (armazenamento de vídeos e imagens);
            </li>
            <li>
              <strong>Pagamentos:</strong> Asaas;
            </li>
            <li>
              <strong>E-mails:</strong> Resend (e-mails de serviço e newsletter);
            </li>
            <li>
              <strong>Login social:</strong> Google, apenas se você optar por entrar com a conta Google;
            </li>
            <li>
              <strong>Autoridades:</strong> quando houver determinação legal ou judicial, ou para proteger direitos nossos e de
              terceiros.
            </li>
          </LegalList>
          <LegalCallout>
            <p>
              Nunca vendemos seus dados e não compartilhamos informações sobre sua saúde ou vida sexual com empresas de
              marketing, publicidade ou seguros.
            </p>
          </LegalCallout>
        </LegalSection>

        <LegalSection id="comunidade" title="9. Comunidade e Conteúdo Publicado">
          <p>
            Publicações, comentários e avaliações feitos em áreas públicas da Plataforma podem ser vistos por outros usuários e
            pelo público. Pense antes de compartilhar informações pessoais.
          </p>
          <LegalList>
            <li>Você pode escolher publicar de forma anônima para os demais usuários, quando essa opção estiver disponível;</li>
            <li>
              Nossa equipe de moderação pode identificar o autor de uma publicação quando necessário para segurança, para
              cumprir a lei ou para aplicar os Termos de Uso;
            </li>
            <li>Você pode pedir a remoção de conteúdo seu pelo e-mail indicado na seção 17.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="retencao" title="10. Retenção de Dados">
          <p>Mantemos os dados apenas pelo tempo necessário para as finalidades descritas, observados os prazos legais:</p>
          <LegalList>
            <li>
              <strong>Dados de conta e perfil:</strong> enquanto a conta estiver ativa. Ao excluir a conta, eliminamos ou
              anonimizamos os dados, salvo os que a lei nos obrigue a manter;
            </li>
            <li>
              <strong>Registros de compras e fiscais:</strong> por até 5 anos, conforme a legislação tributária e consumerista;
            </li>
            <li>
              <strong>Registros de acesso à aplicação (logs):</strong> pelo prazo mínimo de 6 meses exigido pelo Marco Civil da Internet;
            </li>
            <li>
              <strong>Newsletter:</strong> até você cancelar a inscrição.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="seguranca" title="11. Segurança da Informação">
          <p>Adotamos medidas técnicas e organizacionais compatíveis com a sensibilidade dos dados, incluindo:</p>
          <LegalList>
            <li>Conexão criptografada (HTTPS) em toda a Plataforma;</li>
            <li>Senhas armazenadas com algoritmo de hash, nunca em texto aberto;</li>
            <li>Vídeos de cursos pagos entregues por links assinados e de curta duração, disponíveis só para quem tem acesso;</li>
            <li>Controle de acesso e limite de redes por conta para dificultar o compartilhamento de credenciais;</li>
            <li>Acesso interno restrito a pessoas autorizadas e que precisam do dado para trabalhar.</li>
          </LegalList>
          <p>
            Nenhum sistema é totalmente invulnerável. Em caso de incidente que possa gerar risco ou dano relevante, comunicaremos
            você e a Autoridade Nacional de Proteção de Dados (ANPD) nos termos da lei.
          </p>
        </LegalSection>

        <LegalSection id="cookies" title="12. Cookies e Tecnologias">
          <p>Usamos poucas tecnologias de armazenamento no seu navegador:</p>
          <LegalList>
            <li>
              <strong>Essenciais:</strong> mantêm você conectado e protegem a sessão. Sem eles, o login não funciona;
            </li>
            <li>
              <strong>Preferências:</strong> lembram escolhas simples de uso;
            </li>
            <li>
              <strong>Métricas de uso e desempenho:</strong> Vercel Analytics e Speed Insights, que geram estatísticas agregadas
              do site. Não usamos cookies de publicidade nem rastreamento entre sites.
            </li>
          </LegalList>
          <p>Você pode bloquear ou apagar cookies nas configurações do navegador, mas partes da Plataforma podem deixar de funcionar.</p>
        </LegalSection>

        <LegalSection id="direitos" title="13. Seus Direitos (LGPD)">
          <p>Nos termos do art. 18 da LGPD, você pode, a qualquer momento, solicitar:</p>
          <LegalList>
            <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
            <li>Portabilidade dos dados a outro fornecedor;</li>
            <li>Eliminação dos dados tratados com base no seu consentimento;</li>
            <li>Informação sobre com quem compartilhamos seus dados;</li>
            <li>Informação sobre a possibilidade de não consentir e suas consequências;</li>
            <li>Revogação do consentimento;</li>
            <li>Revisão de decisões tomadas apenas com base em tratamento automatizado.</li>
          </LegalList>
          <p>
            Você também pode editar muitos dos seus dados diretamente no seu perfil. Para os demais pedidos, escreva para{' '}
            <LegalLink href={`mailto:${entity.privacyEmail}`}>{entity.privacyEmail}</LegalLink>. Responderemos em até 15 dias e
            poderemos pedir informações para confirmar sua identidade. Você também pode reclamar à ANPD (gov.br/anpd).
          </p>
        </LegalSection>

        <LegalSection id="transferencia" title="14. Transferência Internacional">
          <p>
            Alguns dos nossos fornecedores, como hospedagem, e-mail e login social, podem tratar dados em servidores fora do
            Brasil. Nesses casos, a transferência ocorre com as salvaguardas do art. 33 da LGPD, como cláusulas contratuais
            adequadas e fornecedores que adotam padrões reconhecidos de proteção de dados.
          </p>
        </LegalSection>

        <LegalSection id="menores" title="15. Crianças e Adolescentes">
          <p>
            A Plataforma não se destina a menores de 13 anos, que não podem criar conta. Adolescentes de 13 a 17 anos só podem
            usar os conteúdos educativos com o consentimento e a supervisão de pai, mãe ou responsável legal. Compras e
            contratações são restritas a maiores de 18 anos.
          </p>
          <p>
            Se soubermos que coletamos dados de uma criança sem o devido consentimento, eliminaremos essas informações. Se você
            for responsável e identificar essa situação, avise-nos pelo e-mail da seção 17.
          </p>
        </LegalSection>

        <LegalSection id="alteracoes" title="16. Alterações desta Política">
          <p>
            Podemos atualizar esta Política para refletir mudanças legais ou na Plataforma. A data da última atualização está no
            topo da página. Em mudanças relevantes, avisaremos por e-mail ou por aviso na Plataforma com antecedência razoável.
          </p>
        </LegalSection>

        <LegalSection id="contato" title="17. Contato">
          <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade:</p>
          <LegalList>
            <li>
              <strong>Encarregado (DPO):</strong>{' '}
              <LegalLink href={`mailto:${entity.privacyEmail}`}>{entity.privacyEmail}</LegalLink>
            </li>
            <li>
              <strong>Empresa:</strong> {entity.legalName} — CNPJ {entity.cnpj}
            </li>
          </LegalList>
        </LegalSection>
      </LegalDocument>
    </>
  )
}
