import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { mapTeamIdToName } from '@/store/issueStore';

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
  // title이 ID인 경우 이름으로 변환, 이미 이름인 경우 그대로 사용
  const displayTitle = isNaN(Number(title)) ? title : mapTeamIdToName(title);
  
  console.log(`🎯 TeamHeader: "${title}" → "${displayTitle}"`);
  
  return (
    <div className="flex justify-between">
      <p className="text-[16px] font-semibold">{displayTitle}</p>
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
