// stores/filterStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { dummyLabels, E_TeamList, projectList } from '../constants/kanban';
import { netteeMembers } from '../constants/nettee';

interface FilterState {
  selectedProjects: string[];
  selectedTeams: string[];
  selectedAssignees: string[];
  selectedLabels: string[];

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

  resetAllFilters: () => void;

  getFilteredData?: (data: any[]) => any[];
}

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      selectedProjects: [],
      selectedTeams: [],
      selectedAssignees: [],
      selectedLabels: [],

      toggleProject: (project) =>
        set(
          (state) => {
            let newSelectedProjects;

            if (project === 'All') {
              newSelectedProjects = state.selectedProjects.includes('All')
                ? []
                : ['All', ...projectList];
            } else {
              const withoutAll = state.selectedProjects.filter(
                (p) => p !== 'All'
              );

              if (state.selectedProjects.includes(project)) {
                newSelectedProjects = withoutAll.filter((p) => p !== project);
              } else {
                const newList = [...withoutAll, project];

                const allIndividualSelected = projectList.every(
                  (p) => p === 'All' || newList.includes(p)
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
          () => ({
            selectedProjects: ['All', ...projectList],
          }),
          false,
          'selectAllProjects'
        ),

      toggleTeam: (team) =>
        set(
          (state) => {
            let newSelectedTeams;
            const teamList = E_TeamList.map(([id]) => id);
            console.log(team, teamList);

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

                const allIndividualSelected = teamList.every((t) =>
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
          () => ({
            selectedTeams: ['All', ...E_TeamList.map(([id]) => id)],
          }),
          false,
          'selectAllTeams'
        ),

      toggleAssignee: (assignee) =>
        set(
          (state) => {
            let newSelectedAssignees;
            const allMembers = Object.values(netteeMembers).flat();

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
            const allMembers = Object.values(netteeMembers).flat();
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

      resetAllFilters: () =>
        set(
          {
            selectedProjects: [],
            selectedTeams: [],
            selectedAssignees: [],
          },
          false,
          'resetAllFilters'
        ),
    }),
    { name: 'filter-store' }
  )
);
