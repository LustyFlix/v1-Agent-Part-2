import { useState } from 'react';
import { RefreshCw, ExternalLink, Globe, AlertCircle } from 'lucide-react';

type Props = {
  previewUrl: string | null;
};

export function PreviewPanel({ previewUrl }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <Globe size={20} className="text-white/20" />
        </div>
        <div>
          <p className="text-white/30 text-sm font-medium">No preview available</p>
          <p className="text-white/15 text-xs mt-1">Generate code to see a live preview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
          <AlertCircle size={12} className="text-white/20" />
          <span className="text-white/20 text-xs">Preview runs in a sandboxed iframe</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-[#0f0f10]">
        <div className="flex items-center gap-1.5 flex-1 bg-[#1a1a1d] rounded-md px-2 py-1 border border-white/[0.06]">
          <Globe size={11} className="text-white/30 shrink-0" />
          <span className="text-white/35 text-xs font-mono truncate flex-1">{previewUrl}</span>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all"
        >
          <RefreshCw size={13} />
        </button>
        <button
          onClick={() => window.open(previewUrl, '_blank')}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all"
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* iframe */}
      <div className="flex-1 relative">
        <iframe
          key={refreshKey}
          src={previewUrl}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          title="Preview"
        />
      </div>
    </div>
  );
}
