export type IssueData = {
  sb_id: string;
  html_url: string;
  id: number;
  number: number;
  state: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  progress: string;
  sta_dt: string;
  end_dt: string;
  assignees: string[];
  labels: string[];
  parent: string;

  // 메타 정보 추가됨 (fetch 후 가공 시 삽입)
  project: string;
  team: string;
  repo: string;

  // pin처리 할 때만 사용 됨
  pinned?: boolean;
};

export type KanbanProgress = 'TODO' | 'DOING' | 'DONE';

export type GroupedIssues = {
  [projectName: string]: {
    [teamName: string]: {
      [progress in KanbanProgress]: IssueData[];
    };
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
