// components/Sidebar/TeamFilter.tsx
import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Checkbox } from '@/shared/components/ui/checkbox';

import { E_TeamList, fetchTeamList } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function TeamFilter() {
  const { selectedTeams, toggleTeam } = useFilterStore();

  const [teamList, setTeamList] = useState<[string, string][]>(E_TeamList);

  useEffect(() => {
    const loadTeams = async () => {
      const teams = await fetchTeamList();
      setTeamList(teams);
    };
    loadTeams();
  }, []);

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
          <AccordionTrigger className="py-0 text-3xl hover:no-underline">
            <p>팀 선택</p>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-2xl">
            <ul>
              {teamObjects.map((team) => (
                <li key={`${team.id}_team`} className="px-[8px] py-[6px]">
                  <label className="flex items-center gap-[8px]">
                    <Checkbox
                      id={`checkbox-${team}`}
                      checked={selectedTeams.includes(team.id)}
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
                    <span className={team.id === 'All' ? 'font-semibold' : ''}>
                      {team.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
