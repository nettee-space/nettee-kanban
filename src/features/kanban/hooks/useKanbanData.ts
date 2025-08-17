import { useEffect, useState } from 'react';

import { useIssueStore } from '@/store/issueStore';

import { GroupedIssues, IssueData, KanbanProgress } from '../types/issues';

/**
 * 칸반에서 사용할 이슈들과 관리하는 함수들을 제공하는 hook
 * zustand에 정의된 이슈들과 함수들을 사용
 */
export const useKanbanData = () => {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});
  const [pinnedIssues, setPinnedIssues] = useState<GroupedIssues>({});
  const [loading, setLoading] = useState(true);

  const { createIssue, issues, loadInitialData } = useIssueStore();

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // zustand store의 issues를 그룹 구조로 변환
  const convertIssuesToGrouped = (issues: IssueData[]): GroupedIssues => {
    const grouped: GroupedIssues = {};

    issues.forEach((issue) => {
      const { project, team, progress } = issue;

      // 프로젝트 초기화
      if (!grouped[project]) {
        grouped[project] = {};
      }

      // 팀 초기화
      if (!grouped[project][team]) {
        grouped[project][team] = {
          TODO: [],
          DOING: [],
          DONE: [],
        };
      }

      // 이슈를 해당 progress에 추가
      grouped[project][team][progress as KanbanProgress].push(issue);
    });

    return grouped;
  };

  // zustand store 변경 시 groupedIssues 업데이트
  useEffect(() => {
    const storeGroupedIssues = convertIssuesToGrouped(issues);
    setGroupedIssues(storeGroupedIssues);
  }, [issues]);

  const addIssue = (issueData: {
    title: string;
    body: string;
    progress: KanbanProgress;
    project: string;
    team: string;
    sta_dt?: string;
    end_dt?: string;
    assignees?: string[];
    labels?: string[];
    repo?: string;
    task_priority?: string;
  }) => {
    // zustand store에만 이슈 생성 (단일 소스)
    const newIssue = createIssue({
      title: issueData.title,
      body: issueData.body,
      progress: issueData.progress,
      project: issueData.project,
      team: issueData.team,
      sta_dt: issueData.sta_dt || new Date().toISOString(),
      end_dt: issueData.end_dt || new Date().toISOString(),
      assignees: issueData.assignees || [],
      labels: issueData.labels || [],
      parent: '',
      repo: issueData.repo || '',
      task_priority: issueData.task_priority || 'medium',
      html_url: `#issue-${Date.now()}`,
      state: 'open',
      pinned: false,
    });

    // useEffect가 자동으로 groupedIssues를 업데이트함
    return newIssue;
  };

  return {
    groupedIssues,
    pinnedIssues,
    loading,
    setGroupedIssues,
    setPinnedIssues,
    addIssue,
  };
};
