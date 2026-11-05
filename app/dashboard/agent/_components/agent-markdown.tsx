'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components: Components = {
  h1: (p) => <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0" {...p} />,
  h2: (p) => <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0" {...p} />,
  h3: (p) => <h4 className="mt-3 mb-1.5 text-sm font-semibold first:mt-0" {...p} />,
  p: (p) => <p className="my-2 first:mt-0 last:mb-0" {...p} />,
  ul: (p) => <ul className="my-2 list-disc space-y-1 pl-5" {...p} />,
  ol: (p) => <ol className="my-2 list-decimal space-y-1 pl-5" {...p} />,
  a: (p) => <a target="_blank" rel="noreferrer" className="text-primary underline" {...p} />,
  hr: () => <hr className="my-3" />,
  blockquote: (p) => <blockquote className="my-2 border-l-2 pl-3 text-muted-foreground" {...p} />,
  pre: (p) => <pre className="my-2 max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs" {...p} />,
  code: ({ className, ...p }) => (
    <code className={className ?? 'rounded bg-muted px-1 py-0.5 text-[0.85em]'} {...p} />
  ),
  table: (p) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs" {...p} />
    </div>
  ),
  th: (p) => <th className="border bg-muted px-2 py-1 text-left font-medium" {...p} />,
  td: (p) => <td className="border px-2 py-1" {...p} />,
}

/** Agent 답변 마크다운 렌더링 (GFM 표·목록 포함, HTML은 이스케이프) */
export function AgentMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}
