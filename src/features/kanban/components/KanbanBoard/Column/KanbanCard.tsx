import { DragEvent, MouseEvent } from 'react';

import { formatDateToYYYYMMDD } from '@/shared/components/ui/datetime-picker';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { useIssueStore } from '@/store/issueStore';

import { IssueData } from '../../../types/issues';

interface KanbanCardProps {
  item: IssueData & {
    cardIndex: string;
  };
  columnId: string;
  project: string;
  team: string;
  isPinned: boolean;
  onDragStart: (
    e: DragEvent,
    cardId: string,
    columnId: string,
    cardIndex: string,
    project: string,
    team: string
  ) => void;
  onPin?: (taskNumber: number) => void;
  onOpenModal: (e: MouseEvent<HTMLLIElement>) => void;
  onDropOnCard?: (e: DragEvent<Element>, targetTaskId: number) => void;
}

export function KanbanCard({
  item,
  isPinned,
  columnId,
  project,
  team,
  onDragStart,
  onPin,
  onOpenModal,
  onDropOnCard,
}: KanbanCardProps) {
  const { updateIssueToSupabase, kanbanTasks } = useIssueStore();

  // 현재 태스크의 서브태스크 찾기 (원본 KanbanTask 데이터에서)
  const subTasks = kanbanTasks
    .filter((task) => task.parent_task_id === item.number)
    .map((task) => {
      // KanbanTask를 IssueData 형태로 변환하여 UI에서 사용
      return {
        id: task.id.toString(),
        number: task.id,
        title: task.title,
        progress: task.status,
        project: project,
        team: team,
      };
    });

  const handleDrop = (e: DragEvent<Element>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDropOnCard) {
      onDropOnCard(e, item.number);
    }
  };

  const handleDragOver = (e: DragEvent<Element>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <li
      className={`flex w-full min-w-[256px] cursor-grab flex-col rounded-xl bg-white active:cursor-grabbing ${subTasks.length > 0 ? 'min-h-[120px]' : 'max-h-[150px] min-h-[90px]'}`}
      draggable="true"
      onDragStart={(e) =>
        onDragStart(e, item.id, columnId, item.cardIndex, project, team)
      }
      onClick={onOpenModal}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex justify-between gap-3 px-[14px] py-[16px]">
        <div className="flex flex-col justify-between gap-3">
          <div className="flex items-center gap-[4px]">
            <div
              className="cursor-pointer"
              onClick={async (e) => {
                e.stopPropagation();
                const updatedDate: IssueData = {
                  ...item,
                  progress: columnId === 'DONE' ? 'DOING' : 'DONE',
                  updated_at: new Date().toISOString(),
                };
                await updateIssueToSupabase(item.number, updatedDate);
                console.log('columnId', columnId);
              }}
            >
              <Icon
                src={
                  columnId === 'DONE'
                    ? ICONS.checkCircle20
                    : ICONS.uncheckCircle20
                }
              />
            </div>
            <p className="w-[200px] truncate text-sm font-semibold tracking-tight">
              {item.title}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="px-[4px] text-[12px] text-[#646464]">
              {formatDateToYYYYMMDD(item.sta_dt)}~{' '}
              {formatDateToYYYYMMDD(item.end_dt)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[10px]">
          <div className="flex h-[24px] w-[24px] items-center justify-center">
            {item.repo && <Icon src={ICONS.github24} size={24} alt="Github" />}
          </div>
          <div
            className="cursor-pointer transition-opacity hover:opacity-70"
            onClick={(e) => {
              e.stopPropagation();
              onPin?.(item.number);
            }}
          >
            <Icon
              src={isPinned ? ICONS.pin24 : ICONS.unpin24}
              size={24}
              alt={isPinned ? 'Pinned' : 'Unpinned'}
            />
          </div>
        </div>
      </div>

      {/* 서브태스크 목록 */}
      {subTasks.length > 0 && (
        <div className="border-t border-gray-200 px-[14px] py-[8px]">
          <div className="mb-2 text-xs text-gray-500">
            서브태스크 ({subTasks.length})
          </div>
          <div className="space-y-1">
            {subTasks.map((subTask) => (
              <div
                key={subTask.id}
                className="flex items-center gap-2 border-l-2 border-gray-300 pl-4 text-xs text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  // 서브태스크 클릭 시 모달 열기
                  const modalEvent = e as unknown as MouseEvent<HTMLLIElement>;
                  onOpenModal(modalEvent);
                }}
              >
                <span className="flex-1 truncate">{subTask.title}</span>
                <span className="text-[10px] text-gray-400">
                  {subTask.progress}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
