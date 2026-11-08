import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderCoursePurchaseEmail } from './account-emails'

const base = {
  name: 'Maria Silva',
  courseTitle: 'Curso <Teste> & Cia',
  amount: 147.5,
  paidAt: new Date('2026-11-08T15:00:00Z'),
  courseUrl: 'https://www.lutteros.com.br/courses/teste/lessons',
  myCoursesUrl: 'https://www.lutteros.com.br/courses/my-courses',
}

test('purchase e-mail carries the course link, amount and first name', () => {
  const { subject, html, text } = renderCoursePurchaseEmail(base)
  assert.match(subject, /Pagamento confirmado/)
  assert.ok(html.includes(base.courseUrl))
  assert.ok(text.includes(base.courseUrl))
  assert.match(html, /Olá, Maria/)
  assert.match(text, /R\$\s?147,50/)
  assert.match(text, /8 de novembro de 2026/)
})

test('purchase e-mail escapes the course title in HTML', () => {
  const { html } = renderCoursePurchaseEmail(base)
  assert.ok(!html.includes('<Teste>'))
  assert.ok(html.includes('&lt;Teste&gt;'))
})
