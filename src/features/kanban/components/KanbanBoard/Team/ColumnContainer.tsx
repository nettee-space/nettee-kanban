import React from 'react';

import { TeamHeader } from './TeamHeader';

interface ColumnContainerProps {
  children: React.ReactNode;
  teamName: string;
  open: boolean;
  onToggle: () => void;
}

export function ColumnContainer({
  teamName,
  children,
  onToggle,
  open,
}: ColumnContainerProps) {
  return (
    <article className="flex flex-col rounded-[8px] bg-[#f5f5f5] p-[16px] font-medium">
      <TeamHeader
        isOpened={open}
        projectName=""
        title={teamName}
        onClick={() => onToggle()}
      />
      {children}
    </article>
  );
}
