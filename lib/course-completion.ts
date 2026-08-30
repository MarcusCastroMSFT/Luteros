interface CourseCompletionValues {
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  instructorId: string;
  shortDescription: string;
  thumbnail: string;
  coverImage: string;
  previewVideo: string;
  duration: string;
  isFree: boolean;
  price: string;
}

interface CompletionField {
  label: string;
  filled: boolean;
  weight: number;
}

export interface CourseCompletion {
  percentage: number;
  missingFields: string[];
}

function normalizedScore(fields: CompletionField[], share: number): number {
  const totalWeight = fields.reduce((total, field) => total + field.weight, 0);
  const filledWeight = fields.reduce(
    (total, field) => total + (field.filled ? field.weight : 0),
    0
  );

  return (filledWeight / totalWeight) * share;
}

export function calculateCourseCompletion(values: CourseCompletionValues): CourseCompletion {
  const requiredFields: CompletionField[] = [
    { label: 'Título', filled: !!values.title.trim(), weight: 20 },
    { label: 'Slug (URL)', filled: !!values.slug.trim(), weight: 10 },
    { label: 'Descrição', filled: !!values.description.trim(), weight: 20 },
    { label: 'Categoria', filled: !!values.category, weight: 15 },
    { label: 'Nível', filled: !!values.level, weight: 15 },
    { label: 'Instrutor', filled: !!values.instructorId, weight: 20 },
  ];
  const optionalFields: CompletionField[] = [
    { label: 'Resumo', filled: !!values.shortDescription.trim(), weight: 5 },
    { label: 'Miniatura', filled: !!values.thumbnail, weight: 10 },
    { label: 'Imagem de capa', filled: !!values.coverImage, weight: 5 },
    { label: 'Vídeo de apresentação', filled: !!values.previewVideo, weight: 5 },
    { label: 'Duração', filled: !!values.duration, weight: 5 },
    { label: 'Preço', filled: values.isFree || !!values.price, weight: 5 },
  ];
  const allFields = [...requiredFields, ...optionalFields];

  return {
    percentage: Math.min(
      100,
      Math.round(normalizedScore(requiredFields, 70) + normalizedScore(optionalFields, 30))
    ),
    missingFields: allFields.filter((field) => !field.filled).map((field) => field.label),
  };
}