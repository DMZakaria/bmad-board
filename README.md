# bmad-board

Jira-like kanban board for [BMAD methodology](https://github.com/bmadcode/BMAD-METHOD) projects.

Visualize your epics, stories, and sprint progress directly from your `_bmad-output/` files — no database, no cloud, just your local markdown and YAML.

## Quick Start

```bash
# In any project with a _bmad-output/ directory
npx bmad-board
```

That's it. Opens a board in your browser at `http://localhost:4444`.

## Features

- **Kanban Board** — Drag & drop stories between columns (Backlog, Ready, In Progress, Review, Done)
- **Epic Swimlanes** — Group stories by epic with collapsible lanes
- **Story Cards** — Status badges, assignee avatars, task completion progress
- **Create Stories** — Add new stories and epics from the UI (writes .md + updates YAML)
- **Live Reload** — File watcher detects changes and refreshes the board automatically
- **Zero Config** — Auto-detects `_bmad-output/` in your project root

## Options

```bash
bmad-board [options]

Options:
  -p, --path <path>   Path to _bmad-output/ directory (default: auto-detect)
  --port <number>     Port to run the server on (default: 4444)
  --no-open           Don't auto-open the browser
  --no-watch          Disable file watching
  -h, --help          Show help
  -V, --version       Show version
```

## How It Works

bmad-board reads your BMAD project artifacts:

| File | What it reads |
|------|---------------|
| `sprint-status.yaml` | Epic/story statuses, feature groupings |
| `*.md` story files | Story titles, tasks, acceptance criteria, assignees |
| `epics*.md` | Epic names, descriptions, FR coverage |

All mutations (drag & drop, story creation) write directly back to these files.

## Development

```bash
git clone https://github.com/user/bmad-board.git
cd bmad-board
npm install
cd ui && npm install && cd ..

# Dev mode (point to a BMAD project)
npm run dev -- --path /path/to/_bmad-output

# Build
npm run build
```

## License

MIT
