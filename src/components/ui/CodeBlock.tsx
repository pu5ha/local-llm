"use client";

import CopyButton from "./CopyButton";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="ml-3 text-xs text-gray-400 font-mono">{language}</span>
        <div className="ml-auto">
          <CopyButton text={code} />
        </div>
      </div>
      <div className="terminal-body">
        <pre className="overflow-x-auto">
          <code className="text-sm">{code}</code>
        </pre>
      </div>
    </div>
  );
}
