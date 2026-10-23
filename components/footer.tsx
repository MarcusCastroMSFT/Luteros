import Image from "next/image";
import Link from "next/link";
import { Heart, Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Subscribe } from "@/components/subscribe";
import { CurrentYear } from "@/components/common/current-year";
import { footerColumns, socialLinks } from "@/data/menu";
import { LUTTEROS_ENTITY as entity } from "@/lib/legal-entity";

const footerLink =
  "-mx-2 inline-flex items-center rounded-md px-2 py-1.5 text-sm leading-5 text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fd3d8]";

const iconButton =
  "grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/85 backdrop-blur transition-colors duration-200 hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fd3d8]";

export function Footer() {
  return (
    <footer id="site-footer" tabIndex={-1} className="relative isolate mt-10 overflow-hidden bg-[#031a1c] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <Image
          src="/images/footer/water.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,26,28,0.96)_0%,rgba(3,26,28,0.86)_45%,rgba(3,26,28,0.72)_100%)]"
      />

      <div className="mx-auto max-w-[1428px] px-6 sm:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-8 py-9 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:py-10">
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 sm:block sm:space-y-4 lg:col-span-3">
            <div className="inline-flex brightness-0 invert">
              <Logo iconSize="lg" asLink />
            </div>
            <p className="col-span-2 row-start-2 max-w-xs text-sm leading-6 text-white/75">
              Educação em saúde sexual e bem-estar, sem tabu e com acolhimento.
            </p>
            <div className="col-start-2 row-start-1 flex items-center gap-1 sm:gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconButton}
                  aria-label={`${link.name} da lutteros`}
                >
                  <Instagram className="size-[18px]" aria-hidden="true" />
                </a>
              ))}
              <a href={`mailto:${entity.contactEmail}`} className={iconButton} aria-label="Escrever para a Lutteros">
                <Mail className="size-[18px]" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Rodapé" className="grid grid-cols-3 gap-x-4 sm:order-3 sm:col-span-2 lg:order-none lg:col-span-5">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-[#7fd3d8]">{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <section aria-labelledby="footer-newsletter-title" className="min-w-0 lg:col-span-4">
            <h3
              id="footer-newsletter-title"
              className="max-w-xs font-[family-name:var(--font-cardo)] text-2xl font-normal leading-tight text-white"
            >
              Saúde sexual sem tabu, no seu e-mail.
            </h3>
            <p className="mb-4 mt-2 text-sm leading-6 text-white/75">Artigos e novidades. Sem spam.</p>
            <Subscribe variant="dark" hideHeading source="footer" />
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 py-4 text-xs leading-6 text-white/70 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6">
          <p>
            © <CurrentYear /> lutteros · {entity.legalName} · CNPJ {entity.cnpj}
          </p>
          <a
            href="https://befrontier.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 rounded py-1.5 text-[11px] text-white/65 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fd3d8]"
            aria-label="Made with love by Frontier (abre em nova aba)"
          >
            Made with <Heart className="size-3 fill-current text-[#7fd3d8]" aria-hidden="true" /> by <span className="font-medium">Frontier</span>
          </a>
          <p className="-mx-3 flex items-center gap-1">
            <Link href="/terms" className="rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#7fd3d8]">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#7fd3d8]">
              Privacidade
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
