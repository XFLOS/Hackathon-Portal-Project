// src/components/animation/StaggerList.jsx
import React from "react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const StaggerList = ({ children, className = "" }) => (
  <motion.div
    className={className}
    variants={container}
    initial="hidden"
    animate="show"
  >
    {React.Children.map(children, (child) => (
      <motion.div variants={item}>{child}</motion.div>
    ))}
  </motion.div>
);
