# Libéral(e) & Parent — Guide interactif 2026

Application web progressive (PWA) pour chirurgiens-dentistes libéraux.  
Simulateur de prestations maternité, paternité et adoption.

**CDS+** — 54 rue Ampère, 75017 Paris — contact@cdservicesplus.com

---

## Fonctionnalités

- **Simulateur** : calcul automatique des prestations selon la situation personnelle
- **Chronologie** : frise interactive des étapes et versements
- **Démarches** : checklist cochable avec délais et pièces à fournir
- **Comparatif** : titulaire vs collaborateur libéral
- **Montants 2026** : tableau récapitulatif de tous les chiffres clés
- **Export PDF** : génération d'un PDF personnalisé depuis le simulateur
- **PWA** : installable sur smartphone, fonctionne hors-ligne

---

## Déploiement sur GitHub Pages (avec GitHub Desktop)

### Étape 1 — Installer GitHub Desktop

1. Télécharger GitHub Desktop : https://desktop.github.com
2. L'installer et se connecter avec votre compte GitHub.

### Étape 2 — Créer le dépôt (repository)

1. Ouvrir **GitHub Desktop**.
2. Menu **File → New Repository…**
3. Remplir :
   - **Name** : `liberal-et-parent`
   - **Local Path** : choisir un dossier sur votre ordinateur (ex. Bureau)
   - Cocher **Initialize this repository with a README** : NON (on a déjà le nôtre)
4. Cliquer **Create Repository**.

### Étape 3 — Ajouter les fichiers de l'application

1. Ouvrir le dossier du dépôt créé à l'étape 2 :
   - Dans GitHub Desktop, cliquer **Show in Explorer** (Windows) ou **Show in Finder** (Mac)
2. Copier-coller dans ce dossier les 4 fichiers suivants :
   ```
   index.html
   manifest.json
   sw.js
   README.md
   ```
3. Revenir dans **GitHub Desktop** : les fichiers apparaissent dans la colonne de gauche sous « Changes ».

### Étape 4 — Faire le premier commit

1. En bas à gauche de GitHub Desktop, dans le champ **Summary** :
   - Taper : `Première version — Libéral(e) & Parent 2026`
2. Cliquer **Commit to main**.

### Étape 5 — Publier sur GitHub

1. Cliquer le bouton **Publish repository** (en haut).
2. Vérifier :
   - **Name** : `liberal-et-parent`
   - Décocher **Keep this code private** si vous voulez que le site soit public
3. Cliquer **Publish Repository**.

### Étape 6 — Activer GitHub Pages

1. Aller sur **github.com** dans votre navigateur.
2. Ouvrir votre dépôt : `https://github.com/VOTRE-NOM/liberal-et-parent`
3. Cliquer sur **Settings** (onglet en haut).
4. Dans le menu de gauche, cliquer **Pages**.
5. Sous **Source**, choisir :
   - **Branch** : `main`
   - **Folder** : `/ (root)`
6. Cliquer **Save**.
7. Attendre 1 à 2 minutes.

### Étape 7 — Accéder à votre site

Votre application est maintenant en ligne à l'adresse :

```
https://VOTRE-NOM.github.io/liberal-et-parent/
```

(Remplacer `VOTRE-NOM` par votre nom d'utilisateur GitHub.)

Vous pouvez partager cette URL avec vos adhérents. Sur mobile, ils pourront installer l'application sur leur écran d'accueil.

---

## Mises à jour ultérieures

Pour modifier l'application après le déploiement :

1. Modifier les fichiers dans le dossier local.
2. Ouvrir **GitHub Desktop** : les changements apparaissent automatiquement.
3. Écrire un résumé (ex. « Mise à jour montants 2027 »).
4. Cliquer **Commit to main**.
5. Cliquer **Push origin** (en haut).
6. Le site se met à jour automatiquement en 1-2 minutes.

---

## Mise à jour annuelle des montants

Pour actualiser les chiffres, ouvrir `index.html` dans un éditeur de texte (Bloc-notes, VS Code…) et modifier les constantes en haut du script :

```javascript
const PASS = 48060;        // Plafond annuel SS
const PMSS = 4005;         // Plafond mensuel SS
const IJ_JOUR = 65.84;     // IJ forfaitaire/jour
const IJ_CARCDSF = 113.22; // IJ CARCDSF/jour
const IJ_PLAFOND = 197.51; // Plafond IJ maladie CPAM
```

Puis faire un commit + push (voir « Mises à jour ultérieures » ci-dessus).

---

## Structure du projet

```
liberal-et-parent/
├── index.html       ← Application complète (React + logique + styles)
├── manifest.json    ← Manifest PWA (nom, icône, thème)
├── sw.js            ← Service Worker (cache offline)
└── README.md        ← Ce fichier
```

---

## Sources réglementaires

- PMSS 2026 : arrêté du 22 décembre 2025 (JO du 23/12/2025)
- IJ CARCDSF : barème 2026 (revalorisation +2 %)
- Congé supplémentaire de naissance : LFSS 2026, art. 99
- Décrets d'application : à paraître (entrée en vigueur 1er juillet 2026)
