# Store 디렉토리 - 데이터 매핑 및 연동 가이드

## 개요

이 문서는 기존 Issue 기반 프론트엔드 데이터와 Supabase Task 데이터 간의 매핑 관계 및 연동 상태를 정리합니다.

## 데이터 구조 비교

### IssueData (프론트엔드)
```typescript
export type IssueData = {
  sb_id: string;           // Supabase ID (문자열)
  html_url: string;        // 이슈 URL
  id: string;              // 로컬 ID (문자열)
  number: number;          // 이슈 번호 (숫자)
  state: string;           // 이슈 상태
  title: string;           // 제목
  body: string;            // 내용
  created_at: string;      // 생성 시간
  updated_at: string;      // 수정 시간
  progress: string;        // 진행 상태 (TODO/DOING/DONE)
  sta_dt: string;          // 시작 시간
  end_dt: string;          // 종료 시간
  assignees: string[];     // 담당자 배열
  labels: string[];        // 라벨 배열
  parent: string;          // 상위 태스크 ID (문자열)
  project: string;         // 프로젝트 (문자열)
  team: string;            // 팀 (문자열)
  repo: string;            // 저장소
  task_priority: string;   // 우선순위 (문자열)
  pinned?: boolean;        // 핀 여부
};
```

### KanbanTask (Supabase)
```typescript
export type KanbanTask = {
  id: number;                    // 태스크 ID (숫자)
  title: string;                 // 제목
  description: string;           // 설명
  status: string;                // 상태
  started_at: string | null;     // 시작 시간
  ended_at: string | null;       // 종료 시간
  template_id: string | null;    // 템플릿 ID
  repo_url: string | null;       // 저장소 URL
  kaban_user_id: string | null;  // 칸반 사용자 ID
  task_priority_id: number | null; // 우선순위 ID (숫자)
  project_id: number | null;     // 프로젝트 ID (숫자)
  parent_task_id: number | null; // 상위 태스크 ID (숫자)
  create_at: string | null;      // 생성 시간
  update_at: string | null;      // 수정 시간
  team_id: number;               // 팀 ID (숫자)
};
```

## 매핑 관계

### ✅ 완전 매핑 (양방향 변환 가능)

| IssueData | KanbanTask | 변환 방식 | 비고 |
|-----------|------------|-----------|------|
| `title` | `title` | 직접 매핑 | - |
| `body` | `description` | 직접 매핑 | - |
| `progress` | `status` | 직접 매핑 | - |
| `sta_dt` | `started_at` | 직접 매핑 | - |
| `end_dt` | `ended_at` | 직접 매핑 | - |
| `repo` | `repo_url` | 직접 매핑 | - |
| `created_at` | `create_at` | 직접 매핑 | - |
| `updated_at` | `update_at` | 직접 매핑 | - |

### ⚠️ 부분 매핑 (변환 시 데이터 손실 가능)

| IssueData | KanbanTask | 변환 방식 | 제한 사항 |
|-----------|------------|-----------|-----------|
| `sb_id` (string) | `id` (number) | toString/parseInt | 타입 변환 필요 |
| `number` (number) | `id` (number) | 직접 매핑 | 동일한 값 사용 |
| `assignees[]` | `kaban_user_id` | 첫 번째 요소만 사용 | 다중 담당자 → 단일 담당자 |
| `parent` (string) | `parent_task_id` (number) | parseInt 변환 | 빈 문자열 처리 필요 |
| `project` (string) | `project_id` (number) | parseInt 변환 | 문자열 → 숫자 변환 |
| `team` (string) | `team_id` (number) | parseInt 변환 | 문자열 → 숫자 변환 |
| `task_priority` (string) | `task_priority_id` (number) | parseInt 변환 | 문자열 → 숫자 변환 |

### ❌ 매핑 불가 (한쪽에만 존재)

#### IssueData 전용 필드
- `html_url`: URL 정보 (KanbanTask에 없음)
- `id`: 로컬 문자열 ID (KanbanTask의 id와 별개)
- `state`: GitHub 이슈 상태 (기본값 'open' 사용)
- `labels[]`: 라벨 배열 (KanbanTask에 없음)
- `pinned`: 핀 여부 (기본값 false 사용)

#### KanbanTask 전용 필드
- `template_id`: 템플릿 ID (IssueData에 없음)

## issueStore 확장 기능

### Supabase 연동 함수들

```typescript
// 데이터 로딩
loadTasksFromSupabase(filters?: {
  project_id?: number;
  task_priority_id?: number;
  kaban_user_id?: string;
}): Promise<void>

// CRUD 작업
createIssueToSupabase(issueData): Promise<IssueData | null>
updateIssueToSupabase(issueId: number, updateData): Promise<IssueData | null>
deleteIssueFromSupabase(issueId: number): Promise<void>
```

### 매핑 함수들

```typescript
// KanbanTask → IssueData 변환
mapKanbanTaskToIssueData(task: KanbanTask): IssueData

// IssueData → KanbanTask 변환 (Partial 지원)
mapIssueDataToKanbanTask(issue: Partial<IssueData>): Partial<KanbanTask>
```

## 사용 가이드

### 1. Supabase에서 데이터 로드
```typescript
const { loadTasksFromSupabase } = useIssueStore();

// 모든 태스크 로드
await loadTasksFromSupabase();

// 필터링해서 로드
await loadTasksFromSupabase({
  project_id: 1,
  team_id: 2
});
```

### 2. 새 이슈를 Supabase에 생성
```typescript
const { createIssueToSupabase } = useIssueStore();

const newIssue = await createIssueToSupabase({
  title: "새로운 태스크",
  body: "태스크 설명",
  progress: "TODO",
  project: "1",
  team: "1",
  // ... 기타 필드
});
```

### 3. 기존 이슈 업데이트
```typescript
const { updateIssueToSupabase } = useIssueStore();

await updateIssueToSupabase(issueId, {
  progress: "DOING",
  assignees: ["user123"]
});
```

## 주의사항

### 데이터 타입 변환
- 문자열 ↔ 숫자 변환 시 유효성 검증 필요
- 빈 문자열이나 null 값 처리 주의
- parseInt 실패 시 null 반환

### 다중 담당자 제한
- IssueData는 여러 담당자 지원
- KanbanTask는 단일 담당자만 지원
- Supabase 저장 시 첫 번째 담당자만 저장됨

### 라벨 정보 손실
- IssueData의 labels 배열은 KanbanTask에 저장되지 않음
- 별도 테이블이나 JSON 필드 활용 검토 필요

### 핀 기능
- KanbanTask에 pinned 필드 없음
- 별도 사용자 설정 테이블 활용 검토 필요

## 향후 개선 사항

1. **라벨 시스템 연동**: task_label 테이블 활용
2. **다중 담당자 지원**: task_assignee 테이블 활용  
3. **핀 기능 구현**: user_task_settings 테이블 활용
4. **템플릿 연동**: github_issue_template 테이블 활용
5. **실시간 동기화**: Supabase 구독 기능 활용