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
      if (project.name && project.id !== undefined) {
        projects.push([String(project.id), project.name]);
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

// task_priority_id (1,2,3,4,5) <-> stateLabel key (hold,low,medium,high,veryhigh) 매핑
export const taskPriorityIdToStateKey = (priorityId: number): keyof typeof stateLabelMap => {
  const mapping: Record<number, keyof typeof stateLabelMap> = {
    1: 'hold',     // 보류
    2: 'low',      // 낮음
    3: 'medium',   // 보통
    4: 'high',     // 높음
    5: 'veryhigh', // 매우 높음
  };
  return mapping[priorityId] || 'medium'; // 기본값: 보통
};

export const stateKeyToTaskPriorityId = (stateKey: string): number => {
  const mapping: Record<string, number> = {
    'hold': 1,     // 보류
    'low': 2,      // 낮음
    'medium': 3,   // 보통
    'high': 4,     // 높음
    'veryhigh': 5, // 매우 높음
  };
  return mapping[stateKey] || 3; // 기본값: 3 (보통)
};

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
