import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { normalizeReport, parseMarkdownReport } from "./report";

// Saved reports live in pdfResults/{uid}:
// { reports: [{ id, createdAt, report, workStyles }], lastReportAt }, newest first.
// Older documents only have { markdownText }; those are read as a single undated report.
// Only the backend writes here (backend/reportStore.js), which also enforces the 30-day limit.

// One quiz per user every 30 days
export const QUIZ_COOLDOWN_DAYS = 30;

const toDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : null);

export async function loadReports(uid) {
  const snap = await getDoc(doc(db, "pdfResults", uid));
  if (!snap.exists()) return { reports: [], lastReportAt: null };
  const data = snap.data();

  let reports = (Array.isArray(data.reports) ? data.reports : [])
    .map((entry) => ({
      id: entry.id,
      createdAt: toDate(entry.createdAt),
      workStyles: Array.isArray(entry.workStyles) ? entry.workStyles : [],
      report: normalizeReport(entry.report),
    }))
    .filter((entry) => entry.report);

  if (reports.length === 0 && data.markdownText) {
    const legacy = parseMarkdownReport(data.markdownText);
    if (legacy) reports = [{ id: "legacy", createdAt: null, workStyles: [], report: legacy }];
  }

  return { reports, lastReportAt: toDate(data.lastReportAt) };
}

// When the user can take the quiz again, or null if they can take it now
export function nextQuizDate(lastReportAt) {
  if (!lastReportAt) return null;
  const next = new Date(lastReportAt.getTime() + QUIZ_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  return next > new Date() ? next : null;
}

export function daysUntil(date) {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}
