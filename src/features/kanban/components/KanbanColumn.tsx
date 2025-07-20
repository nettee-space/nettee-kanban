import { PlusIcon } from 'lucide-react';

import { IssueData } from '../types/issues';
import { DropIndicator } from './DropIndicator';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  project: string;
  team: string;
  progress: string;
  issues: IssueData[];
  pinnedIssuesList: IssueData[];
  getKanbanStyle: (progress: string) => any;
  handleDragStart: (e: DragEvent, item: IssueData) => void;
  handleDragEnd: (
    e: DragEvent,
    project: string,
    team: string,
    progress: string
  ) => void;
  handleDragOver: (e: DragEvent, progress: string) => void;
  handleDragLeave: (progress: string) => void;
  setModalItem: (item: Partial<IssueData>) => void;
  pinThisIssue: (
    e: MouseEvent<HTMLImageElement>,
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => void;
  unpinThisIssue: (
    e: MouseEvent<HTMLImageElement>,
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => void;
}

export function KanbanColumn({
  project,
  team,
  progress,
  issues,
  pinnedIssuesList,
  getKanbanStyle,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  setModalItem,
  pinThisIssue,
  unpinThisIssue,
}: KanbanColumnProps) {
  return (
    <div
      key={`${project}-${team}-${progress}`}
      className={`flex max-h-[860px] flex-1 flex-col gap-[12px] overflow-auto ${getKanbanStyle(progress).bg} p-[12px] pb-[32px]`}
    >
      <div className="flex items-center justify-between px-[8px]">
        <div className="flex gap-[8px]">
          <p>{progress}</p>

          <p className={getKanbanStyle(progress).text}>
            {issues.length + pinnedIssuesList.length}
          </p>
        </div>

        <div className="flex gap-[8px]">
          {progress === 'DONE' && (
            <div className="flex h-[32px] w-[86px] items-center justify-center rounded-[8px] bg-white">
              전체보기
            </div>
          )}
          <div
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-white text-[20px]"
            onClick={() =>
              setModalItem({
                number: 0,
                project,
                team,
                progress,
              })
            }
          >
            <PlusIcon size={20} />
          </div>
        </div>
      </div>

      <div>
        {pinnedIssuesList.map((item) => (
          <KanbanCard
            key={item.id}
            item={item}
            isPinned={true}
            handleDragStart={handleDragStart}
            setModalItem={setModalItem}
            unpinThisIssue={unpinThisIssue}
            project={project}
            team={team}
            progress={progress}
          />
        ))}
      </div>

      <div
        className={`${getKanbanStyle(progress).line} h-[1px] w-full shrink-0`}
      ></div>

      <ul
        className="flex flex-1 flex-col"
        onDrop={(e) => handleDragEnd(e, project, team, progress)}
        onDragOver={(e) => handleDragOver(e, progress)}
        onDragLeave={() => handleDragLeave(progress)}
      >
        {issues.map((item) => (
          <KanbanCard
            key={item.id}
            item={item}
            isPinned={false}
            handleDragStart={handleDragStart}
            setModalItem={setModalItem}
            pinThisIssue={pinThisIssue}
            project={project}
            team={team}
            progress={progress}
          />
        ))}
        <DropIndicator beforeId={null} progress={progress} />
      </ul>
    </div>
  );
}
