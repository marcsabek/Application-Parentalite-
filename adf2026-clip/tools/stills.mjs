// Stills de contrôle (§ 9) des deux formats. SHOW_SAFE_ZONES=true superpose les zones de sécurité.
//   node tools/stills.mjs            (REMOTION_BROWSER=/chemin/headless_shell facultatif)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const FRAMES = (process.env.FRAMES || "60,240,375,480,560,660,720,840,945,1050").split(",").map(Number);
const COMPS = ["Clip-1080x1920", "Clip-1080x1350"];
const inputProps = { showSafeZones: process.env.SHOW_SAFE_ZONES === "true" };
const browserExecutable = process.env.REMOTION_BROWSER || null;

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of COMPS) {
  const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable });
  for (const frame of FRAMES) {
    const output = `out/stills/${id}_f${String(frame).padStart(4, "0")}.png`;
    await renderStill({ composition, serveUrl, output, frame, inputProps, browserExecutable });
    console.log(output);
  }
}
