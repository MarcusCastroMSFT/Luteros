import React from "react";

export function TrustedBy() {
  // Sample company logos data - you can replace these with actual logo URLs
  const logos = [
    { name: "Accenture", logo: "/images/logos/accenture.svg" },
    { name: "Sugarcane", logo: "/images/logos/sugarcane.svg" },
    { name: "NHS Health Education England", logo: "/images/logos/nhs.svg" },
    { name: "University of Leeds", logo: "/images/logos/leeds.svg" },
    { name: "CIPD", logo: "/images/logos/cipd.svg" },
    { name: "Microsoft", logo: "/images/logos/microsoft.svg" },
    { name: "Google", logo: "/images/logos/google.svg" },
    { name: "Amazon", logo: "/images/logos/amazon.svg" },
  ];

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-text-secondary max-w-2xl mx-auto">
            Especialistas com experiência nas maiores instituições do Brasil e do mundo.
          </p>
        </div>

        {/* Animated Logo Slider */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
          
          {/* Logo container with animation */}
          <div className="flex animate-scroll-infinite hover:pause-animation">
            {duplicatedLogos.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 flex items-center justify-center mx-8 lg:mx-12 opacity-60 hover:opacity-100 transition-opacity duration-300 group"
                style={{ minWidth: "150px", height: "80px" }}
              >
                {/* Placeholder for logo - replace with actual Image component when logos are available */}
                <div className="w-32 h-16 bg-text-secondary/10 hover:bg-text-secondary/20 rounded-lg flex items-center justify-center border border-border/30 hover:border-border/50 transition-all duration-300 group-hover:scale-105">
                  <span className="text-xs font-medium text-text-secondary text-center px-2 group-hover:text-text-primary transition-colors duration-300">
                    {company.name}
                  </span>
                </div>
                
                {/* Uncomment this when you have actual logo images */}
                {/* <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={120}
                  height={60}
                  className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                /> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
