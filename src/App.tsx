import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Gauge,
  ShieldCheck,
  Sparkles,
  UserRoundCheck
} from "lucide-react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

const metrics = [
  { label: "검증 배지", value: "4개" },
  { label: "예상 투입", value: "8주" },
  { label: "적합도", value: "92%" }
];

const serviceHighlights = [
  {
    icon: ClipboardCheck,
    title: "과제 기반 검증",
    description: "이력서가 아니라 실제 구현 결과, 인증 배지, 실력 점수를 기준으로 봅니다."
  },
  {
    icon: UserRoundCheck,
    title: "조건 기반 추천",
    description: "AI 기능 유형, 기간, 예산에 맞는 상위 후보를 빠르게 좁힙니다."
  },
  {
    icon: ShieldCheck,
    title: "계약 전 보증 안내",
    description: "대체 개발자, 중도 이탈 대응, 중재 요청 조건을 매칭 전에 확인합니다."
  }
];

const matchingSteps = [
  {
    title: "프로젝트 조건 입력",
    description: "AI 기능, 기간, 예산, 필요한 산출물을 정리합니다."
  },
  {
    title: "검증 후보 추천",
    description: "조건에 맞는 AI 엔지니어를 검증 결과 중심으로 추천합니다."
  },
  {
    title: "비교 후 매칭 신청",
    description: "상위 후보의 배지, 점수, 프로젝트 이력을 비교합니다."
  }
];

export default function App() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] px-6 py-6 text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 pb-6 max-sm:flex-col max-sm:items-start">
        <a href="/" className="text-2xl font-extrabold tracking-tight text-[#0f5f99]">
          Blogle2
        </a>
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm font-bold text-muted max-sm:justify-start">
          <a href="#process">매칭 방식</a>
          <a href="#trust">검증 기준</a>
          <a href="#guarantee">보증 안내</a>
          <Button href="#join" variant="outline" className="h-10">
            회원가입
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] gap-6 max-lg:grid-cols-1">
        <Card className="overflow-hidden border-[#d7e4ef]">
          <CardContent className="p-0">
            <div className="border-b border-border bg-white px-8 py-4 max-sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#edf6fc] text-[#0f5f99]">
                  <Sparkles size={13} />
                  검증된 AI 앱 개발자 매칭
                </Badge>
                <Badge className="bg-[#f3f6f8] text-[#52606d]">
                  기업 프로젝트 전용
                </Badge>
              </div>
            </div>
            <div className="p-12 max-md:p-8 max-sm:p-5">
              <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight max-md:text-4xl max-sm:text-3xl">
                AI 프로젝트에 맞는 개발자를 검증 결과로 고르세요
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted max-sm:text-base">
                Blogle2는 포트폴리오와 면접만으로 판단하기 어려운 AI 구현
                역량을 과제 결과, 배지, 프로젝트 이력으로 정리해 기업에게
                추천합니다.
              </p>
              <div id="join" className="mt-8 flex flex-wrap gap-3">
                <Button href="#company-login" size="lg">
                  기업회원 로그인
                  <BriefcaseBusiness size={18} />
                </Button>
                <Button href="#engineer-login" size="lg" variant="outline">
                  AI 엔지니어 회원 로그인
                  <ArrowRight size={18} />
                </Button>
              </div>
              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3 max-sm:grid-cols-1">
                {metrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-border bg-[#f9fbfd] p-4"
                  >
                    <p className="text-sm font-bold text-muted">{item.label}</p>
                    <strong className="mt-2 block text-2xl text-[#0f5f99]">
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d7e4ef] bg-white shadow-[0_18px_40px_rgba(15,95,153,0.08)]">
          <CardContent className="p-7 max-sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-muted">추천 미리보기</p>
                <h2 className="mt-1 text-2xl font-extrabold">상위 후보 요약</h2>
              </div>
              <Badge className="bg-[#e7f6ed] text-[#18794e]">
                <BadgeCheck size={13} />
                검증 완료
              </Badge>
            </div>

            <div className="mt-6 rounded-lg border border-[#c8e1f2] bg-[#edf6fc] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted">프로젝트 적합도</span>
                <Gauge size={20} className="text-[#0f5f99]" />
              </div>
              <strong className="mt-3 block text-5xl leading-none text-[#0f5f99]">
                92%
              </strong>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full w-[92%] rounded-full bg-[#0f6ea8]" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <CandidateCard
                name="AI 챗봇 구축"
                meta="검증 배지 4개 · 8주 프로젝트"
                initial="A"
              />
              <CandidateCard
                name="문서 자동화"
                meta="실력 점수 상위 7%"
                initial="B"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-6xl grid-cols-2 gap-6 max-md:grid-cols-1">
        <RoleCard
          id="company-login"
          href="#process"
          tone="company"
          icon={BriefcaseBusiness}
          label="기업회원"
          title="기업회원 로그인"
          description="프로젝트 조건을 입력하고 추천 개발자를 확인합니다."
        />
        <RoleCard
          id="engineer-login"
          href="#trust"
          tone="engineer"
          icon={FileCheck2}
          label="AI 엔지니어"
          title="AI 엔지니어 회원 로그인"
          description="검증 결과와 프로젝트 이력을 관리합니다."
        />
      </section>

      <Card id="process" className="mx-auto mt-6 w-full max-w-6xl border-[#d7e4ef]">
        <CardContent className="grid grid-cols-[0.8fr_1.2fr] gap-8 p-8 max-md:grid-cols-1 max-sm:p-5">
          <div>
            <Badge className="bg-[#edf6fc] text-[#0f5f99]">매칭 흐름</Badge>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight">
              기업은 세 단계만 확인하면 됩니다
            </h2>
            <p className="mt-4 leading-7 text-muted">
              복잡한 채용 공고보다 프로젝트 조건과 검증 데이터를 먼저 맞춥니다.
            </p>
          </div>
          <div className="grid gap-3">
            {matchingSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-lg border border-border bg-[#f9fbfd] p-4"
              >
                <span className="grid size-9 flex-none place-items-center rounded-full bg-primary text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <div>
                  <strong className="block">{step.title}</strong>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section
        id="trust"
        className="mx-auto mt-6 grid w-full max-w-6xl grid-cols-3 gap-4 max-md:grid-cols-1"
      >
        {serviceHighlights.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="border-[#d7e4ef]">
              <CardContent className="p-6">
                <div className="mb-5 grid size-11 place-items-center rounded-lg bg-[#edf6fc] text-[#0f6ea8]">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-extrabold">{item.title}</h3>
                <p className="mt-3 leading-6 text-muted">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card
        id="guarantee"
        className="mx-auto mt-6 w-full max-w-6xl border-[#d7e4ef] bg-[#102a43] text-white"
      >
        <CardContent className="flex items-center justify-between gap-6 p-7 max-md:flex-col max-md:items-start">
          <div>
            <Badge className="bg-white/12 text-white">
              <Clock3 size={13} />
              계약 전 확인
            </Badge>
            <h2 className="mt-4 text-2xl font-extrabold">
              중도 이탈과 대체 개발자 조건까지 미리 확인합니다
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">
              매칭 신청 전 보증 조건을 노출해 기업이 AI 프로젝트를 안심하고
              맡길 수 있게 합니다.
            </p>
          </div>
          <Button href="#join" variant="subtle" size="lg">
            매칭 시작
            <ArrowRight size={18} />
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function CandidateCard({
  initial,
  name,
  meta
}: {
  initial: string;
  name: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-4">
      <span className="grid size-10 flex-none place-items-center rounded-full bg-[#d8ecf8] font-extrabold text-[#0f5f99]">
        {initial}
      </span>
      <div>
        <strong className="block text-sm">{name}</strong>
        <p className="mt-1 text-sm text-muted">{meta}</p>
      </div>
    </div>
  );
}

function RoleCard({
  id,
  href,
  tone,
  icon: Icon,
  label,
  title,
  description
}: {
  id: string;
  href: string;
  tone: "company" | "engineer";
  icon: typeof BriefcaseBusiness;
  label: string;
  title: string;
  description: string;
}) {
  const toneClass =
    tone === "company"
      ? "border-[#7fcad4] bg-[#e8fbfb]"
      : "border-[#f1b6a9] bg-[#fff2ef]";

  return (
    <a
      id={id}
      href={href}
      className={`group rounded-lg border p-7 text-foreground transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,95,153,0.10)] ${toneClass}`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-muted">{label}</span>
        <Icon size={22} className="text-[#0f5f99]" />
      </div>
      <strong className="block text-2xl">{title}</strong>
      <p className="mt-3 leading-6 text-muted">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#0f5f99]">
        이동하기
        <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </span>
    </a>
  );
}
