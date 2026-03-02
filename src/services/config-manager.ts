import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { Config } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.devops-pr-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  async init(): Promise<Config> {
    console.log(chalk.cyan('🚀 Azure DevOps PR CLI - Configuration Wizard\n'));
    console.log(chalk.gray(
      'This tool automatically detects organization and project from your git remote.\n' +
      'You only need to configure your PAT token and preferences.\n'
    ));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'server',
        message: 'Enter your Azure DevOps server URL (optional, auto-detected from git):',
        default: 'https://dev.azure.com',
        validate: (input: string) => {
          if (!input.startsWith('http://') && !input.startsWith('https://')) {
            return 'URL must start with http:// or https://';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'pat',
        message: 'Enter your Personal Access Token (PAT):',
        mask: '*',
        validate: (input: string) => input.length > 0 || 'PAT token is required'
      },
      {
        type: 'input',
        name: 'targetBranch',
        message: 'Default target branch for PRs:',
        default: 'master'
      }
    ]);

    const config: Config = {
      server: answers.server.replace(/\/$/, ''), // Remove trailing slash
      pat: answers.pat,
      defaults: {
        targetBranch: answers.targetBranch
      }
    };

    // Test PAT token (non-blocking)
    console.log(chalk.yellow('\n⏳ Testing PAT token...'));
    try {
      await this.testConnection(config);
      console.log(chalk.green('✓ PAT token is valid!\n'));
    } catch (error) {
      console.log(chalk.yellow('⚠ Could not verify PAT token (this may be normal for some servers)'));
      console.log(chalk.gray(`  Error: ${(error as Error).message}`));
      console.log(chalk.gray('  Configuration will be saved anyway. You can test it by running commands.\n'));
    }

    // Save configuration
    this.save(config);
    console.log(chalk.green(`✓ Configuration saved to ${CONFIG_FILE}`));

    return config;
  }

  load(): Config {
    if (!fs.existsSync(CONFIG_FILE)) {
      throw new Error(
        `Configuration not found. Please run "devops-pr config init" to set up.`
      );
    }

    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as Config;
  }

  save(config: Config): void {
    // Create directory if it doesn't exist
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');

    // Set restrictive permissions (user read/write only)
    fs.chmodSync(CONFIG_FILE, 0o600);
  }

  view(): void {
    const config = this.load();

    console.log(chalk.cyan('\n📋 Current Configuration:\n'));
    console.log(chalk.gray('Server:        '), config.server);
    console.log(chalk.gray('PAT Token:     '), chalk.yellow('*'.repeat(20)));
    console.log(chalk.gray('Target Branch: '), config.defaults.targetBranch);
    console.log(chalk.gray('\nConfig file:   '), CONFIG_FILE);
    console.log(chalk.gray('\nNote: Organization and project are auto-detected from git remote URL.'));

    // Show deprecation warning if old fields present
    if (config.organization || config.project) {
      console.log(chalk.yellow(
        '\n⚠️  Deprecated fields detected in config:\n' +
        '    - organization and project are no longer used\n' +
        '    - These values are now automatically detected from your git remote\n' +
        '    - You can safely remove them from the config file'
      ));
    }
  }

  exists(): boolean {
    return fs.existsSync(CONFIG_FILE);
  }

  private async testConnection(config: Config): Promise<void> {
    try {
      const auth = Buffer.from(`:${config.pat}`).toString('base64');
      // Test PAT token validity by querying projects API
      // This validates the token without requiring specific org/project
      const url = `${config.server}/_apis/projects?api-version=6.0`;

      await axios.get(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your PAT token.');
        }
        if (error.response?.status === 403) {
          throw new Error('Permission denied. Your PAT token may not have sufficient permissions.');
        }
        throw new Error(`Connection test failed: ${error.message}`);
      }
      throw error;
    }
  }
}
