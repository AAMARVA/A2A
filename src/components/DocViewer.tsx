import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, ChevronLeft, ChevronRight, ExternalLink, Hash, Bookmark } from 'lucide-react';
import { DocSection } from '../types';
import { cleanMkDocsMarkdown } from '../utils/markdownUtils';

interface DocViewerProps {
  section: DocSection;
  allSections: DocSection[];
  onSelectDoc: (id: string) => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({
  section,
  allSections,
  onSelectDoc,
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const cleanedContent = cleanMkDocsMarkdown(section.content);

  // Calculate prev/next
  const currentIndex = allSections.findIndex(s => s.id === section.id);
  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection = currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleLinkClick = (href?: string) => {
    if (!href) return;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    // Handle relative markdown links like ./topics/what-is-a2a.md or specification.md
    let target = href.replace(/^\.\//, '').replace(/\.md$/, '').replace(/^topics\//, '');
    if (target.includes('tutorials/python/')) {
      const match = target.match(/([0-9]+)-/);
      if (match) target = `tut-${match[1]}`;
    }
    const found = allSections.find(s => s.id === target || s.id.includes(target));
    if (found) {
      onSelectDoc(found.id);
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-6 flex-wrap font-mono">
        <button
          onClick={() => onSelectDoc('home')}
          className="hover:text-black dark:hover:text-white transition-colors"
        >
          A2A
        </button>
        <span>/</span>
        <span>{section.category}</span>
        {section.subcategory && (
          <>
            <span>/</span>
            <span>{section.subcategory}</span>
          </>
        )}
        <span>/</span>
        <span className="text-black dark:text-white font-semibold">{section.title}</span>
      </nav>

      {/* Header section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {section.title}
          </h1>
          {section.badge && (
            <span className="px-2 py-0.5 text-xs font-mono border border-neutral-200 dark:border-neutral-800 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
              {section.badge}
            </span>
          )}
        </div>
        {section.summary && (
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
            {section.summary}
          </p>
        )}
      </div>

      {/* Markdown Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <Hash className="w-3.5 h-3.5 text-neutral-400" />
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base sm:text-lg font-semibold mt-6 mb-2 text-neutral-900 dark:text-neutral-100">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="my-4 text-neutral-700 dark:text-neutral-300 leading-relaxed text-base">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-4 space-y-1.5 list-disc list-outside pl-6 text-neutral-700 dark:text-neutral-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-4 space-y-1.5 list-decimal list-outside pl-6 text-neutral-700 dark:text-neutral-300">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-4 border-l-2 border-black dark:border-white bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3 rounded-r text-neutral-700 dark:text-neutral-300 not-italic">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                onClick={(e) => {
                  if (href && !href.startsWith('http')) {
                    e.preventDefault();
                    handleLinkClick(href);
                  }
                }}
                className="text-black dark:text-white underline decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-black dark:hover:decoration-white font-medium cursor-pointer underline-offset-2"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-neutral-100 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-neutral-100">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2.5 text-left font-mono text-xs">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                {children}
              </td>
            ),
            pre: ({ children }) => <>{children}</>,
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const codeText = String(children).replace(/\n$/, '');
              const isBlock = Boolean(match || codeText.includes('\n'));

              if (isBlock) {
                const codeId = Math.random().toString(36).substring(7);
                const isCopied = copiedCodeId === codeId;
                return (
                  <div className="my-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-neutral-800 text-xs text-neutral-400 font-mono">
                      <span>{language || 'code'}</span>
                      <button
                        onClick={() => copyToClipboard(codeText, codeId)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span className="text-white">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-neutral-950 text-neutral-100">
                      <code>{codeText}</code>
                    </pre>
                  </div>
                );
              }

              return (
                <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800">
                  {children}
                </code>
              );
            },
            img: ({ src, alt }) => {
              let resolvedSrc = src || '';
              if (resolvedSrc.startsWith('../assets/')) {
                resolvedSrc = resolvedSrc.replace('../assets/', '/assets/');
              } else if (resolvedSrc.startsWith('./assets/')) {
                resolvedSrc = resolvedSrc.replace('./assets/', '/assets/');
              } else if (resolvedSrc.startsWith('assets/')) {
                resolvedSrc = '/' + resolvedSrc;
              }

              const isInline =
                resolvedSrc.includes('shields.io') ||
                resolvedSrc.includes('badge') ||
                resolvedSrc.includes('twemoji') ||
                alt?.toLowerCase().includes('logo') ||
                alt?.toLowerCase().includes('star') ||
                alt?.toLowerCase().includes('crate') ||
                alt?.toLowerCase().includes('hex');

              if (isInline) {
                return (
                  <img
                    src={resolvedSrc}
                    alt={alt || ''}
                    className="inline-block align-middle h-5 w-auto mx-1 my-0.5 object-contain"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.7';
                    }}
                  />
                );
              }

              return (
                <span className="block my-6 text-center">
                  <img
                    src={resolvedSrc}
                    alt={alt || ''}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-800 max-h-[480px] w-auto mx-auto object-contain inline-block"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.6';
                    }}
                  />
                  {alt && alt.length > 3 && !alt.toLowerCase().includes('logo') && (
                    <span className="block text-center text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-mono">
                      {alt}
                    </span>
                  )}
                </span>
              );
            },
          }}
        >
          {cleanedContent}
        </Markdown>
      </div>

      {/* Prev / Next Page Navigation */}
      <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        {prevSection ? (
          <button
            onClick={() => onSelectDoc(prevSection.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white text-xs sm:text-sm font-medium transition-colors group text-left"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-400">Previous</div>
              <div className="font-semibold">{prevSection.title}</div>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextSection && (
          <button
            onClick={() => onSelectDoc(nextSection.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white text-xs sm:text-sm font-medium transition-colors group text-right ml-auto"
          >
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-400">Next</div>
              <div className="font-semibold">{nextSection.title}</div>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </article>
  );
};
