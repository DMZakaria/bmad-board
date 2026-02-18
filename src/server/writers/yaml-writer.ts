import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { StoryStatus } from '../../types/index.js';

/**
 * Update a story's status in sprint-status.yaml.
 * Preserves comments and formatting — only changes the status value.
 */
export function updateStoryStatus(
  bmadOutputPath: string,
  storyKey: string,
  newStatus: StoryStatus
): void {
  const yamlPath = join(
    bmadOutputPath,
    'implementation-artifacts',
    'sprint-status.yaml'
  );
  const raw = readFileSync(yamlPath, 'utf-8');
  const lines = raw.split('\n');

  // Pattern: "  story-key: old-status  # optional comment"
  const pattern = new RegExp(
    `^(\\s*${escapeRegex(storyKey)}\\s*:\\s*)(\\S+)(\\s*(?:#.*)?)$`
  );

  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pattern);
    if (match) {
      lines[i] = `${match[1]}${newStatus}${match[3]}`;
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error(
      `Story key "${storyKey}" not found in sprint-status.yaml`
    );
  }

  writeFileSync(yamlPath, lines.join('\n'), 'utf-8');
}

/**
 * Create a new story .md file and add its entry to sprint-status.yaml.
 */
export function createStoryFile(
  bmadOutputPath: string,
  opts: {
    storyKey: string;
    epicKey: string;
    storyNum: string;
    title: string;
    role: string;
    want: string;
    soThat: string;
    acceptanceCriteria: string[];
  }
): void {
  const implDir = join(bmadOutputPath, 'implementation-artifacts');

  // 1. Create the .md file
  const acSection = opts.acceptanceCriteria
    .map((ac, i) => `${i + 1}. ${ac}`)
    .join('\n');

  const mdContent = `# Story ${opts.storyNum}: ${opts.title}

Status: ready-for-dev

## Story

**As a** ${opts.role},
**I want** ${opts.want},
**So that** ${opts.soThat}.

## Acceptance Criteria

${acSection}

## Tasks

- [ ] Task 1: Implementation

## Dev Notes

_No notes yet._
`;

  writeFileSync(join(implDir, `${opts.storyKey}.md`), mdContent, 'utf-8');

  // 2. Add entry to sprint-status.yaml
  const yamlPath = join(implDir, 'sprint-status.yaml');
  const raw = readFileSync(yamlPath, 'utf-8');
  const lines = raw.split('\n');

  // Find the epic entry and insert after the last story of this epic
  const epicPattern = new RegExp(`^\\s*${escapeRegex(opts.epicKey)}\\s*:`);
  let insertIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (epicPattern.test(lines[i])) {
      insertIdx = i + 1;
      // Advance past existing stories in this epic
      while (
        insertIdx < lines.length &&
        !lines[insertIdx].trim().startsWith('#') &&
        lines[insertIdx].trim() !== '' &&
        !lines[insertIdx].trim().match(/^epic-|^bpc-epic-|^ref-epic-/)
      ) {
        insertIdx++;
      }
      break;
    }
  }

  if (insertIdx === -1) {
    // Fallback: append at end
    insertIdx = lines.length;
  }

  const indent = '  ';
  lines.splice(
    insertIdx,
    0,
    `${indent}${opts.storyKey}: ready-for-dev`
  );

  writeFileSync(yamlPath, lines.join('\n'), 'utf-8');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
