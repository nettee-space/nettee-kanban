// components/Sidebar/LabelFilter.tsx
import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Label } from '@/shared/components/ui/label';

import { dummyLabels, fetchTaskPriorities } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function LabelFilter() {
  const { selectedLabels, toggleLabel } = useFilterStore();

  const [list, setList] = useState<string[]>(dummyLabels); // 초기값

  useEffect(() => {
    const load = async () => {
      const updatedList = await fetchTaskPriorities();
      setList([...updatedList]); // 로컬 상태도 업데이트
    };
    load();
  }, []);

  const labelObjects = list.map((name) => ({ id: name, name }));

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <Accordion
        type="single"
        collapsible
        defaultValue="label"
        className="w-full"
      >
        <AccordionItem value="label" className="border-none">
          <AccordionTrigger className="py-0 text-3xl hover:no-underline">
            <p>라벨 선택</p>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-2xl">
            <div>
              <div className="flex flex-wrap gap-[8px] p-[8px]">
                {labelObjects.map((label) => {
                  const isSelected = selectedLabels.includes(label.id);
                  return (
                    <Label
                      key={`${label.id}_label`}
                      onClick={() => {
                        console.log(
                          'toggleLabel 호출값 ID:',
                          label.id,
                          'Name:',
                          label.name
                        );
                        toggleLabel(label.id);
                      }}
                      variant={isSelected ? 'default' : 'secondary'}
                    >
                      {label.name}
                    </Label>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
