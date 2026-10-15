import express from "express";
const router = express.Router();
import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";
import { requireUser } from "./auth.js";
import { claimReportSlot, QuizLimitError, releaseReportSlot, saveReport } from "./reportStore.js";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// gemini-3.8-flash is the newest model on the Gemini API free tier. The free tier often
// returns 503 "high demand" for it, so fall back to older free models when that happens.
const models = [
    process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
].filter((m, i, all) => all.indexOf(m) === i);

// Overloaded, rate-limited or temporary server errors: worth trying the next model
const isRetryable = (error) => [429, 500, 503, 504].includes(error?.status);

// The eight quiz guides' fields. Each career is tagged with one so the frontend can show that guide.
// Keep the keys in sync with frontend/src/data/guides.js.
const DOMAINS = {
    priya: "Healthcare and psychology",
    maya: "Design and media",
    marcus: "Business and finance",
    mei: "Data and research",
    ethan: "Engineering and sustainability",
    arjun: "Technology and software",
    claire: "Law and public policy",
    kenji: "Education and mentoring",
};

const CAREER_INSTRUCTIONS = `You are a career counsellor. The user sends their answers to an interest and personality quiz as "question: answer" pairs, where 1 means strongly disagree and 5 means strongly agree, plus the work styles they picked.
Write a personalised career report as JSON matching the given schema:
- summary: 3 or 4 sentences on the user's interests, strengths and how they like to work.
- strengths: 4 to 6 short strength phrases of 1 to 4 words each.
- careers: the 5 best-fit careers, best first. For each: a fit score from 60 to 98 that reflects how well it matches; why it fits in 2 sentences that refer to their answers; 3 or 4 key skills to build, each a few words; a typical education or entry path in 1 or 2 sentences; and the domain it belongs to, chosen from: ${Object.entries(DOMAINS).map(([key, label]) => `${key} (${label})`).join(", ")}, or "other" if none fits.
- nextSteps: 4 or 5 practical next steps, one sentence each, starting with a verb.
Write directly to the user in a warm, encouraging tone. Use plain text only, with no markdown.`;

const REPORT_SCHEMA = {
    type: "object",
    properties: {
        summary: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        careers: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    domain: { type: "string", enum: [...Object.keys(DOMAINS), "other"] },
                    fit: { type: "integer" },
                    why: { type: "string" },
                    skills: { type: "array", items: { type: "string" } },
                    path: { type: "string" },
                },
                required: ["title", "domain", "fit", "why", "skills", "path"],
                propertyOrdering: ["title", "domain", "fit", "why", "skills", "path"],
            },
        },
        nextSteps: { type: "array", items: { type: "string" } },
    },
    required: ["summary", "strengths", "careers", "nextSteps"],
    propertyOrdering: ["summary", "strengths", "careers", "nextSteps"],
};

// Markdown copy of the report, for frontends that still render suggestions.content
const reportToMarkdown = (report) => [
    "# Your Personalised Career Report",
    "## Summary",
    report.summary,
    "## Your Strengths",
    ...report.strengths.map((s) => `- ${s}`),
    "## Top Career Matches",
    ...report.careers.flatMap((c) => [
        `**${c.title}**`,
        c.why,
        `Key skills to build: ${c.skills.join(", ")}.`,
        c.path,
    ]),
    "## Practical Next Steps",
    ...report.nextSteps.map((s) => `- ${s}`),
].join("\n");

const KEYWORD_INSTRUCTIONS = `You help job seekers tailor their resume. The user sends a job description.
List the keywords and phrases their resume should include to match it, grouped under these plain-text headings: Hard skills, Tools and technologies, Soft skills, Certifications and qualifications, Role-specific terms.
Put one keyword per line starting with "- ", skip any group with nothing relevant, and take keywords from the job description itself rather than inventing them.
Do not use markdown formatting such as #, ** or tables, because the answer is shown as plain text.`;

// Calls Gemini and returns a chat-style message ({ role, content }), the shape the frontend reads
const askGemini = async (systemInstruction, content, extraConfig = {}) => {
    for (const [i, model] of models.entries()) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: content,
                config: { systemInstruction, ...extraConfig },
            });

            if (!response.text) {
                throw new Error(`Gemini returned no text (finish reason: ${response.candidates?.[0]?.finishReason ?? "unknown"})`);
            }

            return { role: 'assistant', content: response.text };
        } catch (error) {
            const next = models[i + 1];
            if (!next || !isRetryable(error)) throw error;
            console.warn(`${model} unavailable (${error.status}), trying ${next}`);
        }
    }
};

// Function to get career suggestions, as a structured report
const getCareerReport = async (choices) => {
    const message = await askGemini(CAREER_INSTRUCTIONS, choices, {
        responseMimeType: "application/json",
        responseJsonSchema: REPORT_SCHEMA,
    });
    const report = JSON.parse(message.content);
    report.careers.sort((a, b) => b.fit - a.fit);
    return report;
};

// Function to extract resume keywords
const getResumeKeywords = (jobDescription) =>
    askGemini(KEYWORD_INSTRUCTIONS, jobDescription);

// Route to generate career advice: signed-in users only, one report every 30 days.
// The report is saved to the user's account here, so the limit can't be skipped by calling this directly.
router.post("/career-suggestions", requireUser, async (req, res) => {
    const { choices, workStyles } = req.body;
    if (!choices || typeof choices !== "string" || choices.length > 10000) {
        return res.status(400).json({ error: "Invalid choices format" });
    }
    const styles = Array.isArray(workStyles)
        ? workStyles.filter((s) => typeof s === "string").map((s) => s.slice(0, 40)).slice(0, 5)
        : [];

    try {
        await claimReportSlot(req.uid);
    } catch (error) {
        if (error instanceof QuizLimitError) {
            return res.status(error.status).json({ error: error.message, nextQuizAt: error.nextQuizAt });
        }
        console.error("Error checking the quiz limit:", error?.message);
        return res.status(500).json({ error: "Error generating career suggestions" });
    }

    let report;
    try {
        report = await getCareerReport(choices);
    } catch (error) {
        console.error("Error generating career suggestions:", error?.message);
        await releaseReportSlot(req.uid).catch((e) => console.error("Couldn't release the report slot:", e?.message));
        return res.status(500).json({ error: "Error generating career suggestions" });
    }

    try {
        const entry = await saveReport(req.uid, report, styles);
        res.json({
            report,
            entry,
            suggestions: { role: "assistant", content: reportToMarkdown(report) },
        });
    } catch (error) {
        console.error("Error saving the career report:", error?.message);
        await releaseReportSlot(req.uid).catch((e) => console.error("Couldn't release the report slot:", e?.message));
        res.status(500).json({ error: "Error saving your career report" });
    }
});

// Route to generate resume keywords
router.post("/resume-keywords", async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription || typeof jobDescription !== "string") {
            return res.status(400).json({ error: "Invalid job description format" });
        }

        const keywords = await getResumeKeywords(jobDescription);
        res.json({ keywords });
    } catch (error) {
        console.error("Error generating resume keywords:", error?.message);
        res.status(500).json({ error: "Error generating resume keywords" });
    }
});

export default router;
