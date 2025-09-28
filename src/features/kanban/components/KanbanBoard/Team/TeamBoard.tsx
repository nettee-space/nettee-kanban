import { useState } from 'react';

import { TeamDataModel } from '@/features/kanban/types/issues';

import { KanbanColumn } from '../Column/KanbanColumn';
import { ColumnContainer } from './ColumnContainer';

interface TeamBoardProps {
  teams: TeamDataModel;
  project: string;
  addIssue?: (issueData: any) => void;
}

export function TeamBoard({ teams, project, addIssue }: TeamBoardProps) {
  // 팀별 열림/닫힘 상태를 관리하는 Map
  const [teamOpenStates, setTeamOpenStates] = useState<Record<string, boolean>>(
    {}
  );

  const toggleTeam = (teamName: string) => {
    setTeamOpenStates((prev) => ({
      ...prev,
      [teamName]: !prev[teamName], // undefined일 경우 false -> true
    }));
  };

  return (
    <div className={`'h-full' flex flex-col gap-[8px] overflow-hidden`}>
      {Object.entries(teams).map(([team, progressMap]) => {
        const isOpen = teamOpenStates[team] || false; // 기본값 false

        return (
          <ColumnContainer
            key={`${team}_kanban`}
            teamName={team}
            open={isOpen}
            onToggle={() => toggleTeam(team)}
          >
            {isOpen ? (
              <div
                className={`mt-[16px] flex h-full gap-[8px] overflow-hidden`}
              >
                {Object.entries(progressMap).map(([progress, issues]) => (
                  <KanbanColumn
                    key={`${team}-${progress}`} // TODO: project id도 넣어줘야함
                    project={project}
                    team={team}
                    progress={progress}
                    issues={issues}
                    addIssue={addIssue}
                  />
                ))}
              </div>
            ) : null}
          </ColumnContainer>
        );
      })}
    </div>
  );
}
