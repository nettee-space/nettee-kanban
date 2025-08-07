interface ProjectHeaderProps {
  title: string;
  onOpen: (key: string) => void;
  isOpened: boolean;
}

export function ProjectHeader({ title, isOpened, onOpen }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between px-[16px] py-[8px] text-[32px] font-bold">
      <h2>{title}</h2>
      <button
        className="mx-[16px] my-[8px] flex h-[32px] w-[32px] items-center justify-center text-[24px]"
        onClick={() => onOpen(`kanban-${title}`)}
      >
        {isOpened ? '▼' : '▲'}
      </button>
    </div>
  );
}
