import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, writeBatch } from "firebase/firestore";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const database = getFirestore(initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}));

const companies = [
  { id: "sample-company-01", name: "주식회사 블로글" },
  { id: "sample-company-02", name: "넥스트워크" },
  { id: "sample-company-03", name: "데이터웨이브" },
  { id: "sample-company-04", name: "플로우랩" },
  { id: "sample-company-05", name: "모멘텀픽" },
];

const warranties = [
  { id: "sample-warranty-01", companyId: "sample-company-01", totalCount: 3, usedCount: 0, startedAt: "2026-07-01", endsAt: "2027-07-01" },
  { id: "sample-warranty-02", companyId: "sample-company-02", totalCount: 3, usedCount: 1, startedAt: "2026-06-15", endsAt: "2027-06-15" },
  { id: "sample-warranty-03", companyId: "sample-company-03", totalCount: 2, usedCount: 1, startedAt: "2026-05-20", endsAt: "2027-05-20" },
  { id: "sample-warranty-04", companyId: "sample-company-04", totalCount: 3, usedCount: 2, startedAt: "2026-04-10", endsAt: "2027-04-10" },
  { id: "sample-warranty-05", companyId: "sample-company-05", totalCount: 1, usedCount: 0, startedAt: "2026-08-01", endsAt: "2027-08-01" },
];

const issues = [
  { id: "sample-issue-01", warrantyId: "sample-warranty-01", companyId: "sample-company-01", title: "초기 개발 환경 설정 확인", ownerName: "김민지", status: "completed", actionTaken: "개발 환경 점검 및 설정 가이드 전달 완료", reportedAt: "2026-07-03" },
  { id: "sample-issue-02", warrantyId: "sample-warranty-02", companyId: "sample-company-02", title: "배포 후 알림 기능 오류", ownerName: "이도윤", status: "inProgress", actionTaken: "원인 분석 및 수정 배포 진행 중", reportedAt: "2026-08-05" },
  { id: "sample-issue-03", warrantyId: "sample-warranty-03", companyId: "sample-company-03", title: "관리자 계정 권한 요청", ownerName: "박서연", status: "completed", actionTaken: "관리자 권한 부여 완료", reportedAt: "2026-06-02" },
  { id: "sample-issue-04", warrantyId: "sample-warranty-04", companyId: "sample-company-04", title: "대체 인력 투입 문의", ownerName: "최하늘", status: "pending", actionTaken: "담당 PM 확인 대기", reportedAt: "2026-08-06" },
  { id: "sample-issue-05", warrantyId: "sample-warranty-05", companyId: "sample-company-05", title: "프로젝트 인수인계 자료 요청", ownerName: "정우진", status: "inProgress", actionTaken: "인수인계 문서 정리 중", reportedAt: "2026-08-04" },
];

const guides = [
  { id: "sample-guide-01", companyId: "sample-company-01", escalationSteps: [{ title: "대시보드 확인", description: "보증 현황과 이슈 내용을 확인합니다." }, { title: "담당 PM 요청", description: "담당자에게 보증 실행을 요청합니다." }, { title: "대체 개발자 투입", description: "후보자를 매칭해 인수인계를 진행합니다." }], referenceCards: [{ guideType: "hotline", subtitle: "지원 문의 안내", items: ["담당자: 배정 예정", "지원 문의: 고객센터", "응답 목표: 24시간 이내"] }, { guideType: "replacement", subtitle: "RAG 개발 인력 교체", items: ["후보자 2명 확보", "24시간 내 후보 안내", "7일 내 인수인계"] }, { guideType: "documents", subtitle: "프로젝트 참고 자료", items: ["RAG 검색 PRD", "운영 인수인계 문서", "서비스 아키텍처"] }, { guideType: "checklist", subtitle: "교체 전 확인", items: ["Git 권한 확인", "API 키 전달", "운영 이력 점검"] }] },
  { id: "sample-guide-02", companyId: "sample-company-02", escalationSteps: [{ title: "오류 접수", description: "알림 오류 화면과 발생 시간을 기록합니다." }, { title: "원인 분석", description: "담당자가 로그를 확인합니다." }, { title: "수정 배포", description: "검증 후 수정본을 배포합니다." }], referenceCards: [{ guideType: "hotline", subtitle: "지원 문의 안내", items: ["담당자: 배정 예정", "지원 문의: 고객센터", "응답 목표: 영업일 4시간 이내"] }, { guideType: "replacement", subtitle: "알림 서비스 대응", items: ["백업 담당자 1명", "당일 원인 분석", "다음 배포 일정 안내"] }, { guideType: "documents", subtitle: "알림 기능 자료", items: ["알림 기능 명세", "배포 체크리스트", "장애 대응 기록"] }, { guideType: "checklist", subtitle: "배포 전 확인", items: ["테스트 알림 발송", "오류 로그 확인", "배포 결과 공유"] }] },
  { id: "sample-guide-03", companyId: "sample-company-03", escalationSteps: [{ title: "요청 내용 확인", description: "권한 요청 범위와 계정을 확인합니다." }, { title: "권한 승인", description: "담당자가 권한을 부여합니다." }, { title: "접속 점검", description: "기업 담당자가 접속 여부를 확인합니다." }], referenceCards: [{ guideType: "hotline", subtitle: "지원 문의 안내", items: ["담당자: 배정 예정", "지원 문의: 고객센터", "응답 목표: 영업일 1일 이내"] }, { guideType: "replacement", subtitle: "데이터 운영 지원", items: ["데이터 담당자 배정", "권한 요청 우선 처리", "접속 이력 점검"] }, { guideType: "documents", subtitle: "권한 관리 자료", items: ["관리자 권한 안내", "계정 운영 정책", "접속 이력 문서"] }, { guideType: "checklist", subtitle: "권한 부여 확인", items: ["대상 계정 확인", "최소 권한 적용", "접속 테스트 완료"] }] },
  { id: "sample-guide-04", companyId: "sample-company-04", escalationSteps: [{ title: "투입 요청 접수", description: "필요한 역할과 일정을 확인합니다." }, { title: "후보자 제안", description: "예비 인력 후보를 안내합니다." }, { title: "인수인계 진행", description: "업무 자료와 접근 권한을 전달합니다." }], referenceCards: [{ guideType: "hotline", subtitle: "지원 문의 안내", items: ["담당자: 배정 예정", "지원 문의: 고객센터", "긴급 건 우선 확인"] }, { guideType: "replacement", subtitle: "대체 인력 투입", items: ["후보자 3명 확보", "48시간 내 투입 논의", "인수인계 일정 협의"] }, { guideType: "documents", subtitle: "인력 교체 자료", items: ["업무 인수인계서", "역할 정의서", "프로젝트 일정표"] }, { guideType: "checklist", subtitle: "투입 전 확인", items: ["필요 기술 확인", "접근 권한 발급", "업무 범위 공유"] }] },
  { id: "sample-guide-05", companyId: "sample-company-05", escalationSteps: [{ title: "자료 요청 확인", description: "필요한 인수인계 자료를 정리합니다." }, { title: "문서 전달", description: "담당자가 문서를 공유합니다." }, { title: "전달 완료 확인", description: "기업 담당자가 자료 수신을 확인합니다." }], referenceCards: [{ guideType: "hotline", subtitle: "지원 문의 안내", items: ["담당자: 배정 예정", "지원 문의: 고객센터", "응답 목표: 영업일 1일 이내"] }, { guideType: "replacement", subtitle: "인수인계 지원", items: ["문서 담당자 배정", "필요 자료 목록 확인", "전달 일정 안내"] }, { guideType: "documents", subtitle: "인수인계 자료", items: ["프로젝트 개요서", "기술 아키텍처", "운영 매뉴얼"] }, { guideType: "checklist", subtitle: "자료 전달 확인", items: ["문서 링크 확인", "접근 권한 확인", "수신 완료 기록"] }] },
];

const documents = [
  ...companies.map((item) => ["companies", item.id, item]),
  ...warranties.map((item) => ["warranties", item.id, item]),
  ...issues.map((item) => ["warrantyIssues", item.id, item]),
  ...guides.map((item) => ["companySupportGuides", item.id, item]),
];

const existing = await Promise.all(documents.map(([collectionName, id]) => getDoc(doc(database, collectionName, id))));
const batch = writeBatch(database);
let written = 0;

documents.forEach(([collectionName, id, data], index) => {
  if (!existing[index].exists() || collectionName === "companySupportGuides") {
    batch.set(doc(database, collectionName, id), { ...data, createdAt: "2026-08-07", updatedAt: "2026-08-07" });
    written += 1;
  }
});

if (written) await batch.commit();
console.log(`${written}개의 예시 데이터를 반영했습니다.`);
process.exit(0);
