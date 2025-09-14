import { DragEvent, MouseEvent } from 'react';

import { formatDateToYYYYMMDD } from '@/shared/components/ui/datetime-picker';
import { Icon, ICONS } from '@/shared/components/ui/icon';

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
  onPin?: (e: MouseEvent<HTMLImageElement>) => void;
  onOpenModal: () => void;
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
}: KanbanCardProps) {
  return (
    <li
      className="flex max-h-[150px] min-h-[90px] w-full flex-col rounded-xl bg-white"
      onClick={onOpenModal}
    >
      <div
        draggable="true"
        onDragStart={(e) =>
          onDragStart(e, item.id, columnId, item.cardIndex, project, team)
        }
        className="flex cursor-grab gap-3 px-[14px] py-[16px] active:cursor-grabbing active:bg-[#f5f5f5]"
      >
        <div className="flex flex-col justify-between gap-3">
          <div className="flex items-center gap-[4px]">
            <Icon src={ICONS.uncheckCircle20} />
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
          {item.repo && <Icon src={ICONS.github24} size={24} alt="Github" />}
          <Icon
            src={isPinned ? ICONS.pin24 : ICONS.unpin24}
            size={24}
            alt={isPinned ? 'Pinned' : 'Unpinned'}
          />
        </div>
      </div>
    </li>
  );
}
