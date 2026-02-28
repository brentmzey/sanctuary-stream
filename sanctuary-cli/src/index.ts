#!/usr/bin/env tsx
import { Command } from 'commander';
import pc from 'picocolors';
import { execSync } from 'child_process';
import path from 'path';
import 'dotenv/config';

const program = new Command();

program
  .name('sanctuary')
  .description('CLI for managing Sanctuary Stream')
  .version('1.0.0');

// --- Dev Command ---
program
  .command('dev')
  .description('Start all development services')
  .option('-s, --simple', 'Use simple output mode')
  .action((options) => {
    console.log(pc.blue('🚀 Starting Sanctuary Stream services...'));
    const cmd = options.simple ? 'npm run dev:simple' : 'npm run dev:full';
    try {
      execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    } catch (e) {
      console.error(pc.red('Failed to start services'));
    }
  });

// --- Build Command ---
program
  .command('build')
  .description('Build all components')
  .option('-a, --app', 'Build app only')
  .option('-b, --bridge', 'Build bridge only')
  .action((options) => {
    if (options.app) {
      console.log(pc.cyan('📦 Building App...'));
      execSync('npm run build:app', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    } else if (options.bridge) {
      console.log(pc.cyan('📦 Building Bridge...'));
      execSync('npm run build:bridge', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    } else {
      console.log(pc.cyan('📦 Building all components...'));
      execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    }
  });

// --- Test Command ---
program
  .command('test')
  .description('Run all tests')
  .option('-e, --e2e', 'Run E2E tests only')
  .action((options) => {
    if (options.e2e) {
      console.log(pc.yellow('🧪 Running E2E tests...'));
      execSync('npm run test:e2e', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    } else {
      console.log(pc.yellow('🧪 Running all tests...'));
      execSync('npm run test', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    }
  });

// --- CI Command ---
program
  .command('ci')
  .description('Run full local CI validation suite')
  .action(() => {
    console.log(pc.yellow('🔍 Running local CI validation...'));
    try {
      execSync('./scripts/ci.sh', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    } catch (e) {
      process.exit(1);
    }
  });

// --- Deploy Command ---
program
  .command('push')
  .description('Push changes to GitHub and trigger CI/CD')
  .action(() => {
    console.log(pc.magenta('⬆️  Pushing to GitHub...'));
    try {
      execSync('./push-to-github.sh', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    } catch (e) {
      process.exit(1);
    }
  });

program.parse();
