// components/Sidebar/AssigneeFilter.tsx
import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Checkbox } from '@/shared/components/ui/checkbox';

import { E_TeamList, fetchTeamList } from '../../constants/kanban';
import { netteeMembers } from '../../constants/nettee';
import { useFilterStore } from '../../store/filterStore';

export function AssigneeFilter() {
  const { selectedTeams, selectedAssignees, toggleTeam, toggleAssignee } =
    useFilterStore();

  const [teamList, setTeamList] = useState<[string, string][]>(E_TeamList);

  useEffect(() => {
    const loadTeams = async () => {
      const teams = await fetchTeamList();
      setTeamList(teams);
    };
    loadTeams();
  }, []);

  const teamObjects = teamList.map(([id, name]) => ({ id, name }));

  const memberList = Object.values(netteeMembers).flat();

  const teamMembers = selectedTeams.includes('All')
    ? memberList
    : selectedTeams.flatMap((teamId) => {
        const teamName = teamList.find(([id]) => id === teamId)?.[1];
        return teamName
          ? netteeMembers[teamName as keyof typeof netteeMembers]
          : [];
      });

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <Accordion
        type="single"
        collapsible
        defaultValue="assignee"
        className="w-full"
      >
        <AccordionItem value="assignee" className="border-none">
          <AccordionTrigger className="py-0 text-3xl hover:no-underline">
            <p>담당자</p>
          </AccordionTrigger>

          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-2xl">
            <div className="flex flex-wrap gap-[8px] pt-[8px] pb-[16px]">
              {teamObjects.map((team) => (
                <button
                  key={`${team.id}_button`}
                  type="button"
                  className={`flex h-[28px] w-[60px] items-center justify-center rounded-[4px] ${
                    selectedTeams.includes(team.id)
                      ? 'bg-[#0065FF] text-white'
                      : 'bg-[#ededed]'
                  }`}
                  onClick={() => {
                    console.log(
                      'toggleTeam 호출값 ID: ',
                      team.id,
                      'Name: ',
                      team.name
                    );
                    toggleTeam(team.id);
                  }}
                >
                  {team.name}
                </button>
              ))}
            </div>

            <ul className="h-[306px] w-full overflow-y-scroll">
              {teamMembers.map((member) => (
                // TODO: 추수 같은 팀이면서 동명이인인 멤버가 있을 경우 어떻게 이름을 저장할 것인지 논의 필요
                <li key={`${member}_assignee`} className="px-[8px] py-[6px]">
                  <label className="flex items-center gap-[8px]">
                    <Checkbox
                      id={`checkbox-${member}`}
                      checked={selectedAssignees.includes(member)}
                      onCheckedChange={() => {
                        console.log('toggleAssignee 호출값: ', member);
                        toggleAssignee(member);
                      }}
                    />
                    <div className="h-[20px] w-[20px] rounded-full bg-[#dbdbdb]"></div>
                    {member}
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
