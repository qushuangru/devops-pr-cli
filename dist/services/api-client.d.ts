import { Config, PullRequest, ListPRParams, CreatePRParams, Thread, RepositoryInfo } from '../types';
export declare class AzureDevOpsClient {
    private readonly axiosInstance;
    private readonly server;
    constructor(config: Config, repoInfo?: RepositoryInfo);
    getServer(): string;
    createPR(params: CreatePRParams): Promise<PullRequest>;
    listPRs(params: ListPRParams): Promise<PullRequest[]>;
    getPR(repositoryId: string, pullRequestId: number): Promise<PullRequest>;
    getPRThreads(repositoryId: string, pullRequestId: number): Promise<Thread[]>;
    getRepositoryId(repositoryName: string): Promise<string>;
    private handleError;
}
//# sourceMappingURL=api-client.d.ts.map