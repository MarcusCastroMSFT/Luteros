import React from "react";

interface StatsContainerProps {
  children: React.ReactNode;
}

export function StatsContainer({ children }: StatsContainerProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {children}
    </div>
  );
}
