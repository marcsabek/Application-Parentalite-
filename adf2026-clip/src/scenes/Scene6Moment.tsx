import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AdfBackground } from "../components/AdfBackground";
import { Field } from "../components/Placeholder";
import { SESSION } from "../config";
import { C, useLayout, W500, W800 } from "../theme";

const CPS = 1.6; // caractères par frame (typewriter accéléré)

const Typed: React.FC<{ text: string; start: number; children?: (shown: string) => React.ReactNode; style: React.CSSProperties }> = ({ text, start, style, children }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor((f - start) * CPS));
  const shown = text.slice(0, n);
  return <div style={{ ...style, minHeight: "1.2em" }}>{children ? children(shown) : shown}</div>;
};

// Plan 6 — Le moment (0:30–0:33)
export const Scene6Moment: React.FC = () => {
  const f = useCurrentFrame();
  const { top, bottom } = useLayout();
  const l1 = "Le rendez-vous";
  const l2 = "à ne pas manquer";
  const start3 = (l1.length + l2.length) / CPS + 4;
  const fade = interpolate(f, [start3, start3 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const big = { ...W800, color: C.white, fontSize: 96, lineHeight: 1.1, textAlign: "center" } as const;
  const small = { ...W500, color: C.white, fontSize: 50, lineHeight: 1.35 } as const;
  return (
    <AbsoluteFill>
      <AdfBackground />
      <AbsoluteFill style={{ top, bottom, height: "auto", justifyContent: "center", alignItems: "center" }}>
        <Typed text={l1} start={0} style={big} />
        <Typed text={l2} start={l1.length / CPS} style={big} />
        <div style={{ marginTop: 60, opacity: fade, textAlign: "center", background: "rgba(4,51,69,0.7)", padding: "26px 44px", borderRadius: 16, borderTop: `8px solid ${C.green}` }}>
          <div style={{ ...small, ...W800 }}>
            Séance <Field value={SESSION.code} label="CODE" />
          </div>
          <div style={small}>
            <Field value={SESSION.day} label="JOUR" /> · <Field value={SESSION.time} label="HEURE" />
          </div>
          <div style={small}>
            Salle <Field value={SESSION.room} label="SALLE" />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
