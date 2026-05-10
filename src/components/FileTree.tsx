import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
} from 'lucide-react';

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
};

type Props = {
  files: FileNode[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
};

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext ?? '')) return FileCode;
  if (['json'].includes(ext ?? '')) return FileJson;
  if (['md', 'txt'].includes(ext ?? '')) return FileText;
  return File;
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelectFile,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedPath === node.path;
  const Icon = node.type === 'file' ? getFileIcon(node.name) : expanded ? FolderOpen : Folder;

  return (
    <div>
      <button
        className={`w-full flex items-center gap-1.5 px-2 py-[3px] text-left text-xs transition-colors rounded-sm mx-1 ${
          isSelected
            ? 'bg-white/10 text-white'
            : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => {
          if (node.type === 'directory') {
            setExpanded(!expanded);
          } else {
            onSelectFile(node.path);
          }
        }}
      >
        {node.type === 'directory' && (
          <span className="w-3 h-3 shrink-0 flex items-center justify-center text-white/30">
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        )}
        {node.type === 'file' && <span className="w-3 h-3 shrink-0" />}
        <Icon size={12} className={isSelected ? 'text-[#e8ff5a]' : 'text-white/40'} />
        <span className="truncate">{node.name}</span>
      </button>

      {node.type === 'directory' && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, selectedPath, onSelectFile }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 flex items-center justify-between border-b border-white/[0.06]">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Files
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {files.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <Folder size={20} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/25 text-xs">No files yet</p>
            <p className="text-white/15 text-[10px] mt-1">Start chatting to generate code</p>
          </div>
        ) : (
          files.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
            />
          ))
        )}
      </div>
    </div>
  );
}
