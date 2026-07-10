import { useMemo, useState } from "react";

const jobs = [
  {
    title: "프론트엔드 개발자",
    company: "웨이브스튜디오",
    meta: "서울 · React · 3-5년",
    salary: "5,500-7,000만원",
    summary: "채용 플랫폼의 지원자 경험과 기업용 대시보드를 함께 개선합니다.",
    tags: ["React", "TypeScript", "UI"]
  },
  {
    title: "프로덕트 디자이너",
    company: "노스랩스",
    meta: "원격 · UX/UI · 2년 이상",
    salary: "4,800-6,200만원",
    summary: "구직자 탐색 흐름과 기업 채용 관리 화면을 설계합니다.",
    tags: ["UX", "UI", "Figma"]
  },
  {
    title: "백엔드 엔지니어",
    company: "코어브릿지",
    meta: "판교 · Node.js · 4년 이상",
    salary: "6,500-8,500만원",
    summary: "공고 검색, 지원 관리, 알림 API를 안정적으로 운영합니다.",
    tags: ["Node.js", "API", "검색"]
  },
  {
    title: "채용 운영 매니저",
    company: "피플링크",
    meta: "서울 · 채용 운영 · 3년 이상",
    salary: "4,200-5,400만원",
    summary: "기업 고객의 공고 등록과 후보자 커뮤니케이션을 관리합니다.",
    tags: ["채용", "운영", "고객"]
  }
];

const stats = [
  ["1,240", "진행 중인 공고"],
  ["380", "검증된 기업"],
  ["72시간", "평균 첫 응답"]
];

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return jobs;
    }

    return jobs.filter((job) => {
      const target = [
        job.title,
        job.company,
        job.meta,
        job.summary,
        ...job.tags
      ]
        .join(" ")
        .toLowerCase();

      return target.includes(normalizedKeyword);
    });
  }, [keyword]);

  const openSearchModal = () => {
    setIsModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        color: "#17202a",
        fontFamily:
          "Pretendard, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "24px"
        }}
      >
        <strong style={{ fontSize: "20px" }}>하이어베이스</strong>
        <nav
          aria-label="주요 메뉴"
          style={{
            display: "flex",
            gap: "18px",
            color: "#52606d",
            fontSize: "14px"
          }}
        >
          <span>채용공고</span>
          <span>기업정보</span>
          <span>기업회원</span>
        </nav>
      </header>

      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "48px 24px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px",
          alignItems: "center"
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 14px",
              color: "#18794e",
              fontSize: "14px",
              fontWeight: 700
            }}
          >
            검증된 기술 채용 플랫폼
          </p>
          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: 0
            }}
          >
            필요한 정보만 보고 맞는 일자리를 찾으세요.
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              maxWidth: "560px",
              color: "#52606d",
              fontSize: "18px",
              lineHeight: 1.65
            }}
          >
            연봉 범위, 근무 방식, 응답 속도가 확인된 공고만 모아 보여줍니다.
            관심 있는 직무나 기술을 검색해 바로 비교해 보세요.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              openSearchModal();
            }}
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "28px"
            }}
          >
            <input
              aria-label="채용공고 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="직무, 기술, 회사명을 입력하세요"
              style={{
                flex: "1 1 260px",
                minHeight: "48px",
                border: "1px solid #cfd6df",
                borderRadius: "6px",
                padding: "0 14px",
                fontSize: "15px",
                fontFamily: "inherit"
              }}
            />
            <button
              type="submit"
              style={{
                minHeight: "48px",
                border: "0",
                borderRadius: "6px",
                padding: "0 20px",
                background: "#176b5c",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              채용공고 검색
            </button>
          </form>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {stats.map(([value, label]) => (
              <div key={label}>
                <strong style={{ display: "block", fontSize: "24px" }}>
                  {value}
                </strong>
                <span style={{ color: "#52606d", fontSize: "14px" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside
          aria-label="추천 채용공고"
          style={{
            background: "#ffffff",
            border: "1px solid #d9dee7",
            borderRadius: "8px",
            boxShadow: "0 18px 45px rgba(23, 32, 42, 0.08)",
            padding: "22px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px"
            }}
          >
            <h2 style={{ margin: 0, fontSize: "20px" }}>추천 공고</h2>
            <span style={{ color: "#52606d", fontSize: "13px" }}>오늘</span>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {jobs.slice(0, 3).map((job) => (
              <article
                key={job.title}
                style={{
                  border: "1px solid #e2e7ee",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "#fbfcfd"
                }}
              >
                <h3 style={{ margin: "0 0 6px", fontSize: "17px" }}>
                  {job.title}
                </h3>
                <p style={{ margin: "0 0 10px", color: "#52606d" }}>
                  {job.company}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    color: "#52606d",
                    fontSize: "13px"
                  }}
                >
                  <span>{job.meta}</span>
                  <strong style={{ color: "#17202a", whiteSpace: "nowrap" }}>
                    {job.salary}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-result-title"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "rgba(23, 32, 42, 0.48)"
          }}
        >
          <section
            style={{
              width: "min(100%, 680px)",
              maxHeight: "min(720px, 90vh)",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #d9dee7",
              boxShadow: "0 24px 80px rgba(23, 32, 42, 0.24)",
              padding: "24px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "flex-start",
                marginBottom: "20px"
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#18794e",
                    fontSize: "13px",
                    fontWeight: 700
                  }}
                >
                  검색 결과
                </p>
                <h2
                  id="search-result-title"
                  style={{ margin: 0, fontSize: "24px", lineHeight: 1.3 }}
                >
                  {keyword.trim()
                    ? `"${keyword.trim()}"에 맞는 채용공고`
                    : "지금 추천하는 채용공고"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSearchModal}
                aria-label="검색 결과 닫기"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1px solid #cfd6df",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "#17202a",
                  cursor: "pointer",
                  fontSize: "20px",
                  lineHeight: 1,
                  fontFamily: "inherit"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <article
                    key={`${job.company}-${job.title}`}
                    style={{
                      border: "1px solid #e2e7ee",
                      borderRadius: "8px",
                      padding: "18px",
                      background: "#fbfcfd"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "16px",
                        marginBottom: "10px"
                      }}
                    >
                      <div>
                        <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>
                          {job.title}
                        </h3>
                        <p style={{ margin: 0, color: "#52606d" }}>
                          {job.company}
                        </p>
                      </div>
                      <strong
                        style={{
                          color: "#17202a",
                          whiteSpace: "nowrap",
                          fontSize: "14px"
                        }}
                      >
                        {job.salary}
                      </strong>
                    </div>
                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#52606d",
                        fontSize: "14px"
                      }}
                    >
                      {job.meta}
                    </p>
                    <p style={{ margin: "0 0 14px", lineHeight: 1.6 }}>
                      {job.summary}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            border: "1px solid #d9dee7",
                            borderRadius: "999px",
                            padding: "5px 9px",
                            color: "#52606d",
                            fontSize: "12px"
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div
                  style={{
                    border: "1px solid #e2e7ee",
                    borderRadius: "8px",
                    padding: "24px",
                    background: "#fbfcfd",
                    color: "#52606d"
                  }}
                >
                  검색어와 일치하는 공고가 없습니다. 직무, 기술, 회사명을 바꿔
                  다시 검색해 주세요.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
