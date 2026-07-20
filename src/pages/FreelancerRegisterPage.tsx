import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { FreelancerProfileForm } from "../components/FreelancerProfileForm";
import { FreelancerSidebar } from "../components/FreelancerSidebar";

export function FreelancerRegisterPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] px-5 py-6 text-foreground">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex items-start justify-between gap-4 max-md:flex-col">
          <div>
            <Badge className="mb-3 bg-[#edf6fc] text-[#0f5f99]">기능1</Badge>
            <p className="text-sm font-bold text-muted">www.주소.com</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight max-sm:text-2xl">
              AI 웹 개발자 인력 등록 폼
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              검증 인력 프로필 입력 화면입니다. 기업이 개발자를 비교할 수 있도록
              기본 정보, 경력, 과제 배정 정보, 매칭 조건을 한 번에 입력합니다.
            </p>
          </div>
          <div className="rounded-lg border border-[#c8e1f2] bg-white px-4 py-3 text-sm font-bold text-[#0f5f99]">
            프리랜서 등록
          </div>
        </header>

        <section className="grid grid-cols-[240px_minmax(0,1fr)] gap-5 max-lg:grid-cols-1">
          <FreelancerSidebar />

          <div className="grid gap-5">
            <Card className="border-[#d7e4ef]">
              <CardContent className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
                <div>
                  <Badge className="mb-3 bg-[#edf6fc] text-[#0f5f99]">
                    Section 4
                  </Badge>
                  <h2 className="text-2xl font-extrabold">
                    검증 인력 프로필 입력
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    필수 항목을 먼저 채우고, 경력 설명에는 검증 가능한 프로젝트
                    경험을 중심으로 작성합니다.
                  </p>
                </div>
                <div className="rounded-lg bg-[#f3f6f8] px-4 py-3 text-sm font-bold text-muted">
                  API 연결 전 UI 단계
                </div>
              </CardContent>
            </Card>

            <FreelancerProfileForm />
          </div>
        </section>
      </div>
    </main>
  );
}
