import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Home,
  Languages,
  Moon,
  Phone,
  RefreshCw,
  Search,
  Sun,
  Users,
  UsersRound,
} from "lucide-react";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { firebaseApp, firebaseDb, isFirebaseConfigured } from "./lib/firebase";
import { FreelancerRegisterPage } from "./pages/FreelancerRegisterPage";
import { getCompanies, getCompanySupport, type Company, type CompanySupportGuide, type SupportGuideCardType, type Warranty, type WarrantyIssue } from "./services/companySupport";

type SignupRole = "company" | "engineer";
type UserRole = "candidate" | "recruiter" | "admin";
type View = "select" | "login" | SignupRole;
type CandidateStatus = "hired" | "pending";
type RecruiterView = "project" | "matched" | "warranty";
type MatchingStage = "selecting" | "requested" | "accepted" | "scheduling" | "confirmed" | "completed" | "failed";
type PipelineStage = "documentPassed" | "interviewing" | "finalPassed" | "rejected";
type Locale = "ko" | "en";
type Theme = "light" | "dark";

const pipelineStageOrder: PipelineStage[] = ["documentPassed", "interviewing", "finalPassed", "rejected"];

const pipelineStageLabelByLocale: Record<Locale, Record<PipelineStage, string>> = {
  ko: {
    documentPassed: "서류합격",
    interviewing: "면접중",
    finalPassed: "최종합격",
    rejected: "불합격",
  },
  en: {
    documentPassed: "Docs Passed",
    interviewing: "Interviewing",
    finalPassed: "Final Passed",
    rejected: "Rejected",
  },
};

const decisionLabelByLocale: Record<Locale, Record<string, string>> = {
  ko: { "만족": "만족", "불만족": "불만족" },
  en: { "만족": "Satisfied", "불만족": "Unsatisfied" },
};

const applicationsText: Record<Locale, {
  eyebrow: string;
  heading: string;
  lead: string;
  searchPlaceholder: string;
  totalApplicants: string;
  unit: string;
  finalPassedShort: string;
  inProgressShort: string;
  finalPassRateLabel: string;
  decisionSatisfactionLabel: string;
  applicantListTitle: string;
  allTab: string;
  colName: string;
  colDecision: string;
  colDecidedAt: string;
  colStage: string;
  emptyState: string;
  modalEmail: string;
  modalPhone: string;
  modalDecision: string;
  modalDecidedAt: string;
  modalStage: string;
  modalClose: string;
  hologramBadge: string;
  demoUrl: string;
  demoFooterText: string;
  demoCaption: string;
}> = {
  ko: {
    eyebrow: "RECRUITER DASHBOARD",
    heading: "인력지원현황",
    lead: "매칭 인력의 결정 여부와 채용 여부를 한눈에 확인하세요.",
    searchPlaceholder: "이름, 직무, 결정 검색",
    totalApplicants: "총 지원자",
    unit: "명",
    finalPassedShort: "최종합격",
    inProgressShort: "진행중",
    finalPassRateLabel: "최종합격률",
    decisionSatisfactionLabel: "결정 만족도",
    applicantListTitle: "지원자 목록",
    allTab: "전체",
    colName: "매칭인력",
    colDecision: "결정여부",
    colDecidedAt: "결정일",
    colStage: "진행 단계",
    emptyState: "검색 조건에 맞는 지원자가 없습니다.",
    modalEmail: "이메일",
    modalPhone: "연락처",
    modalDecision: "결정 여부",
    modalDecidedAt: "결정일",
    modalStage: "진행 단계",
    modalClose: "닫기",
    hologramBadge: "● PORTFOLIO PREVIEW",
    demoUrl: "미리보기 · 프로토타입",
    demoFooterText: "PORTFOLIO PREVIEW",
    demoCaption: "실제 포트폴리오 링크 연동 예정 · 지금은 프로토타입입니다",
  },
  en: {
    eyebrow: "RECRUITER DASHBOARD",
    heading: "Candidate Pipeline",
    lead: "See decision status and hiring stage for matched candidates at a glance.",
    searchPlaceholder: "Search by name, role, decision",
    totalApplicants: "Total Applicants",
    unit: "",
    finalPassedShort: "Final passed",
    inProgressShort: "In progress",
    finalPassRateLabel: "Final Pass Rate",
    decisionSatisfactionLabel: "Decision Satisfaction",
    applicantListTitle: "Candidate List",
    allTab: "All",
    colName: "Candidate",
    colDecision: "Decision",
    colDecidedAt: "Decided On",
    colStage: "Stage",
    emptyState: "No candidates match your search.",
    modalEmail: "Email",
    modalPhone: "Phone",
    modalDecision: "Decision",
    modalDecidedAt: "Decided On",
    modalStage: "Stage",
    modalClose: "Close",
    hologramBadge: "● PORTFOLIO PREVIEW",
    demoUrl: "Preview · Prototype",
    demoFooterText: "PORTFOLIO PREVIEW",
    demoCaption: "Real portfolio link coming soon · this is a prototype",
  },
};

type ProjectForm = {
  title: string;
  projectType: string;
  budgetRange: string;
  duration: string;
  implementationScope: string;
  requiredSkills: string;
  requiredHeadcount: string;
  startDate: string;
  workMode: string;
  matchingRequest: string;
};

const roleOptions = [
  {
    role: "company" as const,
    label: "기업 회원가입",
    description: "프로젝트 조건과 채용 정보를 등록하고 검증된 AI 엔지니어를 추천받습니다.",
    detail: "기업 · 채용 담당자",
    mark: "기",
  },
  {
    role: "engineer" as const,
    label: "AI 엔지니어 회원가입",
    description: "기술 스택과 프로젝트 경험을 등록하고 기업 매칭 기회를 확인합니다.",
    detail: "AI 개발자",
    mark: "A",
  },
];

const projectTypeOptions = ["AI 챗봇", "문서 자동화", "추천 시스템", "RAG 검색", "업무 자동화"];
const budgetOptions = ["500만원 미만", "500만-1,000만원", "1,000만-3,000만원", "3,000만원 이상"];
const durationOptions = ["2주 이내", "1개월", "2-3개월", "3개월 이상"];
const headcountOptions = ["1명", "2명", "3명", "4명 이상"];
const startDateOptions = ["즉시", "2주 이내", "1개월 이내", "협의 가능"];
const workModeOptions = ["원격", "하이브리드", "상주 협업", "협의 가능"];

const initialProjectForm: ProjectForm = {
  title: "",
  projectType: "AI 챗봇",
  budgetRange: "1,000만-3,000만원",
  duration: "2-3개월",
  implementationScope: "",
  requiredSkills: "",
  requiredHeadcount: "1명",
  startDate: "즉시",
  workMode: "원격",
  matchingRequest: "",
};

const projectSidebarItems = [
  { id: "project" as const, label: "프로젝트 입력" },
  { id: "matched" as const, label: "매칭된 인재" },
  { id: "warranty" as const, label: "보증 현황" },
];

const recommendedDevelopers = [
  {
    name: "김하린",
    title: "RAG · 문서 자동화",
    score: 94,
    meta: "React, Firebase, OpenAI API",
    experience: "5년차 AI 서비스 개발자",
    availability: "2주 이내 투입 가능",
    projectHistory: "사내 문서 검색 RAG, 고객센터 자동 응답, 계약서 요약 자동화",
    verification: "과제 검증 상위 8%",
  },
  {
    name: "박도윤",
    title: "AI 챗봇 · 업무 자동화",
    score: 91,
    meta: "LangChain, Node.js, Slack Bot",
    experience: "4년차 풀스택 개발자",
    availability: "즉시 투입 가능",
    projectHistory: "Slack 업무 자동화, FAQ 챗봇, 영업 리드 분류 자동화",
    verification: "과제 검증 상위 12%",
  },
  {
    name: "정서연",
    title: "추천 시스템 · 데이터 설계",
    score: 88,
    meta: "Python, 데이터 파이프라인, MVP",
    experience: "6년차 데이터 기반 제품 개발자",
    availability: "1개월 이내 투입 가능",
    projectHistory: "콘텐츠 추천 MVP, 사용자 행동 분석, 데이터 파이프라인 구축",
    verification: "과제 검증 상위 15%",
  },
];

const interviewTimeOptions = ["2026-08-12 10:00", "2026-08-12 14:00", "2026-08-13 11:00"];

const candidates = [
  {
    id: "app-001",
    name: "김선성",
    decision: "만족",
    decidedAt: "2026-06-28",
    stage: "finalPassed" as const,
    role: "RAG 서비스 개발자",
    email: "sunsung.kim@example.com",
    phone: "010-1234-5601",
    resumeSummary: "3년차 백엔드 개발자로 RAG 파이프라인 설계·운영 경험 보유",
    portfolioSummary: "RAG 기반 사내 검색 챗봇, 실시간 재고 문의 자동화 봇 등 프로덕션 배포 경험을 정리한 기술 블로그",
    portfolioHighlights: ["RAG 검색 챗봇 아키텍처 정리", "LangChain 파이프라인 최적화 후기", "벡터DB 성능 비교 실험"],
  },
  {
    id: "app-002",
    name: "최혜덕",
    decision: "불만족",
    decidedAt: "2026-06-28",
    stage: "rejected" as const,
    role: "AI 문서 자동화 개발자",
    email: "hyedeok.choi@example.com",
    phone: "010-2345-6702",
    resumeSummary: "문서 자동화 및 사내 검색 서비스 개발 경험 3년",
    portfolioSummary: "문서 자동화 파이프라인과 OCR·LLM 연동 사례를 정리한 기술 블로그",
    portfolioHighlights: ["OCR+LLM 문서 요약 파이프라인", "사내 검색 인덱싱 구조 개선기", "문서 자동화 배포 회고"],
  },
  {
    id: "app-003",
    name: "박윤채",
    decision: "만족",
    decidedAt: "2026-06-28",
    stage: "interviewing" as const,
    role: "LLM 백엔드 개발자",
    email: "yunchae.park@example.com",
    phone: "010-3456-7803",
    resumeSummary: "LLM 서빙 인프라 구축과 대규모 트래픽 최적화 경험",
    portfolioSummary: "LLM 서빙 인프라 최적화와 대규모 트래픽 대응 경험을 다룬 기술 블로그",
    portfolioHighlights: ["vLLM 서빙 레이턴시 튜닝", "오토스케일링 아키텍처 설계", "GPU 비용 최적화 사례"],
  },
  {
    id: "app-004",
    name: "이현수",
    decision: "만족",
    decidedAt: "2026-06-28",
    stage: "documentPassed" as const,
    role: "프롬프트 엔지니어",
    email: "hyunsoo.lee@example.com",
    phone: "010-4567-8904",
    resumeSummary: "프롬프트 설계 및 평가 자동화 파이프라인 구축 경험",
    portfolioSummary: "프롬프트 엔지니어링과 평가 자동화 노하우를 공유하는 기술 블로그",
    portfolioHighlights: ["프롬프트 A/B 테스트 프레임워크", "LLM 응답 품질 자동 평가", "few-shot 예제 선별 전략"],
  },
];

type AdminQueueKey = "engineers" | "companies" | "matching" | "warranties";
type AdminStatus = "new" | "reviewing" | "waiting" | "done" | "blocked";

type AdminQueueItem = {
  id: string;
  queue: AdminQueueKey;
  primary: string;
  secondary: string;
  owner: string;
  submittedAt: string;
  status: AdminStatus;
  summary: string;
  details: { label: string; value: string }[];
  actions: string[];
};

const adminQueueTabs: { key: AdminQueueKey; label: string; description: string }[] = [
  { key: "engineers", label: "엔지니어 제출", description: "AI 엔지니어가 제출한 등록 정보" },
  { key: "companies", label: "기업 요청", description: "기업이 입력한 프로젝트 조건" },
  { key: "matching", label: "매칭 관리", description: "기업과 엔지니어 연결 상태" },
  { key: "warranties", label: "보증 요청", description: "매칭 이후 보증 처리 요청" },
];

const adminStatusMeta: Record<AdminStatus, { label: string; styleKey: "infoBadge" | "warningBadge" | "hiredBadge" | "rejectedBadge" }> = {
  new: { label: "신규", styleKey: "infoBadge" },
  reviewing: { label: "검토 중", styleKey: "warningBadge" },
  waiting: { label: "응답 대기", styleKey: "warningBadge" },
  done: { label: "처리 완료", styleKey: "hiredBadge" },
  blocked: { label: "확인 필요", styleKey: "rejectedBadge" },
};

const adminQueueItems: AdminQueueItem[] = [
  {
    id: "engineer-001",
    queue: "engineers",
    primary: "김하린",
    secondary: "RAG · 문서 자동화 AI 엔지니어",
    owner: "운영팀",
    submittedAt: "2026-08-11 10:20",
    status: "new",
    summary: "Python, FastAPI, LangChain 기반 RAG 구축 경험과 2주 이내 투입 가능 조건을 제출했습니다.",
    details: [
      { label: "이메일", value: "harin.kim@example.com" },
      { label: "주요 기술", value: "Python, FastAPI, LangChain, React" },
      { label: "경력", value: "5년" },
      { label: "희망 보수", value: "400~500만원" },
      { label: "가능 일정", value: "2주 후" },
      { label: "검증 상태", value: "과제 배정 필요" },
    ],
    actions: ["검토 중으로 변경", "과제 배정", "반려"],
  },
  {
    id: "company-001",
    queue: "companies",
    primary: "넥스트리테일",
    secondary: "고객센터 RAG 챗봇 구축",
    owner: "채용 담당자",
    submittedAt: "2026-08-11 10:35",
    status: "reviewing",
    summary: "FAQ, 주문, 환불 문서를 기반으로 고객센터 응답 자동화가 가능한 AI 엔지니어 매칭을 요청했습니다.",
    details: [
      { label: "담당자 이메일", value: "recruiter@next-retail.example" },
      { label: "프로젝트 유형", value: "RAG 검색 · AI 챗봇" },
      { label: "예산", value: "1,000만-3,000만원" },
      { label: "기간", value: "2-3개월" },
      { label: "필요 인원", value: "1명" },
      { label: "근무 방식", value: "원격" },
    ],
    actions: ["매칭 후보 찾기", "기업 정보 보완 요청", "보류"],
  },
  {
    id: "matching-001",
    queue: "matching",
    primary: "넥스트리테일 ↔ 김하린",
    secondary: "인터뷰 일정 조율 중",
    owner: "매칭 매니저",
    submittedAt: "2026-08-11 11:10",
    status: "waiting",
    summary: "기업이 매칭 신청을 보냈고 엔지니어 수락 이후 인터뷰 후보 일정을 조율해야 합니다.",
    details: [
      { label: "기업", value: "넥스트리테일" },
      { label: "엔지니어", value: "김하린" },
      { label: "현재 단계", value: "일정 조율 중" },
      { label: "인터뷰 후보", value: "2026-08-12 10:00, 2026-08-12 14:00" },
      { label: "다음 처리", value: "양쪽 일정 확정" },
      { label: "불발 시", value: "새 후보 추천" },
    ],
    actions: ["인터뷰 확정", "쪽지 보내기", "매칭 불발"],
  },
  {
    id: "warranty-001",
    queue: "warranties",
    primary: "알파제조",
    secondary: "대체 인력 보증 요청",
    owner: "보증 담당자",
    submittedAt: "2026-08-11 11:40",
    status: "blocked",
    summary: "기존 매칭 인력의 투입 일정 지연으로 대체 후보 확인과 보증 적용 가능 여부 검토가 필요합니다.",
    details: [
      { label: "회사명", value: "알파제조" },
      { label: "매칭 인재", value: "박도윤" },
      { label: "요청 사유", value: "투입 일정 지연" },
      { label: "잔여 보증", value: "2회" },
      { label: "희망 처리", value: "48시간 내 대체 후보 안내" },
      { label: "필요 확인", value: "계약 보증 조건 확인" },
    ],
    actions: ["처리 중으로 변경", "대체 후보 배정", "처리 완료"],
  },
];

type StatusLevel = "good" | "info" | "warning" | "neutral";

const warrantyPeriod = { startedAt: "2026-06-28", endsAt: "2027-06-28" };
const warrantyUsage = { used: 0, total: 3 };

const warrantyItems = [
  {
    id: "warranty-period",
    category: "보증 기간",
    coverage: "완료일로부터 12개월",
    status: "good" as const,
    statusLabel: "활성",
    note: "2027-06-28까지",
  },
  {
    id: "warranty-count",
    category: "보증 횟수",
    coverage: "잔여 3회 / 총 3회",
    status: "warning" as const,
    statusLabel: "대기",
    note: "기술 지원 가능",
  },
  {
    id: "replacement-pool",
    category: "대체 인력",
    coverage: "예비 개발자 Pool 2명",
    status: "info" as const,
    statusLabel: "준비",
    note: "상시 투입 가능",
  },
  {
    id: "emergency-response",
    category: "긴급 대응",
    coverage: "48시간 이내 투입",
    status: "good" as const,
    statusLabel: "정상",
    note: "매뉴얼 구축 완료",
  },
];

const recruiterWarrantySteps = [
  { title: "대시보드 확인", description: "보증 현황 표에서 이슈 항목과 잔여 보증 횟수를 확인합니다." },
  { title: "보증 실행 요청", description: "담당 PM에게 보증 실행을 요청하고 이슈 내용을 전달합니다." },
  { title: "대체 개발자 투입", description: "예비 인력 Pool에서 후보자를 매칭해 인수인계를 진행합니다." },
];

const supportCardMetadata: Record<SupportGuideCardType, { icon: typeof Phone; title: string }> = {
  hotline: { icon: Phone, title: "긴급 호출" },
  replacement: { icon: RefreshCw, title: "교체 프로세스" },
  documents: { icon: FileText, title: "관련 문서" },
  checklist: { icon: ClipboardCheck, title: "체크리스트" },
};

const issueHistory = [
  {
    id: "issue-001",
    date: "2026-06-28",
    issue: "초기 세팅 오류",
    owner: "팀장",
    status: "good" as const,
    statusLabel: "완료",
    action: "패치 배포 완료",
  },
  {
    id: "issue-002",
    date: "-",
    issue: "-",
    owner: "-",
    status: "warning" as const,
    statusLabel: "대기",
    action: "-",
  },
  {
    id: "issue-003",
    date: "-",
    issue: "-",
    owner: "-",
    status: "neutral" as const,
    statusLabel: "미발생",
    action: "-",
  },
];

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash);

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  if (route === "#applications") {
    return <ApplicationStatusPage />;
  }

  if (route === "#company-support") {
    return <RecruiterProjectInputPage initialView="warranty" />;
  }

  if (route === "#freelancer-register") {
    return <FreelancerRegisterPage />;
  }

  if (route === "#recruiter-project-input") {
    return <RecruiterProjectInputPage />;
  }

  return <SignupPage />;
}

function SignupPage() {
  const [view, setView] = useState<View>(() => {
    if (window.location.hash === "#company-signup") return "company";
    if (window.location.hash === "#engineer-signup") return "engineer";
    if (window.location.hash === "#login") return "login";
    return "select";
  });

  useEffect(() => {
    const syncView = () => {
      if (window.location.hash === "#company-signup") setView("company");
      if (window.location.hash === "#engineer-signup") setView("engineer");
      if (window.location.hash === "#login") setView("login");
      if (window.location.hash === "#signup" || window.location.hash === "") setView("select");
    };

    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  const activeTitle = useMemo(() => {
    if (view === "company") return "기업 회원가입";
    if (view === "engineer") return "AI 엔지니어 회원가입";
    if (view === "login") return "로그인";
    return "회원가입";
  }, [view]);

  const openSignup = (role: SignupRole) => {
    setView(role);
    window.history.replaceState(null, "", `#${role}-signup`);
  };

  const goSelect = () => {
    setView("select");
    window.history.replaceState(null, "", "#signup");
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.logo} aria-label="결브릿지 홈">
          <span style={styles.logoMark}>결</span>
          <span style={styles.logoText}>결브릿지</span>
        </a>
        <span style={styles.headerText}>Verified AI Talent Network</span>
      </header>

      <section style={styles.content}>
        {view === "select" ? null : (
          <div style={styles.intro}>
            <h1 style={styles.heading}>
              {activeTitle}으로,
              <br />
              필요한 정보만 빠르게 등록하세요.
            </h1>
          </div>
        )}

        <section style={styles.panel} aria-labelledby="signup-title">
          {view === "select" ? <SignupSelect onSelect={openSignup} /> : null}
          {view === "login" ? <GoogleLoginPanel onBack={goSelect} /> : null}
          {view === "company" || view === "engineer" ? <GoogleSignupPanel role={view} onBack={goSelect} /> : null}
        </section>
      </section>

      <footer style={styles.footer}>© 2026 결브릿지. All rights reserved.</footer>
    </main>
  );
}

function SignupSelect({ onSelect }: { onSelect: (role: SignupRole) => void }) {
  return (
    <>
      <div style={styles.panelHeader}>
        <p style={styles.panelEyebrow}>WELCOME TO GYEOL-BRIDGE</p>
        <h2 id="signup-title" style={styles.panelTitle}>회원가입</h2>
        <p style={styles.panelDescription}>가입할 유형을 선택하면 해당 가입 페이지로 바로 이동합니다.</p>
      </div>

      <div style={styles.roleList}>
        {roleOptions.map(({ role, label, description, detail, mark }) => (
          <button key={role} type="button" onClick={() => onSelect(role)} style={styles.roleButton}>
            <span style={styles.iconBox}>{mark}</span>
            <span style={styles.roleCopy}>
              <span style={styles.roleLabel}>{label}</span>
              <span style={styles.roleDescription}>{description}</span>
              <span style={styles.roleDetail}>{detail}</span>
            </span>
            <span style={styles.arrow} aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      <p style={styles.loginPrompt}>
        이미 계정이 있나요? <a href="#login" style={styles.loginLink}>로그인</a>
      </p>
    </>
  );
}

function GoogleLoginPanel({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startGoogleLogin = async () => {
    setMessage("");

    if (!firebaseApp || !firebaseDb || !isFirebaseConfigured) {
      setMessage("Firebase 설정이 없어 Google 로그인을 실행할 수 없습니다.");
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userSnapshot = await getDoc(doc(firebaseDb, "users", result.user.uid));

      if (!userSnapshot.exists()) {
        setMessage("가입 정보가 없습니다. 먼저 기업 또는 AI 엔지니어 회원가입을 진행해 주세요.");
        return;
      }

      const role = userSnapshot.data().role as UserRole | undefined;

      if (role === "admin") {
        window.location.hash = "#applications";
        return;
      }

      if (role === "recruiter") {
        window.location.hash = "#recruiter-project-input";
        return;
      }

      if (role === "candidate") {
        window.location.hash = "#freelancer-register";
        return;
      }

      setMessage("회원 유형을 확인할 수 없습니다. 다시 가입해 주세요.");
    } catch {
      setMessage("Google 로그인이 완료되지 않았습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={onBack} style={styles.backButton}>
        ← 회원가입 화면으로 돌아가기
      </button>

      <div style={styles.panelHeader}>
        <p style={styles.panelEyebrow}>GOOGLE LOGIN</p>
        <h2 id="signup-title" style={styles.panelTitle}>로그인</h2>
        <p style={styles.panelDescription}>가입한 Google 계정으로 로그인하면 회원 유형에 맞는 화면으로 이동합니다.</p>
      </div>

      <div style={styles.googleSignupBox}>
        <span style={styles.googleRoleBadge}>기존 회원</span>
        <p style={styles.googleSignupText}>기업 회원은 프로젝트 입력 화면으로, AI 엔지니어 회원은 프리랜서 등록 화면으로 이동합니다.</p>
        <button type="button" style={styles.googleButton} onClick={startGoogleLogin} disabled={isLoading}>
          <span style={styles.googleMark}>G</span>
          {isLoading ? "Google 로그인 진행 중" : "Google 계정으로 로그인"}
        </button>
        {message ? <p style={styles.errorMessage}>{message}</p> : null}
      </div>
    </>
  );
}

function GoogleSignupPanel({ role, onBack }: { role: SignupRole; onBack: () => void }) {
  const isCompany = role === "company";
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nextHash = isCompany ? "#recruiter-project-input" : "#freelancer-register";
  const userRole: UserRole = isCompany ? "recruiter" : "candidate";

  const startGoogleSignup = async () => {
    setMessage("");

    if (!firebaseApp || !firebaseDb || !isFirebaseConfigured) {
      setMessage("Firebase 설정이 없어 Google 가입을 실행할 수 없습니다.");
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(firebaseDb, "users", result.user.uid);
      const userSnapshot = await getDoc(userRef);
      await setDoc(
        userRef,
        {
          id: result.user.uid,
          name: result.user.displayName ?? "",
          email: result.user.email ?? "",
          role: userRole,
          updatedAt: serverTimestamp(),
          ...(userSnapshot.exists() ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true },
      );
      window.location.hash = nextHash;
    } catch {
      setMessage("Google 가입 정보 저장이 완료되지 않았습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={onBack} style={styles.backButton}>
        ← 가입 유형 다시 선택
      </button>

      <div style={styles.panelHeader}>
        <p style={styles.panelEyebrow}>{isCompany ? "COMPANY SIGNUP" : "AI ENGINEER SIGNUP"}</p>
        <h2 id="signup-title" style={styles.panelTitle}>
          {isCompany ? "기업 회원 Google 가입" : "AI 엔지니어 회원 Google 가입"}
        </h2>
        <p style={styles.panelDescription}>
          {isCompany
            ? "기업 계정으로 가입하면 프로젝트 입력 화면으로 이동합니다."
            : "AI 엔지니어 계정으로 가입하면 프리랜서 등록 화면으로 이동합니다."}
        </p>
      </div>

      <div style={styles.googleSignupBox}>
        <span style={styles.googleRoleBadge}>{isCompany ? "기업 회원" : "AI 엔지니어 회원"}</span>
        <p style={styles.googleSignupText}>Google 계정으로 빠르게 가입하고 다음 단계로 이동하세요.</p>
        <button type="button" style={styles.googleButton} onClick={startGoogleSignup} disabled={isLoading}>
          <span style={styles.googleMark}>G</span>
          {isLoading ? "Google 가입 진행 중" : "Google 계정으로 가입하기"}
        </button>
        {message ? <p style={styles.errorMessage}>{message}</p> : null}
      </div>

      <p style={styles.notice}>
        계속 진행하면 결브릿지의 <a href="#terms" style={styles.link}>이용약관</a> 및 <a href="#privacy" style={styles.link}>개인정보 처리방침</a>에 동의하게 됩니다.
      </p>
    </>
  );
}

function RecruiterProjectInputPage({ initialView = "project" }: { initialView?: RecruiterView }) {
  const [projectForm, setProjectForm] = useState<ProjectForm>(initialProjectForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeView, setActiveView] = useState<RecruiterView>(initialView);
  const [userEmail, setUserEmail] = useState("로그인 계정 확인 중");

  useEffect(() => {
    if (!firebaseApp) {
      setUserEmail("Firebase 설정 필요");
      return undefined;
    }

    const auth = getAuth(firebaseApp);
    return onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? "로그인 정보 없음");
    });
  }, []);

  const isProjectReady = useMemo(
    () =>
      Boolean(
        projectForm.title.trim() &&
          projectForm.implementationScope.trim() &&
          projectForm.requiredSkills.trim() &&
          projectForm.matchingRequest.trim(),
      ),
    [projectForm],
  );

  const updateProjectForm = (field: keyof ProjectForm, value: string) => {
    setProjectForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8f6] text-[#17221f]">
      <header className="flex h-20 w-full items-center justify-between border-b border-[#e3e8e4] px-5 md:px-8">
        <a href="#signup" className="inline-flex items-center gap-3 text-[#17221f] no-underline" aria-label="결브릿지 홈">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#b91c1c] text-base font-black text-white shadow-sm">결</span>
          <span className="text-[22px] font-black tracking-normal">결브릿지</span>
        </a>
        <a href="#signup" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[#dce4df] bg-white px-4 text-sm font-bold text-[#42534c] no-underline">
          홈으로
        </a>
      </header>

      <RecruiterProjectInput
        form={projectForm}
        isReady={isProjectReady}
        isSubmitted={isSubmitted}
        activeView={activeView}
        userEmail={userEmail}
        onChange={updateProjectForm}
        onSubmit={() => {
          setIsSubmitted(true);
          setActiveView("matched");
        }}
        onNavigate={setActiveView}
      />
    </main>
  );
}

function RecruiterProjectInput({
  form,
  isReady,
  isSubmitted,
  activeView,
  userEmail,
  onChange,
  onSubmit,
  onNavigate,
}: {
  form: ProjectForm;
  isReady: boolean;
  isSubmitted: boolean;
  activeView: RecruiterView;
  userEmail: string;
  onChange: (field: keyof ProjectForm, value: string) => void;
  onSubmit: () => void;
  onNavigate: (view: RecruiterView) => void;
}) {
  return (
    <section className="mx-auto grid w-[min(1200px,calc(100%-32px))] flex-1 gap-5 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-[#dde5e0] bg-white p-4">
        <div className="mb-5 flex items-center gap-3 border-b border-[#e8ece9] pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[#fee2e2] text-[#b91c1c]">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-sm font-black">기업 회원 채용 담당자</p>
            <p className="m-0 truncate text-xs text-[#64706c]">{userEmail}</p>
          </div>
        </div>
        <p className="mb-3 mt-0 text-xs font-extrabold tracking-[0.08em] text-[#8b9691]">SECTION 3</p>
        <nav className="grid gap-2">
          {projectSidebarItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.id === "warranty") {
                    window.location.hash = "#company-support";
                  } else {
                    window.history.replaceState(null, "", "#recruiter-project-input");
                  }

                  onNavigate(item.id);
                }}
                className={
                  isActive
                    ? "flex h-11 cursor-pointer items-center rounded-md border border-[#b91c1c] bg-[#fff8f8] px-4 text-left text-sm font-black text-[#b91c1c]"
                    : "flex h-11 cursor-pointer items-center rounded-md border border-transparent bg-white px-4 text-left text-sm font-bold text-[#53615c] hover:bg-[#f8faf9]"
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        {activeView === "project" ? (
          <ProjectInputView form={form} isReady={isReady} onChange={onChange} onSubmit={onSubmit} />
        ) : null}
        {activeView === "matched" ? (
          <MatchedTalentView form={form} isSubmitted={isSubmitted} onBack={() => onNavigate("project")} />
        ) : null}
        {activeView === "warranty" ? <RecruiterWarrantyView /> : null}
      </div>
    </section>
  );
}

function ProjectInputView({
  form,
  isReady,
  onChange,
  onSubmit,
}: {
  form: ProjectForm;
  isReady: boolean;
  onChange: (field: keyof ProjectForm, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="mb-5 rounded-lg border border-[#dde5e0] bg-white p-5">
        <Badge className="mb-4 bg-[#fee2e2] text-[#b91c1c]">프로젝트 입력</Badge>
        <h1 className="m-0 text-2xl font-black leading-tight tracking-normal md:text-3xl">AI 엔지니어 매칭 요청</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53615c]">필요한 프로젝트 조건과 인재 요건을 입력하면 적합한 AI 엔지니어를 찾을 수 있습니다.</p>
      </div>

      <Card className="rounded-lg border-[#dde5e0] shadow-sm">
        <CardContent className="grid gap-6 p-5 md:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="제목/메뉴" value={form.title} placeholder="예: B2B SaaS AI 챗봇 MVP 개발" onChange={(value) => onChange("title", value)} />
            <SelectField label="프로젝트 유형" value={form.projectType} options={projectTypeOptions} onChange={(value) => onChange("projectType", value)} />
            <SelectField label="프로젝트 예산" value={form.budgetRange} options={budgetOptions} onChange={(value) => onChange("budgetRange", value)} />
            <SelectField label="프로젝트 예상 기간" value={form.duration} options={durationOptions} onChange={(value) => onChange("duration", value)} />
            <SelectField label="필요 인력 수" value={form.requiredHeadcount} options={headcountOptions} onChange={(value) => onChange("requiredHeadcount", value)} />
            <SelectField label="프로젝트 시작 시기" value={form.startDate} options={startDateOptions} onChange={(value) => onChange("startDate", value)} />
            <TextField label="필요 기술" value={form.requiredSkills} placeholder="예: React, Firebase, OpenAI API" onChange={(value) => onChange("requiredSkills", value)} />
            <SelectField label="협업 방식" value={form.workMode} options={workModeOptions} onChange={(value) => onChange("workMode", value)} />
          </div>

          <TextAreaField label="구현 하고자 하는 기능" value={form.implementationScope} placeholder="필요 기능, 현재 상황, 원하는 결과물을 구체적으로 적어주세요." onChange={(value) => onChange("implementationScope", value)} />
          <TextAreaField label="매칭 요청 내용" value={form.matchingRequest} placeholder="선호 경험, 투입 일정, 커뮤니케이션 방식 등 인재 조건을 적어주세요." onChange={(value) => onChange("matchingRequest", value)} />

          <div className="grid gap-4 border-t border-[#e8ece9] pt-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <FormStatus form={form} />
            <button type="button" disabled={!isReady} onClick={onSubmit} className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-[#b91c1c] px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#d8a0a0]">
              조건 저장 후 인재 찾기
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function RecruiterWarrantyView() {
  const remainingWarranty = warrantyUsage.total - warrantyUsage.used;
  const warrantyProgress = useMemo(() => {
    const start = new Date(warrantyPeriod.startedAt).getTime();
    const end = new Date(warrantyPeriod.endsAt).getTime();
    const ratio = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
    return Math.round(ratio * 100);
  }, []);
  const remainingDays = useMemo(() => {
    const end = new Date(warrantyPeriod.endsAt).getTime();
    return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
  }, []);

  return (
    <>
      <div className="mb-5 rounded-lg border border-[#dde5e0] bg-white p-5">
        <Badge className="mb-4 bg-[#fee2e2] text-[#b91c1c]">보증 현황</Badge>
        <h1 className="m-0 text-2xl font-black leading-tight tracking-normal md:text-3xl">매칭 이후 보증 관리</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53615c]">채용 이후 보증 지원 현황과 이슈 발생 시 대응 절차를 확인합니다.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg border-[#dde5e0] shadow-sm">
          <CardContent className="p-5">
            <p className="m-0 text-sm font-extrabold text-[#64706c]">잔여 보증 횟수</p>
            <p className="mb-0 mt-3 text-3xl font-black text-[#17221f]">{remainingWarranty}<span className="ml-1 text-base text-[#64706c]">회</span></p>
            <p className="mt-2 text-xs text-[#64706c]">총 {warrantyUsage.total}회 중 {warrantyUsage.used}회 사용</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-[#dde5e0] shadow-sm">
          <CardContent className="p-5">
            <p className="m-0 text-sm font-extrabold text-[#64706c]">보증 기간</p>
            <p className="mb-0 mt-3 text-2xl font-black text-[#17221f]">{remainingDays}일</p>
            <p className="mt-2 text-xs text-[#64706c]">{warrantyPeriod.endsAt}까지</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-[#dde5e0] shadow-sm">
          <CardContent className="p-5">
            <p className="m-0 text-sm font-extrabold text-[#64706c]">기간 경과율</p>
            <p className="mb-0 mt-3 text-2xl font-black text-[#17221f]">{warrantyProgress}%</p>
            <div className="mt-3 h-2 rounded-full bg-[#f3f4f6]">
              <div className="h-full rounded-full bg-[#b91c1c]" style={{ width: `${warrantyProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 rounded-lg border-[#dde5e0] shadow-sm">
        <CardContent className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-black tracking-normal">보증 항목</h2>
            <Badge className="bg-[#f1f5f9] text-[#42534c]">총 {warrantyItems.length}개</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e8ece9] bg-[#fbfcfb] text-left text-xs font-black text-[#64706c]">
                  <th className="p-3">구분</th>
                  <th className="p-3">보장 항목</th>
                  <th className="p-3">상태</th>
                  <th className="p-3">비고</th>
                </tr>
              </thead>
              <tbody>
                {warrantyItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#f0f2f1]">
                    <td className="p-3 font-extrabold text-[#17221f]">{item.category}</td>
                    <td className="p-3 text-[#53615c]">{item.coverage}</td>
                    <td className="p-3"><StatusDot level={item.status} label={item.statusLabel} /></td>
                    <td className="p-3 text-[#53615c]">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="rounded-lg border-[#dde5e0] shadow-sm">
          <CardContent className="p-5 md:p-6">
            <h2 className="m-0 text-xl font-black tracking-normal">이슈 발생 시 대응 절차</h2>
            <ol className="mt-5 grid gap-4 p-0">
              {recruiterWarrantySteps.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#fee2e2] text-sm font-black text-[#b91c1c]">{index + 1}</span>
                  <div>
                    <strong className="text-sm text-[#17221f]">{step.title}</strong>
                    <p className="mb-0 mt-1 text-sm leading-6 text-[#53615c]">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-[#dde5e0] shadow-sm">
          <CardContent className="p-5 md:p-6">
            <h2 className="m-0 text-xl font-black tracking-normal">이슈 이력</h2>
            <div className="mt-5 grid gap-3">
              {issueHistory.map((entry) => (
                <div key={entry.id} className="grid gap-2 rounded-md border border-[#e8ece9] bg-[#fbfcfb] p-4 md:grid-cols-[96px_1fr_auto] md:items-center">
                  <span className="text-xs font-extrabold text-[#8b9691]">{entry.date}</span>
                  <div>
                    <p className="m-0 text-sm font-black text-[#17221f]">{entry.issue}</p>
                    <p className="mb-0 mt-1 text-xs text-[#64706c]">{entry.action}</p>
                  </div>
                  <StatusDot level={entry.status} label={entry.statusLabel} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MatchedTalentView({
  form,
  isSubmitted,
  onBack,
}: {
  form: ProjectForm;
  isSubmitted: boolean;
  onBack: () => void;
}) {
  const [requestedDeveloper, setRequestedDeveloper] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [matchingStage, setMatchingStage] = useState<MatchingStage>("selecting");
  const [selectedInterviewTime, setSelectedInterviewTime] = useState<string | null>(null);
  const toggleWishlist = (name: string) => {
    setWishlist((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  };
  const requestMatching = (name: string) => {
    setRequestedDeveloper(name);
    setMatchingStage("requested");
    setSelectedInterviewTime(null);
  };

  if (!isSubmitted) {
    return (
      <Card className="rounded-lg border-[#dde5e0] shadow-sm">
        <CardContent className="grid gap-4 p-7">
          <Badge className="w-fit bg-[#fee2e2] text-[#b91c1c]">매칭된 인재</Badge>
          <h1 className="m-0 text-2xl font-black tracking-normal">아직 저장된 매칭 조건이 없습니다</h1>
          <p className="m-0 text-sm leading-6 text-[#53615c]">프로젝트 조건을 먼저 입력하면 적합한 AI 엔지니어 후보를 확인할 수 있습니다.</p>
          <button type="button" onClick={onBack} className="mt-2 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white">
            프로젝트 입력하기
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-5 rounded-lg border border-[#dde5e0] bg-white p-5">
        <Badge className="mb-4 bg-[#fee2e2] text-[#b91c1c]">매칭된 인재</Badge>
        <h1 className="m-0 text-2xl font-black leading-tight tracking-normal md:text-3xl">조건에 맞는 AI 엔지니어 후보</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53615c]">입력한 프로젝트 조건을 기준으로 검증된 후보를 비교하고 매칭을 신청할 수 있습니다.</p>
      </div>

      <Card className="mb-6 rounded-lg border-[#dde5e0] shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-4 md:p-6">
          <SummaryItem label="프로젝트" value={form.title || "미입력"} />
          <SummaryItem label="유형" value={form.projectType} />
          <SummaryItem label="예산" value={form.budgetRange} />
          <SummaryItem label="기간" value={form.duration} />
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-3 rounded-lg border border-[#dde5e0] bg-white p-5 md:grid-cols-4">
        <MatchingStep label="1" title="매칭 신청" active={matchingStage !== "selecting"} />
        <MatchingStep label="2" title="엔지니어 수락" active={["accepted", "scheduling", "confirmed", "completed"].includes(matchingStage)} />
        <MatchingStep label="3" title="일정 조율" active={["scheduling", "confirmed", "completed"].includes(matchingStage)} />
        <MatchingStep label="4" title="인터뷰 확정" active={["confirmed", "completed"].includes(matchingStage)} />
      </div>

      {requestedDeveloper ? (
        <MatchingProgressPanel
          developerName={requestedDeveloper}
          stage={matchingStage}
          selectedInterviewTime={selectedInterviewTime}
          onAccept={() => setMatchingStage("accepted")}
          onStartScheduling={() => setMatchingStage("scheduling")}
          onSelectTime={setSelectedInterviewTime}
          onConfirmInterview={() => setMatchingStage("confirmed")}
          onComplete={() => setMatchingStage("completed")}
          onFail={() => setMatchingStage("failed")}
          onFindAgain={() => {
            setRequestedDeveloper(null);
            setMatchingStage("selecting");
            setSelectedInterviewTime(null);
          }}
        />
      ) : null}

      <RecommendedDevelopers
        requestedDeveloper={requestedDeveloper}
        wishlist={wishlist}
        onRequest={requestMatching}
        onToggleWishlist={toggleWishlist}
      />
    </>
  );
}

function MatchingStep({ label, title, active = false }: { label: string; title: string; active?: boolean }) {
  return (
    <div className={active ? "flex items-center gap-3 rounded-md border border-[#fecaca] bg-[#fff7f7] p-3" : "flex items-center gap-3 rounded-md border border-[#e8ece9] bg-[#fbfcfb] p-3"}>
      <span className={active ? "grid h-7 w-7 place-items-center rounded-full bg-[#b91c1c] text-xs font-black text-white" : "grid h-7 w-7 place-items-center rounded-full bg-[#e8ece9] text-xs font-black text-[#64706c]"}>
        {label}
      </span>
      <span className={active ? "text-sm font-black text-[#b91c1c]" : "text-sm font-extrabold text-[#64706c]"}>{title}</span>
    </div>
  );
}

function MatchingProgressPanel({
  developerName,
  stage,
  selectedInterviewTime,
  onAccept,
  onStartScheduling,
  onSelectTime,
  onConfirmInterview,
  onComplete,
  onFail,
  onFindAgain,
}: {
  developerName: string;
  stage: MatchingStage;
  selectedInterviewTime: string | null;
  onAccept: () => void;
  onStartScheduling: () => void;
  onSelectTime: (time: string) => void;
  onConfirmInterview: () => void;
  onComplete: () => void;
  onFail: () => void;
  onFindAgain: () => void;
}) {
  const statusText: Record<MatchingStage, string> = {
    selecting: "인재 선택 중",
    requested: "엔지니어 수락 대기",
    accepted: "엔지니어 수락 완료",
    scheduling: "인터뷰 일정 조율 중",
    confirmed: "인터뷰 확정",
    completed: "매칭 완료",
    failed: "매칭 불발",
  };

  return (
    <Card className="mb-6 rounded-lg border-[#dde5e0] shadow-sm">
      <CardContent className="grid gap-5 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge className={stage === "failed" ? "mb-3 bg-[#f1f5f9] text-[#42534c]" : "mb-3 bg-[#fee2e2] text-[#b91c1c]"}>{statusText[stage]}</Badge>
            <h2 className="m-0 text-xl font-black tracking-normal">{developerName} 님과의 매칭 진행</h2>
            <p className="mt-2 text-sm leading-6 text-[#53615c]">실제 서비스에서는 이 영역이 엔지니어 수락, 쪽지, 인터뷰 일정 합의 기록으로 연결됩니다.</p>
          </div>
          {stage === "failed" ? (
            <button type="button" onClick={onFindAgain} className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white">
              새 인재 찾기
            </button>
          ) : null}
        </div>

        {stage === "requested" ? (
          <div className="grid gap-3 rounded-md border border-[#e8ece9] bg-[#fbfcfb] p-4">
            <p className="m-0 text-sm font-bold text-[#42534c]">요청을 보냈습니다. 엔지니어가 수락하면 일정 조율을 시작할 수 있습니다.</p>
            <button type="button" onClick={onAccept} className="inline-flex h-10 w-fit cursor-pointer items-center justify-center rounded-md border border-[#bbf7d0] bg-[#dcfce7] px-4 text-sm font-extrabold text-[#166534]">
              엔지니어 수락 처리
            </button>
          </div>
        ) : null}

        {stage === "accepted" ? (
          <div className="grid gap-3 rounded-md border border-[#e8ece9] bg-[#fbfcfb] p-4">
            <p className="m-0 text-sm font-bold text-[#42534c]">엔지니어가 매칭 요청을 수락했습니다. 인터뷰 후보 시간을 제안하세요.</p>
            <button type="button" onClick={onStartScheduling} className="inline-flex h-10 w-fit cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white">
              일정 조율 시작
            </button>
          </div>
        ) : null}

        {stage === "scheduling" ? (
          <div className="grid gap-4 rounded-md border border-[#e8ece9] bg-[#fbfcfb] p-4">
            <p className="m-0 text-sm font-bold text-[#42534c]">양쪽이 가능한 시간을 고르는 단계입니다. 현재는 기업이 후보 시간을 선택하는 데모입니다.</p>
            <div className="flex flex-wrap gap-2">
              {interviewTimeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onSelectTime(time)}
                  className={
                    selectedInterviewTime === time
                      ? "inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-[#fecaca] bg-[#fff7f7] px-4 text-sm font-extrabold text-[#b91c1c]"
                      : "inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-4 text-sm font-bold text-[#42534c]"
                  }
                >
                  {time}
                </button>
              ))}
            </div>
            <button type="button" disabled={!selectedInterviewTime} onClick={onConfirmInterview} className="inline-flex h-10 w-fit cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#d8a0a0]">
              선택한 시간으로 인터뷰 확정
            </button>
          </div>
        ) : null}

        {stage === "confirmed" ? (
          <div className="grid gap-3 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] p-4">
            <p className="m-0 text-sm font-black text-[#166534]">인터뷰 일정 확정: {selectedInterviewTime}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onComplete} className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white">
                매칭 완료
              </button>
              <button type="button" onClick={onFail} className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-4 text-sm font-extrabold text-[#42534c]">
                매칭 불발
              </button>
            </div>
          </div>
        ) : null}

        {stage === "completed" ? (
          <div className="rounded-md border border-[#bbf7d0] bg-[#f0fdf4] p-4">
            <p className="m-0 text-sm font-black text-[#166534]">매칭이 완료되었습니다. 이후 보증 현황에서 진행 상태를 관리할 수 있습니다.</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-extrabold text-[#8b9691]">{label}</span>
      <span className="truncate text-sm font-black text-[#17221f]">{value}</span>
    </div>
  );
}

function FormStatus({ form }: { form: ProjectForm }) {
  return (
    <div className="grid gap-2 text-sm text-[#64706c] sm:grid-cols-3">
      <StatusChip icon={<FileText className="h-4 w-4" />} label="프로젝트" done={Boolean(form.title && form.implementationScope)} />
      <StatusChip icon={<CircleDollarSign className="h-4 w-4" />} label="예산·기간" done={Boolean(form.budgetRange && form.duration)} />
      <StatusChip icon={<UsersRound className="h-4 w-4" />} label="인력 조건" done={Boolean(form.requiredSkills && form.requiredHeadcount)} />
    </div>
  );
}

function RecommendedDevelopers({
  requestedDeveloper,
  wishlist,
  onRequest,
  onToggleWishlist,
}: {
  requestedDeveloper: string | null;
  wishlist: string[];
  onRequest: (name: string) => void;
  onToggleWishlist: (name: string) => void;
}) {
  const [selectedDeveloper, setSelectedDeveloper] = useState<(typeof recommendedDevelopers)[number] | null>(null);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="m-0 text-xl font-black tracking-normal">매칭된 인재</h2>
        <Badge className="bg-[#f1f5f9] text-[#42534c]">추천 3명</Badge>
      </div>
      {requestedDeveloper ? (
        <div className="mb-4 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
          <p className="m-0 text-sm font-black text-[#166534]">매칭 요청 보냄</p>
          <p className="mb-0 mt-1 text-xs leading-5 text-[#3f6b4f]">{requestedDeveloper} 님의 수락을 기다리는 중입니다. 수락 후 쪽지와 일정 조율 단계로 이어집니다.</p>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {recommendedDevelopers.map((developer) => (
          <Card key={developer.name} className="rounded-lg border-[#dde5e0]">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <button type="button" onClick={() => setSelectedDeveloper(developer)} className="m-0 cursor-pointer border-0 bg-transparent p-0 text-left text-base font-black text-[#17221f] underline-offset-4 hover:text-[#b91c1c] hover:underline">
                    {developer.name}
                  </button>
                  <p className="mt-1 text-sm text-[#64706c]">{developer.title}</p>
                </div>
                <span className="rounded-md bg-[#fee2e2] px-2.5 py-1 text-sm font-black text-[#b91c1c]">{developer.score}</span>
              </div>
              <p className="min-h-12 text-sm leading-6 text-[#53615c]">{developer.meta}</p>
              <button type="button" onClick={() => setSelectedDeveloper(developer)} className="mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-3 text-sm font-extrabold text-[#42534c]">
                상세 정보 보기
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(developer.name)}
                className={
                  wishlist.includes(developer.name)
                    ? "mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-[#fecaca] bg-[#fff7f7] px-3 text-sm font-extrabold text-[#b91c1c]"
                    : "mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-3 text-sm font-extrabold text-[#42534c]"
                }
              >
                {wishlist.includes(developer.name) ? "위시리스트 저장됨" : "위시리스트 저장"}
              </button>
              <button
                type="button"
                onClick={() => onRequest(developer.name)}
                className={
                  requestedDeveloper === developer.name
                    ? "mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#bbf7d0] bg-[#dcfce7] px-4 text-sm font-extrabold text-[#166534]"
                    : "mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white"
                }
              >
                {requestedDeveloper === developer.name ? "엔지니어 수락 대기" : "매칭 신청"}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedDeveloper ? (
        <DeveloperDetailModal
          developer={selectedDeveloper}
          isRequested={requestedDeveloper === selectedDeveloper.name}
          isWishlisted={wishlist.includes(selectedDeveloper.name)}
          onRequest={() => onRequest(selectedDeveloper.name)}
          onToggleWishlist={() => onToggleWishlist(selectedDeveloper.name)}
          onClose={() => setSelectedDeveloper(null)}
        />
      ) : null}
    </section>
  );
}

function DeveloperDetailModal({
  developer,
  isRequested,
  isWishlisted,
  onRequest,
  onToggleWishlist,
  onClose,
}: {
  developer: (typeof recommendedDevelopers)[number];
  isRequested: boolean;
  isWishlisted: boolean;
  onRequest: () => void;
  onToggleWishlist: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(15,23,42,0.55)] p-6" onClick={onClose} role="presentation">
      <div className="w-[min(520px,100%)] rounded-lg bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="developer-detail-title" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-[#fee2e2] text-[#b91c1c]">매칭 점수 {developer.score}</Badge>
            <h2 id="developer-detail-title" className="m-0 text-2xl font-black tracking-normal">{developer.name}</h2>
            <p className="mt-1 text-sm font-bold text-[#64706c]">{developer.title}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border-0 bg-[#f1f5f9] text-xl font-bold text-[#42534c]" aria-label="닫기">
            ×
          </button>
        </div>

        <dl className="grid gap-3 border-y border-[#e8ece9] py-4">
          <DetailRow label="경력" value={developer.experience} />
          <DetailRow label="주요 기술" value={developer.meta} />
          <DetailRow label="투입 가능" value={developer.availability} />
          <DetailRow label="검증 결과" value={developer.verification} />
          <DetailRow label="프로젝트 이력" value={developer.projectHistory} />
        </dl>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-4 text-sm font-extrabold text-[#42534c]">
            닫기
          </button>
          <button type="button" onClick={onToggleWishlist} className={isWishlisted ? "inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-[#fecaca] bg-[#fff7f7] px-4 text-sm font-extrabold text-[#b91c1c]" : "inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-4 text-sm font-extrabold text-[#42534c]"}>
            {isWishlisted ? "위시리스트 저장됨" : "위시리스트 저장"}
          </button>
          <button type="button" onClick={onRequest} className={isRequested ? "inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-[#bbf7d0] bg-[#dcfce7] px-4 text-sm font-extrabold text-[#166534]" : "inline-flex h-11 cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white"}>
            {isRequested ? "엔지니어 수락 대기" : "이 인재 매칭 신청"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-extrabold text-[#8b9691]">{label}</dt>
      <dd className="m-0 text-sm leading-6 text-[#17221f]">{value}</dd>
    </div>
  );
}

function TextField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#42534c]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-[#dce4df] bg-[#fbfcfb] px-4 text-sm outline-[#b91c1c]" placeholder={placeholder} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#42534c]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-[#dce4df] bg-[#fbfcfb] px-4 text-sm outline-[#b91c1c]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#42534c]">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 resize-y rounded-md border border-[#dce4df] bg-[#fbfcfb] px-4 py-3 text-sm leading-6 outline-[#b91c1c]" placeholder={placeholder} />
    </label>
  );
}

function StatusChip({ icon, label, done }: { icon: ReactNode; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={done ? "text-[#15803d]" : "text-[#94a3b8]"}>{done ? <CheckCircle2 className="h-4 w-4" /> : icon}</span>
      <span>{label}</span>
    </div>
  );
}

type StatusFilter = "all" | PipelineStage;
type SortKey = "name" | "decision" | "decidedAt" | "stage";
type SortDirection = "asc" | "desc";

const dashboardNavItems = [
  { href: "#applications", label: "인력", fullLabel: "인력지원현황", icon: Users },
  { href: "#company-support", label: "기업", fullLabel: "기업지원현황", icon: Building2 },
] as const;

function DashboardHeader({ active, extra }: { active: "applications" | "company"; extra?: ReactNode }) {
  return (
    <header style={chromeStyles.headerBar}>
      <div style={chromeStyles.headerInner}>
        <a href="#signup" style={chromeStyles.headerLogo} aria-label="결브릿지 홈">
          <span style={chromeStyles.headerLogoMark}>결</span>
          <span style={chromeStyles.headerLogoText}>결브릿지</span>
        </a>
        <div style={chromeStyles.headerRight}>
          <nav style={chromeStyles.dashboardNav} aria-label="대시보드 전환">
            {dashboardNavItems.map((item) => {
              const isActive =
                (active === "applications" && item.href === "#applications") ||
                (active === "company" && item.href === "#company-support");
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="dashboard-nav-link"
                  title={item.fullLabel}
                  aria-label={item.fullLabel}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    ...chromeStyles.dashboardNavLink,
                    ...(isActive ? { background: "rgba(255, 255, 255, 0.18)", color: "#fff" } : {}),
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                </a>
              );
            })}
          </nav>
          {extra}
          <a href="#signup" className="home-link" style={chromeStyles.homeLink} aria-label="홈으로 이동" title="홈으로 이동">
            <Home size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

function ApplicationStatusPage() {
  const [activeQueue, setActiveQueue] = useState<AdminQueueKey>("engineers");
  const [query, setQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(adminQueueItems[0].id);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AdminStatus>>({});
  const [lastAction, setLastAction] = useState("");

  const operationalItems = useMemo(
    () => adminQueueItems.map((item) => ({ ...item, status: statusOverrides[item.id] ?? item.status })),
    [statusOverrides]
  );

  const stats = useMemo(() => {
    const open = operationalItems.filter((item) => item.status !== "done").length;
    const urgent = operationalItems.filter((item) => item.status === "blocked").length;
    const completed = operationalItems.filter((item) => item.status === "done").length;
    return { total: operationalItems.length, open, urgent, completed };
  }, [operationalItems]);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return operationalItems.filter((item) => {
      if (item.queue !== activeQueue) return false;
      if (!keyword) return true;

      return [item.primary, item.secondary, item.owner, item.summary]
        .some((value) => value.toLowerCase().includes(keyword));
    });
  }, [activeQueue, operationalItems, query]);

  const selectedItem = filteredItems.find((item) => item.id === selectedItemId) ?? filteredItems[0];

  function handleQueueChange(queue: AdminQueueKey) {
    setActiveQueue(queue);
    setQuery("");
    setLastAction("");
    setSelectedItemId(adminQueueItems.find((item) => item.queue === queue)?.id ?? "");
  }

  function handleAction(action: string) {
    if (!selectedItem) return;
    const nextStatus = getNextAdminStatus(action);
    setStatusOverrides((current) => ({ ...current, [selectedItem.id]: nextStatus }));
    setLastAction(`${selectedItem.primary}: ${adminStatusMeta[nextStatus].label} 상태로 변경되었습니다.`);
  }

  return (
    <main className="applications-page dashboard-shell" data-theme="light" style={applicationStyles.page}>
      <DashboardHeader active="applications" />

      <section style={applicationStyles.content}>
        <div className="applications-title-row" style={applicationStyles.titleRow}>
          <p style={applicationStyles.eyebrow}>ADMIN OPERATIONS</p>
          <h1 style={applicationStyles.heading}>관리자 운영 현황</h1>
          <p style={applicationStyles.lead}>
            엔지니어 제출, 기업 요청, 매칭 진행, 보증 요청을 한 화면에서 확인하고 처리합니다.
          </p>

          <label className="applications-search" style={applicationStyles.searchBox}>
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 회사, 요청 내용 검색"
              style={applicationStyles.searchInput}
            />
          </label>
        </div>

        <section style={applicationStyles.overviewCard} aria-label="종합 현황">
          <div className="overview-hero" style={applicationStyles.overviewHero}>
            <span style={applicationStyles.overviewHeroLabel}>운영 처리 항목</span>
            <span style={applicationStyles.overviewHeroValue}>
              {stats.total}
              <span style={applicationStyles.overviewHeroUnit}>건</span>
            </span>
            <span style={applicationStyles.overviewHeroCaption}>진행 {stats.open} · 확인 필요 {stats.urgent}</span>
          </div>
          <div style={applicationStyles.overviewMeters}>
            <Meter label="진행 중 항목" value={stats.open} total={stats.total} unit="건" />
            <Meter label="처리 완료 항목" value={stats.completed} total={stats.total} unit="건" />
          </div>
        </section>

        <section style={applicationStyles.tablePanel} aria-labelledby="applications-title">
          <div style={applicationStyles.panelHeaderRow}>
            <h2 id="applications-title" style={applicationStyles.sectionTitle}>운영 큐</h2>
            <div style={applicationStyles.statusTabs} role="tablist" aria-label="채용 상태 필터">
              {adminQueueTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeQueue === tab.key}
                  className="status-tab"
                  style={{
                    ...applicationStyles.statusTab,
                    ...(activeQueue === tab.key ? applicationStyles.statusTabActive : {}),
                  }}
                  onClick={() => handleQueueChange(tab.key)}
                >
                  {tab.label} {operationalItems.filter((item) => item.queue === tab.key).length}
                </button>
              ))}
            </div>
          </div>

          <div style={{ margin: "-8px 0 18px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
            {adminQueueTabs.find((tab) => tab.key === activeQueue)?.description}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)", gap: "18px" }}>
            <div style={applicationStyles.tableWrap}>
              <table style={applicationStyles.table}>
                <thead>
                  <tr>
                    <th style={applicationStyles.th}>항목</th>
                    <th style={applicationStyles.th}>담당</th>
                    <th style={applicationStyles.th}>접수일</th>
                    <th style={applicationStyles.th}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td style={applicationStyles.emptyCell} colSpan={4}>
                        검색 조건에 맞는 운영 항목이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td style={applicationStyles.td}>
                          <div style={applicationStyles.nameCell}>
                            <span style={applicationStyles.avatar} aria-hidden="true">
                              {item.primary.slice(0, 1)}
                            </span>
                            <div>
                              <button
                                type="button"
                                className="name-link"
                                style={applicationStyles.nameLink}
                                onClick={() => {
                                  setSelectedItemId(item.id);
                                  setLastAction("");
                                }}
                              >
                                {item.primary}
                              </button>
                              <span style={applicationStyles.roleText}>{item.secondary}</span>
                            </div>
                          </div>
                        </td>
                        <td style={applicationStyles.td}>{item.owner}</td>
                        <td style={applicationStyles.td}>{item.submittedAt}</td>
                        <td style={applicationStyles.td}>
                          <AdminStatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <aside style={{ border: "1px solid var(--card-border)", borderRadius: "16px", padding: "20px", background: "var(--table-header-bg)" }}>
              {selectedItem ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ ...applicationStyles.eyebrow, marginBottom: "6px" }}>DETAIL</p>
                      <h3 style={{ ...applicationStyles.sectionTitle, fontSize: "22px" }}>{selectedItem.primary}</h3>
                      <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
                        {selectedItem.summary}
                      </p>
                    </div>
                    <AdminStatusBadge status={selectedItem.status} />
                  </div>

                  <dl style={{ display: "grid", gap: "10px", margin: "18px 0 0" }}>
                    {selectedItem.details.map((detail) => (
                      <div key={detail.label} style={{ display: "grid", gap: "4px", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px" }}>
                        <dt style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 800 }}>{detail.label}</dt>
                        <dd style={{ margin: 0, color: "var(--text-primary)", fontSize: "14px", fontWeight: 700, lineHeight: 1.5 }}>{detail.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div style={{ display: "grid", gap: "8px", marginTop: "18px" }}>
                    {selectedItem.actions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        style={{ height: "40px", border: "1px solid var(--search-border)", borderRadius: "10px", background: "#fff", color: "var(--accent-text)", fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}
                        onClick={() => handleAction(action)}
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  {lastAction ? (
                    <p style={{ margin: "14px 0 0", borderRadius: "12px", background: "var(--accent-soft-bg)", padding: "12px", color: "var(--accent-text)", fontSize: "13px", fontWeight: 800 }}>
                      {lastAction}
                    </p>
                  ) : null}
                </>
              ) : (
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>선택된 항목이 없습니다.</p>
              )}
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}

function AdminStatusBadge({ status }: { status: AdminStatus }) {
  const meta = adminStatusMeta[status];
  return <span style={applicationStyles[meta.styleKey]}>{meta.label}</span>;
}

function getNextAdminStatus(action: string): AdminStatus {
  if (action.includes("완료") || action.includes("확정")) return "done";
  if (action.includes("반려") || action.includes("보류") || action.includes("불발")) return "blocked";
  if (action.includes("쪽지") || action.includes("보완")) return "waiting";
  return "reviewing";
}

const demoDashboardBars = [
  { width: "60%", tall: false },
  { width: "100%", tall: true, split: true },
  { width: "100%", tall: true },
];

const demoCodeLines = [92, 68, 80, 54, 74, 40, 62];

function PortfolioHologramCard({
  candidate,
  rect,
  locale,
}: {
  candidate: (typeof candidates)[number];
  rect: DOMRect;
  locale: Locale;
}) {
  const t = applicationsText[locale];
  const viewportMargin = 16;
  const cardWidth = 300;
  const demoWidth = 260;
  const gap = 12;
  const estimatedCardHeight = 240;

  const canShowDemo = window.innerWidth >= cardWidth + gap + demoWidth + viewportMargin * 2;
  const totalWidth = canShowDemo ? cardWidth + gap + demoWidth : cardWidth;

  let left = rect.left;
  if (left + totalWidth > window.innerWidth - viewportMargin) {
    left = Math.max(viewportMargin, window.innerWidth - viewportMargin - totalWidth);
  }

  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < estimatedCardHeight && rect.top > estimatedCardHeight;
  const top = showAbove ? rect.top - 8 : rect.bottom + 8;

  return (
    <div
      className="hologram-portal"
      style={{
        ...applicationStyles.hologramWrap,
        left,
        top,
        transform: showAbove ? "translateY(-100%)" : undefined,
      }}
      aria-hidden="true"
    >
      <div className="hologram-border" style={{ ...applicationStyles.hologramBorder, width: cardWidth }}>
        <div className="hologram-card" style={applicationStyles.hologramCard}>
          <div className="hologram-scanline" style={applicationStyles.hologramScanline} />
          <div style={applicationStyles.hologramHeader}>
            <span style={applicationStyles.hologramBadge}>{t.hologramBadge}</span>
            <strong style={applicationStyles.hologramName}>{candidate.name}</strong>
            <span style={applicationStyles.hologramRole}>{candidate.role}</span>
          </div>
          <p style={applicationStyles.hologramSummary}>{candidate.portfolioSummary}</p>
          <ul style={applicationStyles.hologramList}>
            {candidate.portfolioHighlights.map((item) => (
              <li key={item} style={applicationStyles.hologramListItem}>
                ▹ {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {canShowDemo && (
        <div className="hologram-border" style={{ ...applicationStyles.hologramBorder, width: demoWidth }}>
          <div className="demo-panel" style={applicationStyles.demoPanel}>
            <div style={applicationStyles.demoChrome}>
              <span style={applicationStyles.demoDot} />
              <span style={{ ...applicationStyles.demoDot, background: "#eab308" }} />
              <span style={{ ...applicationStyles.demoDot, background: "#22c55e" }} />
              <span style={applicationStyles.demoUrl}>{t.demoUrl}</span>
            </div>

            <div style={applicationStyles.demoScreen}>
              <div className="demo-slide" style={applicationStyles.demoSlide}>
                <div style={{ display: "grid", gap: "6px", padding: "10px", width: "100%" }}>
                  {demoDashboardBars.map((bar, index) =>
                    bar.split ? (
                      <div key={index} style={{ display: "flex", gap: "6px" }}>
                        {[0, 1, 2].map((col) => (
                          <div key={col} style={{ ...applicationStyles.demoBar, flex: 1, height: "32px" }} />
                        ))}
                      </div>
                    ) : (
                      <div
                        key={index}
                        style={{
                          ...applicationStyles.demoBar,
                          width: bar.width,
                          height: bar.tall ? "48px" : "10px",
                          opacity: bar.tall ? 0.4 : 0.65,
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="demo-slide demo-slide-b" style={applicationStyles.demoSlide}>
                <div style={{ display: "grid", gap: "7px", padding: "10px", width: "100%" }}>
                  {demoCodeLines.map((width, index) => (
                    <div
                      key={index}
                      style={{
                        ...applicationStyles.demoBar,
                        width: `${width}%`,
                        height: "8px",
                        opacity: index % 2 === 0 ? 0.6 : 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={applicationStyles.demoFooter}>
              <span className="demo-live-dot" style={applicationStyles.demoLiveDot} />
              <span style={applicationStyles.demoFooterText}>{t.demoFooterText}</span>
            </div>
            <div style={applicationStyles.demoProgressTrack}>
              <div className="demo-progress-fill" style={applicationStyles.demoProgressFill} />
            </div>
            <p style={applicationStyles.demoCaption}>{t.demoCaption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateModal({
  candidate,
  onClose,
  locale,
}: {
  candidate: (typeof candidates)[number];
  onClose: () => void;
  locale: Locale;
}) {
  const t = applicationsText[locale];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const trapFocus = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    closeButtonRef.current?.focus();
  };

  return (
    <div
      style={applicationStyles.modalOverlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-box"
        style={applicationStyles.modalBox}
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-modal-title"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={trapFocus}
      >
        <div style={applicationStyles.modalHeader}>
          <div style={applicationStyles.modalIdentity}>
            <span style={applicationStyles.modalAvatar} aria-hidden="true">{candidate.name.slice(0, 1)}</span>
            <div>
              <h3 id="candidate-modal-title" style={applicationStyles.modalTitle}>{candidate.name}</h3>
              <p style={applicationStyles.modalSubtitle}>{candidate.role}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            style={applicationStyles.modalClose}
            onClick={onClose}
            aria-label={t.modalClose}
          >
            ×
          </button>
        </div>

        <p style={applicationStyles.modalSummary}>{candidate.resumeSummary}</p>

        <dl style={applicationStyles.modalList}>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>{t.modalEmail}</dt>
            <dd style={applicationStyles.modalValue}>{candidate.email}</dd>
          </div>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>{t.modalPhone}</dt>
            <dd style={applicationStyles.modalValue}>{candidate.phone}</dd>
          </div>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>{t.modalDecision}</dt>
            <dd style={applicationStyles.modalValue}>{decisionLabelByLocale[locale][candidate.decision]}</dd>
          </div>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>{t.modalDecidedAt}</dt>
            <dd style={applicationStyles.modalValue}>{candidate.decidedAt}</dd>
          </div>
          <div style={{ ...applicationStyles.modalRow, borderBottom: "none", paddingBottom: 0 }}>
            <dt style={applicationStyles.modalLabel}>{t.modalStage}</dt>
            <dd style={applicationStyles.modalValue}>
              <StageBadge stage={candidate.stage} locale={locale} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const pipelineBadgeStyleKey: Record<PipelineStage, "infoBadge" | "warningBadge" | "hiredBadge" | "rejectedBadge"> = {
  documentPassed: "infoBadge",
  interviewing: "warningBadge",
  finalPassed: "hiredBadge",
  rejected: "rejectedBadge",
};

function StageBadge({ stage, locale }: { stage: PipelineStage; locale: Locale }) {
  return (
    <span style={applicationStyles[pipelineBadgeStyleKey[stage]]}>
      {pipelineStageLabelByLocale[locale][stage]}
    </span>
  );
}

function Meter({
  label,
  value,
  total,
  unit = "명",
  caption,
  theme = applicationStyles,
}: {
  label: string;
  value: number;
  total: number;
  unit?: string;
  caption?: string;
  theme?: Record<string, CSSProperties>;
}) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div style={theme.meterRow}>
      <div style={theme.meterHeader}>
        <span style={theme.meterLabel}>{label}</span>
        <span style={theme.meterPercent}>{percent}%</span>
      </div>
      <div style={theme.meterTrack}>
        <div style={{ ...theme.meterFill, width: `${percent}%` }} />
      </div>
      <span style={theme.meterCaption}>{caption ?? `${value} / ${total}${unit}`}</span>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8f6",
    color: "#17221f",
    fontFamily: "Pretendard, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    width: "calc(100% - 48px)",
    margin: "0 auto",
    borderBottom: "1px solid #e3e8e4",
  },
  logo: { display: "inline-flex", alignItems: "center", gap: "10px", color: "#17221f", textDecoration: "none" },
  logoMark: { display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)", color: "#fff", fontSize: "16px", fontWeight: 850, boxShadow: "0 8px 18px rgba(15, 118, 110, 0.22)" },
  logoText: { fontSize: "22px", fontWeight: 850, letterSpacing: 0, color: "#17221f" },
  headerText: { color: "#64706c", fontSize: "13px" },
  content: { flex: 1, width: "min(1120px, calc(100% - 48px))", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: "64px", alignItems: "center", padding: "64px 0" },
  intro: { maxWidth: "590px" },
  eyebrow: { color: "#0f766e", fontWeight: 750, letterSpacing: "0.08em", fontSize: "12px" },
  heading: { margin: "18px 0 20px", fontSize: "48px", lineHeight: 1.2, letterSpacing: 0, fontWeight: 760 },
  lead: { margin: 0, color: "#53615c", fontSize: "18px", lineHeight: 1.7, maxWidth: "550px" },
  panel: { background: "#fff", border: "1px solid #dde5e0", borderRadius: "8px", padding: "38px", boxShadow: "0 16px 42px rgba(22, 34, 31, 0.07)" },
  panelHeader: { marginBottom: "28px" },
  panelEyebrow: { margin: "0 0 9px", color: "#0f766e", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 750 },
  panelTitle: { margin: "0 0 9px", fontSize: "26px", lineHeight: 1.3, letterSpacing: 0 },
  panelDescription: { margin: 0, color: "#64706c", fontSize: "14px", lineHeight: 1.6 },
  roleList: { display: "grid", gap: "12px" },
  roleButton: { width: "100%", minHeight: "128px", padding: "18px", border: "1px solid #dce4df", borderRadius: "7px", background: "#fff", display: "flex", alignItems: "center", textAlign: "left", gap: "15px", cursor: "pointer", fontFamily: "inherit", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease" },
  iconBox: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "6px", background: "#ccfbf1", color: "#0f766e", fontWeight: 800 },
  roleCopy: { flex: 1, minWidth: 0 },
  roleLabel: { display: "block", color: "#17221f", fontSize: "16px", fontWeight: 700, marginBottom: "5px" },
  roleDescription: { display: "block", color: "#64706c", fontSize: "13px", lineHeight: 1.45 },
  roleDetail: { display: "block", color: "#0f766e", fontSize: "12px", marginTop: "7px", fontWeight: 650 },
  arrow: { flex: "0 0 auto", color: "#0f766e", fontSize: "20px", lineHeight: 1 },
  backButton: { margin: "0 0 22px", padding: 0, border: 0, background: "transparent", color: "#0f766e", fontFamily: "inherit", fontSize: "13px", fontWeight: 750, cursor: "pointer" },
  googleSignupBox: { display: "grid", gap: "16px", border: "1px solid #e8ece9", borderRadius: "8px", background: "#fbfcfb", padding: "22px" },
  googleRoleBadge: { justifySelf: "start", borderRadius: "999px", background: "#fee2e2", color: "#b91c1c", padding: "6px 10px", fontSize: "12px", fontWeight: 800 },
  googleSignupText: { margin: 0, color: "#53615c", fontSize: "14px", lineHeight: 1.6 },
  googleButton: { width: "100%", minHeight: "50px", border: "1px solid #dce4df", borderRadius: "7px", background: "#fff", color: "#17221f", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "inherit", fontSize: "15px", fontWeight: 800, cursor: "pointer" },
  googleMark: { display: "grid", placeItems: "center", width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #dce4df", color: "#b91c1c", fontSize: "14px", fontWeight: 900 },
  errorMessage: { margin: 0, color: "#b91c1c", fontSize: "12px", lineHeight: 1.5, fontWeight: 700 },
  loginPrompt: { margin: "25px 0 0", color: "#42534c", fontSize: "14px" },
  loginLink: { color: "#0f766e", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" },
  notice: { margin: "22px 0 0", paddingTop: "20px", borderTop: "1px solid #e8ece9", color: "#7a8580", fontSize: "12px", lineHeight: 1.6 },
  link: { color: "#53615c", textUnderlineOffset: "2px" },
  footer: { width: "min(1200px, calc(100% - 48px))", margin: "0 auto", padding: "22px 0 28px", color: "#8b9691", fontSize: "12px", borderTop: "1px solid #e3e8e4" },
};

const chromeStyles: Record<string, CSSProperties> = {
  headerBar: {
    width: "100%",
    background: "linear-gradient(120deg, #0b1220 0%, #10233d 55%, #123a66 100%)",
  },
  headerInner: {
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "min(880px, calc(100% - 48px))",
    margin: "0 auto",
    gap: "8px",
  },
  headerLogo: { display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff", textDecoration: "none", flex: "0 0 auto", minWidth: 0 },
  headerLogoMark: { display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(135deg, #2a78d6 0%, #0b1220 100%)", color: "#fff", fontSize: "16px", fontWeight: 850, boxShadow: "0 8px 18px rgba(10, 20, 40, 0.35)" },
  headerLogoText: { fontSize: "20px", fontWeight: 850, letterSpacing: 0, color: "#fff" },
  headerRight: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" },
  homeLink: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.12)", color: "#fff", textDecoration: "none", flex: "0 0 auto" },
  iconToggleButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.12)", color: "#fff", border: 0, cursor: "pointer", flex: "0 0 auto" },
  textToggleButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", height: "36px", padding: "0 12px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.12)", color: "#fff", border: 0, cursor: "pointer", fontSize: "13px", fontWeight: 800, flex: "0 0 auto" },
  dashboardNav: { display: "flex", alignItems: "center", gap: "2px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "999px", padding: "4px" },
  dashboardNavLink: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "999px", color: "#b7c6de", fontSize: "13px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" },
};

const applicationStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--app-bg)",
    color: "var(--text-primary)",
    fontFamily: "Pretendard, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  content: { width: "min(880px, calc(100% - 48px))", margin: "0 auto", padding: "48px 0 64px" },
  titleRow: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px", marginBottom: "28px" },
  eyebrow: { margin: "0 0 4px", color: "var(--accent-text)", fontSize: "13px", letterSpacing: "0.1em", fontWeight: 800 },
  heading: { margin: 0, fontSize: "34px", lineHeight: 1.25, letterSpacing: 0, color: "var(--text-primary)" },
  lead: { margin: "10px 0 0", color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6 },
  searchBox: { height: "48px", width: "min(360px, 100%)", marginTop: "22px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid var(--search-border)", borderRadius: "999px", padding: "0 18px", color: "var(--search-text)", background: "var(--search-bg)", boxShadow: "0 8px 20px rgba(11, 18, 32, 0.05)" },
  searchInput: { width: "100%", border: 0, outline: 0, background: "transparent", color: "var(--text-primary)", fontFamily: "inherit", fontSize: "15px" },
  overviewCard: { display: "flex", flexWrap: "wrap", gap: "28px", border: "1px solid var(--card-border)", borderRadius: "20px", background: "var(--card-bg)", padding: "28px", marginBottom: "20px", boxShadow: "0 18px 44px rgba(11, 18, 32, 0.06)" },
  overviewHero: { display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", flex: "0 0 auto", paddingRight: "28px", borderRight: "1px solid var(--overview-divider)" },
  overviewHeroLabel: { color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 },
  overviewHeroValue: { color: "var(--text-primary)", fontSize: "42px", fontWeight: 800, lineHeight: 1.1 },
  overviewHeroUnit: { fontSize: "17px", fontWeight: 700, color: "var(--text-muted)", marginLeft: "4px" },
  overviewHeroCaption: { color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" },
  overviewMeters: { flex: "1 1 220px", display: "grid", gap: "16px", alignContent: "center", minWidth: "220px" },
  meterRow: { display: "grid", gap: "6px" },
  meterHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  meterLabel: { color: "var(--text-secondary)", fontSize: "14px", fontWeight: 700 },
  meterPercent: { color: "var(--accent-text)", fontSize: "14px", fontWeight: 800 },
  meterTrack: { height: "10px", borderRadius: "999px", background: "var(--meter-track-bg)" },
  meterFill: { height: "100%", borderRadius: "999px", background: "#2a78d6" },
  meterCaption: { color: "var(--text-muted)", fontSize: "12px" },
  tablePanel: { border: "1px solid var(--card-border)", borderRadius: "20px", background: "var(--card-bg)", padding: "28px", boxShadow: "0 18px 44px rgba(11, 18, 32, 0.06)" },
  panelHeaderRow: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" },
  sectionTitle: { margin: 0, color: "var(--text-primary)", fontSize: "19px", fontWeight: 800, lineHeight: 1.3 },
  statusTabs: { display: "flex", flexWrap: "wrap", gap: "6px", background: "var(--tab-track-bg)", borderRadius: "999px", padding: "4px" },
  statusTab: { border: 0, background: "transparent", borderRadius: "999px", padding: "7px 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer" },
  statusTabActive: { background: "var(--tab-active-bg)", color: "var(--accent-text)", boxShadow: "0 4px 12px rgba(11, 18, 32, 0.08)" },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "560px" },
  th: { padding: "14px 18px", borderBottom: "1px solid var(--table-header-border)", background: "var(--table-header-bg)", color: "var(--table-header-text)", textAlign: "left", fontSize: "13px", fontWeight: 800, letterSpacing: "0.02em" },
  sortButton: { display: "inline-flex", alignItems: "center", gap: "3px", border: 0, background: "transparent", padding: 0, font: "inherit", color: "inherit", letterSpacing: "inherit", cursor: "pointer" },
  td: { padding: "18px", borderBottom: "1px solid var(--table-row-border)", color: "var(--text-primary)", fontSize: "14px", lineHeight: 1.5, verticalAlign: "middle" },
  emptyCell: { padding: "40px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" },
  nameCell: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "36px", height: "36px", borderRadius: "999px", background: "var(--accent-soft-bg, #e8f1fc)", color: "var(--accent-text)", fontSize: "15px", fontWeight: 800 },
  nameLink: { display: "block", padding: "2px 6px", margin: "0 0 0 -6px", border: 0, background: "transparent", color: "var(--accent-text)", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  roleText: { display: "block", marginTop: "4px", color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.4 },
  hiredBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "78px", height: "31px", borderRadius: "999px", background: "var(--badge-good-bg)", color: "var(--badge-good-text)", fontSize: "13px", fontWeight: 700 },
  infoBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "78px", height: "31px", borderRadius: "999px", background: "var(--badge-info-bg)", color: "var(--badge-info-text)", fontSize: "13px", fontWeight: 700 },
  warningBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "78px", height: "31px", borderRadius: "999px", background: "var(--badge-warning-bg)", color: "var(--badge-warning-text)", fontSize: "13px", fontWeight: 700 },
  rejectedBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "78px", height: "31px", borderRadius: "999px", background: "var(--badge-rejected-bg)", color: "var(--badge-rejected-text)", fontSize: "13px", fontWeight: 700 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(11, 18, 32, 0.55)", display: "grid", placeItems: "center", padding: "24px", zIndex: 50, backdropFilter: "blur(2px)" },
  modalBox: { width: "min(420px, 100%)", background: "var(--card-bg)", borderRadius: "22px", padding: "28px", boxShadow: "0 30px 70px rgba(11, 18, 32, 0.28)" },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" },
  modalIdentity: { display: "flex", alignItems: "center", gap: "14px" },
  modalAvatar: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "48px", height: "48px", borderRadius: "999px", background: "var(--accent-soft-bg, #e8f1fc)", color: "var(--accent-text)", fontSize: "19px", fontWeight: 800 },
  modalTitle: { margin: 0, fontSize: "21px", fontWeight: 800, color: "var(--text-primary)" },
  modalSubtitle: { margin: "4px 0 0", fontSize: "14px", color: "var(--text-muted)" },
  modalSummary: { margin: "0 0 20px", padding: "14px 16px", background: "var(--modal-summary-bg)", borderRadius: "14px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6 },
  modalClose: { display: "grid", placeItems: "center", width: "32px", height: "32px", border: 0, borderRadius: "999px", background: "transparent", color: "var(--text-secondary)", fontSize: "20px", lineHeight: 1, cursor: "pointer", padding: 0 },
  modalList: { margin: 0, display: "grid", gap: "14px" },
  modalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", paddingBottom: "14px", borderBottom: "1px solid var(--modal-row-border)", lineHeight: 1.5 },
  modalLabel: { margin: 0, color: "var(--text-muted)", fontSize: "14px", fontWeight: 700 },
  modalValue: { margin: 0, color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, textAlign: "right" },
  hologramWrap: { position: "fixed", zIndex: 200, pointerEvents: "none", display: "flex", alignItems: "flex-start", gap: "12px" },
  hologramBorder: {
    position: "relative",
    overflow: "hidden",
    padding: "1.5px",
    borderRadius: "18px",
    boxShadow: "0 0 24px rgba(42, 120, 214, 0.35), 0 18px 44px rgba(11, 18, 32, 0.45)",
  },
  hologramCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "16.5px",
    background: "linear-gradient(160deg, rgba(9, 16, 30, 0.94), rgba(15, 30, 54, 0.9))",
    padding: "16px",
    backdropFilter: "blur(6px)",
  },
  hologramScanline: {
    position: "absolute",
    inset: 0,
    backgroundImage: "repeating-linear-gradient(0deg, rgba(125, 211, 252, 0.16) 0px, rgba(125, 211, 252, 0.16) 1px, transparent 2px, transparent 4px)",
    backgroundSize: "100% 6px",
    mixBlendMode: "screen",
  },
  hologramHeader: { display: "flex", flexDirection: "column", gap: "3px", marginBottom: "10px" },
  hologramBadge: { color: "#7dd3fc", fontSize: "11px", fontWeight: 800, letterSpacing: "0.12em" },
  hologramName: { color: "#fff", fontSize: "17px", fontWeight: 800 },
  hologramRole: { color: "#9db8d9", fontSize: "13px" },
  hologramSummary: { margin: "0 0 10px", color: "#cfe0f5", fontSize: "13px", lineHeight: 1.6 },
  hologramList: { margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "6px" },
  hologramListItem: { color: "#a9c6ea", fontSize: "12.5px", lineHeight: 1.5 },
  demoPanel: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "16.5px",
    background: "linear-gradient(160deg, rgba(9, 16, 30, 0.94), rgba(15, 30, 54, 0.9))",
    padding: "10px",
    backdropFilter: "blur(6px)",
  },
  demoChrome: { display: "flex", alignItems: "center", gap: "5px", padding: "2px 4px 8px" },
  demoDot: { width: "7px", height: "7px", borderRadius: "999px", background: "#ef4444", flex: "0 0 auto" },
  demoUrl: { marginLeft: "6px", color: "#7c93b8", fontSize: "10.5px", letterSpacing: "0.02em" },
  demoScreen: {
    position: "relative",
    height: "104px",
    borderRadius: "10px",
    background: "rgba(125, 211, 252, 0.05)",
    border: "1px solid rgba(125, 211, 252, 0.14)",
    overflow: "hidden",
  },
  demoSlide: { position: "absolute", inset: 0, display: "flex", alignItems: "center" },
  demoBar: { background: "#7dd3fc", borderRadius: "4px" },
  demoFooter: { display: "flex", alignItems: "center", gap: "6px", margin: "10px 0 6px" },
  demoLiveDot: { width: "6px", height: "6px", borderRadius: "999px", background: "#7dd3fc", flex: "0 0 auto" },
  demoFooterText: { color: "#7dd3fc", fontSize: "10.5px", fontWeight: 800, letterSpacing: "0.1em" },
  demoProgressTrack: { height: "3px", borderRadius: "999px", background: "rgba(125, 211, 252, 0.15)", overflow: "hidden" },
  demoProgressFill: { height: "100%", width: "0%", borderRadius: "999px", background: "linear-gradient(90deg, #2a78d6, #7dd3fc)" },
  demoCaption: { margin: "8px 0 0", color: "#5a7095", fontSize: "10px", lineHeight: 1.4 },
};

const statusDotColor: Record<StatusLevel, string> = {
  good: "#0ca30c",
  info: "#2a78d6",
  warning: "#eab308",
  neutral: "#c7ccd3",
};

function StatusDot({ level, label }: { level: StatusLevel; label: string }) {
  return (
    <span style={companyStyles.statusDot}>
      <span style={{ ...companyStyles.statusDotMark, background: statusDotColor[level] }} aria-hidden="true" />
      {label}
    </span>
  );
}

function CompanySupportStatusPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [issues, setIssues] = useState<WarrantyIssue[]>([]);
  const [guide, setGuide] = useState<CompanySupportGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getCompanies()
      .then((loadedCompanies) => {
        setCompanies(loadedCompanies);
        setCompanyId(loadedCompanies[0]?.id ?? "");
      })
      .catch(() => setLoadError("기업 목록을 불러오지 못했습니다. Firestore 설정을 확인해주세요."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!companyId) {
      setWarranty(null);
      setIssues([]);
      setGuide(null);
      return;
    }
    setIsLoading(true);
    setLoadError("");
    getCompanySupport(companyId)
      .then((support) => {
        setWarranty(support.warranty);
        setIssues(support.issues);
        setGuide(support.guide);
      })
      .catch(() => setLoadError("보증 정보를 불러오지 못했습니다. Firestore 설정을 확인해주세요."))
      .finally(() => setIsLoading(false));
  }, [companyId]);

  const remainingWarranty = Math.max(0, (warranty?.totalCount ?? 0) - (warranty?.usedCount ?? 0));
  const hasAttentionItem = issues.some((issue) => issue.status !== "completed");
  const currentCompany = companies.find((company) => company.id === companyId);
  const escalationSteps = guide?.escalationSteps ?? [];
  const referenceCards = guide?.referenceCards ?? [];

  const warrantyProgress = useMemo(() => {
    const start = new Date(warranty?.startedAt ?? "").getTime();
    const end = new Date(warranty?.endsAt ?? "").getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    const ratio = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
    return Math.round(ratio * 100);
  }, [warranty]);

  const remainingDays = useMemo(() => {
    const end = new Date(warranty?.endsAt ?? "").getTime();
    if (Number.isNaN(end)) return 0;
    return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [warranty]);

  return (
    <main className="company-page dashboard-shell" style={companyStyles.page}>
      <DashboardHeader active="company" />

      <section style={companyStyles.content}>
        <div className="applications-title-row" style={companyStyles.titleRow}>
          <p style={companyStyles.eyebrow}>COMPANY SUPPORT</p>
          <h1 style={companyStyles.heading}>기업지원현황</h1>
          <p style={companyStyles.lead}>채용 이후 보증 지원 현황과 이슈 대응 절차를 확인하세요.</p>
          <label style={companyStyles.companySelectLabel}>
            조회할 기업
            <select value={companyId} onChange={(event) => setCompanyId(event.target.value)} style={companyStyles.companySelect}>
              <option value="">기업을 선택하세요</option>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
          </label>
        </div>

        {loadError && <p style={companyStyles.errorMessage}>{loadError}</p>}
        {!isLoading && !loadError && !currentCompany && <p style={companyStyles.emptyMessage}>등록된 기업 정보가 없습니다.</p>}

        <section
          style={{
            ...companyStyles.statusBanner,
            ...(hasAttentionItem ? companyStyles.statusBannerWarning : companyStyles.statusBannerGood),
          }}
          aria-live="polite"
        >
          <CheckCircle2 size={20} />
          <div>
            <strong style={companyStyles.statusBannerTitle}>
              {hasAttentionItem ? "처리할 이슈가 있습니다" : "처리할 이슈가 없습니다"}
            </strong>
            <span style={companyStyles.statusBannerCaption}>담당 PM이 상시 모니터링합니다</span>
          </div>
        </section>

        <section style={companyStyles.overviewCard} aria-label="보증 현황 요약">
          <div className="overview-hero" style={companyStyles.overviewHero}>
            <span style={companyStyles.overviewHeroLabel}>잔여 보증 횟수</span>
            <span style={companyStyles.overviewHeroValue}>
              {remainingWarranty}
              <span style={companyStyles.overviewHeroUnit}>회</span>
            </span>
            <span style={companyStyles.overviewHeroCaption}>총 {warranty?.totalCount ?? 0}회 중 {warranty?.usedCount ?? 0}회 사용</span>
          </div>
          <div style={companyStyles.overviewMeters}>
            <Meter
              label="보증 사용률"
              value={warranty?.usedCount ?? 0}
              total={warranty?.totalCount ?? 0}
              theme={companyStyles}
              caption={`${warranty?.usedCount ?? 0} / ${warranty?.totalCount ?? 0}회 사용`}
            />
            <Meter
              label="보증 기간 경과율"
              value={warrantyProgress}
              total={100}
              theme={companyStyles}
              caption={warranty ? `잔여 약 ${remainingDays}일 · ${warranty.endsAt}까지` : "등록된 보증 정보가 없습니다"}
            />
          </div>
        </section>

        <section style={companyStyles.tablePanel} aria-labelledby="warranty-title">
          <div style={companyStyles.panelHeaderRow}>
            <h2 id="warranty-title" style={companyStyles.sectionTitle}>보증 현황</h2>
          </div>
          <div style={companyStyles.tableWrap}>
            <table style={companyStyles.table}>
              <thead>
                <tr>
                  <th style={companyStyles.th}>구분</th>
                  <th style={companyStyles.th}>보장 항목</th>
                  <th style={companyStyles.th}>상태</th>
                  <th style={companyStyles.th}>비고</th>
                </tr>
              </thead>
              <tbody>
                {(warranty ? [
                  { id: "warranty-period", category: "보증 기간", coverage: `${warranty.startedAt} ~ ${warranty.endsAt}`, status: "good" as const, statusLabel: "활성", note: `${remainingDays}일 남음` },
                  { id: "warranty-count", category: "보증 횟수", coverage: `잔여 ${remainingWarranty}회 / 총 ${warranty.totalCount}회`, status: remainingWarranty > 0 ? "info" as const : "warning" as const, statusLabel: remainingWarranty > 0 ? "사용 가능" : "소진", note: `${warranty.usedCount}회 사용` },
                ] : []).map((item) => (
                  <tr key={item.id}>
                    <td style={companyStyles.td}>
                      <strong>{item.category}</strong>
                    </td>
                    <td style={companyStyles.td}>{item.coverage}</td>
                    <td style={companyStyles.td}>
                      <StatusDot level={item.status} label={item.statusLabel} />
                    </td>
                    <td style={companyStyles.td}>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="secondary-row" style={companyStyles.secondaryRow}>
          <section style={companyStyles.calloutCard} aria-labelledby="escalation-title">
            <h2 id="escalation-title" style={companyStyles.calloutTitle}>이슈 발생 시 대응 절차</h2>
            <ol style={companyStyles.escalationList}>
              {escalationSteps.map((step, index) => (
                <li key={step.title} style={companyStyles.escalationStep}>
                  <span style={companyStyles.escalationNumber}>{index + 1}</span>
                  <div>
                    <strong style={companyStyles.escalationStepTitle}>{step.title}</strong>
                    <p style={companyStyles.escalationStepDesc}>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section style={companyStyles.referenceGrid} aria-label="참고 자료">
            {referenceCards.map((card) => {
              const { icon: Icon, title } = supportCardMetadata[card.guideType];
              return (
                <div key={card.guideType} style={companyStyles.referenceCard}>
                  <div style={companyStyles.referenceIconBox}>
                    <Icon size={18} />
                  </div>
                  <div style={companyStyles.referenceCardContent}>
                    <strong style={companyStyles.referenceTitle}>{title}</strong>
                    <span style={companyStyles.referenceSubtitle}>{card.subtitle}</span>
                    <ul style={companyStyles.referenceList}>
                      {card.items.map((line) => (
                        <li key={line} style={companyStyles.referenceItem}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <section style={companyStyles.tablePanel} aria-labelledby="history-title">
          <div style={companyStyles.panelHeaderRow}>
            <h2 id="history-title" style={companyStyles.sectionTitle}>이슈 이력</h2>
          </div>
          <div style={companyStyles.tableWrap}>
            <table style={companyStyles.table}>
              <thead>
                <tr>
                  <th style={companyStyles.th}>날짜</th>
                  <th style={companyStyles.th}>이슈 내용</th>
                  <th style={companyStyles.th}>담당자</th>
                  <th style={companyStyles.th}>상태</th>
                  <th style={companyStyles.th}>조치사항</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((entry) => (
                  <tr key={entry.id}>
                    <td style={companyStyles.td}>{entry.reportedAt}</td>
                    <td style={companyStyles.td}>{entry.title}</td>
                    <td style={companyStyles.td}>{entry.ownerName}</td>
                    <td style={companyStyles.td}>
                      <StatusDot level={entry.status === "completed" ? "good" : entry.status === "inProgress" ? "info" : "warning"} label={entry.status === "completed" ? "완료" : entry.status === "inProgress" ? "처리 중" : "대기"} />
                    </td>
                    <td style={companyStyles.td}>{entry.actionTaken}</td>
                  </tr>
                ))}
                {!issues.length && <tr><td colSpan={5} style={companyStyles.emptyCell}>등록된 이슈 이력이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

const companyStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fbf5f5",
    color: "#210b0b",
    fontFamily: "Pretendard, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  content: { width: "min(880px, calc(100% - 48px))", margin: "0 auto", padding: "48px 0 64px" },
  titleRow: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px", marginBottom: "28px" },
  eyebrow: { margin: "0 0 4px", color: "#991b1b", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 800 },
  heading: { margin: 0, fontSize: "32px", lineHeight: 1.25, letterSpacing: 0, color: "#210b0b" },
  lead: { margin: "10px 0 0", color: "#6b5a5a", fontSize: "15px", lineHeight: 1.6 },
  companySelectLabel: { display: "grid", gap: "6px", marginTop: "16px", color: "#5a4747", fontSize: "12px", fontWeight: 700, textAlign: "left" },
  companySelect: { minWidth: "220px", border: "1px solid #e7cccc", borderRadius: "10px", background: "#fff", color: "#210b0b", padding: "10px 12px", fontSize: "14px" },
  errorMessage: { margin: "0 0 20px", borderRadius: "12px", background: "#fff1f1", color: "#a61b1b", padding: "14px 16px", fontSize: "13px", fontWeight: 700 },
  emptyMessage: { margin: "0 0 20px", borderRadius: "12px", background: "#fff", color: "#6b5a5a", padding: "14px 16px", fontSize: "13px", textAlign: "center" },
  statusBanner: { display: "flex", alignItems: "center", gap: "14px", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px" },
  statusBannerGood: { background: "#e9f9e9", color: "#0a6b0a", border: "1px solid #cdeecd" },
  statusBannerWarning: { background: "#fef7e0", color: "#8a6205", border: "1px solid #f6e3ab" },
  statusBannerTitle: { display: "block", fontSize: "14px", fontWeight: 800 },
  statusBannerCaption: { display: "block", marginTop: "2px", fontSize: "12px", fontWeight: 600, opacity: 0.85 },
  overviewCard: { display: "flex", flexWrap: "wrap", gap: "28px", border: "1px solid #f2e2e2", borderRadius: "20px", background: "#fff", padding: "28px", marginBottom: "20px", boxShadow: "0 18px 44px rgba(33, 11, 11, 0.06)" },
  overviewHero: { display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", flex: "0 0 auto", paddingRight: "28px", borderRight: "1px solid #f5eaea" },
  overviewHeroLabel: { color: "#8a7373", fontSize: "12px", fontWeight: 700 },
  overviewHeroValue: { color: "#210b0b", fontSize: "40px", fontWeight: 800, lineHeight: 1.1 },
  overviewHeroUnit: { fontSize: "16px", fontWeight: 700, color: "#8a7373", marginLeft: "4px" },
  overviewHeroCaption: { color: "#6b5a5a", fontSize: "12px", marginTop: "4px" },
  overviewMeters: { flex: "1 1 220px", display: "grid", gap: "16px", alignContent: "center", minWidth: "220px" },
  meterRow: { display: "grid", gap: "6px" },
  meterHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  meterLabel: { color: "#5a4747", fontSize: "13px", fontWeight: 700 },
  meterPercent: { color: "#991b1b", fontSize: "13px", fontWeight: 800 },
  meterTrack: { height: "10px", borderRadius: "999px", background: "#fbe4e4" },
  meterFill: { height: "100%", borderRadius: "999px", background: "#dc2626" },
  meterCaption: { color: "#8a7373", fontSize: "11px" },
  tablePanel: { border: "1px solid #f2e2e2", borderRadius: "20px", background: "#fff", padding: "28px", marginBottom: "20px", boxShadow: "0 18px 44px rgba(33, 11, 11, 0.06)" },
  panelHeaderRow: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" },
  sectionTitle: { margin: 0, color: "#210b0b", fontSize: "18px", fontWeight: 800, lineHeight: 1.3 },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "520px" },
  th: { padding: "14px 18px", borderBottom: "1px solid #f0e5e5", background: "#fbf5f5", color: "#5a4747", textAlign: "left", fontSize: "12px", fontWeight: 800, letterSpacing: "0.02em" },
  td: { padding: "18px", borderBottom: "1px solid #f5eaea", color: "#2b2020", fontSize: "13px", lineHeight: 1.5, verticalAlign: "middle" },
  emptyCell: { padding: "28px 18px", color: "#8a7373", fontSize: "13px", textAlign: "center" },
  statusDot: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "#2b2020" },
  statusDotMark: { width: "9px", height: "9px", borderRadius: "999px", flex: "0 0 auto" },
  secondaryRow: { display: "grid", gridTemplateColumns: "minmax(240px, 1fr) minmax(300px, 1.6fr)", gap: "20px", marginBottom: "20px" },
  calloutCard: { border: "1px solid #f3c9c9", borderRadius: "20px", background: "#fff7f7", padding: "24px", boxShadow: "0 12px 30px rgba(153, 27, 27, 0.06)" },
  calloutTitle: { margin: "0 0 16px", color: "#991b1b", fontSize: "16px", fontWeight: 800 },
  escalationList: { margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "14px" },
  escalationStep: { display: "flex", gap: "12px", alignItems: "flex-start" },
  escalationNumber: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "999px", background: "#991b1b", color: "#fff", fontSize: "12px", fontWeight: 800 },
  escalationStepTitle: { display: "block", color: "#210b0b", fontSize: "13px", fontWeight: 800 },
  escalationStepDesc: { margin: "3px 0 0", color: "#6b5a5a", fontSize: "12px", lineHeight: 1.5 },
  referenceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", alignItems: "stretch" },
  referenceCard: { display: "grid", gridTemplateColumns: "36px minmax(0, 1fr)", alignItems: "start", gap: "12px", minWidth: 0, border: "1px solid #f2e2e2", borderRadius: "16px", background: "#fff", padding: "18px", boxShadow: "0 6px 16px rgba(33, 11, 11, 0.03)" },
  referenceIconBox: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "10px", background: "#fdeaea", color: "#991b1b" },
  referenceCardContent: { minWidth: 0 },
  referenceTitle: { display: "block", color: "#210b0b", fontSize: "14px", fontWeight: 800, lineHeight: 1.4 },
  referenceSubtitle: { display: "block", marginTop: "3px", color: "#8a7373", fontSize: "12px", lineHeight: 1.45, overflowWrap: "anywhere" },
  referenceList: { display: "grid", gap: "6px", margin: "12px 0 0", padding: 0, listStyle: "none", color: "#4a3d3d", fontSize: "12px", lineHeight: 1.55 },
  referenceItem: { minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word" },
};
