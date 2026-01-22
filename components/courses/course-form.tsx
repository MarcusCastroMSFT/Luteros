'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  IconLoader2, 
  IconArrowLeft, 
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconCurrencyReal,
  IconVideo,
  IconPhoto,
} from '@tabler/icons-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/common/image-upload';
import { LessonsPanel } from '@/components/courses/lessons-panel';
import { cn } from '@/lib/utils';

interface Instructor {
  id: string;
  name: string;
  username?: string;
}

interface CourseData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  coverImage: string;
  previewVideo: string;
  category: string;
  level: string;
  language: string;
  duration: string;
  price: string;
  discountPrice: string;
  isFree: boolean;
  isPublished: boolean;
  instructorId: string;
}

interface CourseFormProps {
  mode: 'create' | 'edit';
  courseId?: string;
  initialData?: Partial<CourseData>;
}

const categories = [
  'Educação Sexual',
  'Saúde Reprodutiva',
  'Relacionamentos',
  'Prevenção',
  'Saúde da Mulher',
  'Saúde do Homem',
  'Parentalidade',
];

const levels = [
  { value: 'Iniciante', label: 'Iniciante', description: 'Sem conhecimento prévio necessário' },
  { value: 'Intermediário', label: 'Intermediário', description: 'Requer conhecimentos básicos' },
  { value: 'Avançado', label: 'Avançado', description: 'Para profissionais ou especialistas' },
];

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
];

// Map database level values to display values
const levelDisplayMap: Record<string, string> = {
  'BEGINNER': 'Iniciante',
  'INTERMEDIATE': 'Intermediário',
  'ADVANCED': 'Avançado',
};

// Character limits
const LIMITS = {
  title: 100,
  shortDescription: 200,
  description: 5000,
  slug: 100,
};

// Form validation helper
interface ValidationError {
  field: string;
  message: string;
}

// Field labels for error messages
const fieldLabels: Record<string, string> = {
  title: 'Título',
  slug: 'Slug (URL)',
  description: 'Descrição',
  category: 'Categoria',
  level: 'Nível',
  instructor: 'Instrutor',
  price: 'Preço',
  discountPrice: 'Preço promocional',
  previewVideo: 'Vídeo de apresentação',
};

export function CourseForm({ mode, courseId, initialData }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  // Instructors state
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [selectedInstructorId, setSelectedInstructorId] = useState(initialData?.instructorId || '');
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [previewVideo, setPreviewVideo] = useState(initialData?.previewVideo || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [level, setLevel] = useState(initialData?.level ? (levelDisplayMap[initialData.level] || initialData.level) : '');
  const [language, setLanguage] = useState(initialData?.language || 'pt-BR');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [discountPrice, setDiscountPrice] = useState(initialData?.discountPrice || '');
  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);

  // Calculate form completion percentage
  const calculateCompletion = useCallback(() => {
    const requiredFields = [
      { filled: !!title.trim(), weight: 20 },
      { filled: !!slug.trim(), weight: 10 },
      { filled: !!description.trim(), weight: 20 },
      { filled: !!category, weight: 15 },
      { filled: !!level, weight: 15 },
      { filled: !!selectedInstructorId, weight: 20 },
    ];
    
    const optionalFields = [
      { filled: !!shortDescription.trim(), weight: 5 },
      { filled: !!thumbnail, weight: 10 },
      { filled: !!coverImage, weight: 5 },
      { filled: !!previewVideo, weight: 5 },
      { filled: !!duration, weight: 5 },
      { filled: isFree || !!price, weight: 5 },
    ];

    const requiredScore = requiredFields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
    const optionalScore = optionalFields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
    
    // Required fields count for 70%, optional for 30%
    return Math.min(100, Math.round((requiredScore * 0.7) + (optionalScore * 0.3)));
  }, [title, slug, description, category, level, selectedInstructorId, shortDescription, thumbnail, coverImage, previewVideo, duration, isFree, price]);

  const completion = calculateCompletion();

  // Fetch instructors on component mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch('/api/users?pageSize=100');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          const instructorUsers = data.data.filter((user: Instructor & { role?: string }) => 
            user.role === 'Administrador' || user.role === 'Instrutor'
          );
          
          setInstructors(instructorUsers);
          
          // Only auto-select first instructor in create mode if none selected
          if (mode === 'create' && instructorUsers.length > 0 && !selectedInstructorId) {
            setSelectedInstructorId(instructorUsers[0].id);
          }
        } else {
          toast.error('Formato de dados inesperado ao carregar instrutores');
        }
      } catch (err) {
        console.error('Error fetching instructors:', err);
        toast.error('Erro ao carregar instrutores');
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, [mode, selectedInstructorId]);

  // Auto-generate slug from title
  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    
    // Only auto-generate slug if it hasn't been manually edited
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
    
    // Clear title error if exists
    setErrors(prev => prev.filter(e => e.field !== 'title'));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
    setErrors(prev => prev.filter(e => e.field !== 'slug'));
  };

  // Format price for display
  const formatPriceInput = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  // Validate form - isDraft=true means minimal validation (only format checks, not required fields)
  const validateForm = (isDraft: boolean = false): boolean => {
    const newErrors: ValidationError[] = [];
    
    // For drafts, we only need a title. For publish, we need all required fields.
    if (!title.trim()) {
      newErrors.push({ field: 'title', message: 'Título é obrigatório' });
    } else if (title.length > LIMITS.title) {
      newErrors.push({ field: 'title', message: `Título deve ter no máximo ${LIMITS.title} caracteres` });
    }
    
    // Slug validation - required for both draft and publish if title exists
    if (title.trim() && !slug.trim()) {
      newErrors.push({ field: 'slug', message: 'Slug é obrigatório' });
    } else if (slug.trim() && !/^[a-z0-9-]+$/.test(slug)) {
      newErrors.push({ field: 'slug', message: 'Slug deve conter apenas letras minúsculas, números e hífens' });
    }
    
    // Description validation - only required for publish
    if (!isDraft) {
      if (!description.trim()) {
        newErrors.push({ field: 'description', message: 'Descrição é obrigatória para publicar' });
      } else if (description.length < 50) {
        newErrors.push({ field: 'description', message: 'Descrição deve ter pelo menos 50 caracteres' });
      }
    } else if (description.trim() && description.length < 50) {
      // For drafts, only validate if user started typing
      newErrors.push({ field: 'description', message: 'Descrição deve ter pelo menos 50 caracteres' });
    }
    
    // Category and Level - only required for publish
    if (!isDraft) {
      if (!category) {
        newErrors.push({ field: 'category', message: 'Categoria é obrigatória para publicar' });
      }
      
      if (!level) {
        newErrors.push({ field: 'level', message: 'Nível é obrigatório para publicar' });
      }
      
      if (!selectedInstructorId) {
        newErrors.push({ field: 'instructor', message: 'Instrutor é obrigatório para publicar' });
      }
    }
    
    // Price validation - always validate format if entered
    if (!isFree && price) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.push({ field: 'price', message: 'Preço inválido' });
      }
      if (discountPrice) {
        const discountNum = parseFloat(discountPrice);
        if (isNaN(discountNum) || discountNum < 0) {
          newErrors.push({ field: 'discountPrice', message: 'Preço promocional inválido' });
        }
        if (discountNum >= priceNum) {
          newErrors.push({ field: 'discountPrice', message: 'Preço promocional deve ser menor que o preço original' });
        }
      }
    }

    // Video URL validation - always validate format if entered
    if (previewVideo && !isValidVideoUrl(previewVideo)) {
      newErrors.push({ field: 'previewVideo', message: 'URL de vídeo inválida. Use YouTube ou Vimeo.' });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Check if URL is a valid video URL
  const isValidVideoUrl = (url: string): boolean => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  // Get field error
  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };

  // Submit handler
  const handleSubmit = async (publish: boolean = false) => {
    const isDraft = !publish;
    
    // For edit mode, use isPublished state if not explicitly publishing
    const shouldPublish = mode === 'edit' ? (publish ? true : isPublished) : publish;
    const validationIsDraft = mode === 'edit' ? !shouldPublish : isDraft;
    
    if (!validateForm(validationIsDraft)) {
      // Get the first error to show a specific message
      const firstError = errors.length > 0 ? errors[0] : null;
      
      if (firstError) {
        const fieldLabel = fieldLabels[firstError.field] || firstError.field;
        toast.error(`${fieldLabel}: ${firstError.message}`);
      } else {
        toast.error('Por favor, corrija os erros no formulário');
      }
      
      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = errors[0]?.field;
        if (firstErrorField) {
          document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    if (publish || (mode === 'edit' && shouldPublish)) {
      setLoading(true);
    } else {
      setSavingDraft(true);
    }

    try {
      const url = mode === 'edit' ? `/api/courses/${courseId}` : '/api/courses';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim(),
          shortDescription: shortDescription.trim() || null,
          thumbnail: thumbnail || null,
          coverImage: coverImage || null,
          previewVideo: previewVideo || null,
          category,
          level,
          language,
          duration: duration ? parseInt(duration) : null,
          price: isFree ? null : (price ? parseFloat(price) : null),
          discountPrice: isFree ? null : (discountPrice ? parseFloat(discountPrice) : null),
          isFree,
          isPublished: shouldPublish,
          instructorId: selectedInstructorId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} curso`);
      }

      if (mode === 'edit') {
        toast.success('Curso atualizado com sucesso!');
      } else {
        toast.success(publish ? 'Curso publicado com sucesso!' : 'Rascunho salvo com sucesso!');
      }
      router.push('/dashboard/courses');
    } catch (err) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} course:`, err);
      const errorMessage = err instanceof Error ? err.message : `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} curso`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  // Character counter component
  const CharacterCounter = ({ current, max, className }: { current: number; max: number; className?: string }) => {
    const percentage = (current / max) * 100;
    const isWarning = percentage > 80;
    const isError = percentage > 100;
    
    return (
      <span className={cn(
        "text-xs",
        isError ? "text-destructive" : isWarning ? "text-amber-500" : "text-muted-foreground",
        className
      )}>
        {current}/{max}
      </span>
    );
  };

  const pageTitle = mode === 'edit' ? 'Editar Curso' : 'Novo Curso';
  const pageDescription = mode === 'edit' ? 'Atualize as informações do curso' : 'Crie um novo curso para a plataforma';

  return (
    <div className="flex flex-1 flex-col">
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between max-w-4xl">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="cursor-pointer"
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {completion < 70 ? 'Preencha os campos obrigatórios' : 'Pronto para publicar'}
                </p>
              </div>
            </div>
            
            {/* Completion Progress */}
            <div className="flex items-center gap-3">
              {/* Linear progress bar for mobile */}
              <div className="flex sm:hidden items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      completion >= 70 ? "bg-green-500" : "bg-primary"
                    )}
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{completion}%</span>
              </div>
              
              {/* Circular progress for desktop */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{completion}% completo</p>
                </div>
                <div className="w-12 h-12 relative">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={125.66}
                      strokeDashoffset={125.66 - (completion / 100) * 125.66}
                      className={cn(
                        "transition-all duration-500",
                        completion >= 70 ? "text-green-500" : "text-primary"
                      )}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                    {completion >= 100 ? <IconCheck className="h-4 w-4 text-green-500" /> : `${completion}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Description */}
          <div className="px-4 lg:px-6">
            <p className="text-muted-foreground">
              {pageDescription}
            </p>
          </div>

          {/* Form with optional Lessons Panel */}
          <div className="px-4 lg:px-6">
            <div className={cn(
              "flex gap-6",
              mode === 'edit' && courseId ? "flex-col lg:flex-row" : ""
            )}>
              {/* Left Column - Course Form */}
              <div className={cn(
                mode === 'edit' && courseId ? "w-full lg:w-1/2 min-w-0" : "max-w-4xl"
              )}>
                {/* Global Error Alert */}
                {errors.length > 0 && (
                  <Alert variant="destructive" className="mb-6">
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex flex-col gap-1">
                      <span className="font-medium">
                        Por favor, corrija {errors.length} {errors.length === 1 ? 'erro' : 'erros'} no formulário antes de continuar:
                      </span>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {errors.map((error, index) => (
                          <li key={index}>
                            <button 
                              type="button"
                              onClick={() => document.getElementById(error.field)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                              className="text-left hover:underline cursor-pointer"
                            >
                              <span className="font-medium">
                                {fieldLabels[error.field] || error.field}
                              </span>: {error.message}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>
                      Informações essenciais sobre o curso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="flex items-center gap-1">
                          Título <span className="text-destructive">*</span>
                        </Label>
                        <CharacterCounter current={title.length} max={LIMITS.title} />
                      </div>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Ex: Educação Sexual Completa para Iniciantes"
                        className={cn(getFieldError('title') && "border-destructive")}
                        maxLength={LIMITS.title + 20}
                      />
                      {getFieldError('title') ? (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <IconAlertCircle className="h-3 w-3" />
                          {getFieldError('title')}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Um título claro e descritivo ajuda os alunos a encontrar seu curso
                        </p>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="slug" className="flex items-center gap-1">
                          Slug (URL) <span className="text-destructive">*</span>
                        </Label>
                        <CharacterCounter current={slug.length} max={LIMITS.slug} />
                      </div>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          /courses/
                        </span>
                        <Input
                          id="slug"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          placeholder="educacao-sexual-completa"
                          className={cn(
                            "rounded-l-none",
                            getFieldError('slug') && "border-destructive"
                          )}
                        />
                      </div>
                      {getFieldError('slug') ? (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <IconAlertCircle className="h-3 w-3" />
                          {getFieldError('slug')}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          URL amigável do curso. Use apenas letras minúsculas, números e hífens.
                        </p>
                      )}
                    </div>

                    {/* Short Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shortDescription">Resumo</Label>
                        <CharacterCounter current={shortDescription.length} max={LIMITS.shortDescription} />
                      </div>
                      <Textarea
                        id="shortDescription"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Breve descrição do curso exibida em cards e listagens"
                        rows={2}
                        maxLength={LIMITS.shortDescription + 50}
                      />
                      <p className="text-sm text-muted-foreground">
                        Aparece nos cards de listagem. Seja conciso e atraente.
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description" className="flex items-center gap-1">
                          Descrição <span className="text-destructive">*</span>
                        </Label>
                        <CharacterCounter current={description.length} max={LIMITS.description} />
                      </div>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setErrors(prev => prev.filter(e => e.field !== 'description'));
                        }}
                        placeholder="Descrição detalhada do curso. Explique o que os alunos aprenderão, metodologia, pré-requisitos, etc."
                        rows={6}
                        className={cn(getFieldError('description') && "border-destructive")}
                      />
                      {getFieldError('description') ? (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <IconAlertCircle className="h-3 w-3" />
                          {getFieldError('description')}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Descreva em detalhes o conteúdo, metodologia e o que torna este curso especial.
                          Mínimo de 50 caracteres.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Classification */}
                <Card>
                  <CardHeader>
                    <CardTitle>Classificação</CardTitle>
                    <CardDescription>
                      Defina a categoria, nível e idioma do curso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category" className="flex items-center gap-1">
                          Categoria <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                          value={category} 
                          onValueChange={(value) => {
                            setCategory(value);
                            setErrors(prev => prev.filter(e => e.field !== 'category'));
                          }}
                        >
                          <SelectTrigger id="category" className={cn(getFieldError('category') && "border-destructive")}>
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
                        {getFieldError('category') && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <IconAlertCircle className="h-3 w-3" />
                            {getFieldError('category')}
                          </p>
                        )}
                      </div>

                      {/* Level */}
                      <div className="space-y-2">
                        <Label htmlFor="level" className="flex items-center gap-1">
                          Nível <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                          value={level} 
                          onValueChange={(value) => {
                            setLevel(value);
                            setErrors(prev => prev.filter(e => e.field !== 'level'));
                          }}
                        >
                          <SelectTrigger id="level" className={cn(getFieldError('level') && "border-destructive")}>
                            <SelectValue placeholder="Selecione um nível" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.map((lvl) => (
                              <SelectItem key={lvl.value} value={lvl.value}>
                                <div className="flex flex-col">
                                  <span>{lvl.label}</span>
                                  <span className="text-xs text-muted-foreground">{lvl.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getFieldError('level') && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <IconAlertCircle className="h-3 w-3" />
                            {getFieldError('level')}
                          </p>
                        )}
                      </div>

                      {/* Language */}
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                <span className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração estimada (minutos)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="0"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="Ex: 120 (2 horas)"
                        />
                        <p className="text-sm text-muted-foreground">
                          {duration && parseInt(duration) > 0 
                            ? `≈ ${Math.floor(parseInt(duration) / 60)}h ${parseInt(duration) % 60}min`
                            : 'Tempo total estimado do curso'
                          }
                        </p>
                      </div>

                      {/* Instructor */}
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="instructor" className="flex items-center gap-1">
                          Instrutor <span className="text-destructive">*</span>
                        </Label>
                        {loadingInstructors ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select 
                            value={selectedInstructorId} 
                            onValueChange={(value) => {
                              setSelectedInstructorId(value);
                              setErrors(prev => prev.filter(e => e.field !== 'instructor'));
                            }}
                          >
                            <SelectTrigger id="instructor" className={cn(getFieldError('instructor') && "border-destructive")}>
                              <SelectValue placeholder="Selecione um instrutor" />
                            </SelectTrigger>
                            <SelectContent>
                              {instructors.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  Nenhum instrutor disponível
                                </SelectItem>
                              ) : (
                                instructors.map((instructor) => (
                                  <SelectItem key={instructor.id} value={instructor.id}>
                                    {instructor.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {getFieldError('instructor') && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <IconAlertCircle className="h-3 w-3" />
                            {getFieldError('instructor')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Media */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconPhoto className="h-5 w-5" />
                      Mídia
                    </CardTitle>
                    <CardDescription>
                      Imagens e vídeo de apresentação do curso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Thumbnail */}
                      <div className="space-y-2">
                        <Label>Thumbnail</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Imagem principal exibida nos cards (recomendado: 16:9)
                        </p>
                        <ImageUpload
                          value={thumbnail}
                          onChange={setThumbnail}
                        />
                      </div>

                      {/* Cover Image */}
                      <div className="space-y-2">
                        <Label>Imagem de Capa</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Imagem da página do curso (recomendado: 16:9)
                        </p>
                        <ImageUpload
                          value={coverImage}
                          onChange={setCoverImage}
                        />
                      </div>
                    </div>

                    {/* Preview Video */}
                    <div className="space-y-2">
                      <Label htmlFor="previewVideo" className="flex items-center gap-2">
                        <IconVideo className="h-4 w-4" />
                        Vídeo de Preview
                      </Label>
                      <Input
                        id="previewVideo"
                        value={previewVideo}
                        onChange={(e) => {
                          setPreviewVideo(e.target.value);
                          setErrors(prev => prev.filter(e => e.field !== 'previewVideo'));
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={cn(getFieldError('previewVideo') && "border-destructive")}
                      />
                      {getFieldError('previewVideo') ? (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <IconAlertCircle className="h-3 w-3" />
                          {getFieldError('previewVideo')}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <IconInfoCircle className="h-3 w-3" />
                          Cole a URL do YouTube ou Vimeo. Este vídeo é público para todos os visitantes.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCurrencyReal className="h-5 w-5" />
                      Preço
                    </CardTitle>
                    <CardDescription>
                      Configure o modelo de precificação do curso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Free Course Toggle */}
                    <label
                      htmlFor="isFree"
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-base font-medium">
                          Curso Gratuito
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Disponibilize este curso gratuitamente para todos os usuários
                        </p>
                      </div>
                      <Switch
                        id="isFree"
                        checked={isFree}
                        onCheckedChange={setIsFree}
                        className="cursor-pointer"
                      />
                    </label>

                    {!isFree && (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* Price */}
                        <div className="space-y-2">
                          <Label htmlFor="price">Preço</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              R$
                            </span>
                            <Input
                              id="price"
                              type="text"
                              inputMode="decimal"
                              value={price}
                              onChange={(e) => {
                                setPrice(formatPriceInput(e.target.value));
                                setErrors(prev => prev.filter(e => e.field !== 'price'));
                              }}
                              placeholder="0.00"
                              className={cn("pl-10", getFieldError('price') && "border-destructive")}
                            />
                          </div>
                          {getFieldError('price') && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <IconAlertCircle className="h-3 w-3" />
                              {getFieldError('price')}
                            </p>
                          )}
                        </div>

                        {/* Discount Price */}
                        <div className="space-y-2">
                          <Label htmlFor="discountPrice" className="flex items-center gap-2">
                            Preço Promocional
                            {discountPrice && price && parseFloat(discountPrice) < parseFloat(price) && (
                              <Badge variant="secondary" className="text-xs">
                                {Math.round((1 - parseFloat(discountPrice) / parseFloat(price)) * 100)}% OFF
                              </Badge>
                            )}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              R$
                            </span>
                            <Input
                              id="discountPrice"
                              type="text"
                              inputMode="decimal"
                              value={discountPrice}
                              onChange={(e) => {
                                setDiscountPrice(formatPriceInput(e.target.value));
                                setErrors(prev => prev.filter(e => e.field !== 'discountPrice'));
                              }}
                              placeholder="0.00"
                              className={cn("pl-10", getFieldError('discountPrice') && "border-destructive")}
                            />
                          </div>
                          {getFieldError('discountPrice') ? (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <IconAlertCircle className="h-3 w-3" />
                              {getFieldError('discountPrice')}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Opcional. Deixe em branco se não houver promoção.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Publishing (only for edit mode) */}
                {mode === 'edit' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Publicação</CardTitle>
                      <CardDescription>
                        Controle a visibilidade do curso
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <label
                        htmlFor="isPublished"
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="text-base font-medium">
                            Publicar curso
                          </span>
                          <p className="text-sm text-muted-foreground">
                            Se desativado, o curso será salvo como rascunho e não será visível para os alunos.
                          </p>
                        </div>
                        <Switch
                          id="isPublished"
                          checked={isPublished}
                          onCheckedChange={setIsPublished}
                          className="cursor-pointer"
                        />
                      </label>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-medium">Pronto para salvar?</p>
                        <p className="text-sm text-muted-foreground">
                          {mode === 'edit' 
                            ? 'Salve suas alterações ou cancele para voltar.'
                            : 'Você pode salvar como rascunho ou publicar diretamente.'
                          }
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.back()}
                          disabled={loading || savingDraft}
                          className="cursor-pointer"
                        >
                          Cancelar
                        </Button>
                        {mode === 'create' && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleSubmit(false)}
                            disabled={loading || savingDraft}
                            className="cursor-pointer"
                          >
                            {savingDraft ? (
                              <>
                                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar Rascunho'
                            )}
                          </Button>
                        )}
                        <Button
                          type="button"
                          onClick={() => handleSubmit(mode === 'create' ? true : false)}
                          disabled={loading || savingDraft || (mode === 'create' && completion < 70)}
                          className="cursor-pointer"
                        >
                          {loading || (mode === 'edit' && savingDraft) ? (
                            <>
                              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                              {mode === 'edit' ? 'Salvando...' : 'Publicando...'}
                            </>
                          ) : (
                            mode === 'edit' ? 'Salvar Alterações' : 'Publicar Curso'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              </div>

              {/* Right Column - Lessons Panel (Edit mode only) */}
              {mode === 'edit' && courseId && (
                <div className="w-full lg:w-1/2 lg:sticky lg:top-20 lg:self-start lg:h-[calc(100vh-6rem)]">
                  <LessonsPanel courseId={courseId} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
