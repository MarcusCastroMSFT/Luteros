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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
