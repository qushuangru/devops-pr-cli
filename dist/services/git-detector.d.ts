import { RepositoryInfo } from '../types';
export declare class GitDetector {
    private git;
    constructor();
    detectRepository(): Promise<RepositoryInfo>;
    private parseAzureDevOpsUrl;
    getCurrentBranch(): Promise<string>;
    hasUncommittedChanges(): Promise<boolean>;
}
//# sourceMappingURL=git-detector.d.ts.map