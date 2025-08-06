import { supabase } from '@/shared/lib/supa-client';

import { KanbanTask } from '../types/kanban/task';
// import { useAuthStore } from '@/stores/authStore';

// const isGuest: boolean = useAuthStore.getState().isGuest;
const isGuest = false;

/**
 * 'kanban_task' 테이블에서 메인 태스크와 해당 하위 태스크 목록을 트리 구조로 조회합니다.
 * project_id, task_priority_id, kaban_user_id로 조건 검색이 가능합니다.
 *
 * @param {object} filters 필터 조건: 프로젝트 아이디, 작업우선중요도 아이디, 칸반사용자 아이디
 * @returns {Promise<(KanbanTask & { children: KanbanTask[] })[]>} 트리 형태의 작업 목록
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getKanbanTaskTree = async (filters: {
  project_id?: number;
  task_priority_id?: number;
  kaban_user_id?: string;
}): Promise<Array<KanbanTask & { children: KanbanTask[] }>> => {
  let query = supabase
    .from('kanban_task')
    .select('*')
    .is('parent_task_id', null); // 메인 테스크만

  if (filters.project_id !== undefined)
    query = query.eq('project_id', filters.project_id);

  if (filters.task_priority_id !== undefined)
    query = query.eq('task_priority_id', filters.task_priority_id);

  if (filters.kaban_user_id !== undefined)
    query = query.eq('kaban_user_id', filters.kaban_user_id);

  const { data: mainTasks, error } = await query;

  if (error) throw error;

  // 병렬로 자식 태스크를 가져와 트리 구성
  const tasksWithChildren = await Promise.all(
    (mainTasks ?? []).map(async (mainTask) => {
      const children = await getSubTasks(mainTask.id);
      return {
        ...mainTask,
        children,
      };
    })
  );

  return tasksWithChildren;
};

/**
 * 'kanban_task' 테이블에서 메인 테스크를 조회합니다.
 * project_id, task_priority_id, kaban_user_id로 조건 검색이 가능합니다.
 *
 * @param {object} filters 필터 조건: 프로젝트 아이디, 작업우선중요도 아이디, 칸반사용자 아이디
 * @returns {Promise<KanbanTask[]>} 작업 목록
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getMainTasks = async (filters: {
  project_id?: number;
  task_priority_id?: number;
  kaban_user_id?: string;
}): Promise<KanbanTask[]> => {
  let query = supabase
    .from('kanban_task')
    .select('*')
    .is('parent_task_id', null);

  if (filters.project_id !== undefined)
    query = query.eq('project_id', filters.project_id);

  if (filters.task_priority_id !== undefined)
    query = query.eq('task_priority_id', filters.task_priority_id);

  if (filters.kaban_user_id !== undefined)
    query = query.eq('kaban_user_id', filters.kaban_user_id);

  const { data, error } = await query;

  if (error) throw error;

  return data;
};

/**
 * 'kanban_task' 테이블에서 서브 테스크를 조회합니다.
 * project_id, task_priority_id, kaban_user_id로 조건 검색이 가능합니다.
 *
 * @param {object} parentId 메인 테스크 아이디
 * @returns {Promise<KanbanTask[]>} 작업 목록
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getSubTasks = async (parentId: number): Promise<KanbanTask[]> => {
  const { data, error } = await supabase
    .from('kanban_task')
    .select('*')
    .eq('parent_task_id', parentId);

  if (error) throw error;
  return data;
};

/**
 * 'kanban_task' 테이블에 새로운 작업을 추가합니다.
 *
 * @param {Partial<KanbanTask>} task 생성할 작업 정보
 * @returns {Promise<KanbanTask>} 생성된 작업
 * @throws {Error} Supabase에 데이터를 삽입하는 중 발생한 에러
 */
export const createKanbanTask = async (
  task: Partial<KanbanTask>
): Promise<KanbanTask | null> => {
  if (isGuest) return null;

  const { data, error } = await supabase
    .from('kanban_task')
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 'kanban_task' 테이블의 작업을 수정합니다.
 *
 * @param {number} id 수정할 작업의 ID
 * @param {Partial<KanbanTask>} updates 수정할 필드들
 * @returns {Promise<KanbanTask>} 수정된 작업
 * @throws {Error} Supabase에서 데이터를 수정하는 중 발생한 에러
 */
export const updateKanbanTask = async (
  id: number,
  updates: Partial<KanbanTask>
): Promise<KanbanTask | null> => {
  if (isGuest) return null;

  const { data, error } = await supabase
    .from('kanban_task')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 'kanban_task' 테이블에서 특정 작업을 삭제합니다.
 *
 * @param {number} id 삭제할 작업의 ID
 * @returns {Promise<void>} 삭제 결과
 * @throws {Error} Supabase에서 데이터를 삭제하는 중 발생한 에러
 */
export const deleteKanbanTask = async (id: number): Promise<void> => {
  if (isGuest) return;

  const { error } = await supabase.from('kanban_task').delete().eq('id', id);

  if (error) throw error;
};
