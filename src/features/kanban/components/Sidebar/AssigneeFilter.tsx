// components/Sidebar/AssigneeFilter.tsx
import { useEffect, useState } from 'react';

import { E_Team, fetchTeamList } from '../../constants/kanban';
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

  const [teamList, setTeamList] = useState<[string, string][]>(E_Team);

  useEffect(() => {
    const loadTeams = async () => {
      const teams = await fetchTeamList();
      setTeamList(teams);
    };
    loadTeams();
  }, []);

  const allTeamList = teamList.map(([, name]) => name);
  const memberList = Object.values(netteeMembers).flat();

  const teamMembers = selectedTeams.includes('All')
    ? memberList
    : selectedTeams.flatMap(
        (team) => netteeMembers[team as keyof typeof netteeMembers]
      );

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
          {allTeamList.map((team) => (
            <button
              key={`${team}_button`}
              type="button"
              className={`flex h-[28px] w-[60px] items-center justify-center rounded-[4px] ${
                selectedTeams.includes(team)
                  ? 'bg-[#0065FF] text-white'
                  : 'bg-[#ededed]'
              }`}
              onClick={() => toggleTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>

        <ul className="h-[306px] w-full overflow-y-scroll">
          {teamMembers.map((member, idx) => (
            <li key={`${idx + member}_assignee`} className="px-[8px] py-[6px]">
              <label className="flex items-center gap-[8px]">
                <input
                  type="checkbox"
                  className="h-[18px] w-[18px] rounded-[4px]"
                  checked={selectedAssignees.includes(member)}
                  onChange={() => toggleAssignee(member)}
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
