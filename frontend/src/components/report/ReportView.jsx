import React from "react";
import { Footprints, GraduationCap, Sparkles } from "lucide-react";
import { formatDate, guideFor } from "../../lib/report";

export const GuideAvatar = ({ guide, className = "h-12 w-12" }) => (
  <img
    src={guide.image}
    alt={`${guide.name}, ${guide.role}`}
    className={`${className} shrink-0 rounded-full object-cover object-top ring-2 ring-white ${guide.tone}`}
  />
);

const FitBar = ({ fit, className = "" }) => (
  <div className={`h-2 rounded-full bg-surface ${className}`} aria-hidden="true">
    <div className="h-2 rounded-full bg-accent-bright" style={{ width: `${fit}%` }} />
  </div>
);

const SectionTitle = ({ children, note }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{children}</h2>
    {note && <p className="text-sm text-ink-soft">{note}</p>}
  </div>
);

const CareerCard = ({ career, rank }) => {
  const guide = guideFor(career);

  return (
    <li className={`rounded-3xl border p-5 sm:p-7 ${rank === 1 ? "border-accent-bright/50 bg-[#FFFBF8]" : "border-line bg-white"}`}>
      <div className="flex items-start gap-4">
        {guide ? (
          <GuideAvatar guide={guide} className="h-14 w-14 sm:h-16 sm:w-16" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface text-lg font-extrabold text-ink sm:h-16 sm:w-16">
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            {rank === 1 ? "Top match" : `Match ${rank}`}
          </p>
          <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-lg font-extrabold leading-snug tracking-tight text-ink sm:text-xl">{career.title}</h3>
            {career.fit && <span className="text-sm font-bold text-accent">{career.fit}% fit</span>}
          </div>
          {career.fit && <FitBar fit={career.fit} className="mt-2 max-w-sm" />}
          {guide && (
            <p className="mt-2.5 text-sm text-ink-soft">
              <span className="font-semibold text-ink">{guide.domain}</span> · {guide.name}, {guide.role}, works in this field
            </p>
          )}
        </div>
      </div>

      {career.why && <p className="mt-5 leading-relaxed text-ink">{career.why}</p>}

      {(career.skills.length > 0 || career.path) && (
        <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
          {career.skills.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Skills to build
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {career.skills.map((skill) => (
                  <li key={skill} className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-ink">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {career.path && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                How to get there
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{career.path}</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

// The career report: hero with the top match, strengths, matched guides, careers and next steps.
// `actions` renders under the summary (download, links); `title` overrides the heading.
const ReportView = ({ report, name, createdAt, workStyles = [], actions, title }) => {
  const [top] = report.careers;
  const topGuide = guideFor(top);

  // Each guide whose field matches at least one career, with those careers
  const matchedGuides = [];
  for (const career of report.careers) {
    const guide = guideFor(career);
    if (!guide) continue;
    const existing = matchedGuides.find((m) => m.guide === guide);
    if (existing) existing.careers.push(career.title);
    else matchedGuides.push({ guide, careers: [career.title] });
  }

  return (
    <article className="space-y-4">
      <section className="card-shadow grid overflow-hidden rounded-3xl bg-white md:grid-cols-[1.3fr_0.7fr]">
        <div className="p-6 sm:p-10">
          <p className="text-sm font-semibold text-accent">
            Career report{createdAt ? ` · ${formatDate(createdAt)}` : ""}
          </p>
          <h1 className="mt-1.5 text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink">
            {title || (name ? `${name}'s career report` : "Your career report")}
          </h1>
          {report.summary && <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{report.summary}</p>}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>

        {top && (
          <div className={`relative min-h-[18rem] overflow-hidden ${topGuide ? topGuide.tone : "bg-peach"}`}>
            {topGuide ? (
              <img
                src={topGuide.image}
                alt={`${topGuide.name}, ${topGuide.role}`}
                className="guide-in absolute bottom-0 left-1/2 h-[94%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
              />
            ) : (
              <img src="/images/trophy.webp" alt="" className="pop absolute inset-x-0 top-8 mx-auto h-32 w-32 object-contain" />
            )}
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Your top match</p>
              <p className="mt-0.5 text-lg font-extrabold leading-tight tracking-tight text-ink">{top.title}</p>
              {top.fit && (
                <div className="mt-2 flex items-center gap-3">
                  <FitBar fit={top.fit} className="flex-1" />
                  <span className="text-sm font-bold text-accent">{top.fit}%</span>
                </div>
              )}
              {topGuide && (
                <p className="mt-2 text-sm text-ink-soft">
                  {topGuide.name} is your guide in {topGuide.domain.toLowerCase()}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {(report.strengths.length > 0 || workStyles.length > 0 || matchedGuides.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {(report.strengths.length > 0 || workStyles.length > 0) && (
            <section className="card-shadow rounded-3xl bg-white p-6 sm:p-8">
              {report.strengths.length > 0 && (
                <>
                  <SectionTitle>Your strengths</SectionTitle>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {report.strengths.map((strength) => (
                      <li key={strength} className="rounded-full bg-peach px-3.5 py-1.5 text-sm font-semibold text-ink">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {workStyles.length > 0 && (
                <div className={report.strengths.length > 0 ? "mt-7" : ""}>
                  <p className="text-sm font-semibold text-ink">How you said you work</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {workStyles.map((style) => (
                      <li key={style} className="rounded-full border border-line px-3 py-1 text-sm text-ink">
                        {style}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {matchedGuides.length > 0 && (
            <section className="card-shadow rounded-3xl bg-white p-6 sm:p-8">
              <SectionTitle>Guides on your path</SectionTitle>
              <p className="mt-1 text-sm text-ink-soft">The guides from your quiz who work in the fields you matched.</p>
              <ul className="mt-5 space-y-4">
                {matchedGuides.map(({ guide, careers }) => (
                  <li key={guide.name} className="flex items-center gap-3.5">
                    <GuideAvatar guide={guide} />
                    <div className="min-w-0">
                      <p className="font-bold leading-tight text-ink">
                        {guide.name} <span className="font-medium text-ink-soft">· {guide.role}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">{careers.join(", ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {report.careers.length > 0 && (
        <section className="card-shadow rounded-3xl bg-white p-5 sm:p-8">
          <SectionTitle note="Ranked by how well they fit your answers">Your best-fit careers</SectionTitle>
          <ol className="mt-6 space-y-4">
            {report.careers.map((career, index) => (
              <CareerCard key={career.title} career={career} rank={index + 1} />
            ))}
          </ol>
        </section>
      )}

      {report.nextSteps.length > 0 && (
        <section className="rounded-3xl bg-night p-6 text-white sm:p-10">
          <div className="flex items-center gap-2.5">
            <Footprints className="h-5 w-5 text-accent-bright" aria-hidden="true" />
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Your next steps</h2>
          </div>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {report.nextSteps.map((step, index) => (
              <li key={step} className="flex gap-3.5 rounded-2xl bg-white/[0.06] p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-bright text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="leading-relaxed text-white/85">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
};

export default ReportView;
