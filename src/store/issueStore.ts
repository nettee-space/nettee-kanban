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
  createIssue: (
    issueData: Omit<
      IssueData,
      'sb_id' | 'id' | 'number' | 'created_at' | 'updated_at'
    >
  ) => IssueData;
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
  reorderIssues: (
    sourceId: number,
    targetProject: string,
    targetTeam: string,
    targetProgress: IssueData['progress'],
    beforeId?: number | null
  ) => void;
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
    const teams = ['FE', 'BE', 'UX/UI', 'PL', 'Lead'];
    const statuses: IssueData['progress'][] = ['TODO', 'DOING', 'DONE'];
    const assignees = [
      '송문혁',
      '박경우',
      '나선오',
      '이재상',
      '강민성',
      '박지성',
      '장은영',
    ];
    const priorities: IssueData['task_priority'][] = ['low', 'medium', 'high'];

    const sampleTitles = [
      'React 컴포넌트 리팩토링',
      'API 엔드포인트 개발',
      '사용자 인터페이스 디자인 개선',
      '데이터베이스 스키마 최적화',
      '테스트 케이스 작성',
      '버그 수정 및 코드 리뷰',
      '성능 최적화 작업',
      '문서화 및 가이드라인 작성',
      '배포 파이프라인 구축',
      '보안 취약점 점검',
      '사용자 피드백 반영',
      '프로토타입 제작',
      '크로스 브라우저 호환성 테스트',
      '모바일 반응형 개발',
      '프로젝트 요구사항 분석',
    ];

    const sampleBodies = [
      '상세한 구현 사항과 요구사항을 정리하여 작업을 진행해야 합니다.',
      '기술적 검토와 함께 사용자 경험을 고려한 개발이 필요합니다.',
      '팀과의 협업을 통해 일정에 맞춰 완료할 예정입니다.',
      '현재 진행 상황을 체크하고 다음 단계를 계획 중입니다.',
      '품질 보장을 위한 테스트와 검증 과정이 포함됩니다.',
    ];

    const initialIssues: IssueData[] = [];
    let issueId = 1;

    teams.forEach((team) => {
      statuses.forEach((status) => {
        // 각 팀의 각 상태마다 2-4개의 랜덤 이슈 생성
        const issueCount = Math.floor(Math.random() * 3) + 2; // 2-4개

        for (let i = 0; i < issueCount; i++) {
          const randomTitle =
            sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
          const randomBody =
            sampleBodies[Math.floor(Math.random() * sampleBodies.length)];
          const randomAssignee =
            assignees[Math.floor(Math.random() * assignees.length)];
          const randomPriority =
            priorities[Math.floor(Math.random() * priorities.length)];

          initialIssues.push({
            sb_id: issueId.toString(),
            html_url: `#issue-${issueId}`,
            id: issueId.toString(),
            number: issueId,
            state: 'open',
            title: `[${team}] ${randomTitle}`,
            body: randomBody,
            created_at: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
            progress: status,
            sta_dt: new Date().toISOString(),
            end_dt: new Date(
              Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
            assignees: [randomAssignee],
            labels: [],
            parent: '',
            project: 'Blolet',
            team: team,
            repo: '',
            task_priority: randomPriority,
            pinned: Math.random() < 0.1, // 10% 확률로 핀 설정
          });

          issueId++;
        }
      });
    });

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
      issues: [...state.issues, newIssue],
    }));

    return newIssue;
  },

  updateIssue: (issueId: number, updateData: Partial<IssueData>) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.number === issueId
          ? { ...issue, ...updateData, updated_at: new Date().toISOString() }
          : issue
      ),
    }));
  },

  deleteIssue: (issueId: number) => {
    set((state) => ({
      issues: state.issues.filter((issue) => issue.number !== issueId),
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
      ),
    }));
  },
  moveIssue: (issueId: number, newProgress: IssueData['progress']) => {
    return new Promise((resolve) => {
      get().updateProgress(issueId, newProgress);
      resolve();
    });
  },
  reorderIssues: (
    sourceId: number,
    targetProject: string,
    targetTeam: string,
    targetProgress: IssueData['progress'],
    beforeId?: number | null
  ) => {
    set((state) => {
      const issues = [...state.issues];

      // 이동할 이슈 찾기
      const sourceIndex = issues.findIndex(
        (issue) => issue.number === sourceId
      );
      if (sourceIndex === -1) return state;

      const sourceIssue = issues[sourceIndex];

      // 이슈를 배열에서 제거
      issues.splice(sourceIndex, 1);

      // 업데이트된 이슈 (프로젝트, 팀, 상태 변경)
      const updatedIssue = {
        ...sourceIssue,
        project: targetProject,
        team: targetTeam,
        progress: targetProgress,
        updated_at: new Date().toISOString(),
      };

      // 타겟 위치 찾기
      if (beforeId === null || beforeId === -1) {
        // 맨 뒤에 삽입
        issues.push(updatedIssue);
      } else {
        // beforeId 이슈 앞에 삽입
        const targetIndex = issues.findIndex(
          (issue) => issue.number === beforeId
        );
        if (targetIndex === -1) {
          issues.push(updatedIssue);
        } else {
          issues.splice(targetIndex, 0, updatedIssue);
        }
      }

      return { issues };
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
    return get().issues.filter((issue) => issue.progress === progress);
  },
  getIssuesByTeam: (team: string) => {
    return get().issues.filter((issue) => issue.team === team);
  },
  searchIssues: (query: string) => {
    return get().issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.body.toLowerCase().includes(query.toLowerCase())
    );
  },
  // 유틸리티
  getIssueById: (id: number) => {
    return get().issues.find((issue) => issue.number === id);
  },
  clearIssues: () => {
    set({ issues: [] });
  },
}));
