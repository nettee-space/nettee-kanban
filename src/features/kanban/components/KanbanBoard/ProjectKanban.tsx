// components/KanbanBoard/index.tsx
import { Fragment, useState } from 'react';

import { Divider } from '@/shared/components/ui/divider';
import { mapProjectNameToId } from '@/store/issueStore';

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
  const getPinnedList = (
    pinned: GroupedIssues,
    project: string,
    team: string,
    progress: string
  ) => {
    return pinned?.[project]?.[team]?.[progress as KanbanProgress] ?? [];
  };
  return (
    <section className="flex h-full w-full flex-col gap-[16px] px-[40px] pt-[60px]">
      {Object.entries(groupedIssues).map(([project, teams]) => {
        // 프로젝트 이름을 ID로 변환하여 accordion 키 생성
        const projectId = mapProjectNameToId(project);
        const accordionKey = `kanban-${projectId}`;
        const isOpened = accordionMap[accordionKey] ?? true;
        
        return (
          <Fragment key={`${project}`}>
            <ProjectHeader
              isOpened={isOpened}
              onOpen={onAccordionToggle}
              title={project}
            />
            {/* 팀별 칸반 보드들 */}
            {isOpened && <TeamBoard teams={teams} project={project} addIssue={addIssue} />}
            <Divider />
          </Fragment>
        );
      })}
    </section>
  );
}
