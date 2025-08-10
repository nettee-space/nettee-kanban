import { supabaseUtils } from '@/supabase/supabaseUtil';

export enum E_Team {
  all = 'All',
  lead = 'Lead',
  pl = 'PL',
  fe = 'FE',
  be = 'BE',
  ux = 'UXUI',
}
export let E_TeamList: [string, string][] = [['all', 'All']];

export const fetchTeamList = async (): Promise<[string, string][]> => {
  try {
    const result = await supabaseUtils.getTeams(); // [{ id, name }]

    const teams: [string, string][] = [['all', 'All']];

    for (const team of result) {
      if (team.name && team.id !== undefined) {
        teams.push([String(team.id), team.name]);
      }
    }

    E_TeamList = teams;
    return E_TeamList;
  } catch (e) {
    console.error('팀 목록 불러오기 실패:', e);
    return E_TeamList;
  }
};

export let projectList: [string, string][] = [['all', 'All']];
export const fetchProjectList = async (): Promise<[string, string][]> => {
  try {
    const result = await supabaseUtils.getProjects();

    const projects: [string, string][] = [['all', 'All']];

    for (const project of result) {
      if (project.name && project.id !== undefined) {
        projects.push([String(project.id), project.name]);
      }
    }

    projectList = projects;

    return projectList;
  } catch (e) {
    console.error('프로젝트 목록 불러오기 실패', e);
    return projectList; // fallback: 기존 값 유지
  }
};

export let dummyLabels: [string, string][] = [];

export const fetchTaskPriorities = async (): Promise<[string, string][]> => {
  try {
    const result = await supabaseUtils.getTaskPriorities(); // [{ name }]

    const labels: [string, string][] = [];

    for (const priority of result) {
      if (priority.priority_name && priority.id !== undefined) {
        labels.push([String(priority.id), priority.priority_name]);
      }
    }
    dummyLabels = labels;

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
