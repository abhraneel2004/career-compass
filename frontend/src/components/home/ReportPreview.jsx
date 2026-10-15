import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useGoProtected } from "../../hooks/useAuth";
import Reveal from "../motion/Reveal";
import { EASE_OUT, press, viewportOnce } from "../../lib/motion";
import { gsap, MOTION_OK, useGSAP } from "../../lib/gsap";

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

// Checklist rows slide in and their ticks pop once the row lands
const checklist = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } };
const checkRow = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};
const checkMark = {
  hidden: { scale: 0, rotate: -90 },
  show: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 14, delay: 0.15 } },
};

const ReportPreview = () => {
  const goProtected = useGoProtected();
  const root = useRef(null);

  // The sample report assembles itself: card, stat tiles, fit bars and counters, then the style chips
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: "[data-report]", start: "top 75%", once: true },
        });
        tl.from("[data-report]", { y: 80, rotation: 5, opacity: 0, duration: 1 })
          .from("[data-tile]", { y: 24, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.5")
          .from("[data-bar]", { scaleX: 0, duration: 1.1, stagger: 0.15, ease: "power2.inOut" }, "-=0.2")
          .from(
            "[data-count]",
            { textContent: 0, snap: { textContent: 1 }, duration: 1.1, stagger: 0.15, ease: "power2.inOut" },
            "<"
          )
          .from("[data-chip]", { scale: 0.6, opacity: 0, duration: 0.4, stagger: 0.06, ease: "back.out(2.5)" }, "-=0.4");
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="overflow-hidden bg-surface px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Reveal as="h2" className="text-[clamp(2rem,4vw,2.9rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink">
            Your career report, in plain language
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-5 max-w-md leading-relaxed text-ink-soft">
            After the quiz you get a written report: the careers that fit you best and why they fit. Keep it as a PDF and
            come back to it when you plan your next step.
          </Reveal>
          <motion.ul
            className="mt-7 space-y-3.5"
            variants={checklist}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            {includes.map((item) => (
              <motion.li key={item} variants={checkRow} className="flex items-start gap-3 text-ink">
                <motion.span
                  variants={checkMark}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-bright"
                >
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                </motion.span>
                {item}
              </motion.li>
            ))}
          </motion.ul>
          <Reveal delay={0.2}>
            <motion.button {...press} onClick={() => goProtected("/quiz")} className="btn-primary mt-9 px-6 py-3">
              Take the career quiz
            </motion.button>
          </Reveal>
        </div>

        <figure
          data-report
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
            <div data-tile className="rounded-2xl bg-butter p-4">
              <p className="text-sm text-ink-soft">Top match</p>
              <p className="mt-1 font-bold text-ink">UX Researcher</p>
            </div>
            <div data-tile className="rounded-2xl bg-sky p-4">
              <p className="text-sm text-ink-soft">Questions answered</p>
              <p className="mt-1 font-bold text-ink">60 of 60</p>
            </div>
            <div data-tile className="rounded-2xl bg-lilac p-4">
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
                  <span className="text-sm font-semibold text-ink">
                    <span data-count>{match.fit}</span>% fit
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-surface">
                  <div data-bar className="h-2 origin-left rounded-full bg-accent-bright" style={{ width: `${match.fit}%` }} />
                </div>
                <p className="mt-1.5 text-sm text-ink-soft">{match.why}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm font-semibold text-ink">Your work styles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sample.styles.map((style) => (
              <span key={style} data-chip className="inline-block rounded-full border border-line px-3 py-1 text-sm text-ink">
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
