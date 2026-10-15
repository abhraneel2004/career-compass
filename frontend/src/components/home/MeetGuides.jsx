import React from "react";
import { guideOrder, guides } from "../../data/guides";
import { useGoProtected } from "../../hooks/useAuth";

const tilts = ["md:-rotate-2", "md:rotate-1", "md:-rotate-1", "md:rotate-2"];

const MeetGuides = () => {
  const goProtected = useGoProtected();

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">Meet your guides</h2>
            <p className="mt-3 text-ink-soft">
              Eight people from eight careers. In the quiz, each one asks the questions closest to their own work.
            </p>
          </div>
          <button onClick={() => goProtected("/quiz")} className="btn-primary px-6 py-3">
            Start the quiz with them
          </button>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {guideOrder.map((id, index) => {
            const guide = guides[id];
            return (
              <li
                key={id}
                className={`card-shadow flex flex-col overflow-hidden rounded-3xl transition-transform duration-300 hover:rotate-0 motion-reduce:transition-none ${guide.tone} ${tilts[index % tilts.length]}`}
              >
                <div className="relative h-44 sm:h-56">
                  <img
                    src={guide.image}
                    alt={`${guide.name}, ${guide.role}`}
                    loading="lazy"
                    className="absolute bottom-0 left-1/2 h-[95%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
                  />
                </div>
                <div className="flex flex-1 flex-col bg-white p-4 sm:p-5">
                  <p className="text-lg font-bold leading-tight tracking-tight text-ink">{guide.name}</p>
                  <p className="text-sm font-semibold text-accent">{guide.role}</p>
                  <p className="mt-2 hidden text-sm leading-relaxed text-ink-soft sm:block">{guide.intro}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default MeetGuides;
