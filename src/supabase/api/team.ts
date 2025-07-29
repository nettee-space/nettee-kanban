import { supabase } from '@/shared/lib/supa-client';

/**
 * 'team' 테이블에서 팀 ID와 이름 목록을 가져옵니다.
 *
 * @returns {Promise<Array<{ id: number, name: string }>>} 팀 목록 (예: [{ id: 1, name: 'Lead' }, ...])
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getTeams = async (): Promise<
  Array<{ id: number; name: string }>
> => {
  const { data, error } = await supabase.from('team').select('id, name');

  if (error) throw error;

  return data;
};
