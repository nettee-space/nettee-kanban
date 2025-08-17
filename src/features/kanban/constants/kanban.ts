import { supabaseUtils } from '@/supabase/supabaseUtil';

// FilterStore의 기본값과 동일한 기본 팀 목록
export const DEFAULT_TEAM_LIST: [string, string][] = [['All', '전체']];

export const fetchTeamList = async (): Promise<[string, string][]> => {
  try {
    const result = await supabaseUtils.getTeams(); // [{ id, name }]

    const teams: [string, string][] = [...DEFAULT_TEAM_LIST];

    for (const team of result) {
      if (team.name && team.id !== undefined) {
        teams.push([String(team.id), team.name]);
      }
    }

    return teams;
  } catch (e) {
    console.error('팀 목록 불러오기 실패:', e);
    return DEFAULT_TEAM_LIST;
  }
};

export const sidebarList = ['project', 'team', 'assignee', 'label', 'more'];

// FilterStore의 기본값과 동일한 기본 프로젝트 목록
export const DEFAULT_PROJECT_LIST: [string, string][] = [['All', '전체']];

export const fetchProjectList = async (): Promise<[string, string][]> => {
  try {
    const result = await supabaseUtils.getProjects();

    const projects: [string, string][] = [...DEFAULT_PROJECT_LIST];

    for (const project of result) {
      if (project.name) {
        projects.push([project.name, project.name]);
      }
    }

    return projects;
  } catch (e) {
    console.error('프로젝트 목록 불러오기 실패', e);
    return DEFAULT_PROJECT_LIST; // fallback: 기본값 사용
  }
};

// StateLabel의 state와 매핑되는 라벨 맵
export const stateLabelMap = {
  hold: '보류',
  low: '낮음',
  medium: '보통',
  high: '높음',
  veryhigh: '매우 높음',
  todo: 'TODO',
  doing: 'DOING',
  done: 'DONE',
} as const;

// 라벨 텍스트에서 state key를 찾는 헬퍼 함수
export const getStateKeyFromLabel = (
  labelText: string
): keyof typeof stateLabelMap => {
  const entry = Object.entries(stateLabelMap).find(
    ([_, value]) => value === labelText
  );
  return entry ? (entry[0] as keyof typeof stateLabelMap) : 'todo'; // 기본값
};

// 1차원 배열로 통합된 dummyLabels - 서버에서 데이터 가져와서 업데이트
export let dummyLabels: string[] = Object.values(stateLabelMap);
export const fetchTaskPriorities = async (): Promise<string[]> => {
  try {
    const result = await supabaseUtils.getTaskPriorities();

    const labels: string[] = [];

    for (const priority of result) {
      if (priority.priority_name) {
        labels.push(priority.priority_name);
      }
    }
    // 서버에서 가져온 데이터로 업데이트하되, 기본값은 stateLabelMap 사용
    dummyLabels = labels.length > 0 ? labels : Object.values(stateLabelMap);

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
