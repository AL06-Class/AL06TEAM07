import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

const skillOptions = ["React", "TypeScript", "Python", "Firebase", "OpenAI API", "LangChain"];

export function FreelancerRegisterPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8f6] text-[#17221f]">
      <header className="flex h-20 w-full items-center justify-between border-b border-[#e3e8e4] px-5 md:px-8">
        <a href="#login" onClick={onBack} className="inline-flex items-center gap-3 text-[#17221f] no-underline" aria-label="결브릿지 홈">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#b91c1c] text-base font-black text-white shadow-sm">결</span>
          <span className="text-[22px] font-black tracking-normal">결브릿지</span>
        </a>
        <span className="text-sm text-[#64706c]">AI Engineer Profile</span>
      </header>

      <section className="mx-auto grid w-[min(1100px,calc(100%-40px))] flex-1 content-center py-10">
        <div className="mb-8 border-b-2 border-[#17221f] pb-5">
          <p className="mb-2 mt-0 text-xs font-extrabold tracking-[0.08em] text-[#b91c1c]">FREELANCER PROFILE</p>
          <h1 className="m-0 text-3xl font-black leading-tight tracking-normal">프리랜서 프로필 등록</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#53615c]">기업 매칭에 필요한 기본 정보, 기술 스택, 대표 경험을 입력합니다.</p>
        </div>

        <Card className="rounded-lg border-[#dde5e0] shadow-sm">
          <CardContent className="grid gap-6 p-5 md:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="이름" placeholder="예: 김개발" />
              <Field label="이메일" placeholder="name@email.com" />
              <Field label="희망 역할" placeholder="예: AI 웹 개발자" />
              <Field label="가능 투입 시점" placeholder="예: 즉시, 2주 이내" />
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-[#42534c]">주요 기술 스택</span>
              <div className="flex flex-wrap gap-2 rounded-md border border-[#dce4df] bg-[#fbfcfb] p-3">
                {skillOptions.map((skill) => (
                  <Badge key={skill} className="bg-[#fee2e2] text-[#b91c1c]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </label>

            <TextArea label="대표 프로젝트" placeholder="프로젝트 목표, 맡은 역할, 사용 기술, 결과를 적어주세요." />
            <TextArea label="자기소개" placeholder="강점, 선호 업무 방식, 커뮤니케이션 스타일을 적어주세요." />

            <div className="grid gap-3 border-t border-[#e8ece9] pt-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <button type="button" onClick={onBack} className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-[#dce4df] bg-white px-5 text-sm font-extrabold text-[#42534c]">
                이전으로
              </button>
              <button type="button" className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border-0 bg-[#b91c1c] px-5 text-sm font-extrabold text-white">
                프로필 등록 완료
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#42534c]">{label}</span>
      <input className="h-11 rounded-md border border-[#dce4df] bg-[#fbfcfb] px-4 text-sm outline-[#b91c1c]" placeholder={placeholder} />
    </label>
  );
}

function TextArea({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#42534c]">{label}</span>
      <textarea className="min-h-28 resize-y rounded-md border border-[#dce4df] bg-[#fbfcfb] px-4 py-3 text-sm leading-6 outline-[#b91c1c]" placeholder={placeholder} />
    </label>
  );
}
