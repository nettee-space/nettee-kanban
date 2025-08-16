import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';

// components/Sidebar/ViewOptions.tsx

export function ViewOptions() {
  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <Accordion
        type="single"
        collapsible
        defaultValue="view-options"
        className="w-full"
      >
        <AccordionItem value="view-options" className="border-none">
          <AccordionTrigger className="text-black-8 py-0 text-xl font-semibold hover:no-underline">
            <p>보기</p>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-2xl">
            <div>
              <div className="flex gap-[10px] p-[8px]">
                <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-[#ededed] p-[6px] font-bold text-[#0065FF]">
                  P
                </span>
                <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-[#ededed] p-[6px] font-bold text-[#0065FF]">
                  G
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
