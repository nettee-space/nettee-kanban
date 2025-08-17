// components/Sidebar/LabelFilter.tsx
import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';

import {
  dummyLabels,
  fetchTaskPriorities,
  getStateKeyFromLabel,
} from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';
import { StateLabel } from '../StateLabel';

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
          <AccordionTrigger className="text-black-8 py-0 text-xl font-semibold hover:no-underline">
            <p>라벨 선택</p>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible pt-[10px] pb-0 text-2xl">
            <div>
              <div className="flex flex-wrap gap-[8px] p-[8px]">
                {labelObjects.map((label) => {
                  const isSelected = selectedLabels.includes(label.id);
                  const stateKey = getStateKeyFromLabel(label.name);
                  return (
                    <StateLabel
                      key={`${label.id}_label`}
                      state={stateKey}
                      onClick={() => toggleLabel(label.id)}
                      selected={isSelected}
                    >
                      {label.name}
                    </StateLabel>
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
