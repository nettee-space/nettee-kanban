import { Octokit } from 'octokit';

export const octokit: Octokit = new Octokit({
  auth: import.meta.env.VITE_GIT_PAT,
});
