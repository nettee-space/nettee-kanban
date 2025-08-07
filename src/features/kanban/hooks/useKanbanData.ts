import { useState } from 'react';
import { GroupedIssues } from '../types/issues';

/**
 * 칸반에서 사용할 이슈들과 관리하는 함수들을 제공하는 hook
 * zustand에 정의된 이슈들과 함수들을 사용
 */
export const useKanbanData = () => {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({
    Blolet: {
      fe: {
        TODO: [],
        DOING: [
          {
            sb_id: '1',
            html_url: 'test',
            id: '1',
            number: 1,
            state: 'string',
            title: 'test1 제목입니다',
            body: 'test1 본문입니다',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            progress: 'DOING',
            sta_dt: new Date().toISOString(),
            end_dt: new Date('2030.03.01').toISOString(),
            assignees: ['송문혁'],
            labels: [],
            parent: '',
            project: 'Kanban',
            team: 'FE',
            repo: '',
            task_priority: 'high',
            pinned: false,
          },
        ],
        DONE: [],
      },
      be: {
        TODO: [
          {
            sb_id: '2',
            html_url: 'test',
            id: '2',
            number: 2,
            state: 'string',
            title: 'test2 제목입니다',
            body: 'test2 본문입니다',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            progress: 'DOING',
            sta_dt: new Date().toISOString(),
            end_dt: new Date('2030.03.01').toISOString(),
            assignees: ['박경우'],
            labels: [],
            parent: '',
            project: 'Kanban',
            team: 'BE',
            repo: '',
            task_priority: 'high',
            pinned: false,
          },
        ],
        DOING: [],
        DONE: [],
      },
    },
  });
  const [pinnedIssues, setPinnedIssues] = useState<GroupedIssues>({});
  const [loading, setLoading] = useState(true);

  return {
    groupedIssues,
    pinnedIssues,
    loading,
    setGroupedIssues,
    setPinnedIssues,
  };
};
