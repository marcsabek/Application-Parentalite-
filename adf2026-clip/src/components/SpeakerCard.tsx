import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, useLayout, W800 } from "../theme";

/** Composite tête surcoiffée + nom : entrée par le bas (spring) et Ken Burns 3 %. */
export const SpeakerCard: React.FC<{ src: string; name: string; enterFromBottom?: boolean }> = ({ src, name, enterFromBottom = true }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { W, H, top, bottom, story } = useLayout();
  const s = enterFromBottom ? spring({ frame: f, fps, config: { damping: 15 } }) : 1;
  const kb = interpolate(f, [0, durationInFrames], [1, 1.03]);
  const cardW = story ? W : W;
  const cardH = cardW * 1.25;
  const y = story ? top + 10 : (H - cardH) / 2;
  const nameIn = interpolate(f, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nameBottom = story ? bottom + 30 : bottom;
  return (
    <AbsoluteFill style={{ backgroundColor: C.deep }}>
      <div style={{ position: "absolute", left: 0, top: y, width: cardW, height: cardH, overflow: "hidden", transform: `translateY(${(1 - s) * H}px)` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", transform: `scale(${kb})`, transformOrigin: "50% 40%" }} />
      </div>
      {story && (
        <>
          <AbsoluteFill style={{ top: 0, height: y + 4, background: `linear-gradient(180deg, ${C.night}, ${C.teal})` }} />
          <AbsoluteFill style={{ top: y + cardH - 4, background: `linear-gradient(180deg, #23887f, ${C.night})` }} />
        </>
      )}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: nameBottom }}>
        <div
          style={{
            ...W800,
            fontSize: name.length > 20 ? 50 : 64,
            color: C.white,
            background: "rgba(4,51,69,0.88)",
            borderLeft: `10px solid ${C.red}`,
            padding: "16px 34px",
            borderRadius: 10,
            opacity: nameIn,
            transform: `translateY(${(1 - nameIn) * 30}px)`,
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          }}
        >
          {name}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
