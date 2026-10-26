import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { LegalCallout, LegalDocument, LegalLink, LegalList, LegalSection, LegalSub } from '@/components/legal/legal-document'
import { LEGAL_LAST_UPDATED, LUTTEROS_ENTITY as entity } from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a Lutteros coleta, usa, armazena, compartilha e protege dados pessoais, quais são os direitos do titular e como exercê-los, conforme a LGPD.',
  alternates: { canonical: `${entity.siteUrl}/privacy` },
}

const sections = [
  { id: 'introducao', title: '1. Introdução' },
  { id: 'controlador', title: '2. Controlador e Encarregado (DPO)' },
  { id: 'dados-coletados', title: '3. Dados Coletados' },
  { id: 'dados-sensiveis', title: '4. Dados Sensíveis e Saúde' },
  { id: 'base-legal', title: '5. Bases Legais' },
  { id: 'pagamentos', title: '6. Pagamentos' },
  { id: 'compartilhamento', title: '7. Compartilhamento de Dados' },
  { id: 'retencao', title: '8. Retenção de Dados' },
  { id: 'seguranca', title: '9. Segurança da Informação' },
  { id: 'cookies', title: '10. Cookies e Tecnologias' },
  { id: 'direitos', title: '11. Direitos do Titular (LGPD)' },
  { id: 'transferencia', title: '12. Transferência Internacional' },
  { id: 'menores', title: '13. Menores de 18 Anos' },
  { id: 'casos-ficticios', title: '14. Casos Clínicos Fictícios' },
  { id: 'alteracoes', title: '15. Alterações desta Política' },
  { id: 'contato', title: '16. Contato' },
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
        intro="Como a Lutteros coleta, utiliza, armazena e protege dados pessoais, com atenção especial à natureza íntima da saúde sexual, em conformidade com a LGPD."
        lastUpdated={LEGAL_LAST_UPDATED}
        sections={sections}
      >
        <LegalSection id="introducao" title="1. Introdução">
          <p>
            A <strong>Lutteros</strong> (a &quot;Empresa&quot;) é uma plataforma de educação em saúde sexual e bem-estar, com cursos
            e artigos. A Lutteros reconhece que informações ligadas à sexualidade são íntimas e merecem o mais alto nível de
            cuidado.
          </p>
          <p>
            Esta Política de Privacidade (a &quot;Política&quot;) explica como a Lutteros trata os dados pessoais de quem visita ou
            utiliza o site <LegalLink href={entity.siteUrl}>lutteros.com.br</LegalLink> e seus serviços (em conjunto, a
            &quot;Plataforma&quot;), em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD). A
            pessoa que visita ou utiliza a Plataforma é referida como o &quot;Usuário&quot;.
          </p>
          <LegalCallout title="Compromisso da Lutteros">
            <p>
              A Lutteros não vende dados pessoais e não os compartilha com anunciantes, corretoras de dados ou seguradoras. Trata
              apenas o necessário para prestar os serviços que o Usuário escolheu utilizar.
            </p>
          </LegalCallout>
        </LegalSection>

        <LegalSection id="controlador" title="2. Controlador e Encarregado (DPO)">
          <p>
            O controlador dos dados pessoais é a <strong>{entity.legalName}</strong>, inscrita no CNPJ sob o nº {entity.cnpj}.
          </p>
          <p>
            Para questões sobre o tratamento de dados pessoais, o Encarregado pelo tratamento de dados (DPO) da Lutteros atende
            pelo e-mail <LegalLink href={`mailto:${entity.contactEmail}`}>{entity.contactEmail}</LegalLink>.
          </p>
        </LegalSection>

        <LegalSection id="dados-coletados" title="3. Dados Coletados">
          <LegalSub>3.1 Dados fornecidos pelo Usuário</LegalSub>
          <LegalList>
            <li>Cadastro: nome, e-mail e senha (armazenada apenas de forma criptografada, nunca em texto aberto);</li>
            <li>
              Perfil (opcional): nome de exibição, foto, biografia, telefone, data de nascimento, cargo, empresa e links de
              redes sociais;
            </li>
            <li>Compras: CPF ou CNPJ, necessário para emitir a cobrança, e dados de contato;</li>
            <li>Inscrição na newsletter e preferências de comunicação;</li>
            <li>
              Lista de espera da assinatura: e-mail, o perfil escolhido (por exemplo, profissional de saúde) e o endereço IP do
              envio, usado para evitar abusos;
            </li>
            <li>Mensagens enviadas pelo formulário de contato e demais contatos com a Lutteros.</li>
          </LegalList>

          <LegalSub>3.2 Dados obtidos de terceiros</LegalSub>
          <LegalList>
            <li>
              Login com Google (opcional): nome, e-mail e foto de perfil informados pelo Google, conforme as permissões que o
              Usuário autorizar;
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
            <li>Cookies essenciais de sessão (veja a seção 10).</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="dados-sensiveis" title="4. Dados Sensíveis e Saúde">
          <p>
            A Plataforma tem caráter <strong>educativo</strong>. A Lutteros não solicita diagnósticos, exames, receitas ou
            histórico clínico para o uso de seus cursos e artigos.
          </p>
          <p>
            Ainda assim, informações sobre vida sexual e saúde são <strong>dados pessoais sensíveis</strong> (art. 5º, II, da
            LGPD). Elas podem ser fornecidas pelo próprio Usuário, por exemplo em mensagens enviadas pelo formulário de contato,
            ou ser inferidas a partir do interesse em determinados temas.
          </p>
          <LegalList>
            <li>
              A Lutteros trata esses dados somente com o consentimento específico e destacado do Usuário, ou nas demais hipóteses
              do art. 11 da LGPD;
            </li>
            <li>
              Não os utiliza para publicidade, perfilamento comercial ou decisões automatizadas que afetem o Usuário;
            </li>
            <li>
              Recomenda-se que o Usuário <strong>não</strong> informe dados de saúde que o identifiquem além do estritamente
              necessário em suas mensagens.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="base-legal" title="5. Bases Legais">
          <LegalList>
            <li>
              <strong>Execução de contrato</strong> (art. 7º, V): conta, acesso a cursos, compras e suporte;
            </li>
            <li>
              <strong>Consentimento</strong> (arts. 7º, I, e 11, I): newsletter, lista de espera da assinatura, comunicações de
              marketing e tratamento de dados sensíveis fornecidos pelo Usuário. O consentimento pode ser revogado a qualquer
              momento;
            </li>
            <li>
              <strong>Obrigação legal ou regulatória</strong> (art. 7º, II): guarda de registros fiscais e de acesso;
            </li>
            <li>
              <strong>Legítimo interesse</strong> (art. 7º, IX): segurança, prevenção a fraudes, proteção de conteúdo pago e
              melhoria da Plataforma, sempre respeitados os direitos e as expectativas do Usuário;
            </li>
            <li>
              <strong>Exercício regular de direitos</strong> (art. 7º, VI): defesa em processos judiciais, administrativos ou
              arbitrais.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="pagamentos" title="6. Pagamentos">
          <p>
            Os pagamentos de cursos são processados pelo <strong>Asaas</strong>, instituição de pagamento. O Usuário paga em uma
            página segura do Asaas, por Pix, boleto ou cartão de crédito.
          </p>
          <LegalList>
            <li>
              <strong>A Lutteros não recebe nem armazena</strong> número de cartão, código de segurança ou dados bancários;
            </li>
            <li>
              A Lutteros guarda apenas o necessário para a gestão da compra: CPF ou CNPJ, valor, identificador e status da
              cobrança e data de confirmação;
            </li>
            <li>O Asaas trata os dados como controlador independente, conforme a própria política de privacidade.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="compartilhamento" title="7. Compartilhamento de Dados">
          <p>
            A Lutteros compartilha dados apenas com quem precisa deles para operar a Plataforma, sob contrato e com dever de
            confidencialidade:
          </p>
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
              <strong>Login social:</strong> Google, apenas se o Usuário optar por entrar com a conta Google;
            </li>
            <li>
              <strong>Autoridades:</strong> quando houver determinação legal ou judicial, ou para proteger direitos da Lutteros
              e de terceiros.
            </li>
          </LegalList>
          <LegalCallout>
            <p>
              A Lutteros nunca vende dados pessoais e não compartilha informações sobre a saúde ou a vida sexual do Usuário com
              empresas de marketing, publicidade ou seguros.
            </p>
          </LegalCallout>
        </LegalSection>

        <LegalSection id="retencao" title="8. Retenção de Dados">
          <p>
            A Lutteros mantém os dados apenas pelo tempo necessário para as finalidades descritas nesta Política, observados os
            prazos legais:
          </p>
          <LegalList>
            <li>
              <strong>Dados de conta e perfil:</strong> enquanto a conta estiver ativa. Com a exclusão da conta, os dados são
              eliminados ou anonimizados, salvo os que a lei obrigue a manter;
            </li>
            <li>
              <strong>Registros de compras e fiscais:</strong> por até 5 anos, conforme a legislação tributária e consumerista;
            </li>
            <li>
              <strong>Registros de acesso à aplicação (logs):</strong> pelo prazo mínimo de 6 meses exigido pelo Marco Civil da Internet;
            </li>
            <li>
              <strong>Newsletter:</strong> até o cancelamento da inscrição pelo Usuário;
            </li>
            <li>
              <strong>Lista de espera da assinatura:</strong> até o aviso de abertura ser enviado ou até o Usuário pedir a
              remoção pelo e-mail da seção 16.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="seguranca" title="9. Segurança da Informação">
          <p>A Lutteros adota medidas técnicas e organizacionais compatíveis com a sensibilidade dos dados, incluindo:</p>
          <LegalList>
            <li>Conexão criptografada (HTTPS) em toda a Plataforma;</li>
            <li>Senhas armazenadas com algoritmo de hash, nunca em texto aberto;</li>
            <li>Vídeos de cursos pagos entregues por links assinados e de curta duração, disponíveis só para quem tem acesso;</li>
            <li>Controle de acesso e limite de redes por conta para dificultar o compartilhamento de credenciais;</li>
            <li>Acesso interno restrito a pessoas autorizadas e que precisam do dado para trabalhar.</li>
          </LegalList>
          <p>
            Nenhum sistema é totalmente invulnerável. Em caso de incidente que possa gerar risco ou dano relevante, a Lutteros
            comunicará o Usuário e a Autoridade Nacional de Proteção de Dados (ANPD) nos termos da lei.
          </p>
        </LegalSection>

        <LegalSection id="cookies" title="10. Cookies e Tecnologias">
          <p>A Lutteros utiliza poucas tecnologias de armazenamento no navegador do Usuário:</p>
          <LegalList>
            <li>
              <strong>Essenciais:</strong> mantêm o Usuário conectado e protegem a sessão. Sem eles, o login não funciona;
            </li>
            <li>
              <strong>Preferências:</strong> lembram escolhas simples de uso;
            </li>
            <li>
              <strong>Métricas de uso e desempenho:</strong> Vercel Analytics e Speed Insights, que geram estatísticas agregadas
              do site. A Lutteros não utiliza cookies de publicidade nem rastreamento entre sites.
            </li>
          </LegalList>
          <p>
            O Usuário pode bloquear ou apagar cookies nas configurações do navegador, mas partes da Plataforma podem deixar de
            funcionar.
          </p>
        </LegalSection>

        <LegalSection id="direitos" title="11. Direitos do Titular (LGPD)">
          <p>Nos termos do art. 18 da LGPD, o titular dos dados pode, a qualquer momento, solicitar à Lutteros:</p>
          <LegalList>
            <li>Confirmação de que a Lutteros trata seus dados e acesso a eles;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
            <li>Portabilidade dos dados a outro fornecedor;</li>
            <li>Eliminação dos dados tratados com base no consentimento;</li>
            <li>Informação sobre com quem a Lutteros compartilha os dados;</li>
            <li>Informação sobre a possibilidade de não consentir e suas consequências;</li>
            <li>Revogação do consentimento;</li>
            <li>Revisão de decisões tomadas apenas com base em tratamento automatizado.</li>
          </LegalList>
          <p>
            Muitos dados podem ser editados diretamente no perfil do Usuário. Para os demais pedidos, o titular deve escrever
            para <LegalLink href={`mailto:${entity.contactEmail}`}>{entity.contactEmail}</LegalLink>. A Lutteros responde em
            até 15 dias e pode solicitar informações para confirmar a identidade do titular. O titular também pode reclamar à
            ANPD (gov.br/anpd).
          </p>
        </LegalSection>

        <LegalSection id="transferencia" title="12. Transferência Internacional">
          <p>
            Alguns fornecedores da Lutteros, como hospedagem, e-mail e login social, podem tratar dados em servidores fora do
            Brasil. Nesses casos, a transferência ocorre com as salvaguardas do art. 33 da LGPD, como cláusulas contratuais
            adequadas e fornecedores que adotam padrões reconhecidos de proteção de dados.
          </p>
        </LegalSection>

        <LegalSection id="menores" title="13. Menores de 18 Anos">
          <p>
            A Plataforma não se destina a menores de 18 anos. Compras e contratações são restritas a maiores de 18 anos.
          </p>
          <p>
            Caso a Lutteros identifique que coletou dados de menor de 18 anos, eliminará essas informações. Quem for responsável
            por um menor e identificar essa situação pode avisar a Lutteros pelo e-mail da seção 16.
          </p>
        </LegalSection>

        <LegalSection id="casos-ficticios" title="14. Casos Clínicos Fictícios">
          <p>
            Os casos clínicos apresentados na Plataforma Lutteros são <strong>fictícios</strong> e foram elaborados com
            finalidade exclusivamente educativa, com base na literatura científica sobre os fatores associados às disfunções
            sexuais.
          </p>
          <p>
            Eventual semelhança com situações, experiências ou pessoas reais é mera coincidência e não indica que o caso se
            refira a paciente, usuário ou terceiro específico. Por se tratar de casos fictícios, eles não envolvem dados
            pessoais de pacientes reais.
          </p>
        </LegalSection>

        <LegalSection id="alteracoes" title="15. Alterações desta Política">
          <p>
            A Lutteros pode atualizar esta Política para refletir mudanças legais ou na Plataforma. A data da última atualização
            consta no topo da página. Em mudanças relevantes, a Lutteros avisa o Usuário por e-mail ou por aviso na Plataforma,
            com antecedência razoável.
          </p>
        </LegalSection>

        <LegalSection id="contato" title="16. Contato">
          <p>Para exercer direitos ou tirar dúvidas sobre privacidade:</p>
          <LegalList>
            <li>
              <strong>E-mail de contato (inclui o Encarregado — DPO):</strong>{' '}
              <LegalLink href={`mailto:${entity.contactEmail}`}>{entity.contactEmail}</LegalLink>
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
