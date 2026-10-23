import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, MessagesSquare, Newspaper, Stethoscope, type LucideIcon } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Footer } from '@/components/footer'
import { LUTTEROS_ENTITY } from '@/lib/legal-entity'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description: 'Não encontramos a página que você procurava. Veja os caminhos mais visitados da lutteros.',
  robots: { index: false, follow: true },
}

interface Shortcut {
  href: string
  title: string
  text: string
  icon: LucideIcon
}

const SHORTCUTS: Shortcut[] = [
  { href: '/courses', title: 'Cursos', text: 'Aprenda no seu ritmo com especialistas em saúde sexual.', icon: BookOpen },
  { href: '/articles', title: 'Artigos', text: 'Leituras confiáveis, claras e sem tabu.', icon: Newspaper },
  { href: '/events', title: 'Eventos', text: 'Encontros, palestras e lives para participar.', icon: CalendarDays },
  { href: '/specialists', title: 'Especialistas', text: 'Conheça profissionais que podem te ajudar.', icon: Stethoscope },
  { href: '/community', title: 'Comunidade', text: 'Troque experiências em um espaço acolhedor.', icon: MessagesSquare },
]

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="not-found-title">
          <div className={styles.heroInner}>
            <div className={styles.copy}>
              <p className={`${styles.eyebrow} ${styles.rise}`}>
                <span className={styles.pulse} aria-hidden="true" />
                Erro 404
              </p>
              <p className={`${styles.code} ${styles.rise} ${styles.d1}`} aria-hidden="true">
                404
              </p>
              <h1 id="not-found-title" className={`${styles.title} ${styles.rise} ${styles.d2}`}>
                Opa, essa sala está vazia.
              </h1>
              <p className={`${styles.lead} ${styles.rise} ${styles.d3}`}>
                A página que você procura mudou de endereço, foi removida ou nunca existiu. Vamos ajudar você a encontrar o
                caminho de volta.
              </p>
              <div className={`${styles.actions} ${styles.rise} ${styles.d4}`}>
                <Link href="/" className={styles.primary}>
                  Voltar para o início
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/courses" className={styles.outline}>
                  Explorar cursos
                </Link>
              </div>
            </div>

            <figure className={`${styles.figure} ${styles.pop}`}>
              <div className={styles.frame}>
                <Image
                  src="/images/404/consultorio-vazio.webp"
                  alt="Ilustração de um consultório vazio, com estetoscópio sobre a mesa e o jaleco pendurado: a médica saiu por um instante."
                  fill
                  priority
                  sizes="(max-width: 980px) 100vw, 640px"
                />
              </div>
            </figure>
          </div>
        </section>

        <section className={styles.shortcuts} aria-labelledby="shortcuts-title">
          <div className={styles.shortcutsInner}>
            <div className={styles.shortcutsHead}>
              <h2 id="shortcuts-title" className={styles.shortcutsTitle}>
                Talvez você esteja procurando
              </h2>
              <p className={styles.shortcutsHint}>Os caminhos mais visitados da lutteros.</p>
            </div>

            <div className={styles.grid}>
              {SHORTCUTS.map(({ href, title, text, icon: Icon }) => (
                <Link key={href} href={href} className={styles.card}>
                  <span className={styles.icon}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <ArrowUpRight className={styles.arrow} size={18} aria-hidden="true" />
                  <h3 className={styles.cardTitle}>{title}</h3>
                  <p className={styles.cardText}>{text}</p>
                </Link>
              ))}
            </div>

            <p className={styles.support}>
              Ainda não achou? Veja a <Link href="/help">Central de Ajuda</Link> ou escreva para{' '}
              <a href={`mailto:${LUTTEROS_ENTITY.contactEmail}`}>{LUTTEROS_ENTITY.contactEmail}</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
