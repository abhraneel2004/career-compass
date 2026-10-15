import React, { useRef } from "react";
import { motion } from "framer-motion";
import Reveal from "../motion/Reveal";
import { dealIn, lift, viewportOnce } from "../../lib/motion";
import { gsap, MOTION_OK, useGSAP } from "../../lib/gsap";

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

const HowItWorks = () => {
  const root = useRef(null);

  // On large screens a track above the cards fills as you scroll, lighting each step in turn
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const dots = gsap.utils.toArray("[data-step-dot]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-steps]", start: "top 80%", end: "bottom 55%", scrub: 0.6 },
        });
        tl.fromTo("[data-track-fill]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
        dots.forEach((dot, i) => {
          tl.fromTo(
            dot,
            { scale: 0.7, backgroundColor: "#FFFFFF" },
            { scale: 1, backgroundColor: "#E8590C", duration: 0.08 },
            i / (dots.length - 1) - (i ? 0.08 : 0)
          );
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="how-it-works" className="overflow-x-clip bg-surface px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">How it works</h2>
          <p className="mt-3 text-ink-soft">Four steps from your first answer to a resume you can send.</p>
        </Reveal>

        <div data-steps>
          {/* Track runs from the centre of the first column to the centre of the last (3 gaps of 1.25rem) */}
          <div aria-hidden="true" className="relative mt-14 hidden lg:block">
            <div className="absolute inset-x-[calc((100%-3.75rem)/8)] top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-line">
              <div data-track-fill className="h-full origin-left rounded-full bg-accent-bright" />
            </div>
            <div className="relative grid grid-cols-4 gap-5">
              {steps.map((step) => (
                <div key={step.title} className="flex justify-center">
                  <span data-step-dot className="block h-4 w-4 rounded-full border-2 border-accent-bright bg-accent-bright" />
                </div>
              ))}
            </div>
          </div>

          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                custom={index}
                variants={dealIn}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                whileHover={lift}
                className={`card-shadow rounded-2xl p-6 transition-[rotate] duration-300 hover:rotate-0 motion-reduce:transition-none ${step.tone}`}
              >
                <span className="text-4xl font-extrabold tracking-tight text-ink/15">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
