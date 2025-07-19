// hooks/useDragAndDrop.ts;
import { DragEvent } from 'react';
import { GroupedIssues, IssueData, KanbanProgress } from '../types/issues';

interface UseDragAndDropProps {
  setGroupedIssues: React.Dispatch<React.SetStateAction<GroupedIssues>>;
}

export const useDragAndDrop = ({ setGroupedIssues }: UseDragAndDropProps) => {
  const handleDragStart = (e: DragEvent, item: IssueData) => {
    e.dataTransfer.setData('cardId', String(item.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (
    e: DragEvent,
    project: string,
    team: string,
    progress: string
  ) => {
    const cardId = e.dataTransfer.getData('cardId');
    clearHighlights(progress);

    const indicators = getIndicators(progress);
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before;

    if (before !== cardId) {
      setGroupedIssues((prev) => {
        const updated = { ...prev };
        let cardToTransfer: IssueData | undefined;

        // 1. 전체 구조에서 카드 찾기 및 제거
        const statuses: KanbanProgress[] = ['TODO', 'DOING', 'DONE'];
        for (const p of Object.keys(prev)) {
          for (const t of Object.keys(prev[p])) {
            for (const status of statuses) {
              const list = updated[p][t][status];
              const idx = list.findIndex((c) => String(c.id) === cardId);
              if (idx > -1) {
                cardToTransfer = { ...list[idx], progress };
                list.splice(idx, 1);
                break;
              }
            }
            if (cardToTransfer) break;
          }
          if (cardToTransfer) break;
        }

        if (!cardToTransfer) return prev;

        // 2. 타겟 컬럼에 삽입
        const targetColumn = [
          ...updated[project][team][progress as KanbanProgress],
        ];
        const moveToBack = before === '-1';

        if (moveToBack) {
          targetColumn.push(cardToTransfer);
        } else {
          const insertIndex = targetColumn.findIndex(
            (el) => String(el.id) === before
          );
          if (insertIndex === -1) {
            console.warn('Insert target not found, adding to end');
            targetColumn.push(cardToTransfer);
          } else {
            targetColumn.splice(insertIndex, 0, cardToTransfer);
          }
        }

        updated[project][team][progress as KanbanProgress] = targetColumn;
        return updated;
      });
    }
  };

  const handleDragOver = (e: DragEvent, progress: string) => {
    e.preventDefault();
    highlightIndicator(e, progress);
  };

  const handleDragLeave = (progress: string) => {
    clearHighlights(progress);
  };

  // 드래그 인디케이터 유틸리티 함수들
  const getIndicators = (progress: string) => {
    return Array.from(
      document.querySelectorAll<HTMLElement>(`[data-column="${progress}"]`)
    );
  };

  const highlightIndicator = (e: DragEvent, progress: string) => {
    const indicators = getIndicators(progress);
    clearHighlights(progress, indicators);

    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = '1';
  };

  const clearHighlights = (progress: string, els?: HTMLElement[]) => {
    const indicators = els || getIndicators(progress);
    indicators.forEach((i) => {
      i.style.opacity = '0';
    });
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
  };
};
