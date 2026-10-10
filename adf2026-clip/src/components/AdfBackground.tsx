import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C } from "../theme";

/**
 * Fond animé remplaçant le « Fond Story » officiel (non récupérable) : dégradé teal des visuels ADF,
 * halos lumineux qui dérivent lentement, balayage de lumière et grain photographique.
 */
export const AdfBackground: React.FC<{ blur?: number; dim?: number }> = ({ blur = 0, dim = 0 }) => {
  const f = useCurrentFrame();
  const s = f / 30;
  const blobs = [
    { x: 30 + 12 * Math.sin(s * 0.23), y: 28 + 8 * Math.cos(s * 0.17), r: 55, c: "rgba(41,152,143,0.55)" },
    { x: 75 + 10 * Math.cos(s * 0.19), y: 62 + 10 * Math.sin(s * 0.21), r: 60, c: "rgba(30,131,125,0.6)" },
    { x: 50 + 18 * Math.sin(s * 0.11 + 2), y: 90 + 5 * Math.sin(s * 0.3), r: 45, c: "rgba(127,209,199,0.18)" },
  ];
  const sweep = ((s * 6) % 260) - 80;
  const seed = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.deep }}>
      <AbsoluteFill
        style={{
          filter: blur ? `blur(${blur}px)` : undefined,
          transform: blur ? "scale(1.08)" : undefined,
          background: `linear-gradient(170deg, ${C.night} 0%, ${C.teal} 35%, ${C.mid} 75%, ${C.light} 100%)`,
        }}
      >
        {blobs.map((b, i) => (
          <AbsoluteFill
            key={i}
            style={{ background: `radial-gradient(circle at ${b.x}% ${b.y}%, ${b.c} 0%, transparent ${b.r}%)` }}
          />
        ))}
        <AbsoluteFill
          style={{
            background: `linear-gradient(115deg, transparent ${sweep}%, rgba(255,255,255,0.06) ${sweep + 12}%, transparent ${sweep + 26}%)`,
          }}
        />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,15,20,0.55) 100%)" }} />
      </AbsoluteFill>
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(random(seed) * 1000)} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      {dim > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${dim})` }} />}
    </AbsoluteFill>
  );
};
