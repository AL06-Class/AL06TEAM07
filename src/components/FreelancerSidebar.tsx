const menuItems = [
  "(현재) 검증 인력 프로필",
  "인재 매칭",
  "(인재) 보증 현황 대시보드"
];

export function FreelancerSidebar() {
  return (
    <aside className="h-fit rounded-lg border border-border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <strong className="text-sm">Section 3</strong>
        <span className="text-xs font-bold text-muted">메뉴</span>
      </div>
      <nav className="grid gap-2">
        {menuItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`min-h-12 rounded-md border px-3 text-left text-sm font-extrabold transition ${
              index === 0
                ? "border-[#7fcad4] bg-[#e8fbfb] text-[#0f5f99]"
                : "border-border bg-white text-muted hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
