import Link from "next/link";
import { appLinks, type AppLink } from "@/data/menu";

interface AppLinksProps {
  links?: AppLink[];
  className?: string;
  colorMode?: "light" | "dark";
  title?: string | null;
}

export function AppLinks({ 
  links = appLinks, 
  className = "", 
  colorMode = "light",
  title = "Baixe nosso aplicativo"
}: AppLinksProps) {
  // Use colorMode for forced styling, otherwise rely on global dark mode classes
  const isForceMode = colorMode === "dark";

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className={`text-lg font-semibold mb-4 whitespace-nowrap ${
          isForceMode ? "text-white" : "text-gray-900"
        }`}>{title}</h3>
      )}
      <div className="flex flex-row gap-3">
        {links.map((link) => (
          <Link
            key={link.platform}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-200 min-w-[180px] border ${
              isForceMode 
                ? "bg-[#131836] border-[#131836] text-white hover:bg-gray-800" 
                : "bg-gray-100 border-gray-200 hover:bg-gray-200"
            }`}
          >
            <div className="flex-shrink-0">
              {link.platform === "apple" ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className={
                  isForceMode ? "text-white" : "text-gray-900"
                }>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className={
                  isForceMode ? "text-white" : "text-gray-900"
                }>
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
              )}
            </div>
            <div className={`w-px h-8 mx-1 ${
              isForceMode ? "bg-gray-500" : "bg-gray-300"
            }`}></div>
            <div className="flex flex-col text-left">
              <span className={`text-xs leading-tight ${
                isForceMode ? "text-gray-300" : "text-gray-600"
              }`}>
                {link.platform === "apple" ? "Download na" : "Download no"}
              </span>
              <span className={`text-sm font-semibold leading-tight ${
                isForceMode ? "text-white" : "text-gray-900"
              }`}>
                {link.platform === "apple" ? "Apple Store" : "Google Play"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
