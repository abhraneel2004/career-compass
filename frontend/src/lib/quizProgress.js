import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Quiz progress is kept in two places:
// - localStorage, written on every answer, so nothing is lost on a refresh or closed tab
// - Firestore (quizProgress/{uid}), so signed-in users can continue on another device
// Shape: { answers: { [shortKey]: 1-5, workStyles?: string[] }, updatedAt: epoch ms, version }

const VERSION = 1;
const localKey = (uid) => `careerQuizProgress:${uid || "guest"}`;

export function loadLocalProgress(uid) {
  try {
    const raw = localStorage.getItem(localKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalProgress(uid, progress) {
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export async function loadRemoteProgress(uid) {
  const snap = await getDoc(doc(db, "quizProgress", uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveRemoteProgress(uid, progress) {
  await setDoc(doc(db, "quizProgress", uid), progress);
}

export async function clearProgress(uid) {
  try {
    localStorage.removeItem(localKey(uid));
  } catch {
    // Storage unavailable: nothing to clear
  }
  if (uid) {
    await deleteDoc(doc(db, "quizProgress", uid));
  }
}

export function makeProgress(answers) {
  return { answers, updatedAt: Date.now(), version: VERSION };
}

// Keep only answers that still match the current quiz, so a changed question list can't break a resume
export function sanitizeAnswers(answers, questions, workStyleOptions) {
  if (!answers || typeof answers !== "object") return {};
  const validKeys = new Set(questions.map((q) => q.short));
  const clean = {};
  for (const [key, value] of Object.entries(answers)) {
    if (validKeys.has(key) && Number.isInteger(value) && value >= 1 && value <= 5) {
      clean[key] = value;
    }
  }
  if (Array.isArray(answers.workStyles)) {
    clean.workStyles = answers.workStyles.filter((style) => workStyleOptions.includes(style)).slice(0, 5);
  }
  return clean;
}

// Newest of the device copy and the account copy wins
export function pickNewest(...copies) {
  return copies
    .filter((copy) => copy && copy.answers)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
}
