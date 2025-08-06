import { supabase } from '@/shared/lib/supa-client';

import { GithubIssueTemplate } from '../types/github/issue-template';

/**
 * 특정 GitHub 레포에 연결된 이슈 템플릿을 조회합니다.
 *
 * @param {number} repoId GitHub 레포 ID
 * @returns {Promise<GithubIssueTemplate[]>}
 * @throws {Error}
 */
export const getGithubIssueTemplates = async (
  repoId: number
): Promise<GithubIssueTemplate[]> => {
  const { data, error } = await supabase
    .from('github_issue_template')
    .select('*')
    .eq('github_repo_id', repoId);

  if (error) throw error;

  return data;
};
