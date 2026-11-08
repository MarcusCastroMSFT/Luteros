import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  renderAccountWelcomeEmail,
  renderAdminContactEmail,
  renderAdminSaleEmail,
  renderCourseEnrollmentEmail,
  renderCourseRefundEmail,
  renderWaitlistConfirmationEmail,
} from './notification-emails'

test('account welcome greets by first name and points to courses', () => {
  const { subject, html, text } = renderAccountWelcomeEmail({
    name: 'Ana Souza',
    coursesUrl: 'https://www.lutteros.com.br/courses',
    articlesUrl: 'https://www.lutteros.com.br/articles',
    myCoursesUrl: 'https://www.lutteros.com.br/courses/my-courses',
  })
  assert.match(subject, /Bem-vindo/)
  assert.match(html, /Olá, Ana/)
  assert.ok(html.includes('https://www.lutteros.com.br/courses') && text.includes('/courses/my-courses'))
  assert.ok(!html.includes('{{'))
})

test('enrollment e-mail links straight to the lessons', () => {
  const url = 'https://www.lutteros.com.br/courses/x/lessons'
  const { subject, html, text } = renderCourseEnrollmentEmail({
    name: 'Ana Souza',
    courseTitle: 'Curso X',
    courseUrl: url,
    myCoursesUrl: 'https://www.lutteros.com.br/courses/my-courses',
  })
  assert.match(subject, /Matrícula confirmada/)
  assert.ok(html.includes(url) && text.includes(url))
  assert.match(html, /Olá, Ana/)
})

test('refund e-mail states the amount and that access ended', () => {
  const { subject, html, text } = renderCourseRefundEmail({
    name: null,
    courseTitle: 'Curso X',
    amount: 147.5,
    coursesUrl: 'https://www.lutteros.com.br/courses',
  })
  assert.match(subject, /Reembolso confirmado/)
  assert.match(text, /R\$\s?147,50/)
  assert.match(html, /acesso a ele foi encerrado/)
})

test('waitlist e-mail uses the waitlist footer, not the account one', () => {
  const { html, text } = renderWaitlistConfirmationEmail({ articlesUrl: 'https://www.lutteros.com.br/articles' })
  assert.match(html, /lista de espera da assinatura/)
  assert.ok(!html.includes('atividade na sua conta'))
  assert.ok(!text.includes('atividade na sua conta'))
})

test('sale notice lists buyer, course and amount', () => {
  const { subject, text } = renderAdminSaleEmail({
    buyerName: 'Ana Souza',
    buyerEmail: 'ana@example.com',
    courseTitle: 'Curso X',
    amount: 5,
    paidAt: new Date('2026-11-08T15:00:00Z'),
    enrollmentId: 'enr-1',
  })
  assert.match(subject, /Nova venda: Curso X/)
  assert.ok(text.includes('ana@example.com') && text.includes('enr-1'))
})

test('contact notice escapes user content and keeps line breaks', () => {
  const { html } = renderAdminContactEmail({
    name: '<b>Eve</b>',
    email: 'eve@example.com',
    phone: '(11) 99999-0000',
    reasonLabel: 'Suporte Técnico',
    subject: null,
    message: 'linha 1\n<script>alert(1)</script>',
    adminUrl: 'https://www.lutteros.com.br/admin/contact/abc',
  })
  assert.ok(!html.includes('<script>') && !html.includes('<b>Eve'))
  assert.ok(html.includes('linha 1<br>'))
})
