import { supabase } from '@/shared/lib/supa-client';
// import { useAuthStore } from '@/stores/authStore';

// const isGuest: boolean = useAuthStore.getState().isGuest;
const isGuest = false;

/**
 * 'kanban_user' 테이블에서 전체 사용자 목록을 조회합니다.
 *
 * @returns {Promise<Array<{ login: string, name: string, avatar_url: string, team_id: number[] }>>}
 * 전체 사용자 목록
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getKanbanUsers = async (): Promise<
  Array<{ login: string; name: string; avatar_url: string; team_id: number[] }>
> => {
  const { data, error } = await supabase
    .from('kanban_user')
    .select('login, name, avatar_url, team_id');

  if (error) throw error;
  return data;
};

/**
 * 특정 팀 ID에 속한 사용자 목록을 조회합니다.
 *
 * @param {number} teamId 팀 ID
 * @returns {Promise<Array<{ login: string, name: string, avatar_url: string }>>}
 * 해당 팀 사용자 목록
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getKanbanUsersByTeamId = async (
  teamId: number
): Promise<Array<{ login: string; name: string; avatar_url: string }>> => {
  const { data, error } = await supabase
    .from('kanban_user')
    .select('login, name, avatar_url')
    .contains('team_id', [teamId]); // 배열 필드 조건

  if (error) throw error;

  return data;
};

/**
 * 새 칸반 사용자를 생성합니다.
 *
 * @param {{ login: string, name: string, avatar_url: string, team_id: number[] }} payload 사용자 정보
 * @returns {Promise<void>}
 * @throws {Error} Supabase에 데이터를 삽입하는 중 발생한 에러
 */
export const createKanbanUser = async (payload: {
  login: string;
  name: string;
  avatar_url: string;
  team_id: number[];
}): Promise<void> => {
  if (isGuest) return;

  const { error } = await supabase.from('kanban_user').insert([payload]);

  if (error) throw error;
};

/**
 * 로그인 ID를 기준으로 칸반 사용자 정보를 수정합니다.
 *
 * @param {string} login 수정 대상 사용자 login
 * @param {{ name?: string, avatar_url?: string, team_id?: number[] }} updates 수정할 항목들
 * @returns {Promise<void>}
 * @throws {Error} Supabase에서 데이터를 수정하는 중 발생한 에러
 */
export const updateKanbanUser = async (
  login: string,
  updates: { name?: string; avatar_url?: string; team_id?: number[] }
): Promise<void> => {
  if (isGuest) return;

  const { error } = await supabase
    .from('kanban_user')
    .update(updates)
    .eq('login', login);

  if (error) throw error;
};

/**
 * 로그인 ID를 기준으로 칸반 사용자를 삭제합니다.
 *
 * @param {string} login 삭제할 사용자 login
 * @returns {Promise<void>}
 * @throws {Error} Supabase에서 데이터를 삭제하는 중 발생한 에러
 */
export const deleteKanbanUser = async (login: string): Promise<void> => {
  if (isGuest) return;

  const { error } = await supabase
    .from('kanban_user')
    .delete()
    .eq('login', login);

  if (error) throw error;
};
