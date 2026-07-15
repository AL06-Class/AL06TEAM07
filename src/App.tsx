import { type CSSProperties, useState } from "react";

type LoginRole = "recruiter" | "candidate" | null;

const roleOptions = [
  {
    role: "recruiter" as const,
    label: "기업 회원 로그인",
    description: "프로젝트 조건을 입력하고 검증된 AI 개발자를 추천받으세요.",
    detail: "기업 · 채용 담당자",
    mark: "기",
  },
  {
    role: "candidate" as const,
    label: "AI 엔지니어 회원 로그인",
    description: "검증 결과와 프로젝트 경험을 관리하고 새로운 기회를 확인하세요.",
    detail: "AI 개발자",
    mark: "A",
  },
];

export default function App() {
  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.logo} aria-label="Blogle2 홈">
          <span style={styles.logoMark}>B</span>
          <span>Blogle2</span>
        </a>
        <span style={styles.headerText}>Verified AI Talent Network</span>
      </header>

      <section style={styles.content}>
        <div style={styles.intro}>
          <span style={styles.eyebrow}>VERIFIED AI DEVELOPMENT</span>
          <h1 style={styles.heading}>
            검증된 실력으로,
            <br />
            AI 프로젝트를 시작하세요.
          </h1>
          <p style={styles.lead}>
            Blogle2는 과제 기반 결과와 프로젝트 경험을 바탕으로 AI 앱 개발자를 연결합니다.
          </p>

          <div style={styles.benefits}>
            <div style={styles.benefit}>
              <span style={styles.checkMark}>1</span>
              <div>
                <strong style={styles.benefitTitle}>과제 기반 검증</strong>
                <span style={styles.benefitText}>말보다 구현 결과로 실력을 확인합니다.</span>
              </div>
            </div>
            <div style={styles.benefit}>
              <span style={styles.checkMark}>2</span>
              <div>
                <strong style={styles.benefitTitle}>명확한 매칭 기준</strong>
                <span style={styles.benefitText}>프로젝트 조건에 맞는 후보를 비교합니다.</span>
              </div>
            </div>
          </div>
        </div>

        <section style={styles.loginPanel} aria-labelledby="login-title">
          <div style={styles.panelHeader}>
            <p style={styles.panelEyebrow}>WELCOME TO BLOGLE2</p>
            <h2 id="login-title" style={styles.panelTitle}>로그인 또는 회원가입</h2>
            <p style={styles.panelDescription}>이용할 서비스를 선택해 주세요.</p>
          </div>

          <div style={styles.roleList}>
            {roleOptions.map(({ role, label, description, detail, mark }) => {
              const isSelected = selectedRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  style={{
                    ...styles.roleButton,
                    ...(isSelected ? styles.roleButtonSelected : {}),
                  }}
                >
                  <span style={{ ...styles.iconBox, ...(isSelected ? styles.iconBoxSelected : {}) }}>
                    {mark}
                  </span>
                  <span style={styles.roleCopy}>
                    <span style={styles.roleLabel}>{label}</span>
                    <span style={styles.roleDescription}>{description}</span>
                    <span style={styles.roleDetail}>{detail}</span>
                  </span>
                  <span style={{ ...styles.arrow, color: isSelected ? "#0f766e" : "#94a3b8" }} aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>

          <div aria-live="polite" style={styles.selectionMessage}>
            {selectedRole === "recruiter" && "기업 회원 로그인을 선택했습니다."}
            {selectedRole === "candidate" && "AI 엔지니어 회원 로그인을 선택했습니다."}
            {!selectedRole && "계정을 선택하면 다음 단계로 이동합니다."}
          </div>

          <p style={styles.signupPrompt}>
            아직 계정이 없나요? <span style={styles.signupLink}>회원가입</span>
          </p>

          <p style={styles.notice}>
            계속 진행하면 Blogle2의 <a href="#terms" style={styles.link}>이용약관</a> 및 <a href="#privacy" style={styles.link}>개인정보 처리방침</a>에 동의하게 됩니다.
          </p>
        </section>
      </section>

      <footer style={styles.footer}>© 2026 Blogle2. All rights reserved.</footer>
    </main>
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
  logo: { display: "inline-flex", alignItems: "center", gap: "9px", color: "#17221f", textDecoration: "none", fontSize: "20px", fontWeight: 750 },
  logoMark: { display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "7px", background: "#0f766e", color: "#fff", fontSize: "15px", fontWeight: 800 },
  headerText: { color: "#64706c", fontSize: "13px" },
  content: { flex: 1, width: "min(1120px, calc(100% - 48px))", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(390px, 460px)", gap: "104px", alignItems: "center", padding: "64px 0" },
  intro: { maxWidth: "580px" },
  eyebrow: { color: "#0f766e", fontWeight: 750, letterSpacing: "0.08em", fontSize: "12px" },
  heading: { margin: "18px 0 20px", fontSize: "48px", lineHeight: 1.2, letterSpacing: 0, fontWeight: 760 },
  lead: { margin: 0, color: "#53615c", fontSize: "18px", lineHeight: 1.7, maxWidth: "530px" },
  benefits: { display: "grid", gap: "18px", marginTop: "42px" },
  benefit: { display: "flex", gap: "13px", alignItems: "flex-start" },
  checkMark: { display: "grid", placeItems: "center", flex: "0 0 auto", width: "20px", height: "20px", marginTop: "1px", borderRadius: "50%", background: "#d1fae5", color: "#0f766e", fontSize: "11px", fontWeight: 750 },
  benefitTitle: { display: "block", fontSize: "15px", marginBottom: "4px" },
  benefitText: { display: "block", color: "#64706c", fontSize: "14px" },
  loginPanel: { background: "#fff", border: "1px solid #dde5e0", borderRadius: "8px", padding: "38px", boxShadow: "0 16px 42px rgba(22, 34, 31, 0.07)" },
  panelHeader: { marginBottom: "28px" },
  panelEyebrow: { margin: "0 0 9px", color: "#0f766e", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 750 },
  panelTitle: { margin: "0 0 9px", fontSize: "26px", lineHeight: 1.3, letterSpacing: 0 },
  panelDescription: { margin: 0, color: "#64706c", fontSize: "14px" },
  roleList: { display: "grid", gap: "12px" },
  roleButton: { width: "100%", minHeight: "122px", padding: "18px", border: "1px solid #dce4df", borderRadius: "7px", background: "#fff", display: "flex", alignItems: "center", textAlign: "left", gap: "15px", cursor: "pointer", fontFamily: "inherit", transition: "border-color 160ms ease, background 160ms ease" },
  roleButtonSelected: { borderColor: "#0f766e", background: "#f0fdfa", boxShadow: "0 0 0 2px rgba(15, 118, 110, 0.12)" },
  iconBox: { flex: "0 0 auto", display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "6px", background: "#eff3f0", color: "#42534c" },
  iconBoxSelected: { background: "#ccfbf1", color: "#0f766e" },
  roleCopy: { flex: 1, minWidth: 0 },
  roleLabel: { display: "block", color: "#17221f", fontSize: "16px", fontWeight: 700, marginBottom: "5px" },
  roleDescription: { display: "block", color: "#64706c", fontSize: "13px", lineHeight: 1.45 },
  roleDetail: { display: "block", color: "#0f766e", fontSize: "12px", marginTop: "7px", fontWeight: 650 },
  arrow: { flex: "0 0 auto", fontSize: "20px", lineHeight: 1 },
  selectionMessage: { minHeight: "20px", marginTop: "17px", color: "#0f766e", fontSize: "13px" },
  signupPrompt: { margin: "25px 0 0", color: "#42534c", fontSize: "14px" },
  signupLink: { color: "#0f766e", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer" },
  notice: { margin: "22px 0 0", paddingTop: "20px", borderTop: "1px solid #e8ece9", color: "#7a8580", fontSize: "12px", lineHeight: 1.6 },
  link: { color: "#53615c", textUnderlineOffset: "2px" },
  footer: { width: "min(1200px, calc(100% - 48px))", margin: "0 auto", padding: "22px 0 28px", color: "#8b9691", fontSize: "12px", borderTop: "1px solid #e3e8e4" },
};
