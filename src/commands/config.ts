import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from '../services/config-manager';

export function registerConfigCommands(program: Command, configManager: ConfigManager): void {
  const config = program
    .command('config')
    .description('Manage configuration');

  // config init
  config
    .command('init')
    .description('Initialize configuration with interactive wizard')
    .action(async () => {
      try {
        await configManager.init();
        console.log(chalk.green('\n✓ Configuration complete! You can now use devops-pr commands.\n'));
        console.log(chalk.gray('Try: devops-pr pr create\n'));
      } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
        process.exit(1);
      }
    });

  // config view
  config
    .command('view')
    .description('View current configuration')
    .action(() => {
      try {
        configManager.view();
        console.log();
      } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
        process.exit(1);
      }
    });
}
