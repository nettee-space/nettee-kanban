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
 * 'kanban_task' 테이블에서 모든 태스크(메인 + 서브)를 조회합니다.
 * project_id, task_priority_id, kaban_user_id로 조건 검색이 가능합니다.
 *
 * @param {object} filters 필터 조건: 프로젝트 아이디, 작업우선중요도 아이디, 칸반사용자 아이디
 * @returns {Promise<KanbanTask[]>} 모든 작업 목록
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getAllTasks = async (filters: {
  project_id?: number;
  task_priority_id?: number;
  kaban_user_id?: string;
}): Promise<KanbanTask[]> => {
  let query = supabase.from('kanban_task').select('*');

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
  console.log('createKanbanTask task:', task);
  const { data, error } = await supabase
    .from('kanban_task')
    .insert(task)
    .select()
    .single();
  console.log('createKanbanTask data:', data, 'error:', error);
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

/**
 * 태스크가 하위 태스크를 가지고 있는지 확인합니다.
 * 기존 getSubTasks 함수를 활용합니다.
 *
 * @param {number} taskId 확인할 태스크 ID
 * @returns {Promise<boolean>} 하위 태스크 존재 여부
 * @throws {Error} Supabase에서 데이터를 조회하는 중 발생한 에러
 */
export const hasSubTasks = async (taskId: number): Promise<boolean> => {
  const subTasks = await getSubTasks(taskId);
  return subTasks.length > 0;
};

/**
 * 태스크를 다른 태스크의 하위로 이동할 수 있는지 검증합니다.
 * 이동하려는 태스크가 이미 하위 태스크를 가지고 있다면 이동을 허용하지 않습니다.
 *
 * @param {number} taskId 이동시키려는 태스크 ID
 * @param {number} newParentId 새로운 상위 태스크 ID
 * @returns {Promise<{canMove: boolean, reason?: string, errorType?: string}>} 이동 가능 여부와 사유, 에러 타입
 * @throws {Error} Supabase에서 데이터를 조회하는 중 발생한 에러
 */
export const validateTaskMove = async (
  taskId: number,
  newParentId: number
): Promise<{ canMove: boolean; reason?: string; errorType?: string }> => {
  // 1. 이동하려는 태스크가 하위 태스크를 가지고 있는지 확인
  const taskHasChildren = await hasSubTasks(taskId);

  if (taskHasChildren) {
    return {
      canMove: false,
      reason:
        '서브 태스크가 있는 태스크는 다른 태스크의 서브 태스크로 연결할 수 없습니다.',
      errorType: 'HAS_SUBTASKS',
    };
  }

  // 2. 순환 참조 방지: 새로운 상위 태스크가 이동하려는 태스크의 하위인지 확인
  const isCircularReference = await checkCircularReference(taskId, newParentId);

  if (isCircularReference) {
    return {
      canMove: false,
      reason:
        '순환 참조가 발생합니다. 해당 태스크를 상위로 설정할 수 없습니다.',
      errorType: 'CIRCULAR_REFERENCE',
    };
  }

  // 3. 새로운 상위 태스크가 존재하는지 확인
  const { data: parentTask, error } = await supabase
    .from('kanban_task')
    .select('id')
    .eq('id', newParentId)
    .single();

  if (error || !parentTask) {
    return {
      canMove: false,
      reason: '상위 태스크가 존재하지 않습니다.',
      errorType: 'PARENT_NOT_FOUND',
    };
  }

  return { canMove: true };
};

/**
 * 순환 참조를 확인합니다.
 * newParentId가 taskId의 하위 태스크인지 재귀적으로 확인합니다.
 *
 * @param {number} taskId 이동시키려는 태스크 ID
 * @param {number} newParentId 새로운 상위 태스크 ID
 * @returns {Promise<boolean>} 순환 참조 여부
 */
const checkCircularReference = async (
  taskId: number,
  newParentId: number
): Promise<boolean> => {
  // 새로운 상위 태스크의 모든 하위 태스크를 재귀적으로 가져와서
  // 그 중에 이동하려는 태스크가 있는지 확인
  const descendants = await getAllDescendants(newParentId);
  console.log(descendants);
  return descendants.some((descendant) => descendant.id === taskId);
};

/**
 * 특정 태스크의 모든 하위 태스크를 재귀적으로 가져옵니다.
 * 기존 getSubTasks 함수를 재귀적으로 활용합니다.
 *
 * @param {number} taskId 상위 태스크 ID
 * @returns {Promise<KanbanTask[]>} 모든 하위 태스크 목록
 */
const getAllDescendants = async (taskId: number): Promise<KanbanTask[]> => {
  // 기존 getSubTasks 함수 활용
  const directChildren = await getSubTasks(taskId);

  if (directChildren.length === 0) {
    return [];
  }

  // 각 직접 하위 태스크의 하위 태스크들도 재귀적으로 가져오기
  const allDescendants: KanbanTask[] = [...directChildren];

  for (const child of directChildren) {
    const childDescendants = await getAllDescendants(child.id);
    allDescendants.push(...childDescendants);
  }

  return allDescendants;
};

/**
 * 서브 태스크를 상위 태스크에서 분리하여 독립적인 메인 태스크로 변경합니다.
 *
 * @param {number} taskId 분리할 서브 태스크 ID
 * @returns {Promise<KanbanTask | null>} 업데이트된 태스크 또는 null
 * @throws {Error} Supabase에서 데이터를 수정하는 중 발생한 에러
 */
export const detachSubTask = async (
  taskId: number
): Promise<KanbanTask | null> => {
  if (isGuest) return null;

  const { data, error } = await supabase
    .from('kanban_task')
    .update({ parent_task_id: null })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 태스크를 다른 태스크의 하위로 안전하게 이동합니다.
 * 이동 전에 유효성 검사를 수행합니다.
 *
 * @param {number} taskId 이동시키려는 태스크 ID
 * @param {number} newParentId 새로운 상위 태스크 ID
 * @returns {Promise<KanbanTask | null>} 업데이트된 태스크 또는 null
 * @throws {Error} 이동이 불가능하거나 Supabase 에러가 발생한 경우
 */
export const moveTaskToSubTask = async (
  taskId: number,
  newParentId: number
): Promise<KanbanTask | null> => {
  if (isGuest) return null;

  // 유효성 검사
  const validation = await validateTaskMove(taskId, newParentId);

  if (!validation.canMove) {
    throw new Error(validation.reason || '태스크 이동이 불가능합니다.');
  }

  // 태스크 업데이트
  const { data, error } = await supabase
    .from('kanban_task')
    .update({ parent_task_id: newParentId })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  return data;
};
