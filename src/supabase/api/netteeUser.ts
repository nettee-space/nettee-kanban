import { supabase } from '@/shared/lib/supa-client';

/**
 * 'nettee_user' 테이블에서 GitHub 로그인 ID, 실명, 팀 ID 목록을 가져옵니다.
 *
 * @returns {Promise<Array<{ login: string, real_name: string, team_id: number[] }>>}
 * 사용자 목록 (예: [{ login: 'silberbullet', real_name: '박경우', team_id: [4, 1] }, ...])
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getNetteeUsers = async (): Promise<
  Array<{ login: string; real_name: string; team_id: number[] }>
> => {
  const { data, error } = await supabase
    .from('nettee_user')
    .select('login, real_name, team_id');

  if (error) throw error;

  return data;
};
