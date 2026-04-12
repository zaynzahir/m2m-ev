"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type JsonCodeBlockProps = {
  methodPath: string;
  children: string;
};

export function JsonCodeBlock({ methodPath, children }: JsonCodeBlockProps) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0d] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-md">
        <code className="break-all font-mono text-[11px] text-on-surface-variant sm:break-normal sm:text-xs">
          {methodPath}
        </code>
        <span className="shrink-0 font-headline text-[10px] font-semibold uppercase tracking-wider text-primary/90">
          JSON
        </span>
      </div>
      <SyntaxHighlighter
        language="json"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1.125rem 1.25rem",
          background: "#0c0d10",
          fontSize: "13px",
          lineHeight: 1.65,
        }}
        codeTagProps={{ className: "font-mono" }}
        PreTag="div"
      >
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
