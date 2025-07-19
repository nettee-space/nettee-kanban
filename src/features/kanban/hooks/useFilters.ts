// hooks/useFilters.ts
import { useState } from 'react';

interface FilterState {
  selectedProject: string[];
  selectedTeam: string[];
  selectedAssignee: string[];
}

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    selectedProject: [],
    selectedTeam: [],
    selectedAssignee: [],
  });

  const updateProjectFilter = (projects: string[]) => {
    setFilters((prev) => ({ ...prev, selectedProject: projects }));
  };

  const updateTeamFilter = (teams: string[]) => {
    setFilters((prev) => ({ ...prev, selectedTeam: teams }));
  };

  const updateAssigneeFilter = (assignees: string[]) => {
    setFilters((prev) => ({ ...prev, selectedAssignee: assignees }));
  };

  const handleProjectToggle = (proj: string) => {
    if (proj === 'All') {
      updateProjectFilter(['All']);
      return;
    }

    setFilters((prev) => {
      const current = prev.selectedProject;
      const activeProject = current.includes(proj)
        ? current.filter((p) => p !== proj)
        : [...current.filter((p) => p !== 'All'), proj];

      const newProjects = activeProject.length === 0 ? ['All'] : activeProject;

      return {
        ...prev,
        selectedProject: newProjects,
      };
    });
  };

  const handleTeamToggle = (team: string) => {
    if (team === 'All') {
      updateTeamFilter(['All']);
      return;
    }

    setFilters((prev) => {
      const current = prev.selectedTeam;
      const activeTeam = current.includes(team)
        ? current.filter((t) => t !== team)
        : [...current.filter((t) => t !== 'All'), team];

      const newTeams = activeTeam.length === 0 ? ['All'] : activeTeam;

      return {
        ...prev,
        selectedTeam: newTeams,
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      selectedProject: [],
      selectedTeam: [],
      selectedAssignee: [],
    });
  };

  return {
    filters,
    updateProjectFilter: handleProjectToggle,
    updateTeamFilter: handleTeamToggle,
    updateAssigneeFilter,
    resetFilters,
  };
};
