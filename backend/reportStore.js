import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebaseAdmin.js";

// Career reports live in pdfResults/{uid}: { reports: [...], lastReportAt, generatingUntil? }
// The same shape the frontend reads in src/lib/reports.js. Only this server writes it.

export const QUIZ_COOLDOWN_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SAVED_REPORTS = 12;
// Long enough for Gemini, including fallbacks; a crashed request frees the slot after this
const GENERATING_LOCK_MS = 3 * 60 * 1000;

export class QuizLimitError extends Error {
    constructor(status, message, nextQuizAt = null) {
        super(message);
        this.status = status;
        this.nextQuizAt = nextQuizAt;
    }
}

const reportDoc = (uid) => db.collection("pdfResults").doc(uid);

// Checks the 30-day limit and marks a report as being generated, in one transaction,
// so two requests at once can't both get through
export async function claimReportSlot(uid) {
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(reportDoc(uid));
        const data = snap.exists ? snap.data() : {};
        const now = Date.now();

        const last = data.lastReportAt?.toMillis?.();
        if (last && now < last + QUIZ_COOLDOWN_DAYS * DAY_MS) {
            const next = new Date(last + QUIZ_COOLDOWN_DAYS * DAY_MS);
            throw new QuizLimitError(429, "You can take the quiz once every 30 days.", next.toISOString());
        }

        const lockedUntil = data.generatingUntil?.toMillis?.();
        if (lockedUntil && now < lockedUntil) {
            throw new QuizLimitError(409, "Your report is already being written.");
        }

        tx.set(reportDoc(uid), { generatingUntil: Timestamp.fromMillis(now + GENERATING_LOCK_MS) }, { merge: true });
    });
}

// Frees the slot when generation fails, so the user can try again
export async function releaseReportSlot(uid) {
    await reportDoc(uid).set({ generatingUntil: FieldValue.delete() }, { merge: true });
}

// Saves the report as the newest entry and starts the 30-day cooldown
export async function saveReport(uid, report, workStyles) {
    const createdAt = Timestamp.now();
    const entry = { id: String(createdAt.toMillis()), createdAt, report, workStyles };

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(reportDoc(uid));
        const existing = snap.exists && Array.isArray(snap.data().reports) ? snap.data().reports : [];
        tx.set(
            reportDoc(uid),
            {
                reports: [entry, ...existing].slice(0, MAX_SAVED_REPORTS),
                lastReportAt: createdAt,
                generatingUntil: FieldValue.delete(),
                // Reports saved before the JSON format; dropped once there's a real one
                markdownText: FieldValue.delete(),
            },
            { merge: true }
        );
    });

    return { ...entry, createdAt: createdAt.toDate().toISOString() };
}
