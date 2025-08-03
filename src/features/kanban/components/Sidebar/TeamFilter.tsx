// components/Sidebar/TeamFilter.tsx
import { useEffect, useState } from 'react';

import { E_Team, fetchTeamList } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function TeamFilter() {
  const { selectedTeams, teamAccordionOpen, toggleTeam, toggleTeamAccordion } =
    useFilterStore();

  const [teamList, setTeamList] = useState<[string, string][]>(E_Team);

  useEffect(() => {
    const loadTeams = async () => {
      const teams = await fetchTeamList();
      setTeamList(teams);
    };
    loadTeams();
  }, []);

  const allTeamList = teamList.map(([, name]) => name);

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>팀 선택</p>
        <button type="button" onClick={toggleTeamAccordion}>
          {teamAccordionOpen ? '▼' : '▲'}
        </button>
      </div>

      <ul
        className={`overflow-hidden pt-[10px] ${teamAccordionOpen ? 'h-full' : 'h-0'}`}
      >
        {allTeamList.map((team) => (
          <li key={`${team}_team`} className="px-[8px] py-[6px]">
            <label className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                className="h-[18px] w-[18px] rounded-[4px]"
                checked={selectedTeams.includes(team)}
                onChange={() => toggleTeam(team)}
              />
              <span className={team === 'All' ? 'font-semibold' : ''}>
                {team}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
