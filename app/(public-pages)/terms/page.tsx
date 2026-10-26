import type { Metadata } from 'next'
import { ScrollText } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { LegalCallout, LegalDocument, LegalLink, LegalList, LegalSection, LegalSub } from '@/components/legal/legal-document'
import { LEGAL_LAST_UPDATED, LUTTEROS_ENTITY as entity } from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Regras de uso da plataforma Lutteros: cadastro, compra de cursos, acesso aos conteúdos, reembolso e responsabilidades.',
  alternates: { canonical: `${entity.siteUrl}/terms` },
}

const sections = [
  { id: 'aceitacao', title: '1. Aceitação dos Termos' },
  { id: 'servicos', title: '2. Sobre a Lutteros e os Serviços' },
  { id: 'natureza-educativa', title: '3. Natureza Educativa' },
  { id: 'conta', title: '4. Cadastro e Conta' },
  { id: 'compras', title: '5. Compra de Cursos e Pagamento' },
  { id: 'reembolso', title: '6. Arrependimento e Reembolso' },
  { id: 'uso-conteudo', title: '7. Acesso e Uso do Conteúdo' },
  { id: 'propriedade', title: '8. Propriedade Intelectual' },
  { id: 'parceiros', title: '9. Produtos e Parceiros' },
  { id: 'privacidade', title: '10. Privacidade' },
  { id: 'responsabilidade', title: '11. Responsabilidade' },
  { id: 'suspensao', title: '12. Suspensão e Encerramento' },
  { id: 'alteracoes', title: '13. Alterações dos Termos' },
  { id: 'foro', title: '14. Lei Aplicável e Foro' },
  { id: 'contato', title: '15. Contato' },
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
        intro="As condições para utilizar a Lutteros: cadastro, compra de cursos, acesso aos conteúdos, reembolso e responsabilidades de cada parte."
        lastUpdated={LEGAL_LAST_UPDATED}
        sections={sections}
      >
        <LegalSection id="aceitacao" title="1. Aceitação dos Termos">
          <p>
            Estes Termos de Uso (os &quot;Termos&quot;) regulam o acesso e o uso da plataforma <strong>Lutteros</strong> em{' '}
            <LegalLink href={entity.siteUrl}>lutteros.com.br</LegalLink> e em seus serviços (a &quot;Plataforma&quot;), operada pela{' '}
            <strong>{entity.legalName}</strong>, CNPJ {entity.cnpj} (a &quot;Lutteros&quot;). A pessoa que acessa ou utiliza a
            Plataforma é referida como o &quot;Usuário&quot;.
          </p>
          <p>
            Ao criar uma conta, comprar um curso ou utilizar a Plataforma, o Usuário declara que leu e concorda com estes Termos
            e com a <LegalLink href="/privacy">Política de Privacidade</LegalLink>. Quem não concordar não deve utilizar a
            Plataforma.
          </p>
        </LegalSection>

        <LegalSection id="servicos" title="2. Sobre a Lutteros e os Serviços">
          <p>A Lutteros oferece, conforme disponibilidade:</p>
          <LegalList>
            <li>
              <strong>Cursos online</strong> (gratuitos e pagos) em vídeo, áudio e texto, conduzidos por instrutores;
            </li>
            <li>
              <strong>Artigos</strong> e conteúdos educativos, alguns restritos a determinados públicos, como profissionais de
              saúde;
            </li>
            <li>
              <strong>Indicação de produtos e parceiros</strong>;
            </li>
            <li>
              <strong>Newsletter</strong> com novidades e conteúdos.
            </li>
          </LegalList>
          <p>
            A Lutteros pode criar, alterar ou descontinuar serviços e funcionalidades, com aviso quando houver impacto em algo
            já contratado pelo Usuário.
          </p>
        </LegalSection>

        <LegalSection id="natureza-educativa" title="3. Natureza Educativa">
          <LegalCallout title="Importante">
            <p>
              Os conteúdos da Lutteros são <strong>educativos e informativos</strong>. Eles não constituem diagnóstico,
              tratamento, prescrição ou aconselhamento médico individual, e não substituem a consulta com um profissional de
              saúde.
            </p>
          </LegalCallout>
          <LegalList>
            <li>
              Em caso de sintomas, dúvidas clínicas ou situação de risco, o Usuário deve procurar atendimento profissional;
            </li>
            <li>Em situações de urgência, o Usuário deve procurar imediatamente um serviço de saúde de emergência.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="conta" title="4. Cadastro e Conta">
          <LegalSub>4.1 Quem pode utilizar</LegalSub>
          <p>
            A Plataforma não se destina a menores de 18 anos. O cadastro e as compras e contratações são restritos a maiores de
            18 anos.
          </p>

          <LegalSub>4.2 Responsabilidade do Usuário</LegalSub>
          <LegalList>
            <li>Informar dados verdadeiros, completos e atualizados;</li>
            <li>Manter a senha em sigilo e avisar a Lutteros imediatamente sobre qualquer uso não autorizado;</li>
            <li>
              Usar uma conta <strong>pessoal e intransferível</strong>: ela não pode ser compartilhada, cedida ou revendida.
            </li>
          </LegalList>
          <p>O Usuário é responsável pelas atividades realizadas em sua conta.</p>
        </LegalSection>

        <LegalSection id="compras" title="5. Compra de Cursos e Pagamento">
          <LegalList>
            <li>O preço e as condições de cada curso são informados na página do curso antes da compra, em reais (R$);</li>
            <li>
              O pagamento é feito em ambiente seguro do <strong>Asaas</strong>, por Pix, boleto ou cartão de crédito, conforme as
              opções exibidas. Para emitir a cobrança, a Lutteros solicita o CPF ou o CNPJ do Usuário;
            </li>
            <li>
              O acesso ao curso é liberado <strong>após a confirmação do pagamento</strong>. Pix e cartão costumam ser
              confirmados em minutos; o boleto pode levar até alguns dias úteis;
            </li>
            <li>
              A cobrança tem prazo de vencimento. Se ele passar sem pagamento, a cobrança perde a validade e o Usuário pode
              gerar uma nova pela página do curso;
            </li>
            <li>Promoções e preços com desconto valem pelo período informado e podem ser encerrados sem aviso prévio;</li>
            <li>A compra concede uma licença de acesso, e não a propriedade do conteúdo (seção 8).</li>
          </LegalList>
          <p>
            O acesso ao curso permanece enquanto ele estiver disponível na Plataforma e a conta do Usuário estiver ativa e
            regular. Se a Lutteros descontinuar um curso, avisará com antecedência razoável.
          </p>
        </LegalSection>

        <LegalSection id="reembolso" title="6. Arrependimento e Reembolso">
          <p>
            Por ser uma compra feita pela internet, o Usuário pode desistir do curso em até <strong>7 (sete) dias corridos</strong>{' '}
            contados da confirmação da compra, nos termos do art. 49 do Código de Defesa do Consumidor, com{' '}
            <strong>reembolso integral</strong>, independentemente de já ter acessado o conteúdo.
          </p>
          <LegalList>
            <li>
              Para pedir, o Usuário deve escrever para <LegalLink href={`mailto:${entity.contactEmail}`}>{entity.contactEmail}</LegalLink>{' '}
              usando o e-mail da sua conta e informando o curso;
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
            Ao comprar ou se inscrever em um curso, o Usuário recebe da Lutteros uma licença <strong>pessoal, limitada, não
            exclusiva e intransferível</strong> para assistir ao conteúdo na Plataforma, para fins de estudo próprio. É proibido:
          </p>
          <LegalList>
            <li>Compartilhar login e senha, ou permitir que outras pessoas acessem o conteúdo com a conta do Usuário;</li>
            <li>Baixar, copiar, gravar a tela, extrair, reproduzir, redistribuir, revender ou publicar aulas, materiais ou qualquer parte do conteúdo;</li>
            <li>Contornar ou tentar contornar medidas técnicas de proteção, limites de acesso ou verificações de pagamento;</li>
            <li>Usar o conteúdo para treinar sistemas de inteligência artificial ou para qualquer finalidade comercial.</li>
          </LegalList>
          <LegalCallout title="Proteções técnicas">
            <p>
              Para proteger o conteúdo e os instrutores, a Plataforma usa links de vídeo de curta duração, bloqueia o botão de
              download e limita o número de redes (endereços IP) diferentes que podem acessar o conteúdo pago em cada conta.
              Se o limite for atingido, o Usuário deve entrar em contato com a Lutteros pelo e-mail da seção 15.
            </p>
          </LegalCallout>
          <p>
            O descumprimento destas regras pode levar à suspensão ou ao encerramento da conta, sem direito a reembolso, além de
            responsabilização civil e criminal.
          </p>
        </LegalSection>

        <LegalSection id="propriedade" title="8. Propriedade Intelectual">
          <p>
            Marcas, logotipos, textos, vídeos, áudios, imagens, cursos, layout e software da Plataforma pertencem à Lutteros ou
            a seus instrutores e parceiros e são protegidos pela legislação de propriedade intelectual. Nada nestes Termos
            transfere ao Usuário qualquer direito além da licença de uso descrita aqui.
          </p>
        </LegalSection>

        <LegalSection id="parceiros" title="9. Produtos e Parceiros">
          <LegalList>
            <li>
              Produtos, ofertas e códigos promocionais de parceiros são de responsabilidade do respectivo parceiro, que define o
              preço, a entrega e o atendimento. A Lutteros apenas os divulga;
            </li>
            <li>
              Links para sites de terceiros são fornecidos por conveniência. A Lutteros não os controla nem se responsabiliza
              por eles.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="privacidade" title="10. Privacidade">
          <p>
            O tratamento de dados pessoais é descrito na <LegalLink href="/privacy">Política de Privacidade</LegalLink>, que faz
            parte destes Termos. Por tratar de temas íntimos, a Lutteros aplica cuidado redobrado e não compartilha dados sobre
            saúde ou vida sexual para fins comerciais.
          </p>
        </LegalSection>

        <LegalSection id="responsabilidade" title="11. Responsabilidade">
          <LegalList>
            <li>
              A Lutteros empenha-se para manter a Plataforma disponível e o conteúdo correto, mas não garante funcionamento
              ininterrupto nem ausência de erros. Podem ocorrer manutenções e instabilidades;
            </li>
            <li>
              A Lutteros não se responsabiliza por decisões tomadas apenas com base no conteúdo educativo, nem por danos
              decorrentes de uso indevido da conta pelo Usuário ou de falhas fora de seu controle, como internet, dispositivo
              ou provedores de pagamento;
            </li>
            <li>
              Nada nestes Termos limita direitos que a lei garante ao consumidor nem exclui responsabilidade que a lei não
              permita excluir.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="suspensao" title="12. Suspensão e Encerramento">
          <p>
            O Usuário pode deixar de utilizar a Plataforma quando quiser e pedir a exclusão de sua conta pelo e-mail da seção 15.
            A Lutteros pode suspender ou encerrar contas que violem estes Termos, a lei ou direitos de terceiros, com aviso
            quando possível. A exclusão da conta encerra o acesso aos cursos, observado o direito de reembolso da seção 6,
            quando aplicável.
          </p>
        </LegalSection>

        <LegalSection id="alteracoes" title="13. Alterações dos Termos">
          <p>
            A Lutteros pode atualizar estes Termos. A data da última atualização consta no topo da página. Em mudanças
            relevantes, a Lutteros avisa o Usuário por e-mail ou na Plataforma, com antecedência razoável. Continuar utilizando
            a Plataforma depois disso significa que o Usuário aceita a nova versão.
          </p>
        </LegalSection>

        <LegalSection id="foro" title="14. Lei Aplicável e Foro">
          <p>
            Estes Termos são regidos pela legislação brasileira. Para consumidores, fica eleito o foro do domicílio do
            consumidor. Para os demais casos, fica eleito o foro da comarca de {entity.forumCity}. Antes de qualquer medida, a
            Lutteros buscará resolver a questão amigavelmente com o Usuário.
          </p>
        </LegalSection>

        <LegalSection id="contato" title="15. Contato">
          <LegalList>
            <li>
              <strong>E-mail de contato (suporte, jurídico, reembolsos e privacidade):</strong>{' '}
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
