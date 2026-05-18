import { PreTitleTag } from "@/components/common/pre-title-tag";
import { TrustedBy } from "@/components/common/trustedBy";
import { WhyStudyWithUs } from "@/components/common/whyStudyWithUs";
import { HeroSection } from "@/components/home/hero-section";
import { DisplayHeading } from "@/components/common/display-heading";
import { LatestArticles } from "@/components/blog/latestArticles";
import { getArticles } from "@/lib/articles";
import Image from "next/image";

export default async function Home() {
  const { articles } = await getArticles(1, 4);

  return (
    <>
      {/* Decorative background — non-critical, deferred so it doesn't compete with the hero LCP */}
      <div className="fixed top-0 right-0 z-0 pointer-events-none" aria-hidden>
        <Image
          src="/images/home/item-9.png"
          alt=""
          width={900}
          height={1100}
          className="opacity-30"
          style={{ position: 'fixed', top: 0, right: 0 }}
          sizes="900px"
          loading="lazy"
        />
      </div>

      <div className="relative z-10">
        <HeroSection />
        <TrustedBy />
        <WhyStudyWithUs />

        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <PreTitleTag text="Nossa História" icon="lightning" />
            <DisplayHeading size="lg" highlightText="Futuro">
              Vivencie o Futuro
            </DisplayHeading>
            <p className="text-xl text-text-secondary">
              Junte-se a milhares de pessoas que estão transformando o jeito de aprender sobre saúde sexual.
            </p>
          </div>
        </div>

        <LatestArticles articles={articles} limit={4} />
      </div>
    </>
  );
}
