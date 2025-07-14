import { Octokit } from 'octokit';

export const octokit = new Octokit({
  auth: import.meta.env.VITE_GIT_PAT,
});
