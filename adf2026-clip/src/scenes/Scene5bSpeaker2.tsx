import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SpeakerCard } from "../components/SpeakerCard";
import { SPEAKERS } from "../config";

export const WIPE = 14;

// Plan 5b — Intervenant 2 (0:23–0:26) : wipe diagonal par-dessus le plan 5a
export const Scene5bSpeaker2: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, WIPE], [-40, 140], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ clipPath: `polygon(0% 0%, ${x + 40}% 0%, ${x}% 100%, 0% 100%)` }}>
      <SpeakerCard src="assets/composites/sabek_generique.png" name={SPEAKERS.sabek} enterFromBottom={false} />
    </AbsoluteFill>
  );
};
