import { Fragment, useEffect, useState } from 'react';

import { supabase } from '@/shared/lib/supa-client';

import { kanbanStyleMap, netteeRepo } from '../constants/kanban';
import { GroupedIssues, IssueData, KanbanProgress } from '../types/issues';
import { KanbanColumn } from './KanbanColumn';
import { KanbanModal } from './KanbanModal';

interface KanbanBoardProps {
  accordionMap: Record<string, boolean>;
  handleAccordionToggle: (key: string) => void;
}

export function KanbanBoard({
  accordionMap,
  handleAccordionToggle,
}: KanbanBoardProps) {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});
  const [pinnedIssues, setPinnedIssues] = useState<GroupedIssues>({});
  const [modalItem, setModalItem] = useState<Partial<IssueData> | null>(null);

  // *****************************************************************
  // constants에 등록된 이름으로 supabase를 전부 순회하여 테이블 가져오는 함수
  // *****************************************************************
  const fetchTableData = async (table: string): Promise<IssueData[]> => {
    if (table === '') return [];

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error(`Error in table: ${table}`);
      return [];
    }

    return data ?? [];
  };

  const promiseAllIssue = async (): Promise<IssueData[]> => {
    const promiseBuffer: Promise<IssueData[]>[] = [];

    for (const [projectName, teamObj] of Object.entries(netteeRepo)) {
      for (const [teamName, tableList] of Object.entries(teamObj)) {
        for (const tableName of tableList) {
          const promise = fetchTableData(tableName).then((rows) => {
            const tagged = rows.map((row) => ({
              ...row,
              project: projectName,
              team: teamName,
              repo: ['blolet', 'kanban', 'onboard'].some((prefix) =>
                tableName.startsWith(prefix)
              )
                ? ''
                : tableName,
            }));

            return tagged;
          });

          promiseBuffer.push(promise);
        }
      }
    }

    const resolve = await Promise.all(promiseBuffer);
    return resolve.flat();
  };

  const formatIssueByProgress = (data: IssueData[]): GroupedIssues => {
    const result: GroupedIssues = {};

    for (const [projectName, teamObj] of Object.entries(netteeRepo)) {
      result[projectName] = {};

      for (const [teamName] of Object.entries(teamObj)) {
        result[projectName][teamName] = {
          TODO: [],
          DOING: [],
          DONE: [],
        };
      }
    }

    for (const issue of data) {
      const projectName = issue.project;
      const teamName = issue.team;
      const progress = (issue.progress ?? 'TODO') as KanbanProgress;

      result[projectName][teamName][progress].push(issue);
    }

    return result;
  };

  // ********************************************************
  // 최초 로드할 때 모든 테이블 순회, 칸반 형태로 가공하여 state 등록
  // ********************************************************
  useEffect(() => {
    const loadSupabase = async () => {
      const getIssues = await promiseAllIssue();
      const grouped = formatIssueByProgress(getIssues);
      setGroupedIssues(grouped);
    };

    loadSupabase();
  }, []);
  // console.log(groupedIssues);

  // groupedIssues가 빈 객체가 아닌지 확인, 빈 상태면 로딩 서스펜스
  if (Object.keys(groupedIssues).length === 0) {
    return <div>Loading...</div>;
  }

  const getKanbanStyle = (progress: string) => {
    return (
      kanbanStyleMap[progress as keyof typeof kanbanStyleMap] ||
      kanbanStyleMap.DEFAULT
    );
  };

  // ************
  // DND 유틸 함수
  // ************
  const handleDragStart = (e: DragEvent, item: IssueData) => {
    e.dataTransfer.setData('cardId', String(item.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (
    e: DragEvent,
    project: string,
    team: string,
    progress: string
  ) => {
    const cardId = e.dataTransfer.getData('cardId');
    clearHighlights(progress);

    const indicators = getIndicators(progress);
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before;

    if (before !== cardId) {
      setGroupedIssues((prev) => {
        const updated = { ...prev };

        // 1. 전체 구조에서 cardToTransfer 탐색 및 제거
        let cardToTransfer: IssueData | undefined;

        const status: KanbanProgress[] = ['TODO', 'DOING', 'DONE'];
        for (const p of Object.keys(prev)) {
          for (const t of Object.keys(prev[p])) {
            for (const key of status) {
              const list = updated[p][t][key];
              const idx = list.findIndex((c) => String(c.id) === cardId);
              if (idx > -1) {
                // 카드 복사 및 제거
                cardToTransfer = { ...list[idx], progress };
                list.splice(idx, 1);
              }
            }
          }
        }

        if (!cardToTransfer) return prev; // fallback

        // 2. 타겟 column 배열 준비
        const copy = [...updated[project][team][progress as KanbanProgress]];

        const moveToBack = before === '-1';

        if (moveToBack) {
          copy.push(cardToTransfer);
        } else {
          const insertAtIndex = copy.findIndex(
            (el) => String(el.id) === before
          );
          if (insertAtIndex === -1) {
            console.warn('Insert target not found, skipping');
            return prev;
          }
          copy.splice(insertAtIndex, 0, cardToTransfer);
        }

        // 3. 타겟 column 갱신
        updated[project][team][progress as KanbanProgress] = copy;

        return updated;
      });
    }
  };

  const handleDragOver = (e: DragEvent, progress: string) => {
    e.preventDefault();
    highlightIndicator(e, progress);
  };

  const handleDragLeave = (progress: string) => {
    clearHighlights(progress);
  };

  // ************
  // DND 인디케이터 함수
  // ************
  const getIndicators = (progress: string) => {
    return Array.from(
      document.querySelectorAll<HTMLElement>(`[data-column="${progress}"]`)
    );
  };

  const highlightIndicator = (e: DragEvent, progress: string) => {
    const indicators = getIndicators(progress);
    clearHighlights(progress, indicators);

    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = '1';
  };

  const clearHighlights = (progress: string, els?: HTMLElement[]) => {
    const indicators = els || getIndicators(progress);

    indicators.forEach((i) => {
      i.style.opacity = '0';
    });
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  // ********
  // PIN 기능
  // ********
  const pinThisIssue = (
    e: MouseEvent<HTMLImageElement>,
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => {
    e.stopPropagation();

    setGroupedIssues((prev) => {
      const updated = { ...prev };
      const column = updated[project][team][progress as KanbanProgress];

      const index = column.findIndex((c) => c.id === cardId);
      if (index === -1) return prev;

      const issue = column[index];
      column.splice(index, 1); // 기존에서 제거

      setPinnedIssues((prev) => {
        const existing =
          prev[project]?.[team]?.[progress as KanbanProgress] ?? [];

        const updated = {
          ...(prev[project]?.[team] ?? {}),
          [progress]: [{ ...issue, pinned: true }, ...existing],
        };

        return {
          ...prev,
          [project]: {
            ...(prev[project] ?? {}),
            [team]: updated,
          },
        };
      });

      return updated;
    });
  };

  const getPinnedList = (
    pinned: GroupedIssues,
    project: string,
    team: string,
    progress: string
  ) => {
    return pinned?.[project]?.[team]?.[progress as KanbanProgress] ?? [];
  };

  const unpinThisIssue = (
    e: MouseEvent<HTMLImageElement>,
    project: string,
    team: string,
    progress: string,
    cardId: number
  ) => {
    e.stopPropagation();

    setPinnedIssues((prev) => {
      const targetList =
        prev[project]?.[team]?.[progress as KanbanProgress] ?? [];

      const found = targetList.find((c) => c.id === cardId);
      if (!found) return prev;

      const newList = targetList.filter((c) => c.id !== cardId);
      const { pinned, ...restoredIssue } = found;

      setGroupedIssues((prev) => {
        const updated = { ...prev };
        const list = updated[project][team][progress as KanbanProgress];

        const filtered = list.filter((c) => c.id !== cardId);

        updated[project][team][progress as KanbanProgress] = [
          restoredIssue,
          ...filtered,
        ];

        return updated;
      });

      return {
        ...prev,
        [project]: {
          ...prev[project],
          [team]: {
            ...prev[project][team],
            [progress]: newList,
          },
        },
      };
    });
  };

  return (
    <section className="flex h-full w-full flex-col gap-[16px] px-[40px] pt-[60px]">
      {Object.entries(groupedIssues).map(([project, teams]) => (
        <Fragment key={`${project}_kanban`}>
          {/* 프로젝트 라벨과 아코디언 버튼 */}
          <div className="flex items-center justify-between px-[16px] py-[8px] text-[32px] font-bold">
            <h2>{project}</h2>
            <button
              className="mx-[16px] my-[8px] flex h-[32px] w-[32px] items-center justify-center text-[24px]"
              onClick={() => handleAccordionToggle(`kanban-${project}`)}
            >
              {accordionMap[`kanban-${project}`] ? '▼' : '▲'}
            </button>
          </div>

          {/* (article) 팀 단위 개별 칸반 영역 */}
          <div
            className={`flex flex-col gap-[8px] overflow-hidden ${accordionMap[`kanban-${project}`] ? 'h-full' : 'h-0'}`}
          >
            {Object.entries(teams).map(([team, progressMap]) => (
              <article
                key={`${team}_kanban`}
                className="flex flex-col rounded-[8px] bg-[#f5f5f5] p-[16px] font-medium"
              >
                {/* 팀 라벨과 아코디언 버튼 */}
                <div className="flex justify-between">
                  <p className="text-[16px] font-semibold">{team}</p>
                  <button
                    type="button"
                    onClick={() => handleAccordionToggle(`${project}-${team}`)}
                  >
                    {accordionMap[`${project}-${team}`] ? '▼' : '▲'}
                  </button>
                </div>

                {/* 칸반이 배치될 영역 */}
                <div
                  className={`flex flex-wrap gap-[8px] overflow-hidden ${accordionMap[`${project}-${team}`] ? 'mt-[16px] h-full' : 'h-0'}`}
                >
                  {Object.entries(progressMap).map(([progress, issues]) => (
                    <KanbanColumn
                      key={`${project}-${team}-${progress}`}
                      project={project}
                      team={team}
                      progress={progress}
                      issues={issues}
                      pinnedIssuesList={getPinnedList(
                        pinnedIssues,
                        project,
                        team,
                        progress
                      )}
                      getKanbanStyle={getKanbanStyle}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                      handleDragOver={handleDragOver}
                      handleDragLeave={handleDragLeave}
                      setModalItem={setModalItem}
                      pinThisIssue={pinThisIssue}
                      unpinThisIssue={unpinThisIssue}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="my-[32px] w-full border-b border-[#dbdbdb]"></div>
        </Fragment>
      ))}

      {modalItem && (
        <KanbanModal
          item={modalItem}
          setModal={setModalItem}
          setIssues={setGroupedIssues}
        />
      )}
    </section>
  );
}

export default KanbanBoard;
