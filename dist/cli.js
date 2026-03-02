#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_manager_1 = require("./services/config-manager");
const pr_1 = require("./commands/pr");
const config_1 = require("./commands/config");
const program = new commander_1.Command();
const configManager = new config_manager_1.ConfigManager();
program
    .name('devops-pr')
    .description('CLI tool for managing Azure DevOps pull requests')
    .version('1.0.0');
// Register commands
(0, config_1.registerConfigCommands)(program, configManager);
(0, pr_1.registerPRCommands)(program, configManager);
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
    console.log(chalk_1.default.yellow('\n⚠️  Configuration not found.\n'));
    console.log(chalk_1.default.gray('Please run the following command to set up:\n'));
    console.log(chalk_1.default.cyan('  devops-pr config init\n'));
    process.exit(1);
}
// Parse arguments
program.parse(process.argv);
//# sourceMappingURL=cli.js.map