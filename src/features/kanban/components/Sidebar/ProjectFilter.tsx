import { useEffect } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Checkbox } from '@/shared/components/ui/checkbox';

import { cn } from '@/shared/lib/utils/cn';
import { useFilterStore } from '../../store/filterStore';

export function ProjectFilter() {
  const { selectedProjects, toggleProject, projectList, loadProjectList } =
    useFilterStore();

  useEffect(() => {
    loadProjectList();
  }, [loadProjectList]);

  const projectObjects = projectList.map(([id, name]) => ({ id, name }));

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
                    key={`${project.name}_project`}
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
