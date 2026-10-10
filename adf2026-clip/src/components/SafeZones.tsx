import React from "react";
import { AbsoluteFill } from "remotion";
import { useLayout } from "../theme";

/** Overlay de contrôle des zones de sécurité (§ 9), activé par la prop showSafeZones. */
export const SafeZones: React.FC = () => {
  const { top, bottom } = useLayout();
  const band = { position: "absolute", left: 0, right: 0, background: "rgba(255,0,80,0.35)" } as const;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...band, top: 0, height: top }} />
      <div style={{ ...band, bottom: 0, height: bottom }} />
    </AbsoluteFill>
  );
};
