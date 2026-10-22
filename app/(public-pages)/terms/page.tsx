import type { Metadata } from 'next'
import { ScrollText } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { LegalCallout, LegalDocument, LegalLink, LegalList, LegalSection, LegalSub } from '@/components/legal/legal-document'
import { LEGAL_LAST_UPDATED, LUTTEROS_ENTITY as entity } from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Conheça as regras de uso da plataforma lutteros: cadastro, compra de cursos, acesso aos conteúdos, comunidade, reembolso e responsabilidades.',
  alternates: { canonical: `${entity.siteUrl}/terms` },
}

const sections = [
  { id: 'aceitacao', title: '1. Aceitação dos Termos' },
  { id: 'servicos', title: '2. Sobre a lutteros e os Serviços' },
  { id: 'natureza-educativa', title: '3. Natureza Educativa' },
  { id: 'conta', title: '4. Cadastro e Conta' },
  { id: 'compras', title: '5. Compra de Cursos e Pagamento' },
  { id: 'reembolso', title: '6. Arrependimento e Reembolso' },
  { id: 'uso-conteudo', title: '7. Acesso e Uso do Conteúdo' },
  { id: 'conduta', title: '8. Conduta e Comunidade' },
  { id: 'conteudo-usuario', title: '9. Conteúdo Publicado por Você' },
  { id: 'propriedade', title: '10. Propriedade Intelectual' },
  { id: 'eventos-parceiros', title: '11. Eventos, Produtos e Parceiros' },
  { id: 'privacidade', title: '12. Privacidade' },
  { id: 'responsabilidade', title: '13. Responsabilidade' },
  { id: 'suspensao', title: '14. Suspensão e Encerramento' },
  { id: 'alteracoes', title: '15. Alterações dos Termos' },
  { id: 'foro', title: '16. Lei Aplicável e Foro' },
  { id: 'contato', title: '17. Contato' },
]

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: entity.siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Termos de Uso', item: `${entity.siteUrl}/terms` },
          ],
        }}
      />

      <LegalDocument
        eyebrow="Regras da plataforma"
        eyebrowIcon={ScrollText}
        title="Termos de Uso"
        intro="As condições para usar a lutteros: cadastro, compra de cursos, acesso aos conteúdos, comunidade, reembolso e responsabilidades de cada parte."
        lastUpdated={LEGAL_LAST_UPDATED}
        sections={sections}
      >
        <LegalSection id="aceitacao" title="1. Aceitação dos Termos">
          <p>
            Estes Termos de Uso (&quot;Termos&quot;) regulam o acesso e o uso da plataforma <strong>lutteros</strong> em{' '}
            <LegalLink href={entity.siteUrl}>lutteros.com.br</LegalLink> e em seus serviços (a &quot;Plataforma&quot;), operada pela{' '}
            <strong>{entity.legalName}</strong>, CNPJ {entity.cnpj} (&quot;lutteros&quot;, &quot;nós&quot;).
          </p>
          <p>
            Ao criar uma conta, comprar um curso ou usar a Plataforma, você declara que leu e concorda com estes Termos e com a{' '}
            <LegalLink href="/privacy">Política de Privacidade</LegalLink>. Se não concordar, não utilize a Plataforma.
          </p>
        </LegalSection>

        <LegalSection id="servicos" title="2. Sobre a lutteros e os Serviços">
          <p>A lutteros oferece, conforme disponibilidade:</p>
          <LegalList>
            <li>
              <strong>Cursos online</strong> (gratuitos e pagos) em vídeo, áudio e texto, conduzidos por instrutores;
            </li>
            <li>
              <strong>Artigos</strong> e conteúdos educativos, alguns restritos a determinados públicos, como profissionais de
              saúde;
            </li>
            <li>
              <strong>Eventos</strong> e inscrições;
            </li>
            <li>
              <strong>Comunidade</strong> para troca de experiências entre usuários;
            </li>
            <li>
              <strong>Indicação de especialistas</strong> e de produtos e parceiros;
            </li>
            <li>
              <strong>Newsletter</strong> com novidades e conteúdos.
            </li>
          </LegalList>
          <p>Podemos criar, alterar ou descontinuar serviços e funcionalidades, com aviso quando houver impacto em algo que você já contratou.</p>
        </LegalSection>

        <LegalSection id="natureza-educativa" title="3. Natureza Educativa">
          <LegalCallout title="Importante">
            <p>
              Os conteúdos da lutteros são <strong>educativos e informativos</strong>. Eles não constituem diagnóstico,
              tratamento, prescrição ou aconselhamento médico individual, e não substituem a consulta com um profissional de
              saúde.
            </p>
          </LegalCallout>
          <LegalList>
            <li>Se você tem sintomas, dúvidas clínicas ou está em situação de risco, procure atendimento profissional;</li>
            <li>Em emergências, procure um serviço de urgência (SAMU 192);</li>
            <li>
              A indicação de um especialista na Plataforma é informativa. Quando você contrata um atendimento com um
              profissional, a relação é diretamente entre você e ele, e a lutteros não é parte dela.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="conta" title="4. Cadastro e Conta">
          <LegalSub>4.1 Quem pode usar</LegalSub>
          <LegalList>
            <li>
              <strong>Maiores de 18 anos:</strong> uso completo, incluindo compras;
            </li>
            <li>
              <strong>De 13 a 17 anos:</strong> apenas conteúdos educativos, com consentimento e supervisão do responsável legal.
              Compras e contratações são restritas a maiores de 18 anos;
            </li>
            <li>
              <strong>Menores de 13 anos:</strong> não podem criar conta.
            </li>
          </LegalList>

          <LegalSub>4.2 Sua responsabilidade</LegalSub>
          <LegalList>
            <li>Informar dados verdadeiros, completos e atualizados;</li>
            <li>Manter a senha em sigilo e avisar-nos imediatamente sobre qualquer uso não autorizado;</li>
            <li>
              Usar uma conta <strong>pessoal e intransferível</strong>: ela não pode ser compartilhada, cedida ou revendida.
            </li>
          </LegalList>
          <p>Você é responsável pelas atividades realizadas na sua conta.</p>
        </LegalSection>

        <LegalSection id="compras" title="5. Compra de Cursos e Pagamento">
          <LegalList>
            <li>O preço e as condições de cada curso são informados na página do curso antes da compra, em reais (R$);</li>
            <li>
              O pagamento é feito em ambiente seguro do <strong>Asaas</strong>, por Pix, boleto ou cartão de crédito, conforme as
              opções exibidas. Para emitir a cobrança, solicitamos seu CPF ou CNPJ;
            </li>
            <li>
              O acesso ao curso é liberado <strong>após a confirmação do pagamento</strong>. Pix e cartão costumam ser
              confirmados em minutos; o boleto pode levar até alguns dias úteis;
            </li>
            <li>
              A cobrança tem prazo de vencimento. Se ele passar sem pagamento, ela perde a validade e você pode gerar uma nova
              pela página do curso;
            </li>
            <li>Promoções e preços com desconto valem pelo período informado e podem ser encerrados sem aviso prévio;</li>
            <li>A compra concede uma licença de acesso, e não a propriedade do conteúdo (seção 10).</li>
          </LegalList>
          <p>
            O acesso ao curso permanece enquanto ele estiver disponível na Plataforma e sua conta estiver ativa e regular. Se
            descontinuarmos um curso, avisaremos com antecedência razoável.
          </p>
        </LegalSection>

        <LegalSection id="reembolso" title="6. Arrependimento e Reembolso">
          <p>
            Por ser uma compra feita pela internet, você pode desistir do curso em até <strong>7 (sete) dias corridos</strong>{' '}
            contados da confirmação da compra, nos termos do art. 49 do Código de Defesa do Consumidor, com{' '}
            <strong>reembolso integral</strong>, independentemente de já ter acessado o conteúdo.
          </p>
          <LegalList>
            <li>
              Para pedir, escreva para <LegalLink href={`mailto:${entity.legalEmail}`}>{entity.legalEmail}</LegalLink> usando o
              e-mail da sua conta e informando o curso;
            </li>
            <li>
              O reembolso é feito pelo mesmo meio de pagamento, no prazo do provedor (cartão e Pix, em geral, em poucos dias;
              boleto por transferência bancária);
            </li>
            <li>Com o reembolso, o acesso ao curso é encerrado;</li>
            <li>
              Depois do prazo de 7 dias, o reembolso só é devido nos casos previstos em lei, como falha na prestação do serviço
              ou cobrança indevida.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="uso-conteudo" title="7. Acesso e Uso do Conteúdo">
          <p>
            Ao comprar ou se inscrever em um curso, concedemos a você uma licença <strong>pessoal, limitada, não exclusiva e
            intransferível</strong> para assistir ao conteúdo na Plataforma, para fins de estudo próprio. É proibido:
          </p>
          <LegalList>
            <li>Compartilhar login e senha, ou permitir que outras pessoas acessem o conteúdo com a sua conta;</li>
            <li>Baixar, copiar, gravar a tela, extrair, reproduzir, redistribuir, revender ou publicar aulas, materiais ou qualquer parte do conteúdo;</li>
            <li>Contornar ou tentar contornar medidas técnicas de proteção, limites de acesso ou verificações de pagamento;</li>
            <li>Usar o conteúdo para treinar sistemas de inteligência artificial ou para qualquer finalidade comercial.</li>
          </LegalList>
          <LegalCallout title="Proteções técnicas">
            <p>
              Para proteger o conteúdo e os instrutores, a Plataforma usa links de vídeo de curta duração, bloqueia o botão de
              download e limita o número de redes (endereços IP) diferentes que podem acessar o conteúdo pago em cada conta.
              Se você atingir o limite, entre em contato com o suporte.
            </p>
          </LegalCallout>
          <p>
            O descumprimento destas regras pode levar à suspensão ou ao encerramento da conta, sem direito a reembolso, além de
            responsabilização civil e criminal.
          </p>
        </LegalSection>

        <LegalSection id="conduta" title="8. Conduta e Comunidade">
          <p>A comunidade existe para acolher e informar. Esperamos respeito, empatia e linguagem adequada. É proibido:</p>
          <LegalList>
            <li>Assédio, discriminação, intimidação, ameaças ou discurso de ódio;</li>
            <li>Conteúdo pornográfico, explícito sem finalidade educativa, ou que envolva menores de idade;</li>
            <li>Divulgar dados pessoais ou imagens íntimas de terceiros sem autorização;</li>
            <li>Spam, divulgação comercial não autorizada, esquemas e golpes;</li>
            <li>Fazer-se passar por outra pessoa ou por profissional de saúde sem sê-lo;</li>
            <li>Atacar a segurança da Plataforma ou usar contas múltiplas para burlar restrições;</li>
            <li>Dar aconselhamento médico individual ou indicar tratamentos como se fosse atendimento profissional.</li>
          </LegalList>
          <p>
            Podemos moderar, ocultar ou remover conteúdo que viole estes Termos e, quando necessário, suspender contas. Você
            pode denunciar conteúdos pelos recursos de denúncia da Plataforma.
          </p>
        </LegalSection>

        <LegalSection id="conteudo-usuario" title="9. Conteúdo Publicado por Você">
          <p>Posts, comentários, avaliações e outros conteúdos que você publicar na Plataforma:</p>
          <LegalList>
            <li>Continuam sendo seus. Você declara ter os direitos necessários sobre eles;</li>
            <li>
              Nos dão uma licença gratuita, não exclusiva e limitada para exibi-los e distribuí-los na Plataforma enquanto
              estiverem publicados;
            </li>
            <li>São de sua responsabilidade. Não os usamos para publicidade de terceiros.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="propriedade" title="10. Propriedade Intelectual">
          <p>
            Marcas, logotipos, textos, vídeos, áudios, imagens, cursos, layout e software da Plataforma pertencem à lutteros ou
            a seus instrutores e parceiros e são protegidos pela legislação de propriedade intelectual. Nada nestes Termos
            transfere a você qualquer direito além da licença de uso descrita aqui.
          </p>
        </LegalSection>

        <LegalSection id="eventos-parceiros" title="11. Eventos, Produtos e Parceiros">
          <LegalList>
            <li>
              Eventos podem ter vagas limitadas, alteração de data ou formato e regras próprias, informadas na página do evento;
            </li>
            <li>
              Produtos, ofertas e códigos promocionais de parceiros são de responsabilidade do respectivo parceiro, que define o
              preço, a entrega e o atendimento. A lutteros apenas divulga;
            </li>
            <li>Links para sites de terceiros são fornecidos por conveniência. Não controlamos nem nos responsabilizamos por eles.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="privacidade" title="12. Privacidade">
          <p>
            O tratamento de dados pessoais é descrito na <LegalLink href="/privacy">Política de Privacidade</LegalLink>, que faz
            parte destes Termos. Por tratar de temas íntimos, aplicamos cuidado redobrado e não compartilhamos dados sobre saúde
            ou vida sexual para fins comerciais.
          </p>
        </LegalSection>

        <LegalSection id="responsabilidade" title="13. Responsabilidade">
          <LegalList>
            <li>
              Empenhamo-nos para manter a Plataforma disponível e o conteúdo correto, mas não garantimos funcionamento
              ininterrupto nem ausência de erros. Podem ocorrer manutenções e instabilidades;
            </li>
            <li>
              Não nos responsabilizamos por decisões tomadas apenas com base no conteúdo educativo, nem por danos decorrentes de
              uso indevido da conta pelo usuário ou de falhas fora do nosso controle, como internet, dispositivo ou provedores
              de pagamento;
            </li>
            <li>
              Nada nestes Termos limita direitos que a lei garante ao consumidor nem exclui responsabilidade que a lei não
              permita excluir.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="suspensao" title="14. Suspensão e Encerramento">
          <p>
            Você pode parar de usar a Plataforma quando quiser e pedir a exclusão da sua conta pelo e-mail da seção 17. Podemos
            suspender ou encerrar contas que violem estes Termos, a lei ou direitos de terceiros, com aviso quando possível. A
            exclusão da conta encerra o acesso aos cursos, observado o direito de reembolso da seção 6 quando aplicável.
          </p>
        </LegalSection>

        <LegalSection id="alteracoes" title="15. Alterações dos Termos">
          <p>
            Podemos atualizar estes Termos. A data da última atualização está no topo da página. Em mudanças relevantes,
            avisaremos por e-mail ou na Plataforma com antecedência razoável. Continuar usando a Plataforma depois disso
            significa que você aceita a nova versão.
          </p>
        </LegalSection>

        <LegalSection id="foro" title="16. Lei Aplicável e Foro">
          <p>
            Estes Termos são regidos pela legislação brasileira. Para consumidores, fica eleito o foro do domicílio do
            consumidor. Para os demais casos, fica eleito o foro da comarca de {entity.forumCity}. Antes de qualquer medida,
            buscaremos resolver a questão amigavelmente com você.
          </p>
        </LegalSection>

        <LegalSection id="contato" title="17. Contato">
          <LegalList>
            <li>
              <strong>Jurídico e reembolsos:</strong> <LegalLink href={`mailto:${entity.legalEmail}`}>{entity.legalEmail}</LegalLink>
            </li>
            <li>
              <strong>Privacidade e dados pessoais:</strong>{' '}
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
