import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Home,
  Phone,
  RefreshCw,
  Search,
  Users,
  UsersRound,
} from "lucide-react";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { firebaseApp, firebaseDb, isFirebaseConfigured } from "./lib/firebase";
import { FreelancerRegisterPage } from "./pages/FreelancerRegisterPage";

type SignupRole = "company" | "engineer";
type UserRole = "candidate" | "recruiter";
type View = "select" | "login" | SignupRole;
type CandidateStatus = "hired" | "pending";
type RecruiterView = "project" | "matched" | "warranty";
type MatchingStage = "selecting" | "requested" | "accepted" | "scheduling" | "confirmed" | "completed" | "failed";

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
    status: "hired" as const,
    role: "RAG 서비스 개발자",
    email: "sunsung.kim@example.com",
    phone: "010-1234-5601",
    resumeSummary: "3년차 백엔드 개발자로 RAG 파이프라인 설계·운영 경험 보유",
  },
  {
    id: "app-002",
    name: "최혜덕",
    decision: "불만족",
    decidedAt: "2026-06-28",
    status: "hired" as const,
    role: "AI 문서 자동화 개발자",
    email: "hyedeok.choi@example.com",
    phone: "010-2345-6702",
    resumeSummary: "문서 자동화 및 사내 검색 서비스 개발 경험 3년",
  },
  {
    id: "app-003",
    name: "박윤채",
    decision: "만족",
    decidedAt: "2026-06-28",
    status: "pending" as const,
    role: "LLM 백엔드 개발자",
    email: "yunchae.park@example.com",
    phone: "010-3456-7803",
    resumeSummary: "LLM 서빙 인프라 구축과 대규모 트래픽 최적화 경험",
  },
  {
    id: "app-004",
    name: "이현수",
    decision: "만족",
    decidedAt: "2026-06-28",
    status: "pending" as const,
    role: "프롬프트 엔지니어",
    email: "hyunsoo.lee@example.com",
    phone: "010-4567-8904",
    resumeSummary: "프롬프트 설계 및 평가 자동화 파이프라인 구축 경험",
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

const escalationSteps = [
  { title: "대시보드 확인", description: "보증 현황 표에서 이슈 항목과 잔여 보증 횟수를 확인합니다." },
  { title: "보증 실행 요청 (PM)", description: "담당 PM에게 보증 실행을 요청하고 이슈 내용을 전달합니다." },
  { title: "대체 개발자 투입", description: "예비 인력 Pool에서 후보자를 매칭해 인수인계를 진행합니다." },
];

const referenceCards = [
  {
    icon: Phone,
    title: "긴급 호출",
    subtitle: "Hotline · 긴급 상황 시",
    items: ["PM 연락처: 010-XXXX-XXXX", "보증팀 직통: support@team7.dev", "24시간 내 응답 보장"],
  },
  {
    icon: RefreshCw,
    title: "교체 프로세스",
    subtitle: "Action · 인력 교체 3단계",
    items: ["1. 이슈 파악 및 보고", "2. 후보자 매칭 (24시간)", "3. 헤드헌팅 및 인수인계 (7일)"],
  },
  {
    icon: FileText,
    title: "관련 문서",
    subtitle: "Link · 참고 문서",
    items: ["7일 정규 프로젝트 PRD", "개발자 온보딩 가이드", "프로젝트 기술 아키텍처"],
  },
  {
    icon: ClipboardCheck,
    title: "체크리스트",
    subtitle: "Quality · 교체 시 필수 확인",
    items: ["코드 컨벤션 준수 여부", "형상 관리(Git) 접근 권한", "업무 히스토리 전달 완료"],
  },
];

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
              {escalationSteps.map((step, index) => (
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

type StatusFilter = "all" | CandidateStatus;

const dashboardNavItems = [
  { href: "#applications", label: "인력", fullLabel: "인력지원현황", icon: Users },
  { href: "#company-support", label: "기업", fullLabel: "기업지원현황", icon: Building2 },
] as const;

function DashboardHeader({ active }: { active: "applications" | "company" }) {
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
          <a href="#signup" className="home-link" style={chromeStyles.homeLink} aria-label="홈으로 이동" title="홈으로 이동">
            <Home size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

function ApplicationStatusPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<(typeof candidates)[number] | null>(null);

  const stats = useMemo(() => {
    const hired = candidates.filter((candidate) => candidate.status === "hired").length;
    const satisfied = candidates.filter((candidate) => candidate.decision === "만족").length;
    return { total: candidates.length, hired, pending: candidates.length - hired, satisfied };
  }, []);

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: stats.total },
    { key: "hired", label: "채용", count: stats.hired },
    { key: "pending", label: "미채용", count: stats.pending },
  ];

  const filteredCandidates = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        [candidate.name, candidate.role, candidate.decision].some((value) =>
          value.toLowerCase().includes(keyword)
        );
      return matchesStatus && matchesKeyword;
    });
  }, [query, statusFilter]);

  useEffect(() => {
    if (!selectedCandidate) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCandidate(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedCandidate]);

  return (
    <main className="applications-page dashboard-shell" style={applicationStyles.page}>
      <DashboardHeader active="applications" />

      <section style={applicationStyles.content}>
        <div className="applications-title-row" style={applicationStyles.titleRow}>
          <p style={applicationStyles.eyebrow}>RECRUITER DASHBOARD</p>
          <h1 style={applicationStyles.heading}>인력지원현황</h1>
          <p style={applicationStyles.lead}>매칭 인력의 결정 여부와 채용 여부를 한눈에 확인하세요.</p>

          <label className="applications-search" style={applicationStyles.searchBox}>
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 직무, 결정 검색"
              style={applicationStyles.searchInput}
            />
          </label>
        </div>

        <section style={applicationStyles.overviewCard} aria-label="종합 현황">
          <div className="overview-hero" style={applicationStyles.overviewHero}>
            <span style={applicationStyles.overviewHeroLabel}>총 지원자</span>
            <span style={applicationStyles.overviewHeroValue}>
              {stats.total}
              <span style={applicationStyles.overviewHeroUnit}>명</span>
            </span>
            <span style={applicationStyles.overviewHeroCaption}>채용 {stats.hired} · 미채용 {stats.pending}</span>
          </div>
          <div style={applicationStyles.overviewMeters}>
            <Meter label="채용률" value={stats.hired} total={stats.total} />
            <Meter label="결정 만족도" value={stats.satisfied} total={stats.total} />
          </div>
        </section>

        <section style={applicationStyles.tablePanel} aria-labelledby="applications-title">
          <div style={applicationStyles.panelHeaderRow}>
            <h2 id="applications-title" style={applicationStyles.sectionTitle}>지원자 목록</h2>
            <div style={applicationStyles.statusTabs} role="tablist" aria-label="채용 상태 필터">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === tab.key}
                  className="status-tab"
                  style={{
                    ...applicationStyles.statusTab,
                    ...(statusFilter === tab.key ? applicationStyles.statusTabActive : {}),
                  }}
                  onClick={() => setStatusFilter(tab.key)}
                >
                  {tab.label} {tab.count}
                </button>
              ))}
            </div>
          </div>

          <div style={applicationStyles.tableWrap}>
            <table style={applicationStyles.table}>
              <thead>
                <tr>
                  <th style={applicationStyles.th}>매칭인력</th>
                  <th style={applicationStyles.th}>결정여부</th>
                  <th style={applicationStyles.th}>결정일</th>
                  <th style={applicationStyles.th}>채용여부</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td style={applicationStyles.emptyCell} colSpan={4}>
                      검색 조건에 맞는 지원자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td style={applicationStyles.td}>
                        <div style={applicationStyles.nameCell}>
                          <span style={applicationStyles.avatar} aria-hidden="true">
                            {candidate.name.slice(0, 1)}
                          </span>
                          <div>
                            <button
                              type="button"
                              className="name-link"
                              style={applicationStyles.nameLink}
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              {candidate.name}
                            </button>
                            <span style={applicationStyles.roleText}>{candidate.role}</span>
                          </div>
                        </div>
                      </td>
                      <td style={applicationStyles.td}>{candidate.decision}</td>
                      <td style={applicationStyles.td}>{candidate.decidedAt}</td>
                      <td style={applicationStyles.td}>
                        <StatusBadge status={candidate.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </main>
  );
}

function CandidateModal({
  candidate,
  onClose,
}: {
  candidate: (typeof candidates)[number];
  onClose: () => void;
}) {
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
            type="button"
            className="modal-close"
            style={applicationStyles.modalClose}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <p style={applicationStyles.modalSummary}>{candidate.resumeSummary}</p>

        <dl style={applicationStyles.modalList}>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>이메일</dt>
            <dd style={applicationStyles.modalValue}>{candidate.email}</dd>
          </div>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>연락처</dt>
            <dd style={applicationStyles.modalValue}>{candidate.phone}</dd>
          </div>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>결정 여부</dt>
            <dd style={applicationStyles.modalValue}>{candidate.decision}</dd>
          </div>
          <div style={applicationStyles.modalRow}>
            <dt style={applicationStyles.modalLabel}>결정일</dt>
            <dd style={applicationStyles.modalValue}>{candidate.decidedAt}</dd>
          </div>
          <div style={{ ...applicationStyles.modalRow, borderBottom: "none", paddingBottom: 0 }}>
            <dt style={applicationStyles.modalLabel}>채용 여부</dt>
            <dd style={applicationStyles.modalValue}>
              <StatusBadge status={candidate.status} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CandidateStatus }) {
  const isHired = status === "hired";
  return (
    <span style={isHired ? applicationStyles.hiredBadge : applicationStyles.pendingBadge}>
      {isHired ? "채용" : "미채용"}
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
  headerRight: { display: "flex", alignItems: "center", gap: "6px" },
  homeLink: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.12)", color: "#fff", textDecoration: "none", flex: "0 0 auto" },
  dashboardNav: { display: "flex", alignItems: "center", gap: "2px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "999px", padding: "4px" },
  dashboardNavLink: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "999px", color: "#b7c6de", fontSize: "13px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" },
};

const applicationStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#0b1220",
    fontFamily: "Pretendard, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  content: { width: "min(880px, calc(100% - 48px))", margin: "0 auto", padding: "48px 0 64px" },
  titleRow: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px", marginBottom: "28px" },
  eyebrow: { margin: "0 0 4px", color: "#184f95", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 800 },
  heading: { margin: 0, fontSize: "32px", lineHeight: 1.25, letterSpacing: 0, color: "#0b1220" },
  lead: { margin: "10px 0 0", color: "#5b6472", fontSize: "15px", lineHeight: 1.6 },
  searchBox: { height: "46px", width: "min(360px, 100%)", marginTop: "22px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #dbe6f4", borderRadius: "999px", padding: "0 18px", color: "#5b6472", background: "#fff", boxShadow: "0 8px 20px rgba(11, 18, 32, 0.05)" },
  searchInput: { width: "100%", border: 0, outline: 0, background: "transparent", color: "#0b1220", fontFamily: "inherit", fontSize: "14px" },
  overviewCard: { display: "flex", flexWrap: "wrap", gap: "28px", border: "1px solid #e2e9f2", borderRadius: "20px", background: "#fff", padding: "28px", marginBottom: "20px", boxShadow: "0 18px 44px rgba(11, 18, 32, 0.06)" },
  overviewHero: { display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", flex: "0 0 auto", paddingRight: "28px", borderRight: "1px solid #eef2f7" },
  overviewHeroLabel: { color: "#7c8794", fontSize: "12px", fontWeight: 700 },
  overviewHeroValue: { color: "#0b1220", fontSize: "40px", fontWeight: 800, lineHeight: 1.1 },
  overviewHeroUnit: { fontSize: "16px", fontWeight: 700, color: "#7c8794", marginLeft: "4px" },
  overviewHeroCaption: { color: "#5b6472", fontSize: "12px", marginTop: "4px" },
  overviewMeters: { flex: "1 1 220px", display: "grid", gap: "16px", alignContent: "center", minWidth: "220px" },
  meterRow: { display: "grid", gap: "6px" },
  meterHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  meterLabel: { color: "#424d5a", fontSize: "13px", fontWeight: 700 },
  meterPercent: { color: "#184f95", fontSize: "13px", fontWeight: 800 },
  meterTrack: { height: "10px", borderRadius: "999px", background: "#e8f1fc" },
  meterFill: { height: "100%", borderRadius: "999px", background: "#2a78d6" },
  meterCaption: { color: "#7c8794", fontSize: "11px" },
  tablePanel: { border: "1px solid #e2e9f2", borderRadius: "20px", background: "#fff", padding: "28px", boxShadow: "0 18px 44px rgba(11, 18, 32, 0.06)" },
  panelHeaderRow: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" },
  sectionTitle: { margin: 0, color: "#0b1220", fontSize: "18px", fontWeight: 800, lineHeight: 1.3 },
  statusTabs: { display: "flex", gap: "6px", background: "#f0f4f9", borderRadius: "999px", padding: "4px" },
  statusTab: { border: 0, background: "transparent", borderRadius: "999px", padding: "7px 14px", fontFamily: "inherit", fontSize: "12px", fontWeight: 700, color: "#5b6472", cursor: "pointer" },
  statusTabActive: { background: "#fff", color: "#184f95", boxShadow: "0 4px 12px rgba(11, 18, 32, 0.08)" },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "560px" },
  th: { padding: "14px 18px", borderBottom: "1px solid #e5e9ee", background: "#f4f7fb", color: "#5b6472", textAlign: "left", fontSize: "12px", fontWeight: 800, letterSpacing: "0.02em" },
  td: { padding: "18px", borderBottom: "1px solid #f0f2f5", color: "#2b3440", fontSize: "13px", lineHeight: 1.5, verticalAlign: "middle" },
  emptyCell: { padding: "40px 18px", textAlign: "center", color: "#7c8794", fontSize: "13px" },
  nameCell: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "36px", height: "36px", borderRadius: "999px", background: "#e8f1fc", color: "#184f95", fontSize: "14px", fontWeight: 800 },
  nameLink: { display: "block", padding: "2px 6px", margin: "0 0 0 -6px", border: 0, background: "transparent", color: "#184f95", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, cursor: "pointer" },
  roleText: { display: "block", marginTop: "4px", color: "#7c8794", fontSize: "12px", lineHeight: 1.4 },
  hiredBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "64px", height: "30px", borderRadius: "999px", background: "#dcfce7", color: "#166534", fontSize: "12px", fontWeight: 700 },
  pendingBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "64px", height: "30px", borderRadius: "999px", background: "#eef1f5", color: "#4b5563", fontSize: "12px", fontWeight: 700 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(11, 18, 32, 0.55)", display: "grid", placeItems: "center", padding: "24px", zIndex: 50, backdropFilter: "blur(2px)" },
  modalBox: { width: "min(420px, 100%)", background: "#fff", borderRadius: "22px", padding: "28px", boxShadow: "0 30px 70px rgba(11, 18, 32, 0.28)" },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" },
  modalIdentity: { display: "flex", alignItems: "center", gap: "14px" },
  modalAvatar: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "48px", height: "48px", borderRadius: "999px", background: "#e8f1fc", color: "#184f95", fontSize: "18px", fontWeight: 800 },
  modalTitle: { margin: 0, fontSize: "20px", fontWeight: 800, color: "#0b1220" },
  modalSubtitle: { margin: "4px 0 0", fontSize: "13px", color: "#7c8794" },
  modalSummary: { margin: "0 0 20px", padding: "14px 16px", background: "#f4f7fb", borderRadius: "14px", color: "#42534c", fontSize: "13px", lineHeight: 1.6 },
  modalClose: { display: "grid", placeItems: "center", width: "32px", height: "32px", border: 0, borderRadius: "999px", background: "transparent", color: "#5b6472", fontSize: "20px", lineHeight: 1, cursor: "pointer", padding: 0 },
  modalList: { margin: 0, display: "grid", gap: "14px" },
  modalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", paddingBottom: "14px", borderBottom: "1px solid #f1f3f6", lineHeight: 1.5 },
  modalLabel: { margin: 0, color: "#7c8794", fontSize: "13px", fontWeight: 700 },
  modalValue: { margin: 0, color: "#0b1220", fontSize: "13px", fontWeight: 600, textAlign: "right" },
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
  const remainingWarranty = warrantyUsage.total - warrantyUsage.used;
  const hasAttentionItem = warrantyItems.some((item) => item.status === "warning");

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
    <main className="company-page dashboard-shell" style={companyStyles.page}>
      <DashboardHeader active="company" />

      <section style={companyStyles.content}>
        <div className="applications-title-row" style={companyStyles.titleRow}>
          <p style={companyStyles.eyebrow}>COMPANY SUPPORT</p>
          <h1 style={companyStyles.heading}>기업지원현황</h1>
          <p style={companyStyles.lead}>채용 이후 보증 지원 현황과 이슈 대응 절차를 확인하세요.</p>
        </div>

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
              {hasAttentionItem ? "일부 항목에 확인이 필요합니다" : "모든 보증 항목이 정상 운영 중입니다"}
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
            <span style={companyStyles.overviewHeroCaption}>총 {warrantyUsage.total}회 중 {warrantyUsage.used}회 사용</span>
          </div>
          <div style={companyStyles.overviewMeters}>
            <Meter
              label="보증 사용률"
              value={warrantyUsage.used}
              total={warrantyUsage.total}
              theme={companyStyles}
              caption={`${warrantyUsage.used} / ${warrantyUsage.total}회 사용`}
            />
            <Meter
              label="보증 기간 경과율"
              value={warrantyProgress}
              total={100}
              theme={companyStyles}
              caption={`잔여 약 ${remainingDays}일 · ${warrantyPeriod.endsAt}까지`}
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
                {warrantyItems.map((item) => (
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
              const Icon = card.icon;
              return (
                <div key={card.title} style={companyStyles.referenceCard}>
                  <div style={companyStyles.referenceIconBox}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <strong style={companyStyles.referenceTitle}>{card.title}</strong>
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
                {issueHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td style={companyStyles.td}>{entry.date}</td>
                    <td style={companyStyles.td}>{entry.issue}</td>
                    <td style={companyStyles.td}>{entry.owner}</td>
                    <td style={companyStyles.td}>
                      <StatusDot level={entry.status} label={entry.statusLabel} />
                    </td>
                    <td style={companyStyles.td}>{entry.action}</td>
                  </tr>
                ))}
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
  referenceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" },
  referenceCard: { display: "flex", gap: "12px", border: "1px solid #f2e2e2", borderRadius: "16px", background: "#fff", padding: "16px" },
  referenceIconBox: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "10px", background: "#fdeaea", color: "#991b1b" },
  referenceTitle: { display: "block", color: "#210b0b", fontSize: "13px", fontWeight: 800 },
  referenceSubtitle: { display: "block", marginTop: "2px", color: "#8a7373", fontSize: "11px" },
  referenceList: { margin: "8px 0 0", padding: "0 0 0 14px", color: "#4a3d3d", fontSize: "12px", lineHeight: 1.6 },
  referenceItem: { marginBottom: "2px" },
};
