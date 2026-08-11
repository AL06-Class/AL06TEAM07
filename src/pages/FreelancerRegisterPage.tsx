import { useState } from "react";
import { FreelancerProfileForm } from "../components/FreelancerProfileForm";
import { FreelancerSidebar } from "../components/FreelancerSidebar";

export function FreelancerRegisterPage() {
  const [isReviewMode, setIsReviewMode] = useState(false);

  return (
    <main className="min-h-screen bg-[#f5f8fb] text-foreground">
      <header className="flex h-20 w-full items-center justify-between border-b border-[#d9e8f3] px-5 md:px-8">
        <a href="#signup" className="inline-flex items-center gap-3 text-[#172033] no-underline" aria-label="결브릿지 홈">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0f6ea8] text-base font-black text-white shadow-sm">결</span>
          <span className="text-[22px] font-black tracking-normal">결브릿지</span>
        </a>
        <a href="#signup" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[#d9e8f3] bg-white px-4 text-sm font-bold text-[#34566b] no-underline">
          홈으로
        </a>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <header className="mb-5">
          <div>
            <span className="inline-flex rounded-full bg-[#eff8ff] px-3 py-1 text-sm font-extrabold text-[#0f6ea8]">AI 엔지니어 회원</span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] max-sm:text-2xl">
              AI 엔지니어 인력 등록 폼
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              기업 매칭에 필요한 검증 정보와 희망 조건을 입력합니다.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-[300px_minmax(0,1fr)] gap-5 max-lg:grid-cols-1">
          <FreelancerSidebar isReviewMode={isReviewMode} />
          <FreelancerProfileForm onReviewModeChange={setIsReviewMode} />
        </section>
      </div>
    </main>
  );
}
