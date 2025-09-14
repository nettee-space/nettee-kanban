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

import PinX from '@/assets/pinDisable.svg';
import { Editor } from '@/shared/components/Editor';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DatePicker,
  toKoreanDateString,
} from '@/shared/components/ui/datetime-picker';
import { Icon, ICONS } from '@/shared/components/ui/icon';
import { cn } from '@/shared/lib/utils/cn';
import { mapTeamIdToName, useIssueStore } from '@/store/issueStore';
import { useUserStore } from '@/store/userStore';
import { getGithubIssueTemplates } from '@/supabase/api/githubIssueTemplate';
import { getGithubRepos } from '@/supabase/api/githubRepo';
import { GithubIssueTemplate } from '@/supabase/types/github/issue-template';
import { GithubRepo } from '@/supabase/types/github/repo';

import { getStateKeyFromLabel, stateLabelMap } from '../../constants/kanban';
import { netteeRepo } from '../../constants/nettee';
import { useFilterStore } from '../../store/filterStore';
import { IssueData } from '../../types/issues';
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
  const { createIssueToSupabase, updateIssueToSupabase } = useIssueStore();
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
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string>(
    item.repo || ''
  );
  const [isGithubEnabled, setIsGithubEnabled] = useState(!!item.repo || false);
  const [templates, setTemplates] = useState<GithubIssueTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<GithubIssueTemplate | null>(null);
  const [title, setTitle] = useState<string>(item.title || '');

  // 담당자 선택 상태 (login 값으로 저장)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    item.assignees || []
  );

  // 개별 날짜 선택 모드 ('start', 'end', 'range')
  const [dateEditMode, setDateEditMode] = useState<'start' | 'end' | 'range'>(
    'range'
  );

  // 날짜 범위 유효성 검사
  const isDateRangeValid = () => {
    if (!dateRange?.from || !dateRange?.to) return true;
    return dateRange.from <= dateRange.to;
  };

  // 라벨 선택 상태 (kanban 전용 라벨만)
  const [selectedLabels, setSelectedLabels] = useState<KanbanLabelType[]>(
    () => {
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
        selectedLabels: labels,
      });

      return labels;
    }
  );

  useEffect(() => {
    if (dateRange && (dateRange.from || dateRange.to)) {
      setFormData((prev) => ({
        ...prev,
        ...(dateRange.from && { sta_dt: toKoreanDateString(dateRange.from) }),
        ...(dateRange.to && { end_dt: toKoreanDateString(dateRange.to) }),
      }));

      // 범위 선택이 완료되면 (from과 to가 모두 있으면) 캘린더 닫기
      if (dateRange.from && dateRange.to) {
        setFormToggle((prev) => ({
          ...prev,
          calendar: false,
        }));
      }
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

  // 기존 GitHub 연동 태스크 수정 시 저장소 목록 자동 로드
  useEffect(() => {
    if (isGithubEnabled && githubRepos.length === 0) {
      loadGithubRepos();
    }
  }, [isGithubEnabled]);

  // GitHub 저장소 목록이 로드된 후, 기존 연동된 저장소의 템플릿 자동 로드
  useEffect(() => {
    if (
      isGithubEnabled &&
      githubRepos.length > 0 &&
      selectedRepoUrl &&
      templates.length === 0
    ) {
      const matchedRepo = githubRepos.find(
        (repo) => repo.repo_url === selectedRepoUrl
      );
      if (matchedRepo) {
        loadTemplates(matchedRepo.id);
      }
    }
  }, [githubRepos, selectedRepoUrl, isGithubEnabled]);

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
      const isNew = !item.number || item.number === 0;

      const titleValue = title.trim();
      const body = formData.body || markdown || item.body || '';
      const progress = formData.progress || item.progress || 'TODO';
      // 동적 기본값 설정: 첫 번째 사용 가능한 프로젝트와 팀 사용
      const defaultProject =
        projectList.find(([id]) => id !== 'All')?.[1] || 'Default';
      const defaultTeam =
        teamList.find(([id]) => id !== 'All')?.[1] || 'Default';

      const project = item.project || defaultProject;
      const team = item.team || defaultTeam;

      if (!titleValue) {
        alert('제목을 입력해주세요.');
        return;
      }

      // 날짜 범위 유효성 검사
      if (!isDateRangeValid()) {
        alert(
          '시작일이 종료일보다 늦을 수 없습니다. 날짜를 다시 확인해주세요.'
        );
        return;
      }

      if (isGithubEnabled && !selectedRepoUrl) {
        alert('GitHub 연동이 활성화된 경우 저장소를 선택해주세요.');
        return;
      }

      if (isNew && addIssue) {
        // 새 이슈 데이터 준비
        const newIssueData = {
          title: titleValue,
          body: body,
          progress: progress,
          project: project,
          team: team,
          sta_dt:
            formData.sta_dt ||
            (dateRange?.from
              ? toKoreanDateString(dateRange.from)
              : toKoreanDateString(new Date())),
          end_dt:
            formData.end_dt ||
            (dateRange?.to
              ? toKoreanDateString(dateRange.to)
              : toKoreanDateString(new Date())),
          assignees: selectedAssignees,
          labels: selectedLabels.map((labelKey) => kanbanLabel[labelKey]),
          repo:
            isGithubEnabled && selectedRepoUrl
              ? selectedRepoUrl
              : getRepo(item) || '',
          task_priority:
            selectedLabels.find((label) =>
              ['hold', 'low', 'medium', 'high', 'veryhigh'].includes(label)
            ) || 'medium',
          // createIssueToSupabase에 필요한 추가 필드들
          html_url: `#issue-${Date.now()}`,
          state: 'open',
          parent: '',
        };

        // TODO: 로그인 유무에 따라서도 supabase 저장 여부 결정
        if (!isGithubEnabled) {
          // 로컬 저장 (기존 방식)
          addIssue(newIssueData);
        } else {
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
            alert(
              `Supabase 저장 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
            );
            // Supabase 저장 실패해도 로컬 저장은 유지
          }
        }

        // 폼 초기화
        setFormData({});
        setMarkdown('');
        setDateRange(undefined);
        setFormToggle({});
        setIsGithubEnabled(false);
        setSelectedRepoUrl('');
        setGithubRepos([]);
        setSelectedAssignees([]);
        setSelectedLabels([]);
        setTemplates([]);
        setSelectedTemplate(null);
        setTitle('');
        setModal(null);
      } else {
        // 수정 모드 - updateIssueToSupabase 사용
        if (!item.number) {
          alert('이슈 ID가 없어 수정할 수 없습니다.');
          return;
        }
        console.log('확인 ', formData.end_dt, dateRange?.to);
        const updateData = {
          title: titleValue,
          body: body,
          progress: progress,
          project: project,
          team: team,
          sta_dt:
            formData.sta_dt ||
            (dateRange?.from
              ? toKoreanDateString(dateRange.from)
              : item.sta_dt),
          end_dt:
            formData.end_dt ||
            (dateRange?.to ? toKoreanDateString(dateRange.to) : item.end_dt),
          assignees: selectedAssignees,
          labels: selectedLabels.map((labelKey) => kanbanLabel[labelKey]),
          repo:
            isGithubEnabled && selectedRepoUrl
              ? selectedRepoUrl
              : formData.repo || item.repo || '',
          task_priority:
            selectedLabels.find((label) =>
              ['hold', 'low', 'medium', 'high', 'veryhigh'].includes(label)
            ) ||
            item.task_priority ||
            'medium',
        };

        try {
          console.log('=== Supabase 수정 시작 ===');
          console.log('수정할 이슈 ID:', item.number);
          console.log('수정 데이터:', updateData);

          const updatedIssue = await updateIssueToSupabase(
            item.number,
            updateData
          );

          if (updatedIssue) {
            console.log('✅ Supabase 수정 성공:', updatedIssue);
            alert('이슈가 성공적으로 수정되었습니다!');
          } else {
            console.warn('⚠️ Supabase 수정 실패: null 반환');
            alert('이슈 수정에 실패했습니다.');
          }
        } catch (error) {
          console.error('❌ Supabase 수정 중 오류:', error);
          alert(
            `이슈 수정 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          );
        }

        // 폼 초기화
        setFormData({});
        setMarkdown('');
        setDateRange(undefined);
        setFormToggle({});
        setIsGithubEnabled(false);
        setSelectedRepoUrl('');
        setGithubRepos([]);
        setSelectedAssignees([]);
        setSelectedLabels([]);
        setTemplates([]);
        setSelectedTemplate(null);
        setTitle('');
        setModal(null);
      }
    } catch (error) {
      console.error('이슈 저장 중 오류:', error);
      alert('이슈 저장 중 오류가 발생했습니다.');
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

  // frontmatter 파싱 함수
  const parseFrontmatter = (content: string) => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return {
        metadata: {},
        content: content,
      };
    }

    const [, frontmatter, bodyContent] = match;
    const metadata: Record<string, string> = {};

    // YAML 형식의 frontmatter를 간단히 파싱
    frontmatter.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        // 따옴표 제거
        metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    });

    return {
      metadata,
      content: bodyContent.trim(),
    };
  };

  const loadTemplates = async (repoId: number) => {
    try {
      const templateList = await getGithubIssueTemplates(repoId);
      // .md 파일만 필터링
      const markdownTemplates = templateList.filter((template) =>
        template.name.endsWith('.md')
      );
      setTemplates(markdownTemplates);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      setTemplates([]);
    }
  };

  const applyTemplate = (template: GithubIssueTemplate) => {
    // 기존에 작성된 내용이 있다면 확인 후 적용
    const hasContent = markdown && markdown.trim().length > 0;
    const shouldApply = hasContent
      ? confirm(
          '기존 작성된 내용이 있습니다. 템플릿을 적용하면 기존 내용이 사라집니다. 계속하시겠습니까?'
        )
      : true;

    if (shouldApply) {
      // frontmatter 파싱하여 메타정보와 본문 내용 분리
      const { metadata, content } = parseFrontmatter(template.body);

      // 본문 내용만 상세 내용에 반영
      setMarkdown(content);
      setSelectedTemplate(template);

      // 메타정보에 title이 있으면 제목에 적용, 없으면 기존 template.title 사용
      console.log('메타정보', metadata, template);
      const titleToApply = metadata.title;
      if (titleToApply) {
        setTitle(titleToApply);
      }
    }

    setFormToggle((prev) => ({ ...prev, template: false }));
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

            <p className="flex items-center gap-[4px] font-bold">
              {item.project}
              <Icon src={ICONS.rightAbled32} />
              {item.team &&
                (isNaN(Number(item.team))
                  ? item.team
                  : mapTeamIdToName(item.team))}
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
                <p className="w-full max-w-[52px] text-xs text-[#646464]">
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
                <p
                  className="w-full max-w-[52px] cursor-pointer text-xs text-[#646464] transition-colors hover:text-[#444444]"
                  onClick={() => {
                    setDateEditMode('range');
                    handleFormToggle('calendar');
                  }}
                  title="범위 선택"
                >
                  작업기간
                </p>

                <div className="flex w-full flex-col gap-[4px]">
                  <div className="flex w-full items-center gap-[8px]">
                    <div
                      className={`flex h-[32px] w-full cursor-pointer items-center justify-between rounded-[4px] border-2 px-[12px] py-[6px] ${
                        !isDateRangeValid()
                          ? 'border-red-500 bg-red-50'
                          : 'border-[#DBDBDB]'
                      }`}
                      onClick={() => {
                        setDateEditMode('start');
                        handleFormToggle('calendar');
                      }}
                    >
                      <p className={!isDateRangeValid() ? 'text-red-600' : ''}>
                        {dateRange?.from?.toLocaleDateString('ko-KR') ??
                          '시작일 선택'}
                      </p>
                      <CalendarIcon
                        size={16}
                        className={!isDateRangeValid() ? 'text-red-500' : ''}
                      />
                    </div>
                    <span>~</span>
                    <div
                      className={`flex h-[32px] w-full cursor-pointer items-center justify-between rounded-[4px] border-2 px-[12px] py-[6px] ${
                        !isDateRangeValid()
                          ? 'border-red-500 bg-red-50'
                          : 'border-[#DBDBDB]'
                      }`}
                      onClick={() => {
                        setDateEditMode('end');
                        handleFormToggle('calendar');
                      }}
                    >
                      <p className={!isDateRangeValid() ? 'text-red-600' : ''}>
                        {dateRange?.to?.toLocaleDateString('ko-KR') ??
                          '종료일 선택'}{' '}
                      </p>
                      <CalendarIcon
                        size={16}
                        className={!isDateRangeValid() ? 'text-red-500' : ''}
                      />
                    </div>
                  </div>
                  {!isDateRangeValid() && (
                    <p className="px-2 text-xs text-red-500">
                      ⚠️ 시작일이 종료일보다 늦습니다. 날짜를 다시 확인해주세요.
                    </p>
                  )}
                </div>
              </div>

              {formToggle['calendar'] && (
                <DatePicker
                  mode={dateEditMode === 'range' ? 'range' : 'single'}
                  defaultMonth={dateRange?.from}
                  selected={
                    dateEditMode === 'range'
                      ? dateRange
                      : dateEditMode === 'start'
                        ? dateRange?.from
                        : dateRange?.to
                  }
                  onSelect={(date) => {
                    if (dateEditMode === 'start') {
                      // 시작일만 수정
                      setDateRange((prev) => ({
                        from: date as Date,
                        to: prev?.to,
                      }));
                      setFormToggle((prev) => ({ ...prev, calendar: false }));
                    } else if (dateEditMode === 'end') {
                      // 종료일만 수정
                      setDateRange((prev) => ({
                        from: prev?.from,
                        to: date as Date,
                      }));
                      setFormToggle((prev) => ({ ...prev, calendar: false }));
                    } else {
                      // 범위 선택 (기존 동작)
                      setDateRange(date as any);
                      if (
                        date &&
                        typeof date === 'object' &&
                        'from' in date &&
                        date.from &&
                        date.to
                      ) {
                        setFormToggle((prev) => ({ ...prev, calendar: false }));
                      }
                    }
                    // 다음 선택을 위해 범위 모드로 리셋
                    setDateEditMode('range');
                  }}
                  className="absolute top-[40px] z-10 w-[300px] self-center"
                  locale={ko}
                />
              )}
            </div>

            {/* 깃허브 템플릿 선택하는 드롭다운 메뉴*/}
            <div className="relative flex w-full max-w-[420px] flex-col">
              <div className="flex items-center gap-[8px]">
                <p className="w-full max-w-[52px] text-xs text-[#646464]">
                  템플릿
                </p>

                <div
                  className={`flex h-[32px] w-full max-w-[360px] items-center justify-between rounded-[4px] border-2 px-[12px] py-[6px] ${
                    templates.length > 0
                      ? 'cursor-pointer border-[#DBDBDB] bg-white'
                      : 'cursor-not-allowed border-gray-300 bg-gray-100'
                  }`}
                  onClick={() =>
                    templates.length > 0 && handleFormToggle('template')
                  }
                >
                  <p
                    className={
                      templates.length > 0 ? 'text-black' : 'text-gray-400'
                    }
                  >
                    {selectedTemplate
                      ? selectedTemplate.name
                      : templates.length > 0
                        ? '템플릿 선택'
                        : '저장소를 먼저 선택하세요'}
                  </p>

                  <Icon
                    src={formToggle['template'] ? ICONS.up20 : ICONS.down20}
                    size={16}
                    alt={formToggle['template'] ? 'collapse' : 'expand'}
                    className={templates.length > 0 ? '' : 'opacity-50'}
                  />
                </div>
              </div>

              {formToggle['template'] && (
                <div className="absolute top-[40px] z-10 flex w-full max-w-[360px] flex-col self-end rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  {templates.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex cursor-pointer items-center justify-between border-b border-gray-100 px-[12px] py-[8px] last:border-b-0 hover:bg-gray-50"
                          onClick={() => applyTemplate(template)}
                        >
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="truncate text-xs font-medium">
                              {template.name}
                            </p>
                            <p className="truncate text-[12px] text-gray-500">
                              {template.title}
                            </p>
                          </div>
                          {selectedTemplate?.id === template.id && (
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
                    <div className="px-[12px] py-[8px] text-xs text-gray-500">
                      사용 가능한 템플릿이 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 깃연동 체크하는 드롭다운 메뉴*/}
            <div className="relative flex w-full max-w-[560px] flex-col">
              <div className="flex items-center gap-[8px]">
                <label
                  className={cn(
                    'flex h-[32px] w-full max-w-[140px] cursor-pointer items-center justify-center gap-[4px] rounded-[8px] p-[8px] duration-100 hover:bg-gray-100',
                    isGithubEnabled ? `text-primary-12 bg-primary-3` : ''
                  )}
                >
                  <Checkbox
                    checked={isGithubEnabled}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setIsGithubEnabled(isChecked);
                      if (isChecked) {
                        loadGithubRepos();
                      } else {
                        // GitHub 연동 해제 시 선택된 저장소와 드롭다운 상태 초기화
                        setSelectedRepoUrl(item.repo || '');
                        setFormToggle((prev) => ({
                          ...prev,
                          github: false,
                          template: false,
                        }));
                        setFormData((prev) => {
                          const { repo, ...rest } = prev;
                          return rest;
                        });
                        setTemplates([]);
                        setSelectedTemplate(null);
                      }
                    }}
                  />
                  {/* // ! SVGR를 사용하는 형식이 아니어서 SVG 색 변경이 불가 */}
                  <Icon
                    src={ICONS.github20}
                    alt="github icon"
                    className={isGithubEnabled ? '' : 'opacity-50'}
                  />
                  <p className="text-xs font-semibold">GitHub 연동</p>
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
                    className={cn(
                      'line-clamp-1',
                      isGithubEnabled ? 'text-black' : 'text-gray-400'
                    )}
                  >
                    {selectedRepoUrl
                      ? selectedRepoUrl.split('.com/')[1] || selectedRepoUrl
                      : '저장소 선택'}
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
                            setSelectedRepoUrl(repo.repo_url);
                            setFormData((prev) => ({
                              ...prev,
                              repo: repo.repo_url,
                            }));
                            // 선택된 저장소의 템플릿 로드
                            loadTemplates(repo.id);
                            handleFormToggle('github');
                          }}
                        >
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="truncate text-xs font-medium">
                              {repo.repo_name}
                            </p>
                            <p className="text-[12px] text-gray-500">
                              Team ID: {repo.team_id}
                            </p>
                          </div>
                          {selectedRepoUrl === repo.repo_url && (
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
                    <div className="px-[12px] py-[8px] text-xs text-gray-500">
                      저장소를 불러오는 중...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 칸반 이슈 타이틀 */}
            <div className="w-full">
              <label className="flex flex-col gap-[4px]">
                <p className="text-xs text-[#939393]">제목</p>
                <input
                  type="text"
                  className="h-[40px] w-full rounded-[8px] bg-[#F5F5F5] px-[12px] py-[8px]"
                  placeholder="제목을 입력해 주세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  name="title"
                />
              </label>
            </div>

            {/* 칸반 이슈 내용 에디터 */}
            <div className="w-full">
              <label className="flex flex-col gap-[4px]">
                <p className="text-xs text-[#939393]">상세 내용</p>
                <div className="h-[320px] w-full overflow-auto">
                  <Editor
                    key={selectedTemplate?.id || 'default'}
                    content={markdown || item.body}
                    setMarkdown={setMarkdown}
                  />
                </div>
              </label>
            </div>

            {/* 담당자 선택 */}
            <div className="relative flex w-full flex-col">
              <div className="flex items-center gap-[8px]">
                <p
                  className="w-full max-w-[52px] text-xs text-[#646464]"
                  style={{
                    letterSpacing: '-0.6px',
                  }}
                >
                  담당자 추가
                </p>

                <div
                  className="flex h-[32px] w-full max-w-[160px] cursor-pointer items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]"
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
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <p className="text-xs">담당자 </p>
                  {selectedAssignees.map((login) => {
                    const user = users.find((u) => u.login === login);
                    return (
                      <span
                        key={login}
                        className="inline-flex items-center rounded-md bg-blue-100 py-1 pr-[4px] pl-[12px] text-xs text-blue-800"
                      >
                        <p className="text-xs font-medium">
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
                        const teamUsers = users.filter((user) =>
                          user.team_id.includes(parseInt(teamId))
                        );

                        if (teamUsers.length === 0) return null;

                        return (
                          <div
                            key={teamId}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                              {teamName}
                            </div>
                            {teamUsers.map((user) => (
                              <div
                                key={user.login}
                                className="flex cursor-pointer items-center justify-between px-[12px] py-[6px] hover:bg-gray-50"
                                onClick={() => {
                                  setSelectedAssignees((prev) => {
                                    if (prev.includes(user.login)) {
                                      return prev.filter(
                                        (a) => a !== user.login
                                      );
                                    } else {
                                      return [...prev, user.login];
                                    }
                                  });
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">
                                    {user.real_name}
                                  </span>
                                  <span className="text-[12px] text-gray-500">
                                    @{user.login}
                                  </span>
                                  {user.team_id.length > 1 && (
                                    <span className="text-[10px] text-blue-600">
                                      다중 팀:{' '}
                                      {user.team_id
                                        .map(
                                          (id) =>
                                            teamList.find(
                                              ([tId]) => tId === id.toString()
                                            )?.[1] || id
                                        )
                                        .join(', ')}
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
                <p className="w-full max-w-[52px] text-xs text-[#646464]">
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
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[4px]">
                  <p className="text-xs">라벨</p>
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
                      <p className="text-xs font-medium">
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
            className="h-[36px] w-[224px] rounded-[8px] bg-[#0065FF] text-xs text-white duration-200 hover:bg-black disabled:bg-black"
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
