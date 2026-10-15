import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useGoProtected } from "../../hooks/useAuth";
import { EASE_OUT, press } from "../../lib/motion";
import { gsap, MOTION_OK, useGSAP } from "../../lib/gsap";

// The headline rises in word by word; `br` breaks the line from sm up
const headline = [
  { word: "Find" },
  { word: "the" },
  { word: "career", br: true },
  { word: "that" },
  { word: "fits", accent: true },
  { word: "who", accent: true },
  { word: "you", accent: true },
  { word: "are", accent: true },
];

const wordDelay = 0.06;
const afterHeadline = headline.length * wordDelay + 0.15;

const Hero = () => {
  const goProtected = useGoProtected();
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Compass ticks: the crosses snap a quarter turn, the diamond drifts round
        gsap.to("[data-tick]", {
          rotation: "+=90",
          duration: 1.1,
          ease: "back.inOut(2)",
          repeat: -1,
          repeatDelay: 2.2,
          stagger: 0.6,
        });
        gsap.to("[data-diamond]", { rotation: 360, duration: 16, ease: "none", repeat: -1 });

        // As the hero scrolls away, layers move at different speeds
        const scrub = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-parallax]", {
          y: (_, el) => Number(el.dataset.parallax) * 100,
          ease: "none",
          scrollTrigger: scrub,
        });
        gsap.to("[data-hero-copy]", { y: -60, opacity: 0.2, ease: "none", scrollTrigger: scrub });
        gsap.to("[data-hero-image]", { y: 40, ease: "none", scrollTrigger: scrub });
        gsap.to("[data-hero-glow]", { scale: 1.35, opacity: 0.6, ease: "none", scrollTrigger: scrub });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-white">
      {/* Quiet geometric marks, echoing compass ticks */}
      <span data-parallax="-1.4" aria-hidden="true" className="absolute left-[12%] top-24 hidden lg:block">
        <span data-tick className="block text-2xl font-light text-ink/30">+</span>
      </span>
      <span data-parallax="-0.6" aria-hidden="true" className="absolute right-[14%] top-[22rem] hidden lg:block">
        <span data-tick className="block text-2xl font-light text-ink/30">+</span>
      </span>
      <span data-parallax="-2" aria-hidden="true" className="absolute right-[18%] top-28 hidden lg:block">
        <span data-diamond className="block h-3 w-3 rotate-45 border-2 border-accent-bright" />
      </span>
      <span data-parallax="-1" aria-hidden="true" className="absolute left-[20%] top-[26rem] hidden lg:block">
        <span className="block h-2 w-2 rounded-full bg-accent-bright/60" />
      </span>

      <div data-hero-copy className="mx-auto max-w-4xl px-4 pt-12 text-center sm:px-6 sm:pt-16 lg:pt-12">
        <h1 className="text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">
          {headline.map(({ word, accent, br }, i) => (
            <React.Fragment key={word}>
              {/* The mask clips each word while it slides up; padding keeps descenders visible */}
              <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                <motion.span
                  className={`inline-block ${accent ? "text-accent-bright" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 + i * wordDelay }}
                >
                  {word}
                </motion.span>
              </span>
              {br ? <br className="hidden sm:block" /> : " "}
            </React.Fragment>
          ))}
        </h1>
        <motion.p
          className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: afterHeadline }}
        >
          Answer 60 questions about your interests, strengths and values. Career Compass turns them into a personal
          career report you can act on.
        </motion.p>
        <motion.div
          className="mt-7 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: afterHeadline + 0.1 }}
        >
          <motion.button {...press} onClick={() => goProtected("/quiz")} className="btn-primary px-6 py-3">
            Take the career quiz
          </motion.button>
          <motion.button {...press} onClick={() => goProtected("/resume-generation")} className="btn-outline px-6 py-3">
            Build a resume
          </motion.button>
        </motion.div>
      </div>

      {/* On desktop the group scales with the window height so it shows to chest level above the fold */}
      <div className="relative mx-auto mt-10 max-w-4xl px-4 sm:px-6 lg:mt-8 lg:max-w-[clamp(30rem,calc((100svh-29rem)*2),46rem)]">
        <div
          data-hero-glow
          aria-hidden="true"
          className="absolute inset-x-[12%] bottom-0 top-[20%] rounded-full bg-[radial-gradient(closest-side,#FFE3CC,transparent)] blur-2xl"
        />
        <div data-hero-image className="relative">
          <motion.img
            src="/images/hero-group.webp"
            width="1400"
            height="1049"
            alt="A group of students and young professionals standing together"
            className="block h-auto w-full"
            fetchPriority="high"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: afterHeadline + 0.15 }}
          />
        </div>
      </div>

      {/* Fade the cropped figures into the next section instead of a hard edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-white/0 via-white/80 to-surface sm:h-56"
      />
    </section>
  );
};

export default Hero;
