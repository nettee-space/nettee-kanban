import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Button } from '@/shared/components/ui/button';
import { Icon, ICONS } from '@/shared/components/ui/icon';

import { useFilterStore } from '../../store/filterStore';

// components/Sidebar/ViewOptions.tsx

export function ViewOptions() {
  const {
    showPinnedOnly,
    showGithubOnly,
    togglePinnedFilter,
    toggleGithubFilter,
  } = useFilterStore();

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <Accordion
        type="single"
        collapsible
        defaultValue="view-options"
        className="w-full"
      >
        <AccordionItem value="view-options" className="border-none">
          <AccordionTrigger className="text-black-8 py-0 text-sm font-semibold hover:no-underline">
            <p>보기</p>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-sm">
            <div>
              <div className="flex gap-[10px] p-[8px]">
                <Button
                  size={'icon'}
                  className="h-8 w-8 cursor-pointer p-2"
                  type="button"
                  variant={showPinnedOnly ? 'default' : 'secondary'}
                  onClick={togglePinnedFilter}
                >
                  <Icon src={ICONS.pin20} />
                </Button>
                <Button
                  size={'icon'}
                  className="h-8 w-8 cursor-pointer p-2"
                  type="button"
                  variant={showGithubOnly ? 'default' : 'secondary'}
                  onClick={toggleGithubFilter}
                >
                  <Icon src={ICONS.github20} />
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
