import { useEffect, useState } from "react";

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

type FreelancerSidebarProps = {
  isReviewMode?: boolean;
};

export function FreelancerSidebar({ isReviewMode = false }: FreelancerSidebarProps) {
  const [activeSectionId, setActiveSectionId] = useState(menuItems[0].id);

  useEffect(() => {
    if (isReviewMode) {
      setActiveSectionId("");
      return;
    }

    function syncActiveSection() {
      const documentElement = document.documentElement;
      const isAtBottom =
        window.scrollY + window.innerHeight >= documentElement.scrollHeight - 12;

      if (isAtBottom) {
        setActiveSectionId(menuItems[menuItems.length - 1].id);
        return;
      }

      const scrollAnchor = window.scrollY + Math.min(window.innerHeight * 0.36, 260);
      const currentSectionId = menuItems.reduce((current, item) => {
        const element = document.getElementById(item.id);
        if (!element) return current;
        return scrollAnchor >= element.offsetTop - 24 ? item.id : current;
      }, menuItems[0].id);

      setActiveSectionId(currentSectionId);
    }

    syncActiveSection();
    window.addEventListener("scroll", syncActiveSection, { passive: true });
    window.addEventListener("resize", syncActiveSection);
    return () => {
      window.removeEventListener("scroll", syncActiveSection);
      window.removeEventListener("resize", syncActiveSection);
    };
  }, [isReviewMode]);

  function handleMove(sectionId: string) {
    if (isReviewMode) return;

    setActiveSectionId(sectionId);
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
        <h2 className="mt-2 text-xl font-extrabold">
          {isReviewMode ? "제출 완료" : "등록 진행"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#e6f6ff]">
          {isReviewMode
            ? "제출한 등록 정보를 확인합니다."
            : "기업 매칭에 필요한 정보를 입력합니다."}
        </p>
      </div>

      <nav className="grid gap-2 p-4">
        {menuItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            disabled={isReviewMode}
            onClick={() => handleMove(item.id)}
            className={`rounded-md border px-3 py-3 text-left transition ${
              isReviewMode || activeSectionId === item.id
                ? "border-[#b8def3] bg-[#f1f9fe]"
                : "border-transparent bg-white hover:border-[#e3edf5] hover:bg-[#f8fbfd]"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-extrabold text-[#172033]">
              <span
                className={`grid size-6 place-items-center rounded-full text-xs ${
                  isReviewMode || activeSectionId === item.id
                    ? "bg-[#0f6ea8] text-white"
                    : "bg-[#eef5fa] text-[#0f6ea8]"
                }`}
              >
                {index + 1}
              </span>
              <span>{item.title}</span>
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
