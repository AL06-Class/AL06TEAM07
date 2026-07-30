import { FreelancerProfileForm } from "../components/FreelancerProfileForm";
import { FreelancerSidebar } from "../components/FreelancerSidebar";

export function FreelancerRegisterPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] px-4 py-6 text-foreground">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <div>
            <span className="inline-flex rounded-full bg-[#eff8ff] px-3 py-1 text-sm font-extrabold text-[#0f6ea8]">
              결브릿지 · 기능1
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] max-sm:text-2xl">
              AI 웹 개발자 인력 등록 폼
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              결브릿지에서 기업 매칭에 필요한 검증 정보와 희망 조건을 한 번에 정리합니다.
            </p>
          </div>

          <div className="rounded-full border border-[#d9e8f3] bg-white px-4 py-2 text-sm font-extrabold text-[#0f6ea8] shadow-sm">
            UI 시안 단계
          </div>
        </header>

        <section className="grid grid-cols-[300px_minmax(0,1fr)] gap-5 max-lg:grid-cols-1">
          <FreelancerSidebar />
          <FreelancerProfileForm />
        </section>
      </div>
    </main>
  );
}
