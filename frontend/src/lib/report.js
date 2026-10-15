import { guides } from "../data/guides";

// A career report, as the backend returns it and as it's saved to the account:
// { summary, strengths: string[], careers: Career[], nextSteps: string[] }
// Career: { title, domain: guide id | "other", fit: 0-100, why, skills: string[], path }

// Matches a career title to the guide whose field it belongs to, for reports without a domain.
// Order matters: software before engineering, data before business.
const domainKeywords = [
  ["arjun", /software|developer|programm|full[- ]stack|front[- ]?end|back[- ]?end|devops|cyber|cloud|\bit\b|web|app|machine learning|\bai\b|tech/i],
  ["mei", /data|analyst|analytics|research|scien|statistic|actuar|quant/i],
  ["priya", /doctor|physician|nurs|health|medic|clinic|therap|psycholog|counsel|pharm|dent|care/i],
  ["claire", /law|legal|lawyer|attorney|policy|compliance|paralegal|diplomat|government|public sector/i],
  ["kenji", /teach|educat|tutor|train|mentor|coach|lectur|professor|instruct|curriculum|academic/i],
  ["maya", /design|creative|art|media|ux|ui\b|brand|content|writer|film|photo|animat|illustrat|journal/i],
  ["ethan", /engineer|architect|sustainab|environment|construct|civil|mechanical|energy|urban|planner/i],
  ["marcus", /business|manag|consult|financ|market|sales|entrepreneur|founder|strateg|operations|account|bank|invest|product|executive|officer|hr\b|human resources/i],
];

export function inferDomain(title = "") {
  const match = domainKeywords.find(([, pattern]) => pattern.test(title));
  return match ? match[0] : "other";
}

export function guideFor(career) {
  return guides[career?.domain] || null;
}

const text = (value) => (typeof value === "string" ? value.trim() : "");
const list = (value) => (Array.isArray(value) ? value.map(text).filter(Boolean) : []);

// Fills gaps and drops anything malformed, so the UI and PDF can trust the shape
export function normalizeReport(raw) {
  if (!raw || typeof raw !== "object") return null;
  const careers = (Array.isArray(raw.careers) ? raw.careers : [])
    .map((career) => {
      const title = text(career?.title);
      if (!title) return null;
      const fit = Math.round(Number(career.fit));
      return {
        title,
        domain: guides[career.domain] ? career.domain : inferDomain(title),
        fit: Number.isFinite(fit) && fit > 0 ? Math.min(fit, 99) : null,
        why: text(career.why),
        skills: list(career.skills),
        path: text(career.path),
      };
    })
    .filter(Boolean);

  const report = {
    summary: text(raw.summary),
    strengths: list(raw.strengths),
    careers,
    nextSteps: list(raw.nextSteps),
  };
  return report.summary || careers.length ? report : null;
}

const stripMarkdown = (line) => line.replace(/\*\*/g, "").replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();

// Reads reports saved before the backend returned JSON. They follow the old prompt:
// "## " sections, a "**Career**" line, then why / "Key skills…" / "A typical education…" lines.
export function parseMarkdownReport(markdown) {
  if (typeof markdown !== "string" || !markdown.trim()) return null;
  const report = { summary: "", strengths: [], careers: [], nextSteps: [] };
  let section = "summary";
  let career = null;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("# ")) continue;

    if (line.startsWith("##")) {
      const heading = line.replace(/^#+\s*/, "").toLowerCase();
      career = null;
      if (/career|match|fit/.test(heading)) section = "careers";
      else if (/next|step|action/.test(heading)) section = "nextSteps";
      else if (/strength/.test(heading)) section = "strengths";
      else section = "summary";
      continue;
    }

    if (section === "careers" && /^\*\*.+\*\*:?$/.test(line)) {
      career = { title: stripMarkdown(line).replace(/:$/, ""), why: "", skills: [], path: "" };
      report.careers.push(career);
      continue;
    }

    const content = stripMarkdown(line);
    if (section === "careers" && career) {
      const skills = content.match(/^key skills(?: to build)?(?: include)?:?\s*(.+)$/i);
      if (skills) {
        career.skills = skills[1]
          .replace(/\.$/, "")
          .split(/,\s*(?:and\s+)?|\s+and\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (/^(a typical|typical|education|entry path)/i.test(content)) {
        career.path = content;
      } else {
        career.why = career.why ? `${career.why} ${content}` : content;
      }
    } else if (section === "nextSteps") {
      report.nextSteps.push(content);
    } else if (section === "strengths") {
      report.strengths.push(content);
    } else if (section === "summary") {
      report.summary = report.summary ? `${report.summary} ${content}` : content;
    }
  }

  return normalizeReport(report);
}

export function firstName(user) {
  const name = user?.displayName?.trim() || user?.email?.split("@")[0] || "";
  return name.split(/\s+/)[0] || "";
}

export function formatDate(date) {
  return date ? date.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" }) : "";
}
