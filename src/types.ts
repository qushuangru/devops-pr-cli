// Configuration types
export interface Config {
  server: string;
  /** @deprecated Organization is now auto-detected from git remote URL */
  organization?: string;
  /** @deprecated Project is now auto-detected from git remote URL */
  project?: string;
  pat: string;
  defaults: {
    targetBranch: string;
  };
}

// Git repository info
export interface RepositoryInfo {
  currentBranch: string;
  remoteName: string;
  remoteUrl: string;
  server: string;
  organization: string;
  project: string;
  repositoryName: string;
}

// Azure DevOps API types
export interface PullRequest {
  pullRequestId: number;
  title: string;
  description: string;
  sourceRefName: string;
  targetRefName: string;
  status: 'active' | 'completed' | 'abandoned';
  createdBy: Identity;
  creationDate: string;
  mergeStatus: string;
  isDraft: boolean;
  url: string;
  repository: Repository;
  reviewers?: Reviewer[];
}

export interface Identity {
  displayName: string;
  id: string;
  uniqueName: string;
  imageUrl?: string;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  webUrl?: string;
}

export interface Reviewer {
  id: string;
  displayName: string;
  vote: number;
  hasDeclined: boolean;
}

export interface Thread {
  id: number;
  status: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  author: Identity;
  publishedDate: string;
}

// Command parameters
export interface CreatePRParams {
  repositoryId: string;
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description: string;
  draft?: boolean;
  reviewers?: string[];
}

export interface ListPRParams {
  repositoryId: string;
  state?: 'active' | 'completed' | 'abandoned' | 'all';
  limit?: number;
  creatorId?: string;
  targetBranch?: string;
}
