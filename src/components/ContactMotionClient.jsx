"use client";

import React from "react";
import { motion } from "framer-motion";

export function MotionDiv({ children, className = "", ...props }) {
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionA({ children, className = "", ...props }) {
  return (
    <motion.a className={className} {...props}>
      {children}
    </motion.a>
  );
}
