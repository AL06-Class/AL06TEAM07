const menuItems = [
  {
    id: "basic",
    title: "신청 확인",
    description: "기본 연락 정보"
  },
  {
    id: "career",
    title: "경력 파악",
    description: "경력과 기술 스택"
  },
  {
    id: "task",
    title: "과제 배정용",
    description: "GitHub와 과제 유형"
  },
  {
    id: "matching",
    title: "매칭 조건",
    description: "일정과 보수 조건"
  }
];

export function FreelancerSidebar() {
  function handleMove(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  return (
    <aside className="sticky top-5 h-fit overflow-hidden rounded-lg border border-[#e3edf5] bg-white shadow-sm max-lg:static">
      <div className="bg-[#0f6ea8] px-5 py-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#cfefff]">
          Gyeol Bridge
        </p>
        <h2 className="mt-2 text-xl font-extrabold">등록 진행</h2>
        <p className="mt-2 text-sm leading-6 text-[#e6f6ff]">
          신청 확인부터 매칭 조건까지 순서대로 입력합니다.
        </p>
      </div>

      <div className="grid grid-cols-3 border-b border-[#e3edf5] bg-[#f8fbfd] text-center">
        <div className="px-2 py-3">
          <p className="text-lg font-extrabold text-[#172033]">12</p>
          <p className="text-xs font-bold text-[#667085]">입력 항목</p>
        </div>
        <div className="border-x border-[#e3edf5] px-2 py-3">
          <p className="text-lg font-extrabold text-[#172033]">4</p>
          <p className="text-xs font-bold text-[#667085]">섹션</p>
        </div>
        <div className="px-2 py-3">
          <p className="text-lg font-extrabold text-[#172033]">UI</p>
          <p className="text-xs font-bold text-[#667085]">시안</p>
        </div>
      </div>

      <nav className="grid gap-2 p-4">
        {menuItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => handleMove(item.id)}
            className={`rounded-md border px-3 py-3 text-left transition ${
              index === 0
                ? "border-[#b8def3] bg-[#f1f9fe]"
                : "border-transparent bg-white hover:border-[#e3edf5] hover:bg-[#f8fbfd]"
            }`}
          >
            <span className="block text-sm font-extrabold text-[#172033]">
              {item.title}
            </span>
            <span className="mt-1 block text-xs font-semibold text-[#6b7280]">
              {item.description}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
