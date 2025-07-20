import { useState } from 'react';

import {
  dummyLabels,
  E_Team,
  netteeMembers,
  projectList,
  sidebarList,
} from '../constants/kanban';
import { GroupedIssues, IssueData } from '../types/issues';

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

export function Sidebar() {
  //   // 사이드바 필터 선택
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
  const teamMembers = selectedTeam.includes('All')
    ? memberList
    : selectedTeam.flatMap(
        (team) => netteeMembers[team as keyof typeof netteeMembers]
      );
  // ******************************************************
  // 사이드바 토글 상태와, 페이지 전체 아코디언 상태를 동적으로 관리
  // ******************************************************
  const handleProjectToggle = (proj: string) => {
    if (proj === 'All') return setSelectedProject(['All']);

    setSelectedProject((prev) => {
      const activeProject = prev.includes(proj)
        ? prev.filter((p) => p !== proj) // 중복된 선택 배열에서 튕기기
        : [...prev.filter((p) => p !== 'All'), proj]; // '전체' 없애고 배열 추가

      // 선택 항목이 하나도 없다면 기본값으로 '전체' 선택 유지
      return activeProject.length === 0 ? ['All'] : activeProject;
    });
  };

  const handleTeamToggle = (team: string) => {
    if (team === 'All') return setSelectedTeam(['All']);

    setSelectedTeam((prev) => {
      const activeTeam = prev.includes(team)
        ? prev.filter((p) => p !== team) // 중복된 선택 배열에서 튕기기
        : [...prev.filter((p) => p !== 'All'), team]; // '전체' 없애고 배열 추가

      // 선택 항목이 하나도 없다면 기본값으로 '전체' 선택 유지
      return activeTeam.length === 0 ? ['All'] : activeTeam;
    });
  };

  const handleAccordionToggle = (key: string) => {
    setAccordionMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
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
  );
}

export default Sidebar;
