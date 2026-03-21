'use client';

import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="mt-4 mb-2 text-lg font-extrabold text-[#363536] first:mt-0" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="mt-4 mb-2 text-base font-semibold text-[#363536]" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold text-[#363536]" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => (
    <p className="mb-2 text-sm leading-relaxed text-[#363536]" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-[#363536]" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-[#363536]" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...props} />,
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-[#363536]" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<'a'>) => (
    <a className="font-medium text-[#5BA66B] underline underline-offset-2 hover:text-[#3D7A4A]" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code className="rounded bg-[#F0EFED] px-1 py-0.5 font-mono text-xs text-[#363536]" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<'pre'>) => (
    <pre className="mb-3 overflow-x-auto rounded-lg border border-[#E5E5E5] bg-[#FAF9F7] p-3 text-xs" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="mb-3 border-l-4 border-[#AAD4AE] pl-3 italic text-[#6B6B6B]"
      {...props}
    />
  ),
};

export function MarkdownBlock({ content }: { content: string }) {
  if (!content?.trim()) {
    return <p className="text-sm text-[#6B6B6B]">Sin contenido.</p>;
  }

  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
