import { IssueData } from '@/features/kanban/types/issues';
import { create } from 'zustand';
interface IssueState {
  issues: IssueData[];
  loading: boolean;
  syncing: boolean;
  lastSyncAt: string | null;
  // GitHub API 관련
  fetchIssuesFromGitHub: (repoName: string) => Promise<void>;
  syncWithGitHub: (repoName: string) => Promise<void>;
  // 칸반보드 관리
  updateProgress: (issueId: number, progress: IssueData['progress']) => void;
  moveIssue: (
    issueId: number,
    newProgress: IssueData['progress']
  ) => Promise<void>;
  // 서브이슈 관리
  createSubIssue: (
    parentId: number,
    subIssueData: Partial<IssueData>
  ) => Promise<void>;
  getSubIssues: (parentId: number) => IssueData[];
  getMainIssues: () => IssueData[];
  // 메타데이터 관리
  updateMetadata: (
    issueId: number,
    metadata: Partial<
      Pick<IssueData, 'assignees' | 'labels' | 'team' | 'task_priority'>
    >
  ) => Promise<void>;
  togglePin: (issueId: number) => Promise<void>;
  // 필터링/검색
  getIssuesByProgress: (progress: IssueData['progress']) => IssueData[];
  getIssuesByTeam: (team: string) => IssueData[];
  searchIssues: (query: string) => IssueData[];
  // 유틸리티
  getIssueById: (id: number) => IssueData | undefined;
  clearIssues: () => void;
}
export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  loading: false,
  syncing: false,
  lastSyncAt: new Date().toISOString(),
  // GitHub API 관련
  fetchIssuesFromGitHub: (repoName: string) => {
    return new Promise(() => {});
  },
  syncWithGitHub: (repoName: string) => {
    return new Promise(() => {});
  },
  // 칸반보드 관리
  updateProgress: (issueId: number, progress: IssueData['progress']) => null,
  moveIssue: (issueId: number, newProgress: IssueData['progress']) => {
    return new Promise(() => {});
  },
  // 서브이슈 관리
  createSubIssue: (parentId: number, subIssueData: Partial<IssueData>) => {
    return new Promise(() => {});
  },
  getSubIssues: (parentId: number) => [],
  getMainIssues: () => [],
  // 메타데이터 관리
  updateMetadata: (
    issueId: number,
    metadata: Partial<
      Pick<IssueData, 'assignees' | 'labels' | 'team' | 'task_priority'>
    >
  ) => {
    return new Promise(() => {});
  },
  togglePin: (issueId: number) => {
    return new Promise(() => {});
  },
  // 필터링/검색
  getIssuesByProgress: (progress: IssueData['progress']) => [],
  getIssuesByTeam: (team: string) => [],
  searchIssues: (query: string) => [],
  // 유틸리티
  getIssueById: (id: number) => undefined,
  clearIssues: () => null,
}));
