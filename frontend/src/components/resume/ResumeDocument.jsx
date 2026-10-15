import React from "react";

// Section heading styled like the generated PDF
const PreviewSection = ({ title, children }) => (
  <section className="mt-7">
    <h3 className="mb-3 border-b border-[#2980B9] pb-1 text-lg font-bold uppercase tracking-wide text-[#2980B9]">{title}</h3>
    {children}
  </section>
);

// The resume as it appears in the PDF, mirroring its layout and colours
const ResumeDocument = ({ resume }) => {
  const { values, experiences, skills, projects, achievements, courses } = resume;

  return (
    <article className="card-shadow rounded-2xl bg-white p-8 sm:p-12">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-[#2980B9]">{values.name}</h2>
        <p className="mt-2 break-words text-sm text-ink-soft">
          {values.email} | {values.phone} | {values.linkedin} | {values.github}
        </p>
      </header>

      <PreviewSection title="Professional experience">
        {experiences.filter((exp) => exp.company || exp.role).map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="font-bold">{exp.company}</div>
            <div className="flex justify-between gap-4">
              <div className="font-semibold">{exp.role}</div>
              <div className="shrink-0 text-ink-soft">{exp.startDate} - {exp.endDate}</div>
            </div>
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="Skills">
        <p>{skills.join(", ")}</p>
      </PreviewSection>

      <PreviewSection title="Education">
        <p className="whitespace-pre-wrap">{values.education}</p>
      </PreviewSection>

      {projects.some((p) => p.title || p.description) && (
        <PreviewSection title="Projects">
          {projects.filter((p) => p.title || p.description).map((proj, index) => (
            <div key={index} className="mb-3">
              <div className="font-bold">{proj.title}</div>
              {proj.technologies && <div className="italic text-ink-soft">Technologies: {proj.technologies}</div>}
              {proj.description && <div>{proj.description}</div>}
              {proj.link && <div className="break-words text-[#2980B9]">{proj.link}</div>}
            </div>
          ))}
        </PreviewSection>
      )}

      {courses.some((c) => c.title || c.provider) && (
        <PreviewSection title="Courses and training">
          {courses.filter((c) => c.title || c.provider).map((course, index) => (
            <div key={index} className="mb-2">
              <div className="font-bold">{course.title}</div>
              <div className="text-ink-soft">
                {course.provider}{course.date ? ` (${course.date})` : ""}
              </div>
            </div>
          ))}
        </PreviewSection>
      )}

      {achievements.some((a) => a.title || a.role) && (
        <PreviewSection title="Achievements">
          {achievements.filter((a) => a.title || a.role).map((ach, index) => (
            <div key={index} className="mb-2">
              <div className="font-bold">{ach.title}</div>
              <div className="text-ink-soft">{ach.role}</div>
            </div>
          ))}
        </PreviewSection>
      )}
    </article>
  );
};

export default ResumeDocument;
