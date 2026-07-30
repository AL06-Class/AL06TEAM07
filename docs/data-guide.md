# 데이터 가이드

더미 데이터와 DB 연결 기준을 정리하는 문서입니다.

## 목적

- 역할별 화면이 같은 데이터 기준을 사용하게 합니다.
- 더미 데이터와 실제 DB 구조가 크게 달라지지 않게 합니다.
- AI가 화면마다 임의의 데이터 구조를 만들지 않게 합니다.

## 기본값

### 핵심 전제

- 현재 선택된 유저의 `role`을 기준으로 화면을 분기합니다.
- 데이터는 역할별 화면에서 필요한 정보만 필터링해서 보여줍니다.

### 역할 기준

역할 값은 아래를 기본으로 합니다.

- `candidate`: 지원자
- `recruiter`: 채용담당자
- `interviewer`: 면접관

역할 이름을 바꾸거나 새 역할을 추가하려면 먼저 팀 논의가 필요합니다.

### 데이터 작성 기준

- 필드명은 영어 `camelCase`를 사용합니다.
- 각 데이터에는 가능하면 `id`, `createdAt`, `updatedAt`을 포함합니다.
- 날짜는 문자열 또는 Firebase Timestamp 중 하나로 통일합니다.
- 상태값은 자유 텍스트가 아니라 정해진 값만 사용합니다.
- 화면별로 같은 의미의 필드를 다른 이름으로 만들지 않습니다.

### 공통 이름 사전 운영

- DB를 처음부터 완성하지 않고, 공통으로 부를 이름만 먼저 맞춥니다.
- 새 컬렉션, 필드, 상태값, 역할 값이 필요하면 구현 전에 이 문서에 먼저 추가합니다.
- 기존 이름과 의미가 같으면 새 이름을 만들지 않습니다.
- 기능별 임시 더미 데이터는 최소로 만들고, 공통 이름은 이 문서의 사전을 따릅니다.
- 아직 확정되지 않은 이름은 초안으로 표시하고, 실제 구현이 반복되면 최종 결정에 반영합니다.

### 더미 데이터

- 더미 데이터는 기능 검증에 필요한 최소만 만듭니다.
- 화면만 맞추기 위한 임시 필드는 나중에 제거 여부를 표시합니다.
- Firebase 연결 전에도 더미 데이터만으로 역할별 화면을 확인할 수 있어야 합니다.

### DB 연결 기준

- DB 구조가 정해지기 전에는 화면 컴포넌트와 데이터 접근 코드를 분리합니다.
- Firebase 연결 코드는 한 곳에서 관리합니다.
- 화면 컴포넌트는 가능한 한 데이터 형태에만 의존하게 만듭니다.

## 논의할 항목

- 주요 데이터 종류
- 컬렉션 이름
- 유저와 역할 구조
- 문서 id 생성 방식
- 필수 필드와 선택 필드
- 날짜 저장 방식
- 상태값 목록
- 더미 데이터 위치
- 화면별 필요한 데이터
- 실제 Firebase 구조와 더미 데이터 구조를 언제 맞출지
- 공통 이름 사전에 새 이름을 추가하는 승인 기준

## 공통 이름 사전

아래 이름은 기능 개발 중 같은 의미를 다르게 부르지 않기 위한 출발점입니다. 실제 DB 구조 확정은 별도 논의로 진행합니다.

### 컬렉션 이름

- `users`: 유저
- `companies`: 기업
- `jobPostings`: 채용공고
- `candidateProfiles`: 지원자 프로필
- `applications`: 지원서
- `scheduleConversations`: 일정 조율 챗봇 대화
- `availabilitySlots`: 면접 가능 시간
- `scheduleSuggestions`: 추천 면접 시간
- `interviews`: 확정 또는 진행 중인 면접
- `interviewQuestionSets`: 면접 질문 세트
- `interviewQuestions`: 면접 질문
- `evaluations`: 면접 평가
- `evaluationCriteria`: 평가 기준

### 공통 필드 이름

- `id`: 문서 또는 항목 식별자
- `userId`: 유저 식별자
- `candidateId`: 지원자 식별자
- `recruiterId`: 채용담당자 식별자
- `interviewerId`: 면접관 식별자
- `companyId`: 기업 식별자
- `jobPostingId`: 채용공고 식별자
- `applicationId`: 지원서 식별자
- `interviewId`: 면접 식별자
- `conversationId`: 일정 조율 대화 식별자
- `questionSetId`: 질문 세트 식별자
- `status`: 상태값
- `title`: 제목
- `description`: 설명
- `startedAt`: 시작 시각
- `endedAt`: 종료 시각
- `scheduledAt`: 확정 시각
- `source`: 생성 또는 판단 근거
- `createdAt`: 생성 시각
- `updatedAt`: 수정 시각

### 과업별 공통 필드 이름

#### 일정 조율 자동화

- `availableStartAt`: 가능한 시작 시각
- `availableEndAt`: 가능한 종료 시각
- `preferredStartAt`: 선호 시작 시각
- `preferredEndAt`: 선호 종료 시각
- `suggestedStartAt`: 추천 시작 시각
- `suggestedEndAt`: 추천 종료 시각
- `confirmedStartAt`: 확정 시작 시각
- `confirmedEndAt`: 확정 종료 시각
- `recommendationReason`: 추천 이유
- `priorityScore`: 추천 우선순위 점수
- `message`: 챗봇 대화 메시지
- `senderRole`: 메시지 작성자 역할

#### 면접 질문 및 평가

- `resumeSummary`: 이력서 요약
- `portfolioSummary`: 포트폴리오 요약
- `questionText`: 질문 내용
- `questionType`: 질문 유형
- `questionIntent`: 질문 의도
- `evaluationItem`: 평가 항목
- `score`: 점수
- `comment`: 평가 의견

#### UX/UI 개선

- UX/UI 개선 작업은 기본적으로 새 DB 이름을 만들지 않습니다.
- 화면 상태 저장이나 사용자 피드백 데이터가 필요할 때만 공통 이름 사전에 추가합니다.

#### 프로젝트 조건 입력

- `projectType`: 프로젝트 유형
- `budgetRange`: 예산 범위
- `duration`: 예상 기간
- `implementationScope`: 구현 하고자 하는 기능
- `requiredSkills`: 필요 기술
- `requiredHeadcount`: 필요 인력 수
- `startDate`: 프로젝트 시작 시기
- `workMode`: 근무 또는 협업 방식
- `matchingRequest`: 매칭 요청 내용

### 역할 값

- `candidate`: 지원자
- `recruiter`: 채용담당자
- `interviewer`: 면접관

### 상태값 초안

- `draft`: 초안
- `submitted`: 제출됨
- `pending`: 대기 중
- `proposed`: 제안됨
- `confirmed`: 확정됨
- `declined`: 거절됨
- `scheduled`: 일정 확정
- `generated`: 자동 생성됨
- `selected`: 선택됨
- `completed`: 완료
- `cancelled`: 취소됨

## 데이터 모델 초안

아래는 논의 출발점입니다. 실제 서비스 기획에 맞게 수정합니다.

### users

- `id`
- `name`
- `role`
- `title`
- `createdAt`
- `updatedAt`

### candidateProfiles

- `id`
- `userId`
- `email`
- `phone`
- `position`
- `resumeSummary`
- `portfolioSummary`
- `availableTimes`
- `createdAt`
- `updatedAt`

### applications

- `id`
- `candidateId`
- `jobPostingId`
- `status`
- `interviewerId`
- `createdAt`
- `updatedAt`

### scheduleConversations

- `id`
- `applicationId`
- `candidateId`
- `recruiterId`
- `status`
- `message`
- `senderRole`
- `createdAt`
- `updatedAt`

### availabilitySlots

- `id`
- `userId`
- `applicationId`
- `availableStartAt`
- `availableEndAt`
- `status`
- `createdAt`
- `updatedAt`

### scheduleSuggestions

- `id`
- `applicationId`
- `suggestedStartAt`
- `suggestedEndAt`
- `recommendationReason`
- `priorityScore`
- `status`
- `createdAt`
- `updatedAt`

### interviews

- `id`
- `applicationId`
- `candidateId`
- `interviewerId`
- `confirmedStartAt`
- `confirmedEndAt`
- `status`
- `createdAt`
- `updatedAt`

### interviewQuestionSets

- `id`
- `applicationId`
- `interviewId`
- `questions`
- `source`
- `status`
- `createdAt`
- `updatedAt`

### interviewQuestions

- `id`
- `questionSetId`
- `questionText`
- `questionType`
- `questionIntent`
- `source`
- `createdAt`
- `updatedAt`

### evaluationCriteria

- `id`
- `jobPostingId`
- `evaluationItem`
- `description`
- `createdAt`
- `updatedAt`

### jobPostings

- `id`
- `companyId`
- `recruiterId`
- `title`
- `description`
- `projectType`
- `budgetRange`
- `duration`
- `implementationScope`
- `requiredSkills`
- `requiredHeadcount`
- `startDate`
- `workMode`
- `matchingRequest`
- `status`
- `createdAt`
- `updatedAt`

### evaluations

- `id`
- `applicationId`
- `interviewId`
- `interviewerId`
- `score`
- `status`
- `comment`
- `createdAt`
- `updatedAt`

## 최종 결정

- 주요 컬렉션: 공통 이름 사전의 컬렉션 이름을 초안으로 사용
- 역할 기준: `candidate`, `recruiter`, `interviewer`
- 필드명 규칙: 영어 `camelCase`
- 날짜 저장 방식: 문자열 또는 Firebase Timestamp 중 하나로 통일
- 상태값 기준: 자유 텍스트가 아니라 정해진 값만 사용
- 더미 데이터 기준: 기능 검증에 필요한 최소만 작성
- DB 연결 기준: 화면 컴포넌트와 데이터 접근 코드를 분리하고 Firebase 연결 코드는 한 곳에서 관리
- 공통 이름 사전 기준: 새 컬렉션, 필드, 상태값, 역할 값은 구현 전에 이 문서에 먼저 추가

## 변경 이력

- 2026-05-29: SPA와 역할 기반 데이터 기준 반영
- 2026-05-29: 기본 데이터 기준을 최종 결정에 반영
- 2026-05-29: 공통 이름 사전과 데이터 이름 추가 절차 반영
- 2026-05-29: 일정 조율, 면접 질문 생성, 평가 과업에 필요한 공통 이름 보강
