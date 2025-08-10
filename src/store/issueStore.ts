import { IssueData } from '@/features/kanban/types/issues';
import { create } from 'zustand';
interface IssueState {
  issues: IssueData[];
  loading: boolean;
  syncing: boolean;
  lastSyncAt: string | null;
  // 초기 데이터 로딩
  loadInitialData: () => void;
  // 이슈 생성/수정
  createIssue: (issueData: Omit<IssueData, 'sb_id' | 'id' | 'number' | 'created_at' | 'updated_at'>) => IssueData;
  updateIssue: (issueId: number, updateData: Partial<IssueData>) => void;
  deleteIssue: (issueId: number) => void;
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
  
  // 초기 데이터 로딩
  loadInitialData: () => {
    const initialIssues: IssueData[] = [
      {
        sb_id: '1',
        html_url: 'test',
        id: '1',
        number: 1,
        state: 'string',
        title: 'test1 제목입니다',
        body: 'test1 본문입니다',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 'DOING',
        sta_dt: new Date().toISOString(),
        end_dt: new Date('2030.03.01').toISOString(),
        assignees: ['송문혁'],
        labels: [],
        parent: '',
        project: 'Blolet',
        team: 'FE',
        repo: '',
        task_priority: 'high',
        pinned: false,
      },
      {
        sb_id: '2',
        html_url: 'test',
        id: '2',
        number: 2,
        state: 'string',
        title: 'test2 제목입니다',
        body: 'test2 본문입니다',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 'TODO',
        sta_dt: new Date().toISOString(),
        end_dt: new Date('2030.03.01').toISOString(),
        assignees: ['박경우'],
        labels: [],
        parent: '',
        project: 'Blolet',
        team: 'BE',
        repo: '',
        task_priority: 'high',
        pinned: false,
      },
    ];
    
    set({ issues: initialIssues });
  },
  
  // 이슈 생성/수정
  createIssue: (issueData) => {
    const newId = Date.now();
    const newIssue: IssueData = {
      ...issueData,
      sb_id: `local_${newId}`,
      id: newId.toString(),
      number: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set((state) => ({
      issues: [...state.issues, newIssue]
    }));
    
    return newIssue;
  },

  updateIssue: (issueId: number, updateData: Partial<IssueData>) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.number === issueId
          ? { ...issue, ...updateData, updated_at: new Date().toISOString() }
          : issue
      )
    }));
  },

  deleteIssue: (issueId: number) => {
    set((state) => ({
      issues: state.issues.filter((issue) => issue.number !== issueId)
    }));
  },

  // GitHub API 관련
  fetchIssuesFromGitHub: (repoName: string) => {
    return new Promise(() => {});
  },
  syncWithGitHub: (repoName: string) => {
    return new Promise(() => {});
  },
  // 칸반보드 관리
  updateProgress: (issueId: number, progress: IssueData['progress']) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.number === issueId
          ? { ...issue, progress, updated_at: new Date().toISOString() }
          : issue
      )
    }));
  },
  moveIssue: (issueId: number, newProgress: IssueData['progress']) => {
    return new Promise((resolve) => {
      get().updateProgress(issueId, newProgress);
      resolve();
    });
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
  getIssuesByProgress: (progress: IssueData['progress']) => {
    return get().issues.filter(issue => issue.progress === progress);
  },
  getIssuesByTeam: (team: string) => {
    return get().issues.filter(issue => issue.team === team);
  },
  searchIssues: (query: string) => {
    return get().issues.filter(issue => 
      issue.title.toLowerCase().includes(query.toLowerCase()) ||
      issue.body.toLowerCase().includes(query.toLowerCase())
    );
  },
  // 유틸리티
  getIssueById: (id: number) => {
    return get().issues.find(issue => issue.number === id);
  },
  clearIssues: () => {
    set({ issues: [] });
  },
}));
