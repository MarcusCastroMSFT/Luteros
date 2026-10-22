import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-background"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/images/brand/paper-grain.svg')]"
      />
      <div className="relative mx-auto grid max-w-[1480px] items-center gap-8 px-6 pb-8 pt-12 sm:gap-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-12 lg:py-14 xl:gap-14">
        <div className="relative z-10">
          <h1
            id="home-hero-title"
            className="max-w-[650px] text-balance font-[family-name:var(--font-cardo)] text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.08] tracking-[-0.035em] text-brand-900"
          >
            #1 Plataforma de Saúde Sexual baseada em{" "}
            <span className="italic text-brand-600">
              conhecimento científico
            </span>
          </h1>

          <p className="mt-6 max-w-[580px] text-pretty text-base leading-[1.8] text-slate-600 sm:text-[17px]">
            A Lutteros conecta ciência e prática clínica com conteúdos fundamentados em
            evidências, elaborados e revisados por especialistas. Conhecimento qualificado
            para profissionais que buscam uma assistência em saúde sexual mais atualizada,
            individualizada e livre de julgamentos.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              asChild
              size="lg"
              className="group h-14 gap-6 rounded-md bg-brand-600 px-7 text-base font-semibold text-white shadow-none hover:bg-brand-700 has-[>svg]:px-7 focus-visible:ring-brand-600 focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <Link href="/courses">
                Explorar cursos
                <ArrowRight
                  className="size-[18px] motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 gap-3 rounded-md border-cta-secondary/30 bg-transparent px-7 text-base font-medium text-cta-secondary shadow-none hover:border-cta-secondary hover:bg-brand-secondary-50 hover:text-cta-secondary has-[>svg]:px-7 focus-visible:ring-cta-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <Link href="/articles">
                <BookOpen className="size-[18px]" aria-hidden="true" />
                Ler artigos
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-[0.95] w-full max-w-[600px] lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -right-[40%] top-[5%] h-[104%] w-[130%] rounded-[46%_0_42%_48%] bg-[#e4eeeb] lg:-top-[14%] lg:rotate-[-12deg]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[3%] right-[-3%] h-[38%] w-[48%] rotate-12 rounded-[45%_50%_40%_50%] bg-[#eadfe9]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[6%] left-[1%] right-[5%] top-[2%] rotate-[-6deg] rounded-[47%_47%_44%_16%] border border-brand-600/30"
          />
          <div className="absolute inset-x-[3%] bottom-[5%] top-[3%] overflow-hidden rounded-[47%_47%_44%_16%]">
            <Image
              src="/images/home/hero-peers.webp"
              alt="Uma profissional e um profissional de saúde conversando de forma descontraída em uma mesa de trabalho."
              fill
              preload
              sizes="(min-width: 1480px) 700px, (min-width: 1024px) 50vw, (min-width: 640px) 600px, 92vw"
              className="object-cover object-[60%_40%]"
            />
          </div>
          <Image
            src="/images/brand/care-flow.svg"
            alt=""
            aria-hidden="true"
            width={240}
            height={140}
            unoptimized
            className="pointer-events-none absolute -right-[13%] top-[1%] h-auto w-[43%]"
          />
        </div>
      </div>
    </section>
  );
}
