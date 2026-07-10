const jobs = [
  {
    title: "Frontend Developer",
    company: "Wave Studio",
    meta: "Seoul · React · 3-5 years",
    salary: "5,500-7,000"
  },
  {
    title: "Product Designer",
    company: "North Labs",
    meta: "Remote · UX/UI · 2+ years",
    salary: "4,800-6,200"
  },
  {
    title: "Backend Engineer",
    company: "Core Bridge",
    meta: "Pangyo · Node.js · 4+ years",
    salary: "6,500-8,500"
  }
];

const stats = [
  ["1,240", "open roles"],
  ["380", "hiring teams"],
  ["72h", "avg. first reply"]
];

export default function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        color: "#17202a",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
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
        <strong style={{ fontSize: "20px" }}>HireBase</strong>
        <nav
          aria-label="main"
          style={{
            display: "flex",
            gap: "18px",
            color: "#52606d",
            fontSize: "14px"
          }}
        >
          <span>Jobs</span>
          <span>Companies</span>
          <span>For employers</span>
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
            Verified tech hiring platform
          </p>
          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: 0
            }}
          >
            Find the right role without the hiring noise.
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
            Browse curated openings, compare hiring teams, and apply only to
            roles with clear salary ranges and fast response expectations.
          </p>
          <form
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "28px"
            }}
          >
            <input
              aria-label="Search jobs"
              placeholder="Job title, skill, or company"
              style={{
                flex: "1 1 260px",
                minHeight: "48px",
                border: "1px solid #cfd6df",
                borderRadius: "6px",
                padding: "0 14px",
                fontSize: "15px"
              }}
            />
            <button
              type="button"
              style={{
                minHeight: "48px",
                border: "0",
                borderRadius: "6px",
                padding: "0 20px",
                background: "#176b5c",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Search jobs
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
          aria-label="Featured jobs"
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
            <h2 style={{ margin: 0, fontSize: "20px" }}>Featured openings</h2>
            <span style={{ color: "#52606d", fontSize: "13px" }}>Today</span>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {jobs.map((job) => (
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
    </main>
  );
}
