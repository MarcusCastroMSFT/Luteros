interface PreTitleTagProps {
  text?: string;
  icon?: "star" | "lightning" | "download";
  className?: string;
}

export function PreTitleTag({ 
  text = "Our Story", 
  icon = "lightning",
  className = "" 
}: PreTitleTagProps) {
  const renderIcon = () => {
    switch (icon) {
      case "star":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cta-highlight">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
        );
      case "lightning":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cta-highlight">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
          </svg>
        );
      case "download":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cta-highlight">
            <path d="M12 2v13m0 0l-4-4m4 4l4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-cta-highlight">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
          </svg>
        );
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-full border bg-background border-border ${className}`}
    >
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: 'var(--cta-background)'
        }}
      >
        {renderIcon()}
      </div>
      <span className="text-sm text-text-primary pr-1">
        {text}
      </span>
    </div>
  );
}
