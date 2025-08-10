import { supabaseUtils } from '@/supabase/supabaseUtil';

export enum E_Team {
  all = 'All',
  lead = 'Lead',
  pl = 'PL',
  fe = 'FE',
  be = 'BE',
  ux = 'UXUI',
}
export let E_TeamList: [string, string][] = [['All', 'All']];

export const fetchTeamList = async (): Promise<[string, string][]> => {
  try {
    const result = await supabaseUtils.getTeams(); // [{ id, name }]

    const teams: [string, string][] = [['All', 'All']];

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

export const sidebarList = ['project', 'team', 'assignee', 'label', 'more'];

// 1차원 배열로 통합된 projectList - 서버에서 데이터 가져와서 업데이트
export let projectList = ['All', 'Blolet'];
export const fetchProjectList = async (): Promise<string[]> => {
  try {
    const result = await supabaseUtils.getProjects();

    const projects: string[] = ['All'];

    for (const project of result) {
      if (project.name) {
        projects.push(project.name);
      }
    }

    projectList = projects;
    return projectList;
  } catch (e) {
    console.error('프로젝트 목록 불러오기 실패', e);
    return projectList; // fallback: 기존 값 유지
  }
};

// 1차원 배열로 통합된 dummyLabels - 서버에서 데이터 가져와서 업데이트
export let dummyLabels = ['보류', '낮음', '보통', '높음', '매우 높음'];
export const fetchTaskPriorities = async (): Promise<string[]> => {
  try {
    const result = await supabaseUtils.getTaskPriorities();

    const labels: string[] = [];

    for (const priority of result) {
      if (priority.priority_name) {
        labels.push(priority.priority_name);
      }
    }
    dummyLabels = labels;

    return dummyLabels;
  } catch (e) {
    console.error('작업중요도 목록 불러오기 실패:', e);
    return dummyLabels;
  }
};

export const kanbanStyleMap = {
  TODO: {
    bg: 'bg-[#FFFBDE]',
    text: 'text-[#F9AA01]',
  },
  DOING: {
    bg: 'bg-[#E7F3FE]',
    text: 'text-[#1E85E4]',
  },
  DONE: {
    bg: 'bg-[#EEFBE6]',
    text: 'text-[#58BE1A]',
  },
  DEFAULT: {
    bg: 'bg-[#f5f5f5]',
    text: 'text-[#767676]',
  },
} as const;
