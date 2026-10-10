import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AdfBackground } from "../components/AdfBackground";
import { C, FONT, useLayout, W800 } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Schéma tripolaire redessiné d'après « L'équilibre de l'omnipratique moderne » (ADF2026.003.jpeg)
const PILLARS = [
  { label: "Médical", sub: "au service du patient", color: C.blue, x: 540, y: 130 },
  { label: "Éthique", sub: "environnement social", color: C.green, x: 250, y: 440 },
  { label: "Économique", sub: "entreprise libérale", color: C.red, x: 830, y: 440 },
];
const BOX = { x: 540, y: 800, w: 720, h: 170 };

// Plan 4 — La réponse (0:15–0:20)
export const Scene4Answer: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { top, bottom, story, H } = useLayout();
  const stamp = spring({ frame: f, fps, config: { damping: 12, stiffness: 200 } });
  const titleScale = interpolate(stamp, [0, 1], [1.4, 1]);
  const diagramH = H - top - bottom - (story ? 260 : 200);
  const k = Math.min(1, diagramH / 1000);
  const box = spring({ frame: f - 80, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <AdfBackground />
      <AbsoluteFill style={{ top, bottom, height: "auto", alignItems: "center" }}>
        <div
          style={{
            ...W800,
            marginTop: story ? 40 : 10,
            fontSize: story ? 112 : 96,
            color: C.white,
            letterSpacing: -2,
            transform: `scale(${titleScale})`,
            opacity: stamp,
            textShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          L'OMNIPRATIQUE
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <svg width={1080 * k} height={1000 * k} viewBox="0 0 1080 1000">
          {PILLARS.map((p, i) => {
            const d = `M ${p.x} ${p.y + (i === 0 ? 185 : 185)} C ${p.x} ${p.y + 300}, ${BOX.x} ${BOX.y - 260}, ${BOX.x} ${BOX.y - BOX.h / 2}`;
            const len = 900;
            const draw = interpolate(f, [45 + i * 6, 80 + i * 6], [len, 0], clamp);
            return <path key={`l${i}`} d={d} stroke={p.color} strokeWidth={10} fill="none" strokeDasharray={len} strokeDashoffset={draw} strokeLinecap="round" />;
          })}
          {PILLARS.map((p, i) => {
            const s = spring({ frame: f - 20 - i * 10, fps, config: { damping: 12 } });
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) scale(${s})`}>
                <circle r={120} fill={p.color} stroke="white" strokeWidth={6} />
                <text textAnchor="middle" y={15} fill="white" style={{ fontFamily: FONT, fontWeight: 800, fontSize: p.label.length > 8 ? 34 : 44 }}>
                  {p.label}
                </text>
                <text textAnchor="middle" y={165} fill="rgba(255,255,255,0.9)" style={{ fontFamily: FONT, fontWeight: 500, fontSize: 30 }}>
                  {p.sub}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${BOX.x} ${BOX.y}) scale(${box})`} opacity={box}>
            <rect x={-BOX.w / 2} y={-BOX.h / 2} width={BOX.w} height={BOX.h} rx={28} fill="white" />
            <text textAnchor="middle" y={18} fill={C.deep} style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58 }}>
              Succès et pérennité
            </text>
          </g>
        </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
