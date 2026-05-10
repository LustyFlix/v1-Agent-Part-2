import { useState, useCallback, useRef } from 'react';
import type { Message } from './supabase';
import { parseArtifact, mergeIntoTree } from './boltParser';
import type { FileNode } from '../components/FileTree';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let msgIdCounter = 0;
function makeId() {
  return `local-${++msgIdCounter}-${Date.now()}`;
}

type ConversationMessage = { role: 'user' | 'assistant'; content: string };

export function useAgentStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Keep conversation history for multi-turn context
  const historyRef = useRef<ConversationMessage[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: makeId(),
      project_id: 'local',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Add user turn to history
    historyRef.current = [...historyRef.current, { role: 'user', content }];

    const assistantId = makeId();
    // Insert placeholder for typewriter effect
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        project_id: 'local',
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      },
    ]);

    let accumulated = '';

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ messages: historyRef.current }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to connect to agent');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const parsed = JSON.parse(raw) as
              | { type: 'delta'; text: string }
              | { type: 'done' }
              | { type: 'error'; message: string };

            if (parsed.type === 'delta') {
              accumulated += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                )
              );
            } else if (parsed.type === 'done') {
              // Parse files from completed response
              const artifact = parseArtifact(accumulated);
              if (artifact && artifact.files.length > 0) {
                setFiles((prev) => {
                  const merged = mergeIntoTree(prev, artifact.files);
                  // Auto-select first new file if nothing selected
                  setSelectedPath((sp) => sp ?? artifact.files[0].filePath.replace(/^\//, ''));
                  return merged;
                });
              }
              break;
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message);
            }
          } catch {
            // non-JSON SSE line, skip
          }
        }
      }

      // Add assistant turn to history
      historyRef.current = [...historyRef.current, { role: 'assistant', content: accumulated }];
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${errMsg}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, files, selectedPath, setSelectedPath, sendMessage };
}
