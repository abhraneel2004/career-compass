import { jsPDF } from "jspdf";
import { guideFor, formatDate } from "./report";

// Brand colours from index.css, as RGB for jsPDF
const C = {
  ink: [23, 32, 51],
  inkSoft: [91, 101, 119],
  line: [230, 232, 238],
  surface: [246, 247, 249],
  night: [24, 33, 50],
  accent: [201, 72, 12],
  accentBright: [232, 89, 12],
  peach: [255, 232, 217],
  white: [255, 255, 255],
};

const toneHex = {
  "bg-mint": "#DDF6E9",
  "bg-lilac": "#EEE6FF",
  "bg-peach": "#FFE8D9",
  "bg-sky": "#E3EEFF",
  "bg-butter": "#FFF3C9",
  "bg-rose": "#FFE4EC",
};

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18; // page margin
const CONTENT_W = PAGE_W - M * 2;
const BOTTOM = PAGE_H - 20;

// The built-in PDF fonts only cover Latin-1, so swap typographic characters for plain ones
const clean = (value = "") =>
  String(value)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\xFF]/g, "");

// Guide photo cropped to a circle on its tint, as a PNG data URL
const loadAvatar = (guide) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 160;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = toneHex[guide.tone] || "#F6F7F9";
        ctx.fillRect(0, 0, size, size);
        // Cover the circle, keeping the top of the photo (the face) in view
        const scale = size / Math.min(img.width, img.height);
        const w = img.width * scale;
        ctx.drawImage(img, (size - w) / 2, 0, w, img.height * scale);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = guide.image;
  });

export async function downloadReportPdf(report, { name = "", createdAt = null } = {}) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  const setText = (size, style = "normal", color = C.ink) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };
  const lineHeight = (size) => size * 0.3528; // pt to mm
  const wrap = (value, width, size, style = "normal") => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    return pdf.splitTextToSize(clean(value), width);
  };
  const ensureSpace = (height) => {
    if (y + height > BOTTOM) {
      pdf.addPage();
      y = M + 4;
    }
  };
  const paragraph = (value, x, width, size = 10.5, color = C.inkSoft, style = "normal") => {
    const lines = wrap(value, width, size, style);
    setText(size, style, color);
    pdf.text(lines, x, y, { lineHeightFactor: 1.45, baseline: "top" });
    y += lines.length * lineHeight(size) * 1.45;
  };
  const sectionTitle = (title) => {
    ensureSpace(22);
    pdf.setFillColor(...C.accentBright);
    pdf.roundedRect(M, y + 0.6, 1.4, 5.2, 0.7, 0.7, "F");
    setText(14, "bold");
    pdf.text(clean(title), M + 4.5, y, { baseline: "top" });
    y += 10;
  };

  // Header band
  pdf.setFillColor(...C.night);
  pdf.rect(0, 0, PAGE_W, 54, "F");
  pdf.setFillColor(...C.white);
  pdf.circle(M + 5, 17, 5, "F");
  pdf.setFillColor(...C.night);
  pdf.triangle(M + 5, 17, M + 6.15, 17, M + 5, 20.6, "F");
  pdf.triangle(M + 5, 17, M + 3.85, 17, M + 5, 20.6, "F");
  pdf.setFillColor(...C.accentBright);
  pdf.triangle(M + 5, 13.4, M + 6.15, 17, M + 3.85, 17, "F");
  setText(12, "bold", C.white);
  pdf.text("Career Compass", M + 13, 18.2);
  setText(9, "normal", [190, 197, 210]);
  pdf.text(clean(formatDate(createdAt || new Date())), PAGE_W - M, 18.2, { align: "right" });

  setText(24, "bold", C.white);
  pdf.text(clean(name ? `${name}'s career report` : "Your career report"), M, 38);
  setText(10.5, "normal", [190, 197, 210]);
  pdf.text("Your strengths, best-fit careers and next steps, based on your quiz answers.", M, 46);
  y = 66;

  // Summary
  if (report.summary) {
    sectionTitle("Summary");
    paragraph(report.summary, M, CONTENT_W, 11);
    y += 6;
  }

  // Strengths as pills
  if (report.strengths.length) {
    sectionTitle("Your strengths");
    setText(9.5, "bold");
    let x = M;
    for (const strength of report.strengths) {
      const label = clean(strength);
      const w = pdf.getTextWidth(label) + 8;
      if (x + w > PAGE_W - M) {
        x = M;
        y += 10;
      }
      ensureSpace(10);
      pdf.setFillColor(...C.peach);
      pdf.roundedRect(x, y, w, 7.5, 3.75, 3.75, "F");
      setText(9.5, "bold");
      pdf.text(label, x + 4, y + 4.9);
      x += w + 3;
    }
    y += 16;
  }

  // Career matches as cards
  if (report.careers.length) {
    const avatars = {};
    await Promise.all(
      [...new Set(report.careers.map((c) => c.domain))].map(async (domain) => {
        const guide = guideFor({ domain });
        if (guide) avatars[domain] = await loadAvatar(guide);
      })
    );

    sectionTitle("Your best-fit careers");
    report.careers.forEach((career, index) => {
      const guide = guideFor(career);
      const pad = 6;
      const innerX = M + pad;
      const innerW = CONTENT_W - pad * 2;
      const headW = innerW - (guide ? 17 : 0) - 24;

      const titleLines = wrap(career.title, headW, 13, "bold");
      const whyLines = career.why ? wrap(career.why, innerW, 10) : [];
      const skillLines = career.skills.length ? wrap(career.skills.join("   ·   "), innerW, 9.5, "bold") : [];
      const pathLines = career.path ? wrap(career.path, innerW, 10) : [];
      const block = (lines, size) => lines.length * lineHeight(size) * 1.45;

      const headH = Math.max(14, titleLines.length * lineHeight(13) * 1.25 + (guide ? 6 : 0) + (career.fit ? 5 : 0));
      const height =
        pad + headH + 4 +
        (whyLines.length ? block(whyLines, 10) + 4 : 0) +
        (skillLines.length ? 5 + block(skillLines, 9.5) + 4 : 0) +
        (pathLines.length ? 5 + block(pathLines, 10) : 0) +
        pad;

      ensureSpace(height + 5);
      const top = y;
      pdf.setDrawColor(...C.line);
      pdf.setLineWidth(0.3);
      pdf.setFillColor(...C.white);
      pdf.roundedRect(M, top, CONTENT_W, height, 3.5, 3.5, "FD");
      if (index === 0) {
        pdf.setFillColor(...C.accentBright);
        pdf.roundedRect(M, top, 1.6, height, 0.8, 0.8, "F");
      }

      let headX = innerX;
      if (guide && avatars[career.domain]) {
        pdf.addImage(avatars[career.domain], "PNG", innerX, top + pad, 13, 13);
        headX += 17;
      }

      y = top + pad;
      setText(13, "bold");
      pdf.text(titleLines, headX, y, { baseline: "top", lineHeightFactor: 1.25 });
      y += titleLines.length * lineHeight(13) * 1.25 + 1;
      if (guide) {
        setText(9, "normal", C.inkSoft);
        pdf.text(clean(`${guide.domain} · Guide: ${guide.name}, ${guide.role}`), headX, y, { baseline: "top" });
        y += 5;
      }
      if (career.fit) {
        setText(12, "bold", C.accent);
        pdf.text(`${career.fit}%`, PAGE_W - M - pad, top + pad, { align: "right", baseline: "top" });
        setText(8, "normal", C.inkSoft);
        pdf.text("fit", PAGE_W - M - pad, top + pad + 5.5, { align: "right", baseline: "top" });
        const barW = Math.min(60, headW);
        pdf.setFillColor(...C.surface);
        pdf.roundedRect(headX, y + 0.5, barW, 1.8, 0.9, 0.9, "F");
        pdf.setFillColor(...C.accentBright);
        pdf.roundedRect(headX, y + 0.5, (barW * career.fit) / 100, 1.8, 0.9, 0.9, "F");
      }
      y = top + pad + headH + 4;

      if (whyLines.length) {
        setText(10, "normal", C.ink);
        pdf.text(whyLines, innerX, y, { baseline: "top", lineHeightFactor: 1.45 });
        y += block(whyLines, 10) + 4;
      }
      if (skillLines.length) {
        setText(8, "bold", C.accent);
        pdf.text("SKILLS TO BUILD", innerX, y, { baseline: "top", charSpace: 0.3 });
        y += 5;
        setText(9.5, "bold", C.ink);
        pdf.text(skillLines, innerX, y, { baseline: "top", lineHeightFactor: 1.45 });
        y += block(skillLines, 9.5) + 4;
      }
      if (pathLines.length) {
        setText(8, "bold", C.accent);
        pdf.text("HOW TO GET THERE", innerX, y, { baseline: "top", charSpace: 0.3 });
        y += 5;
        setText(10, "normal", C.inkSoft);
        pdf.text(pathLines, innerX, y, { baseline: "top", lineHeightFactor: 1.45 });
      }
      y = top + height + 5;
    });
    y += 4;
  }

  // Next steps, numbered
  if (report.nextSteps.length) {
    sectionTitle("Your next steps");
    report.nextSteps.forEach((step, index) => {
      const lines = wrap(step, CONTENT_W - 12, 10.5);
      ensureSpace(lines.length * lineHeight(10.5) * 1.45 + 4);
      pdf.setFillColor(...C.night);
      pdf.circle(M + 3.2, y + 2.4, 3.2, "F");
      setText(8.5, "bold", C.white);
      pdf.text(String(index + 1), M + 3.2, y + 3.4, { align: "center" });
      setText(10.5, "normal", C.ink);
      pdf.text(lines, M + 11, y, { baseline: "top", lineHeightFactor: 1.45 });
      y += lines.length * lineHeight(10.5) * 1.45 + 4;
    });
  }

  // Footer on every page
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setDrawColor(...C.line);
    pdf.setLineWidth(0.3);
    pdf.line(M, PAGE_H - 13, PAGE_W - M, PAGE_H - 13);
    setText(8, "normal", C.inkSoft);
    pdf.text("Career Compass career report", M, PAGE_H - 8.5);
    pdf.text(`Page ${page} of ${pages}`, PAGE_W - M, PAGE_H - 8.5, { align: "right" });
  }

  const fileName = `${(name || "My").replace(/[^\w-]+/g, "_")}_Career_Report.pdf`;
  pdf.save(fileName);
}
