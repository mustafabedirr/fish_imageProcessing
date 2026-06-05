"use client";

import { motion } from "framer-motion";

type FishMeasurementPointProps = {
  label: string;
  x: number;
  y: number;
};

export default function FishMeasurementPoint({ label, x, y }: FishMeasurementPointProps) {
  return (
    <motion.g
      className="morph-point"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <circle cx={x} cy={y} r="7" />
      <text x={x} y={y + 3}>
        {label}
      </text>
    </motion.g>
  );
}
