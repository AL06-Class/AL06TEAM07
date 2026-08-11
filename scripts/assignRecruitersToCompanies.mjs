import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Configstore = require("configstore");
const { getAccessToken } = require("firebase-tools/lib/auth");

const projectId = "al06team7";
const databasePath = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const dryRun = process.argv.includes("--dry-run");
const config = new Configstore("firebase-tools");
const tokens = config.get("tokens");

if (!tokens?.refresh_token) {
  throw new Error("Firebase CLI 로그인 정보를 찾을 수 없습니다. firebase login 후 다시 실행하세요.");
}

const accessToken = await getAccessToken(tokens.refresh_token, ["https://www.googleapis.com/auth/cloud-platform"]);
const headers = { Authorization: `Bearer ${accessToken.access_token}`, "Content-Type": "application/json" };

async function runQuery(collectionId) {
  const response = await fetch(`${databasePath}:runQuery`, {
    method: "POST",
    headers,
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId }] } }),
  });
  if (!response.ok) throw new Error(`${collectionId} 조회 실패: ${await response.text()}`);
  const rows = await response.json();
  return rows.filter((row) => row.document).map((row) => row.document);
}

const [users, companies] = await Promise.all([runQuery("users"), runQuery("companies")]);
const recruiters = users.filter((user) => user.fields?.role?.stringValue === "recruiter");

if (!companies.length) throw new Error("배정할 companies 문서가 없습니다.");
if (!recruiters.length) throw new Error("role이 recruiter인 users 문서가 없습니다.");

const assignments = recruiters.map((user) => {
  const company = companies[Math.floor(Math.random() * companies.length)];
  return {
    userId: user.name.split("/").pop(),
    companyId: company.name.split("/").pop(),
  };
});

if (dryRun) {
  console.log(`recruiter ${assignments.length}명에게 companies ${companies.length}개 중 무작위 배정을 준비했습니다.`);
} else {
  await Promise.all(assignments.map(async ({ userId, companyId }) => {
    const response = await fetch(`${databasePath}/users/${userId}?updateMask.fieldPaths=companyId&updateMask.fieldPaths=updatedAt`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        fields: {
          companyId: { stringValue: companyId },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });
    if (!response.ok) throw new Error(`${userId} 배정 실패: ${await response.text()}`);
  }));

  console.log(`recruiter ${assignments.length}명에게 무작위 companyId를 배정했습니다.`);
}
