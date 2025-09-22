import React from "react";
import { cn } from "@/lib/utils";

interface DisplayHeadingProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  highlightText?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const sizeClasses = {
  sm: "text-3xl md:text-4xl",
  md: "text-4xl md:text-5xl",
  lg: "text-4xl md:text-5xl lg:text-6xl",
  xl: "text-5xl md:text-6xl lg:text-7xl",
};

export function DisplayHeading({
  children,
  size = "lg",
  highlightText,
  className,
  as: Component = "h1",
}: DisplayHeadingProps) {
  const renderContent = () => {
    if (typeof children === "string" && highlightText) {
      const parts = children.split(highlightText);
      return parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="text-cta-highlight">{highlightText}</span>
          )}
        </React.Fragment>
      ));
    }
    return children;
  };

  return (
    <Component
      className={cn(
        "font-bold leading-tight text-text-primary",
        sizeClasses[size],
        className
      )}
      style={{ fontFamily: "var(--font-cardo)" }}
    >
      {renderContent()}
    </Component>
  );
}
