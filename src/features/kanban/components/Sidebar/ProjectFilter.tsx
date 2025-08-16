import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Checkbox } from '@/shared/components/ui/checkbox';

import { cn } from '@/shared/lib/utils/cn';
import { fetchProjectList, projectList } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function ProjectFilter() {
  const { selectedProjects, toggleProject } = useFilterStore();

  const [list, setList] = useState<string[]>(projectList); // 초기값

  // Supabase에서 fetch + projectList에 merge + local set
  useEffect(() => {
    const load = async () => {
      const updatedList = await fetchProjectList(); // projectList 내부도 갱신됨
      setList([...updatedList]); // 로컬 상태도 업데이트
    };
    load();
  }, []);

  const projectObjects = list.map((name) => ({ id: name, name }));

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <Accordion
        type="single"
        collapsible
        defaultValue="project"
        className="w-full"
      >
        <AccordionItem value="project" className="border-none">
          <AccordionTrigger className="text-black-8 py-0 text-xl font-semibold hover:no-underline">
            <p>프로젝트 선택</p>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-2xl">
            <ul>
              {projectObjects.map((project) => {
                const checked = selectedProjects.includes(project.id);
                return (
                  <li
                    key={`${project.id}_project`}
                    className="px-[8px] py-[6px]"
                  >
                    <label className="flex items-center gap-[8px]">
                      <Checkbox
                        id={`checkbox-${project}`}
                        checked={checked}
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
                      <span
                        className={cn(
                          'font-medium',
                          checked ? 'text-black-13' : 'text-black-7'
                        )}
                      >
                        {project.name}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
