import { TeamDataModel } from '@/features/kanban/types/issues';

import { KanbanColumn } from '../Column/KanbanColumn';
import { ColumnContainer } from './ColumnContainer';

interface TeamBoardProps {
  teams: TeamDataModel;
  addIssue?: (issueData: any) => void;
}

export function TeamBoard({ teams, addIssue }: TeamBoardProps) {
  return (
    <div className={`'h-full' flex flex-col gap-[8px] overflow-hidden`}>
      {Object.entries(teams).map(([team, progressMap]) => (
        <ColumnContainer key={`${team}_kanban`} teamName={team}>
          <div
            className={`mt-[16px] flex h-full flex-wrap gap-[8px] overflow-hidden`}
          >
            {Object.entries(progressMap).map(([progress, issues]) => (
              <KanbanColumn
                key={`${team}-${progress}`} // TODO: project id도 넣어줘야함
                project={'Blolet'} // TODO:
                team={team}
                progress={progress}
                issues={issues}
                addIssue={addIssue}
              />
            ))}
          </div>
        </ColumnContainer>
      ))}
    </div>
  );
}
