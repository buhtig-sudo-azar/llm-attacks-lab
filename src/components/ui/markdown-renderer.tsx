'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  streaming?: boolean;
}

export function MarkdownRenderer({ content, className, streaming }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'markdown-rendered',
        isDark ? 'markdown-dark' : 'markdown-light',
        className
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3.5 mb-1.5 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mt-3 mb-1.5 text-foreground">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-base leading-relaxed mb-2 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed">{children}</li>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const inline = !match;
            if (inline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="rounded-lg overflow-hidden my-2 border border-border">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  customStyle={{ margin: 0, fontSize: '14px', borderRadius: 0, padding: '12px' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 pl-4 py-1 my-2 bg-muted/30 rounded-r-lg italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="w-full text-sm border border-border rounded-lg">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-foreground">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-muted-foreground">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && <span className="streaming-cursor" />}
    </div>
  );
}
