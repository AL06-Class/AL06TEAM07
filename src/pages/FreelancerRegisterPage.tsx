import { FreelancerProfileForm } from "../components/FreelancerProfileForm";
import { FreelancerSidebar } from "../components/FreelancerSidebar";

export function FreelancerRegisterPage() {
  return (
    <main className="min-h-screen bg-[#dff1fb] px-2 py-1 text-foreground">
      <div className="mx-auto w-full max-w-6xl rounded-md border border-[#8aa9bd] bg-[#d9eefb]">
        <header className="border-b border-[#d2dce5] bg-white px-5 py-4">
          <span className="mb-2 inline-flex rounded-md bg-[#25aeea] px-3 py-1 text-sm font-extrabold text-white">
            기능1
          </span>
          <p className="mb-3 inline-flex rounded-md bg-[#e5e5e5] px-2 py-1 text-sm font-extrabold text-[#222]">
            www.주소.com
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight max-sm:text-2xl">
            AI 웹 개발자 인력 등록 폼 (프리랜서 등록)
          </h1>
        </header>

        <section className="grid grid-cols-[190px_minmax(0,1fr)] gap-5 p-4 max-lg:grid-cols-1">
          <FreelancerSidebar />
          <FreelancerProfileForm />
        </section>
      </div>
    </main>
  );
}
