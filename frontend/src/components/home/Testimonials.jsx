import React from "react";
import { Star } from "lucide-react";

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

const Testimonials = () => (
  <section className="bg-white px-4 py-20 sm:px-6 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">What users say</h2>
        <p className="mt-3 text-ink-soft">From students and job seekers who have used Career Compass.</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {reviews.map((review) => (
          <figure
            key={review.name}
            className={`card-shadow flex flex-col rounded-2xl p-7 transition-transform duration-300 hover:rotate-0 motion-reduce:transition-none ${review.tone}`}
          >
            <div className="flex gap-1" aria-label={`Rated ${review.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-ink/10 text-ink/10"}`}
                />
              ))}
            </div>
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
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
