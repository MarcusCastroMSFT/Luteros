import type { ReactNode } from "react";
import Image from "next/image";
import { BrandIcon } from "@/components/brand/brand-icon";

interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
}

interface WhyStudyWithUsProps {
  features?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: <BrandIcon kind="evidence" className="size-24 lg:size-28" />,
    title: "Rigor científico",
    description: "Conteúdos fundamentados em evidências científicas, revisados e elaborados por especialistas, sem sensacionalismo ou opiniões apresentadas como fatos.",
  },
  {
    icon: <BrandIcon kind="practice" className="size-24 lg:size-28" />,
    title: "Aplicabilidade clínica",
    description: "Conhecimento que conecta a literatura científica aos desafios da prática profissional, contribuindo para o raciocínio clínico e a tomada de decisão baseada em evidências.",
  },
  {
    icon: <BrandIcon kind="care" className="size-24 lg:size-28" />,
    title: "Cuidado centrado na pessoa",
    description: "Uma abordagem da saúde sexual que valoriza a individualidade, respeita a diversidade e promove uma assistência qualificada, acolhedora e livre de julgamentos.",
  },
];

export function WhyStudyWithUs({ features }: WhyStudyWithUsProps) {
  return (
    <section aria-labelledby="home-values-title" className="relative isolate overflow-hidden bg-background py-20 lg:py-28">
      <Image
        src="/images/brand/care-rings.svg"
        alt=""
        aria-hidden="true"
        width={360}
        height={420}
        unoptimized
        className="pointer-events-none absolute -left-48 -top-16 hidden h-auto w-80 rotate-[-20deg] opacity-35 lg:block"
      />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10 lg:px-12">
        <div data-reveal="" suppressHydrationWarning className="mb-14 text-center lg:mb-20">
          <p className="mb-5 text-sm font-medium text-brand-700 sm:text-base">
            Ciência que fundamenta a prática clínica
          </p>
          <h2 id="home-values-title" className="text-balance font-[family-name:var(--font-cardo)] text-4xl leading-[1.12] text-brand-900 lg:text-[52px]">
            <span className="italic text-brand-600">Por que</span> escolher a Lutteros?
          </h2>
        </div>
        <div data-reveal-stagger="" suppressHydrationWarning className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-10 lg:gap-16">
          {(features ?? defaultFeatures).map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mb-7 flex justify-center">{feature.icon}</div>
              <h3 className="mb-5 text-xl font-semibold text-brand-900 lg:text-2xl">
                {feature.title}
              </h3>
              <p className="mx-auto max-w-sm text-base leading-[1.8] text-slate-600 lg:text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
