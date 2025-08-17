// components/KanbanBoard/index.tsx
import { Fragment, useState } from 'react';

import { Divider } from '@/shared/components/ui/divider';

import { GroupedIssues, KanbanProgress } from '../../types/issues';
import { ProjectHeader } from './ProjectHeader';
import { TeamBoard } from './Team/TeamBoard';

interface KanbanBoardProps {
  groupedIssues: GroupedIssues;
  pinnedIssues: GroupedIssues;
  accordionMap: Record<string, boolean>;
  onAccordionToggle: (key: string) => void;
  addIssue?: (issueData: any) => void;

  // onPin: (
  //   project: string,
  //   team: string,
  //   progress: string,
  //   cardId: number
  // ) => void;
  // onUnpin: (
  //   project: string,
  //   team: string,
  //   progress: string,
  //   cardId: number
  // ) => void;
}

export function ProjectKanban({
  groupedIssues,
  pinnedIssues,
  accordionMap,
  onAccordionToggle,
  addIssue,
  // onPin,
  // onUnpin,
}: KanbanBoardProps) {
  const [isOpened, setIsOpened] = useState(false);
  const getPinnedList = (
    pinned: GroupedIssues,
    project: string,
    team: string,
    progress: string
  ) => {
    return pinned?.[project]?.[team]?.[progress as KanbanProgress] ?? [];
  };

  const handleToggleKanban = (key: string) => {
    return setIsOpened((v) => !v);
  };
  return (
    <section className="flex h-full w-full flex-col gap-[16px] px-[40px] pt-[60px]">
      {Object.entries(groupedIssues).map(([project, teams]) => (
        // todo: project별 고유한 id가 필요
        <Fragment key={`${project}`}>
          <ProjectHeader
            isOpened={isOpened}
            onOpen={handleToggleKanban}
            title={project}
          />
          {/* 팀별 칸반 보드들 */}
          {isOpened && <TeamBoard teams={teams} addIssue={addIssue} />}
          <Divider />
        </Fragment>
      ))}
    </section>
  );
}
