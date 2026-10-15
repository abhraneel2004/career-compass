import { doc, getDoc, setDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import { db } from "../firebase";
import { levelFor, resumeTasks } from "../data/resumeSteps";

// The user's resume lives on their account document, users/{uid}.resume:
// { values: { name, email, phone, education, linkedin, github },
//   experiences, skills, projects, achievements, courses, updatedAt }

const emptyValues = { name: "", email: "", phone: "", education: "", linkedin: "", github: "" };
const rows = (value, empty) => (Array.isArray(value) && value.length ? value.map((row) => ({ ...empty, ...row })) : [{ ...empty }]);

export const emptyRows = {
  experiences: { company: "", role: "", startDate: "", endDate: "" },
  projects: { title: "", description: "", technologies: "", link: "" },
  achievements: { title: "", role: "" },
  courses: { title: "", provider: "", date: "" },
};

// Fills gaps so an old or partial save still loads into the builder
export function normalizeResume(raw) {
  if (!raw || typeof raw !== "object" || !raw.values) return null;
  return {
    values: { ...emptyValues, ...raw.values },
    experiences: rows(raw.experiences, emptyRows.experiences),
    skills: Array.isArray(raw.skills) ? raw.skills.filter((s) => typeof s === "string") : [],
    projects: rows(raw.projects, emptyRows.projects),
    achievements: rows(raw.achievements, emptyRows.achievements),
    courses: rows(raw.courses, emptyRows.courses),
    updatedAt: raw.updatedAt?.toDate ? raw.updatedAt.toDate() : null,
  };
}

export async function loadResume(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? normalizeResume(snap.data().resume) : null;
}

export async function saveResume(uid, resume) {
  const { updatedAt: _ignored, ...data } = resume;
  await setDoc(doc(db, "users", uid), { resume: { ...data, updatedAt: new Date() } }, { merge: true });
}

export function resumeStrength(resume) {
  const tasks = resumeTasks({ ...resume, selectedSkills: resume.skills });
  const score = tasks.reduce((sum, task) => sum + (task.done ? task.points : 0), 0);
  return { score, level: levelFor(score) };
}

export function downloadResumePdf({ values, experiences, skills, projects, achievements, courses }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Set up fonts & colors
  const primaryColor = [41, 128, 185]; // Professional blue

  // Name as header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(values.name, pageWidth / 2, 20, { align: "center" });

  // Contact information
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const contactInfo = `${values.email} | ${values.phone} | ${values.linkedin} | ${values.github}`;
  doc.text(contactInfo, pageWidth / 2, 28, { align: "center" });

  // Horizontal line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 32, pageWidth - 15, 32);

  let yPos = 40;
  const leftMargin = 15;
  const rightMargin = pageWidth - 15;

  const sectionHeading = (title) => {
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, leftMargin, yPos);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, yPos + 2, rightMargin, yPos + 2);
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  };

  // Section: Experience
  sectionHeading("PROFESSIONAL EXPERIENCE");
  experiences.forEach((exp) => {
    if (!exp.company && !exp.role) return; // Skip empty experiences

    doc.setFont(undefined, "bold");
    doc.text(exp.company, leftMargin, yPos);

    // Role on the left, dates on the right
    doc.text(exp.role, leftMargin, yPos + 5);
    doc.setFont(undefined, "normal");
    doc.text(`${exp.startDate} - ${exp.endDate}`, rightMargin, yPos + 5, { align: "right" });

    yPos += 12;
  });
  yPos += 5;

  // Section: Skills
  sectionHeading("SKILLS");
  doc.setFont(undefined, "normal");
  const splitSkills = doc.splitTextToSize(skills.join(", "), rightMargin - leftMargin);
  doc.text(splitSkills, leftMargin, yPos);
  yPos += splitSkills.length * 5 + 10;

  // Section: Education
  sectionHeading("EDUCATION");
  doc.setFont(undefined, "normal");
  const splitEducation = doc.splitTextToSize(values.education, rightMargin - leftMargin);
  doc.text(splitEducation, leftMargin, yPos);
  yPos += splitEducation.length * 5 + 10;

  // Section: Achievements
  if (achievements.some((a) => a.title || a.role)) {
    sectionHeading("ACHIEVEMENTS");
    achievements.forEach((achievement) => {
      if (!achievement.title && !achievement.role) return; // Skip empty achievements
      doc.setFont(undefined, "bold");
      doc.text(achievement.title, leftMargin, yPos);
      doc.setFont(undefined, "normal");
      doc.text(achievement.role, leftMargin + 5, yPos + 5);
      yPos += 12;
    });
  }

  // Section: Projects
  if (projects.some((p) => p.title || p.description)) {
    yPos += 5;
    sectionHeading("PROJECTS");
    projects.forEach((project) => {
      if (!project.title && !project.description) return; // Skip empty projects

      doc.setFont(undefined, "bold");
      doc.text(project.title, leftMargin, yPos);
      yPos += 5;

      if (project.technologies) {
        doc.setFont(undefined, "italic");
        doc.text(`Technologies: ${project.technologies}`, leftMargin, yPos);
        yPos += 5;
      }

      if (project.description) {
        doc.setFont(undefined, "normal");
        const descLines = doc.splitTextToSize(project.description, rightMargin - leftMargin);
        doc.text(descLines, leftMargin, yPos);
        yPos += descLines.length * 5;
      }

      if (project.link) {
        doc.setTextColor(41, 128, 185); // Blue for links
        doc.text(project.link, leftMargin, yPos);
        doc.setTextColor(0, 0, 0); // Reset text color
        yPos += 5;
      }

      yPos += 5; // Space between projects
    });
  }

  // Section: Courses/Training
  if (courses.some((c) => c.title || c.provider)) {
    yPos += 5;
    sectionHeading("COURSES & TRAINING");
    courses.forEach((course) => {
      if (!course.title && !course.provider) return; // Skip empty courses

      doc.setFont(undefined, "bold");
      doc.text(course.title, leftMargin, yPos);
      doc.setFont(undefined, "normal");
      doc.text(course.provider + (course.date ? ` (${course.date})` : ""), leftMargin + 5, yPos + 5);
      yPos += 12;
    });
  }

  doc.save(`${values.name.replace(/\s+/g, "_")}_resume.pdf`);
}
