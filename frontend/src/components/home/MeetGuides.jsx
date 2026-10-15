import React from "react";
import { motion } from "framer-motion";
import { guideOrder, guides } from "../../data/guides";
import { useGoProtected } from "../../hooks/useAuth";
import Reveal from "../motion/Reveal";
import { dealIn, lift, press, viewportOnce } from "../../lib/motion";

const tilts = ["md:-rotate-2", "md:rotate-1", "md:-rotate-1", "md:rotate-2"];

// The card deals in, then the guide steps up out of it; on hover the card lifts and the guide leans in
const card = { ...dealIn, hover: lift };
const portrait = {
  hidden: { y: "35%", opacity: 0 },
  show: (i = 0, current) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15, delay: current?.opacity > 0.95 ? 0 : i * 0.08 + 0.25 },
  }),
  hover: { scale: 1.06, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

const MeetGuides = () => {
  const goProtected = useGoProtected();

  return (
    <section className="overflow-x-clip bg-white px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-xl" x={-30} y={0}>
            <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">Meet your guides</h2>
            <p className="mt-3 text-ink-soft">
              Eight people from eight careers. In the quiz, each one asks the questions closest to their own work.
            </p>
          </Reveal>
          <Reveal x={30} y={0} delay={0.15}>
            <motion.button {...press} onClick={() => goProtected("/quiz")} className="btn-primary px-6 py-3">
              Start the quiz with them
            </motion.button>
          </Reveal>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {guideOrder.map((id, index) => {
            const guide = guides[id];
            // Delays restart each row of four so the second row doesn't wait on the first
            const order = index % 4;
            return (
              <motion.li
                key={id}
                custom={order}
                variants={card}
                initial="hidden"
                whileInView="show"
                whileHover="hover"
                viewport={viewportOnce}
                className={`card-shadow flex flex-col overflow-hidden rounded-3xl transition-[rotate] duration-300 hover:rotate-0 motion-reduce:transition-none ${guide.tone} ${tilts[order]}`}
              >
                <div className="relative h-44 sm:h-56">
                  <motion.img
                    custom={order}
                    variants={portrait}
                    src={guide.image}
                    alt={`${guide.name}, ${guide.role}`}
                    loading="lazy"
                    className="absolute bottom-0 left-1/2 h-[95%] w-auto max-w-none origin-bottom -translate-x-1/2 object-contain object-bottom"
                  />
                </div>
                <div className="flex flex-1 flex-col bg-white p-4 sm:p-5">
                  <p className="text-lg font-bold leading-tight tracking-tight text-ink">{guide.name}</p>
                  <p className="text-sm font-semibold text-accent">{guide.role}</p>
                  <p className="mt-2 hidden text-sm leading-relaxed text-ink-soft sm:block">{guide.intro}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default MeetGuides;
