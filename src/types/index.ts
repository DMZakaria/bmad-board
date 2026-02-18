// ---------------------------------------------------------------------------
// Core domain types shared between server and UI
// ---------------------------------------------------------------------------

export type StoryStatus =
  | 'backlog'
  | 'ready-for-dev'
  | 'in-progress'
  | 'review'
  | 'done';

export type EpicStatus = 'backlog' | 'in-progress' | 'done';

export type RetroStatus = 'optional' | 'done';

/** All possible columns on the kanban board */
export const BOARD_COLUMNS: StoryStatus[] = [
  'backlog',
  'ready-for-dev',
  'in-progress',
  'review',
  'done',
];

export const COLUMN_LABELS: Record<StoryStatus, string> = {
  backlog: 'Backlog',
  'ready-for-dev': 'Ready',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

// ---------------------------------------------------------------------------
// Data models
// ---------------------------------------------------------------------------

export interface Story {
  /** Unique key from sprint-status.yaml, e.g. "ref-3-2-saisir-un-code" */
  id: string;
  /** Human-readable title parsed from story .md file or generated from slug */
  title: string;
  /** Current status */
  status: StoryStatus;
  /** Feature this story belongs to */
  featureId: string;
  /** Epic number within the feature */
  epicId: string;
  /** Inline comment from YAML */
  comment: string;
  /** Whether a .md story file exists */
  hasFile: boolean;
  /** Task completion count (from .md file) */
  tasksDone: number;
  tasksTotal: number;
  /** Assignees parsed from story file */
  assignees: string[];
  /** Acceptance criteria count */
  acCount: number;
}

export interface Epic {
  /** Unique key, e.g. "ref:3" (featureId:epicNum) */
  id: string;
  /** Epic number within the feature */
  num: string;
  /** Epic name from YAML comment */
  name: string;
  /** Current status */
  status: EpicStatus;
  /** Feature this epic belongs to */
  featureId: string;
  /** Retrospective status */
  retrospective: RetroStatus | null;
  /** Story IDs in this epic */
  storyIds: string[];
}

export interface Feature {
  /** Unique key: "planning", "bpc", "ref", "bugfix" */
  id: string;
  /** Display name */
  name: string;
  /** Icon emoji */
  icon: string;
  /** Epic IDs in this feature */
  epicIds: string[];
}

export interface BoardData {
  /** Project name from YAML */
  project: string;
  /** Generation date from YAML */
  generatedAt: string;
  /** Path to _bmad-output/ */
  basePath: string;
  /** All features */
  features: Feature[];
  /** All epics indexed by id */
  epics: Record<string, Epic>;
  /** All stories indexed by id */
  stories: Record<string, Story>;
}

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

export interface MoveStoryPayload {
  storyId: string;
  newStatus: StoryStatus;
}

export interface CreateStoryPayload {
  featureId: string;
  epicNum: string;
  title: string;
  role: string;
  want: string;
  soThat: string;
  acceptanceCriteria: string[];
}

export interface CreateEpicPayload {
  featureId: string;
  name: string;
  objective: string;
}

/** WebSocket event types for live updates */
export type WsEvent =
  | { type: 'board-updated'; data: BoardData }
  | { type: 'story-moved'; data: { storyId: string; newStatus: StoryStatus } };
