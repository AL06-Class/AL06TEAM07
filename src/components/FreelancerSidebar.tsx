const menuItems = [
  "(인재) 검증 인력 프로필",
  "인재 매칭",
  "(인재) 보증 현황 대시보드"
];

export function FreelancerSidebar() {
  return (
    <aside className="h-fit rounded-lg border border-border bg-white p-4">
      <strong className="mb-3 inline-flex rounded-md bg-white px-2 py-1 text-sm shadow-sm">
        Section 3
      </strong>
      <nav className="grid gap-3">
        {menuItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`min-h-11 rounded-md border px-3 text-left text-sm font-extrabold transition ${
              index === 0
                ? "border-[#22c7c9] bg-[#dff8f8] text-[#063f4a]"
                : "border-border bg-white text-[#374151] hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
