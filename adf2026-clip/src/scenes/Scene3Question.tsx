import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, useLayout, W800 } from "../theme";

// Plan 3 — La question (0:10–0:15) : deux moitiés glissant depuis les bords
const Half: React.FC<{ side: "left" | "right"; text: string; bg: string; delay: number }> = ({ side, text, bg, delay }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { W, top, bottom } = useLayout();
  const s = spring({ frame: f - delay, fps, config: { damping: 14 } });
  const x = (1 - s) * (side === "left" ? -W / 2 : W / 2);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: W / 2,
        left: side === "left" ? 0 : W / 2,
        background: bg,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `${top}px 44px ${bottom}px`,
      }}
    >
      <div style={{ ...W800, color: C.white, fontSize: 70, lineHeight: 1.12, textAlign: "center" }}>{text}</div>
    </div>
  );
};

export const Scene3Question: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.deep }}>
    <Half side="left" text="Du travail pour chaque praticien ?" bg={`linear-gradient(180deg, ${C.night}, ${C.teal})`} delay={0} />
    <Half side="right" text="Des soins pour chaque patient ?" bg={`linear-gradient(180deg, ${C.mid}, ${C.light})`} delay={18} />
  </AbsoluteFill>
);
