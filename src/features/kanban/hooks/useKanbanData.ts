import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/shared/lib/supa-client';

import { netteeRepo } from '../constants/nettee';
import { GroupedIssues, IssueData, KanbanProgress } from '../types/issues';

export const useKanbanData = () => {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});
  const [pinnedIssues, setPinnedIssues] = useState<GroupedIssues>({});
  const [loading, setLoading] = useState(true);

  // *****************************************************************
  // constants에 등록된 이름으로 supabase를 전부 순회하여 테이블 가져오는 함수
  // *****************************************************************
  const fetchTableData = async (table: string): Promise<IssueData[]> => {
    if (table === '') return [];

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error(`Error in table: ${table}`);
      return [];
    }

    return data ?? [];
  };

  const promiseAllIssue = async (): Promise<IssueData[]> => {
    const promiseBuffer: Promise<IssueData[]>[] = [];

    for (const [projectName, teamObj] of Object.entries(netteeRepo)) {
      for (const [teamName, tableList] of Object.entries(teamObj)) {
        for (const tableName of tableList) {
          const promise = fetchTableData(tableName).then((rows) => {
            const tagged = rows.map((row) => ({
              ...row,
              project: projectName,
              team: teamName,
              repo: ['blolet', 'kanban', 'onboard'].some((prefix) =>
                tableName.startsWith(prefix)
              )
                ? ''
                : tableName,
            }));

            return tagged;
          });

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

  // ************************************************************
  // 슈퍼베이스 실시간 통신용 채널 오픈 + 페이로드 가공하여 신규상태로 갱신
  // ************************************************************
  const setupRealtimeChannel = () => {
    const channel = supabase
      .channel('realtime-kanban')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: RealtimePostgresChangesPayload<IssueData>) => {
          console.log('Realtime Change:', payload);

          const issue = payload.new as IssueData;
          const table = payload.table as string;

          setGroupedIssues((prev) => {
            const updated: GroupedIssues = { ...prev };

            for (const [project, teams] of Object.entries(netteeRepo)) {
              for (const [team, repos] of Object.entries(teams)) {
                if (repos.includes(table)) {
                  const progress = (issue.progress ?? 'TODO') as KanbanProgress;
                  const status: KanbanProgress[] = ['TODO', 'DOING', 'DONE'];

                  for (const key of status) {
                    updated[project][team][key] = updated[project][team][
                      key
                    ].filter((i) => i.number !== issue.number);
                  }

                  updated[project][team][progress].unshift(issue);
                  return updated;
                }
              }
            }

            return prev; // fallback
          });
        }
      );

    const trySubscribe = () => {
      try {
        channel.subscribe();
      } catch (error) {
        console.error('realtime connection failed', error);
        alert('슈퍼베이스 리얼타임 미작동 중!!');
      }
    };

    trySubscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  // ********************************************************
  // 최초 로드할 때 모든 테이블 순회, 칸반 형태로 가공하여 state 등록
  // ********************************************************
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const getIssues = await promiseAllIssue();
        const grouped = groupIssuesByProgress(getIssues);
        setGroupedIssues(grouped);
      } catch (e) {
        console.log('failed to load kanban data:', e);
      } finally {
        setLoading(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const cleanup = setupRealtimeChannel();
    return cleanup;
  }, []);
  return {
    groupedIssues,
    pinnedIssues,
    loading,
    setGroupedIssues,
    setPinnedIssues,
  };
};
