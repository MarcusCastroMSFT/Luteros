'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { IconLoader2, IconArrowLeft, IconPlus, IconX, IconEye } from '@tabler/icons-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/common/image-upload';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductPreview } from '@/components/products/productPreview';

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

const categories = [
  'Saúde',
  'Educação',
  'Tecnologia',
  'Alimentação',
  'Bem-estar',
  'Entretenimento',
  'Serviços',
  'Outros',
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  
  // Partners state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [image, setImage] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('10');
  const [discountType, setDiscountType] = useState('percentage');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [availability, setAvailability] = useState('all');
  const [validUntil, setValidUntil] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [howToUse, setHowToUse] = useState<string[]>(['']);
  const [features, setFeatures] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [maxUsages, setMaxUsages] = useState('');

  // Fetch product and partners on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, partnersResponse] = await Promise.all([
          fetch(`/api/products/${productId}?admin=true`),
          fetch('/api/products/partners'),
        ]);

        // Handle partners
        if (partnersResponse.ok) {
          const partnersData = await partnersResponse.json();
          if (partnersData.success && partnersData.data) {
            setPartners(partnersData.data);
          }
        }
        setLoadingPartners(false);

        // Handle product
        if (!productResponse.ok) {
          throw new Error('Produto não encontrado');
        }

        const productData = await productResponse.json();
        if (!productData.success || !productData.data) {
          throw new Error('Produto não encontrado');
        }

        const product = productData.data.product || productData.data;

        // Populate form fields
        setTitle(product.title || '');
        setSlug(product.slug || '');
        setDescription(product.description || '');
        setShortDescription(product.shortDescription || '');
        setImage(product.image || '');
        setPartnerId(product.partner?.id || '');
        setDiscountPercentage(String(product.discount?.percentage || product.discountPercentage || 0));
        setDiscountType(product.discount?.type || product.discountType || 'percentage');
        setOriginalPrice(product.discount?.originalPrice?.toString() || product.originalPrice?.toString() || '');
        setDiscountedPrice(product.discount?.discountedPrice?.toString() || product.discountedPrice?.toString() || '');
        setPromoCode(product.promoCode || '');
        setCategory(product.category || '');
        setTags(product.tags || []);
        setAvailability(product.availability || 'all');
        setValidUntil(product.validUntil ? product.validUntil.split('T')[0] : '');
        setTermsAndConditions(product.termsAndConditions || '');
        setHowToUse(product.howToUse?.length > 0 ? product.howToUse : ['']);
        setFeatures(product.features?.length > 0 ? product.features : ['']);
        setIsActive(product.isActive ?? true);
        setIsFeatured(product.isFeatured ?? false);
        setMaxUsages(product.maxUsages?.toString() || '');

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
        toast.error('Erro ao carregar produto');
      } finally {
        setLoadingProduct(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Calculate discounted price when original price or discount changes
  useEffect(() => {
    if (originalPrice && discountPercentage) {
      const original = parseFloat(originalPrice);
      const discount = parseFloat(discountPercentage);
      if (!isNaN(original) && !isNaN(discount)) {
        const discounted = original * (1 - discount / 100);
        setDiscountedPrice(discounted.toFixed(2));
      }
    }
  }, [originalPrice, discountPercentage]);

  // Handle tags
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle how to use steps
  const addHowToUseStep = () => {
    setHowToUse([...howToUse, '']);
  };

  const updateHowToUseStep = (index: number, value: string) => {
    const newSteps = [...howToUse];
    newSteps[index] = value;
    setHowToUse(newSteps);
  };

  const removeHowToUseStep = (index: number) => {
    if (howToUse.length > 1) {
      setHowToUse(howToUse.filter((_, i) => i !== index));
    }
  };

  // Handle features
  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

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
    if (!shortDescription.trim()) {
      setError('Descrição curta é obrigatória');
      return;
    }
    if (!description.trim()) {
      setError('Descrição é obrigatória');
      return;
    }
    if (!partnerId) {
      setError('Parceiro é obrigatório');
      return;
    }
    if (!promoCode.trim()) {
      setError('Código promocional é obrigatório');
      return;
    }
    if (!category) {
      setError('Categoria é obrigatória');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          shortDescription,
          image,
          partnerId,
          discountPercentage: parseInt(discountPercentage) || 0,
          discountType,
          originalPrice: originalPrice || null,
          discountedPrice: discountedPrice || null,
          promoCode,
          category,
          tags,
          availability,
          validUntil: validUntil || null,
          termsAndConditions,
          howToUse: howToUse.filter(step => step.trim()),
          features: features.filter(feature => feature.trim()),
          isActive,
          isFeatured,
          maxUsages: maxUsages ? parseInt(maxUsages) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao atualizar produto');
      }

      toast.success('Produto atualizado com sucesso!');
      router.push('/dashboard/products');
    } catch (err) {
      console.error('Error updating product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Skeleton className="h-10 w-24 mb-6" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="px-4 lg:px-6 space-y-6">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-32 w-full max-w-2xl" />
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
              <h1 className="text-2xl font-semibold tracking-tight">Editar Produto</h1>
              <p className="text-muted-foreground">
                Atualize as informações do produto
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

          {/* Form and Preview Grid */}
          <div className={`px-4 lg:px-6 ${showPreview ? 'grid grid-cols-1 xl:grid-cols-2 gap-8' : ''}`}>
            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Informações Básicas</h2>
                
                {/* Title and Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Título <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nome do produto ou oferta"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug (URL) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="url-do-produto"
                      required
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground">
                      URL: /products/{slug || 'seu-produto'}
                    </p>
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">
                    Descrição Curta <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Breve descrição (usado em cards e listagens)"
                    rows={2}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Full Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descrição Completa <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição detalhada do produto ou oferta"
                    rows={4}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Image */}
                <ImageUpload
                  value={image}
                  onChange={setImage}
                  label="Imagem do Produto"
                  description="Upload ou URL da imagem. Recomendado: 800x600px"
                  aspectRatio={4 / 3}
                  maxSizeMB={2}
                />

                {/* Partner and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="partner">
                      Parceiro <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={partnerId}
                      onValueChange={setPartnerId}
                      disabled={loading || loadingPartners}
                      required
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder={
                          loadingPartners 
                            ? "Carregando parceiros..." 
                            : partners.length === 0 
                              ? "Nenhum parceiro disponível" 
                              : "Selecione um parceiro"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                </div>
              </div>

              {/* Discount Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Desconto e Código Promocional</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">
                      Desconto (%) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="99.90"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountedPrice">Preço com Desconto (R$)</Label>
                    <Input
                      id="discountedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountedPrice}
                      onChange={(e) => setDiscountedPrice(e.target.value)}
                      placeholder="Calculado automaticamente"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="promoCode">
                      Código Promocional <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="CODIGO10"
                      required
                      disabled={loading}
                      className="uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Válido Até</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUsages">Limite de Usos (opcional)</Label>
                  <Input
                    id="maxUsages"
                    type="number"
                    min="0"
                    value={maxUsages}
                    onChange={(e) => setMaxUsages(e.target.value)}
                    placeholder="Deixe vazio para ilimitado"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Funcionalidades</h2>
                
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Funcionalidade ${index + 1}`}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        disabled={loading || features.length === 1}
                        className="cursor-pointer shrink-0"
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Adicionar Funcionalidade
                  </Button>
                </div>
              </div>

              {/* How to Use Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Como Usar</h2>
                
                <div className="space-y-3">
                  {howToUse.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="flex items-center justify-center w-8 h-10 bg-muted rounded text-sm font-medium shrink-0">
                        {index + 1}
                      </span>
                      <Input
                        value={step}
                        onChange={(e) => updateHowToUseStep(index, e.target.value)}
                        placeholder={`Passo ${index + 1}`}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeHowToUseStep(index)}
                        disabled={loading || howToUse.length === 1}
                        className="cursor-pointer shrink-0"
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHowToUseStep}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Adicionar Passo
                  </Button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium border-b pb-2">Tags</h2>
                
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Adicionar tag"
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium border-b pb-2">Termos e Condições</h2>
                
                <Textarea
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder="Termos e condições de uso do desconto..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Access and Status Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Acesso e Status</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Disponibilidade</Label>
                    <Select
                      value={availability}
                      onValueChange={setAvailability}
                      disabled={loading}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Usuários</SelectItem>
                        <SelectItem value="members">Somente Membros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      disabled={loading}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Produto ativo
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                      disabled={loading}
                    />
                    <Label htmlFor="isFeatured" className="cursor-pointer">
                      Destacar produto
                    </Label>
                  </div>
                </div>
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
            </form>

            {/* Preview Panel */}
            {showPreview && (
              <div className="xl:sticky xl:top-6 self-start">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <IconEye className="h-5 w-5" />
                    Preview do Produto
                  </h3>
                  <ProductPreview
                    title={title || 'Título do Produto'}
                    shortDescription={shortDescription || 'Descrição curta do produto'}
                    description={description || 'Descrição completa do produto...'}
                    image={image}
                    partnerName={partners.find(p => p.id === partnerId)?.name || 'Parceiro'}
                    partnerLogo={partners.find(p => p.id === partnerId)?.logo || undefined}
                    discountPercentage={parseInt(discountPercentage) || 0}
                    originalPrice={originalPrice || undefined}
                    discountedPrice={discountedPrice || undefined}
                    promoCode={promoCode || 'CODIGO'}
                    category={category || 'Categoria'}
                    tags={tags}
                    availability={availability}
                    validUntil={validUntil || undefined}
                    features={features.filter(f => f.trim())}
                    howToUse={howToUse.filter(h => h.trim())}
                    termsAndConditions={termsAndConditions}
                    isActive={isActive}
                    isFeatured={isFeatured}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
