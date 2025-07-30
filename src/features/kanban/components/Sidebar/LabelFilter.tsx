// components/Sidebar/LabelFilter.tsx
const dummyLabels = [
  '보류',
  '낮음',
  '보통',
  '보통',
  '높음',
  '높음',
  '매우 높음',
];

interface LabelFilterProps {
  isOpen: boolean;
  onAccordionToggle: () => void;
}

export function LabelFilter({ isOpen, onAccordionToggle }: LabelFilterProps) {
  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>라벨</p>
        <button type="button" onClick={onAccordionToggle}>
          {isOpen ? '▼' : '▲'}
        </button>
      </div>

      <div
        className={`flex flex-col overflow-hidden pt-[10px] ${
          isOpen ? 'h-full' : 'h-0'
        }`}
      >
        <div className="flex flex-wrap gap-[8px] p-[8px]">
          {dummyLabels.map((label, idx) => (
            <span
              key={`${idx + label}_label`}
              className="h-[24px] rounded-full bg-[#ededed] px-[12px] py-[2px]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
