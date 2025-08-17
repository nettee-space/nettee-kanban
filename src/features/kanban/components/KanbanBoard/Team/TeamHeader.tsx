import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';

interface TeamHeaderProps {
  projectName: string;
  title: string;
  onClick: (key: string) => void;
  isOpened: boolean;
}

export function TeamHeader({
  isOpened,
  onClick,
  title,
  projectName,
}: TeamHeaderProps) {
  return (
    <div className="flex justify-between">
      <p className="text-[16px] font-semibold">{title}</p>
      <Button
        type="button"
        variant={'ghost'}
        className="cursor-pointer"
        onClick={() => onClick(`${projectName}-${title}`)}
      >
        <Icon
          src={isOpened ? ICONS.down20 : ICONS.up20}
          size={20}
          alt={isOpened ? 'collapse' : 'expand'}
        />
      </Button>
    </div>
  );
}
