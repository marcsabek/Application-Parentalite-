import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { SafeZones } from "./components/SafeZones";
import { Subtitles } from "./components/Subtitles";
import { DURATION, T, WITH_VOICEOVER } from "./config";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Demography } from "./scenes/Scene2Demography";
import { Scene3Question } from "./scenes/Scene3Question";
import { Scene4Answer } from "./scenes/Scene4Answer";
import { Scene5aSpeaker1 } from "./scenes/Scene5aSpeaker1";
import { Scene5bSpeaker2, WIPE } from "./scenes/Scene5bSpeaker2";
import { Scene5cDuo } from "./scenes/Scene5cDuo";
import { Scene6Moment } from "./scenes/Scene6Moment";
import { Scene7EndCard } from "./scenes/Scene7EndCard";

export type ClipProps = { showSafeZones: boolean };

const seq = ([a, b]: readonly [number, number], extra = 0) => ({ from: a, durationInFrames: b - a + extra });

export const Clip: React.FC<ClipProps> = ({ showSafeZones }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Sequence {...seq(T.hook)}><Scene1Hook /></Sequence>
    <Sequence {...seq(T.demography)}><Scene2Demography /></Sequence>
    <Sequence {...seq(T.question)}><Scene3Question /></Sequence>
    <Sequence {...seq(T.answer)}><Scene4Answer /></Sequence>
    <Sequence {...seq(T.speaker1, WIPE)}><Scene5aSpeaker1 /></Sequence>
    <Sequence {...seq(T.speaker2)}><Scene5bSpeaker2 /></Sequence>
    <Sequence {...seq(T.duo)}><Scene5cDuo /></Sequence>
    <Sequence {...seq(T.moment)}><Scene6Moment /></Sequence>
    <Sequence {...seq(T.endCard)}><Scene7EndCard /></Sequence>
    {WITH_VOICEOVER && <Subtitles />}
    <Audio
      src={staticFile("assets/audio/music.wav")}
      volume={(f) => interpolate(f, [DURATION - 10, DURATION], [1, 0], { extrapolateLeft: "clamp" })}
    />
    {showSafeZones && <SafeZones />}
  </AbsoluteFill>
);
