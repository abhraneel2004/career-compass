// One place to register GSAP plugins so every component gets the same instance
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Scroll-linked effects only run for visitors who haven't asked for reduced motion.
// Without them the markup already shows its final state.
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
