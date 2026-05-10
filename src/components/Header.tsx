import { Zap, Play, Share2, Settings, ChevronDown } from 'lucide-react';

type Props = {
  projectName: string;
  onRename: (name: string) => void;
};

export function Header({ projectName, onRename }: Props) {
  return (
    <header className="h-12 bg-[#0f0f10] border-b border-white/[0.06] flex items-center px-4 gap-3 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 bg-gradient-to-br from-[#e8ff5a] to-[#b8d900] rounded-md flex items-center justify-center shadow-lg shadow-[#e8ff5a]/20">
          <Zap size={14} className="text-black" strokeWidth={2.5} />
        </div>
        <span className="text-white/90 font-semibold text-sm tracking-tight">bolt</span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/[0.08]" />

      {/* Project name */}
      <button
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/[0.06] transition-colors group"
        onClick={() => {
          const newName = window.prompt('Rename project:', projectName);
          if (newName && newName.trim()) onRename(newName.trim());
        }}
      >
        <span className="text-white/70 text-sm font-medium group-hover:text-white/90 transition-colors">
          {projectName}
        </span>
        <ChevronDown size={13} className="text-white/30 group-hover:text-white/50 transition-colors" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white/50 hover:text-white/80 hover:bg-white/[0.06] text-xs font-medium transition-all">
          <Settings size={13} />
          <span>Settings</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white/50 hover:text-white/80 hover:bg-white/[0.06] text-xs font-medium transition-all">
          <Share2 size={13} />
          <span>Share</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#e8ff5a] hover:bg-[#d4eb3a] text-black text-xs font-semibold transition-all shadow-md shadow-[#e8ff5a]/20">
          <Play size={12} strokeWidth={2.5} />
          <span>Deploy</span>
        </button>
      </div>
    </header>
  );
}
