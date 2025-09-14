// hooks/useDragAndDrop.ts;
import { DragEvent } from 'react';

import { useIssueStore } from '@/store/issueStore';

import { KanbanProgress } from '../types/issues';

export const useDragAndDrop = () => {
  const { reorderIssues } = useIssueStore();
  const handleDragStart = (
    e: DragEvent,
    cardId: string,
    columnId: string,
    cardIndex: string,
    project: string,
    team: string
  ) => {
    const dragData = {
      cardId,
      sourceColumnId: columnId,
      cardIndex: cardIndex,
      sourceProject: project,
      sourceTeam: team,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (
    e: DragEvent,
    targetProject: string,
    targetTeam: string,
    targetProgress: string
  ) => {
    clearHighlights(targetProgress);

    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      if (!dragDataStr) return;

      const dragData = JSON.parse(dragDataStr);
      const { cardId, sourceProject, sourceTeam, sourceColumnId } = dragData;

      // 동일 프로젝트/팀 내에서만 이동 허용
      if (sourceProject !== targetProject || sourceTeam !== targetTeam) {
        console.warn('다른 프로젝트/팀으로는 이동할 수 없습니다.');
        return;
      }

      // 동일 컬럼 내에서의 순서 변경은 허용하지 않음
      if (sourceColumnId === targetProgress) {
        console.log('동일 상태 내에서는 순서 변경이 불가능합니다.');
        return;
      }

      // 다른 상태로 이동 - DropIndicator 위치 기반으로 삽입 위치 결정
      const indicators = getIndicators(targetProgress);
      const { element } = getNearestIndicator(e, indicators);
      const beforeId = element.dataset.before;

      // 다른 상태로 이동 수행
      const beforeIdNum = beforeId === '-1' ? null : Number(beforeId);
      reorderIssues(
        Number(cardId),
        targetProject,
        targetTeam,
        targetProgress as KanbanProgress,
        beforeIdNum
      );
    } catch (error) {
      console.error('드래그 앤 드롭 처리 중 오류:', error);
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
