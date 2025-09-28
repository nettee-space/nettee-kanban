import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';

interface ProjectHeaderProps {
  title: string;
  onOpen: () => void;
  isOpened: boolean;
}

export function ProjectHeader({ title, isOpened, onOpen }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between px-[16px] py-[8px] text-[32px] font-bold">
      {/* // TODO: icon을 포함하고 싶다면 프로젝트마다 대표 icon을 supabase에 저장하고 있어야함 */}
      <h2>{title}</h2>
      <Button
        type="button"
        variant={'ghost'}
        size={'icon'}
        className="h-13 w-13 cursor-pointer"
        onClick={onOpen}
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
