// components/KanbanBoard/KanbanColumn.tsx
import { PlusIcon } from 'lucide-react';
import { DragEvent, Fragment, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useDragAndDrop } from '@/features/kanban/hooks/useDragAndDrop';
import { useIssueStore } from '@/store/issueStore';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { cn } from '@/shared/lib/utils/cn';

import { moveTaskToSubTask } from '@/supabase/api/kanbanTask';
import { kanbanStyleMap } from '../../../constants/kanban';
import { IssueData } from '../../../types/issues';
import { KanbanModal } from '../../Modal/KanbanModal';
import { DropIndicator } from './DropIndicator';
import { KanbanCard } from './KanbanCard';
interface KanbanColumnProps {
  project: string;
  team: string;
  progress: string;
  issues: IssueData[];
  addIssue?: (issueData: any) => void;
  // pinnedIssues: IssueData[];
  // onDragStart: (e: DragEvent, item: IssueData) => void;
  // onDragEnd: (
  //   e: DragEvent,
  //   project: string,
  //   team: string,
  //   progress: string
  // ) => void;
  // onDragOver: (e: DragEvent, progress: string) => void;
  // onDragLeave: (progress: string) => void;
  // onPin: (
  //   project: string,
  //   team: string,
  //   progress: string,
  //   cardId: number
  // ) => void;
  // onUnpin: (
  //   project: string,
  //   team: string,
  //   progress: string,
  //   cardId: number
  // ) => void;
}

export function KanbanColumn({
  project,
  team,
  progress,
  issues,
  addIssue,
  // pinnedIssues,
  // onPin,
  // onUnpin,
  // onOpenModal,
}: KanbanColumnProps) {
  const { handleDragStart, handleDragEnd, handleDragOver, handleDragLeave } =
    useDragAndDrop();
  const { updateKanbanTask } = useIssueStore();

  const handleDropOnCard = async (
    e: DragEvent<Element>,
    targetTaskId: number
  ) => {
    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      if (!dragDataStr) return;

      const dragData = JSON.parse(dragDataStr);
      const { cardId, sourceProject, sourceTeam } = dragData;

      // 동일 프로젝트/팀 내에서만 허용
      if (sourceProject !== project || sourceTeam !== team) {
        console.warn(
          '다른 프로젝트/팀 태스크는 서브태스크로 만들 수 없습니다.'
        );
        return;
      }

      // 자기 자신에게 드롭하는 경우 방지
      if (Number(cardId) === targetTaskId) {
        console.warn('자기 자신의 서브태스크로 만들 수 없습니다.');
        return;
      }

      console.log(
        `태스크 ${cardId}를 태스크 ${targetTaskId}의 서브태스크로 만들기 시도`
      );

      // API 호출하여 parent_task_id 업데이트
      console.log('subtask', cardId, targetTaskId);
      await moveTaskToSubTask(Number(cardId), targetTaskId);

      console.log('서브태스크 생성 완료');

      // 원본 KanbanTask 데이터 업데이트 (UI 데이터는 자동 동기화됨)
      updateKanbanTask(Number(cardId), { parent_task_id: targetTaskId });
      
      console.log('프론트엔드 상태 업데이트 완료');
    } catch (error) {
      console.error('서브태스크 생성 중 오류:', error);
    }
  };
  const [modalItem, setModalItem] = useState<Partial<IssueData> | null>(null);

  // 메인 태스크만 필터링 후 updated_at 기준으로 내림차순 정렬
  const sortedIssues = useMemo(() => {
    return [...issues]
      .filter((issue) => !issue.parent || issue.parent === '') // parent_task_id가 없는 메인 태스크만
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  }, [issues]);
  const getKanbanStyle = (progress: string) => {
    return (
      kanbanStyleMap[progress as keyof typeof kanbanStyleMap] ||
      kanbanStyleMap.DEFAULT
    );
  };
  const style = getKanbanStyle(progress);
  // const totalCount = issues.length + pinnedIssues.length;
  const totalCount = sortedIssues.length;

  const handleAddNew = () => {
    setModalItem({
      number: 0,
      project,
      team,
      progress,
    });
  };
  return (
    <div
      className={`flex max-h-[860px] flex-1 flex-col gap-[12px] overflow-auto ${style.bg} p-[12px] pb-[32px]`}
    >
      {/* 컬럼 헤더 */}
      <div className="flex items-center justify-between px-[8px]">
        <div className="flex gap-[8px] font-semibold">
          <p className="text-sm leading-[140%]">{progress}</p>
          <p className={cn('text-sm', style.text)}>{totalCount}</p>
        </div>
        <div className="flex gap-[8px]">
          {progress === 'DONE' && (
            <div className="flex h-[32px] w-[86px] items-center justify-center rounded-[8px] bg-white">
              전체보기
            </div>
          )}
          <div
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[4px] bg-white text-[20px]"
            onClick={handleAddNew}
          >
            <PlusIcon size={20} />
          </div>
        </div>
      </div>
      {/* // TODO 고정된 카드들 */}
      <div>
        {/* {pinnedIssues.map((item) => (
          <Fragment key={item.id}>
            <DropIndicator beforeId={item.id} progress={item.progress} />
            <KanbanCard
              item={item}
              isPinned={true}
              onDragStart={onDragStart}
              onPin={(_) => onUnpin(project, team, progress, item.id)}
              onOpenModal={() => onOpenModal(item)}
            />
          </Fragment>
        ))} */}
      </div>
      {/* 구분선 */}
      {/* <Divider /> */}
      {/* 일반 카드들 */}
      <ul
        className="flex flex-1 flex-col"
        onDrop={(e) => handleDragEnd(e, project, team, progress)}
        onDragOver={(e) => handleDragOver(e, progress)}
        onDragLeave={() => handleDragLeave(progress)}
      >
        {sortedIssues.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            <Icon
              src={ICONS.errorGray24}
              className=""
              size={16}
              alt="selected"
            />
            <span>일정이 없습니다.</span>
          </div>
        ) : (
          // 이슈가 있을 때 기존 로직 - updated_at 기준 정렬
          sortedIssues.map((item, index) => (
            <Fragment key={item.id}>
              <DropIndicator
                beforeId={item.number.toString()}
                progress={progress}
              />
              <KanbanCard
                item={{
                  ...item,
                  cardIndex: String(index),
                }}
                columnId={progress}
                project={project}
                team={team}
                isPinned={false}
                onDragStart={handleDragStart}
                // onPin={(_) => onPin(project, team, progress, item.id)}
                onOpenModal={(e) => {
                  e.stopPropagation();
                  setModalItem(item);
                }}
                onDropOnCard={handleDropOnCard}
              />
            </Fragment>
          ))
        )}
        <DropIndicator beforeId={null} progress={progress} />
      </ul>
      {/* Modal을 컬럼 외부에서 한 번만 렌더링 */}
      {modalItem &&
        createPortal(
          <KanbanModal
            item={modalItem}
            setModal={setModalItem}
            addIssue={addIssue}
            // setIssues={setGroupedIssues}
          />,
          document.body
        )}
    </div>
  );
}
