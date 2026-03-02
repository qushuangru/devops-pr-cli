import axios, { AxiosInstance, AxiosError } from 'axios';
import { Config, PullRequest, ListPRParams, CreatePRParams, Thread, RepositoryInfo } from '../types';

export class AzureDevOpsClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly server: string;

  constructor(config: Config, repoInfo?: RepositoryInfo) {
    // Use detected values from git remote if available, fallback to config
    const server = repoInfo?.server || config.server;
    const organization = repoInfo?.organization || config.organization;
    const project = repoInfo?.project || config.project;

    if (!organization || !project) {
      throw new Error(
        'Organization and project must be detected from git remote or provided in config.\n' +
        'Ensure you are in a git repository with Azure DevOps remote.'
      );
    }

    this.server = server;
    const auth = Buffer.from(`:${config.pat}`).toString('base64');

    this.axiosInstance = axios.create({
      baseURL: `${server}/${organization}/${project}/_apis`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
  }

  getServer(): string {
    return this.server;
  }

  async createPR(params: CreatePRParams): Promise<PullRequest> {
    try {
      const payload = {
        sourceRefName: `refs/heads/${params.sourceBranch}`,
        targetRefName: `refs/heads/${params.targetBranch}`,
        title: params.title,
        description: params.description,
        isDraft: params.draft || false
      };

      if (params.reviewers && params.reviewers.length > 0) {
        Object.assign(payload, {
          reviewers: params.reviewers.map(id => ({ id }))
        });
      }

      const response = await this.axiosInstance.post(
        `/git/repositories/${params.repositoryId}/pullrequests?api-version=6.0`,
        payload
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listPRs(params: ListPRParams): Promise<PullRequest[]> {
    try {
      const queryParams = new URLSearchParams({
        'api-version': '6.0',
        '$top': String(params.limit || 50)
      });

      if (params.state && params.state !== 'all') {
        queryParams.append('searchCriteria.status', params.state);
      }

      if (params.creatorId) {
        queryParams.append('searchCriteria.creatorId', params.creatorId);
      }

      if (params.targetBranch) {
        queryParams.append('searchCriteria.targetRefName', `refs/heads/${params.targetBranch}`);
      }

      const response = await this.axiosInstance.get(
        `/git/repositories/${params.repositoryId}/pullrequests?${queryParams.toString()}`
      );

      return response.data.value || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPR(repositoryId: string, pullRequestId: number): Promise<PullRequest> {
    try {
      const response = await this.axiosInstance.get(
        `/git/repositories/${repositoryId}/pullrequests/${pullRequestId}?api-version=6.0`
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPRThreads(repositoryId: string, pullRequestId: number): Promise<Thread[]> {
    try {
      const response = await this.axiosInstance.get(
        `/git/repositories/${repositoryId}/pullrequests/${pullRequestId}/threads?api-version=6.0`
      );

      return response.data.value || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRepositoryId(repositoryName: string): Promise<string> {
    try {
      const response = await this.axiosInstance.get(
        `/git/repositories/${repositoryName}?api-version=6.0`
      );

      return response.data.id;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      if (status === 401) {
        return new Error(
          'Authentication failed. Your PAT token may be invalid or expired.\n' +
          'Run "devops-pr config init" to reconfigure.'
        );
      }

      if (status === 403) {
        return new Error(
          'Permission denied. Your PAT token does not have sufficient permissions.\n' +
          'Ensure your token has "Code (Read)" and "Pull Requests (Read & Write)" permissions.'
        );
      }

      if (status === 404) {
        return new Error(
          'Resource not found. The repository or PR may not exist.\n' +
          'Check your repository name and PR ID.'
        );
      }

      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
        return new Error(
          `Unable to connect to ${this.server}\n` +
          'Please check your network connection and server URL.'
        );
      }

      return new Error(`API request failed: ${axiosError.message}`);
    }

    return error as Error;
  }
}
