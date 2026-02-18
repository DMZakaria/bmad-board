import { watch } from 'chokidar';
import { join } from 'node:path';

export interface FileWatcher {
  close: () => Promise<void>;
}

/**
 * Watch _bmad-output/ for changes to YAML and .md files.
 * Calls `onChange` with debounce when a relevant file changes.
 */
export function createFileWatcher(
  bmadPath: string,
  onChange: (filePath: string) => void
): FileWatcher {
  const implDir = join(bmadPath, 'implementation-artifacts');
  const planDir = join(bmadPath, 'planning-artifacts');

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = watch(
    [
      join(implDir, '**/*.yaml'),
      join(implDir, '**/*.yml'),
      join(implDir, '**/*.md'),
      join(planDir, '**/*.md'),
    ],
    {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
    }
  );

  watcher.on('all', (_event, filePath) => {
    // Debounce: batch rapid changes into a single notification
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onChange(filePath);
    }, 500);
  });

  return {
    close: () => watcher.close(),
  };
}
