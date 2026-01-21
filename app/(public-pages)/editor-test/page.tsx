'use client';

import { RichTextEditor } from '@/components/editor';
import { useState } from 'react';

export default function EditorTestPage() {
  const [content, setContent] = useState('');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Rich Text Editor
        </h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Editor Content
            </label>
            <RichTextEditor
              initialValue={content}
              onChange={setContent}
              placeholder="Comece a escrever seu artigo aqui..."
              autoFocus
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Recursos Disponíveis:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Títulos:</strong> H1, H2, H3 através dos botões ou shortcuts (# ## ###)</li>
              <li>• <strong>Formatação:</strong> Negrito (*bold*), Itálico (**italic**), Sublinhado, Riscado</li>
              <li>• <strong>Cor do texto:</strong> Use o botão de paleta para alterar a cor do texto selecionado</li>
              <li>• <strong>Alinhamento:</strong> Alinhar à esquerda, centralizar, alinhar à direita ou justificar</li>
              <li>• <strong>Listas:</strong> Com marcadores e numeradas (- ou 1.)</li>
              <li>• <strong>Citações:</strong> Use o botão ou digite {'>'} no início da linha</li>
              <li>• <strong>Código:</strong> Inline com `backticks` ou blocos com ```</li>
              <li>• <strong>Links:</strong> Automáticos para URLs ou botão de link (digite ou cole URLs)</li>
              <li>• <strong>Imagens:</strong> Use o botão de imagem para inserir por URL</li>
              <li>• <strong>Vídeos:</strong> Use o botão de vídeo para inserir YouTube/Vimeo</li>
              <li>• <strong>Linha horizontal:</strong> Use o botão ou digite --- em linha separada</li>
              <li>• <strong>Importar/Exportar:</strong> Botões na parte inferior para importar (.md, .txt, .html) e exportar (Markdown, HTML)</li>
              <li>• <strong>Atalhos:</strong> Tab/Shift+Tab para indentar listas</li>
            </ul>
          </div>
          
          {content && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Preview do Conteúdo:
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <RichTextEditor
                  initialValue={content}
                  readOnly
                  className="border-0"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
