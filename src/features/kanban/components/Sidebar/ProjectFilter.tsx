import { projectList } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function ProjectFilter() {
  const {
    selectedProjects,
    projectAccordionOpen,
    toggleProject,
    toggleProjectAccordion,
  } = useFilterStore();

  const allProjectList = projectList;

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
