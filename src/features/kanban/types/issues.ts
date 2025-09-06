export type IssueData = {
  sb_id: string; // supabase 고유 ID
  html_url: string; // GitHub 이슈 URL
  id: string; // GitHub 고유 ID
  number: number; // 이슈 번호
  state: string; // TODO: ?
  title: string; // 이슈 제목
  body: string; // 이슈 내용
  created_at: string; // 이슈 생성 시간
  updated_at: string; // 이슈 수정 시간
  progress: string; // 진행 경과
  sta_dt: string; // 작업 시작 시간
  end_dt: string; // 작업 종료 시간
  assignees: string[]; // 담당자
  labels: string[]; // kanban 전용 라벨
  parent: string; // 상위 태스크?
  // 메타 정보 추가됨 (fetch 후 가공 시 삽입)
  project: string; // 프로젝트 이름
  team: string; // 팀 이름
  repo: string; // 저장소 이름
  task_priority: string;
  // pin처리 할 때만 사용 됨
  pinned?: boolean;
};
export type KanbanProgress = 'TODO' | 'DOING' | 'DONE';
export type GroupedIssues = {
  [projectName: string]: TeamDataModel;
};

export type TeamDataModel = {
  [teamName: string]: {
    [progress in KanbanProgress]: IssueData[];
  };
};
export type UpsertIssuePayload = {
  owner: string;
  repo: string | undefined;
  issue_number: number | undefined;
  source: string;
  action: string;
  issue: {
    title: FormDataEntryValue | null;
    body: FormDataEntryValue | null;
    assignees: string[];
    labels: never[];
    progress: string | undefined;
  };
};
