// components/Sidebar/ViewOptions.tsx
interface ViewOptionsProps {
  isOpen: boolean;
  onAccordionToggle: () => void;
}

export function ViewOptions({ isOpen, onAccordionToggle }: ViewOptionsProps) {
  return (
    <div className="border-t border-[#dbdbdb] py-[20px]">
      <div className="flex items-center justify-between">
        <p>보기</p>
        <button type="button" onClick={onAccordionToggle}>
          {isOpen ? '▼' : '▲'}
        </button>
      </div>

      <div
        className={`flex flex-col overflow-hidden pt-[10px] ${
          isOpen ? 'h-full' : 'h-0'
        }`}
      >
        <div className="flex gap-[10px] p-[8px]">
          <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-[#ededed] p-[6px] font-bold text-[#0065FF]">
            P
          </span>
          <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-[#ededed] p-[6px] font-bold text-[#0065FF]">
            G
          </span>
        </div>
      </div>
    </div>
  );
}
