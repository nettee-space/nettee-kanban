import { supabase } from '@/shared/lib/supa-client';
// TODO 상태관리 가져오기
// import { useUserStore } from '@/shared/store/useUserStore';

// Nettee 멤버 = 1, 방문자 0
// const isNetteeMember = useUserStore((state) => state.isNetteeMember);
// const isNetteeMember = 1;

/**
 * '작업중요도' 테이블에서 라벨 목록을 가져옵니다.
 *
 * @returns {Promise<Array>} 작업중요도 목록 (ex: ['보류', '보통, '높음', '매우 높음'])
 * @throws 에러 반환환
 */
export const fetchTaskPriorities = async (): Promise<Array<string>> => {
  const { data, error } = await supabase.from('task_priority').select('*');
  if (error) throw error;
  return data;
};
