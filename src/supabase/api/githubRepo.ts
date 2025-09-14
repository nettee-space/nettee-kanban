import { supabase } from '@/shared/lib/supa-client';

import { GithubRepo } from '../types/github/repo';

/**
 * 'github_repo' 테이블에서 전체 레포 목록을 조회합니다.
 *
 * @returns {Promise<GithubRepo[]>}
 * @throws {Error}
 */
export const getGithubRepos = async (): Promise<GithubRepo[]> => {
  const { data, error } = await supabase.from('github_repo').select('*');

  if (error) throw error;

  return data || [];
};

/**
 * 'github_repo' 테이블에서 특정 팀의 레포 목록을 조회합니다.
 *
 * @param {number} teamId 팀 ID
 * @returns {Promise<GithubRepo[]>}
 * @throws {Error}
 */
export const getGithubReposByTeam = async (
  teamId: number
): Promise<GithubRepo[]> => {
  const { data, error } = await supabase
    .from('github_repo')
    .select('*')
    .eq('team_id', teamId);

  if (error) throw error;

  return data;
};
