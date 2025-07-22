export const DropIndicator = ({
  beforeId,
  progress,
}: {
  beforeId: number | null;
  progress: string;
}) => {
  return (
    <div
      data-before={beforeId || '-1'}
      data-column={progress}
      className="my-[4px] h-[4px] w-full rounded-[2px] bg-violet-400 px-[4px] opacity-0"
    />
  );
};
