import { useEffect, useState } from 'react';

import { netteeRepo } from '../constants/nettee';
import { GroupedIssues, IssueData, KanbanProgress } from '../types/issues';

export const useKanbanData = () => {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});
  const [pinnedIssues, setPinnedIssues] = useState<GroupedIssues>({});
  const [loading, setLoading] = useState(true);

  // ✨ supabase 없이 mock fetch
  const fetchTableData = async (table: string): Promise<IssueData[]> => {
    if (!table) return [];

    // TODO: 실제 fetch 로직을 여기에 대체
    // 예시로 mock 데이터 리턴
    return Promise.resolve([
      {
        id: 1,
        number: 100,
        title: `Mock title from ${table}`,
        progress: 'TODO',
        project: '',
        team: '',
        repo: table,
      } as IssueData,
    ]);
  };

  const promiseAllIssue = async (): Promise<IssueData[]> => {
    const promiseBuffer: Promise<IssueData[]>[] = [];

    for (const [projectName, teamObj] of Object.entries(netteeRepo)) {
      for (const [teamName, tableList] of Object.entries(teamObj)) {
        for (const tableName of tableList) {
          const promise = fetchTableData(tableName).then((rows) =>
            rows.map((row) => ({
              ...row,
              project: projectName,
              team: teamName,
              repo: ['blolet', 'kanban', 'onboard'].some((prefix) =>
                tableName.startsWith(prefix)
              )
                ? ''
                : tableName,
            }))
          );

          promiseBuffer.push(promise);
        }
      }
    }

    const resolve = await Promise.all(promiseBuffer);
    return resolve.flat();
  };

  const groupIssuesByProgress = (data: IssueData[]): GroupedIssues => {
    const result: GroupedIssues = {};

    for (const [projectName, teamObj] of Object.entries(netteeRepo)) {
      result[projectName] = {};
      for (const [teamName] of Object.entries(teamObj)) {
        result[projectName][teamName] = {
          TODO: [],
          DOING: [],
          DONE: [],
        };
      }
    }

    for (const issue of data) {
      const projectName = issue.project;
      const teamName = issue.team;
      const progress = (issue.progress ?? 'TODO') as KanbanProgress;

      result[projectName][teamName][progress].push(issue);
    }

    return result;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const getIssues = await promiseAllIssue();
        const grouped = groupIssuesByProgress(getIssues);
        setGroupedIssues(grouped);
      } catch (e) {
        console.error('failed to load kanban data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return {
    groupedIssues,
    pinnedIssues,
    loading,
    setGroupedIssues,
    setPinnedIssues,
  };
};
