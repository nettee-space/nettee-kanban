// components/Sidebar/LabelFilter.tsx
import { dummyLabels } from '../../constants/kanban';
import { useFilterStore } from '../../store/filterStore';

export function LabelFilter() {
  const {
    selectedLabels,
    labelAccordionOpen,
    toggleLabel,
    toggleLabelAccordion,
  } = useFilterStore();

  const allLabelList = dummyLabels;

  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>라벨</p>
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
          {allLabelList.map((label, idx) => {
            const isSelected = selectedLabels.includes(label);
            return (
              <span
                key={`${idx + label}_label`}
                onClick={() => toggleLabel(label)}
                className={`text-xxl h-[24px] cursor-pointer rounded-full px-[12px] py-[2px] transition-colors ${
                  isSelected
                    ? 'bg-[#0065FF] text-white'
                    : 'bg-[#ededed] text-black'
                }`}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
