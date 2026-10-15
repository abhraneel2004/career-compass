import React from "react";
import { motion } from "framer-motion";
import { EASE_OUT, viewportOnce } from "../../lib/motion";

// Fades its children up into place the first time they scroll into view
const Reveal = ({ as = "div", delay = 0, x = 0, y = 28, className, children, ...rest }) => {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.75, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Reveal;
