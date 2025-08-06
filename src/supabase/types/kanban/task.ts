export type KanbanTask = {
  id: number;
  title: string;
  description: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  template_id: string | null;
  repo_url: string | null;
  kaban_user_id: string | null;
  task_priority_id: number | null;
  project_id: number | null;
  parent_task_id: number | null;
  create_at: string | null;
  update_at: string | null;
  team_id: number;
};
