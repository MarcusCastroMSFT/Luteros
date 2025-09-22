# Rich Text Editor

Um editor de texto rico construído com Lexical para React/Next.js, integrado com shadcn/ui.

## Recursos

### ✅ Recursos Implementados

- **Formatação de Texto**: Negrito, Itálico, Sublinhado, Riscado, Código inline
- **Cor do Texto**: Paleta de 12 cores predefinidas para personalizar o texto
- **Alinhamento**: Esquerda, Centro, Direita, Justificado
- **Títulos**: H1, H2, H3 através de botões na toolbar
- **Listas**: Com marcadores e numeradas
- **Citações**: Blocos de citação
- **Links**: Inserção de links
- **Imagens**: Inserção de imagens por URL
- **Vídeos**: Embed de YouTube e Vimeo
- **Linha Horizontal**: Separador visual
- **Atalhos de Markdown**: Suporte para sintaxe Markdown
- **Histórico**: Undo/Redo
- **Importar/Exportar**: Suporte para arquivos MD, TXT, HTML
- **Tema Dark/Light**: Totalmente compatível com modo escuro
- **Responsivo**: Layout adaptativo

## Uso Básico

```tsx
import { RichTextEditor } from '@/components/editor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      initialValue={content}
      onChange={setContent}
      placeholder="Digite seu conteúdo..."
      autoFocus
    />
  );
}
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `initialValue` | `string` | `''` | Conteúdo inicial do editor |
| `onChange` | `(value: string) => void` | - | Callback chamado quando o conteúdo muda |
| `placeholder` | `string` | `'Digite seu conteúdo...'` | Texto do placeholder |
| `className` | `string` | - | Classes CSS adicionais |
| `autoFocus` | `boolean` | `false` | Auto-foco no editor |
| `readOnly` | `boolean` | `false` | Modo somente leitura |

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + B` | Negrito |
| `Ctrl/Cmd + I` | Itálico |
| `Ctrl/Cmd + U` | Sublinhado |
| `Ctrl/Cmd + Z` | Desfazer |
| `Ctrl/Cmd + Y` | Refazer |
| `#` + espaço | Título H1 |
| `##` + espaço | Título H2 |
| `###` + espaço | Título H3 |
| `-` + espaço | Lista com marcadores |
| `1.` + espaço | Lista numerada |
| `>` + espaço | Citação |
| ``` | Bloco de código |

## Personalização de Tema

O editor usa um sistema de temas baseado em classes CSS. Você pode personalizar a aparência modificando as classes no objeto `theme`:

```tsx
const customTheme = {
  paragraph: 'custom-paragraph-class',
  heading: {
    h1: 'custom-h1-class',
    h2: 'custom-h2-class',
    // ...
  },
  // ...
};
```

## Estrutura de Arquivos

```
components/editor/
├── richTextEditor.tsx          # Componente principal
├── plugins/
│   ├── toolbarPluginSimple.tsx # Barra de ferramentas
│   ├── autoLinkPlugin.tsx      # Auto-detecção de links
│   ├── imagePlugin.tsx         # Suporte a imagens
│   ├── videoPlugin.tsx         # Suporte a vídeos
│   └── ...
└── index.ts                    # Exports
```

## Dependências

- `lexical` - Core do editor
- `@lexical/react` - Bindings para React
- `@lexical/rich-text` - Recursos de texto rico
- `@lexical/list` - Suporte a listas
- `@lexical/link` - Suporte a links
- `@lexical/markdown` - Atalhos de Markdown
- `@lexical/history` - Histórico (undo/redo)

## Exemplo Completo

```tsx
'use client';

import { RichTextEditor } from '@/components/editor';
import { useState } from 'react';

export default function BlogEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    console.log('Saving:', { title, content });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <input
          type="text"
          placeholder="Título do artigo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold border-none outline-none"
        />
        
        <RichTextEditor
          initialValue={content}
          onChange={setContent}
          placeholder="Escreva seu artigo aqui..."
          autoFocus
        />
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Salvar Artigo
        </button>
      </div>
    </div>
  );
}
```

## Performance

- **Lazy Loading**: Componentes são carregados sob demanda
- **Debounced Updates**: Atualizações são debounced para melhor performance
- **Virtual DOM**: Usa a renderização eficiente do Lexical
- **Tree Shaking**: Apenas os plugins necessários são incluídos

## Próximos Passos

1. Implementar upload de imagens com preview
2. Adicionar suporte completo a tabelas
3. Criar sistema de plugins customizáveis
4. Adicionar suporte a colaboração em tempo real
5. Implementar auto-save
6. Adicionar contadores de palavras/caracteres

## Teste

Acesse `/editor-test` para testar o editor com todos os recursos disponíveis.
