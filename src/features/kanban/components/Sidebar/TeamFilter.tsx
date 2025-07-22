// components/Sidebar/TeamFilter.tsx
import { E_Team } from '../../constants/kanban';

interface TeamFilterProps {
  selectedTeams: string[];
  isOpen: boolean;
  onToggle: (team: string) => void;
  onAccordionToggle: () => void;
}

export function TeamFilter({
  selectedTeams,
  isOpen,
  onToggle,
  onAccordionToggle,
}: TeamFilterProps) {
  const teamList = Object.values(E_Team);
  console.log(teamList);
  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>팀 선택</p>
        <button type="button" onClick={onAccordionToggle}>
          {isOpen ? '▼' : '▲'}
        </button>
      </div>

      <ul className={`overflow-hidden pt-[10px] ${isOpen ? 'h-full' : 'h-0'}`}>
        {teamList.map((team) => (
          <li key={`${team}_team`} className="px-[8px] py-[6px]">
            <label className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                className="h-[18px] w-[18px] rounded-[4px]"
                checked={selectedTeams.includes(team)}
                onChange={() => onToggle(team)}
              />
              {team}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
