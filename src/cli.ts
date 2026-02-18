#!/usr/bin/env node

import { Command } from 'commander';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import chalk from 'chalk';
import open from 'open';
import { createServer } from './server/index.js';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
);

const program = new Command();

program
  .name('bmad-board')
  .description(
    'Jira-like kanban board for BMAD methodology projects'
  )
  .version(pkg.version)
  .option(
    '-p, --path <path>',
    'Path to _bmad-output/ directory (default: auto-detect in cwd)'
  )
  .option('--port <number>', 'Port to run the server on', '4444')
  .option('--no-open', "Don't auto-open the browser")
  .option('--no-watch', 'Disable file watching')
  .action(async (opts) => {
    const port = parseInt(opts.port, 10);

    // Resolve bmad-output path
    let bmadPath = opts.path;
    if (!bmadPath) {
      // Auto-detect: look for _bmad-output/ in cwd
      const candidates = [
        join(process.cwd(), '_bmad-output'),
        join(process.cwd(), '.bmad-output'),
        join(process.cwd(), 'bmad-output'),
      ];
      bmadPath = candidates.find((p) => existsSync(p));
    } else {
      bmadPath = resolve(bmadPath);
    }

    if (!bmadPath || !existsSync(bmadPath)) {
      console.error(
        chalk.red(
          '\n  Error: Could not find _bmad-output/ directory.\n'
        )
      );
      console.error(
        chalk.gray(
          '  Run this command from a project root that contains _bmad-output/,'
        )
      );
      console.error(
        chalk.gray('  or specify the path with --path <path>\n')
      );
      process.exit(1);
    }

    // Check sprint-status.yaml exists
    const yamlPath = join(
      bmadPath,
      'implementation-artifacts',
      'sprint-status.yaml'
    );
    if (!existsSync(yamlPath)) {
      console.error(
        chalk.red(
          '\n  Error: sprint-status.yaml not found in implementation-artifacts/\n'
        )
      );
      console.error(
        chalk.gray(`  Looked at: ${yamlPath}\n`)
      );
      process.exit(1);
    }

    // Start server
    console.log('');
    console.log(
      chalk.bold('  bmad-board') + chalk.gray(` v${pkg.version}`)
    );
    console.log(
      chalk.gray(`  Reading: ${bmadPath}`)
    );
    console.log('');

    const watchEnabled = opts.watch !== false;

    try {
      const { url } = await createServer({ bmadPath, port, watch: watchEnabled });

      console.log(
        `  ${chalk.green('●')} Board running at ${chalk.cyan.underline(url)}`
      );
      if (watchEnabled) {
        console.log(
          `  ${chalk.blue('●')} Watching for file changes`
        );
      }
      console.log(
        chalk.gray('  Press Ctrl+C to stop\n')
      );

      // Open browser
      if (opts.open !== false) {
        await open(url);
      }
    } catch (err) {
      console.error(chalk.red(`\n  Failed to start server: ${(err as Error).message}\n`));
      process.exit(1);
    }
  });

program.parse();
