// components/Sidebar/index.tsx
import { AssigneeFilter } from './AssigneeFilter';
import { LabelFilter, ViewOptions } from './LabelFilter';
import { ProjectFilter } from './ProjectFilter';
import { TeamFilter } from './TeamFilter';

interface SidebarProps {
  filters: {
    selectedProject: string[];
    selectedTeam: string[];
    selectedAssignee: string[];
  };
  accordionMap: Record<string, boolean>;
  onProjectToggle: (project: string) => void;
  onTeamToggle: (team: string) => void;
  onAccordionToggle: (key: string) => void;
  onReset: () => void;
}

export function Sidebar({
  filters,
  accordionMap,
  onProjectToggle,
  onTeamToggle,
  onAccordionToggle,
  onReset,
}: SidebarProps) {
  return (
    <aside className="flex w-[240px] flex-col bg-[#f8f8f8] p-[20px]">
      {/* 헤더 섹션 */}
      <div className="flex flex-col gap-[40px]">
        <h1 className="text-center text-[24px] font-bold">Nettee's KanBan</h1>
        <input
          className="rounded-[4px] border border-[#dbdbdb] bg-white px-[12px] py-[6px]"
          type="search"
          placeholder="검색"
        />
      </div>

      {/* 필터 제어 섹션 */}
      <div className="flex items-center justify-between pt-[20px] pb-[10px]">
        <p className="py-[6px]">필터</p>
        <button
          type="reset"
          className="duration-200 hover:text-[#ff5555]"
          onClick={onReset}
        >
          초기화
        </button>
      </div>

      {/* 필터 섹션들 */}
      <ProjectFilter
        selectedProjects={filters.selectedProject}
        isOpen={accordionMap['sidebar-project']}
        onToggle={onProjectToggle}
        onAccordionToggle={() => onAccordionToggle('sidebar-project')}
      />

      <TeamFilter
        selectedTeams={filters.selectedTeam}
        isOpen={accordionMap['sidebar-team']}
        onToggle={onTeamToggle}
        onAccordionToggle={() => onAccordionToggle('sidebar-team')}
      />

      <AssigneeFilter
        selectedTeams={filters.selectedTeam}
        selectedAssignees={filters.selectedAssignee}
        isOpen={accordionMap['sidebar-assignee']}
        onTeamToggle={onTeamToggle}
        onAccordionToggle={() => onAccordionToggle('sidebar-assignee')}
      />

      <LabelFilter
        isOpen={accordionMap['sidebar-label']}
        onAccordionToggle={() => onAccordionToggle('sidebar-label')}
      />

      <ViewOptions
        isOpen={accordionMap['sidebar-more']}
        onAccordionToggle={() => onAccordionToggle('sidebar-more')}
      />
    </aside>
  );
}
