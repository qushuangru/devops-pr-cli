"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const date_fns_1 = require("date-fns");
class Formatter {
    static formatPRList(prs) {
        if (prs.length === 0) {
            return chalk_1.default.yellow('No pull requests found.');
        }
        const table = new cli_table3_1.default({
            head: [
                chalk_1.default.cyan('ID'),
                chalk_1.default.cyan('Title'),
                chalk_1.default.cyan('Branch'),
                chalk_1.default.cyan('Author'),
                chalk_1.default.cyan('Created')
            ],
            colWidths: [10, 50, 30, 20, 15]
        });
        prs.forEach(pr => {
            const sourceBranch = pr.sourceRefName.replace('refs/heads/', '');
            const targetBranch = pr.targetRefName.replace('refs/heads/', '');
            const timeAgo = (0, date_fns_1.formatDistance)(new Date(pr.creationDate), new Date(), { addSuffix: true });
            table.push([
                chalk_1.default.yellow(`#${pr.pullRequestId}`),
                pr.title.length > 47 ? pr.title.substring(0, 44) + '...' : pr.title,
                chalk_1.default.gray(`${sourceBranch} → ${targetBranch}`),
                pr.createdBy.displayName,
                chalk_1.default.gray(timeAgo)
            ]);
        });
        return table.toString();
    }
    static formatPRDetail(pr, repoInfo, threads) {
        const sourceBranch = pr.sourceRefName.replace('refs/heads/', '');
        const targetBranch = pr.targetRefName.replace('refs/heads/', '');
        const timeAgo = (0, date_fns_1.formatDistance)(new Date(pr.creationDate), new Date(), { addSuffix: true });
        let output = chalk_1.default.cyan(`\nPull Request #${pr.pullRequestId}\n\n`);
        output += chalk_1.default.bold('  Title:     ') + pr.title + '\n';
        output += chalk_1.default.bold('  Status:    ') + this.formatStatus(pr.status) + '\n';
        output += chalk_1.default.bold('  Author:    ') + pr.createdBy.displayName + '\n';
        output += chalk_1.default.bold('  Created:   ') + chalk_1.default.gray(timeAgo) + '\n';
        output += chalk_1.default.bold('  Draft:     ') + (pr.isDraft ? chalk_1.default.yellow('Yes') : 'No') + '\n';
        output += '\n';
        output += chalk_1.default.bold('  Source:    ') + chalk_1.default.cyan(sourceBranch) + '\n';
        output += chalk_1.default.bold('  Target:    ') + chalk_1.default.cyan(targetBranch) + '\n';
        if (pr.description) {
            output += '\n' + chalk_1.default.bold('  Description:\n');
            output += chalk_1.default.gray('  ────────────────────────────────────────\n');
            output += '  ' + pr.description.split('\n').join('\n  ') + '\n';
            output += chalk_1.default.gray('  ────────────────────────────────────────\n');
        }
        if (pr.reviewers && pr.reviewers.length > 0) {
            output += '\n' + chalk_1.default.bold('  Reviewers:\n');
            pr.reviewers.forEach(reviewer => {
                const voteIcon = this.formatVote(reviewer.vote);
                output += `    ${voteIcon} ${reviewer.displayName}\n`;
            });
        }
        if (threads && threads.length > 0) {
            const commentCount = threads.reduce((sum, t) => sum + (t.comments?.length || 0), 0);
            output += '\n' + chalk_1.default.bold(`  Comments: ${commentCount}\n`);
        }
        // Add web URL
        const webUrl = `${repoInfo.server}/${repoInfo.organization}/${repoInfo.project}/_git/${pr.repository.name}/pullrequest/${pr.pullRequestId}`;
        output += '\n' + chalk_1.default.bold('  View online: ') + chalk_1.default.blue(webUrl) + '\n';
        return output;
    }
    static formatStatus(status) {
        switch (status) {
            case 'active':
                return chalk_1.default.green('Active');
            case 'completed':
                return chalk_1.default.blue('Completed');
            case 'abandoned':
                return chalk_1.default.red('Abandoned');
            default:
                return status;
        }
    }
    static formatVote(vote) {
        if (vote === 10)
            return chalk_1.default.green('✓'); // Approved
        if (vote === -10)
            return chalk_1.default.red('✗'); // Rejected
        if (vote === -5)
            return chalk_1.default.yellow('⚠'); // Waiting for author
        if (vote === 5)
            return chalk_1.default.blue('👍'); // Approved with suggestions
        return chalk_1.default.gray('⏳'); // No vote
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=formatter.js.map