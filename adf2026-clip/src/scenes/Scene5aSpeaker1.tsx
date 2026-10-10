import React from "react";
import { SpeakerCard } from "../components/SpeakerCard";
import { SPEAKERS } from "../config";

// Plan 5a — Intervenant 1 (0:20–0:23), cadre Générique
export const Scene5aSpeaker1: React.FC = () => <SpeakerCard src="assets/composites/gardon_generique.png" name={SPEAKERS.gardon} />;
