import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';

interface ProjectHeaderProps {
  title: string;
  onOpen: (key: string) => void;
  isOpened: boolean;
}

export function ProjectHeader({ title, isOpened, onOpen }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between px-[16px] py-[8px] text-[32px] font-bold">
      <h2>{title}</h2>
      <Button
        type="button"
        variant={'ghost'}
        size={'icon'}
        className="h-13 w-13 cursor-pointer"
        onClick={() => onOpen(`kanban-${title}`)}
      >
        <Icon
          src={isOpened ? ICONS.down32 : ICONS.up32}
          size={32}
          alt={isOpened ? 'collapse' : 'expand'}
        />
      </Button>
    </div>
  );
}
