// shadcn의 badge를 이용

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/lib/utils/cn';

const labelVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-5 py-1 text-2xl font-medium w-fit whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:opacity-80',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#0065FF] text-white',
        secondary: 'border-transparent bg-[#ededed] text-black',
        destructive:
          'border-transparent bg-destructive text-white hover:bg-destructive/90',
        outline:
          'text-foreground border-input hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  }
);

function Label({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof labelVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="label"
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Label, labelVariants };
