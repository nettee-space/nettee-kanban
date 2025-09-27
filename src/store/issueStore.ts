import { create } from 'zustand';

import {
  stateKeyToTaskPriorityId,
  taskPriorityIdToStateKey,
} from '@/features/kanban/constants/kanban';
import { useFilterStore } from '@/features/kanban/store/filterStore';
import { IssueData } from '@/features/kanban/types/issues';
import { toKoreanDateString } from '@/shared/components/ui/datetime-picker';
import {
  createKanbanTask,
  deleteKanbanTask,
  getAllTasks,
  updateKanbanTask,
} from '@/supabase/api/kanbanTask';
import { KanbanTask } from '@/supabase/types/kanban/task';

// 팀 이름으로 team_id를 찾는 헬퍼 함수
const findTeamIdByName = (teamName: string): number | null => {
  const filterStore = useFilterStore.getState();
  const team = filterStore.teamList.find(
    ([id, name]) => name === teamName || id === teamName
  );
  return team ? parseInt(team[0]) : null;
};

// 프로젝트 이름으로 project_id를 찾는 헬퍼 함수
const findProjectIdByName = (projectName: string): number | null => {
  const filterStore = useFilterStore.getState();
  const project = filterStore.projectList.find(
    ([id, name]) => name === projectName || id === projectName
  );
  return project ? parseInt(project[0]) : null;
};

// team_id로 팀 이름을 찾는 헬퍼 함수
const findTeamNameById = (teamId: number): string => {
  const filterStore = useFilterStore.getState();
  const team = filterStore.teamList.find(([id]) => parseInt(id) === teamId);
  return team ? team[1] : teamId.toString();
};

// project_id로 프로젝트 이름을 찾는 헬퍼 함수
const findProjectNameById = (projectId: number): string => {
  const filterStore = useFilterStore.getState();
  const project = filterStore.projectList.find(
    ([id]) => parseInt(id) === projectId
  );
  return project ? project[1] : projectId.toString();
};

// 프로젝트/팀 ID를 이름으로 변환하는 매핑 함수들
export const mapProjectIdToName = (projectId: number | string): string => {
  const filterStore = useFilterStore.getState();
  const id = typeof projectId === 'string' ? parseInt(projectId) : projectId;

  console.log(`🔄 Project 매핑 시도: ID(${projectId}) → 파싱된 ID(${id})`);
  console.log(`🔄 사용 가능한 projectList:`, filterStore.projectList);

  if (isNaN(id)) {
    console.error(`❌ Project ID 파싱 실패: ${projectId} → NaN`);
    return projectId.toString();
  }

  console.log('filterStore.projectList', filterStore.projectList);
  const project = filterStore.projectList.find(([pId]) => parseInt(pId) === id);
  const name = project ? project[1] : id.toString();
  return name;
};

export const mapTeamIdToName = (teamId: number | string): string => {
  const filterStore = useFilterStore.getState();
  const id = typeof teamId === 'string' ? parseInt(teamId) : teamId;

  console.log(`🔄 Team 매핑 시도: ID(${teamId}) → 파싱된 ID(${id})`);
  console.log(`🔄 사용 가능한 teamList:`, filterStore.teamList);

  if (isNaN(id)) {
    console.error(`❌ Team ID 파싱 실패: ${teamId} → NaN`);
    return teamId.toString();
  }

  const team = filterStore.teamList.find(([tId]) => parseInt(tId) === id);
  const name = team ? team[1] : id.toString();
  console.log(`🔄 Team 매핑 결과: ID(${id}) → Name(${name})`);
  return name;
};

// 반대 매핑: 이름을 ID로 변환
export const mapProjectNameToId = (projectName: string): number | null => {
  const filterStore = useFilterStore.getState();
  const project = filterStore.projectList.find(
    ([, name]) => name === projectName
  );
  const id = project ? parseInt(project[0]) : null;
  console.log(`🔄 Project 역매핑: Name(${projectName}) → ID(${id})`);
  return id;
};

export const mapTeamNameToId = (teamName: string): number | null => {
  const filterStore = useFilterStore.getState();
  const team = filterStore.teamList.find(([, name]) => name === teamName);
  const id = team ? parseInt(team[0]) : null;
  console.log(`🔄 Team 역매핑: Name(${teamName}) → ID(${id})`);
  return id;
};

interface IssueState {
  issues: IssueData[]; // UI용 변환된 데이터 (기존 호환성 유지)
  kanbanTasks: KanbanTask[]; // Supabase 원본 데이터
  loading: boolean;
  syncing: boolean;
  lastSyncAt: string | null;
  // 초기 데이터 로딩
  loadInitialData: () => void;
  // Supabase 연동 데이터 로딩
  loadTasksFromSupabase: (filters?: {
    project_id?: number;
    task_priority_id?: number;
    kaban_user_id?: string;
  }) => Promise<void>;
  // 이슈 생성/수정 (Supabase 연동)
  createIssue: (
    issueData: Omit<
      IssueData,
      'sb_id' | 'id' | 'number' | 'created_at' | 'updated_at'
    >
  ) => Promise<IssueData>;
  createIssueToSupabase: (
    issueData: Omit<
      IssueData,
      'sb_id' | 'id' | 'number' | 'created_at' | 'updated_at'
    >
  ) => Promise<IssueData | null>;
  updateIssue: (issueId: number, updateData: Partial<IssueData>) => void;
  updateIssueToSupabase: (
    issueId: number,
    updateData: Partial<IssueData>
  ) => Promise<IssueData | null>;
  deleteIssue: (issueId: number) => void;
  deleteIssueFromSupabase: (issueId: number) => Promise<void>;
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
  // KanbanTask 원본 데이터 관리
  getKanbanTaskById: (id: number) => KanbanTask | undefined;
  updateKanbanTask: (id: number, updates: Partial<KanbanTask>) => void;
  syncIssuesFromKanbanTasks: () => void; // 원본 데이터에서 UI 데이터 동기화
}
// IssueData와 KanbanTask 간의 매핑 함수들
const mapKanbanTaskToIssueData = (task: KanbanTask): IssueData => {
  console.log('🔍 KanbanTask → IssueData 변환:', {
    task_id: task.id,
    project_id: task.project_id,
    team_id: task.team_id,
    title: task.title,
  });

  return {
    sb_id: task.id.toString(),
    html_url: task.repo_url || `#task-${task.id}`,
    id: task.id.toString(),
    number: task.id,
    title: task.title,
    body: task.description,
    created_at: task.create_at || new Date().toISOString(),
    updated_at: task.update_at || new Date().toISOString(),
    progress: task.status, // KanbanTask.status -> IssueData.progress
    sta_dt: task.started_at || toKoreanDateString(new Date()),
    end_dt: task.ended_at || toKoreanDateString(new Date()),
    assignees: task.kaban_user_id ? [task.kaban_user_id] : [], // 단일 사용자를 배열로 변환
    labels: task.task_priority_id
      ? [taskPriorityIdToStateKey(task.task_priority_id)]
      : [], // task_priority_id를 라벨로 포함
    parent: task.parent_task_id?.toString() || '',
    project: task.project_id ? mapProjectIdToName(task.project_id) : '', // project_id를 이름으로 변환
    team: mapTeamIdToName(task.team_id), // team_id를 이름으로 변환
    repo: task.repo_url || '',
    task_priority: task.task_priority_id
      ? taskPriorityIdToStateKey(task.task_priority_id)
      : 'medium', // task_priority_id를 stateKey로 변환
    pinned: false, // KanbanTask에 pinned 필드가 없어서 기본값 사용
  };
};

const mapIssueDataToKanbanTask = (
  issue: Partial<IssueData>
): Partial<KanbanTask> => {
  // 팀 이름을 team_id로 매핑 (새로운 매핑 함수 사용)
  let teamId = issue.team ? mapTeamNameToId(issue.team) : null;

  // 프로젝트 이름을 project_id로 매핑 (새로운 매핑 함수 사용)
  let projectId = issue.project ? mapProjectNameToId(issue.project) : null;

  // 매핑 실패 시 기본값 사용 (테스트용)
  if (!teamId && issue.team) {
    console.warn(`팀 "${issue.team}"을 찾을 수 없습니다. 기본값 1 사용`);
    teamId = 1; // 기본 팀 ID
  }

  if (!projectId && issue.project) {
    console.warn(
      `프로젝트 "${issue.project}"를 찾을 수 없습니다. 기본값 1 사용`
    );
    projectId = 1; // 기본 프로젝트 ID
  }

  console.log('팀 매핑:', { teamName: issue.team, teamId });
  console.log('프로젝트 매핑:', { projectName: issue.project, projectId });

  const result = {
    ...(issue.title && { title: issue.title }),
    ...(issue.body && { description: issue.body }),
    ...(issue.progress && { status: issue.progress }),
    ...(issue.sta_dt && { started_at: issue.sta_dt }),
    ...(issue.end_dt && { ended_at: issue.end_dt }),
    template_id: null, // IssueData에 해당 필드 없음
    ...(issue.repo && { repo_url: issue.repo }),
    ...(issue.assignees &&
      issue.assignees.length > 0 && { kaban_user_id: issue.assignees[0] }),
    ...(issue.task_priority && {
      task_priority_id: stateKeyToTaskPriorityId(issue.task_priority),
    }),
    ...(projectId && { project_id: projectId }),
    ...(issue.parent && { parent_task_id: parseInt(issue.parent) }),
    ...(teamId && { team_id: teamId }),
  };

  // 필수 필드 확인
  if (!result.team_id) {
    console.error('❌ team_id가 없습니다! Supabase 저장 실패 예상');
  }

  return result;
};

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  kanbanTasks: [], // 원본 KanbanTask 데이터
  loading: false,
  syncing: false,
  lastSyncAt: new Date().toISOString(),

  // 초기 데이터 로딩
  loadInitialData: () => {
    // 동적 팀 목록 사용
    const filterStore = useFilterStore.getState();
    const teams = filterStore.teamList
      .filter(([id]) => id !== 'All')
      .map(([, name]) => name);
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
            title: `[${team}] ${randomTitle}`,
            body: randomBody,
            created_at: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
            progress: status,
            sta_dt: toKoreanDateString(new Date()),
            end_dt: toKoreanDateString(
              new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000)
            ),
            assignees: [randomAssignee],
            labels: [],
            parent: '',
            project:
              filterStore.projectList.find(([id]) => id !== 'All')?.[1] ||
              'Default',
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

  // Supabase에서 태스크 데이터 로딩
  loadTasksFromSupabase: async (filters) => {
    try {
      set({ loading: true });

      // 팀과 프로젝트 목록이 로드되었는지 확인하고 필요하면 로드
      const filterStore = useFilterStore.getState();
      if (filterStore.teamList.length <= 1) {
        // 'All'만 있는 경우
        console.log('🔄 팀 목록 로딩 중...');
        await filterStore.loadTeamList();
      }
      if (filterStore.projectList.length <= 1) {
        // 'All'만 있는 경우
        console.log('🔄 프로젝트 목록 로딩 중...');
        await filterStore.loadProjectList();
      }

      console.log('📋 Supabase에서 모든 태스크 로딩 중...');
      const tasks = await getAllTasks(filters || {});
      console.log('📋 로드된 전체 태스크 개수:', tasks.length);

      // 원본 KanbanTask 데이터와 변환된 IssueData 모두 저장
      const mappedIssues = tasks.map(mapKanbanTaskToIssueData);
      set({ kanbanTasks: tasks, issues: mappedIssues });
      console.log(
        '📋 매핑된 이슈들:',
        mappedIssues.map((i) => ({
          title: i.title,
          project: i.project,
          team: i.team,
        }))
      );

      set({ issues: mappedIssues, loading: false });
    } catch (error) {
      console.error('❌ Supabase 태스크 로드 실패:', error);
      set({ loading: false });
      throw error; // useKanbanData에서 catch하여 더미 데이터 로드
    }
  },

  // 이슈 생성/수정 (로컬 전용)
  createIssue: async (issueData) => {
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

  // Supabase에 이슈 생성
  createIssueToSupabase: async (issueData) => {
    try {
      set({ loading: true });

      // 팀과 프로젝트 목록이 로드되었는지 확인하고 필요하면 로드
      const filterStore = useFilterStore.getState();
      if (filterStore.teamList.length <= 1) {
        // 'All'만 있는 경우
        console.log('팀 목록 로딩 중...');
        await filterStore.loadTeamList();
      }
      if (filterStore.projectList.length <= 1) {
        // 'All'만 있는 경우
        console.log('프로젝트 목록 로딩 중...');
        await filterStore.loadProjectList();
      }

      const newIssueData: IssueData = {
        ...issueData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sta_dt: issueData.sta_dt || toKoreanDateString(new Date()),
        end_dt: issueData.end_dt || toKoreanDateString(new Date()),
        sb_id: '-1',
        id: '-1',
        number: 0,
      };

      console.log('매핑 전 IssueData:', newIssueData);
      console.log('사용 가능한 팀 목록:', filterStore.teamList);
      console.log('사용 가능한 프로젝트 목록:', filterStore.projectList);

      const taskData = mapIssueDataToKanbanTask(newIssueData);
      console.log('매핑 후 KanbanTask:', taskData);

      const createdTask = await createKanbanTask(taskData);

      if (createdTask) {
        const newIssue = mapKanbanTaskToIssueData(createdTask);
        set((state) => ({
          issues: [...state.issues, newIssue],
          loading: false,
        }));
        return newIssue;
      } else {
        set({ loading: false });
        return null;
      }
    } catch (error) {
      console.error('Supabase 태스크 생성 실패:', error);
      set({ loading: false });
      return null;
    }
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

  // Supabase 태스크 업데이트
  updateIssueToSupabase: async (
    issueId: number,
    updateData: Partial<IssueData>
  ) => {
    try {
      set({ loading: true });
      const taskUpdates = mapIssueDataToKanbanTask({
        ...updateData,
        updated_at: new Date().toISOString(),
      });
      const updatedTask = await updateKanbanTask(issueId, taskUpdates);

      if (updatedTask) {
        const updatedIssue = mapKanbanTaskToIssueData(updatedTask);
        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.number === issueId ? updatedIssue : issue
          ),
          loading: false,
        }));
        return updatedIssue;
      } else {
        set({ loading: false });
        return null;
      }
    } catch (error) {
      console.error('Supabase 태스크 업데이트 실패:', error);
      set({ loading: false });
      return null;
    }
  },

  deleteIssue: (issueId: number) => {
    set((state) => ({
      issues: state.issues.filter((issue) => issue.number !== issueId),
    }));
  },

  // Supabase 태스크 삭제
  deleteIssueFromSupabase: async (issueId: number) => {
    try {
      set({ loading: true });
      await deleteKanbanTask(issueId);
      set((state) => ({
        issues: state.issues.filter((issue) => issue.number !== issueId),
        loading: false,
      }));
    } catch (error) {
      console.error('Supabase 태스크 삭제 실패:', error);
      set({ loading: false });
    }
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
  togglePin: async (issueId: number) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.number === issueId
          ? {
              ...issue,
              pinned: !issue.pinned,
              updated_at: new Date().toISOString(),
            }
          : issue
      ),
    }));

    // Supabase 업데이트 - 현재 구조에서는 pinned 필드가 없으므로 향후 확장 고려
    // updateKanbanTask를 통해 업데이트할 수 있지만 KanbanTask 타입에 pinned 필드가 필요
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
    set({ issues: [], kanbanTasks: [] });
  },

  // KanbanTask 원본 데이터 관리
  getKanbanTaskById: (id: number) => {
    return get().kanbanTasks.find((task) => task.id === id);
  },

  updateKanbanTask: (id: number, updates: Partial<KanbanTask>) => {
    const state = get();
    const updatedTasks = state.kanbanTasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );

    // 원본 데이터 업데이트 후 UI 데이터 동기화
    set({ kanbanTasks: updatedTasks });
    get().syncIssuesFromKanbanTasks();
  },

  syncIssuesFromKanbanTasks: () => {
    const state = get();
    const convertedIssues = state.kanbanTasks.map(mapKanbanTaskToIssueData);
    set({ issues: convertedIssues });
  },
}));
