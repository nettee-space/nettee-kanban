// stores/filterStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { useUserStore } from '@/store/userStore';

import {
  DEFAULT_PROJECT_LIST,
  DEFAULT_TEAM_LIST,
  dummyLabels,
  fetchProjectList,
  fetchTeamList,
} from '../constants/kanban';

interface FilterState {
  // 필터 상태
  selectedProjects: string[];
  selectedTeams: string[];
  selectedAssignees: string[];
  selectedLabels: string[];

  // 새로운 필터 상태
  showPinnedOnly: boolean;
  showGithubOnly: boolean;

  // 데이터 목록 상태
  teamList: [string, string][];
  projectList: [string, string][];

  // 필터 액션
  toggleProject: (project: string) => void;
  clearProjects: () => void;
  selectAllProjects: () => void;

  toggleTeam: (team: string) => void;
  clearTeams: () => void;
  selectAllTeams: () => void;

  toggleAssignee: (assignee: string) => void;
  clearAssignees: () => void;
  selectAllAssignees: () => void;

  toggleLabel: (label: string) => void;
  clearLabels: () => void;
  selectAllLabels: () => void;

  // 새로운 필터 액션
  togglePinnedFilter: () => void;
  toggleGithubFilter: () => void;

  resetAllFilters: () => void;

  // 데이터 로드 액션
  loadTeamList: () => Promise<void>;
  loadProjectList: () => Promise<void>;

  getFilteredData?: (data: any[]) => any[];
}

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      selectedProjects: [],
      selectedTeams: [],
      selectedAssignees: [],
      selectedLabels: [],

      // 새로운 필터 상태 초기값
      showPinnedOnly: false,
      showGithubOnly: false,

      teamList: DEFAULT_TEAM_LIST, // 기본값
      projectList: DEFAULT_PROJECT_LIST, // 기본값

      toggleProject: (project) =>
        set(
          (state) => {
            let newSelectedProjects;

            if (project === 'All') {
              newSelectedProjects = state.selectedProjects.includes('All')
                ? []
                : ['All', ...state.projectList.map(([id]) => id)];
            } else {
              const withoutAll = state.selectedProjects.filter(
                (p) => p !== 'All'
              );

              if (state.selectedProjects.includes(project)) {
                newSelectedProjects = withoutAll.filter((p) => p !== project);
              } else {
                const newList = [...withoutAll, project];

                const allIndividualSelected = state.projectList.every(
                  ([id]) => id === 'All' || newList.includes(id)
                );

                newSelectedProjects = allIndividualSelected
                  ? ['All', ...newList]
                  : newList;
              }
            }

            return { selectedProjects: newSelectedProjects };
          },
          false,
          'toggleProject'
        ),

      clearProjects: () =>
        set({ selectedProjects: [] }, false, 'clearProjects'),

      selectAllProjects: () =>
        set(
          (state) => ({
            selectedProjects: ['All', ...state.projectList.map(([id]) => id)],
          }),
          false,
          'selectAllProjects'
        ),

      toggleTeam: (team) =>
        set(
          (state) => {
            let newSelectedTeams;
            const teamList = state.teamList
              .map(([id]) => id)
              .filter((id: string) => id !== 'All');

            if (team === 'All') {
              // "All"을 클릭하면 토글 방식으로 동작
              newSelectedTeams = state.selectedTeams.includes('All')
                ? []
                : ['All', ...teamList];
            } else {
              // 개별 팀을 클릭할 때
              if (state.selectedTeams.includes(team)) {
                // 이미 선택된 팀을 클릭하면 해제
                const withoutTeam = state.selectedTeams.filter(
                  (t) => t !== team
                );
                // "All"이 선택되어 있었다면 "All"도 함께 해제
                newSelectedTeams = withoutTeam.filter((t) => t !== 'All');
              } else {
                // 선택되지 않은 팀을 클릭하면 추가
                const withoutAll = state.selectedTeams.filter(
                  (t) => t !== 'All'
                );
                const newList = [...withoutAll, team];

                const allIndividualSelected = teamList.every((t: string) =>
                  newList.includes(t)
                );

                newSelectedTeams = allIndividualSelected
                  ? ['All', ...newList]
                  : newList;
              }
            }

            return { selectedTeams: newSelectedTeams };
          },
          false,
          'toggleTeam'
        ),

      clearTeams: () => set({ selectedTeams: [] }, false, 'clearTeams'),

      selectAllTeams: () =>
        set(
          (state) => ({
            selectedTeams: ['All', ...state.teamList.map(([id]) => id)],
          }),
          false,
          'selectAllTeams'
        ),

      toggleAssignee: (assignee) =>
        set(
          (state) => {
            let newSelectedAssignees;
            // userStore에서 사용자 목록 가져오기
            const userStore = useUserStore.getState();
            const allMembers = userStore.users.map((user) => user.login);

            if (assignee === 'All') {
              newSelectedAssignees = state.selectedAssignees.includes('All')
                ? []
                : ['All', ...allMembers];
            } else {
              const withoutAll = state.selectedAssignees.filter(
                (a) => a !== 'All'
              );

              if (state.selectedAssignees.includes(assignee)) {
                newSelectedAssignees = withoutAll.filter((a) => a !== assignee);
              } else {
                const newList = [...withoutAll, assignee];

                const allIndividualSelected = allMembers.every((a) =>
                  newList.includes(a)
                );

                newSelectedAssignees = allIndividualSelected
                  ? ['All', ...newList]
                  : newList;
              }
            }

            return { selectedAssignees: newSelectedAssignees };
          },
          false,
          'toggleAssignee'
        ),

      clearAssignees: () =>
        set({ selectedAssignees: [] }, false, 'clearAssignees'),

      selectAllAssignees: () =>
        set(
          () => {
            // userStore에서 사용자 목록 가져오기
            const userStore = useUserStore.getState();
            const allMembers = userStore.users.map((user) => user.login);
            return { selectedAssignees: ['All', ...allMembers] };
          },
          false,
          'selectAllAssignees'
        ),

      toggleLabel: (label) =>
        set((state) => {
          const exists = state.selectedLabels.includes(label);
          const next = exists
            ? state.selectedLabels.filter((l) => l !== label)
            : [...state.selectedLabels, label];
          return { selectedLabels: next };
        }),

      clearLabels: () => set({ selectedLabels: [] }),
      selectAllLabels: () => set({ selectedLabels: [...dummyLabels] }),

      // 새로운 필터 액션들
      togglePinnedFilter: () =>
        set(
          (state) => ({ showPinnedOnly: !state.showPinnedOnly }),
          false,
          'togglePinnedFilter'
        ),

      toggleGithubFilter: () =>
        set(
          (state) => ({ showGithubOnly: !state.showGithubOnly }),
          false,
          'toggleGithubFilter'
        ),

      resetAllFilters: () =>
        set(
          {
            selectedProjects: [],
            selectedTeams: [],
            selectedAssignees: [],
            selectedLabels: [],
            showPinnedOnly: false,
            showGithubOnly: false,
          },
          false,
          'resetAllFilters'
        ),

      loadTeamList: async () => {
        try {
          const teamList = await fetchTeamList();
          set({ teamList }, false, 'loadTeamList');
        } catch (error) {
          console.error('팀 목록 로드 실패:', error);
          // 기본값 유지
        }
      },

      loadProjectList: async () => {
        try {
          const projectList = await fetchProjectList();
          set({ projectList }, false, 'loadProjectList');
        } catch (error) {
          console.error('프로젝트 목록 로드 실패:', error);
          // 기본값 유지
        }
      },
    }),
    { name: 'filter-store' }
  )
);
