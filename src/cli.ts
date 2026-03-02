#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from './services/config-manager';
import { registerPRCommands } from './commands/pr';
import { registerConfigCommands } from './commands/config';

const program = new Command();
const configManager = new ConfigManager();

program
  .name('devops-pr')
  .description('CLI tool for managing Azure DevOps pull requests')
  .version('1.0.0');

// Register commands
registerConfigCommands(program, configManager);
registerPRCommands(program, configManager);

// Show help if no command provided
if (process.argv.length === 2) {
  program.outputHelp();
  process.exit(0);
}

// Check if it's a help or version request
const args = process.argv.slice(2);
const isHelpOrVersion = args.includes('-h') || args.includes('--help') ||
                       args.includes('-V') || args.includes('--version');

// Check if config exists for non-config commands
const isConfigCommand = args[0] === 'config';
if (!isConfigCommand && !isHelpOrVersion && !configManager.exists()) {
  console.log(chalk.yellow('\n⚠️  Configuration not found.\n'));
  console.log(chalk.gray('Please run the following command to set up:\n'));
  console.log(chalk.cyan('  devops-pr config init\n'));
  process.exit(1);
}

// Parse arguments
program.parse(process.argv);
