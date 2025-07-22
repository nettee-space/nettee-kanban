// components/KanbanBoard/KanbanColumn.tsx
import { PlusIcon } from 'lucide-react';
import { DragEvent, Fragment } from 'react';
import { kanbanStyleMap } from '../../constants/kanban';
import { IssueData } from '../../types/issues';
import { DropIndicator } from './DropIndicator';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  project: string;
  team: string;
  progress: string;
  issues: IssueData[];
  pinnedIssues: IssueData[];
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

export function KanbanColumn({
  project,
  team,
  progress,
  issues,
  pinnedIssues,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onPin,
  onUnpin,
  onOpenModal,
}: KanbanColumnProps) {
  const getKanbanStyle = (progress: string) => {
    return (
      kanbanStyleMap[progress as keyof typeof kanbanStyleMap] ||
      kanbanStyleMap.DEFAULT
    );
  };

  const style = getKanbanStyle(progress);
  const totalCount = issues.length + pinnedIssues.length;

  const handleAddNew = () => {
    onOpenModal({
      number: 0,
      project,
      team,
      progress,
    });
  };

  return (
    <div
      className={`flex max-h-[860px] flex-1 flex-col gap-[12px] overflow-auto ${style.bg} p-[12px] pb-[32px]`}
    >
      {/* 컬럼 헤더 */}
      <div className="flex items-center justify-between px-[8px]">
        <div className="flex gap-[8px]">
          <p>{progress}</p>
          <p className={style.text}>{totalCount}</p>
        </div>

        <div className="flex gap-[8px]">
          {progress === 'DONE' && (
            <div className="flex h-[32px] w-[86px] items-center justify-center rounded-[8px] bg-white">
              전체보기
            </div>
          )}
          <div
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[4px] bg-white text-[20px]"
            onClick={handleAddNew}
          >
            <PlusIcon size={20} />
          </div>
        </div>
      </div>

      {/* 고정된 카드들 */}
      <div>
        {pinnedIssues.map((item) => (
          <Fragment key={item.id}>
            <DropIndicator beforeId={item.id} progress={item.progress} />
            <KanbanCard
              item={item}
              isPinned={true}
              onDragStart={onDragStart}
              onPin={(_) => onUnpin(project, team, progress, item.id)}
              onOpenModal={() => onOpenModal(item)}
            />
          </Fragment>
        ))}
      </div>

      {/* 구분선 */}
      <div className={`${style.line} h-[1px] w-full shrink-0`}></div>

      {/* 일반 카드들 */}
      <ul
        className="flex flex-1 flex-col"
        onDrop={(e) => onDragEnd(e, project, team, progress)}
        onDragOver={(e) => onDragOver(e, progress)}
        onDragLeave={() => onDragLeave(progress)}
      >
        {issues.map((item) => (
          <Fragment key={item.id}>
            <DropIndicator beforeId={item.id} progress={item.progress} />
            <KanbanCard
              item={item}
              isPinned={false}
              onDragStart={onDragStart}
              onPin={(_) => onPin(project, team, progress, item.id)}
              onOpenModal={() => onOpenModal(item)}
            />
          </Fragment>
        ))}
        <DropIndicator beforeId={null} progress={progress} />
      </ul>
    </div>
  );
}
