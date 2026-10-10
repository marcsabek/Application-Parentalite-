import { continueRender, delayRender, staticFile, useVideoConfig } from "remotion";

// Palette échantillonnée sur les visuels ADF 2026 (fonds teal) et le logo officiel
export const C = {
  deep: "#043345",
  night: "#0b2a33",
  teal: "#1a4f53",
  mid: "#1e837d",
  light: "#29988f",
  mint: "#7fd1c7",
  red: "#e30614",
  green: "#009640",
  blue: "#1d70b8",
  white: "#ffffff",
  todo: "#ff2a2a",
};

// Montserrat embarquée (public/assets/fonts) : le navigateur de rendu n'accède pas à Google Fonts
export const FONT = "Montserrat";
const fontHandle = delayRender("Montserrat");
Promise.all(
  (["500", "800"] as const).map((w) =>
    new FontFace(FONT, `url(${staticFile(`assets/fonts/Montserrat-${w}.ttf`)}) format("truetype")`, { weight: w })
      .load()
      .then((ff) => document.fonts.add(ff)),
  ),
)
  .then(() => continueRender(fontHandle))
  .catch((e) => {
    throw e;
  });

export const W800 = { fontFamily: FONT, fontWeight: 800 } as const;
export const W500 = { fontFamily: FONT, fontWeight: 500 } as const;

/** Zones de sécurité : 250 px haut / 340 px bas en vertical (interface Instagram), marges simples en 4:5. */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const story = height > 1600;
  const top = story ? 250 : 90;
  const bottom = story ? 340 : 90;
  return { W: width, H: height, story, top, bottom, inner: height - top - bottom };
};

export const fmt = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
