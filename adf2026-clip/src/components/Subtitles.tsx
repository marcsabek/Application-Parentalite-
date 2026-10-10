import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CAPTIONS } from "../config";
import { useLayout, W500 } from "../theme";

/** Sous-titres burn-in de la voix off, posés juste au-dessus de la zone de sécurité basse. */
export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const { bottom } = useLayout();
  const c = CAPTIONS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const o = interpolate(f, [c.from, c.from + 4, c.to - 4, c.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom + 10 }}>
      <div
        style={{
          ...W500,
          opacity: o,
          maxWidth: 900,
          fontSize: 38,
          lineHeight: 1.3,
          color: "white",
          textAlign: "center",
          padding: "10px 22px",
          borderRadius: 12,
          background: "rgba(0,20,25,0.62)",
        }}
      >
        {c.text}
      </div>
    </AbsoluteFill>
  );
};
