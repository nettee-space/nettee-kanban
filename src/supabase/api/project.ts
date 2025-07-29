import { supabase } from '@/shared/lib/supa-client';
// import { useAuthStore } from '@/stores/authStore';

// const isGuest: boolean = useAuthStore.getState().isGuest;
const isGuest = false;

/**
 * 'project(프로젝트)' 테이블에서 프로젝트 목록을 가져옵니다.
 *
 * @returns {Promise<Array<{ id: number, name: string }>>} 프로젝트 목록 (예: [{ id: 1, name: 'Blolet' }, ...])
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getProjects = async (): Promise<
  Array<{ id: number; name: string }>
> => {
  const { data, error } = await supabase.from('project').select('id, name');

  if (error) throw error;
  return data;
};

/**
 * 새로운 프로젝트를 생성합니다.
 *
 * @param {string} name 프로젝트 이름
 * @returns {Promise<{ id: number }>} 생성된 프로젝트 ID
 * @throws {Error} Supabase에 데이터를 삽입하는 중 발생한 에러
 */
export const createProject = async (
  name: string
): Promise<{ id: number } | null> => {
  if (isGuest) return null;

  const { data, error } = await supabase
    .from('project')
    .insert([{ name }])
    .select('id');

  if (error) throw error;
  return data[0];
};

/**
 * 기존 프로젝트의 이름을 수정합니다.
 *
 * @param {number} id 수정할 프로젝트의 ID
 * @param {string} name 수정할 프로젝트 이름
 * @returns {Promise<void>} 없음
 * @throws {Error} Supabase에서 데이터를 업데이트하는 중 발생한 에러
 */
export const updateProject = async (
  id: number,
  name: string
): Promise<void> => {
  if (isGuest) return;

  const { error } = await supabase
    .from('project')
    .update({ name })
    .eq('id', id);

  if (error) throw error;
};

/**
 * 프로젝트를 삭제합니다.
 *
 * @param {number} id 삭제할 프로젝트의 ID
 * @returns {Promise<void>} 없음
 * @throws {Error} Supabase에서 데이터를 삭제하는 중 발생한 에러
 */
export const deleteProject = async (id: number): Promise<void> => {
  if (isGuest) return;

  const { error } = await supabase.from('project').delete().eq('id', id);

  if (error) throw error;
};
