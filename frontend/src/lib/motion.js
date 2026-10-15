// Shared Framer Motion presets for the landing page

// Same curve as the quiz animations in index.css
export const EASE_OUT = [0.2, 0.7, 0.2, 1];

export const viewportOnce = { once: true, amount: 0.25 };

// Delay only the first entrance. When a hover ends, Framer re-resolves the active
// variant; by then the element is visible and should settle back without waiting.
const entranceDelay = (delay, current) => (current?.opacity > 0.95 ? 0 : delay);

// Cards drop into place with a slight spin, one after another (pass the index as `custom`)
export const dealIn = {
  hidden: (i = 0) => ({ opacity: 0, y: 70, rotate: i % 2 ? 6 : -6 }),
  show: (i = 0, current) => {
    const delay = entranceDelay(i * 0.1, current);
    return {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { type: "spring", stiffness: 90, damping: 16, delay, opacity: { duration: 0.5, delay } },
    };
  },
};

// Card hover: a small lift on top of the CSS tilt reset
export const lift = { y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } };

// Buttons give a little under the cursor and finger
export const press = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 20 },
};
