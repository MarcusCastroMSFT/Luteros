import React from "react";

interface StatItem {
  value: string;
  label: string;
}

interface StatsProps {
  stats?: StatItem[];
  showBorder?: boolean;
}

export function Stats({ 
  stats = [
    { value: "10K+", label: "Students Enrolled" },
    { value: "500+", label: "Expert Instructors" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "Support Available" }
  ],
  showBorder = true
}: StatsProps) {
  return (
    <section className={`py-16 bg-background ${showBorder ? 'border-t border-border' : ''}`}>
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl font-bold text-cta-highlight mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-text-secondary text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
