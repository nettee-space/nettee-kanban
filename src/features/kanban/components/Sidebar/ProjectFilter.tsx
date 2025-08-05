import { useEffect, useState } from 'react';

import { Checkbox } from '@/shared/components/ui/checkbox';

import { fetchProjectList, projectList } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function ProjectFilter() {
  const {
    selectedProjects,
    projectAccordionOpen,
    toggleProject,
    toggleProjectAccordion,
  } = useFilterStore();

  const [list, setList] = useState<[string, string][]>(projectList); // 초기값

  // Supabase에서 fetch + projectList에 merge + local set
  useEffect(() => {
    const load = async () => {
      const updatedList = await fetchProjectList(); // projectList 내부도 갱신됨
      setList([...updatedList]); // 로컬 상태도 업데이트
    };
    load();
  }, []);

  const projectObjects = list.map(([id, name]) => ({ id, name }));

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
        {projectObjects.map((project) => (
          <li key={`${project.id}_project`} className="px-[8px] py-[6px]">
            <label className="flex items-center gap-[8px]">
              <Checkbox
                id={`checkbox-${project}`}
                checked={selectedProjects.includes(project.id)}
                onCheckedChange={() => {
                  console.log(
                    'toggleProject 호출값 ID:',
                    project.id,
                    'Name:',
                    project.name
                  );
                  toggleProject(project.id);
                }}
              />
              <span className={project.name === 'All' ? 'font-semibold' : ''}>
                {project.name}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
