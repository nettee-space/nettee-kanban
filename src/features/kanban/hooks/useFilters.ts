// hooks/useFilters.ts
import { useState } from 'react';

import { useFilterStore } from '../store/filterStore';

interface FilterState {
  selectedProject: string[];
  selectedTeam: string[];
  selectedAssignee: string[];
}

export const useFilters = () => {
  const { projectList, teamList } = useFilterStore();
  const allProjects = projectList
    .filter(([id]) => id !== 'All')
    .map(([id]) => id);
  const allTeams = teamList
    .filter(([id]) => id !== 'All')
    .map(([id]) => id);

  const [filters, setFilters] = useState<FilterState>({
    selectedProject: [''],
    selectedTeam: [''],
    selectedAssignee: [],
  });

  const isAllSelected = (list: string[], allItems: string[]) =>
    allItems.every((item) => list.includes(item));

  const updateProjectFilter = (proj: string) => {
    setFilters((prev) => {
      let updated = [...prev.selectedProject];

      if (proj === 'All') {
        updated = ['All', ...allProjects];
      } else if (updated.includes(proj)) {
        updated = updated.filter((p) => p !== proj && p !== 'All');
      } else {
        updated = [...updated, proj].filter((p) => p !== 'All');
      }

      if (isAllSelected(updated, allProjects)) {
        updated = ['All', ...allProjects];
      }

      return { ...prev, selectedProject: updated };
    });
  };

  const updateTeamFilter = (team: string) => {
    setFilters((prev) => {
      let updated = [...prev.selectedTeam];

      if (team === 'All') {
        updated = ['All', ...allTeams];
      } else if (updated.includes(team)) {
        updated = updated.filter((t) => t !== team && t !== 'All');
      } else {
        updated = [...updated, team].filter((t) => t !== 'All');
      }

      if (isAllSelected(updated, allTeams)) {
        updated = ['All', ...allTeams];
      }

      return { ...prev, selectedTeam: updated };
    });
  };

  const resetFilters = () => {
    setFilters({
      selectedProject: ['All'],
      selectedTeam: ['All'],
      selectedAssignee: [],
    });
  };

  return {
    filters,
    updateProjectFilter,
    updateTeamFilter,
    updateAssigneeFilter: () => {},
    resetFilters,
  };
};
