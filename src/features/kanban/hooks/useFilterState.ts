import { useState } from 'react';

export interface FilterState {
  keyword: string;
  setKeyword: (v: string) => void;
  selectedProject: string;
  setSelectedProject: (v: string) => void;
  selectedTeam: string;
  setSelectedTeam: (v: string) => void;
}

export const useFilterState = (): FilterState => {
  const [keyword, setKeyword] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  return {
    keyword,
    setKeyword,
    selectedProject,
    setSelectedProject,
    selectedTeam,
    setSelectedTeam,
  };
};
