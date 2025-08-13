interface TeamHeaderProps {
  projectName: string;
  title: string;
  onClick: (key: string) => void;
  isOpened: boolean;
}

export function TeamHeader({
  isOpened,
  onClick,
  title,
  projectName,
}: TeamHeaderProps) {
  return (
    <div className="flex justify-between">
      {/* 팀 헤더 */}
      {/* <div className="flex justify-between">
                  <p className="text-[16px] font-semibold">{team}</p>
                  <button
                    type="button"
                    onClick={() => onAccordionToggle(`${project}-${team}`)}
                  >
                    {accordionMap[`${project}-${team}`] ? '▼' : '▲'}
                  </button>
                </div> */}
      <p className="text-[16px] font-semibold">{title}</p>
      <button type="button" onClick={() => onClick(`${projectName}-${title}`)}>
        {isOpened ? '▼' : '▲'}
      </button>
    </div>
  );
}
