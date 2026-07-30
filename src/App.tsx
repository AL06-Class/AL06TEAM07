import { Search } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { FreelancerRegisterPage } from "./pages/FreelancerRegisterPage";

type SignupRole = "company" | "engineer";
type View = "select" | SignupRole;
type CandidateStatus = "hired" | "pending";

const roleOptions = [
  {
    role: "company" as const,
    label: "기업 회원가입",
    description: "프로젝트 조건과 채용 정보를 등록하고 검증된 AI 엔지니어를 추천받습니다.",
    detail: "기업 · 채용 담당자",
    mark: "기",
  },
  {
    role: "engineer" as const,
    label: "AI 엔지니어 회원가입",
    description: "기술 스택과 프로젝트 경험을 등록하고 기업 매칭 기회를 확인합니다.",
    detail: "AI 개발자",
    mark: "A",
  },
];

const companyFields = [
  { label: "기업명", placeholder: "예: Blogle2" },
  { label: "담당자명", placeholder: "예: 김담당" },
  { label: "업무 이메일", placeholder: "name@company.com" },
  { label: "희망 프로젝트 유형", placeholder: "예: AI 챗봇, 문서 자동화" },
];

const engineerFields = [
  { label: "이름", placeholder: "예: 김개발" },
  { label: "이메일", placeholder: "name@email.com" },
  { label: "주요 기술 스택", placeholder: "예: Python, React, LangChain" },
  { label: "대표 프로젝트", placeholder: "예: RAG 기반 사내 검색 서비스" },
];

const benefits = [
  "역할에 맞는 필수 정보만 입력",
  "가입 후 전용 대시보드로 이동",
  "검증·매칭 흐름과 자연스럽게 연결",
];

const candidates = [
  {
    id: "app-001",
    name: "김선성",
    decision: "만족",
    decidedAt: "2026-06-28",
    status: "hired" as const,
    role: "RAG 서비스 개발자",
  },
  {
    id: "app-002",
    name: "최혜덕",
    decision: "불만족",
    decidedAt: "2026-06-28",
    status: "hired" as const,
    role: "AI 문서 자동화 개발자",
  },
  {
    id: "app-003",
    name: "박윤채",
    decision: "만족",
    decidedAt: "2026-06-28",
    status: "pending" as const,
    role: "LLM 백엔드 개발자",
  },
  {
    id: "app-004",
    name: "이현수",
    decision: "만족",
    decidedAt: "2026-06-28",
    status: "pending" as const,
    role: "프롬프트 엔지니어",
  },
];

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash);

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  if (route === "#applications") {
    return <ApplicationStatusPage />;
  }

  if (route === "#freelancer-register") {
    return <FreelancerRegisterPage />;
  }

  return <SignupPage />;
}

function SignupPage() {
  const [view, setView] = useState<View>("select");

  const activeTitle = useMemo(() => {
    if (view === "company") return "기업 회원가입";
    if (view === "engineer") return "AI 엔지니어 회원가입";
    return "회원가입";
  }, [view]);

  const openSignup = (role: SignupRole) => {
    setView(role);
    window.history.replaceState(null, "", `#${role}-signup`);
  };

  const goSelect = () => {
    setView("select");
    window.history.replaceState(null, "", "#signup");
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.logo} aria-label="결브릿지 홈">
          <span style={styles.logoMark}>결</span>
          <span style={styles.logoText}>결브릿지</span>
        </a>
        <span style={styles.headerText}>Verified AI Talent Network</span>
      </header>

      <section style={styles.content}>
        <div style={styles.intro}>
          <span style={styles.eyebrow}>CREATE YOUR ACCOUNT</span>
          <h1 style={styles.heading}>
            {view === "select" ? (
              <>
                역할에 맞게 가입하고,
                <br />
                AI 프로젝트를 시작하세요.
              </>
            ) : (
              <>
                {activeTitle}으로,
                <br />
                필요한 정보만 빠르게 등록하세요.
              </>
            )}
          </h1>
          <p style={styles.lead}>
            Blogle2는 기업과 AI 엔지니어의 가입 흐름을 분리해, 가입 직후 필요한 기능으로 바로 이어지게 구성합니다.
          </p>

          <div style={styles.benefits}>
            {benefits.map((benefit, index) => (
              <div key={benefit} style={styles.benefit}>
                <span style={styles.checkMark}>{index + 1}</span>
                <span style={styles.benefitText}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <section style={styles.panel} aria-labelledby="signup-title">
          {view === "select" ? (
            <SignupSelect onSelect={openSignup} />
          ) : (
            <SignupForm role={view} onBack={goSelect} />
          )}
        </section>
      </section>

      <footer style={styles.footer}>© 2026 결브릿지. All rights reserved.</footer>
    </main>
  );
}

function SignupSelect({ onSelect }: { onSelect: (role: SignupRole) => void }) {
  return (
    <>
      <div style={styles.panelHeader}>
        <p style={styles.panelEyebrow}>WELCOME TO BLOGLE2</p>
        <h2 id="signup-title" style={styles.panelTitle}>회원가입</h2>
        <p style={styles.panelDescription}>가입할 유형을 선택하면 해당 가입 페이지로 바로 이동합니다.</p>
      </div>

      <div style={styles.roleList}>
        {roleOptions.map(({ role, label, description, detail, mark }) => (
          <button key={role} type="button" onClick={() => onSelect(role)} style={styles.roleButton}>
            <span style={styles.iconBox}>{mark}</span>
            <span style={styles.roleCopy}>
              <span style={styles.roleLabel}>{label}</span>
              <span style={styles.roleDescription}>{description}</span>
              <span style={styles.roleDetail}>{detail}</span>
            </span>
            <span style={styles.arrow} aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      <p style={styles.loginPrompt}>
        이미 계정이 있나요? <a href="#login" style={styles.loginLink}>로그인</a>
      </p>
    </>
  );
}

function SignupForm({ role, onBack }: { role: SignupRole; onBack: () => void }) {
  const isCompany = role === "company";
  const fields = isCompany ? companyFields : engineerFields;

  return (
    <>
      <button type="button" onClick={onBack} style={styles.backButton}>
        ← 가입 유형 다시 선택
      </button>

      <div style={styles.panelHeader}>
        <p style={styles.panelEyebrow}>{isCompany ? "COMPANY SIGNUP" : "AI ENGINEER SIGNUP"}</p>
        <h2 id="signup-title" style={styles.panelTitle}>
          {isCompany ? "기업 회원가입" : "AI 엔지니어 회원가입"}
        </h2>
        <p style={styles.panelDescription}>
          {isCompany
            ? "프로젝트 매칭을 위해 기업과 담당자 정보를 입력해 주세요."
            : "검증과 매칭을 위해 기술 역량과 프로젝트 경험을 입력해 주세요."}
        </p>
      </div>

      <form style={styles.form}>
        {fields.map((field) => (
          <label key={field.label} style={styles.field}>
            <span style={styles.fieldLabel}>{field.label}</span>
            <input style={styles.input} placeholder={field.placeholder} />
          </label>
        ))}

        <label style={styles.field}>
          <span style={styles.fieldLabel}>{isCompany ? "요청사항" : "자기소개"}</span>
          <textarea
            style={styles.textarea}
            placeholder={isCompany ? "필요한 역할, 기간, 예산 등을 적어주세요." : "강점, 선호 업무, 가능한 투입 시점을 적어주세요."}
          />
        </label>

        <button type="button" style={styles.primaryButton}>
          {isCompany ? "기업 회원가입 완료" : "AI 엔지니어 회원가입 완료"}
        </button>
      </form>

      <p style={styles.notice}>
        계속 진행하면 Blogle2의 <a href="#terms" style={styles.link}>이용약관</a> 및 <a href="#privacy" style={styles.link}>개인정보 처리방침</a>에 동의하게 됩니다.
      </p>
    </>
  );
}

function ApplicationStatusPage() {
  const [query, setQuery] = useState("");
  const filteredCandidates = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return candidates;
    return candidates.filter((candidate) =>
      [candidate.name, candidate.role, candidate.decision].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }, [query]);

  return (
    <main className="applications-page" style={applicationStyles.page}>
      <header style={applicationStyles.header}>
        <a href="#signup" style={styles.logo} aria-label="결브릿지 홈">
          <span style={styles.logoMark}>결</span>
          <span style={styles.logoText}>결브릿지</span>
        </a>
        <span style={applicationStyles.headerText}>채용담당자 대시보드</span>
      </header>

      <section style={applicationStyles.content}>
        <div className="applications-title-row" style={applicationStyles.titleRow}>
          <div>
            <p style={applicationStyles.eyebrow}>RECRUITER</p>
            <h1 style={applicationStyles.heading}>인력지원현황</h1>
            <p style={applicationStyles.lead}>매칭 인력의 결정 여부와 채용 여부만 확인합니다.</p>
          </div>

          <label className="applications-search" style={applicationStyles.searchBox}>
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 직무, 결정 검색"
              style={applicationStyles.searchInput}
            />
          </label>
        </div>

        <section style={applicationStyles.tablePanel} aria-labelledby="applications-title">
          <h2 id="applications-title" style={applicationStyles.sectionTitle}>지원자 목록</h2>
          <div style={applicationStyles.tableWrap}>
            <table style={applicationStyles.table}>
              <thead>
                <tr>
                  <th style={applicationStyles.th}>매칭인력</th>
                  <th style={applicationStyles.th}>결정여부</th>
                  <th style={applicationStyles.th}>결정일</th>
                  <th style={applicationStyles.th}>채용여부</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td style={applicationStyles.td}>
                      <strong style={applicationStyles.name}>{candidate.name}</strong>
                      <span style={applicationStyles.roleText}>{candidate.role}</span>
                    </td>
                    <td style={applicationStyles.td}>{candidate.decision}</td>
                    <td style={applicationStyles.td}>{candidate.decidedAt}</td>
                    <td style={applicationStyles.td}>
                      <StatusBadge status={candidate.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: CandidateStatus }) {
  const isHired = status === "hired";
  return (
    <span style={isHired ? applicationStyles.hiredBadge : applicationStyles.pendingBadge}>
      {isHired ? "채용" : "미채용"}
    </span>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8f6",
    color: "#17221f",
    fontFamily: "Pretendard, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    width: "calc(100% - 48px)",
    margin: "0 auto",
    borderBottom: "1px solid #e3e8e4",
  },
  logo: { display: "inline-flex", alignItems: "center", gap: "10px", color: "#17221f", textDecoration: "none" },
  logoMark: { display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)", color: "#fff", fontSize: "16px", fontWeight: 850, boxShadow: "0 8px 18px rgba(15, 118, 110, 0.22)" },
  logoText: { fontSize: "22px", fontWeight: 850, letterSpacing: 0, color: "#17221f" },
  headerText: { color: "#64706c", fontSize: "13px" },
  content: { flex: 1, width: "min(1120px, calc(100% - 48px))", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: "64px", alignItems: "center", padding: "64px 0" },
  intro: { maxWidth: "590px" },
  eyebrow: { color: "#0f766e", fontWeight: 750, letterSpacing: "0.08em", fontSize: "12px" },
  heading: { margin: "18px 0 20px", fontSize: "48px", lineHeight: 1.2, letterSpacing: 0, fontWeight: 760 },
  lead: { margin: 0, color: "#53615c", fontSize: "18px", lineHeight: 1.7, maxWidth: "550px" },
  benefits: { display: "grid", gap: "16px", marginTop: "42px" },
  benefit: { display: "flex", alignItems: "center", gap: "13px" },
  checkMark: { display: "grid", placeItems: "center", flex: "0 0 auto", width: "22px", height: "22px", borderRadius: "50%", background: "#d1fae5", color: "#0f766e", fontSize: "11px", fontWeight: 750 },
  benefitText: { color: "#53615c", fontSize: "15px", fontWeight: 650 },
  panel: { background: "#fff", border: "1px solid #dde5e0", borderRadius: "8px", padding: "38px", boxShadow: "0 16px 42px rgba(22, 34, 31, 0.07)" },
  panelHeader: { marginBottom: "28px" },
  panelEyebrow: { margin: "0 0 9px", color: "#0f766e", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 750 },
  panelTitle: { margin: "0 0 9px", fontSize: "26px", lineHeight: 1.3, letterSpacing: 0 },
  panelDescription: { margin: 0, color: "#64706c", fontSize: "14px", lineHeight: 1.6 },
  roleList: { display: "grid", gap: "12px" },
  roleButton: { width: "100%", minHeight: "128px", padding: "18px", border: "1px solid #dce4df", borderRadius: "7px", background: "#fff", display: "flex", alignItems: "center", textAlign: "left", gap: "15px", cursor: "pointer", fontFamily: "inherit", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease" },
  iconBox: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "6px", background: "#ccfbf1", color: "#0f766e", fontWeight: 800 },
  roleCopy: { flex: 1, minWidth: 0 },
  roleLabel: { display: "block", color: "#17221f", fontSize: "16px", fontWeight: 700, marginBottom: "5px" },
  roleDescription: { display: "block", color: "#64706c", fontSize: "13px", lineHeight: 1.45 },
  roleDetail: { display: "block", color: "#0f766e", fontSize: "12px", marginTop: "7px", fontWeight: 650 },
  arrow: { flex: "0 0 auto", color: "#0f766e", fontSize: "20px", lineHeight: 1 },
  backButton: { margin: "0 0 22px", padding: 0, border: 0, background: "transparent", color: "#0f766e", fontFamily: "inherit", fontSize: "13px", fontWeight: 750, cursor: "pointer" },
  form: { display: "grid", gap: "14px" },
  field: { display: "grid", gap: "7px" },
  fieldLabel: { color: "#42534c", fontSize: "13px", fontWeight: 750 },
  input: { height: "46px", border: "1px solid #dce4df", borderRadius: "7px", padding: "0 14px", color: "#17221f", fontFamily: "inherit", fontSize: "14px", outlineColor: "#0f766e", background: "#fbfcfb" },
  textarea: { minHeight: "92px", border: "1px solid #dce4df", borderRadius: "7px", padding: "13px 14px", color: "#17221f", fontFamily: "inherit", fontSize: "14px", lineHeight: 1.5, resize: "vertical", outlineColor: "#0f766e", background: "#fbfcfb" },
  primaryButton: { width: "100%", height: "48px", marginTop: "6px", border: 0, borderRadius: "7px", background: "#0f766e", color: "#fff", fontFamily: "inherit", fontSize: "15px", fontWeight: 750, cursor: "pointer" },
  loginPrompt: { margin: "25px 0 0", color: "#42534c", fontSize: "14px" },
  loginLink: { color: "#0f766e", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" },
  notice: { margin: "22px 0 0", paddingTop: "20px", borderTop: "1px solid #e8ece9", color: "#7a8580", fontSize: "12px", lineHeight: 1.6 },
  link: { color: "#53615c", textUnderlineOffset: "2px" },
  footer: { width: "min(1200px, calc(100% - 48px))", margin: "0 auto", padding: "22px 0 28px", color: "#8b9691", fontSize: "12px", borderTop: "1px solid #e3e8e4" },
};

const applicationStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8f6",
    color: "#202020",
    fontFamily: "Pretendard, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "min(1120px, calc(100% - 48px))",
    margin: "0 auto",
    borderBottom: "1px solid #e3e8e4",
  },
  headerText: { color: "#64706c", fontSize: "13px", fontWeight: 700 },
  content: { width: "min(1120px, calc(100% - 48px))", margin: "0 auto", padding: "42px 0 56px" },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", marginBottom: "22px" },
  eyebrow: { margin: "0 0 8px", color: "#991b1b", fontSize: "12px", letterSpacing: "0.08em", fontWeight: 800 },
  heading: { margin: 0, fontSize: "32px", lineHeight: 1.25, letterSpacing: 0 },
  lead: { margin: "10px 0 0", color: "#64706c", fontSize: "15px", lineHeight: 1.6 },
  searchBox: { height: "42px", minWidth: "260px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #dce4df", borderRadius: "7px", padding: "0 12px", color: "#64706c", background: "#fff" },
  searchInput: { width: "100%", border: 0, outline: 0, background: "transparent", color: "#202020", fontFamily: "inherit", fontSize: "13px" },
  tablePanel: { border: "1px solid #dde5e0", borderRadius: "8px", background: "#fff", padding: "24px", boxShadow: "0 12px 34px rgba(22, 34, 31, 0.06)" },
  sectionTitle: { margin: "0 0 16px", color: "#202020", fontSize: "18px", lineHeight: 1.3 },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "620px" },
  th: { padding: "12px 10px", borderBottom: "1px solid #e5e5e2", background: "#fafafa", color: "#555", textAlign: "left", fontSize: "12px", fontWeight: 800 },
  td: { padding: "14px 10px", borderBottom: "1px solid #eeeeec", color: "#343434", fontSize: "13px", verticalAlign: "middle" },
  name: { display: "block", color: "#202020", fontSize: "14px" },
  roleText: { display: "block", marginTop: "5px", color: "#777", fontSize: "12px" },
  hiredBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "58px", height: "28px", borderRadius: "999px", background: "#dcfce7", color: "#166534", fontSize: "12px", fontWeight: 800 },
  pendingBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "58px", height: "28px", borderRadius: "999px", background: "#f3f4f6", color: "#4b5563", fontSize: "12px", fontWeight: 800 },
};
