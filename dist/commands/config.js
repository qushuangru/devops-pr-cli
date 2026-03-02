"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConfigCommands = registerConfigCommands;
const chalk_1 = __importDefault(require("chalk"));
function registerConfigCommands(program, configManager) {
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
            console.log(chalk_1.default.green('\n✓ Configuration complete! You can now use devops-pr commands.\n'));
            console.log(chalk_1.default.gray('Try: devops-pr pr create\n'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n❌ Error: ${error.message}\n`));
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
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n❌ Error: ${error.message}\n`));
            process.exit(1);
        }
    });
}
//# sourceMappingURL=config.js.map