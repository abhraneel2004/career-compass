// The eight people from the landing page, each with a career persona.
// They take turns asking the quiz questions closest to their field.
export const guides = {
  priya: {
    name: "Dr. Priya",
    role: "Doctor",
    domain: "Healthcare and psychology",
    intro: "I work long shifts in a busy hospital. I'll ask how you handle pressure and look after people.",
    image: "/images/guide-priya.webp",
    tone: "bg-mint",
  },
  maya: {
    name: "Maya",
    role: "Product designer",
    domain: "Design and media",
    intro: "I design apps people use every day. I'll ask about your creative side.",
    image: "/images/guide-maya.webp",
    tone: "bg-lilac",
  },
  marcus: {
    name: "Marcus",
    role: "Startup founder",
    domain: "Business and finance",
    intro: "I built my company from a laptop and a lot of risk. I'll ask about money, ambition and deals.",
    image: "/images/guide-marcus.webp",
    tone: "bg-peach",
  },
  mei: {
    name: "Mei",
    role: "Data scientist",
    domain: "Data and research",
    intro: "I find stories hidden in numbers. I'll ask how you think and what you love to figure out.",
    image: "/images/guide-mei.webp",
    tone: "bg-sky",
  },
  ethan: {
    name: "Ethan",
    role: "Civil engineer",
    domain: "Engineering and sustainability",
    intro: "I build bridges, literally. I'll ask about hands-on work, plans and the outdoors.",
    image: "/images/guide-ethan.webp",
    tone: "bg-butter",
  },
  arjun: {
    name: "Arjun",
    role: "Software engineer",
    domain: "Technology",
    intro: "I write code that ships to millions of phones. I'll ask about focus and solving problems.",
    image: "/images/guide-arjun.webp",
    tone: "bg-rose",
  },
  claire: {
    name: "Claire",
    role: "Corporate lawyer",
    domain: "Law and public policy",
    intro: "I negotiate for a living. I'll ask about structure, rules and standing your ground.",
    image: "/images/guide-claire.webp",
    tone: "bg-sky",
  },
  kenji: {
    name: "Kenji",
    role: "Teacher",
    domain: "Education and mentoring",
    intro: "I teach high-school physics. I'll ask about teamwork, mentoring and what matters to you.",
    image: "/images/guide-kenji.webp",
    tone: "bg-mint",
  },
};

export const guideOrder = ["priya", "maya", "marcus", "mei", "ethan", "arjun", "claire", "kenji"];

// Who asks each of the 60 quiz questions, in question order
export const questionGuides = [
  // Checkpoint 1: How you think
  "arjun", "claire", "marcus", "mei", "maya", "arjun", "priya", "ethan", "priya", "arjun",
  // Checkpoint 2: Where you work best
  "ethan", "priya", "marcus", "arjun", "maya", "claire", "marcus", "claire", "ethan", "ethan",
  // Checkpoint 3: How you work with people
  "marcus", "kenji", "priya", "claire", "claire", "marcus", "priya", "kenji", "priya", "kenji",
  // Checkpoint 4: What you're good at
  "arjun", "mei", "maya", "kenji", "ethan", "mei", "arjun", "mei", "marcus", "claire",
  // Checkpoint 5: Fields that interest you
  "priya", "marcus", "arjun", "maya", "maya", "marcus", "mei", "marcus", "maya", "ethan",
  // Checkpoint 6: What matters to you
  "kenji", "claire", "claire", "ethan", "marcus", "kenji", "mei", "maya", "maya", "ethan",
];

// Six checkpoints of ten questions each; [start, end) indexes into the quiz questions
export const checkpoints = [
  { title: "How you think", badge: "Self-aware", image: "/images/badge-1.webp", start: 0, end: 10 },
  { title: "Where you work best", badge: "Workplace scout", image: "/images/badge-2.webp", start: 10, end: 20 },
  { title: "How you work with people", badge: "Team player", image: "/images/badge-3.webp", start: 20, end: 30 },
  { title: "What you're good at", badge: "Skill spotter", image: "/images/badge-4.webp", start: 30, end: 40 },
  { title: "Fields that interest you", badge: "Explorer", image: "/images/badge-5.webp", start: 40, end: 50 },
  { title: "What matters to you", badge: "Values compass", image: "/images/badge-6.webp", start: 50, end: 60 },
];

export const FINAL_TROPHY = "/images/trophy.webp";

// Short reactions to an answer, indexed by the answer value (1 = strongly disagree … 5 = strongly agree)
export const reactions = {
  1: ["Got it, that's not for you.", "Fair enough. Crossing that off.", "Noted. Knowing what you don't want helps too."],
  2: ["Leaning no. Noted.", "Okay, not a big draw for you.", "Got it, a soft no."],
  3: ["Somewhere in the middle. That's fine.", "Neutral it is.", "Could go either way. Noted."],
  4: ["Nice, that's a good sign.", "Good to know!", "A solid yes. Noted."],
  5: ["Love that!", "Strong yes. That says a lot.", "That's a big clue about you."],
};

export const XP_PER_ANSWER = 10;
export const XP_PER_CHECKPOINT = 50;
