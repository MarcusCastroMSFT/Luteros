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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
