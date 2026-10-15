import React from "react";
import { Check } from "lucide-react";
import { useGoProtected } from "../../hooks/useAuth";

const includes = [
  "Career matches with the reasons behind them",
  "A summary of your strengths and work style",
  "A PDF you can download and keep",
];

// Illustrative content for the preview card only
const sample = {
  matches: [
    { role: "UX Researcher", fit: 92, why: "You enjoy understanding people and are comfortable with data." },
    { role: "Product Analyst", fit: 86, why: "Strong logical thinking, and you like structured problems." },
    { role: "Technical Writer", fit: 79, why: "You explain complex ideas clearly and prefer focused work." },
  ],
  styles: ["Analytical", "Empathetic", "Curious", "Structured", "Collaborative"],
};

const ReportPreview = () => {
  const goProtected = useGoProtected();

  return (
    <section className="overflow-hidden bg-surface px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className="text-[clamp(2rem,4vw,2.9rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink">
            Your career report, in plain language
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
            After the quiz you get a written report: the careers that fit you best and why they fit. Keep it as a PDF and
            come back to it when you plan your next step.
          </p>
          <ul className="mt-7 space-y-3.5">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-bright">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <button onClick={() => goProtected("/quiz")} className="btn-primary mt-9 px-6 py-3">
            Take the career quiz
          </button>
        </div>

        <figure
          aria-label="Example of a Career Compass report"
          className="card-shadow rounded-3xl border border-line bg-white p-5 sm:p-7 lg:rotate-1"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="text-sm text-ink-soft">Career report</p>
              <p className="text-xl font-bold tracking-tight text-ink">Aanya&apos;s results</p>
            </div>
            <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-ink-soft">Sample report</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-butter p-4">
              <p className="text-sm text-ink-soft">Top match</p>
              <p className="mt-1 font-bold text-ink">UX Researcher</p>
            </div>
            <div className="rounded-2xl bg-sky p-4">
              <p className="text-sm text-ink-soft">Questions answered</p>
              <p className="mt-1 font-bold text-ink">60 of 60</p>
            </div>
            <div className="rounded-2xl bg-lilac p-4">
              <p className="text-sm text-ink-soft">Work styles</p>
              <p className="mt-1 font-bold text-ink">5 chosen</p>
            </div>
          </div>

          <p className="mt-6 text-sm font-semibold text-ink">Best-fit careers</p>
          <ul className="mt-3 space-y-4">
            {sample.matches.map((match) => (
              <li key={match.role}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold text-ink">{match.role}</span>
                  <span className="text-sm font-semibold text-ink">{match.fit}% fit</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-surface">
                  <div className="h-2 rounded-full bg-accent-bright" style={{ width: `${match.fit}%` }} />
                </div>
                <p className="mt-1.5 text-sm text-ink-soft">{match.why}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm font-semibold text-ink">Your work styles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sample.styles.map((style) => (
              <span key={style} className="rounded-full border border-line px-3 py-1 text-sm text-ink">
                {style}
              </span>
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
};

export default ReportPreview;
