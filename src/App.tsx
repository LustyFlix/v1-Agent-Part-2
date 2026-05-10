import { useState } from 'react';
import { Code2, Globe, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { FileTree } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { PreviewPanel } from './components/PreviewPanel';
import { useAgentStream } from './lib/useAgentStream';

type WorkspaceTab = 'code' | 'preview';

export default function App() {
  const [projectName, setProjectName] = useState('My Project');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('code');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewUrl] = useState<string | null>(null);

  const { messages, isLoading, files, selectedPath, setSelectedPath, sendMessage } =
    useAgentStream();

  const selectedFile = selectedPath ? findFileInTree(files, selectedPath) : null;

  return (
    <div className="h-screen flex flex-col bg-[#0c0c0e] text-white overflow-hidden">
      <Header projectName={projectName} onRename={setProjectName} />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat panel */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0f0f10]">
          <ChatPanel messages={messages} isLoading={isLoading} onSend={sendMessage} />
        </div>

        {/* Workspace: file tree + editor/preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* File sidebar */}
          <div
            className={`flex flex-col border-r border-white/[0.06] bg-[#0f0f10] transition-all duration-200 overflow-hidden ${
              sidebarOpen ? 'w-52 shrink-0' : 'w-0'
            }`}
          >
            <FileTree
              files={files}
              selectedPath={selectedPath}
              onSelectFile={setSelectedPath}
            />
          </div>

          {/* Editor / Preview area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-3 h-9 border-b border-white/[0.06] bg-[#0f0f10] shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all mr-1"
              >
                {sidebarOpen ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-white/[0.08] text-white/85'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                <Code2 size={12} />
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white/[0.08] text-white/85'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                <Globe size={12} />
                Preview
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewPanel previewUrl={previewUrl} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function findFileInTree(
  nodes: import('./components/FileTree').FileNode[],
  path: string
): import('./components/FileTree').FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileInTree(node.children, path);
      if (found) return found;
    }
  }
  return null;
}
