import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AquaScope",
  description: "AI destekli balıkçılık platformu",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
