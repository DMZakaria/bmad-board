import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface StoryFileData {
  title: string;
  tasksDone: number;
  tasksTotal: number;
  assignees: string[];
  acCount: number;
}

/**
 * Parse a story .md file and extract metadata.
 * Returns null if the file doesn't exist.
 */
export function parseStoryFile(
  implDir: string,
  storyKey: string
): StoryFileData | null {
  const mdPath = join(implDir, `${storyKey}.md`);
  if (!existsSync(mdPath)) return null;

  const content = readFileSync(mdPath, 'utf-8');
  const lines = content.split('\n');

  // Title from first line: "# Story 3.2: Saisir un code..."
  let title = '';
  const titleMatch = lines[0]?.match(/^#\s+(?:Story\s+[\d.]+\s*:\s*)?(.+)/);
  if (titleMatch) title = titleMatch[1].trim();

  // Count tasks [x] and [ ] in Tasks/Subtasks section
  let tasksDone = 0;
  let tasksTotal = 0;
  let inTasks = false;

  // Count acceptance criteria
  let acCount = 0;
  let inAC = false;

  // Assignees (look for "Assigned to:", "Assignee:", or member names)
  const assignees: string[] = [];

  for (const line of lines) {
    // Section detection
    if (line.match(/^##\s*(Tasks|Subtasks|Tâches)/i)) {
      inTasks = true;
      inAC = false;
      continue;
    }
    if (line.match(/^##\s*(Acceptance Criteria|Critères d'acceptation)/i)) {
      inAC = true;
      inTasks = false;
      continue;
    }
    if (line.match(/^##\s/)) {
      inTasks = false;
      inAC = false;
      continue;
    }

    // Task counting
    if (inTasks) {
      if (line.match(/^\s*-\s*\[x\]/i)) {
        tasksDone++;
        tasksTotal++;
      } else if (line.match(/^\s*-\s*\[\s\]/)) {
        tasksTotal++;
      }
    }

    // AC counting (numbered items or "Given/When/Then" blocks)
    if (inAC) {
      if (line.match(/^\s*\d+\.\s/) || line.match(/^\s*-\s*\*\*AC/)) {
        acCount++;
      }
    }

    // Assignee detection
    const assigneeMatch = line.match(
      /(?:Assign(?:ed\s+to|ee)s?|Owner)\s*:\s*(.+)/i
    );
    if (assigneeMatch) {
      const names = assigneeMatch[1]
        .split(/[,;&]/)
        .map((n) => n.trim())
        .filter(Boolean);
      assignees.push(...names);
    }
  }

  return { title, tasksDone, tasksTotal, assignees, acCount };
}
