# Clip promotionnel ADF 2026 — Dr Marc Sabek & Dr Guillaume Gardon-Mollard

Projet Remotion (React + TypeScript), 36 s, 30 fps. Deux compositions sur la même timeline :
`Clip-1080x1920` (master vertical) et `Clip-1080x1350` (post 4:5).

## Assets (hors dépôt)
À placer dans `public/assets/` (kit ADF et portraits non versionnés) :
- `adf/generique.jpg`, `adf/progr_sci.jpg`, `adf/logo_V.png`, `adf/schema_omni.jpg`
- `portraits/gardon_2.jpg`, `portraits/sabek.jpg`

## Pipeline
```bash
python -m venv .venv && .venv/bin/pip install -r tools/requirements.txt scipy
.venv/bin/python tools/compose_heads.py --models <dossier modèles MediaPipe>   # composites têtes (§ 4)
.venv/bin/python tools/make_music.py                                         # musique originale (§ 7)
npm install
SHOW_SAFE_ZONES=true node tools/stills.mjs                                   # stills de contrôle (§ 9)
npm run render                                                               # rendu final des 2 formats
```
Modèles MediaPipe : `selfie_multiclass_256x256.tflite` et `face_landmarker.task`
(storage.googleapis.com/mediapipe-models). `REMOTION_BROWSER` permet d'indiquer un Chrome headless local.

## Données
Toutes les valeurs du clip sont dans `src/config.ts`. Une valeur `null` s'affiche en placeholder rouge
`[… À COMPLÉTER]` — c'est le cas de la salle tant qu'elle n'est pas connue.
`WITH_VOICEOVER` active les sous-titres burn-in de la voix off quand un enregistrement sera ajouté.
