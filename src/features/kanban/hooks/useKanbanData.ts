import { useState } from 'react';

import { GroupedIssues } from '../types/issues';

export const useKanbanData = () => {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});

  return {
    groupedIssues,
    setGroupedIssues,
  };
};
