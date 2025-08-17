import { useEffect, useState } from 'react';

import { useIssueStore, mapProjectIdToName, mapTeamIdToName } from '@/store/issueStore';
import { useFilterStore } from '../store/filterStore';

import { GroupedIssues, IssueData, KanbanProgress } from '../types/issues';

/**
 * 칸반에서 사용할 이슈들과 관리하는 함수들을 제공하는 hook
 * zustand에 정의된 이슈들과 함수들을 사용
 */
export const useKanbanData = () => {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});
  const [pinnedIssues, setPinnedIssues] = useState<GroupedIssues>({});
  const [loading, setLoading] = useState(true);

  const { 
    createIssue, 
    issues, 
    loadInitialData, 
    loadTasksFromSupabase 
  } = useIssueStore();
  const { selectedProjects, selectedTeams, selectedAssignees } = useFilterStore();

  // 컴포넌트 마운트 시 Supabase 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Supabase 데이터 로딩 시작...');
      setLoading(true);
      
      try {
        // 실제 Supabase 데이터 로드 시도
        await loadTasksFromSupabase();
        console.log('✅ Supabase 데이터 로딩 완료');
        setLoading(false);
      } catch (error) {
        console.warn('⚠️ Supabase 데이터 로딩 실패, 더미 데이터 사용:', error);
        // Supabase 로딩 실패 시 더미 데이터 로드
        loadInitialData();
        setLoading(false);
      }
    };
    
    loadData();
  }, [loadTasksFromSupabase, loadInitialData]);

  // 필터링된 이슈들만 반환
  const getFilteredIssues = (issues: IssueData[]): IssueData[] => {
    
    console.log('🔍 필터링 시작:', {
      totalIssues: issues.length,
      selectedProjects,
      selectedTeams,
      selectedAssignees
    });
    
    const filtered = issues.filter((issue) => {
      // 프로젝트 필터링: 선택된 프로젝트 ID들을 이름으로 변환해서 비교
      let projectMatch = selectedProjects.length === 0 || selectedProjects.includes('All');
      
      if (!projectMatch) {
        // 선택된 프로젝트 ID들을 이름으로 변환 (새로운 매핑 함수 사용)
        const selectedProjectNames = selectedProjects.map(selectedId => 
          mapProjectIdToName(selectedId)
        );
        
        projectMatch = selectedProjectNames.includes(issue.project);
        
        console.log(`🔍 프로젝트 매핑:`, {
          selectedProjectIds: selectedProjects,
          selectedProjectNames,
          issueProject: issue.project,
          projectMatch
        });
      }

      // 팀 필터링: 선택된 팀 ID들을 이름으로 변환해서 비교
      let teamMatch = selectedTeams.length === 0 || selectedTeams.includes('All');
      
      if (!teamMatch) {
        // 선택된 팀 ID들을 이름으로 변환 (새로운 매핑 함수 사용)
        const selectedTeamNames = selectedTeams.map(selectedId => 
          mapTeamIdToName(selectedId)
        );
        
        teamMatch = selectedTeamNames.includes(issue.team);
        
        console.log(`🔍 팀 매핑:`, {
          selectedTeamIds: selectedTeams,
          selectedTeamNames,
          issueTeam: issue.team,
          teamMatch
        });
      }

      // 담당자 필터링
      const assigneeMatch = selectedAssignees.length === 0 || 
        selectedAssignees.includes('All') || 
        issue.assignees.some(assignee => selectedAssignees.includes(assignee));

      console.log(`🔍 이슈 "${issue.title}" 필터링:`, {
        issue: { project: issue.project, team: issue.team, assignees: issue.assignees },
        matches: { projectMatch, teamMatch, assigneeMatch },
        result: projectMatch && teamMatch && assigneeMatch
      });

      return projectMatch && teamMatch && assigneeMatch;
    });
    
    console.log('✅ 필터링 완료:', {
      filteredCount: filtered.length,
      filteredIssues: filtered.map(i => ({ title: i.title, project: i.project, team: i.team }))
    });
    
    return filtered;
  };

  // zustand store의 issues를 그룹 구조로 변환
  const convertIssuesToGrouped = (issues: IssueData[]): GroupedIssues => {
    const { teamList } = useFilterStore.getState();
    const grouped: GroupedIssues = {};
    
    // 1. 필터링된 이슈들로 그룹 생성
    const filteredIssues = getFilteredIssues(issues);

    filteredIssues.forEach((issue) => {
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

    // 2. 빈 레이아웃 생성 로직
    let projectsToShow: string[] = [];
    let teamsToShow: string[] = [];

    // 프로젝트 결정: 필터가 없거나 'All' 선택 시 모든 프로젝트, 아니면 선택된 프로젝트들
    if (selectedProjects.length === 0 || selectedProjects.includes('All')) {
      // 모든 프로젝트 표시
      const { projectList } = useFilterStore.getState();
      projectsToShow = projectList.filter(([id]) => id !== 'All').map(([, name]) => name);
    } else {
      // 선택된 프로젝트 ID들을 이름으로 변환
      projectsToShow = selectedProjects.map(selectedId => mapProjectIdToName(selectedId));
    }

    // 팀 결정: 필터가 없거나 'All' 선택 시 모든 팀, 아니면 선택된 팀들
    if (selectedTeams.length === 0 || selectedTeams.includes('All')) {
      // 모든 팀 표시
      teamsToShow = teamList.filter(([id]) => id !== 'All').map(([, name]) => name);
    } else {
      // 선택된 팀 ID들을 이름으로 변환
      teamsToShow = selectedTeams.map(selectedId => mapTeamIdToName(selectedId));
    }

    // 모든 프로젝트-팀 조합에 대해 빈 구조 생성
    projectsToShow.forEach(projectName => {
      // 프로젝트 초기화
      if (!grouped[projectName]) {
        grouped[projectName] = {};
      }

      teamsToShow.forEach(teamName => {
        if (!grouped[projectName][teamName]) {
          grouped[projectName][teamName] = {
            TODO: [],
            DOING: [],
            DONE: [],
          };
        }
      });
    });

    console.log('📋 빈 레이아웃 생성 완료:', {
      selectedProjects,
      selectedTeams,
      generatedProjects: Object.keys(grouped),
      generatedStructure: Object.entries(grouped).map(([project, teams]) => ({
        project,
        teams: Object.keys(teams)
      }))
    });

    return grouped;
  };

  // zustand store 및 필터 변경 시 groupedIssues 업데이트
  useEffect(() => {
    console.log('📊 useEffect 트리거됨:', {
      issuesCount: issues.length,
      selectedProjects,
      selectedTeams,
      selectedAssignees,
      uniqueProjects: [...new Set(issues.map(i => i.project))],
      uniqueTeams: [...new Set(issues.map(i => i.team))]
    });
    
    const storeGroupedIssues = convertIssuesToGrouped(issues);
    setGroupedIssues(storeGroupedIssues);
    
    console.log('📊 groupedIssues 업데이트됨:', Object.keys(storeGroupedIssues));
  }, [issues, selectedProjects, selectedTeams, selectedAssignees]);

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
