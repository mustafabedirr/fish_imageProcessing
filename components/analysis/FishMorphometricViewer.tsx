"use client";

import { motion } from "framer-motion";
import FishMeasurementLine from "./FishMeasurementLine";
import FishMeasurementPoint from "./FishMeasurementPoint";
import MeasurementPanel, { type MorphometricMeasurement } from "./MeasurementPanel";

type FishMorphometricViewerProps = {
  species: string;
  measurements: MorphometricMeasurement[];
};

const guideLines = [
  { x1: 28, y1: 40, x2: 452, y2: 40, variant: "primary" as const },
  { x1: 66, y1: 232, x2: 420, y2: 232, variant: "primary" as const },
  { x1: 92, y1: 168, x2: 380, y2: 168, variant: "guide" as const },
  { x1: 238, y1: 70, x2: 238, y2: 180, variant: "vertical" as const },
  { x1: 92, y1: 118, x2: 136, y2: 118, variant: "guide" as const },
];

export default function FishMorphometricViewer({ species, measurements }: FishMorphometricViewerProps) {
  return (
    <div className="morph-viewer" aria-label={`${species} morfometrik olcum gorseli`}>
      <div className="morph-svg-wrap">
        <svg viewBox="0 0 480 260" role="img" aria-labelledby="morph-title">
          <title id="morph-title">{species} morfometrik olcumleri</title>
          <defs>
            <linearGradient id="morphBody" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#7892a8" />
              <stop offset="34%" stopColor="#263e54" />
              <stop offset="70%" stopColor="#132535" />
              <stop offset="100%" stopColor="#061323" />
            </linearGradient>
            <linearGradient id="morphBelly" x1="0" x2="1">
              <stop offset="0%" stopColor="#c7d4dd" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#273c52" stopOpacity="0.16" />
            </linearGradient>
            <radialGradient id="morphEye" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#e7fbff" />
              <stop offset="38%" stopColor="#1fa4df" />
              <stop offset="100%" stopColor="#03101b" />
            </radialGradient>
            <filter id="morphGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="morph-grid">
            <path d="M24 40H454M24 104H454M24 168H454M24 232H454" />
            <path d="M68 26V238M152 26V238M236 26V238M320 26V238M404 26V238" />
          </g>

          {guideLines.map((line) => (
            <FishMeasurementLine key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}`} {...line} />
          ))}

          <motion.g
            className="morph-fish"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <path
              className="morph-tail morph-tail-shadow"
              d="M386 122 C425 76 458 62 448 114 C472 135 468 184 419 155 C400 170 379 180 358 170 C374 150 377 133 386 122Z"
            />
            <path
              className="morph-tail"
              d="M376 120 C423 76 454 70 443 118 C468 138 462 178 416 151 C394 166 374 170 352 163 C371 146 371 134 376 120Z"
            />
            <path
              className="morph-body-shadow"
              d="M72 131 C106 74 185 52 278 78 C323 91 359 111 388 130 C348 166 306 188 242 190 C157 193 96 170 72 131Z"
            />
            <path
              className="morph-body"
              d="M60 130 C98 74 183 50 278 78 C326 92 360 112 392 130 C350 165 305 188 240 189 C151 192 92 168 60 130Z"
            />
            <path
              className="morph-belly"
              d="M84 145 C137 166 209 173 286 161 C246 187 157 194 93 160 C81 154 75 147 84 145Z"
            />
            <path
              className="morph-back"
              d="M115 90 C174 55 272 66 342 108 C261 90 180 86 115 90Z"
            />
            <path
              className="morph-dorsal"
              d="M188 73 C211 31 242 58 258 80 C233 73 213 70 188 73Z"
            />
            <path
              className="morph-dorsal morph-dorsal--rear"
              d="M278 83 C312 48 332 78 338 106 C317 94 299 88 278 83Z"
            />
            <path
              className="morph-fin"
              d="M214 154 C235 144 252 151 266 167 C232 182 210 181 214 154Z"
            />
            <path
              className="morph-fin morph-fin--pelvic"
              d="M152 158 C166 152 179 157 185 174 C160 179 148 174 152 158Z"
            />
            <path
              className="morph-gill"
              d="M126 101 C107 118 105 146 124 162"
            />
            <path
              className="morph-mouth"
              d="M61 130 C79 122 92 122 105 128"
            />
            <path
              className="morph-lateral"
              d="M122 122 C190 110 284 114 356 134"
            />
            <circle className="morph-eye" cx="103" cy="113" r="9" />
            <circle className="morph-eye-dot" cx="105" cy="112" r="3" />
            {Array.from({ length: 22 }).map((_, index) => (
              <path
                className="morph-scale"
                d={`M${144 + index * 10} ${104 + Math.sin(index) * 8} C${151 + index * 10} ${118 + Math.cos(index) * 8} ${151 + index * 10} ${144 + Math.sin(index) * 7} ${143 + index * 10} ${156 + Math.cos(index) * 5}`}
                key={index}
              />
            ))}
          </motion.g>

          {measurements.map((measurement, index) => (
            <FishMeasurementPoint
              key={measurement.label}
              label={String.fromCharCode(65 + index)}
              x={measurement.x}
              y={measurement.y}
            />
          ))}
        </svg>
      </div>

      <MeasurementPanel measurements={measurements} />
    </div>
  );
}
