// components/KanbanBoard/index.tsx
import { DragEvent, Fragment } from 'react';
import { GroupedIssues, IssueData, KanbanProgress } from '../../types/issues';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  groupedIssues: GroupedIssues;
  pinnedIssues: GroupedIssues;
  accordionMap: Record<string, boolean>;
  onAccordionToggle: (key: string) => void;
  onDragStart: (e: DragEvent, item: IssueData) => void;
  onDragEnd: (
    e: DragEvent,
    project: string,
    team: string,
    progress: string
  ) => void;
  onDragOver: (e: DragEvent, progress: string) => void;
  onDragLeave: (progress: string) => void;
  onPin: (
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => void;
  onUnpin: (
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => void;
  onOpenModal: (item: Partial<IssueData>) => void;
}

export function KanbanBoard({
  groupedIssues,
  pinnedIssues,
  accordionMap,
  onAccordionToggle,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onPin,
  onUnpin,
  onOpenModal,
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
      {Object.entries(groupedIssues).map(([project, teams]) => (
        <Fragment key={`${project}_kanban`}>
          {/* 프로젝트 헤더 */}
          <div className="flex items-center justify-between px-[16px] py-[8px] text-[32px] font-bold">
            <h2>{project}</h2>
            <button
              className="mx-[16px] my-[8px] flex h-[32px] w-[32px] items-center justify-center text-[24px]"
              onClick={() => onAccordionToggle(`kanban-${project}`)}
            >
              {accordionMap[`kanban-${project}`] ? '▼' : '▲'}
            </button>
          </div>

          {/* 팀별 칸반 보드들 */}
          <div
            className={`flex flex-col gap-[8px] overflow-hidden ${
              accordionMap[`kanban-${project}`] ? 'h-full' : 'h-0'
            }`}
          >
            {Object.entries(teams).map(([team, progressMap]) => (
              <article
                key={`${team}_kanban`}
                className="flex flex-col rounded-[8px] bg-[#f5f5f5] p-[16px] font-medium"
              >
                {/* 팀 헤더 */}
                <div className="flex justify-between">
                  <p className="text-[16px] font-semibold">{team}</p>
                  <button
                    type="button"
                    onClick={() => onAccordionToggle(`${project}-${team}`)}
                  >
                    {accordionMap[`${project}-${team}`] ? '▼' : '▲'}
                  </button>
                </div>

                {/* 칸반 컬럼들 */}
                <div
                  className={`flex flex-wrap gap-[8px] overflow-hidden ${
                    accordionMap[`${project}-${team}`]
                      ? 'mt-[16px] h-full'
                      : 'h-0'
                  }`}
                >
                  {Object.entries(progressMap).map(([progress, issues]) => (
                    <KanbanColumn
                      key={`${project}-${team}-${progress}`}
                      project={project}
                      team={team}
                      progress={progress}
                      issues={issues}
                      pinnedIssues={getPinnedList(
                        pinnedIssues,
                        project,
                        team,
                        progress
                      )}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onPin={onPin}
                      onUnpin={onUnpin}
                      onOpenModal={onOpenModal}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* 구분선 */}
          <div className="my-[32px] w-full border-b border-[#dbdbdb]"></div>
        </Fragment>
      ))}
    </section>
  );
}
