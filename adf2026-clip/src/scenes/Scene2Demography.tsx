import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AdfBackground } from "../components/AdfBackground";
import { DEMOGRAPHY } from "../config";
import { C, fmt, useLayout, W500, W800 } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Plan 2 — Le choc démographique (0:04–0:10)
export const Scene2Demography: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { W, H, top, bottom, story } = useLayout();
  const p = interpolate(f, [15, 90], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const value = DEMOGRAPHY.today + (DEMOGRAPHY.in10yLow - DEMOGRAPHY.today) * p;
  const high = spring({ frame: f - 82, fps, config: { damping: 14 } });
  const badge = spring({ frame: f - 110, fps, config: { damping: 10, stiffness: 160 } });
  const enter = interpolate(f, [0, 12], [0, 1], clamp);
  const tagToday = interpolate(f, [10, 20], [1, 0], clamp);

  // champ de points qui se densifie : un point par ~50 praticiens
  const dots = useMemo(
    () => Array.from({ length: 1300 }, (_, i) => ({ x: random(`x${i}`) * W, y: random(`y${i}`) * H, r: 2 + random(`r${i}`) * 3 })),
    [W, H],
  );
  const shown = Math.floor(interpolate(f, [0, 15, 90, 180], [250, 1000, 1260, 1300], clamp));

  return (
    <AbsoluteFill>
      <AdfBackground dim={0.15} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {dots.slice(0, shown).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={i < 1000 ? "rgba(255,255,255,0.16)" : "rgba(127,209,199,0.5)"} />
        ))}
      </svg>
      <AbsoluteFill style={{ top, height: H - top - bottom, justifyContent: "center", alignItems: "center", opacity: enter }}>
        <div style={{ ...W500, color: C.mint, fontSize: 40, textTransform: "uppercase", letterSpacing: 4, height: 50 }}>
          {tagToday > 0.01 ? <span style={{ opacity: tagToday }}>Aujourd'hui</span> : <span style={{ opacity: Math.min(1, (f - 20) / 10) }}>Dans 10 ans</span>}
        </div>
        <div style={{ ...W800, color: C.white, fontSize: story ? 230 : 200, lineHeight: 1, letterSpacing: -6, fontVariantNumeric: "tabular-nums" }}>
          {fmt(value)}
        </div>
        <div style={{ ...W800, color: C.white, fontSize: story ? 130 : 110, lineHeight: 1.1, opacity: high, transform: `translateY(${(1 - high) * 40}px)` }}>
          à {fmt(DEMOGRAPHY.in10yHigh)}
        </div>
        <div style={{ ...W500, color: C.white, fontSize: 52, marginTop: 24 }}>chirurgiens-dentistes en France</div>
        <div
          style={{
            ...W800,
            marginTop: 50,
            fontSize: 72,
            color: C.white,
            background: C.red,
            padding: "14px 40px",
            borderRadius: 18,
            transform: `scale(${badge}) rotate(${(1 - badge) * -8}deg)`,
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
          }}
        >
          {DEMOGRAPHY.badge}
        </div>
      </AbsoluteFill>
      <div
        style={{
          ...W500,
          position: "absolute",
          left: 60,
          right: 60,
          bottom: bottom + 8,
          fontSize: 24,
          lineHeight: 1.35,
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
          opacity: enter,
        }}
      >
        {DEMOGRAPHY.source}
      </div>
    </AbsoluteFill>
  );
};
