import Github from '@/assets/github.svg';
import pinActive from '@/assets/pinActive.svg';
import pinDisable from '@/assets/pinDisable.svg';
import { CircleCheckIcon } from 'lucide-react';
import { DragEvent, MouseEvent } from 'react';
import { IssueData } from '../../../types/issues';

interface KanbanCardProps {
  item: IssueData & {
    cardIndex: string;
  };
  columnId: string;
  isPinned: boolean;
  onDragStart: (
    e: DragEvent,
    cardId: string,
    columnId: string,
    cardIndex: string
  ) => void;
  onPin?: (e: MouseEvent<HTMLImageElement>) => void;
  onOpenModal: () => void;
}

export function KanbanCard({
  item,
  isPinned,
  columnId,
  onDragStart,
  onPin,
  onOpenModal,
}: KanbanCardProps) {
  const handlePinClick = (e: MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    onPin?.(e);
  };

  return (
    <li
      className="mb-2 flex min-h-[100px] w-full flex-col rounded-[8px] bg-white"
      onClick={onOpenModal}
    >
      <div
        draggable="true"
        onDragStart={(e) => onDragStart(e, item.id, columnId, item.cardIndex)}
        className="cursor-grab px-[14px] py-[16px] active:cursor-grabbing active:bg-[#f5f5f5]"
      >
        <div className="flex items-center gap-[4px]">
          <CircleCheckIcon
            fill="#C3C3C3"
            color="#fff"
            className="mt-[2px] h-[24px] w-[24px] flex-none"
          />
          <p className="w-[200px] truncate text-[14px] font-semibold tracking-tight">
            {item.title}
          </p>
        </div>

        <div className="flex justify-between">
          <p className="px-[4px] text-[12px] text-[#646464]">{item.html_url}</p>

          <div className="flex flex-none items-end gap-[10px]">
            {item.repo && (
              <img src={Github} className="h-[24px] w-[24px]" alt="Github" />
            )}

            <img
              src={isPinned ? pinActive : pinDisable}
              className="h-[24px] w-[24px] cursor-pointer"
              onClick={handlePinClick}
              alt={isPinned ? 'Unpin' : 'Pin'}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
