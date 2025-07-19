// components/Sidebar/AssigneeFilter.tsx
import { E_Team } from '../../constants/kanban';
import { netteeMembers } from '../../constants/nettee';

interface AssigneeFilterProps {
  selectedTeams: string[];
  selectedAssignees: string[];
  isOpen: boolean;
  onTeamToggle: (team: string) => void;
  onAccordionToggle: () => void;
}

export function AssigneeFilter({
  selectedTeams,
  selectedAssignees,
  isOpen,
  onTeamToggle,
  onAccordionToggle,
}: AssigneeFilterProps) {
  const teamList = Object.values(E_Team);
  const memberList = Object.values(netteeMembers).flat();
  console.log(memberList);

  const teamMembers = selectedTeams.includes('All')
    ? memberList
    : selectedTeams.flatMap(
        (team) => netteeMembers[team as keyof typeof netteeMembers]
      );

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>담당자</p>
        <button type="button" onClick={onAccordionToggle}>
          {isOpen ? '▼' : '▲'}
        </button>
      </div>

      <div
        className="flex flex-col overflow-hidden pt-[10px]"
        style={{
          height: isOpen ? '100%' : '0px',
        }}
      >
        <div className="flex flex-wrap gap-[8px] pt-[8px] pb-[16px]">
          {teamList.map((team) => (
            <button
              key={`${team}_button`}
              type="button"
              className={`flex h-[28px] w-[60px] items-center justify-center rounded-[4px] ${
                selectedTeams.includes(team)
                  ? 'bg-[#0065FF] text-white'
                  : 'bg-[#ededed]'
              }`}
              onClick={() => onTeamToggle(team)}
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
