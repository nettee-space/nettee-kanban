# 칸반 카드 개선 기능 구현 계획

## 요구사항 정의

### 1. 담당자/라벨 표시 기능
**요구사항**: 하위 태스크가 없는 칸반 카드에서 담당자 또는 라벨이 설정되어 있다면, 작업 기간 아래에 담당자와 라벨을 세로 방향으로 표기

**상세 조건**:
- 표시 위치: 작업 기간(`sta_dt ~ end_dt`) 아래, 서브태스크 영역 위
- 표시 조건: `subTasks.length === 0` AND (`assignees.length > 0` OR `labels.length > 0`)
- 표시 순서: 담당자 → 라벨 (세로 정렬)

### 2. Pin/Unpin 토글 기능
**요구사항**: 칸반 카드의 pin/unpin 아이콘 클릭 시 해당 카드의 위치가 컬럼 내에서 변경됨

**상세 동작**:
- **Unpin → Pin**: 카드가 해당 컬럼의 최상단으로 이동
- **Pin → Unpin**: 카드가 Divider 아래 일반 영역으로 이동
- **정렬 유지**: Pin/Unpin 각 영역 내에서는 기존 정렬 기준 유지 (`updated_at` 내림차순)

### 3. Pin/Unpin 영역 구분
**요구사항**: Pin된 카드와 일반 카드 사이에 시각적 구분선(Divider) 표시

**상세 구현**:
- Pin된 카드들과 일반 카드들 사이에 구분선 컴포넌트 삽입
- 구분선은 Pin된 카드가 있을 때만 표시

### 4. 사이드바 필터 기능
**요구사항**: 사이드바의 pin 아이콘과 github 아이콘 클릭 시 해당 조건의 카드만 표시

**필터 조건**:
- **Pin 필터**: `pinned: true`인 카드만 표시
- **GitHub 필터**: `repo` 필드가 존재하는 카드만 표시 (GitHub 연결된 카드)

## 구현 계획

### Phase 1: 데이터 구조 확장
1. **FilterStore 확장**
   - `showPinnedOnly: boolean` 상태 추가
   - `showGithubOnly: boolean` 상태 추가
   - 해당 토글 액션들 추가

### Phase 2: UI 컴포넌트 개선
2. **KanbanCard 담당자/라벨 표시**
   - 조건부 렌더링 로직 추가
   - 담당자/라벨 UI 컴포넌트 구현

3. **Pin/Unpin 클릭 핸들러**
   - `onPin` 이벤트 핸들러 구현
   - 상태 업데이트 로직 구현

### Phase 3: 정렬 및 필터링 로직
4. **KanbanColumn 정렬 로직 수정**
   - Pin 상태별 카드 분리
   - 각 영역 내 정렬 유지

5. **Divider 컴포넌트 추가**
   - Pin/Unpin 영역 구분용 컴포넌트
   - 조건부 렌더링

### Phase 4: 사이드바 필터 연동
6. **ViewOptions 필터 연동**
   - Pin/GitHub 버튼 클릭 이벤트 연결
   - FilterStore와 연동

7. **필터 로직 통합**
   - 기존 필터와 새 필터 조합
   - useFilters 훅 확장

## 구현 순서

### 1단계: FilterStore 확장
**파일**: `src/features/kanban/store/filterStore.ts`
```typescript
interface FilterState {
  // 기존 필터들...

  // 새 필터 상태
  showPinnedOnly: boolean;
  showGithubOnly: boolean;

  // 새 필터 액션
  togglePinnedFilter: () => void;
  toggleGithubFilter: () => void;

  // 필터 로직 업데이트
  getFilteredData: (data: IssueData[]) => IssueData[];
}
```

### 2단계: 담당자/라벨 표시 (KanbanCard)
**파일**: `src/features/kanban/components/KanbanBoard/Column/KanbanCard.tsx`
- 117줄 작업 기간 표시 부분 아래에 새 섹션 추가
- 조건부 렌더링: `subTasks.length === 0 && (item.assignees.length > 0 || item.labels.length > 0)`

### 3단계: Pin 클릭 핸들러
**파일**: `src/features/kanban/components/KanbanBoard/Column/KanbanCard.tsx`
- 124줄 Pin 아이콘에 `onClick` 이벤트 추가
- `onPin` prop 함수 호출

### 4단계: 칸반 컬럼 정렬 로직
**파일**: `src/features/kanban/components/KanbanBoard/Column/KanbanColumn.tsx`
- `sortedIssues` 로직 수정
- Pin된 카드와 일반 카드 분리
- 각 그룹 내에서 `updated_at` 정렬 유지

### 5단계: Divider 컴포넌트
**파일**: `src/shared/components/ui/divider.tsx` (신규 생성)
- 간단한 구분선 컴포넌트
- KanbanColumn에서 조건부 렌더링

### 6단계: 사이드바 필터 연동
**파일**: `src/features/kanban/components/Sidebar/ViewOptions.tsx`
- Pin/GitHub 버튼에 클릭 이벤트 연결
- FilterStore의 토글 함수 호출

### 7단계: 필터 로직 통합
**파일**: `src/features/kanban/hooks/useFilters.ts`
- 새 필터 조건 추가
- 기존 필터와 조합 로직

## 기술적 고려사항

### 1. 성능 최적화
- 필터링된 데이터 캐싱 (`useMemo` 활용)
- 불필요한 리렌더링 방지

### 2. 상태 동기화
- Pin 상태 변경 시 즉시 UI 반영
- Supabase 백엔드와 동기화

### 3. 사용자 경험
- Pin 토글 시 부드러운 애니메이션 (선택사항)
- 필터 상태 시각적 피드백

### 4. 데이터 일관성
- Pin 상태가 `IssueData.pinned` 필드에 올바르게 반영
- 서버 사이드 상태와 동기화

## 영향 받는 파일들

### 수정할 파일
1. `src/features/kanban/store/filterStore.ts` - 필터 상태 확장
2. `src/features/kanban/components/KanbanBoard/Column/KanbanCard.tsx` - 담당자/라벨 표시, Pin 핸들러
3. `src/features/kanban/components/KanbanBoard/Column/KanbanColumn.tsx` - 정렬 로직, Divider
4. `src/features/kanban/components/Sidebar/ViewOptions.tsx` - 필터 버튼 연동
5. `src/features/kanban/hooks/useFilters.ts` - 필터 로직 통합

### 생성할 파일
1. `src/shared/components/ui/divider.tsx` - 구분선 컴포넌트

### 고려할 파일
1. `src/store/issueStore.ts` - Pin 상태 업데이트 함수 필요시
2. `src/supabase/api/kanbanTask.ts` - 백엔드 Pin 상태 저장 필요시

## 검증 방법

### 기능 테스트
1. **담당자/라벨 표시**: 하위 태스크 없는 카드에서 올바른 표시 확인
2. **Pin 토글**: 클릭 시 위치 변경 및 상태 유지 확인
3. **영역 구분**: Divider가 올바른 위치에 표시되는지 확인
4. **필터 기능**: 사이드바 버튼으로 올바른 필터링 확인

### 성능 테스트
1. 대량 데이터에서 필터링 성능
2. Pin/Unpin 토글 시 응답성

### 호환성 테스트
1. 기존 드래그앤드롭 기능과의 호환성
2. 서브태스크 기능과의 호환성