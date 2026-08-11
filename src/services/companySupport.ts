import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { firebaseApp } from "../lib/firebase";

export type Company = { id: string; name: string };
export type Warranty = { id: string; companyId: string; totalCount: number; usedCount: number; startedAt: string; endsAt: string };
export type WarrantyIssueStatus = "pending" | "inProgress" | "completed";
export type WarrantyIssue = { id: string; companyId: string; title: string; ownerName: string; status: WarrantyIssueStatus; actionTaken: string; reportedAt: string };
export type SupportGuideCardType = "hotline" | "replacement" | "documents" | "checklist";
export type CompanySupportGuide = {
  id: string;
  companyId: string;
  escalationSteps: { title: string; description: string }[];
  referenceCards: { guideType: SupportGuideCardType; subtitle: string; items: string[] }[];
};

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asNumber = (value: unknown) => (typeof value === "number" ? value : 0);
const asStringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const asRecordArray = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item)) : [];

export async function getCompanies(): Promise<Company[]> {
  if (!firebaseApp) return [];
  const snapshot = await getDocs(collection(getFirestore(firebaseApp), "companies"));
  return snapshot.docs.map((document) => ({ id: document.id, name: asString(document.data().name) })).filter((company) => company.name);
}

export async function getCompanySupport(companyId: string): Promise<{ warranty: Warranty | null; issues: WarrantyIssue[]; guide: CompanySupportGuide | null }> {
  if (!firebaseApp || !companyId) return { warranty: null, issues: [], guide: null };
  const database = getFirestore(firebaseApp);
  const [warrantiesSnapshot, issuesSnapshot, guidesSnapshot] = await Promise.all([
    getDocs(query(collection(database, "warranties"), where("companyId", "==", companyId), limit(1))),
    getDocs(query(collection(database, "warrantyIssues"), where("companyId", "==", companyId))),
    getDocs(query(collection(database, "companySupportGuides"), where("companyId", "==", companyId), limit(1))),
  ]);
  const warrantyDocument = warrantiesSnapshot.docs[0];
  const warranty = warrantyDocument ? { id: warrantyDocument.id, companyId, totalCount: asNumber(warrantyDocument.data().totalCount), usedCount: asNumber(warrantyDocument.data().usedCount), startedAt: asString(warrantyDocument.data().startedAt), endsAt: asString(warrantyDocument.data().endsAt) } : null;
  const issues = issuesSnapshot.docs.map((document) => ({ id: document.id, companyId, title: asString(document.data().title), ownerName: asString(document.data().ownerName), status: document.data().status as WarrantyIssueStatus, actionTaken: asString(document.data().actionTaken), reportedAt: asString(document.data().reportedAt) })).sort((first, second) => second.reportedAt.localeCompare(first.reportedAt));
  const guideDocument = guidesSnapshot.docs[0];
  const guide = guideDocument ? {
    id: guideDocument.id,
    companyId,
    escalationSteps: asRecordArray(guideDocument.data().escalationSteps).map((step) => ({ title: asString(step.title), description: asString(step.description) })).filter((step) => step.title),
    referenceCards: asRecordArray(guideDocument.data().referenceCards).map((card) => ({ guideType: asString(card.guideType) as SupportGuideCardType, subtitle: asString(card.subtitle), items: asStringArray(card.items) })).filter((card) => ["hotline", "replacement", "documents", "checklist"].includes(card.guideType)),
  } : null;
  return { warranty, issues, guide };
}

export async function getCompanyIdForUser(userId: string): Promise<string> {
  if (!firebaseApp || !userId) return "";
  const userSnapshot = await getDoc(doc(getFirestore(firebaseApp), "users", userId));
  return userSnapshot.exists() ? asString(userSnapshot.data().companyId) : "";
}
