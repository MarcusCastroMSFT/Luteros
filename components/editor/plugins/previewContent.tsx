'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useEffect, useState } from 'react';

interface PreviewContentProps {
  isPreviewMode: boolean;
  // SEO enhancement props
  articleTitle?: string;
  articleDescription?: string;
  authorName?: string;
  publishDate?: string;
  keywords?: string[];
}

export function PreviewContent({ 
  isPreviewMode, 
  articleTitle, 
  articleDescription, 
  authorName, 
  publishDate, 
  keywords 
}: PreviewContentProps) {
  const [editor] = useLexicalComposerContext();
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (isPreviewMode) {
      const updateHtml = () => {
        editor.getEditorState().read(() => {
          let htmlString = $generateHtmlFromNodes(editor, null);
          
          if (htmlString) {
            // SEO: Enhance links with proper attributes
            htmlString = htmlString.replace(
              /<a\s+([^>]*?)href=["']([^"']*?)["']([^>]*?)>/gi,
              (match, before, href, after) => {
                const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
                const isEmail = href.startsWith('mailto:');
                const isTel = href.startsWith('tel:');
                
                if (isExternal) {
                  return `<a ${before}href="${href}"${after} target="_blank" rel="noopener noreferrer nofollow">`;
                } else if (isEmail || isTel) {
                  return `<a ${before}href="${href}"${after}>`;
                } else {
                  // Internal links - good for SEO
                  return `<a ${before}href="${href}"${after} rel="internal">`;
                }
              }
            );
            
            // SEO: Enhance images with proper attributes
            htmlString = htmlString.replace(
              /<img([^>]*?)src=["']([^"']*?)["']([^>]*?)>/gi,
              (match) => {
                let enhanced = match;
                
                // Add loading="lazy" for performance SEO
                if (!enhanced.includes('loading=')) {
                  enhanced = enhanced.replace('<img', '<img loading="lazy"');
                }
                
                // Add decoding="async" for better performance
                if (!enhanced.includes('decoding=')) {
                  enhanced = enhanced.replace('<img', '<img decoding="async"');
                }
                
                // Ensure alt attribute exists (crucial for SEO)
                if (!enhanced.includes('alt=')) {
                  enhanced = enhanced.replace('<img', '<img alt=""');
                }
                
                return enhanced;
              }
            );
            
            // SEO: Enhance headings with proper structure
            htmlString = htmlString.replace(
              /<(h[1-6])([^>]*)>/gi,
              '<$1$2 class="seo-heading">'
            );
            
            // Process images with inline styles to ensure dimensions are preserved
            htmlString = htmlString.replace(
              /<img([^>]*?)style=["']([^"']*?)["']([^>]*?)>/gi,
              (match, before, styleContent, after) => {
                // Extract width and height from the style attribute
                const widthMatch = styleContent.match(/width:\s*([^;!]+)(?:\s*!important)?/);
                const heightMatch = styleContent.match(/height:\s*([^;!]+)(?:\s*!important)?/);
                
                if (widthMatch && heightMatch) {
                  const width = widthMatch[1].trim();
                  const height = heightMatch[1].trim();
                  
                  // Create a more specific style that won't be overridden
                  const newStyle = `${styleContent}; min-width: ${width} !important; min-height: ${height} !important; flex: none !important;`;
                  return `<img${before}style="${newStyle}"${after}>`;
                }
                return match;
              }
            );
          }
          
          setHtmlContent(htmlString || '<p>No hay contenido para mostrar</p>');
        });
      };

      // Update immediately
      updateHtml();

      // Listen for editor changes to update preview
      const unregister = editor.registerUpdateListener(() => {
        updateHtml();
      });

      return unregister;
    }
  }, [editor, isPreviewMode]);

  if (!isPreviewMode) {
    return null;
  }

  return (
    <article className="min-h-[500px] p-4 bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
          .preview-content img[style*="width"][style*="height"] {
            flex: none !important;
            min-width: unset !important;
            min-height: unset !important;
            max-width: unset !important;
            max-height: unset !important;
          }
          
          .preview-content,
          .preview-content h1,
          .preview-content h2,
          .preview-content h3,
          .preview-content h4,
          .preview-content h5,
          .preview-content h6,
          .preview-content p,
          .preview-content span,
          .preview-content div,
          .preview-content li,
          .preview-content blockquote {
            font-family: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif !important;
          }
          
          /* SEO: Proper heading hierarchy styles */
          .preview-content .seo-heading {
            scroll-margin-top: 2rem;
          }
          
          /* SEO: Enhanced link styles */
          .preview-content a[rel="internal"] {
            text-decoration-color: currentColor;
          }
          
          .preview-content a[rel*="nofollow"] {
            font-weight: 500;
          }
        `
      }} />
      <div 
        className="preview-content prose prose-lg max-w-none 
                   prose-headings:text-gray-900
                   prose-p:text-gray-900
                   prose-a:text-blue-600
                   prose-strong:text-gray-900
                   prose-code:bg-gray-100
                   prose-hr:border-gray-300"
        role="main"
        itemScope
        itemType="https://schema.org/Article"
        {...(articleTitle && { itemProp: "name", title: articleTitle })}
        dangerouslySetInnerHTML={{ __html: htmlContent || '<p>No hay contenido para mostrar</p>' }}
      />
      
      {/* SEO: Hidden structured data for better indexing */}
      {(articleTitle || articleDescription || authorName || publishDate || keywords) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              ...(articleTitle && { "headline": articleTitle }),
              ...(articleDescription && { "description": articleDescription }),
              ...(authorName && { 
                "author": {
                  "@type": "Person",
                  "name": authorName
                }
              }),
              ...(publishDate && { "datePublished": publishDate }),
              ...(keywords && { "keywords": keywords.join(", ") }),
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": typeof window !== 'undefined' ? window.location.href : ''
              }
            })
          }}
        />
      )}
    </article>
  );
}
