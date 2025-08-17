import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils/cn';
import { stateLabelMap } from '../constants/kanban';

// StateLabel에서 사용할 수 있는 state 타입
export type StateType = keyof typeof stateLabelMap;

const stateLabelVariants = cva('', {
  variants: {
    state: {
      todo: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태
        'data-[selected=true]:border-yellow-1 data-[selected=true]:bg-yellow-1 data-[selected=true]:text-yellow-4',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-yellow-3 data-[selected=true]:hover:border-yellow-3',
      ],
      hold: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태
        'data-[selected=true]:border-purple-1 data-[selected=true]:bg-purple-1 data-[selected=true]:text-purple-4',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-purple-3 data-[selected=true]:hover:border-purple-3',
      ],
      medium: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태
        'data-[selected=true]:border-orange-1 data-[selected=true]:bg-orange-1 data-[selected=true]:text-orange-4',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-orange-3 data-[selected=true]:hover:border-orange-3',
      ],
      high: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태
        'data-[selected=true]:border-pink-1 data-[selected=true]:bg-pink-1 data-[selected=true]:text-pink-4',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-pink-3 data-[selected=true]:hover:border-pink-3',
      ],
      veryhigh: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태
        'data-[selected=true]:border-red-1 data-[selected=true]:bg-red-1 data-[selected=true]:text-red-4',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-red-3 data-[selected=true]:hover:border-red-3',
      ],
      doing: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태
        'data-[selected=true]:border-blue-1 data-[selected=true]:bg-blue-1 data-[selected=true]:text-blue-4',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-blue-3 data-[selected=true]:hover:border-blue-3',
      ],
      done: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태
        'data-[selected=true]:border-green-1 data-[selected=true]:bg-green-1 data-[selected=true]:text-green-4',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-green-3 data-[selected=true]:hover:border-green-3',
      ],
      low: [
        // 기본 상태 (클릭 안됨)
        'data-[selected=false]:border-black-4 data-[selected=false]:bg-black-4 data-[selected=false]:text-black-7',
        'data-[selected=false]:hover:bg-black-5 data-[selected=false]:hover:border-black-5',
        // 클릭된 상태 (low는 black이므로 동일한 색상 사용)
        'data-[selected=true]:border-black-4 data-[selected=true]:bg-black-4 data-[selected=true]:text-black-10',
        // 클릭된 상태에서 hover
        'data-[selected=true]:hover:bg-black-5 data-[selected=true]:hover:border-black-5',
      ],
    },
  },
  defaultVariants: {
    state: 'todo',
  },
});

interface StateLabelProps
  extends React.ComponentProps<typeof Label>,
    VariantProps<typeof stateLabelVariants> {
  selected?: boolean;
  children: React.ReactNode;
}

function StateLabel({
  className,
  state,
  selected = false,
  children,
  ...props
}: StateLabelProps) {
  return (
    <Label
      data-selected={selected}
      className={cn(stateLabelVariants({ state }), className)}
      {...props}
    >
      {children}
    </Label>
  );
}

export { StateLabel, stateLabelVariants };
