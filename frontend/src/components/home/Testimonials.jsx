import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Reveal from "../motion/Reveal";
import { dealIn, lift, viewportOnce } from "../../lib/motion";

const reviews = [
  {
    name: "John Doe",
    text: "Career Compass helped me land my dream job! The guidance and resources are top-notch.",
    rating: 5,
    avatar: "/images/avatar-1.webp",
    tone: "bg-rose md:-rotate-2",
  },
  {
    name: "Jane Smith",
    text: "A fantastic platform! The career advice and resume tips were invaluable.",
    rating: 4,
    avatar: "/images/avatar-2.webp",
    tone: "bg-mint md:rotate-1 md:translate-y-4",
  },
  {
    name: "Emily Johnson",
    text: "The best career resource I’ve ever used. Highly recommended for job seekers!",
    rating: 5,
    avatar: "/images/avatar-3.webp",
    tone: "bg-butter md:-rotate-1",
  },
];

// Stars pop in one by one after their card lands
const starRow = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } } };
const starPop = {
  hidden: { scale: 0, rotate: -45, opacity: 0 },
  show: { scale: 1, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 14 } },
};

const Testimonials = () => (
  <section className="overflow-x-clip bg-white px-4 py-20 sm:px-6 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <Reveal className="mx-auto max-w-xl text-center">
        <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">What users say</h2>
        <p className="mt-3 text-ink-soft">From students and job seekers who have used Career Compass.</p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {reviews.map((review, index) => (
          <motion.figure
            key={review.name}
            custom={index}
            variants={dealIn}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            whileHover={lift}
            className={`card-shadow flex flex-col rounded-2xl p-7 transition-[rotate] duration-300 hover:rotate-0 motion-reduce:transition-none ${review.tone}`}
          >
            <motion.div variants={starRow} className="flex gap-1" aria-label={`Rated ${review.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <motion.span key={i} variants={starPop} className="inline-flex">
                  <Star
                    aria-hidden="true"
                    className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-ink/10 text-ink/10"}`}
                  />
                </motion.span>
              ))}
            </motion.div>
            <blockquote className="mt-5 flex-1 leading-relaxed text-ink">“{review.text}”</blockquote>
            <figcaption className="mt-7 flex items-center gap-3">
              <img
                src={review.avatar}
                alt=""
                width="320"
                height="320"
                loading="lazy"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
              />
              <span className="font-semibold text-ink">{review.name}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
