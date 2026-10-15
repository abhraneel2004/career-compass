import React from "react";
import { useGoProtected } from "../../hooks/useAuth";

const Hero = () => {
  const goProtected = useGoProtected();

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Quiet geometric marks, echoing compass ticks */}
      <span aria-hidden="true" className="absolute left-[12%] top-24 hidden text-2xl font-light text-ink/30 lg:block">+</span>
      <span aria-hidden="true" className="absolute right-[14%] top-[22rem] hidden text-2xl font-light text-ink/30 lg:block">+</span>
      <span aria-hidden="true" className="absolute right-[18%] top-28 hidden h-3 w-3 rotate-45 border-2 border-accent-bright lg:block" />

      <div className="mx-auto max-w-4xl px-4 pt-16 text-center sm:px-6 sm:pt-20">
        <h1 className="rise-in text-[clamp(2.5rem,6.2vw,4.6rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">
          Find the career <br className="hidden sm:block" />
          that <span className="text-accent-bright">fits who you are</span>
        </h1>
        <p className="rise-in mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft [animation-delay:90ms]">
          Answer 60 questions about your interests, strengths and values. Career Compass turns them into a personal
          career report you can act on.
        </p>
        <div className="rise-in mt-8 flex flex-wrap justify-center gap-3 [animation-delay:180ms]">
          <button onClick={() => goProtected("/quiz")} className="btn-primary px-6 py-3">
            Take the career quiz
          </button>
          <button onClick={() => goProtected("/resume-generation")} className="btn-outline px-6 py-3">
            Build a resume
          </button>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-4xl px-4 sm:px-6">
        <div
          aria-hidden="true"
          className="absolute inset-x-[12%] bottom-0 top-[20%] rounded-full bg-[radial-gradient(closest-side,#FFE3CC,transparent)] blur-2xl"
        />
        <img
          src="/images/hero-group.webp"
          width="1400"
          height="1049"
          alt="A group of students and young professionals standing together"
          className="rise-in relative block h-auto w-full [animation-delay:260ms]"
          fetchPriority="high"
        />
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
