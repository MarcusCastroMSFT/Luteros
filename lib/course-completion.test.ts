import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCourseCompletion } from './course-completion';

const completeCourse = {
  title: 'Curso Marcus',
  slug: 'curso-marcus',
  description: 'Descrição completa',
  category: 'Educação Sexual',
  level: 'Iniciante',
  instructorId: 'instructor-id',
  shortDescription: 'Resumo',
  thumbnail: 'thumbnail.jpg',
  coverImage: 'cover.jpg',
  previewVideo: 'https://youtube.com/watch?v=video',
  duration: '60',
  isFree: false,
  price: '99.90',
};

test('returns 100 percent when every completion field is filled', () => {
  assert.deepEqual(calculateCourseCompletion(completeCourse), {
    percentage: 100,
    missingFields: [],
  });
});

test('lists missing fields and normalizes optional fields to 30 percent', () => {
  const result = calculateCourseCompletion({
    ...completeCourse,
    coverImage: '',
    previewVideo: '',
  });

  assert.equal(result.percentage, 91);
  assert.deepEqual(result.missingFields, ['Imagem de capa', 'Vídeo de apresentação']);
});

test('considers price complete when the course is free', () => {
  const result = calculateCourseCompletion({
    ...completeCourse,
    isFree: true,
    price: '',
  });

  assert.equal(result.percentage, 100);
  assert.deepEqual(result.missingFields, []);
});