'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RichTextEditor } from '@/components/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { IconLoader2, IconArrowLeft, IconEye } from '@tabler/icons-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArticleHeader } from '@/components/blog/articleHeader';
import { ArticleContent } from '@/components/blog/articleContent';
import { ImageUpload } from '@/components/common/image-upload';
import { Skeleton } from '@/components/ui/skeleton';
import { RelatedArticlesSelector } from '@/components/articles/related-articles-selector';

interface Author {
  id: string;
  name: string;
  username?: string;
}

const categories = [
  'Educação',
  'Saúde',
  'Relacionamentos',
  'Prevenção',
];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.slug as string;

  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [editorKey, setEditorKey] = useState(0);
  
  // Authors state
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('5');
  const [isPublished, setIsPublished] = useState(false);
  const [accessType, setAccessType] = useState('free');
  const [targetAudience, setTargetAudience] = useState('general');
  const [relatedArticleIds, setRelatedArticleIds] = useState<string[]>([]);

  // Fetch article data and authors in parallel for better performance
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch article raw data and authors in parallel
        const [rawResponse, authorsResponse] = await Promise.all([
          fetch(`/api/articles/${articleId}/raw`),
          fetch('/api/users?pageSize=100')
        ]);
        
        // Handle article data
        if (!rawResponse.ok) {
          throw new Error(`Failed to fetch article: ${rawResponse.status}`);
        }
        
        const rawResult = await rawResponse.json();
        
        if (!rawResult.success || !rawResult.data) {
          throw new Error('Article not found');
        }

        const article = rawResult.data;
        
        // Populate form fields
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt);
        setImage(article.image || '');
        setCategory(article.category);
        setReadTime(article.readTime.toString());
        setIsPublished(article.isPublished);
        setAccessType(article.accessType || 'free');
        setTargetAudience(article.targetAudience || 'general');
        setSelectedAuthorId(article.authorId);
        setContent(article.content);
        setRelatedArticleIds(article.relatedArticleIds || []);
        
        // Force editor to remount with new content
        setEditorKey(prev => prev + 1);
        
        // Handle authors data
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json();
          if (authorsData.data && Array.isArray(authorsData.data)) {
            const authorUsers = authorsData.data.filter((user: Author & { role?: string }) => 
              user.role === 'Administrador' || user.role === 'Instrutor'
            );
            setAuthors(authorUsers);
          }
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        toast.error('Erro ao carregar artigo');
        setError(err instanceof Error ? err.message : 'Erro ao carregar artigo');
      } finally {
        setLoadingArticle(false);
        setLoadingAuthors(false);
      }
    };

    if (articleId) {
      fetchData();
    }
  }, [articleId]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }
    if (!slug.trim()) {
      setError('Slug é obrigatório');
      return;
    }
    if (!excerpt.trim()) {
      setError('Resumo é obrigatório');
      return;
    }
    if (!content.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }
    if (!category) {
      setError('Categoria é obrigatória');
      return;
    }
    if (!selectedAuthorId) {
      setError('Autor é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          image,
          category,
          readTime: parseInt(readTime),
          isPublished,
          accessType,
          targetAudience,
          authorId: selectedAuthorId,
          relatedArticleIds,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao atualizar artigo');
      }

      toast.success('Artigo atualizado com sucesso!');
      router.push('/admin/articles');
    } catch (err) {
      console.error('Error updating article:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar artigo';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingArticle) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Page Header Skeleton */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>

            {/* Form Skeleton */}
            <div className="px-4 lg:px-6">
              <div className="space-y-6 max-w-5xl">
                {/* Title and Slug Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>

                {/* Excerpt and Author Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                {/* Image Upload Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-48 w-full" />
                </div>

                {/* Category and Read Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                {/* Editor Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-[500px] w-full" />
                </div>

                {/* Buttons Skeleton */}
                <div className="flex items-center gap-4 pt-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loadingArticle) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                variant="outline"
                className="mt-4 cursor-pointer"
                onClick={() => router.back()}
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="cursor-pointer"
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="cursor-pointer"
              >
                <IconEye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
              </Button>
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Editar Artigo</h1>
              <p className="text-muted-foreground">
                Atualize as informações do artigo
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-4 lg:px-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Form and Preview Layout */}
          <div className="px-4 lg:px-6">
            <div className={showPreview ? 'grid grid-cols-1 xl:grid-cols-2 gap-8' : ''}>
              {/* Form */}
              <form onSubmit={handleSubmit} className={showPreview ? '' : 'max-w-5xl mx-auto'}>
                <div className="space-y-6">
                {/* Title and Slug Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Título <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Digite o título do artigo"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug (URL) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="url-amigavel-do-artigo"
                      required
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground">
                      URL do artigo: /blog/{slug || 'seu-artigo'}
                    </p>
                  </div>
                </div>

                {/* Excerpt and Author Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">
                      Resumo <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Breve descrição do artigo (usado em listagens e SEO)"
                      rows={3}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Author Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="author">
                      Autor <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedAuthorId}
                      onValueChange={setSelectedAuthorId}
                      disabled={loading || loadingAuthors || authors.length === 0}
                      required
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder={
                          loadingAuthors 
                            ? "Carregando autores..." 
                            : authors.length === 0 
                              ? "Nenhum autor disponível" 
                              : "Selecione um autor"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Nenhum autor encontrado
                          </SelectItem>
                        ) : (
                          authors.map((author) => (
                            <SelectItem key={author.id} value={author.id}>
                              {author.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {!loadingAuthors && authors.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {authors.length} autor(es) disponível(eis)
                      </p>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <ImageUpload
                  value={image}
                  onChange={setImage}
                  label="Imagem de Capa"
                  description="Faça upload de uma imagem ou cole a URL. Recomendado: 1200x630px"
                  aspectRatio={16 / 9}
                  maxSizeMB={5}
                />

                {/* Category and Read Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Categoria <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      disabled={loading}
                      required
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Read Time */}
                  <div className="space-y-2">
                    <Label htmlFor="readTime">
                      Tempo de Leitura (minutos) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="readTime"
                      type="number"
                      min="1"
                      max="60"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label>
                    Conteúdo <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg">
                    <RichTextEditor
                      key={editorKey}
                      initialValue={content}
                      onChange={setContent}
                      placeholder="Escreva o conteúdo do artigo aqui..."
                      autoFocus={false}
                    />
                  </div>
                </div>

                {/* Related Articles */}
                <RelatedArticlesSelector
                  selectedIds={relatedArticleIds}
                  onChange={setRelatedArticleIds}
                  currentArticleId={articleId}
                  disabled={loading}
                  maxSelection={3}
                />

                {/* Access Control */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Access Type */}
                  <div className="space-y-2">
                    <Label htmlFor="accessType">
                      Tipo de Acesso <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={accessType}
                      onValueChange={setAccessType}
                      disabled={loading}
                      required
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Selecione o tipo de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Gratuito</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Artigos pagos requerem assinatura
                    </p>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">
                      Público-Alvo <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={targetAudience}
                      onValueChange={setTargetAudience}
                      disabled={loading}
                      required
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Selecione o público-alvo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Público Geral</SelectItem>
                        <SelectItem value="doctors">Médicos</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Define quem pode visualizar este artigo
                    </p>
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    disabled={loading}
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer">
                    Artigo publicado
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                </div>
                </div>
              </form>

              {/* Live Preview Panel */}
              {showPreview && (
                <div className="hidden xl:block">
                  <div className="sticky top-4 space-y-4">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <IconEye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Preview ao Vivo</span>
                  </div>
                  {!isPublished && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      Rascunho
                    </span>
                  )}
                </div>

                <div className="border rounded-lg bg-background overflow-hidden shadow-sm">
                  <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
                    <div className="max-w-4xl mx-auto p-8">
                      <ArticleHeader
                        title={title || 'Título do Artigo'}
                        excerpt={excerpt || 'O resumo do artigo aparecerá aqui.'}
                        image={image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"%3E%3Crect width="1200" height="600" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23999"%3EImagem de Capa%3C/text%3E%3C/svg%3E'}
                        category={category || 'Categoria'}
                        author={selectedAuthorId ? (authors.find(a => a.id === selectedAuthorId)?.name || 'Autor') : 'Autor'}
                        date={new Date().toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                        readTime={`${readTime || 5} min`}
                        commentCount={0}
                      />

                      <ArticleContent 
                        content={content || '<p style="color: var(--muted-foreground);">O conteúdo do artigo aparecerá aqui...</p>'}
                        className="mt-8"
                      />
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
