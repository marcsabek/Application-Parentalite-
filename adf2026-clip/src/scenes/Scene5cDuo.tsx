import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AdfBackground } from "../components/AdfBackground";
import { CONFERENCE } from "../config";
import { C, useLayout, W500, W800 } from "../theme";

const JOIN = 18; // frame de jonction des deux cadres (flash blanc 4 frames)

// Plan 5c — Le duo (0:26–0:30), cadre « Programme scientifique » (conférence classique, § 4.4)
export const Scene5cDuo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { W, top, bottom, story, H } = useLayout();
  const gap = 20;
  const cw = story ? 520 : 470;
  const ch = cw * 1.25;
  const s = spring({ frame: f, fps, durationInFrames: JOIN, config: { damping: 200 } });
  const off = (1 - s) * (W / 2 + cw);
  const flash = interpolate(f, [JOIN, JOIN + 1, JOIN + 4], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(f, [JOIN + 4, JOIN + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // bloc titre + cartes centré verticalement dans la zone utile
  const titleH = story ? 390 : 360;
  const blockTop = top + Math.max(0, (H - top - bottom - titleH - ch) / 2);
  const cardsTop = blockTop + titleH;
  const card = (src: string, dx: number) => (
    <div
      style={{
        position: "absolute",
        top: cardsTop,
        left: W / 2 + dx,
        width: cw,
        height: ch,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%" }} />
    </div>
  );
  return (
    <AbsoluteFill>
      <AdfBackground />
      <AbsoluteFill style={{ top: blockTop, alignItems: "center", opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>
        <div style={{ ...W500, color: C.mint, fontSize: story ? 38 : 34, textTransform: "uppercase", letterSpacing: 2, marginTop: story ? 20 : 0 }}>
          {CONFERENCE.kicker}
        </div>
        <div style={{ ...W800, color: C.white, fontSize: 60, lineHeight: 1.15, textAlign: "center", marginTop: 18 }}>
          {CONFERENCE.title.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </AbsoluteFill>
      {card("assets/composites/gardon_progr_sci.png", -cw - gap / 2 - off)}
      {card("assets/composites/sabek_progr_sci.png", gap / 2 + off)}
      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};
