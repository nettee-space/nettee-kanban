// components/Sidebar/TeamFilter.tsx
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

export function TeamFilter() {
  const { selectedTeams, toggleTeam, teamList, loadTeamList } =
    useFilterStore();

  useEffect(() => {
    loadTeamList();
  }, [loadTeamList]);

  const teamObjects = teamList.map(([id, name]) => ({ id, name }));

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <Accordion
        type="single"
        collapsible
        defaultValue="team"
        className="w-full"
      >
        <AccordionItem value="team" className="border-none">
          <AccordionTrigger className="text-black-8 py-0 text-sm font-semibold hover:no-underline">
            <p>팀 선택</p>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-sm">
            <ul>
              {teamObjects.map((team) => {
                const checked = selectedTeams.includes(team.id);
                return (
                  <li key={`${team.id}_team`} className="px-[8px] py-[6px]">
                    <label className="flex items-center gap-[8px]">
                      <Checkbox
                        id={`checkbox-${team}`}
                        checked={checked}
                        onCheckedChange={() => {
                          console.log(
                            'toggleTeam 호출값 ID:',
                            team.id,
                            'Name:',
                            team.name
                          );
                          toggleTeam(team.id);
                        }}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          checked ? 'text-black-13' : 'text-black-7'
                        )}
                      >
                        {team.name}
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
