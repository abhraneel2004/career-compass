import React from "react";
import { useGoProtected } from "../../hooks/useAuth";

const CtaBanner = () => {
  const goProtected = useGoProtected();

  return (
    <section className="bg-white px-4 pb-20 sm:px-6 sm:pb-24">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FFF4EA] to-[#FFDFC6] md:grid-cols-2">
        <div className="px-7 py-12 sm:px-12 sm:py-16">
          <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink">
            Start with the quiz. It takes about 10 minutes.
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-ink-soft">
            The quiz is free. Answer honestly and see which careers match how you think and work.
          </p>
          <button onClick={() => goProtected("/quiz")} className="btn-primary mt-8 px-6 py-3">
            Take the career quiz
          </button>
        </div>
        <div className="flex items-end justify-center px-6 md:px-0 md:pr-6">
          <img
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
