import { FileCode, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { FileNode } from './FileTree';

type Props = {
  file: FileNode | null;
};

export function CodeEditor({ file }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!file?.content) return;
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <FileCode size={18} className="text-white/20" />
        </div>
        <p className="text-white/25 text-xs">Select a file to view its contents</p>
      </div>
    );
  }

  const lines = (file.content ?? '').split('\n');

  return (
    <div className="flex flex-col h-full">
      {/* File tab bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0f0f10]">
        <div className="flex items-center gap-2">
          <FileCode size={13} className="text-[#e8ff5a]" />
          <span className="text-white/60 text-xs font-mono">{file.path}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all text-xs"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/[0.02] group">
                <td className="pl-4 pr-4 py-0 text-right text-white/15 text-xs font-mono select-none w-10 shrink-0 group-hover:text-white/25 transition-colors leading-6">
                  {i + 1}
                </td>
                <td className="pr-4 py-0 text-white/70 text-xs font-mono whitespace-pre leading-6">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
