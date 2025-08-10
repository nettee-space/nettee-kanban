import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils/cn';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // 기본 스타일: 18px 크기, 3px 패딩, 둥근 모서리, 중앙 정렬
        'flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border p-[3px] transition-all duration-200 outline-none',
        // 포커스 스타일
        'focus-visible:ring-[3px] focus-visible:ring-blue-500/20',
        // 체크된 상태: 파란 배경, 파란 보더, 흰색 아이콘
        'data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white',
        // 체크되지 않은 상태: 회색 배경, 동일한 회색 보더, 회색 아이콘
        'data-[state=unchecked]:border-gray-200 data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:text-gray-400',
        // 비활성화 상태
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {/* 아이콘을 항상 표시 - 적당한 크기로 조정 */}
      <CheckIcon
        className="h-[12px] w-[16px] shrink-0"
        strokeWidth="3"
        color="white"
        style={{ aspectRatio: '11/8' }}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
