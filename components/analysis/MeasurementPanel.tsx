"use client";

export type MorphometricMeasurement = {
  label: string;
  value: string;
  x: number;
  y: number;
};

type MeasurementPanelProps = {
  measurements: MorphometricMeasurement[];
};

export default function MeasurementPanel({ measurements }: MeasurementPanelProps) {
  return (
    <ul className="morph-panel-list">
      {measurements.map((measurement, index) => (
        <li key={measurement.label}>
          <b>{String.fromCharCode(65 + index)}</b>
          <span>{measurement.label}</span>
          <strong>{measurement.value}</strong>
        </li>
      ))}
    </ul>
  );
}
