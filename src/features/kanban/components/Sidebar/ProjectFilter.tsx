import { projectList } from '../../constants/kanban';

interface ProjectFilterProps {
  selectedProjects: string[];
  isOpen: boolean;
  onToggle: (project: string) => void;
  onAccordionToggle: () => void;
}

export function ProjectFilter({
  selectedProjects,
  isOpen,
  onToggle,
  onAccordionToggle,
}: ProjectFilterProps) {
  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>프로젝트 선택</p>
        <button type="button" onClick={onAccordionToggle}>
          {isOpen ? '▼' : '▲'}
        </button>
      </div>

      <ul className={`overflow-hidden pt-[10px] ${isOpen ? 'h-full' : 'h-0'}`}>
        {projectList.map((project) => (
          <li key={`${project}_project`} className="px-[8px] py-[6px]">
            <label className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                className="h-[18px] w-[18px] rounded-[4px]"
                checked={selectedProjects.includes(project)}
                onChange={() => onToggle(project)}
              />
              {project}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
