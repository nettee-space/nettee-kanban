import { supabaseUtils } from '@/supabase/supabaseUtil';

export let E_Team: [string, string][] = [['all', 'All']];
export const fetchTeamList = async (): Promise<[string, string][]> => {
  try {
    const result = await supabaseUtils.getTeams(); // [{ id, name }]

    const teams: [string, string][] = [['all', 'All']];

    for (const team of result) {
      if (team.name && team.id !== undefined) {
        teams.push([String(team.id), team.name]);
      }
    }

    E_Team = teams;
    return E_Team;
  } catch (e) {
    console.error('팀 목록 불러오기 실패:', e);
    return E_Team;
  }
};

export let projectList = ['All'];
export const fetchProjectList = async (): Promise<string[]> => {
  try {
    const result = await supabaseUtils.getProjects();

    const projectNames = result
      .map((p: { name?: string }) => p.name)
      .filter((name): name is string => Boolean(name));

    const combined = Array.from(new Set([...projectList, ...projectNames]));

    projectList = combined;

    return projectList;
  } catch (e) {
    console.error('프로젝트 목록 불러오기 실패', e);
    return projectList; // fallback: 기존 값 유지
  }
};

export let dummyLabels: string[] = [];

export const fetchTaskPriorities = async (): Promise<string[]> => {
  try {
    const result = await supabaseUtils.getTaskPriorities(); // [{ name }]
    const names = result
      .map((p: { priority_name?: string }) => p.priority_name)
      .filter((priority_name): priority_name is string =>
        Boolean(priority_name)
      );

    dummyLabels = Array.from(new Set(names));

    return dummyLabels;
  } catch (e) {
    console.error('작업중요도 목록 불러오기 실패:', e);
    return dummyLabels;
  }
};

export const sidebarList = ['project', 'team', 'assignee', 'label', 'more'];

export const kanbanStyleMap = {
  TODO: {
    bg: 'bg-[#FFFBDE]',
    text: 'text-[#F9AA01]',
    line: 'bg-[#F9AA01]',
  },
  DOING: {
    bg: 'bg-[#E7F3FE]',
    text: 'text-[#1E85E4]',
    line: 'bg-[#1E85E4]',
  },
  DONE: {
    bg: 'bg-[#EEFBE6]',
    text: 'text-[#58BE1A]',
    line: 'bg-[#58BE1A]',
  },
  DEFAULT: {
    bg: 'bg-[#f5f5f5]',
    text: 'text-[#767676]',
    line: 'bg-[#767676]',
  },
} as const;
