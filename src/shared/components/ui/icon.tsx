import { cn } from '@/shared/lib/utils/cn';

interface IconProps {
  src: string;
  size?: number;
  className?: string;
  alt?: string;
}

export const Icon = ({ src, size = 24, className, alt }: IconProps) => {
  return (
    <img
      src={src}
      alt={alt || 'icon'}
      width={size}
      height={size}
      className={cn('inline-block', className)}
    />
  );
};

// 아이콘 경로 상수
export const ICONS = {
  // 16px 아이콘들
  edit16: '/icons/16/16_edit.svg',
  left16: '/icons/16/16_left.svg',
  plus16: '/icons/16/16_plus.svg',
  right16: '/icons/16/16_right.svg',

  // 20px 아이콘들
  checkCircle20: '/icons/20/20_check_circle.svg',
  down20: '/icons/20/20_down.svg',
  github20: '/icons/20/20_github.svg',
  pin20: '/icons/20/20_pin.svg',
  search20: '/icons/20/20_search.svg',
  uncheckCircle20: '/icons/20/20_uncheck_circle.svg',
  unpin20: '/icons/20/20_unpin.svg',
  up20: '/icons/20/20_up.svg',

  // 24px 아이콘들
  calendar24: '/icons/24/24_calendar.svg',
  checkCircle24: '/icons/24/24_check_circle.svg',
  checkSquare24: '/icons/24/24_check_square.svg',
  clear24: '/icons/24/24_clear.svg',
  complete24: '/icons/24/24_complete.svg',
  down24: '/icons/24/24_down.svg',
  error24: '/icons/24/24_error.svg',
  github24: '/icons/24/24_github.svg',
  meatball24: '/icons/24/24_meatball.svg',
  pin24: '/icons/24/24_pin.svg',
  range24: '/icons/24/24_range.svg',
  refresh24: '/icons/24/24_refresh.svg',
  search24: '/icons/24/24_search.svg',
  uncheckCircle24: '/icons/24/24_uncheck_circle.svg',
  uncheckSquare24: '/icons/24/24_uncheck_square.svg',
  unpin24: '/icons/24/24_unpin.svg',
  up24: '/icons/24/24_up.svg',
  worker24: '/icons/24/24_worker.svg',

  // 32px 아이콘들
  addDefault32: '/icons/32/32_add_default.svg',
  addHover32: '/icons/32/32_add_hover.svg',
  down32: '/icons/32/32_down.svg',
  leftAbled32: '/icons/32/32_left_abled.svg',
  leftDisabled32: '/icons/32/32_left_disabled.svg',
  rightAbled32: '/icons/32/32_right_abled.svg',
  rightDisabled32: '/icons/32/32_right_disabled.svg',
  team32: '/icons/32/32_team.svg',
  up32: '/icons/32/32_up.svg',
} as const;
