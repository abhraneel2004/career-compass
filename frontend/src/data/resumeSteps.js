// Resume builder steps, each coached by one of the quiz guides
export const resumeSteps = [
  {
    id: "contact",
    title: "Contact details",
    coach: "claire",
    tip: "Recruiters decide in seconds. Make it easy to reach you, and use links they can click.",
    fields: ["name", "email", "phone", "linkedin", "github"],
  },
  {
    id: "education",
    title: "Education",
    coach: "kenji",
    tip: "List your degree, where you studied and when. Add your graduation year, even if it's expected.",
    fields: ["education"],
  },
  {
    id: "experience",
    title: "Experience",
    coach: "marcus",
    tip: "When I hire, I look for real roles. Internships, part-time jobs and freelance work all count.",
    fields: [],
  },
  {
    id: "skills",
    title: "Skills",
    coach: "arjun",
    tip: "Pick skills you could talk about in an interview. Mix technical skills with how you work.",
    fields: [],
  },
  {
    id: "projects",
    title: "Projects",
    coach: "maya",
    tip: "Projects show what you can do. Say what you built, what you used and where people can see it.",
    fields: [],
  },
  {
    id: "extras",
    title: "Achievements and courses",
    coach: "mei",
    tip: "Achievements and courses prove you keep learning. Even one of each makes a difference.",
    fields: [],
  },
];

export const strengthLevels = [
  { min: 90, name: "Standout" },
  { min: 70, name: "Strong" },
  { min: 40, name: "Taking shape" },
  { min: 0, name: "Getting started" },
];

export const levelFor = (score) => strengthLevels.find((level) => score >= level.min);

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
const isUrl = (value) => /^https?:\/\/\S+\.\S+/.test(value || "");
const filled = (value) => Boolean(value && value.trim());

// Every task belongs to a step and is worth points; together they add up to 100
export function resumeTasks({ values, experiences, selectedSkills, projects, achievements, courses }) {
  const fullRoles = experiences.filter((e) => filled(e.company) && filled(e.role) && filled(e.startDate)).length;
  const fullProjects = projects.filter((p) => filled(p.title) && filled(p.description));
  const skillCount = selectedSkills.length;

  return [
    { step: "contact", label: "Add your name and a valid email", points: 10, done: filled(values.name) && isEmail(values.email) },
    { step: "contact", label: "Add a phone number", points: 5, done: filled(values.phone) },
    { step: "contact", label: "Link your LinkedIn profile", points: 5, done: isUrl(values.linkedin) },
    { step: "contact", label: "Link your GitHub profile", points: 5, done: isUrl(values.github) },
    { step: "education", label: "Describe your degree and institution", points: 10, done: (values.education || "").trim().length >= 15 },
    { step: "education", label: "Include your graduation year", points: 5, done: /\b(19|20)\d{2}\b/.test(values.education || "") },
    { step: "experience", label: "Add a role with company, title and start date", points: 15, done: fullRoles >= 1 },
    { step: "experience", label: "Add a second role", points: 5, done: fullRoles >= 2 },
    { step: "skills", label: `Add at least 3 skills (${Math.min(skillCount, 3)}/3)`, points: 10, done: skillCount >= 3 },
    { step: "skills", label: `Add 6 or more skills (${Math.min(skillCount, 6)}/6)`, points: 5, done: skillCount >= 6 },
    { step: "projects", label: "Add a project with a title and description", points: 10, done: fullProjects.length >= 1 },
    { step: "projects", label: "Say which technologies you used", points: 3, done: fullProjects.some((p) => filled(p.technologies)) },
    { step: "projects", label: "Add a link people can open", points: 2, done: fullProjects.some((p) => isUrl(p.link)) },
    { step: "extras", label: "Add an achievement", points: 5, done: achievements.some((a) => filled(a.title)) },
    { step: "extras", label: "Add a course or certification", points: 5, done: courses.some((c) => filled(c.title)) },
  ];
}
