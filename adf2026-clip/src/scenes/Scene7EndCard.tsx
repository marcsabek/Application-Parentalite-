import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AdfBackground } from "../components/AdfBackground";
import { CONGRESS } from "../config";
import { C, useLayout, W500, W800 } from "../theme";

// Plan 7 — Carton final (0:33–0:36), logo vertical officiel non modifié ; tenue fixe ≥ 1,5 s
export const Scene7EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { top, bottom, story } = useLayout();
  const logo = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const txt = interpolate(f, [12, 27], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoH = story ? 620 : 470;
  return (
    <AbsoluteFill>
      <AdfBackground />
      <AbsoluteFill style={{ top, bottom, height: "auto", justifyContent: "center", alignItems: "center" }}>
        <Img src={staticFile("assets/adf/logo_V.png")} style={{ height: logoH, opacity: logo, boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }} />
        <div style={{ opacity: txt, textAlign: "center", marginTop: story ? 60 : 36 }}>
          <div style={{ ...W800, color: C.white, fontSize: 54 }}>{CONGRESS.dates}</div>
          <div style={{ ...W500, color: C.white, fontSize: 42, marginTop: 6 }}>{CONGRESS.place}</div>
          <div style={{ ...W800, color: C.mint, fontSize: 52, marginTop: 26 }}>{CONGRESS.url}</div>
          <div style={{ ...W500, color: "rgba(255,255,255,0.85)", fontSize: 32, marginTop: 20 }}>{CONGRESS.hashtags}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
