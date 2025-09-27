import { cn } from '@/shared/lib/utils/cn';

export const kanbanStyleMap = {
  TODO: {
    line: 'bg-[#F9AA01]',
  },
  DOING: {
    line: 'bg-[#1E85E4]',
  },
  DONE: {
    line: 'bg-[#58BE1A]',
  },
  DEFAULT: {
    line: 'bg-[#767676]',
  },
} as const;

export function Divider({ className }: { className?: string }) {
  return <div className={cn('w-full border-b border-[#dbdbdb]', className)} />;
}
