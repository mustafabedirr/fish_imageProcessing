"use client";

import { motion } from "framer-motion";

type FishMeasurementLineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  variant?: "primary" | "vertical" | "guide";
};

export default function FishMeasurementLine({
  x1,
  y1,
  x2,
  y2,
  variant = "guide",
}: FishMeasurementLineProps) {
  return (
    <motion.line
      className={`morph-line morph-line--${variant}`}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    />
  );
}
