import { Icon, ICONS } from '@/shared/components/ui/icon';
import { CalendarIcon, XIcon } from 'lucide-react';
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { type DateRange } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';

import Github from '@/assets/github.svg';
import PinX from '@/assets/pinDisable.svg';
import { Editor } from '@/shared/components/Editor';
import { Calendar } from '@/shared/components/ui/calendar';
import { octokit } from '@/shared/lib/git-octokit';

import { getGithubRepos } from '@/supabase/api/githubRepo';
import { GithubRepo } from '@/supabase/types/github/repo';
import { useIssueStore, mapProjectIdToName, mapTeamIdToName } from '@/store/issueStore';
import { useUserStore } from '@/store/userStore';
import { useFilterStore } from '../../store/filterStore';
import { getStateKeyFromLabel, stateLabelMap } from '../../constants/kanban';
import { netteeRepo } from '../../constants/nettee';
import { IssueData, UpsertIssuePayload } from '../../types/issues';
import { StateLabel, StateType } from '../StateLabel';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface ModalProps {
  item: Partial<IssueData>;
  setModal: SetState<Partial<IssueData> | null>;
  addIssue?: (issueData: any) => void;
}

// TODO, DOING, DONE을 제외한 kanban 전용 라벨들
const kanbanLabel = {
  hold: stateLabelMap.hold,
  low: stateLabelMap.low,
  medium: stateLabelMap.medium,
  high: stateLabelMap.high,
  veryhigh: stateLabelMap.veryhigh,
} as const;

type KanbanLabelType = keyof typeof kanbanLabel;

export function KanbanModal({ item, setModal, addIssue }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const { createIssueToSupabase } = useIssueStore();
  const { users, loadUsers } = useUserStore();
  const { teamList, projectList } = useFilterStore();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formToggle, setFormToggle] = useState<Record<string, boolean>>({});

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: item.sta_dt ? new Date(item.sta_dt) : undefined,
    to: item.end_dt ? new Date(item.end_dt) : undefined,
  });

  const [markdown, setMarkdown] = useState<string>('');
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [isGithubEnabled, setIsGithubEnabled] = useState(false);

  // 담당자 선택 상태 (login 값으로 저장)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    item.assignees || []
  );

  // 라벨 선택 상태 (kanban 전용 라벨만)
  const [selectedLabels, setSelectedLabels] = useState<KanbanLabelType[]>(() => {
    const labels: KanbanLabelType[] = [];
    
    // item.labels에서 kanban 우선순위 라벨들 추출 (이제 task_priority가 labels에 포함됨)
    if (item.labels) {
      item.labels.forEach((label) => {
        // label이 이미 state key인지 확인
        if (label in kanbanLabel) {
          labels.push(label as KanbanLabelType);
        } else {
          // 라벨 텍스트인 경우 state key로 변환
          const stateKey = getStateKeyFromLabel(label);
          if (stateKey in kanbanLabel) {
            labels.push(stateKey as KanbanLabelType);
          }
        }
      });
    }
    
    console.log('🏷️ 초기 선택된 라벨들:', {
      itemLabels: item.labels,
      itemTaskPriority: item.task_priority,
      selectedLabels: labels
    });
    
    return labels;
  });

  useEffect(() => {
    if (dateRange && dateRange.from !== dateRange.to) {
      setFormData((prev) => ({
        ...prev,
        sta_dt: String(dateRange.from),
        end_dt: String(dateRange.to),
      }));

      setFormToggle((prev) => ({
        ...prev,
        calendar: false,
      }));
    }

    if (markdown) {
      setFormData((prev) => ({
        ...prev,
        body: markdown,
      }));
    }
  }, [dateRange?.to, markdown]);

  // 사용자 데이터 로드
  useEffect(() => {
    if (users.length === 0) {
      loadUsers();
    }
  }, [users.length, loadUsers]);

  const getRepo = (item: {
    repo?: string;
    project?: string;
    team?: string;
  }) => {
    type ProjectName = keyof typeof netteeRepo;
    type TeamName = keyof (typeof netteeRepo)[ProjectName];

    if (item.repo) return item.repo;
    if (item.project && item.team) {
      return netteeRepo[item.project as ProjectName][item.team as TeamName][0];
    }
    return undefined;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 이미 처리 중인 경우 중복 제출 방지
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const getForm = new FormData(e.currentTarget);
      const isNew = !item.number || item.number === 0;

      const title = getForm.get('title') as string;
      const body = formData.body || markdown || item.body || '';
      const progress = formData.progress || item.progress || 'TODO';
      // 동적 기본값 설정: 첫 번째 사용 가능한 프로젝트와 팀 사용
      const defaultProject = projectList.find(([id]) => id !== 'All')?.[1] || 'Default';
      const defaultTeam = teamList.find(([id]) => id !== 'All')?.[1] || 'Default';
      
      const project = item.project || defaultProject;
      const team = item.team || defaultTeam;

      if (!title.trim()) {
        alert('제목을 입력해주세요.');
        return;
      }

      if (isGithubEnabled && !selectedRepo) {
        alert('GitHub 연동이 활성화된 경우 저장소를 선택해주세요.');
        return;
      }

      if (isNew && addIssue) {
        // 새 이슈 데이터 준비
        const newIssueData = {
          title: title.trim(),
          body: body,
          progress: progress,
          project: project,
          team: team,
          sta_dt:
            formData.sta_dt ||
            (dateRange?.from ? dateRange.from.toISOString() : new Date().toISOString()),
          end_dt:
            formData.end_dt ||
            (dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString()),
          assignees: selectedAssignees,
          labels: selectedLabels.map((labelKey) => kanbanLabel[labelKey]),
          repo: isGithubEnabled && selectedRepo ? selectedRepo : getRepo(item) || '',
          task_priority: selectedLabels.find(label => ['hold', 'low', 'medium', 'high', 'veryhigh'].includes(label)) || 'medium',
          // createIssueToSupabase에 필요한 추가 필드들
          html_url: `#issue-${Date.now()}`,
          state: 'open',
          parent: '',
        };

        // 로컬 저장 (기존 방식)
        addIssue(newIssueData);

        // Supabase에도 저장
        try {
          console.log('=== Supabase 저장 시작 ===');
          console.log('원본 이슈 데이터:', newIssueData);
          
          const supabaseIssue = await createIssueToSupabase(newIssueData);
          
          if (supabaseIssue) {
            console.log('✅ Supabase 저장 성공:', supabaseIssue);
            alert('이슈가 성공적으로 Supabase에 저장되었습니다!');
          } else {
            console.warn('⚠️ Supabase 저장 실패: null 반환');
            alert('Supabase 저장에 실패했습니다. 로컬에만 저장됩니다.');
          }
        } catch (error) {
          console.error('❌ Supabase 저장 중 오류:', error);
          alert(`Supabase 저장 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
          // Supabase 저장 실패해도 로컬 저장은 유지
        }

        // 폼 초기화
        setFormData({});
        setMarkdown('');
        setDateRange(undefined);
        setFormToggle({});
        setIsGithubEnabled(false);
        setSelectedRepo('');
        setGithubRepos([]);
        setSelectedAssignees([]);
        setSelectedLabels([]);
        setModal(null);
      } else {
        // 기존 방식 (수정)
        const payload = {
          owner: 'nettee-space',
          repo: getRepo(item),
          issue_number: item.number,
          source: 'client',
          action: 'update',
          issue: {
            title: title,
            body: body,
            assignees: selectedAssignees,
            labels: [],
            progress: progress,
            sta_dt: formData.sta_dt ?? item.sta_dt,
            end_dt: formData.end_dt ?? item.end_dt,
          },
        };

        upsertTable(payload);
      }
    } catch (error) {
      console.error('이슈 저장 중 오류:', error);
      alert('이슈 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const upsertTable = async (payload: UpsertIssuePayload) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nettee-function`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-github-event': 'issues',
          },
          body: JSON.stringify(payload),
        }
      );

      const issue = await response.json();
      console.log(issue);

      // TODO: zustand로 관리되는 로컬값 수정
      // setIssues((prev) => {
      //   const updated: GroupedIssues = { ...prev };

      //   const project = item.project;
      //   const team = item.team;
      //   const progress = (item.progress ?? 'TODO') as KanbanProgress;

      //   if (!project || !team || !progress) return prev; // fallback

      //   const status: KanbanProgress[] = ['TODO', 'DOING', 'DONE'];
      //   for (const key of status) {
      //     updated[project][team][key] = updated[project][team][key].filter(
      //       (i) => i.number !== issue.data.number
      //     );
      //   }

      //   updated[project][team][progress].unshift(issue.data);

      //   return updated;
      // });

      setModal(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormToggle = (key: string) => {
    setFormToggle((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  // TODO: CHECKED => 숨김처리하기 위해 사용하는 속성인데 디자인이 완성된 것이 없기에 당장에는 지움
  // const optionProgress = ['TODO', 'DOING', 'DONE', 'CHECKED'];
  const optionProgress = ['TODO', 'DOING', 'DONE'];

  const getTemplateContents = async () => {
    const res = await octokit.rest.repos.getContent({
      owner: 'nettee-space',
      repo: item.repo ?? 'test-repo',
      path: '.github/ISSUE_TEMPLATE',
    });

    if (!Array.isArray(res.data)) return [];

    const markdownFiles = res.data.filter((f) => f.name.endsWith('.md'));

    const contents = await Promise.all(
      markdownFiles.map(async (file) => {
        const res = await fetch(file.download_url as string);
        const content = await res.text();
        return {
          name: file.name,
          content,
        };
      })
    );

    console.log(contents);
    return contents;
  };

  const loadGithubRepos = async () => {
    try {
      const repos = await getGithubRepos();
      // .github 저장소 필터링 (설정용 저장소이므로 제외)
      const filteredRepos = repos.filter(
        (repo) =>
          repo.repo_name !== '.github' && !repo.repo_name.startsWith('.github')
      );
      setGithubRepos(filteredRepos);
    } catch (error) {
      console.error('GitHub 저장소 목록 로드 실패:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex h-screen w-screen items-center justify-center overflow-auto bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && setModal(null)}
    >
      <form
        className="my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-[1028px] flex-col overflow-hidden rounded-[8px] bg-white"
        onSubmit={handleSubmit}
      >
        {/* 모달 헤더 영역*/}
        <div className="flex h-[56px] items-center justify-between rounded-t-[8px] bg-[#EDEDED] p-[16px]">
          <div className="flex items-center gap-[8px]">
            <div className="flex h-[32px] w-[32px] items-center justify-center">
              <img src={PinX} />
            </div>

            <p className="flex gap-[4px] font-semibold">
              {item.project && (isNaN(Number(item.project)) ? item.project : mapProjectIdToName(item.project))} 
              <span className="text-[12px]">▶</span> 
              {item.team && (isNaN(Number(item.team)) ? item.team : mapTeamIdToName(item.team))}
            </p>
          </div>

          <div onClick={() => setModal(null)}>
            <XIcon />
          </div>
        </div>

        {/* 모달 편집 영역 */}
        <div className="relative flex-1 overflow-y-auto">
          <div className="flex flex-wrap gap-[16px] p-[16px]">
            {/* 진행상태 선택하는 드롭다운 메뉴*/}
            <div className="relative flex w-full max-w-[420px] flex-col">
              <div className="flex items-center gap-[8px]">
                <p className="w-full max-w-[52px] text-[14px] text-[#646464]">
                  진행상태
                </p>

                <div
                  className="flex h-[32px] w-full max-w-[360px] cursor-pointer items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]"
                  onClick={() => handleFormToggle('progress')}
                >
                  <p>{formData.progress ?? item.progress}</p>

                  <Icon
                    src={formToggle['progress'] ? ICONS.up20 : ICONS.down20}
                    size={16}
                    alt={formToggle['progress'] ? 'collapse' : 'expand'}
                  />
                </div>
              </div>

              {formToggle['progress'] && (
                <div className="absolute top-[40px] z-10 flex w-full max-w-[360px] flex-col self-end rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  {optionProgress.map((opt) => {
                    const isSelected =
                      (formData.progress || item.progress) === opt;
                    return (
                      <div
                        key={opt}
                        className={`flex cursor-pointer items-center justify-between px-[12px] py-[6px] hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            progress: opt,
                          }));
                          handleFormToggle('progress');
                        }}
                      >
                        <p
                          className={
                            isSelected ? 'font-medium text-blue-600' : ''
                          }
                        >
                          {opt}
                        </p>

                        {isSelected && (
                          <Icon
                            src={ICONS.checkCircle20}
                            size={16}
                            alt="selected"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 작업기간 선택하는 캘린더 메뉴 */}
            <div className="relative flex w-full max-w-[560px] flex-col">
              <div className="flex items-center gap-[8px]">
                <p className="w-full max-w-[52px] text-[14px] text-[#646464]">
                  작업기간
                </p>

                <div
                  className="flex w-full cursor-pointer items-center gap-[8px]"
                  onClick={() => handleFormToggle('calendar')}
                >
                  <div className="flex h-[32px] w-full items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]">
                    <p>
                      {dateRange?.from?.toLocaleDateString() ?? '날짜 선택'}
                    </p>
                    <CalendarIcon size={16} />
                  </div>
                  <span>~</span>
                  <div className="flex h-[32px] w-full items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]">
                    <p>{dateRange?.to?.toLocaleDateString() ?? '날짜 선택'} </p>
                    <CalendarIcon size={16} />
                  </div>
                </div>
              </div>

              {formToggle['calendar'] && (
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  className="absolute top-[40px] z-10 h-[356px] w-[284px] self-center rounded-[8px] border shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                  locale={ko}
                />
              )}
            </div>

            {/* 깃허브 템플릿 선택하는 드롭다운 메뉴*/}
            <div className="relative flex w-full max-w-[420px] flex-col">
              <div className="flex items-center gap-[8px]">
                <p className="w-full max-w-[52px] text-[14px] text-[#646464]">
                  템플릿
                </p>

                <div
                  className="flex h-[32px] w-full max-w-[360px] cursor-pointer items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]"
                  onClick={() => handleFormToggle('template')}
                >
                  <p>선택</p>

                  <Icon
                    src={formToggle['template'] ? ICONS.up20 : ICONS.down20}
                    size={16}
                    alt={formToggle['template'] ? 'collapse' : 'expand'}
                  />
                </div>
              </div>

              {formToggle['template'] && (
                <div className="absolute top-[40px] z-10 flex w-full max-w-[360px] flex-col self-end rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  <span onClick={getTemplateContents}>!! TODO 아직 안함</span>
                </div>
              )}
            </div>

            {/* 깃연동 체크하는 드롭다운 메뉴*/}
            <div className="relative flex w-full max-w-[560px] flex-col">
              <div className="flex items-center gap-[8px]">
                <label className="flex h-[32px] w-full max-w-[140px] items-center justify-center gap-[4px] rounded-[8px] bg-[#F0F6FF] p-[8px] text-[#0065FF]">
                  <input
                    type="checkbox"
                    className="h-[16px] w-[16px]"
                    checked={isGithubEnabled}
                    onChange={(e) => {
                      setIsGithubEnabled(e.target.checked);
                      if (e.target.checked) {
                        loadGithubRepos();
                      } else {
                        // GitHub 연동 해제 시 선택된 저장소와 드롭다운 상태 초기화
                        setSelectedRepo('');
                        setFormToggle((prev) => ({ ...prev, github: false }));
                        setFormData((prev) => {
                          const { repo, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                  />
                  <img src={Github} />
                  <p>GitHub 연동</p>
                </label>

                <div
                  className={`flex h-[32px] w-full max-w-[412px] items-center justify-between rounded-[4px] border-2 px-[12px] py-[6px] ${
                    isGithubEnabled
                      ? 'cursor-pointer border-[#DBDBDB] bg-white'
                      : 'cursor-not-allowed border-gray-300 bg-gray-100'
                  }`}
                  onClick={() => isGithubEnabled && handleFormToggle('github')}
                >
                  <p
                    className={isGithubEnabled ? 'text-black' : 'text-gray-400'}
                  >
                    {selectedRepo || '저장소 선택'}
                  </p>

                  <Icon
                    src={
                      formToggle['github'] && isGithubEnabled
                        ? ICONS.up20
                        : ICONS.down20
                    }
                    size={16}
                    alt={
                      formToggle['github'] && isGithubEnabled
                        ? 'collapse'
                        : 'expand'
                    }
                    className={isGithubEnabled ? '' : 'opacity-50'}
                  />
                </div>
              </div>

              {formToggle['github'] && isGithubEnabled && (
                <div className="absolute top-[40px] right-0 z-50 flex w-full max-w-[412px] flex-col rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  {githubRepos.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto">
                      {githubRepos.map((repo) => (
                        <div
                          key={repo.id}
                          className="flex cursor-pointer items-center justify-between border-b border-gray-100 px-[12px] py-[8px] last:border-b-0 hover:bg-gray-50"
                          onClick={() => {
                            setSelectedRepo(repo.repo_name);
                            setFormData((prev) => ({
                              ...prev,
                              repo: repo.repo_name,
                            }));
                            handleFormToggle('github');
                          }}
                        >
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="truncate text-[14px] font-medium">
                              {repo.repo_name}
                            </p>
                            <p className="text-[12px] text-gray-500">
                              Team ID: {repo.team_id}
                            </p>
                          </div>
                          {selectedRepo === repo.repo_name && (
                            <div className="ml-2 flex-shrink-0">
                              <Icon
                                src={ICONS.checkCircle20}
                                size={16}
                                alt="selected"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-[12px] py-[8px] text-[14px] text-gray-500">
                      저장소를 불러오는 중...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 칸반 이슈 타이틀 */}
            <div className="w-full">
              <label className="flex flex-col gap-[4px]">
                <p className="text-[14px] text-[#939393]">제목</p>
                <input
                  type="text"
                  className="h-[40px] w-full rounded-[8px] bg-[#F5F5F5] px-[12px] py-[8px]"
                  placeholder="제목을 입력해 주세요."
                  defaultValue={item.title}
                  name="title"
                />
              </label>
            </div>

            {/* 칸반 이슈 내용 에디터 */}
            <div className="w-full">
              <label className="flex flex-col gap-[4px]">
                <p className="text-[14px] text-[#939393]">상세 내용</p>
                <div className="h-[320px] w-full overflow-auto">
                  <Editor content={item.body} setMarkdown={setMarkdown} />
                </div>
              </label>
            </div>

            {/* 담당자 선택 */}
            <div className="relative flex w-full flex-col">
              <div className="flex items-center gap-[8px]">
                <p className="w-full max-w-[52px] text-[14px] text-[#646464]">
                  담당자
                </p>

                <div
                  className="flex h-[32px] w-full max-w-[200px] cursor-pointer items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]"
                  onClick={() => handleFormToggle('assignee')}
                >
                  <p className="truncate">
                    {selectedAssignees.length > 0
                      ? `${selectedAssignees.length}명 선택됨`
                      : '담당자 선택'}
                  </p>

                  <Icon
                    src={formToggle['assignee'] ? ICONS.up20 : ICONS.down20}
                    size={16}
                    alt={formToggle['assignee'] ? 'collapse' : 'expand'}
                  />
                </div>

                {/* 선택된 담당자 목록 표시 */}
                <div className="flex min-w-0 flex-1 flex-wrap gap-[4px]">
                  {selectedAssignees.map((login) => {
                    const user = users.find(u => u.login === login);
                    return (
                      <span
                        key={login}
                        className="inline-flex items-center rounded-md bg-blue-100 py-1 pr-[4px] pl-[12px] text-xs text-blue-800"
                      >
                        <p className="text-xl font-medium">
                          {user?.real_name || login}
                        </p>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssignees((prev) =>
                              prev.filter((a) => a !== login)
                            );
                          }}
                          className="cursor-pointer"
                        >
                          <Icon src={ICONS.delete24} />
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {formToggle['assignee'] && (
                <div className="absolute bottom-[40px] left-[60px] z-50 flex w-full max-w-[350px] flex-col rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  <div className="max-h-[250px] overflow-y-auto">
                    {/* 팀별로 사용자 그룹화 */}
                    {teamList
                      .filter(([id]) => id !== 'All')
                      .map(([teamId, teamName]) => {
                        const teamUsers = users.filter(user => 
                          user.team_id.includes(parseInt(teamId))
                        );
                        
                        if (teamUsers.length === 0) return null;
                        
                        return (
                          <div
                            key={teamId}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                              {teamName}
                            </div>
                            {teamUsers.map((user) => (
                              <div
                                key={user.login}
                                className="flex cursor-pointer items-center justify-between px-[12px] py-[6px] hover:bg-gray-50"
                                onClick={() => {
                                  setSelectedAssignees((prev) => {
                                    if (prev.includes(user.login)) {
                                      return prev.filter((a) => a !== user.login);
                                    } else {
                                      return [...prev, user.login];
                                    }
                                  });
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="text-[14px] font-medium">{user.real_name}</span>
                                  <span className="text-[12px] text-gray-500">@{user.login}</span>
                                  {user.team_id.length > 1 && (
                                    <span className="text-[10px] text-blue-600">
                                      다중 팀: {user.team_id.map(id => 
                                        teamList.find(([tId]) => tId === id.toString())?.[1] || id
                                      ).join(', ')}
                                    </span>
                                  )}
                                </div>
                                {selectedAssignees.includes(user.login) && (
                                  <Icon
                                    src={ICONS.checkCircle20}
                                    size={16}
                                    alt="selected"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 라벨 추가 */}
            <div className="relative flex w-full flex-col">
              <div className="flex items-center gap-[8px]">
                <p className="w-full max-w-[52px] text-[14px] text-[#646464]">
                  라벨 추가
                </p>

                <div
                  className="flex h-[32px] w-full max-w-[160px] cursor-pointer items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]"
                  onClick={() => handleFormToggle('label')}
                >
                  <p className="truncate">
                    {selectedLabels.length > 0
                      ? `${selectedLabels.length}개 선택됨`
                      : '라벨 선택'}
                  </p>

                  <Icon
                    src={formToggle['label'] ? ICONS.up20 : ICONS.down20}
                    size={16}
                    alt={formToggle['label'] ? 'collapse' : 'expand'}
                  />
                </div>

                {/* 선택된 라벨 목록 표시 */}
                <div className="flex min-w-0 flex-1 flex-wrap gap-[4px]">
                  {selectedLabels.map((labelKey) => (
                    <StateLabel
                      key={labelKey}
                      state={labelKey as StateType}
                      selected={true}
                      className="cursor-pointer pr-1.5 pl-4"
                      onClick={() =>
                        setSelectedLabels((prev) =>
                          prev.filter((l) => l !== labelKey)
                        )
                      }
                    >
                      <p className="text-xl font-medium">
                        {kanbanLabel[labelKey]}
                      </p>
                      <Icon src={ICONS.delete24} />
                    </StateLabel>
                  ))}
                </div>
              </div>

              {formToggle['label'] && (
                <div className="absolute bottom-[40px] left-[60px] z-50 flex w-full max-w-[300px] flex-col rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  <div className="max-h-[200px] overflow-y-auto p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(kanbanLabel).map(([key, label]) => {
                        const isSelected = selectedLabels.includes(
                          key as KanbanLabelType
                        );
                        return (
                          <div
                            key={key}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedLabels((prev) => {
                                const labelKey = key as KanbanLabelType;
                                if (prev.includes(labelKey)) {
                                  return prev.filter((l) => l !== labelKey);
                                } else {
                                  return [...prev, labelKey];
                                }
                              });
                            }}
                          >
                            <StateLabel
                              state={key as StateType}
                              selected={isSelected}
                              className="w-full text-center"
                            >
                              {label}
                              {isSelected && (
                                <Icon
                                  src={ICONS.checkCircle20}
                                  size={12}
                                  alt="selected"
                                />
                              )}
                            </StateLabel>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 서브밋 버튼 */}
        <div className="flex justify-end border-t border-gray-200 bg-white p-[16px]">
          <button
            className="h-[36px] w-[224px] rounded-[8px] bg-[#0065FF] text-[14px] text-white duration-200 hover:bg-black disabled:bg-black"
            type="submit"
            disabled={loading}
          >
            {loading
              ? '처리 중...'
              : !item.number || item.number === 0
                ? '추가하기'
                : '수정하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
