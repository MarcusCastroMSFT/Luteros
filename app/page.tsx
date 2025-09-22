import { CTA } from "@/components/common/cta";
import { PreTitleTag } from "@/components/common/pre-title-tag";
import { TrustedBy } from "@/components/common/trustedBy";
import { WhyStudyWithUs } from "@/components/common/whyStudyWithUs";
import { HeroSection } from "@/components/home/hero-section";
import { DisplayHeading } from "@/components/common/display-heading";
import { LatestArticles } from "@/components/blog/latestArticles";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Home page background image */}
      <div className="fixed top-0 right-0 z-0 pointer-events-none">
        <Image
          src="/images/home/item-9.png"
          alt=""
          width={900}
          height={1100}
          className="opacity-30"
          style={{ position: 'fixed', top: 0, right: 0 }}
        />
      </div>
      
      <div className="relative z-10">
        <HeroSection />
        <TrustedBy />
        <WhyStudyWithUs />
        
        {/* Example section with PreTitleTag */}
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <PreTitleTag text="Our Story" icon="lightning" />
            <DisplayHeading size="lg" highlightText="Future">
              Experience the Future
            </DisplayHeading>
            <p className="text-xl text-text-secondary">
              Join thousands of users who have transformed their workflow with our app.
            </p>
          </div>
        </div>
        
        <LatestArticles limit={4} />
        
        <CTA 
          imageSrc="/images/home/mobile-app.png"
          imageAlt="Learning illustration showing a person using mobile device"
        />
      </div>
    </>
  );
}
