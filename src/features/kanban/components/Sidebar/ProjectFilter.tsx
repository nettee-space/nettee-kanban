import { useEffect, useState } from 'react';

import { fetchProjectList, projectList } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function ProjectFilter() {
  const {
    selectedProjects,
    projectAccordionOpen,
    toggleProject,
    toggleProjectAccordion,
  } = useFilterStore();

  const [list, setList] = useState<string[]>(projectList); // 초기값

  // Supabase에서 fetch + projectList에 merge + local set
  useEffect(() => {
    const load = async () => {
      const updatedList = await fetchProjectList(); // projectList 내부도 갱신됨
      setList([...updatedList]); // 로컬 상태도 업데이트
    };
    load();
  }, []);

  const allProjectList = list;

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>프로젝트 선택</p>
        <button type="button" onClick={toggleProjectAccordion}>
          {projectAccordionOpen ? '▼' : '▲'}
        </button>
      </div>

      <ul
        className={`overflow-hidden pt-[10px] ${projectAccordionOpen ? 'h-full' : 'h-0'}`}
      >
        {allProjectList.map((project) => (
          <li key={`${project}_project`} className="px-[8px] py-[6px]">
            <label className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                className="h-[18px] w-[18px] rounded-[4px]"
                checked={selectedProjects.includes(project)}
                onChange={() => toggleProject(project)}
              />
              <span className={project === 'All' ? 'font-semibold' : ''}>
                {project}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
