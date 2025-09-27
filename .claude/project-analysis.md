# Nettee Kanban 프로젝트 분석 문서

## 프로젝트 개요

### 목적
Nettee 팀의 생산성과 협업 효율을 높이기 위한 실사용 목적의 칸반 보드

### 핵심 특징
- 현대적 프론트엔드 기술 스택 기반
- Supabase 백엔드 통합
- GitHub API 연동
- 실제 업무에서 사용되는 Production Ready 애플리케이션

## 기술 스택

### 프론트엔드
- **React 19** + **TypeScript** - 컴포넌트 기반 UI
- **Vite** - 빠른 빌드 도구
- **SWC** - 고성능 컴파일러
- **Tailwind CSS v4** - 유틸리티 우선 CSS 프레임워크
- **shadcn/ui** - 접근성 우선 UI 컴포넌트

### 상태 관리
- **Zustand** - 경량 상태 관리 라이브러리
- Devtools 미들웨어로 디버깅 지원

### 백엔드 & API
- **Supabase** - PostgreSQL 기반 BaaS
- **GitHub API** (Octokit) - 이슈 동기화
- **@supabase/supabase-js** - 클라이언트 라이브러리

### 개발 도구
- **pnpm@9.12.3** - 패키지 매니저 (정확한 버전 지정)
- **ESLint + Prettier** - 코드 품질 및 포맷팅
- **Husky + Commitlint** - Git 훅 및 커밋 컨벤션
- **Lint-staged** - 스테이징된 파일만 린트

## 아키텍처 분석

### Feature-based 구조
```
src/features/kanban/
├── components/     # UI 컴포넌트
├── hooks/         # 커스텀 React 훅
├── store/         # 기능별 Zustand 스토어
├── types/         # TypeScript 타입 정의
├── constants/     # 정적 데이터
└── apis/          # API 통합 레이어
```

### 주요 컴포넌트
- **KanbanBoard**: 메인 칸반 보드 인터페이스
- **KanbanCard**: 개별 태스크 카드
- **KanbanColumn**: 진행 상태별 컬럼 (TODO, DOING, DONE)
- **KanbanModal**: 태스크 생성/편집 모달
- **Sidebar**: 필터링 및 보기 옵션

### 데이터 모델

#### Frontend Type (IssueData)
```typescript
export type IssueData = {
  sb_id: string;          // Supabase 고유 ID
  html_url: string;       // GitHub 이슈 URL
  id: string;             // GitHub 고유 ID
  number: number;         // 이슈 번호
  title: string;          // 이슈 제목
  body: string;           // 이슈 내용
  created_at: string;     // 생성 시간
  updated_at: string;     // 수정 시간
  progress: string;       // TODO, DOING, DONE
  sta_dt: string;         // 작업 시작 시간
  end_dt: string;         // 작업 종료 시간
  assignees: string[];    // 담당자 목록
  labels: string[];       // 라벨 목록
  parent: string;         // 상위 태스크
  project: string;        // 프로젝트 이름
  team: string;          // 팀 이름
  repo: string;          // 저장소 이름
  task_priority: string; // 우선순위
  pinned?: boolean;      // Pin 상태
};
```

#### Backend Type (KanbanTask)
```typescript
export type KanbanTask = {
  id: number;
  title: string;
  description: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  template_id: string | null;
  repo_url: string | null;
  kaban_user_id: string | null;
  task_priority_id: number | null;
  project_id: number | null;
  parent_task_id: number | null;
  create_at: string | null;
  update_at: string | null;
  team_id: number;
};
```

### 상태 관리 구조

#### 1. issueStore (src/store/issueStore.ts)
- 칸반 태스크 전체 관리
- Supabase 연동 CRUD 작업
- 매핑 함수로 Frontend ↔ Backend 타입 변환

#### 2. filterStore (src/features/kanban/store/filterStore.ts)
```typescript
interface FilterState {
  // 필터 상태
  selectedProjects: string[];
  selectedTeams: string[];
  selectedAssignees: string[];
  selectedLabels: string[];

  // 데이터 목록
  teamList: [string, string][];
  projectList: [string, string][];

  // 필터 액션들...
}
```

#### 3. userStore (src/store/userStore.ts)
- 사용자 데이터 관리

### API 레이어 구조

#### Supabase API (src/supabase/api/)
- **kanbanTask.ts**: 태스크 CRUD, 계층 관리
- **project.ts**: 프로젝트 관리
- **team.ts**: 팀 관리
- **netteeUser.ts**: 사용자 관리
- **taskPriority.ts**: 우선순위 관리

#### 주요 API 함수
- `getAllTasks()`: 모든 태스크 조회
- `createKanbanTask()`: 새 태스크 생성
- `updateKanbanTask()`: 태스크 업데이트
- `moveTaskToSubTask()`: 서브태스크 변환
- `checkCircularReference()`: 순환 참조 검증

### 현재 구현된 주요 기능

#### 1. 드래그 앤 드롭
- 태스크 간 상태 변경
- 서브태스크 생성 (카드 위에 드롭)
- 계층 관계 검증 로직

#### 2. 서브태스크 시스템
- 부모-자식 관계 관리
- 계층 표시 UI
- 순환 참조 방지

#### 3. 필터링
- 프로젝트, 팀, 담당자, 라벨별 필터
- 동적 필터 데이터 로딩

#### 4. GitHub 연동
- 이슈 템플릿 연동
- 저장소 선택 기능
- 체크박스 기반 저장소 선택 UI

#### 5. KanbanModal 고급 기능
- 변경사항 자동 감지
- 모달 강제 종료 시 경고 알림
- 저장 옵션 선택 (계속 편집/저장하지 않고 나가기/저장하고 나가기)
- 모든 폼 필드 변경사항 추적

## 개발 워크플로우

### 개발 명령어
```bash
pnpm dev         # 개발 서버 실행
pnpm build       # TypeScript 체크 후 빌드
pnpm lint        # ESLint 실행
pnpm format      # Prettier 포맷팅
pnpm type-check:app  # TypeScript 타입 체크만
```

### Git 컨벤션
- **커밋 메시지**: Conventional Commits 형식
- **타입**: feat, fix, design, refactor, test, docs, build, ci, perf, chore
- **Pre-commit**: 자동 린트 및 포맷팅

### 패키지 관리
- **중요**: 반드시 `pnpm@9.12.3` 사용
- Node.js >=20 요구사항

## 현재 브랜치 상태

### 브랜치
- **현재**: feature/task-supabase-api
- **메인**: main

### 최근 커밋
- 텍스트 입력 커서 색상 변경
- 드래그 앤 드롭 서브태스크 생성 기능
- 태스크 계층 검수 로직
- 체크박스 토글 기능

## 아이콘 시스템
```
public/icons/
├── 16/    # 16px 아이콘
├── 20/    # 20px 아이콘 (pin, unpin, github 등)
├── 24/    # 24px 아이콘
└── 32/    # 32px 아이콘
```

## 주요 라이브러리
- **@blocknote/react**: 리치 텍스트 에디터
- **react-day-picker**: 날짜 선택
- **date-fns**: 날짜 조작
- **lucide-react**: 아이콘
- **class-variance-authority**: 컴포넌트 변형 관리