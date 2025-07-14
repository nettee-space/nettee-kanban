import { CalendarIcon, XIcon } from 'lucide-react';
import {
  ChangeEvent,
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

import { netteeRepo } from '../constants/kanban';
import {
  GroupedIssues,
  IssueData,
  KanbanProgress,
  UpsertIssuePayload,
} from '../types/issues';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface ModalProps {
  item: Partial<IssueData>;
  setModal: SetState<Partial<IssueData> | null>;
  setIssues: SetState<GroupedIssues>;
}

export function KanbanModal({ item, setModal, setIssues }: ModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formToggle, setFormToggle] = useState<Record<string, boolean>>({});

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: item.sta_dt ? new Date(item.sta_dt) : undefined,
    to: item.end_dt ? new Date(item.end_dt) : undefined,
  });

  const [markdown, setMarkdown] = useState<string>('');

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
    setLoading(true);

    const getForm = new FormData(e.currentTarget);
    const isNew = item.number === 0;

    const payload = {
      owner: 'nettee-space',
      repo: getRepo(item),
      issue_number: isNew ? undefined : item.number,

      source: 'client',
      action: isNew ? 'create' : 'update',
      issue: {
        title: getForm.get('title'),
        body: formData.body ?? item.body,
        assignees: ['revy7289'],
        labels: [],
        progress: formData.progress ?? item.progress,
        sta_dt: formData.sta_dt ?? item.sta_dt,
        end_dt: formData.end_dt ?? item.end_dt,
      },
    };

    upsertTable(payload);
  };

  const upsertTable = async (payload: UpsertIssuePayload) => {
    try {
      const response = await fetch(
        'https://mvthhkegwhdismekprnz.supabase.co/functions/v1/nettee-function',
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

      setIssues((prev) => {
        const updated: GroupedIssues = { ...prev };

        const project = item.project;
        const team = item.team;
        const progress = (item.progress ?? 'TODO') as KanbanProgress;

        if (!project || !team || !progress) return prev; // fallback

        const status: KanbanProgress[] = ['TODO', 'DOING', 'DONE'];
        for (const key of status) {
          updated[project][team][key] = updated[project][team][key].filter(
            (i) => i.number !== issue.data.number
          );
        }

        updated[project][team][progress].unshift(issue.data);

        return updated;
      });

      setModal(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormData = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setFormToggle((prev) => ({
      ...prev,
      [e.target.name]: false,
    }));
  };

  const handleFormToggle = (key: string) => {
    setFormToggle((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const optionProgress = ['TODO', 'DOING', 'DONE', 'CHECKED'];

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

  const getRepoList = async () => {
    const repos = await octokit.rest.repos.listForOrg({
      org: 'nettee-space',
    });

    console.log(repos);
    return repos;
  };

  const getOrgMemberList = async () => {
    const members = await octokit.rest.orgs.listMembers({
      org: 'nettee-space',
    });

    console.log(members);
    return members;
  };

  const getRepoLabelList = async () => {
    const labels = await octokit.rest.issues.listLabelsForRepo({
      owner: 'nettee-space',
      repo: item.repo ?? '',
    });

    console.log(labels);
    return labels;
  };

  return (
    <div
      className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black/50 pr-[20px] pl-[10px]"
      onClick={(e) => e.target === e.currentTarget && setModal(null)}
    >
      <form
        className="flex max-w-[1028px] flex-col rounded-[8px] bg-white"
        onSubmit={handleSubmit}
      >
        {/* 모달 헤더 영역*/}
        <div className="flex h-[56px] items-center justify-between rounded-t-[8px] bg-[#EDEDED] p-[16px]">
          <div className="flex items-center gap-[8px]">
            <div className="flex h-[32px] w-[32px] items-center justify-center">
              <img src={PinX} />
            </div>

            <p className="flex gap-[4px] font-semibold">
              {item.project} <span className="text-[12px]">▶</span> {item.team}
            </p>
          </div>

          <div onClick={() => setModal(null)}>
            <XIcon />
          </div>
        </div>

        {/* 모달 편집 영역 */}
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

                <span className="text-[12px]">
                  {formToggle['progress'] ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {formToggle['progress'] && (
              <div className="absolute top-[40px] z-10 flex w-full max-w-[360px] flex-col self-end rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                {optionProgress.map((opt) => (
                  <label
                    key={opt}
                    className="flex justify-between px-[12px] py-[6px] hover:bg-gray-50"
                  >
                    <p>{opt}</p>

                    <input
                      type="checkbox"
                      value={opt}
                      name="progress"
                      onChange={handleFormData}
                      checked={formData.progress === opt}
                    />
                  </label>
                ))}
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
                  <p>{dateRange?.from?.toLocaleDateString() ?? '날짜 선택'}</p>
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

                <span className="text-[12px]">
                  {formToggle['template'] ? '▲' : '▼'}
                </span>
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
                <input type="checkbox" className="h-[16px] w-[16px]" />
                <img src={Github} />
                <p>GitHub 연동</p>
              </label>

              <div
                className="flex h-[32px] w-full max-w-[412px] cursor-pointer items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]"
                onClick={() => handleFormToggle('github')}
              >
                <p>!! TODO 아직 안함</p>

                <span className="text-[12px]">
                  {formToggle['github'] ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {formToggle['github'] && (
              <div className="absolute top-[40px] z-10 flex w-full max-w-[412px] flex-col self-end rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                <span onClick={getRepoList}>!! TODO 아직 안함</span>
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
                className="flex h-[32px] w-full max-w-[160px] cursor-pointer items-center justify-between rounded-[4px] border-2 border-[#DBDBDB] px-[12px] py-[6px]"
                onClick={() => handleFormToggle('assignee')}
              >
                <p>!! TODO 아직 안함</p>

                <span className="text-[12px]">
                  {formToggle['assignee'] ? '▲' : '▼'}
                </span>
              </div>

              <p className="w-full max-w-[52px] text-[14px] text-[#646464]">
                담당자
              </p>
            </div>

            {formToggle['assignee'] && (
              <div className="absolute bottom-[40px] z-10 flex w-full max-w-[160px] flex-col rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                <span onClick={getOrgMemberList}>!! TODO 아직 안함</span>
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
                <p>!! TODO 아직 안함</p>

                <span className="text-[12px]">
                  {formToggle['label'] ? '▲' : '▼'}
                </span>
              </div>

              <p className="w-full max-w-[52px] text-[14px] text-[#646464]">
                라벨
              </p>
            </div>

            {formToggle['label'] && (
              <div className="absolute bottom-[40px] z-10 flex w-full max-w-[160px] flex-col rounded-[4px] border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                <span onClick={getRepoLabelList}>!! TODO 아직 안함</span>
              </div>
            )}
          </div>
        </div>

        {/* 서브밋 버튼 */}
        <div className="flex justify-end p-[16px]">
          <button
            className="h-[36px] w-[224px] rounded-[8px] bg-[#0065FF] text-[14px] text-white duration-200 hover:bg-black disabled:bg-black"
            type="submit"
            disabled={loading}
          >
            {loading ? '처리 중...' : '추가하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
