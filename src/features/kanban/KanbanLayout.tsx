import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { CircleCheckIcon, PlusIcon } from 'lucide-react';
import { DragEvent, Fragment, MouseEvent, useEffect, useState } from 'react';

import Github from '@/assets/github.svg';
import pinActive from '@/assets/pinActive.svg';
import pinDisable from '@/assets/pinDisable.svg';
import { supabase } from '@/shared/lib/supa-client';

import { DropIndicator } from './components/DropIndicator';
import { KanbanModal } from './components/KanbanModal';
import {
  E_Team,
  kanbanStyleMap,
  netteeMembers,
  netteeRepo,
} from './constants/kanban';
import { GroupedIssues, IssueData, KanbanProgress } from './types/issues';

// 사이드바와 프로젝트 리스팅
const sidebarList = ['project', 'team', 'assignee', 'label', 'more'];
const projectList = ['전체', 'Blolet', 'Kanban', 'onBoard'];
const dummyLabels = [
  '보류',
  '낮음',
  '보통',
  '보통',
  '높음',
  '높음',
  '매우 높음',
];

// 아코디언 상태 초기화 (사이드바, 프로젝트 단위까지만 오픈)
const initialAccordionMap = (): Record<string, boolean> => {
  const initSidebar = Object.fromEntries(
    sidebarList.map((item) => [`sidebar-${item}`, true])
  );

  const initKanban = Object.fromEntries(
    projectList
      .filter((item) => item !== '전체')
      .map((item) => [`kanban-${item}`, true])
  );

  return {
    ...initSidebar,
    ...initKanban,
  };
};

export function KanbanLayout() {
  // 사이드바 필터 선택
  const [selectedProject, setSelectedProject] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);

  // 아코디언 토글 전역 관리
  const [accordionMap, setAccordionMap] = useState(initialAccordionMap);

  // 전체 데이터와 상세 모달 조회용
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});
  const [pinnedIssues, setPinnedIssues] = useState<GroupedIssues>({});
  const [modalItem, setModalItem] = useState<Partial<IssueData> | null>(null);

  // 팀과 멤버 리스팅
  const teamList = Object.values(E_Team);
  const memberList = Object.values(netteeMembers).flat();
  const teamMembers = selectedTeam.includes('전체')
    ? memberList
    : selectedTeam.flatMap(
        (team) => netteeMembers[team as keyof typeof netteeMembers]
      );

  // ************************************************************
  // 슈퍼베이스 실시간 통신용 채널 오픈 + 페이로드 가공하여 신규상태로 갱신
  // ************************************************************
  const openChannel = () => {
    const channel = supabase
      .channel('realtime-kanban')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: RealtimePostgresChangesPayload<IssueData>) => {
          console.log('Realtime Change:', payload);

          const issue = payload.new as IssueData;
          const table = payload.table as string;

          setGroupedIssues((prev) => {
            const updated: GroupedIssues = { ...prev };

            for (const [project, teams] of Object.entries(netteeRepo)) {
              for (const [team, repos] of Object.entries(teams)) {
                if (repos.includes(table)) {
                  const progress = (issue.progress ?? 'TODO') as KanbanProgress;
                  const status: KanbanProgress[] = ['TODO', 'DOING', 'DONE'];

                  for (const key of status) {
                    updated[project][team][key] = updated[project][team][
                      key
                    ].filter((i) => i.number !== issue.number);
                  }

                  updated[project][team][progress].unshift(issue);
                  return updated;
                }
              }
            }

            return prev; // fallback
          });
        }
      );

    const trySubscribe = () => {
      try {
        channel.subscribe();
      } catch (error) {
        console.error('realtime connection failed');
        alert('슈퍼베이스 리얼타임 미작동 중!!');
      }
    };

    trySubscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  useEffect(() => {
    const cleanup = openChannel();
    return cleanup;
  }, []);

  // ******************************************************
  // 사이드바 토글 상태와, 페이지 전체 아코디언 상태를 동적으로 관리
  // ******************************************************
  const handleProjectToggle = (proj: string) => {
    if (proj === '전체') return setSelectedProject(['전체']);

    setSelectedProject((prev) => {
      const activeProject = prev.includes(proj)
        ? prev.filter((p) => p !== proj) // 중복된 선택 배열에서 튕기기
        : [...prev.filter((p) => p !== '전체'), proj]; // '전체' 없애고 배열 추가

      // 선택 항목이 하나도 없다면 기본값으로 '전체' 선택 유지
      return activeProject.length === 0 ? ['전체'] : activeProject;
    });
  };

  const handleTeamToggle = (team: string) => {
    if (team === '전체') return setSelectedTeam(['전체']);

    setSelectedTeam((prev) => {
      const activeTeam = prev.includes(team)
        ? prev.filter((p) => p !== team) // 중복된 선택 배열에서 튕기기
        : [...prev.filter((p) => p !== '전체'), team]; // '전체' 없애고 배열 추가

      // 선택 항목이 하나도 없다면 기본값으로 '전체' 선택 유지
      return activeTeam.length === 0 ? ['전체'] : activeTeam;
    });
  };

  const handleAccordionToggle = (key: string) => {
    setAccordionMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
    <main className="flex h-full w-full">
      {/* (aside) 사이드 바 섹션 */}
      <aside className="flex w-[240px] flex-col bg-[#f8f8f8] p-[20px]">
        {/* 로고와 검색창 */}
        <div className="flex flex-col gap-[40px]">
          <h1 className="text-center text-[24px] font-bold">Nettee's KanBan</h1>
          <input
            className="rounded-[4px] border border-[#dbdbdb] bg-white px-[12px] py-[6px]"
            type="search"
            placeholder="검색"
          />
        </div>

        {/* 필터 라벨과 초기화 버튼 */}
        <div className="flex items-center justify-between pt-[20px] pb-[10px]">
          <p className="py-[6px]">필터</p>
          <button
            type="reset"
            className="duration-200 hover:text-[#ff5555]"
            onClick={() => {
              setSelectedProject([]);
              setSelectedTeam([]);
              setAccordionMap(initialAccordionMap);
            }}
          >
            초기화
          </button>
        </div>

        {/* 프로젝트 선택 섹션 */}
        <div className="border-t border-[#dbdbdb] py-[20px]">
          <div className="flex items-center justify-between">
            <p>프로젝트 선택</p>
            <button
              type="button"
              onClick={() => handleAccordionToggle('sidebar-project')}
            >
              {accordionMap['sidebar-project'] ? '▼' : '▲'}
            </button>
          </div>

          <ul
            className={`overflow-hidden pt-[10px] ${accordionMap['sidebar-project'] ? 'h-full' : 'h-0'}`}
          >
            {projectList.map((proj) => (
              <li key={`${proj}_project`} className="px-[8px] py-[6px]">
                <label className="flex items-center gap-[8px]">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] rounded-[4px]"
                    checked={selectedProject.includes(proj)}
                    onChange={() => handleProjectToggle(proj)}
                  />
                  {proj}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* 팀 선택 섹션 */}
        <div className="border-t border-[#dbdbdb] py-[20px]">
          <div className="flex items-center justify-between">
            <p>팀 선택</p>
            <button
              type="button"
              onClick={() => handleAccordionToggle('sidebar-team')}
            >
              {accordionMap['sidebar-team'] ? '▼' : '▲'}
            </button>
          </div>

          <ul
            className={`overflow-hidden pt-[10px] ${accordionMap['sidebar-team'] ? 'h-full' : 'h-0'}`}
          >
            {teamList.map((team) => (
              <li key={`${team}_team`} className="px-[8px] py-[6px]">
                <label className="flex items-center gap-[8px]">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] rounded-[4px]"
                    checked={selectedTeam.includes(team)}
                    onChange={() => handleTeamToggle(team)}
                  />
                  {team}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* 팀원, 담당자 선택 섹션 */}
        <div className="border-t border-[#dbdbdb] py-[20px]">
          <div className="flex items-center justify-between">
            <p>담당자</p>
            <button
              type="button"
              onClick={() => handleAccordionToggle('sidebar-assignee')}
            >
              {accordionMap['sidebar-assignee'] ? '▼' : '▲'}
            </button>
          </div>

          <div
            className={`flex flex-col overflow-hidden pt-[10px] ${accordionMap['sidebar-assignee'] ? 'h-full' : 'h-0'}`}
          >
            <div className="flex flex-wrap gap-[8px] pt-[8px] pb-[16px]">
              {teamList.map((team) => (
                <button
                  key={`${team}_button`}
                  type="button"
                  className={`flex h-[28px] w-[60px] items-center justify-center rounded-[4px] ${selectedTeam.includes(team) ? 'bg-[#0065FF] text-white' : 'bg-[#ededed]'}`}
                  onClick={() => handleTeamToggle(team)}
                >
                  {team}
                </button>
              ))}
            </div>

            <ul className="h-[306px] w-full overflow-y-scroll">
              {teamMembers.map((member, idx) => (
                <li
                  key={`${idx + member}_assignee`}
                  className="px-[8px] py-[6px]"
                >
                  <label className="flex items-center gap-[8px]">
                    <input
                      type="checkbox"
                      className="h-[18px] w-[18px] rounded-[4px]"
                    />

                    <div className="h-[20px] w-[20px] rounded-full bg-[#dbdbdb]"></div>
                    {member}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 라벨 선택 섹션 */}
        <div className="border-t border-[#dbdbdb] py-[20px]">
          <div className="flex items-center justify-between">
            <p>라벨</p>
            <button
              type="button"
              onClick={() => handleAccordionToggle('sidebar-label')}
            >
              {accordionMap['sidebar-label'] ? '▼' : '▲'}
            </button>
          </div>

          <div
            className={`flex flex-col overflow-hidden pt-[10px] ${accordionMap['sidebar-label'] ? 'h-full' : 'h-0'}`}
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

        {/* 링크 섹션 */}
        <div className="border-t border-[#dbdbdb] py-[20px]">
          <div className="flex items-center justify-between">
            <p>보기</p>
            <button
              type="button"
              onClick={() => handleAccordionToggle('sidebar-more')}
            >
              {accordionMap['sidebar-more'] ? '▼' : '▲'}
            </button>
          </div>

          <div
            className={`flex flex-col overflow-hidden pt-[10px] ${accordionMap['sidebar-more'] ? 'h-full' : 'h-0'}`}
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
      </aside>

      {/* (section) 프로젝트 단위 전체 칸반 영역 */}
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
                      onClick={() =>
                        handleAccordionToggle(`${project}-${team}`)
                      }
                    >
                      {accordionMap[`${project}-${team}`] ? '▼' : '▲'}
                    </button>
                  </div>

                  {/* 칸반이 배치될 영역 */}
                  <div
                    className={`flex flex-wrap gap-[8px] overflow-hidden ${accordionMap[`${project}-${team}`] ? 'mt-[16px] h-full' : 'h-0'}`}
                  >
                    {Object.entries(progressMap).map(([progress, issues]) => (
                      <div
                        key={`${project}-${team}-${progress}`}
                        className={`flex max-h-[860px] flex-1 flex-col gap-[12px] overflow-auto ${getKanbanStyle(progress).bg} p-[12px] pb-[32px]`}
                      >
                        <div className="flex items-center justify-between px-[8px]">
                          <div className="flex gap-[8px]">
                            <p>{progress}</p>

                            <p className={getKanbanStyle(progress).text}>
                              {issues.length +
                                getPinnedList(
                                  pinnedIssues,
                                  project,
                                  team,
                                  progress
                                ).length}
                            </p>
                          </div>

                          <div className="flex gap-[8px]">
                            {progress === 'DONE' && (
                              <div className="flex h-[32px] w-[86px] items-center justify-center rounded-[8px] bg-white">
                                전체보기
                              </div>
                            )}
                            <div
                              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-white text-[20px]"
                              onClick={() =>
                                setModalItem({
                                  number: 0,
                                  project,
                                  team,
                                  progress,
                                })
                              }
                            >
                              <PlusIcon size={20} />
                            </div>
                          </div>
                        </div>

                        <div>
                          {getPinnedList(
                            pinnedIssues,
                            project,
                            team,
                            progress
                          ).map((item) => (
                            <Fragment key={item.id}>
                              <DropIndicator
                                beforeId={item.id}
                                progress={item.progress}
                              />
                              <li
                                className="flex min-h-[100px] w-full flex-col rounded-[8px] bg-white"
                                onClick={() => setModalItem(item)}
                              >
                                <div
                                  draggable="true"
                                  onDragStart={(e) => {
                                    handleDragStart(e, item);
                                  }}
                                  className="cursor-grab px-[14px] py-[16px] active:cursor-grabbing active:bg-[#f5f5f5]"
                                >
                                  <div className="flex items-center gap-[4px]">
                                    <CircleCheckIcon
                                      fill="#C3C3C3"
                                      color="#fff"
                                      className="mt-[2px] h-[24px] w-[24px] flex-none"
                                    />
                                    <p className="w-[200px] truncate text-[14px] font-semibold tracking-tight">
                                      {item.title}
                                    </p>
                                  </div>

                                  <div className="flex justify-between">
                                    <p className="px-[4px] text-[12px] text-[#646464]">
                                      {item.html_url}
                                    </p>

                                    <div className="flex flex-none items-end gap-[10px]">
                                      {item.repo && (
                                        <img
                                          src={Github}
                                          className="h-[24px] w-[24px]"
                                        />
                                      )}

                                      <img
                                        src={pinActive}
                                        className="h-[24px] w-[24px]"
                                        onClick={(e) =>
                                          unpinThisIssue(
                                            e,
                                            project,
                                            team,
                                            progress,
                                            item.id
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </li>
                            </Fragment>
                          ))}
                        </div>

                        <div
                          className={`${getKanbanStyle(progress).line} h-[1px] w-full shrink-0`}
                        ></div>

                        <ul
                          className="flex flex-1 flex-col"
                          onDrop={(e) =>
                            handleDragEnd(e, project, team, progress)
                          }
                          onDragOver={(e) => handleDragOver(e, progress)}
                          onDragLeave={() => handleDragLeave(progress)}
                        >
                          {issues.map((item) => (
                            <Fragment key={item.id}>
                              <DropIndicator
                                beforeId={item.id}
                                progress={item.progress}
                              />
                              <li
                                className="flex min-h-[100px] w-full flex-col rounded-[8px] bg-white"
                                onClick={() => setModalItem(item)}
                              >
                                <div
                                  draggable="true"
                                  onDragStart={(e) => {
                                    handleDragStart(e, item);
                                  }}
                                  className="cursor-grab px-[14px] py-[16px] active:cursor-grabbing active:bg-[#f5f5f5]"
                                >
                                  <div className="flex items-center gap-[4px]">
                                    <CircleCheckIcon
                                      fill="#C3C3C3"
                                      color="#fff"
                                      className="mt-[2px] h-[24px] w-[24px] flex-none"
                                    />
                                    <p className="w-[200px] truncate text-[14px] font-semibold tracking-tight">
                                      {item.title}
                                    </p>
                                  </div>

                                  <div className="flex justify-between">
                                    <p className="px-[4px] text-[12px] text-[#646464]">
                                      {item.html_url}
                                    </p>

                                    <div className="flex flex-none items-end gap-[10px]">
                                      {item.repo && (
                                        <img
                                          src={Github}
                                          className="h-[24px] w-[24px]"
                                        />
                                      )}

                                      <img
                                        src={pinDisable}
                                        className="h-[24px] w-[24px]"
                                        onClick={(e) =>
                                          pinThisIssue(
                                            e,
                                            project,
                                            team,
                                            progress,
                                            item.id
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </li>
                            </Fragment>
                          ))}
                          <DropIndicator beforeId={null} progress={progress} />
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {modalItem && (
              <KanbanModal
                item={modalItem}
                setModal={setModalItem}
                setIssues={setGroupedIssues}
              />
            )}

            <div className="my-[32px] w-full border-b border-[#dbdbdb]"></div>
          </Fragment>
        ))}
      </section>
    </main>
  );
}
