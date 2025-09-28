import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as React from 'react';

import { cn } from '@/shared/lib/utils/cn';

import { Icon, ICONS } from './icon';

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  iconSize = 20,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  iconSize?: number;
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 cursor-pointer items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=closed]>.icon-closed]:block [&[data-state=closed]>.icon-open]:hidden [&[data-state=open]>.icon-closed]:hidden [&[data-state=open]>.icon-open]:block',
          className
        )}
        {...props}
      >
        {children}
        <span className="icon-closed pointer-events-none shrink-0 transition-transform duration-200">
          <Icon
            src={
              iconSize <= 20
                ? ICONS.down20
                : iconSize <= 24
                  ? ICONS.down24
                  : ICONS.down32
            }
            size={iconSize}
            alt="expand"
          />
        </span>
        <span className="icon-open pointer-events-none hidden shrink-0 transition-transform duration-200">
          <Icon
            src={
              iconSize <= 20
                ? ICONS.up20
                : iconSize <= 24
                  ? ICONS.up24
                  : ICONS.up32
            }
            size={iconSize}
            alt="collapse"
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
