import type { FileNode } from '../components/FileTree';

export type BoltFile = {
  filePath: string;
  content: string;
};

export type BoltArtifact = {
  id: string;
  title: string;
  files: BoltFile[];
  shellCommands: string[];
};

/** Extract all boltAction files from a complete assistant message */
export function parseArtifact(raw: string): BoltArtifact | null {
  const artifactMatch = raw.match(
    /<boltArtifact\s+id="([^"]+)"\s+title="([^"]+)"[^>]*>([\s\S]*?)<\/boltArtifact>/
  );
  if (!artifactMatch) return null;

  const id = artifactMatch[1];
  const title = artifactMatch[2];
  const body = artifactMatch[3];

  const files: BoltFile[] = [];
  const shellCommands: string[] = [];

  const fileRegex = /<boltAction\s+type="file"\s+filePath="([^"]+)"[^>]*>([\s\S]*?)<\/boltAction>/g;
  let m: RegExpExecArray | null;
  while ((m = fileRegex.exec(body)) !== null) {
    files.push({ filePath: m[1], content: m[2].trim() });
  }

  const shellRegex = /<boltAction\s+type="shell"[^>]*>([\s\S]*?)<\/boltAction>/g;
  while ((m = shellRegex.exec(body)) !== null) {
    shellCommands.push(m[1].trim());
  }

  return { id, title, files, shellCommands };
}

/** Convert flat BoltFile list into a FileNode tree */
export function buildFileTree(boltFiles: BoltFile[]): FileNode[] {
  const root: FileNode[] = [];

  for (const bf of boltFiles) {
    const parts = bf.filePath.replace(/^\//, '').split('/');
    let nodes = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      if (isLast) {
        const existing = nodes.findIndex((n) => n.path === currentPath);
        if (existing >= 0) {
          nodes[existing].content = bf.content;
        } else {
          nodes.push({ name: part, path: currentPath, type: 'file', content: bf.content });
        }
      } else {
        let dir = nodes.find((n) => n.path === currentPath && n.type === 'directory');
        if (!dir) {
          dir = { name: part, path: currentPath, type: 'directory', children: [] };
          nodes.push(dir);
        }
        nodes = dir.children!;
      }
    }
  }

  return root;
}

/** Merge new files into existing tree (upsert by path) */
export function mergeIntoTree(existing: FileNode[], newFiles: BoltFile[]): FileNode[] {
  // Flatten existing tree to map
  const flat = new Map<string, string>();
  function flatten(nodes: FileNode[]) {
    for (const n of nodes) {
      if (n.type === 'file') flat.set(n.path, n.content ?? '');
      if (n.children) flatten(n.children);
    }
  }
  flatten(existing);

  // Apply new files
  for (const f of newFiles) {
    const path = f.filePath.replace(/^\//, '');
    flat.set(path, f.content);
  }

  // Rebuild tree from merged map
  const merged: BoltFile[] = Array.from(flat.entries()).map(([filePath, content]) => ({
    filePath,
    content,
  }));

  return buildFileTree(merged);
}
