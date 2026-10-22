import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhyStudyWithUs } from "@/components/common/whyStudyWithUs";
import { HeroSection } from "@/components/home/hero-section";
import { BrandIcon, type BrandIconName } from "@/components/brand/brand-icon";
import { LatestArticles } from "@/components/blog/latestArticles";
import { Button } from "@/components/ui/button";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Lutteros | Saúde sexual baseada em conhecimento científico",
  description: "A Lutteros conecta ciência e prática clínica com conteúdos fundamentados em evidências, elaborados e revisados por especialistas.",
};

const learningFormats: { icon: BrandIconName; title: string; description: string }[] = [
  {
    icon: "articles",
    title: "Artigos científicos",
    description: "Aprofundamento teórico e contato com as evidências que fundamentam a prática clínica.",
  },
  {
    icon: "courses",
    title: "Cursos e materiais educacionais",
    description: "Conteúdos estruturados para atualização profissional e desenvolvimento de competências clínicas.",
  },
  {
    icon: "discussion",
    title: "Discussões clínicas",
    description: "Oportunidades de reflexão sobre questões clínicas e a aplicação do conhecimento científico, conforme os recursos disponibilizados na plataforma.",
  },
];

export default async function Home() {
  const { articles } = await getArticles(1, 4);

  return (
    <div>
      <HeroSection />
      <WhyStudyWithUs />

      <section aria-labelledby="home-audience-title" className="relative isolate overflow-hidden bg-[#e4eeeb]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/brand/paper-grain.svg')]" />
        <Image
          src="/images/brand/care-rings.svg"
          alt=""
          aria-hidden="true"
          width={360}
          height={420}
          unoptimized
          className="pointer-events-none absolute -bottom-64 -left-24 hidden h-auto w-64 rotate-[25deg] opacity-30 lg:block"
        />
        <div className="relative mx-auto grid max-w-[1480px] gap-10 px-6 py-20 sm:px-10 md:grid-cols-2 md:items-center md:gap-16 lg:min-h-[600px] lg:px-12 lg:py-28">
          <div>
            <p className="mb-6 text-sm font-medium text-brand-700 sm:text-base">Para quem é a Lutteros?</p>
            <h2 id="home-audience-title" className="max-w-xl text-balance font-[family-name:var(--font-cardo)] text-4xl leading-[1.12] text-brand-900 lg:text-[56px]">
              Conhecimento para quem cuida da saúde sexual
            </h2>
          </div>
          <div className="max-w-xl">
            <Image
              src="/images/brand/care-bloom.svg"
              alt=""
              aria-hidden="true"
              width={320}
              height={300}
              unoptimized
              className="mb-6 h-auto w-32 md:w-44 lg:w-52"
            />
            <p className="text-xl leading-[1.6] text-brand-900/80 lg:text-2xl">
              Educação científica para profissionais que desejam aprofundar conhecimentos
              e qualificar sua prática.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-learning-title" className="relative isolate overflow-hidden">
        <Image
          src="/images/brand/care-flow.svg"
          alt=""
          aria-hidden="true"
          width={240}
          height={140}
          unoptimized
          className="pointer-events-none absolute -right-16 top-8 hidden h-auto w-72 rotate-[20deg] opacity-60 xl:block"
        />
        <div className="relative mx-auto max-w-[1480px] px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="home-learning-title" className="text-balance font-[family-name:var(--font-cardo)] text-4xl leading-[1.12] text-brand-900 lg:text-[52px]">
              Da evidência científica à prática clínica
            </h2>
            <p className="mt-7 text-lg leading-[1.8] text-slate-600">
              Explore conteúdos que ajudam a compreender a literatura, aprofundar temas
              relevantes e refletir sobre sua aplicação na assistência em saúde sexual.
            </p>
          </div>
          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10 lg:mt-20 lg:gap-16">
            {learningFormats.map(({ icon, title, description }) => (
              <div key={title} className="pb-10">
                <BrandIcon kind={icon} className="mb-7 size-24 lg:size-28" />
                <h3 className="mb-5 text-xl font-semibold text-brand-900 lg:text-2xl">{title}</h3>
                <p className="text-base leading-[1.8] text-slate-600 lg:text-lg">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LatestArticles articles={articles} limit={4} />

      <section aria-labelledby="home-cta-title" className="mx-auto max-w-[1480px] px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
        <div className="relative isolate overflow-hidden rounded-[12px_56px_12px_12px] bg-[#eee5ec] sm:rounded-[12px_112px_12px_12px]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/brand/paper-grain.svg')]" />
          <Image
            src="/images/brand/care-flow.svg"
            alt=""
            aria-hidden="true"
            width={240}
            height={140}
            unoptimized
            className="pointer-events-none absolute -bottom-10 -right-8 hidden h-auto w-64 opacity-50 lg:block"
          />
          <div className="relative grid items-center gap-8 px-6 pb-10 pt-12 sm:px-12 sm:py-16 lg:grid-cols-[0.9fr_1.3fr] lg:gap-12 lg:px-14 lg:py-20">
            <div className="order-2 mx-auto w-full max-w-56 sm:max-w-80 lg:order-1 lg:max-w-none">
              <Image
                src="/images/brand/care-garden.svg"
                alt=""
                aria-hidden="true"
                width={520}
                height={560}
                unoptimized
                className="h-auto w-full"
              />
            </div>
            <div className="order-1 min-w-0 lg:order-2">
              <h2 id="home-cta-title" className="text-balance font-[family-name:var(--font-cardo)] text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.12] tracking-[-0.025em] text-brand-900">
                Mais ciência. Mais preparo.{" "}
                <span className="mt-3 block italic text-cta-secondary">Melhor cuidado em saúde sexual.</span>
              </h2>
              <p className="mt-7 max-w-xl text-base leading-[1.8] text-slate-600 sm:text-lg">
                Aprofunde seus conhecimentos e fortaleça uma prática clínica fundamentada
                em evidências, com respeito à individualidade e à diversidade das pessoas.
              </p>
              <Button
                asChild
                size="lg"
                className="group mt-9 h-14 w-full gap-3 rounded-md bg-cta-secondary px-4 text-base font-semibold text-white shadow-none hover:bg-brand-secondary-800 has-[>svg]:px-4 focus-visible:ring-cta-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-[#eee5ec] motion-reduce:transition-none sm:h-16 sm:w-auto sm:gap-6 sm:px-7 sm:has-[>svg]:px-7"
              >
                <Link href="/about">
                  Conheça a Lutteros
                  <ArrowRight className="size-5 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
