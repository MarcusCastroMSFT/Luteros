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

### Assinatura: lista de espera

`/waitlist` recebe e-mails de quem quer assinar os artigos de acesso pago. A API
`POST /api/waitlist` grava na tabela `subscription_waitlist` (migração `0009`),
separada da newsletter: entrar na lista não é consentimento para newsletter e
nenhum e-mail é enviado automaticamente. O envio exige o aceite do usuário, o
e-mail é único e repetir o cadastro apenas atualiza o perfil escolhido, sem
revelar se o e-mail já estava na lista. Os dados ficam só no banco; consulte a
tabela para avisar os interessados.

`/pricing` redireciona (temporário, 307) para `/waitlist` em `next.config.ts`, e
o paywall dos artigos aponta para a lista de espera.

**Como voltar com os planos quando a assinatura for ao ar:**

1. Mova `app/(public-pages)/_pricing-plans` de volta para `app/(public-pages)/pricing`
   (a pasta com `_` não gera rota, mas continua sendo verificada pelo TypeScript).
2. Remova o redirecionamento de `/pricing` em `next.config.ts`.
3. Troque os links de `/waitlist` por `/pricing` em `components/blog/paywall.tsx`,
   `app/sitemap.ts` e `app/llms.txt/route.ts`.
4. Revise valores, benefícios e garantia em `data/pricing.ts` antes de publicar:
   são dados de exemplo da versão anterior. Os componentes continuam em
   `components/pricing`.
5. Aplique o novo visual de marca à página de planos, que ainda usa o estilo antigo.

### Páginas institucionais

Contato, FAQ e Sobre a Lutteros compartilham o cabeçalho compacto de marca
(`PageHeader`, com a propriedade `illustration`) e os ícones de `components/brand`.
A página Sobre usa o posicionamento científico aprovado em `data/about.ts`,
sem números de alunos, equipe ou histórico fictícios. Novas informações
institucionais devem ser confirmadas antes de sua publicação. A página usa fotos
geradas por IA em `public/images/about` (não retratam pessoas reais), com paleta
da marca e plantas apenas como elemento de ambiente, sem grafismos de folhas.
O princípio de Transparência afirma só o que o site já faz: referências nos
conteúdos e aviso de acesso gratuito ou pago antes da leitura.

O FAQ mantém respostas visíveis, busca e dados estruturados na mesma fonte,
em `app/(public-pages)/faq/page.tsx`. Formas de pagamento e condições de acesso
são consultadas no curso/checkout; regras de cancelamento remetem aos Termos
de Uso. Os canais de contato são o formulário e `contato@lutteros.com.br`,
com resposta em até 48 horas úteis.

A Central de ajuda (`/help`) é renderizada no servidor a partir de `data/help.ts`,
sem API nem dados simulados. Cada guia descreve apenas recursos existentes, sem
datas, contagens de visualização ou canais não confirmados. Ao criar ou alterar
um recurso da plataforma, atualize o guia correspondente. Os guias entram
automaticamente na página do site e no sitemap.

### Motion

O motion segue o padrão da DSG Capital, sem biblioteca extra: animações CSS em
`app/globals.css` e um único componente, `components/common/page-motion.tsx`, no
layout das páginas públicas.

- **Entrada do topo:** `hero-enter` (opacidade + subida) e `hero-rise` (só
  subida, para títulos e fotos que podem ser o LCP). Use `enterDelay(ms)` de
  `lib/motion.ts` para escalonar. `PageHeader` já aplica isso a todas as páginas
  com cabeçalho de marca.
- **Revelação ao rolar:** `data-reveal` em um bloco, ou `data-reveal-stagger` em
  uma grade (cada card entra em cascata por coluna). `reveal(índice)` de
  `lib/motion.ts` gera o atraso de irmãos.
- **Barra de progresso de leitura** no topo, com o gradiente teal → roxo.

Páginas com motion: home, Sobre, Contato, FAQ, Ajuda, Lista de espera, e as grades
de artigos, cursos, produtos e eventos. Os estados escondidos só valem com
JavaScript ativo e `prefers-reduced-motion: no-preference`; sem isso o conteúdo
aparece normalmente. O `PageMotion` só define o atributo `data-revealed`; ele nunca
altera `class` ou `style`, porque o React compara os dois na hidratação e a página
quebraria.

### Streaming e páginas em branco

O layout raiz não envolve o app em `<Suspense>`. Com Cache Components, esse boundary
global fazia as páginas com conteúdo transmitido (artigos, cursos, eventos, produtos)
abrirem em branco: o React descartava os trechos internos por chegarem antes do boundary
raiz (erro `$RS ... parentNode` no console). Cada página que lê dados da requisição
(`searchParams`, `params`, sessão) tem o próprio `<Suspense>` ou `loading.tsx`. Ao criar
uma página nova desse tipo, faça o mesmo: o `npm run build` acusa quando falta.

### Imagens da marca

**Capas dos artigos.** As 22 capas (foto realista, sem texto, em 16:10) ficam em
`public/images/articles/<tema>-v2.webp`: profissionais de saúde (homens e mulheres),
pacientes, casais, famílias e objetos quando o tema pede, na paleta da marca. O título
já aparece junto da capa nos cards e na página, então a imagem não repete texto nem
logo. São geradas por IA e não retratam pessoas reais. Duas exceções: "Anamnese
estruturada" usa a foto de consulta aprovada, e "Dispositivos sexuais" usa uma imagem
criada no ChatGPT (a moderação do Azure recusa esse tema) que contém textos pequenos
em português, em placas e rótulos. Imagens com crianças também são recusadas pela
moderação; por isso a capa de educação sexual mostra os pais.

- **Primeira rodada (paisagens e objetos)** foi descartada e arquivada em
  `../Luteros-backups/article-covers-v1-webp`, caso queira comparar (versão `v1`).
- Prompts: `scripts/article-covers/prompts.json`. Gerar: `node scripts/generate-article-covers.mjs generate [id]`
  (retoma de onde parou; pula PNGs já existentes). Otimizar: `... build [id]`. Os PNGs
  brutos ficam fora do repositório, em `../Luteros-backups/article-covers-raw`.
- **Originais salvos** em `../Luteros-backups/article-images-original`, com
  `manifest.json` (artigo → URL antiga). As capas antigas continuam no Vercel Blob.
- **Aplicar/reverter:** `node scripts/apply-article-covers.mjs plan|apply|revert [id]`
  (`plan` só mostra; `revert` restaura as URLs antigas; o `id` opcional, de
  `prompts.json`, limita a ação a um único artigo). O banco local é o de produção: rode `apply`
  somente depois que os arquivos novos estiverem no deploy, senão o site publicado
  pede imagens que ainda não existem. Depois, o cache das páginas pode levar até
  1 hora para atualizar.

Para mudar apenas um artigo, gere de novo com `generate <id>` (apague o PNG bruto) e
incremente `VERSION` nos dois scripts para evitar cache da imagem anterior.

O hero da home usa `public/images/home/hero-peers.webp`, uma conversa
descontraída entre dois profissionais, sem jaleco nem estetoscópio, e sem grafismo
botânico sobre a foto. A seção "Para quem é a Lutteros?" apresenta três cards de
público com as fotos `audience-physicians.webp` (médica e médico em consultório),
`audience-therapy.webp` e `audience-health.webp`. O chamado final usa
`cta-desk.webp`, com um quadro sobre o ciclo da resposta sexual, distinto do
quadro anatômico da foto dos médicos.
As cinco imagens foram geradas por IA e não retratam pessoas reais; mantenha essa
informação ao divulgá-las. Em outras seções, os círculos de `care-orbits.svg`
substituem ramos e flores, com expressão mais neutra em relação a gênero. As telas
de login e cadastro permanecem inalteradas.

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

### Imagens e tabelas dentro dos artigos

O HTML salvo pelo editor é ajustado na hora de exibir por `formatArticleHtml`
(`lib/article-html.ts`), usado pelo `ArticleContent`. O conteúdo no banco não muda.

- **Figuras:** o editor grava `<figure>` dentro de `<p>`, o que o navegador desfaz
  (e perde o alinhamento). A figura sai do parágrafo, mantém o alinhamento escolhido
  (esquerda, centro ou direita) e troca a largura fixa `!important` por uma largura
  máxima responsiva.
- **Ampliar imagem:** cada imagem vira um botão; ao clicar (ou Enter), abre em tela
  cheia com a legenda (`components/blog/article-image-zoom.tsx`). Fecha com Esc,
  no X ou clicando fora.
- **Tabelas:** perdem as bordas pretas inline e recebem o visual da marca conforme o
  número de colunas: 3 ou mais viram grade com a primeira linha como cabeçalho (e
  rolagem lateral no celular); 2 colunas viram "rótulo + descrição"; 1 coluna vira
  caixa de destaque. Células que o autor sombreou ficam em lilás.
- **Caracteres do Word:** o "quadradinho" de checkbox colado do Word (U+009A) vira ☐.
- **Links:** abrem em nova aba (`target="_blank"` + `rel="noopener noreferrer"`), no texto e nas
  Referências, com o aviso "(abre em nova aba)" para leitores de tela. Âncoras (`#`), e-mail e
  telefone continuam normais.

Estilos em `app/globals.css` (`.article-body`). Testes: `npx tsx --test lib/article-html.test.ts`.

### SEO e visibilidade em IA

- **Rotas geradas:** `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`,
  `/feed.xml` (RSS dos artigos), `/llms.txt` (guia para IAs, com artigos, cursos
  e eventos vindos do banco), `/llms-full.txt` (texto integral **só dos artigos
  gratuitos**) e `/.well-known/security.txt`.
- **Origem canônica:** `lib/seo.ts` (`SITE_URL`) lê `NEXT_PUBLIC_BASE_URL`. O
  mesmo arquivo tem `truncateMeta` (descrições de ~160 caracteres) e `escapeXml`.
  Testes: `npx tsx --test lib/seo.test.ts`.
- **Previews:** `robots.txt` bloqueia tudo quando `VERCEL_ENV` não é `production`.
- **Páginas privadas** (login, cadastro, painel, editor de teste, "meus cursos"
  etc.) usam `noindex` por metadata. Não as bloqueie no `robots.txt`: o
  buscador precisa abrir a página para ler o `noindex`.
- **Metadata:** cada página pública define `alternates.canonical`. O link do
  feed RSS fica no `<head>` do layout raiz porque `alternates` de uma página
  substitui o do layout inteiro.
- **Dados estruturados:** `Organization` + `WebSite` no layout raiz; `Article` +
  `BreadcrumbList` nos artigos (com `isAccessibleForFree` e a seção `#article-paywall`
  nos pagos); `Course`, `Event`, `Product` e `FAQPage` nas respectivas páginas.
  `JsonLd` escapa `<` para o conteúdo do editor nunca fechar a tag `script`.
- **Sitemap:** páginas fixas não têm `lastModified`; só conteúdo do banco informa
  a data real de atualização.

## Especialistas

A página `/specialists` lista os usuários marcados como **Exibir em Especialistas**
(coluna `users.isSpecialist`, migração `0010_user_is_specialist.sql`, padrão `false`).
Não há dados de exemplo: tudo vem do perfil do usuário.

- **Como incluir ou remover alguém:** Admin → Usuários → Editar → marque
  "Exibir em Especialistas". Cargo, empresa, biografia, LinkedIn, Instagram, X e
  site são os mesmos campos do perfil. Na biografia, **cada linha vira um item**
  de "Formação e atuação".
- **Links:** `lib/specialist-profile.ts` normaliza o que a pessoa digitou
  (`@user`, `linkedin.com/in/x`, `instagram.com.br/x`) e só aceita links http(s)
  da rede esperada. Valores inválidos são ignorados.
- **Perfil sem biografia:** aparece na lista, mas o card não tem link, a página
  usa `noindex` e fica fora do sitemap e do `llms.txt` até a bio ser preenchida.
- **Cursos:** o perfil lista os cursos **publicados** em que a pessoa é instrutora
  (`course_instructors`). E-mail e telefone nunca são exibidos.
- **Cache:** `lib/specialists.ts` usa a tag `specialists`; salvar um perfil ou a
  marcação atualiza as páginas na hora.
- **Slug:** gerado do nome (`tetzi-oliveira-brandao`); mudar o nome muda a URL.

Testes: `npx tsx --test lib/specialist-profile.test.ts`.

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

## Login com Google

- O cliente OAuth fica no Google Cloud (projeto `507989042720`). URIs de redirecionamento
  autorizados: `https://www.lutteros.com.br/api/auth/callback/google` e
  `http://localhost:3001/api/auth/callback/google`. Variáveis: `GOOGLE_CLIENT_ID` e
  `GOOGLE_CLIENT_SECRET` (na Vercel; copie para o `.env.local` para testar localmente).
- **Mesmo e-mail com senha e Google:** o Google se vincula à conta existente
  (`allowDangerousEmailAccountLinking`). Se o e-mail da conta **nunca tinha sido verificado**,
  ela passa a verificada e a **senha antiga é apagada** (`events.linkAccount` em `auth.ts`),
  para quem cadastrou o e-mail de outra pessoa não manter acesso.
- Quem fica sem senha e tenta entrar por e-mail vê "Esta conta entra com o Google…" (código
  `password_not_set`). Para voltar a usar senha: **Esqueceu sua senha?** — depois disso os dois
  métodos funcionam.
- Erros de login voltam para `/login?error=…` e aparecem no aviso acima do formulário
  (`lib/auth-errors.ts`).

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

A **Visão Geral** (`/admin`) mostra as 3 mensagens mais recentes e quantas estão
sem resposta. Cada mensagem pode ser marcada como **respondida** (ou reaberta) na
Visão Geral, na lista e na página da mensagem, por `PATCH /api/admin/contact/[id]`
com `{ "responded": true | false }`. O status fica em `respondedAt`; marcar de novo
mantém a data original. É um controle interno: o sistema não envia a resposta.

As migrações `0006_contact_messages.sql` e `0008_contact_responded.sql` (coluna
opcional `respondedAt`) devem ser aplicadas antes da publicação.
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

## E-mails

Todos os e-mails usam o mesmo layout de marca de `lib/email-layout.ts`, enviado pelo
Resend (`RESEND_API_KEY`, `FROM_EMAIL`):

- Logo, cartão branco sobre fundo marfim, título em Cardo e texto em DM Sans
  (Georgia/Arial quando o cliente não carrega web fonts).
- Rodapé com o broto (`public/images/brand/care-sprout.svg`), o slogan, o Instagram (`@lutteros`), o site, a razão
  social e o CNPJ.
- Modo escuro no Apple Mail e no iOS, com logo, broto e ícone em versões claras.
- Botão que funciona no Outlook, link alternativo abaixo dele, prévia (preheader) e
  versão em texto puro.

| E-mail | Onde |
| --- | --- |
| Redefinição de senha | `lib/account-emails.ts`, enviado por `/api/auth/forgot-password` |
| Boas-vindas da newsletter | `renderWelcomeEmail` em `lib/email.ts`, com o link de cancelamento por token |
| Campanhas da newsletter | `lib/email-campaign.ts`, usado no envio, no teste e na pré-visualização do admin |
| Perfil, matrícula, evento, certificado, compra e lembretes | `data/system-email-templates.ts` (`{{variáveis}}`) |

Nos templates do sistema, os valores das variáveis são escapados no HTML, e `{{greeting}}`
vira "Olá, <primeiro nome>". Uma cópia salva em Admin → E-mails do sistema substitui o
padrão; use **Restaurar padrão** para voltar ao layout atual.

As imagens ficam em `public/email/` e são geradas por `node scripts/build-email-assets.mjs`.
Os e-mails apontam para `https://www.lutteros.com.br/email/...`; para testar com outro
domínio, defina `EMAIL_ASSET_URL`. Testes: `npx tsx --test lib/email-layout.test.ts`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
