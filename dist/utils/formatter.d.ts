import { PullRequest, RepositoryInfo } from '../types';
export declare class Formatter {
    static formatPRList(prs: PullRequest[]): string;
    static formatPRDetail(pr: PullRequest, repoInfo: RepositoryInfo, threads?: any[]): string;
    private static formatStatus;
    private static formatVote;
}
//# sourceMappingURL=formatter.d.ts.map