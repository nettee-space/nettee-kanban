import { useState } from 'react';

import { projectList, sidebarList } from '../constants/kanban';

// 아코디언 상태 초기화 (사이드바, 프로젝트 단위까지만 오픈)
const initialAccordionMap = (): Record<string, boolean> => {
  const initSidebar = Object.fromEntries(
    sidebarList.map((item) => [`sidebar-${item}`, true])
  );

  const initKanban = Object.fromEntries(
    projectList
      .filter((item) => item !== 'All')
      .map((item) => [`kanban-${item}`, true])
  );

  return {
    ...initSidebar,
    ...initKanban,
  };
};

export const useAccordion = () => {
  // 아코디언 토글 전역 관리
  const [accordionMap, setAccordionMap] = useState(initialAccordionMap);

  const handleAccordionToggle = (key: string) => {
    setAccordionMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetAccordion = () => setAccordionMap(initialAccordionMap());

  return {
    accordionMap,
    handleAccordionToggle,
    resetAccordion,
  };
};
