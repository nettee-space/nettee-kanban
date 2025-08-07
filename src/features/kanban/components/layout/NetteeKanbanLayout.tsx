// KanbanLayout.tsx
import { useAccordion } from '../../hooks/useAccordion';
import { useFilters } from '../../hooks/useFilters';
import { useKanbanData } from '../../hooks/useKanbanData';
import { KanbanProgress } from '../../types/issues';
import { ProjectKanban } from '../KanbanBoard/ProjectKanban';
import { Sidebar } from '../Sidebar';

export function NetteeKanbanLayout() {
  // 상태 관리

  // 커스텀 훅들
  const {
    groupedIssues,
    pinnedIssues,
    loading,
    setPinnedIssues,
    setGroupedIssues,
  } = useKanbanData();
  const { filters, updateProjectFilter, updateTeamFilter } = useFilters();
  const { accordionMap, toggleAccordion, resetAccordion } = useAccordion();

  // PIN 기능
  const handlePin = (
    project: string,
    team: string,
    progress: string,
    cardId: string
  ) => {
    setGroupedIssues((prev) => {
      const updated = { ...prev };
      const column = updated[project][team][progress as KanbanProgress];
      const index = column.findIndex((c) => c.id === cardId);

      if (index === -1) return prev;

      const issue = column[index];
      column.splice(index, 1);

      setPinnedIssues((prev) => {
        const existing =
          prev[project]?.[team]?.[progress as KanbanProgress] ?? [];
        const updated = {
          ...(prev[project]?.[team] ?? {}),
          [progress]: [{ ...issue, pinned: true }, ...existing],
        };

        return {
          ...prev,
          [project]: {
            ...(prev[project] ?? {}),
            [team]: updated,
          },
        };
      });

      return updated;
    });
  };

  const handleUnpin = (
    project: string,
    team: string,
    progress: string,
    cardId: string
  ) => {
    setPinnedIssues((prev) => {
      const targetList =
        prev[project]?.[team]?.[progress as KanbanProgress] ?? [];
      const found = targetList.find((c) => c.id === cardId);

      if (!found) return prev;

      const newList = targetList.filter((c) => c.id !== cardId);
      const { pinned, ...restoredIssue } = found;

      setGroupedIssues((prev) => {
        const updated = { ...prev };
        const list = updated[project][team][progress as KanbanProgress];
        const filtered = list.filter((c) => c.id !== cardId);
        updated[project][team][progress as KanbanProgress] = [
          restoredIssue,
          ...filtered,
        ];
        return updated;
      });

      return {
        ...prev,
        [project]: {
          ...prev[project],
          [team]: {
            ...prev[project][team],
            [progress]: newList,
          },
        },
      };
    });
  };

  const handleReset = () => {
    updateProjectFilter('All');
    updateTeamFilter('All');
    resetAccordion();
  };

  // TODO: data loading from supabase
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <main className="flex h-full w-full">
      <Sidebar
        filters={filters}
        accordionMap={accordionMap}
        onProjectToggle={updateProjectFilter}
        onTeamToggle={updateTeamFilter}
        onAccordionToggle={toggleAccordion}
        onReset={handleReset}
      />
      <ProjectKanban
        groupedIssues={groupedIssues}
        pinnedIssues={pinnedIssues}
        accordionMap={accordionMap}
        onAccordionToggle={toggleAccordion}
        // onPin={handlePin}
        // onUnpin={handleUnpin}
      />
    </main>
  );
}
