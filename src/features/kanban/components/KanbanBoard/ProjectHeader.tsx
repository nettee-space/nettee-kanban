import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { mapProjectIdToName } from '@/store/issueStore';

interface ProjectHeaderProps {
  title: string;
  onOpen: (key: string) => void;
  isOpened: boolean;
}

export function ProjectHeader({ title, isOpened, onOpen }: ProjectHeaderProps) {
  // title이 ID인 경우 이름으로 변환, 이미 이름인 경우 그대로 사용
  const displayTitle = mapProjectIdToName(title);

  console.log(`🎯 ProjectHeader: "${title}" → "${displayTitle}"`);

  return (
    <div className="flex items-center justify-between px-[16px] py-[8px] text-[32px] font-bold">
      <h2>{displayTitle}</h2>
      <Button
        type="button"
        variant={'ghost'}
        size={'icon'}
        className="h-13 w-13 cursor-pointer"
        onClick={() => onOpen(`kanban-${title}`)} // accordion key는 원래 title 사용
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
