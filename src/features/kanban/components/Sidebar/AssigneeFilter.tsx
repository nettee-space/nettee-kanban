// components/Sidebar/AssigneeFilter.tsx
import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Checkbox } from '@/shared/components/ui/checkbox';

import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { cn } from '@/shared/lib/utils/cn';
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
          <AccordionTrigger className="text-black-8 py-0 text-xl font-semibold hover:no-underline">
            <p>담당자</p>
          </AccordionTrigger>

          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-2xl">
            <div className="flex flex-wrap gap-[8px] pt-[8px] pb-[16px]">
              {teamObjects.map((team) => (
                <Button
                  key={`${team.id}_button`}
                  type="button"
                  variant={'default'}
                  className={`flex h-[28px] w-[60px] cursor-pointer items-center justify-center text-xl ${
                    selectedTeams.includes(team.id)
                      ? 'bg-primary-12 text-white'
                      : 'text-black-7 bg-[#ededed]'
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
                </Button>
              ))}
            </div>

            <ul className="h-[306px] w-full space-y-1 overflow-y-scroll">
              {teamMembers.map((member) => {
                const checked = selectedAssignees.includes(member);
                return (
                  // TODO: 추수 같은 팀이면서 동명이인인 멤버가 있을 경우 어떻게 이름을 저장할 것인지 논의 필요
                  <li key={`${member}_assignee`} className="px-[8px] py-[4px]">
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-[8px] font-medium',
                        checked ? 'text-black-13' : 'text-black-7'
                      )}
                    >
                      <Checkbox
                        id={`checkbox-${member}`}
                        checked={checked}
                        onCheckedChange={() => {
                          console.log('toggleAssignee 호출값: ', member);
                          toggleAssignee(member);
                        }}
                      />
                      <Icon
                        src={ICONS.worker24}
                        size={24}
                        alt={`${member}-github-profile`}
                      />
                      {member}
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
