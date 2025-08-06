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

  projectAccordionOpen: boolean;
  teamAccordionOpen: boolean;
  assigneeAccordionOpen: boolean;
  labelAccordionOpen: boolean;

  toggleProject: (project: string) => void;
  clearProjects: () => void;
  selectAllProjects: () => void;
  toggleProjectAccordion: () => void;

  toggleTeam: (team: string) => void;
  clearTeams: () => void;
  selectAllTeams: () => void;
  toggleTeamAccordion: () => void;

  toggleAssignee: (assignee: string) => void;
  clearAssignees: () => void;
  selectAllAssignees: () => void;
  toggleAssigneeAccordion: () => void;

  toggleLabel: (label: string) => void;
  clearLabels: () => void;
  selectAllLabels: () => void;
  toggleLabelAccordion: () => void;

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
      projectAccordionOpen: true,
      teamAccordionOpen: true,
      assigneeAccordionOpen: true,

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

      toggleProjectAccordion: () =>
        set(
          (state) => ({
            projectAccordionOpen: !state.projectAccordionOpen,
          }),
          false,
          'toggleProjectAccordion'
        ),

      toggleTeam: (team) =>
        set(
          (state) => {
            let newSelectedTeams;
            const teamList = E_TeamList.map(([id]) => id);

            if (team === 'All') {
              newSelectedTeams = state.selectedTeams.includes('All')
                ? []
                : ['All', ...teamList];
            } else {
              const withoutAll = state.selectedTeams.filter((t) => t !== 'All');

              if (state.selectedTeams.includes(team)) {
                newSelectedTeams = withoutAll.filter((t) => t !== team);
              } else {
                const newList = [...withoutAll, team];

                const allIndividualSelected = teamList.every(
                  (t) => t === 'All' || newList.includes(t)
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

      toggleTeamAccordion: () =>
        set(
          (state) => ({
            teamAccordionOpen: !state.teamAccordionOpen,
          }),
          false,
          'toggleTeamAccordion'
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

      toggleAssigneeAccordion: () =>
        set(
          (state) => ({
            assigneeAccordionOpen: !state.assigneeAccordionOpen,
          }),
          false,
          'toggleAssigneeAccordion'
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
      toggleLabelAccordion: () =>
        set((state) => ({ labelAccordionOpen: !state.labelAccordionOpen })),

      resetAllFilters: () =>
        set(
          {
            selectedProjects: [],
            selectedTeams: [],
            selectedAssignees: [],
            projectAccordionOpen: true,
            teamAccordionOpen: true,
            assigneeAccordionOpen: true,
          },
          false,
          'resetAllFilters'
        ),
    }),
    { name: 'filter-store' }
  )
);
