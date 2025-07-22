// hooks/useAccordion.ts
import { useState } from 'react';
import { projectList, sidebarList } from '../constants/kanban';

const createInitialAccordionMap = (): Record<string, boolean> => {
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
  const [accordionMap, setAccordionMap] = useState(createInitialAccordionMap);

  const toggleAccordion = (key: string) => {
    setAccordionMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetAccordion = () => {
    setAccordionMap(createInitialAccordionMap);
  };

  const openAccordion = (key: string) => {
    setAccordionMap((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const closeAccordion = (key: string) => {
    setAccordionMap((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  return {
    accordionMap,
    toggleAccordion,
    resetAccordion,
    openAccordion,
    closeAccordion,
  };
};
