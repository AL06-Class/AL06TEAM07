import { type ReactNode, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  LogOut,
  UserPlus,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { isFirebaseConfigured } from "./lib/firebase";
import { FreelancerRegisterPage } from "./pages/FreelancerRegisterPage";

type View = "auth" | "recruiterProjectInput" | "freelancerRegister";

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

const sidebarItems = [
  { label: "검증 인재", active: false },
  { label: "인재 매칭", active: true },
  { label: "보증 현황", active: false },
];

const recommendedDevelopers = [
  {
    name: "김하린",
    title: "RAG · 문서 자동화",
    score: 94,
    meta: "React, Firebase, OpenAI API",
  },
  {
    name: "박도윤",
    title: "AI 챗봇 · 업무 자동화",
    score: 91,
    meta: "LangChain, Node.js, Slack Bot",
  },
  {
    name: "정서연",
    title: "추천 시스템 · 데이터 설계",
    score: 88,
    meta: "Python, 데이터 파이프라인, MVP",
  },
];

export default function App() {
  const getInitialView = (): View => {
    if (window.location.hash === "#freelancer-register") return "freelancerRegister";
    if (window.location.hash === "#recruiter-project-input") return "recruiterProjectInput";
    return "auth";
  };

  const [view, setView] = useState<View>(getInitialView);
  const [userEmail, setUserEmail] = useState("");
  const [projectForm, setProjectForm] = useState<ProjectForm>(initialProjectForm);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleGoogleSignIn = () => {
    setUserEmail("recruiter@gmail.com");
    setView("recruiterProjectInput");
    window.history.replaceState(null, "", "#recruiter-project-input");
  };

  const handleFreelancerRegister = () => {
    setUserEmail("");
    setView("freelancerRegister");
    setIsSubmitted(false);
    window.history.replaceState(null, "", "#freelancer-register");
  };

  const handleSignOut = () => {
    setUserEmail("");
    setView("auth");
    setIsSubmitted(false);
    window.history.replaceState(null, "", "#login");
  };

  const updateProjectForm = (field: keyof ProjectForm, value: string) => {
    setProjectForm((current) => ({ ...current, [field]: value }));
  };

  const submitProject = () => {
    setIsSubmitted(true);
  };

  if (view === "freelancerRegister") {
    return <FreelancerRegisterPage onBack={handleSignOut} />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8f6] text-[#17221f]">
      <header className="flex h-20 w-full items-center justify-between border-b border-[#e3e8e4] px-5 md:px-8">
        <a href="/" className="inline-flex items-center gap-3 text-[#17221f] no-underline" aria-label="결브릿지 홈">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#b91c1c] text-base font-black text-white shadow-sm">결</span>
          <span className="text-[22px] font-black tracking-normal">결브릿지</span>
        </a>
        {userEmail ? (
          <button type="button" onClick={handleSignOut} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[#dce4df] bg-white px-4 text-sm font-bold text-[#42534c]">
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        ) : (
          <span className="text-sm text-[#64706c]">Verified AI Talent Network</span>
        )}
      </header>

      {view === "auth" ? <GoogleAuth onSignIn={handleGoogleSignIn} /> : null}
      {view === "auth" ? <AuthShortcut onFreelancerRegister={handleFreelancerRegister} /> : null}
      {view === "recruiterProjectInput" ? (
        <RecruiterProjectInput
          form={projectForm}
          isReady={isProjectReady}
          isSubmitted={isSubmitted}
          userEmail={userEmail}
          onChange={updateProjectForm}
          onSubmit={submitProject}
        />
      ) : null}

      <footer className="w-full border-t border-[#e3e8e4] px-5 py-5 text-left text-xs leading-5 text-[#8b9691] md:px-8">
        <p className="mb-3 mt-0">계속 진행하면 결브릿지의 이용약관 및 개인정보 처리방침에 동의한 것으로 봅니다.</p>
        <p className="m-0">© 2026 결브릿지. All rights reserved.</p>
      </footer>
    </main>
  );
}

function AuthShortcut({ onFreelancerRegister }: { onFreelancerRegister: () => void }) {
  return (
    <section className="mx-auto -mt-8 mb-10 w-[min(1100px,calc(100%-40px))]">
      <button type="button" onClick={onFreelancerRegister} className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-4 text-sm font-extrabold text-[#42534c] hover:bg-[#f8faf9]">
        프리랜서 프로필 등록
      </button>
    </section>
  );
}

function GoogleAuth({ onSignIn }: { onSignIn: () => void }) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const authTabs = [
    { id: "login" as const, label: "로그인", icon: <UserRound className="h-4 w-4" /> },
    { id: "signup" as const, label: "회원가입", icon: <UserPlus className="h-4 w-4" /> },
  ];

  const authCopy = {
    login: {
      eyebrow: "MEMBER LOGIN",
      title: "로그인",
      description: "Google 계정으로 결브릿지 서비스를 이용하세요.",
      primaryAction: "Google로 로그인",
    },
    signup: {
      eyebrow: "JOIN MEMBER",
      title: "회원가입",
      description: "Google 계정으로 기업 프로젝트 등록을 시작할 계정을 만듭니다.",
      primaryAction: "Google로 회원가입",
    },
  }[authMode];

  return (
    <section className="mx-auto grid w-[min(1100px,calc(100%-40px))] flex-1 content-center py-12">
      <div className="mb-8 border-b-2 border-[#17221f] pb-5">
        <p className="mb-2 mt-0 text-xs font-extrabold tracking-[0.08em] text-[#b91c1c]">MEMBER SERVICE</p>
        <h1 className="m-0 text-3xl font-black leading-tight tracking-normal">회원서비스</h1>
      </div>

      <div className="grid overflow-hidden rounded-lg border border-[#d7ded9] bg-white shadow-[0_14px_34px_rgba(23,34,31,0.07)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav className="border-b border-[#d7ded9] bg-[#f2f4f3] lg:border-b-0 lg:border-r">
          {authTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAuthMode(tab.id)}
              className={
                authMode === tab.id
                  ? "flex h-16 w-full cursor-pointer items-center gap-3 border-0 border-b border-[#d7ded9] bg-[#b91c1c] px-5 text-left text-sm font-black text-white"
                  : "flex h-16 w-full cursor-pointer items-center gap-3 border-0 border-b border-[#d7ded9] bg-transparent px-5 text-left text-sm font-extrabold text-[#42534c] hover:bg-white"
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <CardContent className="p-6 md:p-10">
          <div className="mb-8 border-b border-[#e3e8e4] pb-6">
            <p className="mb-2 mt-0 text-[11px] font-extrabold tracking-[0.08em] text-[#b91c1c]">{authCopy.eyebrow}</p>
            <h2 className="m-0 text-2xl font-black tracking-normal md:text-3xl">{authCopy.title}</h2>
            <p className="mb-0 mt-3 text-sm leading-6 text-[#53615c]">{authCopy.description}</p>
          </div>

          <div className="rounded-md border border-[#dce4df] bg-[#fbfcfb] p-5">
            <p className="m-0 text-sm font-extrabold text-[#42534c]">Google 계정 인증</p>
            <p className="mb-0 mt-2 text-sm leading-6 text-[#64706c]">별도 아이디와 비밀번호 없이 Google 계정으로만 진행합니다.</p>
          </div>

          <button type="button" onClick={onSignIn} className="mt-8 flex h-12 w-full cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-5 text-base font-extrabold text-white transition hover:bg-[#991b1b]">
            {authCopy.primaryAction}
          </button>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#64706c]">
            <button type="button" onClick={() => setAuthMode("login")} className="cursor-pointer border-0 bg-transparent p-0 font-bold text-[#42534c]">로그인</button>
            <button type="button" onClick={() => setAuthMode("signup")} className="cursor-pointer border-0 bg-transparent p-0 font-bold text-[#42534c]">회원가입</button>
          </div>

          {!isFirebaseConfigured ? <p className="mb-0 mt-6 border-t border-[#e3e8e4] pt-5 text-xs leading-5 text-[#b91c1c]">Firebase 환경변수가 없어서 현재는 화면 흐름 확인용으로 진입합니다.</p> : null}
        </CardContent>
      </div>
    </section>
  );
}

function RecruiterProjectInput({
  form,
  isReady,
  isSubmitted,
  userEmail,
  onChange,
  onSubmit,
}: {
  form: ProjectForm;
  isReady: boolean;
  isSubmitted: boolean;
  userEmail: string;
  onChange: (field: keyof ProjectForm, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="mx-auto grid w-[min(1200px,calc(100%-32px))] gap-5 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-[#dde5e0] bg-white p-4">
        <div className="mb-5 flex items-center gap-3 border-b border-[#e8ece9] pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[#fee2e2] text-[#b91c1c]">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-sm font-black">7번 회사</p>
            <p className="m-0 truncate text-xs text-[#64706c]">{userEmail}</p>
          </div>
        </div>
        <p className="mb-3 mt-0 text-xs font-extrabold tracking-[0.08em] text-[#8b9691]">SECTION 3</p>
        <nav className="grid gap-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={
                item.active
                  ? "flex h-11 cursor-pointer items-center rounded-md border border-[#b91c1c] bg-[#fff8f8] px-4 text-left text-sm font-black text-[#b91c1c]"
                  : "flex h-11 cursor-pointer items-center rounded-md border border-transparent bg-white px-4 text-left text-sm font-bold text-[#53615c] hover:bg-[#f8faf9]"
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 rounded-lg border border-[#dde5e0] bg-white p-5">
          <Badge className="mb-4 bg-[#fee2e2] text-[#b91c1c]">인재 매칭</Badge>
          <h1 className="m-0 text-2xl font-black leading-tight tracking-normal md:text-3xl">AI 웹 개발자 인력 등록 폼</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53615c]">기업이 원하는 인재를 찾기 위해 프로젝트, 예산, 기간, 필요 인력 정보를 입력합니다.</p>
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

        {isSubmitted ? <RecommendedDevelopers /> : null}
      </div>
    </section>
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

function RecommendedDevelopers() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="m-0 text-xl font-black tracking-normal">추천 개발자</h2>
        <Badge className="bg-[#f1f5f9] text-[#42534c]">상위 3명</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {recommendedDevelopers.map((developer) => (
          <Card key={developer.name} className="rounded-lg border-[#dde5e0]">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-base font-black">{developer.name}</p>
                  <p className="mt-1 text-sm text-[#64706c]">{developer.title}</p>
                </div>
                <span className="rounded-md bg-[#fee2e2] px-2.5 py-1 text-sm font-black text-[#b91c1c]">{developer.score}</span>
              </div>
              <p className="min-h-12 text-sm leading-6 text-[#53615c]">{developer.meta}</p>
              <button type="button" className="mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-[#b91c1c] px-4 text-sm font-extrabold text-white">
                매칭 신청
                <CalendarDays className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
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
