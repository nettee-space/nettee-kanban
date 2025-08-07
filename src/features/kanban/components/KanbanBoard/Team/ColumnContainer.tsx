import React from 'react';
import { TeamHeader } from './TeamHeader';

interface ColumnContainerProps {
  children: React.ReactNode;
  teamName: string;
}

export function ColumnContainer({ teamName, children }: ColumnContainerProps) {
  return (
    <article className="flex flex-col rounded-[8px] bg-[#f5f5f5] p-[16px] font-medium">
      <TeamHeader
        isOpened={true}
        projectName=""
        title={teamName}
        onClick={() => 'test'}
      />
      {children}
    </article>
  );
}
