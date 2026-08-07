import { collection, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { firebaseApp } from "../lib/firebase";

export type Company = { id: string; name: string };
export type Warranty = { id: string; companyId: string; totalCount: number; usedCount: number; startedAt: string; endsAt: string };
export type WarrantyIssueStatus = "pending" | "inProgress" | "completed";
export type WarrantyIssue = { id: string; companyId: string; title: string; ownerName: string; status: WarrantyIssueStatus; actionTaken: string; reportedAt: string };

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asNumber = (value: unknown) => (typeof value === "number" ? value : 0);

export async function getCompanies(): Promise<Company[]> {
  if (!firebaseApp) return [];
  const snapshot = await getDocs(collection(getFirestore(firebaseApp), "companies"));
  return snapshot.docs.map((document) => ({ id: document.id, name: asString(document.data().name) })).filter((company) => company.name);
}

export async function getCompanySupport(companyId: string): Promise<{ warranty: Warranty | null; issues: WarrantyIssue[] }> {
  if (!firebaseApp || !companyId) return { warranty: null, issues: [] };
  const database = getFirestore(firebaseApp);
  const [warrantiesSnapshot, issuesSnapshot] = await Promise.all([
    getDocs(query(collection(database, "warranties"), where("companyId", "==", companyId), limit(1))),
    getDocs(query(collection(database, "warrantyIssues"), where("companyId", "==", companyId))),
  ]);
  const warrantyDocument = warrantiesSnapshot.docs[0];
  const warranty = warrantyDocument ? { id: warrantyDocument.id, companyId, totalCount: asNumber(warrantyDocument.data().totalCount), usedCount: asNumber(warrantyDocument.data().usedCount), startedAt: asString(warrantyDocument.data().startedAt), endsAt: asString(warrantyDocument.data().endsAt) } : null;
  const issues = issuesSnapshot.docs.map((document) => ({ id: document.id, companyId, title: asString(document.data().title), ownerName: asString(document.data().ownerName), status: document.data().status as WarrantyIssueStatus, actionTaken: asString(document.data().actionTaken), reportedAt: asString(document.data().reportedAt) })).sort((first, second) => second.reportedAt.localeCompare(first.reportedAt));
  return { warranty, issues };
}
