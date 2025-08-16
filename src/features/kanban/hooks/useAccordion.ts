// hooks/useAccordion.ts
import { useState } from 'react';
import { sidebarList } from '../constants/kanban';
import { useFilterStore } from '../store/filterStore';

const createInitialAccordionMap = (projectList: [string, string][]): Record<string, boolean> => {
  const initSidebar = Object.fromEntries(
    sidebarList.map((item) => [`sidebar-${item}`, true])
  );

  const initKanban = Object.fromEntries(
    projectList
      .filter(([id]) => id !== 'All')
      .map(([id]) => [`kanban-${id}`, true])
  );

  return {
    ...initSidebar,
    ...initKanban,
  };
};

export const useAccordion = () => {
  const { projectList } = useFilterStore();
  const [accordionMap, setAccordionMap] = useState(() => createInitialAccordionMap(projectList));

  const toggleAccordion = (key: string) => {
    setAccordionMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetAccordion = () => {
    setAccordionMap(createInitialAccordionMap(projectList));
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
