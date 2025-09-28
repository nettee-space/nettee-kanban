// hooks/useDragAndDrop.ts;
import { DragEvent } from 'react';

import { useIssueStore } from '@/store/issueStore';

import { KanbanProgress } from '../types/issues';

export const useDragAndDrop = () => {
  const { reorderIssues, detachSubTaskFromParent, getIssueById } =
    useIssueStore();
  const handleDragStart = (
    e: DragEvent,
    cardId: string,
    columnId: string,
    cardIndex: string,
    project: string,
    team: string,
    dragType: 'MAIN_CARD' | 'SUB_TASK' = 'MAIN_CARD',
    parentId?: string
  ) => {
    // 드래그 타입에 따른 데이터 구성
    const dragData = {
      cardId,
      sourceColumnId: columnId,
      cardIndex: cardIndex,
      sourceProject: project,
      sourceTeam: team,
      dragType, // 드래그 타입 추가
      parentId, // 서브태스크인 경우 부모 ID
      // 하위 호환성을 위해 기존 isSubTask도 유지
      isSubTask: dragType === 'SUB_TASK',
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = async (
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
      const {
        cardId,
        sourceProject,
        sourceTeam,
        sourceColumnId,
        dragType = 'MAIN_CARD', // 기본값 설정
        parentId,
        isSubTask // 하위 호환성
      } = dragData;

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

      console.log(`드래그 타입: ${dragType}, 카드 ID: ${cardId}, 타겟 진행상태: ${targetProgress}`);

      // 드래그 타입별 분기 처리
      if (dragType === 'SUB_TASK' || isSubTask) {
        // 서브태스크 드래그 처리
        console.log(`서브태스크 ${cardId}를 처리합니다. 부모 ID: ${parentId}`);

        try {
          // 1. 현재 부모에서 서브태스크 분리
          await detachSubTaskFromParent(Number(cardId));
          console.log('서브태스크를 부모에서 분리 완료');

          // 2. 독립적인 메인 태스크로 승격하고 새 상태로 이동
          console.log(`서브태스크를 ${targetProgress} 상태의 독립 태스크로 변경`);
        } catch (error) {
          console.error('서브태스크 분리 중 오류:', error);
          alert('서브태스크 분리 중 오류가 발생했습니다.');
          return;
        }
      } else if (dragType === 'MAIN_CARD') {
        // 메인 카드 드래그 처리
        console.log(`메인 카드 ${cardId}의 상태를 ${targetProgress}로 변경합니다.`);
      }

      // 공통: 다른 상태로 이동 - DropIndicator 위치 기반으로 삽입 위치 결정
      const indicators = getIndicators(targetProgress);
      const { element } = getNearestIndicator(e, indicators);
      const beforeId = element.dataset.before;

      // 상태 변경 수행
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
