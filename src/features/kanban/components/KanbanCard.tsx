import { CircleCheckIcon } from 'lucide-react';
import { Fragment, MouseEvent } from 'react';

import Github from '@/assets/github.svg';
import pinActive from '@/assets/pinActive.svg';
import pinDisable from '@/assets/pinDisable.svg';

import { IssueData } from '../types/issues';
import { DropIndicator } from './DropIndicator';

interface KanbanCardProps {
  item: IssueData;
  isPinned?: boolean;
  handleDragStart: (e: DragEvent, item: IssueData) => void;
  setModalItem: (item: IssueData) => void;
  pinThisIssue?: (
    e: MouseEvent<HTMLImageElement>,
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => void;
  unpinThisIssue?: (
    e: MouseEvent<HTMLImageElement>,
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => void;
  project: string;
  team: string;
  progress: string;
}

export function KanbanCard({
  item,
  isPinned = false,
  handleDragStart,
  setModalItem,
  pinThisIssue,
  unpinThisIssue,
  project,
  team,
  progress,
}: KanbanCardProps) {
  return (
    <Fragment key={item.id}>
      <DropIndicator beforeId={item.id} progress={item.progress} />
      <li
        className="flex min-h-[100px] w-full flex-col rounded-[8px] bg-white"
        onClick={() => setModalItem(item)}
      >
        <div
          draggable="true"
          onDragStart={(e) => {
            handleDragStart(e, item);
          }}
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
            <p className="px-[4px] text-[12px] text-[#646464]">
              {item.html_url}
            </p>

            <div className="flex flex-none items-end gap-[10px]">
              {item.repo && <img src={Github} className="h-[24px] w-[24px]" />}

              <img
                src={isPinned ? pinActive : pinDisable}
                className="h-[24px] w-[24px]"
                onClick={(e) =>
                  isPinned && unpinThisIssue
                    ? unpinThisIssue(e, project, team, progress, item.id)
                    : pinThisIssue &&
                      pinThisIssue(e, project, team, progress, item.id)
                }
              />
            </div>
          </div>
        </div>
      </li>
    </Fragment>
  );
}
