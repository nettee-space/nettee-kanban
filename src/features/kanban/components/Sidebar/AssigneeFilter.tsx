// components/Sidebar/AssigneeFilter.tsx
import { useEffect, useState } from 'react';

import { Checkbox } from '@/shared/components/ui/checkbox';

import { E_TeamList, fetchTeamList } from '../../constants/kanban';
import { netteeMembers } from '../../constants/nettee';
import { useFilterStore } from '../../store/filterStore';

export function AssigneeFilter() {
  const {
    selectedTeams,
    selectedAssignees,
    assigneeAccordionOpen,
    toggleTeam,
    toggleAssignee,
    toggleAssigneeAccordion,
  } = useFilterStore();

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
      <div className="flex items-center justify-between">
        <p>담당자</p>
        <button type="button" onClick={toggleAssigneeAccordion}>
          {assigneeAccordionOpen ? '▼' : '▲'}
        </button>
      </div>

      <div
        className="flex flex-col overflow-hidden pt-[10px]"
        style={{
          height: assigneeAccordionOpen ? '100%' : '0px',
        }}
      >
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
          {teamMembers.map((member, idx) => (
            <li key={`${idx + member}_assignee`} className="px-[8px] py-[6px]">
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
      </div>
    </div>
  );
}
