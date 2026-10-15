import React from "react";

const steps = [
  {
    title: "Answer your guides",
    text: "Eight guides from different careers take turns asking 60 quick questions about you.",
    tone: "bg-peach lg:-rotate-2",
  },
  {
    title: "Pick five work styles",
    text: "Choose the words that describe you best, such as Analytical, Empathetic or Visionary.",
    tone: "bg-sky lg:rotate-[1.5deg] lg:translate-y-4",
  },
  {
    title: "Get your career report",
    text: "Our AI reads your answers and suggests careers that fit, with the reasons behind each one.",
    tone: "bg-lilac lg:-rotate-1",
  },
  {
    title: "Build your resume",
    text: "Turn your plan into a clean, ready-to-send resume with the built-in generator.",
    tone: "bg-butter lg:rotate-2 lg:translate-y-4",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="bg-surface px-4 py-20 sm:px-6 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">How it works</h2>
        <p className="mt-3 text-ink-soft">Four steps from your first answer to a resume you can send.</p>
      </div>

      <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={`card-shadow rounded-2xl p-6 transition-transform duration-300 hover:rotate-0 motion-reduce:transition-none ${step.tone}`}
          >
            <span className="text-4xl font-extrabold tracking-tight text-ink/15">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default HowItWorks;
