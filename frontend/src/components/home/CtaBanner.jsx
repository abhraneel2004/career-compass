import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useGoProtected } from "../../hooks/useAuth";
import Reveal from "../motion/Reveal";
import { press } from "../../lib/motion";
import { gsap, MOTION_OK, useGSAP } from "../../lib/gsap";

const CtaBanner = () => {
  const goProtected = useGoProtected();
  const root = useRef(null);

  // The banner grows to full size as it scrolls up, and the group rises into it
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scrub = { trigger: root.current, start: "top bottom", end: "top 35%", scrub: 0.5 };
        gsap.from("[data-cta-panel]", { scale: 0.9, ease: "none", scrollTrigger: scrub });
        gsap.from("[data-cta-image]", { yPercent: 22, ease: "none", scrollTrigger: scrub });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="bg-white px-4 pb-20 sm:px-6 sm:pb-24">
      <div
        data-cta-panel
        className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FFF4EA] to-[#FFDFC6] md:grid-cols-2"
      >
        <div className="px-7 py-12 sm:px-12 sm:py-16">
          <Reveal
            as="h2"
            className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink"
          >
            Start with the quiz. It takes about 10 minutes.
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-4 max-w-sm leading-relaxed text-ink-soft">
            The quiz is free. Answer honestly and see which careers match how you think and work.
          </Reveal>
          <Reveal delay={0.2}>
            <motion.button {...press} onClick={() => goProtected("/quiz")} className="btn-primary mt-8 px-6 py-3">
              Take the career quiz
            </motion.button>
          </Reveal>
        </div>
        <div className="flex items-end justify-center px-6 md:px-0 md:pr-6">
          <img
            data-cta-image
            src="/images/cta-group.webp"
            alt="Five young professionals smiling together"
            width="900"
            height="628"
            loading="lazy"
            className="block h-auto w-full max-w-md md:max-w-none"
          />
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
