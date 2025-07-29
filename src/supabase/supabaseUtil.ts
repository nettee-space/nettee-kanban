import {
  getKanbanUsers,
  getKanbanUsersByTeamId,
} from '@/supabase/api/kanbanUser';
import { getNetteeUsers } from '@/supabase/api/netteeUser';
import { getProjects } from '@/supabase/api/project';
import { getTaskPriorities } from '@/supabase/api/taskPriority';
import { getTeams } from '@/supabase/api/team';

export const supabaseUtils = {
  // task_priority
  getTaskPriorities,
  // team
  getTeams,
  // project
  getProjects,
  // nettee_user
  getNetteeUsers,
  // kanban_user
  getKanbanUsers,
  getKanbanUsersByTeamId,
};
