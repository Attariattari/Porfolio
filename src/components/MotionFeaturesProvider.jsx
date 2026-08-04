"use client";

import { LazyMotion } from "framer-motion";

const loadMotionFeatures = () =>
  import("@/lib/motionFeatures").then((module) => module.default);

export default function MotionFeaturesProvider({ children }) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      {children}
    </LazyMotion>
  );
}
