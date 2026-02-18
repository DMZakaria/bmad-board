import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  BoardData,
  Epic,
  EpicStatus,
  Feature,
  RetroStatus,
  Story,
  StoryStatus,
} from '../../types/index.js';
import { parseStoryFile } from './story-parser.js';

// ---------------------------------------------------------------------------
// Feature classification
// ---------------------------------------------------------------------------

interface RawEntry {
  key: string;
  status: string;
  comment: string;
}

const FEATURE_DEFS: {
  prefix: string;
  id: string;
  name: string;
  icon: string;
}[] = [
  { prefix: 'bug-', id: 'bugfix', name: 'Sprint Bugfix', icon: '🐛' },
  { prefix: 'bpc-', id: 'bpc', name: 'Budget par Catégorie', icon: '💰' },
  { prefix: 'ref-', id: 'ref', name: 'Parrainage', icon: '🤝' },
];

function detectFeature(key: string): { featureId: string; localKey: string } {
  // Special cases for bugfix epic entries
  if (key === 'epic-bugfix' || key === 'epic-bugfix-retrospective') {
    return { featureId: 'bugfix', localKey: key.replace('epic-bugfix', 'epic-0') };
  }

  for (const def of FEATURE_DEFS) {
    if (key.startsWith(def.prefix)) {
      return { featureId: def.id, localKey: key.slice(def.prefix.length) };
    }
  }

  // Default: planning familial
  return { featureId: 'planning', localKey: key };
}

// ---------------------------------------------------------------------------
// YAML line parser (no dependency, handles comments)
// ---------------------------------------------------------------------------

function parseYamlLines(filePath: string): {
  entries: RawEntry[];
  epicNames: Record<string, string>;
  meta: { project: string; generatedAt: string };
} {
  const raw = readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  const entries: RawEntry[] = [];
  const epicNames: Record<string, string> = {};
  const meta = { project: '', generatedAt: '' };

  let inDevStatus = false;
  let currentFeature = 'planning';

  for (const line of lines) {
    const trimmed = line.trim();

    // Top-level metadata
    if (!inDevStatus) {
      const projectMatch = trimmed.match(/^project:\s*(.+)/);
      if (projectMatch) meta.project = projectMatch[1].trim();
      const genMatch = trimmed.match(/^generated:\s*(.+)/);
      if (genMatch) meta.generatedAt = genMatch[1].trim();
    }

    if (trimmed === 'development_status:') {
      inDevStatus = true;
      continue;
    }
    if (!inDevStatus) continue;

    // Feature detection from comments
    if (trimmed.match(/FEATURE.*Budget par Cat/i)) currentFeature = 'bpc';
    else if (trimmed.match(/FEATURE.*Parrainage/i)) currentFeature = 'ref';
    else if (trimmed.match(/SPRINT BUGFIX/i)) currentFeature = 'bugfix';
    else if (trimmed.match(/FEATURE.*Planning/i)) currentFeature = 'planning';

    // Epic name from comment: "# Epic 3: Gestion des Tâches"
    const epicCommentMatch = trimmed.match(
      /^#\s*Epic\s+(\d+)\s*:\s*(.+?)(?:\s*\(.*\))?\s*$/
    );
    if (epicCommentMatch) {
      epicNames[`${currentFeature}:${epicCommentMatch[1]}`] =
        epicCommentMatch[2].trim();
    }

    // Skip comments and blanks
    if (trimmed.startsWith('#') || trimmed === '') continue;

    // Key: value  # comment
    const kvMatch = trimmed.match(/^([\w-]+)\s*:\s*([\w-]+)\s*(?:#\s*(.*))?$/);
    if (kvMatch) {
      entries.push({
        key: kvMatch[1],
        status: kvMatch[2],
        comment: kvMatch[3] || '',
      });
    }
  }

  // Bugfix special
  epicNames['bugfix:0'] = 'Corrections prioritaires';

  return { entries, epicNames, meta };
}

// ---------------------------------------------------------------------------
// Build BoardData from parsed YAML + story files
// ---------------------------------------------------------------------------

export function parseBoardData(bmadOutputPath: string): BoardData {
  const implDir = join(bmadOutputPath, 'implementation-artifacts');
  const yamlPath = join(implDir, 'sprint-status.yaml');

  const { entries, epicNames, meta } = parseYamlLines(yamlPath);

  // Buckets
  const features: Record<string, Feature> = {};
  const epics: Record<string, Epic> = {};
  const stories: Record<string, Story> = {};

  // Ensure all feature defs exist
  const allFeatureDefs = [
    { id: 'bugfix', name: 'Sprint Bugfix', icon: '🐛' },
    { id: 'planning', name: 'Planning Familial', icon: '📅' },
    { id: 'bpc', name: 'Budget par Catégorie', icon: '💰' },
    { id: 'ref', name: 'Parrainage', icon: '🤝' },
  ];

  for (const def of allFeatureDefs) {
    features[def.id] = { id: def.id, name: def.name, icon: def.icon, epicIds: [] };
  }

  for (const entry of entries) {
    const { featureId, localKey } = detectFeature(entry.key);
    const isRetro = entry.key.includes('retrospective');
    const isEpic = !isRetro && /^epic-\d+$/.test(localKey);

    if (isEpic) {
      const epicNum = localKey.match(/^epic-(\d+)$/)![1];
      const epicId = `${featureId}:${epicNum}`;
      if (!epics[epicId]) {
        epics[epicId] = {
          id: epicId,
          num: epicNum,
          name: epicNames[epicId] || `Epic ${epicNum}`,
          status: entry.status as EpicStatus,
          featureId,
          retrospective: null,
          storyIds: [],
        };
        if (!features[featureId].epicIds.includes(epicId)) {
          features[featureId].epicIds.push(epicId);
        }
      } else {
        epics[epicId].status = entry.status as EpicStatus;
      }
    } else if (isRetro) {
      const retroMatch = localKey.match(/epic-(\d+)-retrospective/);
      if (retroMatch) {
        const epicId = `${featureId}:${retroMatch[1]}`;
        if (!epics[epicId]) {
          epics[epicId] = {
            id: epicId,
            num: retroMatch[1],
            name: epicNames[epicId] || `Epic ${retroMatch[1]}`,
            status: 'backlog',
            featureId,
            retrospective: entry.status as RetroStatus,
            storyIds: [],
          };
          if (!features[featureId].epicIds.includes(epicId)) {
            features[featureId].epicIds.push(epicId);
          }
        } else {
          epics[epicId].retrospective = entry.status as RetroStatus;
        }
      }
    } else {
      // Story — determine which epic
      let epicNum: string;
      if (featureId === 'bugfix') {
        epicNum = '0';
      } else {
        const storyMatch = localKey.match(/^(\d+)-/);
        epicNum = storyMatch ? storyMatch[1] : '0';
      }

      const epicId = `${featureId}:${epicNum}`;

      // Ensure epic exists
      if (!epics[epicId]) {
        epics[epicId] = {
          id: epicId,
          num: epicNum,
          name: epicNames[epicId] || `Epic ${epicNum}`,
          status: 'backlog',
          featureId,
          retrospective: null,
          storyIds: [],
        };
        if (!features[featureId].epicIds.includes(epicId)) {
          features[featureId].epicIds.push(epicId);
        }
      }

      // Parse story .md file if it exists
      const storyFileData = parseStoryFile(implDir, entry.key);

      const story: Story = {
        id: entry.key,
        title:
          storyFileData?.title ||
          localKey
            .replace(/^\d+-\d+-/, '')
            .replace(/-/g, ' ')
            .replace(/^\w/, (c) => c.toUpperCase()),
        status: entry.status as StoryStatus,
        featureId,
        epicId,
        comment: entry.comment,
        hasFile: !!storyFileData,
        tasksDone: storyFileData?.tasksDone ?? 0,
        tasksTotal: storyFileData?.tasksTotal ?? 0,
        assignees: storyFileData?.assignees ?? [],
        acCount: storyFileData?.acCount ?? 0,
      };

      stories[entry.key] = story;
      epics[epicId].storyIds.push(entry.key);
    }
  }

  // Remove features with no epics
  const activeFeatures = Object.values(features).filter(
    (f) => f.epicIds.length > 0
  );

  return {
    project: meta.project || 'BMAD Project',
    generatedAt: meta.generatedAt,
    basePath: bmadOutputPath,
    features: activeFeatures,
    epics,
    stories,
  };
}
