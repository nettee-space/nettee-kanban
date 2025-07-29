import { supabase } from '@/shared/lib/supa-client';

/**
 * '작업중요도' 테이블에서 ID와 중요도 이름 목록을 가져옵니다.
 *
 * @returns {Promise<Array<{ id: number, priority_name: string }>>} 작업중요도 목록 (예: [{ id: 1, priority_name: '보류' }, ...])
 * @throws {Error} Supabase에서 데이터를 가져오는 중 발생한 에러
 */
export const getTaskPriorities = async (): Promise<
  Array<{ id: number; priority_name: string }>
> => {
  const { data, error } = await supabase
    .from('task_priority')
    .select('id, priority_name');

  if (error) throw error;

  return data;
};
