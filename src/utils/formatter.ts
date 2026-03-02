import chalk from 'chalk';
import Table from 'cli-table3';
import { formatDistance } from 'date-fns';
import { PullRequest, Config } from '../types';

export class Formatter {
  static formatPRList(prs: PullRequest[]): string {
    if (prs.length === 0) {
      return chalk.yellow('No pull requests found.');
    }

    const table = new Table({
      head: [
        chalk.cyan('ID'),
        chalk.cyan('Title'),
        chalk.cyan('Branch'),
        chalk.cyan('Author'),
        chalk.cyan('Created')
      ],
      colWidths: [10, 50, 30, 20, 15]
    });

    prs.forEach(pr => {
      const sourceBranch = pr.sourceRefName.replace('refs/heads/', '');
      const targetBranch = pr.targetRefName.replace('refs/heads/', '');
      const timeAgo = formatDistance(new Date(pr.creationDate), new Date(), { addSuffix: true });

      table.push([
        chalk.yellow(`#${pr.pullRequestId}`),
        pr.title.length > 47 ? pr.title.substring(0, 44) + '...' : pr.title,
        chalk.gray(`${sourceBranch} → ${targetBranch}`),
        pr.createdBy.displayName,
        chalk.gray(timeAgo)
      ]);
    });

    return table.toString();
  }

  static formatPRDetail(pr: PullRequest, config: Config, threads?: any[]): string {
    const sourceBranch = pr.sourceRefName.replace('refs/heads/', '');
    const targetBranch = pr.targetRefName.replace('refs/heads/', '');
    const timeAgo = formatDistance(new Date(pr.creationDate), new Date(), { addSuffix: true });

    let output = chalk.cyan(`\nPull Request #${pr.pullRequestId}\n\n`);
    output += chalk.bold('  Title:     ') + pr.title + '\n';
    output += chalk.bold('  Status:    ') + this.formatStatus(pr.status) + '\n';
    output += chalk.bold('  Author:    ') + pr.createdBy.displayName + '\n';
    output += chalk.bold('  Created:   ') + chalk.gray(timeAgo) + '\n';
    output += chalk.bold('  Draft:     ') + (pr.isDraft ? chalk.yellow('Yes') : 'No') + '\n';
    output += '\n';
    output += chalk.bold('  Source:    ') + chalk.cyan(sourceBranch) + '\n';
    output += chalk.bold('  Target:    ') + chalk.cyan(targetBranch) + '\n';

    if (pr.description) {
      output += '\n' + chalk.bold('  Description:\n');
      output += chalk.gray('  ────────────────────────────────────────\n');
      output += '  ' + pr.description.split('\n').join('\n  ') + '\n';
      output += chalk.gray('  ────────────────────────────────────────\n');
    }

    if (pr.reviewers && pr.reviewers.length > 0) {
      output += '\n' + chalk.bold('  Reviewers:\n');
      pr.reviewers.forEach(reviewer => {
        const voteIcon = this.formatVote(reviewer.vote);
        output += `    ${voteIcon} ${reviewer.displayName}\n`;
      });
    }

    if (threads && threads.length > 0) {
      const commentCount = threads.reduce((sum, t) => sum + (t.comments?.length || 0), 0);
      output += '\n' + chalk.bold(`  Comments: ${commentCount}\n`);
    }

    // Add web URL
    const webUrl = `${config.server}/${config.organization}/${config.project}/_git/${pr.repository.name}/pullrequest/${pr.pullRequestId}`;
    output += '\n' + chalk.bold('  View online: ') + chalk.blue(webUrl) + '\n';

    return output;
  }

  private static formatStatus(status: string): string {
    switch (status) {
      case 'active':
        return chalk.green('Active');
      case 'completed':
        return chalk.blue('Completed');
      case 'abandoned':
        return chalk.red('Abandoned');
      default:
        return status;
    }
  }

  private static formatVote(vote: number): string {
    if (vote === 10) return chalk.green('✓'); // Approved
    if (vote === -10) return chalk.red('✗'); // Rejected
    if (vote === -5) return chalk.yellow('⚠'); // Waiting for author
    if (vote === 5) return chalk.blue('👍'); // Approved with suggestions
    return chalk.gray('⏳'); // No vote
  }
}
