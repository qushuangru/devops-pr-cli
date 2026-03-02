"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPRCommands = registerPRCommands;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const simple_git_1 = __importDefault(require("simple-git"));
const git_detector_1 = require("../services/git-detector");
const api_client_1 = require("../services/api-client");
const formatter_1 = require("../utils/formatter");
function registerPRCommands(program, configManager) {
    const pr = program
        .command('pr')
        .description('Manage pull requests');
    // pr create
    pr.command('create')
        .description('Create a new pull request')
        .option('-t, --title <title>', 'Pull request title')
        .option('-d, --description <description>', 'Pull request description')
        .option('-b, --target <branch>', 'Target branch')
        .option('--draft', 'Create as draft PR')
        .action(async (options) => {
        try {
            const config = configManager.load();
            const gitDetector = new git_detector_1.GitDetector();
            // Detect git repository info
            const spinner = (0, ora_1.default)('Detecting repository information...').start();
            const repoInfo = await gitDetector.detectRepository();
            spinner.succeed('Repository detected');
            // Create client with detected repository context
            const client = new api_client_1.AzureDevOpsClient(config, repoInfo);
            // Get repository ID
            spinner.start('Fetching repository details...');
            const repositoryId = await client.getRepositoryId(repoInfo.repositoryName);
            spinner.succeed();
            // Get title and description
            let title = options.title;
            let description = options.description;
            const targetBranch = options.target || config.defaults.targetBranch;
            if (!title || !description) {
                console.log(chalk_1.default.cyan('\n📝 Create Pull Request\n'));
                const answers = await inquirer_1.default.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'Pull request title:',
                        when: !title,
                        validate: (input) => input.length > 0 || 'Title is required'
                    },
                    {
                        type: 'editor',
                        name: 'description',
                        message: 'Pull request description (press Enter to open editor):',
                        when: !description,
                        default: '## Summary\n\n## Changes\n\n## Test Plan\n'
                    }
                ]);
                title = title || answers.title;
                description = description || answers.description;
            }
            // Create PR
            spinner.start('Creating pull request...');
            const pr = await client.createPR({
                repositoryId,
                sourceBranch: repoInfo.currentBranch,
                targetBranch,
                title,
                description,
                draft: options.draft
            });
            spinner.succeed('Pull request created successfully!\n');
            // Display result
            console.log(chalk_1.default.green(`   PR #${pr.pullRequestId}: ${pr.title}`));
            const webUrl = `${repoInfo.server}/${repoInfo.organization}/${repoInfo.project}/_git/${repoInfo.repositoryName}/pullrequest/${pr.pullRequestId}`;
            console.log(chalk_1.default.blue(`   ${webUrl}\n`));
            console.log(chalk_1.default.gray(`   ${repoInfo.currentBranch} → ${targetBranch}`));
            console.log(chalk_1.default.gray(`   Status: ${pr.status}\n`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n❌ Error: ${error.message}\n`));
            process.exit(1);
        }
    });
    // pr list
    pr.command('list')
        .description('List pull requests')
        .option('-s, --state <state>', 'Filter by state (active|completed|abandoned|all)', 'active')
        .option('-l, --limit <number>', 'Maximum number of PRs to show', '20')
        .option('--target <branch>', 'Filter by target branch')
        .action(async (options) => {
        try {
            const config = configManager.load();
            const gitDetector = new git_detector_1.GitDetector();
            const spinner = (0, ora_1.default)('Detecting repository information...').start();
            const repoInfo = await gitDetector.detectRepository();
            spinner.succeed('Repository detected');
            // Create client with detected repository context
            const client = new api_client_1.AzureDevOpsClient(config, repoInfo);
            spinner.start('Fetching repository details...');
            const repositoryId = await client.getRepositoryId(repoInfo.repositoryName);
            spinner.succeed();
            spinner.start('Fetching pull requests...');
            const prs = await client.listPRs({
                repositoryId,
                state: options.state,
                limit: parseInt(options.limit),
                targetBranch: options.target
            });
            spinner.succeed();
            console.log(chalk_1.default.cyan(`\n${options.state.charAt(0).toUpperCase() + options.state.slice(1)} Pull Requests (${prs.length})\n`));
            console.log(formatter_1.Formatter.formatPRList(prs));
            console.log(chalk_1.default.gray('\nView details: devops-pr pr view <pr-id>\n'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n❌ Error: ${error.message}\n`));
            process.exit(1);
        }
    });
    // pr view
    pr.command('view')
        .description('View pull request details')
        .argument('<pr-id>', 'Pull request ID')
        .option('--comments', 'Include comments')
        .option('--json', 'Output as JSON')
        .action(async (prId, options) => {
        try {
            const config = configManager.load();
            const gitDetector = new git_detector_1.GitDetector();
            const spinner = (0, ora_1.default)('Detecting repository information...').start();
            const repoInfo = await gitDetector.detectRepository();
            spinner.succeed('Repository detected');
            // Create client with detected repository context
            const client = new api_client_1.AzureDevOpsClient(config, repoInfo);
            spinner.start('Fetching repository details...');
            const repositoryId = await client.getRepositoryId(repoInfo.repositoryName);
            spinner.succeed();
            spinner.start('Fetching pull request details...');
            const pr = await client.getPR(repositoryId, parseInt(prId));
            let threads;
            if (options.comments) {
                threads = await client.getPRThreads(repositoryId, parseInt(prId));
            }
            spinner.succeed();
            if (options.json) {
                console.log(JSON.stringify({ pr, threads }, null, 2));
            }
            else {
                console.log(formatter_1.Formatter.formatPRDetail(pr, repoInfo, threads));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n❌ Error: ${error.message}\n`));
            process.exit(1);
        }
    });
    // pr checkout
    pr.command('checkout')
        .description('Checkout pull request branch locally')
        .argument('<pr-id>', 'Pull request ID')
        .action(async (prId) => {
        try {
            const config = configManager.load();
            const gitDetector = new git_detector_1.GitDetector();
            const git = (0, simple_git_1.default)();
            const spinner = (0, ora_1.default)('Detecting repository information...').start();
            const repoInfo = await gitDetector.detectRepository();
            spinner.succeed('Repository detected');
            // Create client with detected repository context
            const client = new api_client_1.AzureDevOpsClient(config, repoInfo);
            spinner.start('Fetching pull request information...');
            const repositoryId = await client.getRepositoryId(repoInfo.repositoryName);
            const pr = await client.getPR(repositoryId, parseInt(prId));
            spinner.succeed();
            const branchName = pr.sourceRefName.replace('refs/heads/', '');
            spinner.start(`Checking out branch: ${branchName}...`);
            // Fetch the branch
            await git.fetch('origin', branchName);
            // Check if branch exists locally
            const branches = await git.branchLocal();
            if (branches.all.includes(branchName)) {
                await git.checkout(branchName);
                await git.pull('origin', branchName);
            }
            else {
                await git.checkoutBranch(branchName, `origin/${branchName}`);
            }
            spinner.succeed(`Checked out branch: ${chalk_1.default.cyan(branchName)}\n`);
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n❌ Error: ${error.message}\n`));
            process.exit(1);
        }
    });
}
//# sourceMappingURL=pr.js.map