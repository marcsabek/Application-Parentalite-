import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AdfBackground } from "../components/AdfBackground";
import { C, W800 } from "../theme";

// Plan 1 — Accroche (0:00–0:04)
export const Scene1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const bg = interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const txt = interpolate(f, [12, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(f, [0, 120], [1, 1.05]);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: bg }}>
        <AdfBackground blur={30} dim={0.25} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${scale})` }}>
        <div style={{ ...W800, opacity: txt, color: C.white, fontSize: 120, letterSpacing: -2, textShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
          Dans 10 ans…
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
