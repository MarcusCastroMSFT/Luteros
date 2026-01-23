'use client';

import { useState } from 'react';
import { X, User, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CommunityPost } from '@/types/community';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: CommunityPost) => void;
  selectedCategory?: string;
}

const categories = [
  { value: 'Gravidez', label: 'Gravidez' },
  { value: 'Pós-parto', label: 'Pós-parto' },
  { value: 'Suporte Contínuo', label: 'Suporte Contínuo' },
  { value: 'Paternidade', label: 'Paternidade' },
  { value: 'Fertilidade', label: 'Fertilidade' },
  { value: 'Menopausa', label: 'Menopausa' },
];

const subcategoriesByCategory: Record<string, string[]> = {
  'Gravidez': ['Primeiro trimestre', 'Segundo trimestre', 'Terceiro trimestre', 'Grupos por mês de nascimento'],
  'Pós-parto': ['Amamentação', 'Saúde mental', 'Recuperação física', 'Cuidados com o bebê'],
  'Suporte Contínuo': ['Perda gestacional', 'Saúde geral', 'Geral'],
  'Paternidade': ['Paternidade e pediatria', 'Participação no parto', 'Apoio emocional'],
  'Fertilidade': ['TTC e fertilidade', 'Tratamento de fertilidade', 'Adoção e barriga de aluguel'],
  'Menopausa': ['Menopausa', 'Sintomas', 'Tratamentos'],
};

export function CreatePostDialog({ isOpen, onClose, onPostCreated, selectedCategory }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(selectedCategory || '');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubcategories = category ? subcategoriesByCategory[category] || [] : [];

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category) {
      toast.error('Preencha todos os campos obrigatórios', {
        description: 'Título, conteúdo e categoria são obrigatórios.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          subcategory: subcategory || null,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          isAnonymous,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Faça login para criar posts', {
            description: 'Você precisa estar logado para criar posts na comunidade.',
          });
        } else {
          toast.error('Erro ao criar post', {
            description: 'Tente novamente mais tarde.',
          });
        }
        return;
      }

      const data = await response.json();
      
      toast.success('Post criado com sucesso!', {
        description: isAnonymous ? 'Seu post foi publicado anonimamente.' : 'Seu post foi publicado.',
      });

      onPostCreated(data.post);
      handleClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Erro ao criar post', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setCategory(selectedCategory || '');
    setSubcategory('');
    setTags('');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Criar novo post
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Compartilhe sua experiência ou faça uma pergunta para a comunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Anonymous toggle */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Publicar como:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  !isAnonymous
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <User size={16} />
                Você
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isAnonymous
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <UserX size={16} />
                Anônimo
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título para seu post..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {title.length}/200
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Conteúdo *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compartilhe sua experiência, dúvida ou conselho..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              maxLength={5000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/5000
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Subcategoria
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={!category || availableSubcategories.length === 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Selecione...</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tags (opcional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="gravidez, primeiro-trimestre, dúvidas (separadas por vírgula)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">
              Adicione tags para ajudar outros a encontrar seu post
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim() || !category}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
