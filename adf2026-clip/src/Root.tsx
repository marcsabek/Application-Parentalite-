import React from "react";
import { Composition } from "remotion";
import { Clip, ClipProps } from "./Clip";
import { DURATION, FPS } from "./config";

const defaults: ClipProps = { showSafeZones: process.env.REMOTION_SHOW_SAFE_ZONES === "true" };

export const Root: React.FC = () => (
  <>
    {/* Master vertical : story Instagram / Reels / LinkedIn */}
    <Composition id="Clip-1080x1920" component={Clip} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={defaults} />
    {/* Déclinaison post 4:5 — même timeline */}
    <Composition id="Clip-1080x1350" component={Clip} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} defaultProps={defaults} />
  </>
);
