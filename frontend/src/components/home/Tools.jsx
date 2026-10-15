import React from "react";
import { Clock, FileDown, Zap } from "lucide-react";
import { useGoProtected } from "../../hooks/useAuth";

const tools = [
  {
    title: "Career quiz",
    text: "60 statements and five work styles, turned into career matches with the reasons behind them.",
    tag: "AI report",
    meta: { icon: Clock, label: "About 10 min" },
    cta: "Take the quiz",
    path: "/quiz",
    image: "/images/scene-quiz.webp",
    alt: "A student answering a career questionnaire on his laptop",
    tone: "bg-lilac md:-rotate-1",
    primary: true,
  },
  {
    title: "Resume builder",
    text: "Add your experience, skills, projects and courses, then download your resume as a PDF.",
    tag: "Free",
    meta: { icon: FileDown, label: "PDF download" },
    cta: "Build my resume",
    path: "/resume-generation",
    image: "/images/scene-resume.webp",
    alt: "A young woman reviewing her printed resume at a desk",
    tone: "bg-mint md:rotate-1 md:translate-y-3",
  },
  {
    title: "JobKey matcher",
    text: "Paste a job description to see the keywords your resume should include.",
    tag: "AI keywords",
    meta: { icon: Zap, label: "Instant results" },
    cta: "Match keywords",
    path: "/jobkey",
    image: "/images/scene-jobkey.webp",
    alt: "A young man comparing a job posting with his resume on a monitor",
    tone: "bg-peach md:-rotate-[1.5deg]",
  },
];

const Tools = () => {
  const goProtected = useGoProtected();

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">
            Tools for your next move
          </h2>
          <p className="mt-3 text-ink-soft">Start with the quiz, then use the others when you're ready to apply.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tools.map((tool) => {
            const MetaIcon = tool.meta.icon;
            return (
              <article
                key={tool.title}
                className={`card-shadow flex flex-col rounded-3xl p-4 transition-transform duration-300 hover:rotate-0 motion-reduce:transition-none ${tool.tone}`}
              >
                <img
                  src={tool.image}
                  alt={tool.alt}
                  width="960"
                  height="717"
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
                <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-ink">{tool.tag}</span>
                    <span className="inline-flex items-center gap-1.5 text-ink-soft">
                      <MetaIcon className="h-4 w-4" aria-hidden="true" />
                      {tool.meta.label}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">{tool.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{tool.text}</p>
                  <button
                    onClick={() => goProtected(tool.path)}
                    className={`mt-6 self-start ${tool.primary ? "btn-primary" : "btn-outline"}`}
                  >
                    {tool.cta}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Tools;
