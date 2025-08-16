// components/Sidebar/index.tsx
import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { AssigneeFilter } from './AssigneeFilter';
import { LabelFilter } from './LabelFilter';
import { ProjectFilter } from './ProjectFilter';
import { TeamFilter } from './TeamFilter';
import { ViewOptions } from './ViewOptions';

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

export function Sidebar({ onReset }: SidebarProps) {
  return (
    <aside className="flex min-h-screen w-[240px] flex-col bg-[#f8f8f8] p-[20px]">
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
        <p className="text-black-8 text-xl font-semibold">필터</p>
        <Button
          variant="ghost"
          type="reset"
          className="text-black-7 flex cursor-pointer items-center text-xl font-semibold duration-200 hover:text-[#ff5555]"
          onClick={onReset}
        >
          <Icon src={ICONS.refresh24} size={24} alt="reset" />
          <p>초기화</p>
        </Button>
      </div>

      {/* 필터 섹션들 */}
      <ProjectFilter />
      <TeamFilter />
      <AssigneeFilter />
      <LabelFilter />
      <ViewOptions />
    </aside>
  );
}
