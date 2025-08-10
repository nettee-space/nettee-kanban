// components/Sidebar/LabelFilter.tsx
import { useEffect, useState } from 'react';

import { Label } from '@/shared/components/ui/label';

import { dummyLabels, fetchTaskPriorities } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function LabelFilter() {
  const {
    selectedLabels,
    labelAccordionOpen,
    toggleLabel,
    toggleLabelAccordion,
  } = useFilterStore();

  const [list, setList] = useState<[string, string][]>(dummyLabels); // 초기값

  useEffect(() => {
    const load = async () => {
      const updatedList = await fetchTaskPriorities();
      setList([...updatedList]); // 로컬 상태도 업데이트
    };
    load();
  }, []);

  const labelObjects = list.map(([id, name]) => ({ id, name }));

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>작업중요도</p>
        <button type="button" onClick={toggleLabelAccordion}>
          {labelAccordionOpen ? '▼' : '▲'}
        </button>
      </div>

      <div
        className={`flex flex-col overflow-hidden pt-[10px] ${
          labelAccordionOpen ? 'h-full' : 'h-0'
        }`}
      >
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
    </div>
  );
}
