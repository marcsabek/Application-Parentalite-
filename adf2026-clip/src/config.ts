// Données du clip (§ 0 du script). `null` = valeur non fournie : affichée en placeholder rouge,
// jamais inventée. Le rendu final ne doit plus contenir de placeholder (§ 9).

export const FPS = 30;
export const DURATION = 1080; // 36 s

export const CONFERENCE = {
  title: ["Honoraires,", "nomenclature, éthique :", "comment valoriser", "votre pratique ?"],
  kicker: "Une conférence sortie des sentiers battus",
  format: "Conférence",
};

export const SESSION = {
  code: "E117" as string | null,
  day: "Samedi 28 novembre" as string | null,
  time: "9 h 00" as string | null,
  room: "Amphithéâtre Bordeaux" as string | null,
};

export const CONGRESS = {
  dates: "24–28 novembre 2026",
  place: "Palais des Congrès – Paris",
  url: "adfcongres.com",
  hashtags: "#CongresADF #FormationDentaire #ADF2026",
};

export const DEMOGRAPHY = {
  today: 50134,
  in10yLow: 60000,
  in10yHigh: 63000,
  badge: "+ 20 à 25 %",
  source:
    "50 134 inscrits au 9 oct. 2026 (ONCD) · projection : prolongement de la tendance 2023-2026 (+2,8 %/an)",
};

export const SPEAKERS = {
  gardon: "Dr Guillaume GARDON-MOLLARD",
  sabek: "Dr Marc SABEK",
};

// Version sans voix off (§ 6, option 3) : les sous-titres de la voix off sont prêts mais désactivés.
export const WITH_VOICEOVER = false;

// Timeline (frames) — § 5
export const T = {
  hook: [0, 120],
  demography: [120, 300],
  question: [300, 450],
  answer: [450, 600],
  speaker1: [600, 690],
  speaker2: [690, 780],
  duo: [780, 900],
  moment: [900, 990],
  endCard: [990, 1080],
} as const;

// Voix off (§ 6) — sous-titres burn-in, synchronisés sur les plans
export const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 10, to: 110, text: "Dans dix ans…" },
  { from: 125, to: 215, text: "nous serons soixante à soixante-trois mille chirurgiens-dentistes." },
  { from: 215, to: 295, text: "Jusqu'à un quart de plus qu'aujourd'hui." },
  { from: 305, to: 445, text: "Comment garantir du travail à chacun… et des soins pour tous ?" },
  { from: 455, to: 595, text: "La réponse : l'omnipratique. Médicale, éthique, économique." },
  { from: 605, to: 775, text: "Avec Guillaume Gardon-Mollard et Marc Sabek," },
  { from: 785, to: 895, text: "une conférence sortie des sentiers battus pour préparer l'avenir de la profession." },
  { from: 905, to: 985, text: "Le rendez-vous à ne pas manquer." },
  { from: 995, to: 1075, text: "Congrès de l'ADF. Paris. Novembre 2026." },
];
