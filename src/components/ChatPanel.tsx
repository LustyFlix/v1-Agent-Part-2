import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { Send, User, Zap, Loader2 } from 'lucide-react';
import type { Message } from '../lib/supabase';

type Props = {
  messages: Message[];
  isLoading: boolean;
  onSend: (content: string) => void;
};

function MessageBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
          isUser
            ? 'bg-white/10 border border-white/10'
            : 'bg-gradient-to-br from-[#e8ff5a] to-[#b8d900] shadow-md shadow-[#e8ff5a]/20'
        }`}
      >
        {isUser ? (
          <User size={13} className="text-white/60" />
        ) : (
          <Zap size={13} className="text-black" strokeWidth={2.5} />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-medium text-white/30 px-1">
          {isUser ? 'You' : 'bolt'}
        </span>
        <div
          className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
            isUser
              ? 'bg-white/[0.08] text-white/85 rounded-tr-sm'
              : 'bg-[#1a1a1d] text-white/80 rounded-tl-sm border border-white/[0.06]'
          }`}
        >
          <MessageContent content={message.content} isAssistant={!isUser} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
}

function MessageContent({
  content,
  isAssistant,
  isStreaming,
}: {
  content: string;
  isAssistant: boolean;
  isStreaming?: boolean;
}) {
  if (!isAssistant) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  // Strip bolt artifact XML tags from display — show only the prose parts
  const cleanContent = content
    .replace(/<boltArtifact[\s\S]*?<\/boltArtifact>/g, '')
    .replace(/<boltAction[\s\S]*?<\/boltAction>/g, '')
    // Hide partial opening tags while streaming
    .replace(/<boltArtifact[^>]*$/, '')
    .replace(/<boltAction[^>]*$/, '')
    .trim();

  const hasCompletedArtifact = content.includes('</boltArtifact>');
  const isWritingArtifact =
    isStreaming &&
    (content.includes('<boltArtifact') || content.includes('<boltAction')) &&
    !hasCompletedArtifact;

  return (
    <div>
      {cleanContent && (
        <span className="whitespace-pre-wrap">
          {cleanContent}
          {isStreaming && !isWritingArtifact && (
            <span className="inline-block w-0.5 h-3.5 bg-white/50 ml-0.5 align-middle animate-pulse" />
          )}
        </span>
      )}
      {isWritingArtifact && (
        <div className="mt-2 px-2.5 py-1.5 bg-[#e8ff5a]/10 border border-[#e8ff5a]/20 rounded-lg flex items-center gap-2">
          <Loader2 size={11} className="text-[#e8ff5a] shrink-0 animate-spin" />
          <span className="text-[#e8ff5a] text-xs font-medium">Writing files...</span>
        </div>
      )}
      {hasCompletedArtifact && (
        <div className="mt-2 px-2.5 py-1.5 bg-[#e8ff5a]/10 border border-[#e8ff5a]/20 rounded-lg flex items-center gap-2">
          <Zap size={11} className="text-[#e8ff5a] shrink-0" strokeWidth={2.5} />
          <span className="text-[#e8ff5a] text-xs font-medium">Files generated</span>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-[#e8ff5a] to-[#b8d900] shadow-md shadow-[#e8ff5a]/20">
        <Zap size={13} className="text-black" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col gap-1 items-start">
        <span className="text-[10px] font-medium text-white/30 px-1">bolt</span>
        <div className="px-3 py-2.5 rounded-xl bg-[#1a1a1d] border border-white/[0.06] rounded-tl-sm">
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:150ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ messages, isLoading, onSend }: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    onSend(trimmed);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e8ff5a] to-[#b8d900] rounded-2xl flex items-center justify-center shadow-xl shadow-[#e8ff5a]/25">
              <Zap size={22} className="text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white/60 font-medium text-sm">What can I help you build?</p>
              <p className="text-white/25 text-xs mt-1">Describe an app, a feature, or paste a design</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs mt-2">
              {[
                'Build a todo app with local storage',
                'Create a landing page for a SaaS',
                'Make a simple calculator',
              ].map((prompt) => (
                <button
                  key={prompt}
                  className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 text-xs text-left transition-all"
                  onClick={() => onSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((msg, i) => {
              const isLastAssistant =
                isLoading &&
                i === messages.length - 1 &&
                msg.role === 'assistant' &&
                msg.content.length > 0;
              return (
                <MessageBubble key={msg.id} message={msg} isStreaming={isLastAssistant} />
              );
            })}
            {isLoading &&
              (messages.length === 0 ||
                messages[messages.length - 1].role !== 'assistant' ||
                messages[messages.length - 1].content.length === 0) && (
                <TypingIndicator />
              )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="relative flex items-end gap-2 bg-[#1a1a1d] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-white/20 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask bolt to build something..."
            rows={1}
            className="flex-1 bg-transparent text-white/85 text-sm placeholder:text-white/25 resize-none outline-none leading-relaxed py-0.5 min-h-[20px] max-h-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-7 h-7 rounded-lg bg-[#e8ff5a] hover:bg-[#d4eb3a] disabled:bg-white/[0.06] disabled:text-white/20 text-black flex items-center justify-center shrink-0 transition-all shadow-md shadow-[#e8ff5a]/20 disabled:shadow-none mb-0.5"
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin text-white/30" />
            ) : (
              <Send size={13} strokeWidth={2.5} />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-2">
          bolt may make mistakes. Verify important output.
        </p>
      </div>
    </div>
  );
}
