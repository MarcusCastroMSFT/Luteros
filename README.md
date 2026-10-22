This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Catálogo público

### Páginas institucionais

Contato, FAQ e Sobre a Lutteros compartilham o cabeçalho compacto de marca
(`PageHeader`, com a propriedade `illustration`) e os ícones de `components/brand`.
A página Sobre usa o posicionamento científico aprovado em `data/about.ts`,
sem números de alunos, equipe ou histórico fictícios. Novas informações
institucionais devem ser confirmadas antes de sua publicação.

O FAQ mantém respostas visíveis, busca e dados estruturados na mesma fonte,
em `app/(public-pages)/faq/page.tsx`. Formas de pagamento e condições de acesso
são consultadas no curso/checkout; regras de cancelamento remetem aos Termos
de Uso. Os canais de contato são o formulário e `contato@lutteros.com.br`,
com resposta em até 48 horas úteis.

### Imagens da marca

Cursos sem foto usam `public/images/course-placeholder-v2.svg` nos cards e na
prévia do curso. A versão PNG é usada no compartilhamento desses cursos.
A imagem padrão de compartilhamento do site é `public/images/og-image.png`.
Ambos os PNGs têm **1200 × 630 px**.

Para regenerar os PNGs após alterar os grafismos ou a identidade visual:

```bash
npm run og:generate
node --test scripts/generate-og-image.test.mjs
```

O gerador usa o logo do cabeçalho, os grafismos em `public/images/brand` e as
fontes Cardo e DM Sans em `scripts/fonts`, com suas licenças SIL OFL incluídas.
Não depende de fontes instaladas no computador nem de serviços externos.
Imagens próprias de cursos e artigos continuam tendo prioridade. Plataformas
sociais podem manter previews antigos em cache até uma nova coleta da URL.
Ao trocar novamente a arte, versione o nome do SVG e atualize `lib/course-image.ts`
e o gerador. Para a imagem social, incremente a versão da URL em
`lib/social-images.ts`. Isso evita reutilizar o cache da imagem anterior.

### Paginação

Artigos e cursos usam **9 itens por página**, com uma grade de três colunas no
desktop. A paginação por URL continua disponível no desktop e sem JavaScript.
Em telas menores que 768 px, a lista carrega o próximo lote ao se aproximar do
fim, sem substituir os itens já exibidos.

O carregamento mobile usa a server action `loadCatalogPage` com as mesmas
consultas públicas em cache. Há um botão **Carregar mais** como alternativa,
mensagem de fim da lista e tentativa manual após erro. Trocar a categoria
reinicia a lista; **Ir para o rodapé** pausa o carregamento automático para
permitir acesso aos links do rodapé. Ao ampliar a janela para desktop, a grade
volta à página da URL, sem misturar os lotes acumulados no mobile.

Testes: `npx tsx --test lib/catalog-pagination.test.ts`.

## Instrutores dos cursos

No formulário de criação ou edição de cursos, administradores podem escolher um
**instrutor principal** e adicionar outros instrutores em **Participação especial**.
Os participantes podem ser buscados pelo nome ou usuário e removidos individualmente.
O instrutor principal não aparece na lista de participantes especiais.

Os vínculos usam a tabela existente `course_instructors`: o primeiro ID é o
principal e os demais são participações especiais, na ordem de seleção. Não há
migração nova. Cursos com vários instrutores já cadastrados seguem essa mesma
ordem. Todos os vinculados mantêm as permissões de gerenciamento existentes;
somente administradores podem mudar a seleção. A página pública e os cards
identificam separadamente o principal e as participações especiais.

A criação e a atualização do curso salvam os dados e os vínculos em um único
`db.batch`, compatível com o driver Neon HTTP. Se uma consulta falhar, o lote
inteiro é revertido, evitando salvar o curso sem suas participações.

## Referências nas aulas de artigo

Aulas do tipo **Artigo** têm um editor opcional de **Referências**, como os artigos
do site. As fontes ficam em uma seção recolhível depois do conteúdo da aula.
O HTML é sanitizado antes de chegar ao leitor e só é carregado após a verificação
de acesso ao curso; não faz parte dos dados públicos da página do curso.

A migração `0007_lesson_references.sql` adiciona a coluna nullable
`lessons.references`, sem modificar o conteúdo de aulas existentes. Aplique as
migrações pendentes com `npm run db:migrate` e uma conexão direta (`DIRECT_URL`)
antes de publicar. Teste primeiro em uma branch isolada.

Na API, omitir `references` em uma atualização preserva o valor atual; enviar
`null` ou texto vazio o remove. Mudar a aula para vídeo ou áudio também limpa
as referências. Testes: `npx tsx --test lib/lesson-references.test.ts`.
O teste de integração `lib/lesson-references.integration.test.ts` exige
`LESSON_TEST_DATABASE_URL` de uma branch isolada migrada,
`LESSON_TEST_BASE_URL=http://localhost:3002` de um servidor usando essa mesma
branch e o `AUTH_SECRET` local. Ele cria e remove dados fictícios e verifica
persistência, edição, limpeza, sanitização e bloqueio antes do pagamento ou
depois de reembolso.

## Pagamentos de cursos (Asaas)

Cursos pagos são cobrados pelo [Asaas](https://docs.asaas.com). O botão **Comprar curso**
cria (ou reaproveita) a inscrição como `PENDING`, cadastra o cliente no Asaas (exige
CPF/CNPJ, pedido em um diálogo na primeira compra) e redireciona para a fatura
hospedada do Asaas, onde o aluno escolhe Pix, boleto ou cartão — nenhum dado de
cartão passa pela aplicação. O valor cobrado é o preço promocional, quando houver.

O acesso (aulas, mídia, progresso e "Meus cursos") só é liberado com
`paymentStatus = COMPLETED`. O status é confirmado de duas formas: pelo webhook
`POST /api/webhooks/asaas` e por reconciliação com `GET /payments/{id}` sempre que a
página do curso consulta uma inscrição pendente. Em ambos os casos o status vem da API
do Asaas (e não do corpo do webhook), então eventos forjados ou fora de ordem não
liberam acesso, e reembolsos/chargebacks revogam o acesso.

Variáveis de ambiente:

| Variável | Descrição |
| --- | --- |
| `ASAAS_TYPE` | `sandbox` ou `production` (escolhe a URL base da API). |
| `ASAAS_API_KEY` | Chave de API do ambiente correspondente. Em arquivos `.env*` escape o `$` inicial (`"\$aact_..."`), senão o Next.js o expande como variável e a chave chega vazia. Nas variáveis da Vercel use o valor puro. |
| `ASAAS_WEBHOOK_TOKEN` | Token (32–255 caracteres, sem espaços) igual ao `authToken` do webhook cadastrado no Asaas; sem ele o endpoint responde 503. |
| `COURSE_ACCESS_MAX_IPS` | Opcional. Máximo de IPs distintos por aluno/curso em 24 h para tocar mídia paga (padrão `3`; `0` desativa). IPv6 é comparado pelo prefixo /64. Administradores e instrutores são isentos. |
| `COURSE_MEDIA_BIND_SAS_TO_IP` | Opcional. Com `true`, a URL assinada do vídeo só funciona a partir do IPv4 que a solicitou. Pode quebrar a reprodução em redes que trocam de IP (CGNAT, Wi-Fi ↔ 4G), por isso vem desativado. |

Configuração no painel do Asaas: cadastre o webhook apontando para
`https://<domínio>/api/webhooks/asaas`, com o mesmo token de `ASAAS_WEBHOOK_TOKEN` e
os eventos de cobrança (`PAYMENT_*`). A migração `0005` adiciona as colunas/tabelas
usadas (`pnpm db:migrate`).

Proteção do conteúdo pago: o vídeo é entregue por URL assinada (SAS) de curta duração
com `Content-Disposition: inline`, o player oculta o botão de download e o menu de
contexto, e o limite de IPs acima dificulta o compartilhamento de contas. Não é DRM:
quem consegue assistir ainda pode capturar a tela, e vídeos hospedados em YouTube/Vimeo
dependem das proteções dessas plataformas.

## Mensagens de contato

O formulário em `/contact` envia os dados para `POST /api/contact`. A API valida
nome, e-mail, telefone opcional, motivo, assunto opcional e mensagem antes de
gravar em `contact_messages`. A confirmação só aparece depois da persistência.
O corpo da mensagem é texto simples, nunca HTML executável.
O prazo informado de resposta é de até **48 horas úteis**. O campo de mensagem
permite redimensionamento vertical e mantém o limite de 2.000 caracteres.

Administradores acessam **Mensagens de contato** em `/admin/contact`, com busca
por nome, e-mail ou assunto, paginação e leitura completa. As páginas e a API de
listagem (`GET /api/admin/contact`) exigem o papel `ADMIN`; instrutores não
possuem acesso. Não há envio automático de e-mail nem resposta dentro do painel.

A migração `0006_contact_messages.sql` deve ser aplicada antes da publicação.
Use `npm run db:migrate` com `DIRECT_URL` apontando para a conexão direta do banco
do ambiente desejado. Teste primeiro em uma branch isolada; não use `db:push`
para aplicar alterações indiscriminadas em produção.

Cada envio possui uma chave UUID para que uma nova tentativa não duplique uma
mensagem já salva. O limite de cinco mensagens por e-mail por hora é aplicado
no banco, com trava transacional por e-mail, inclusive entre instâncias.
O honeypot e a validação complementam esse limite; não substituem proteção
contra abuso por IP/WAF no ambiente de hospedagem. Não são armazenados IPs.

Testes: `npx tsx --test lib/contact.test.ts`. O teste de persistência é opt-in:
defina `CONTACT_TEST_DATABASE_URL` para uma branch de testes já migrada e rode
`npx tsx --test lib/contact-persistence.integration.test.ts`. Ele cria dados
fictícios e remove somente esses registros ao terminar.

Para testar a API e as permissões, inicie a aplicação local usando essa mesma
branch, defina `CONTACT_TEST_BASE_URL` (ex.: `http://localhost:3002`) e execute
`npx tsx --test lib/contact-api.integration.test.ts`. Esse teste também requer
`AUTH_SECRET` (ou `NEXTAUTH_SECRET`) do servidor local para gerar sessões
temporárias de teste, sem criar usuários ou alterar permissões no banco.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
