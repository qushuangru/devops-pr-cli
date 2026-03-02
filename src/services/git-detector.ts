import simpleGit, { SimpleGit } from 'simple-git';
import { RepositoryInfo } from '../types';

export class GitDetector {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async detectRepository(): Promise<RepositoryInfo> {
    // Check if we're in a git repository
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not in a git repository. Please navigate to a git repository.');
    }

    // Get current branch
    const status = await this.git.status();
    const currentBranch = status.current;

    if (!currentBranch) {
      throw new Error('Unable to determine current branch. You may be in a detached HEAD state.');
    }

    // Get remote URL
    const remotes = await this.git.getRemotes(true);
    const origin = remotes.find(r => r.name === 'origin');

    if (!origin || !origin.refs.fetch) {
      throw new Error('No origin remote found. Please add a remote: git remote add origin <url>');
    }

    // Parse Azure DevOps URL
    const repoInfo = this.parseAzureDevOpsUrl(origin.refs.fetch);

    return {
      currentBranch,
      remoteName: 'origin',
      remoteUrl: origin.refs.fetch,
      ...repoInfo
    };
  }

  private parseAzureDevOpsUrl(url: string): Omit<RepositoryInfo, 'currentBranch' | 'remoteName' | 'remoteUrl'> {
    // Handle SSH format: ssh://devops.momenta.works:22/Momenta/IS/_git/is_data_spa
    const sshPattern = /ssh:\/\/([^:]+):?\d*\/([^\/]+)\/([^\/]+)\/_git\/(.+)/;

    // Handle HTTPS format: https://devops.momenta.works/Momenta/IS/_git/is_data_spa
    const httpsPattern = /https:\/\/([^\/]+)\/([^\/]+)\/([^\/]+)\/_git\/(.+)/;

    let match = url.match(sshPattern);
    if (match) {
      return {
        server: `https://${match[1]}`,
        organization: match[2],
        project: match[3],
        repositoryName: match[4]
      };
    }

    match = url.match(httpsPattern);
    if (match) {
      return {
        server: `https://${match[1]}`,
        organization: match[2],
        project: match[3],
        repositoryName: match[4]
      };
    }

    throw new Error(
      `Unable to parse Azure DevOps URL: ${url}\n` +
      `Expected format: ssh://server:22/Org/Project/_git/repo or https://server/Org/Project/_git/repo`
    );
  }

  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    if (!status.current) {
      throw new Error('Unable to determine current branch.');
    }
    return status.current;
  }

  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.git.status();
    return !status.isClean();
  }
}
