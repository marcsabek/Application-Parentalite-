"""Pipeline § 4 : intégration des portraits dans les cadres « têtes surcoiffées » ADF 2026.

Ordre des calques : plaque ADF (visage/corps d'origine effacés) → portrait → surcoiffure ADF.

Usage :
    python tools/compose_heads.py --models /chemin/modeles
Les modèles MediaPipe attendus : selfie_multiclass_256x256.tflite, face_landmarker.task.
"""
import argparse, json, os
import numpy as np, cv2, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "public", "assets")
OUT_W, OUT_H = 1080, 1350

# classes du modèle selfie_multiclass
BG, HAIR, BODY, FACE, CLOTHES, OTHERS = range(6)

FRAMES = {
    # coiffure : classes conservées au premier plan ; logo : zone exclue (x0, y0, x1, y1 en fraction)
    # hair_under : cheveux du portrait conservés seulement sous la surcoiffure (perruque couvrante)
    "generique": {"file": "adf/generique.jpg", "coiffure": [HAIR, OTHERS], "hair_under": True},
    "progr_sci": {"file": "adf/progr_sci.jpg", "coiffure": [OTHERS], "hair_under": False},
}
LOGO_BOX = (0.0, 0.0, 0.32, 0.33)
PORTRAITS = {
    "gardon": "src/gardon_2.jpg",
    "sabek": "src/sabek.jpg",
}
# désaturation des cheveux (reflets verts du feuillage sur la photo du Dr Sabek)
HAIR_DESAT = {"sabek": 0.75}
# décalage vertical du portrait (fraction de hauteur), pour dégager les yeux d'un bord de chapeau
OFFSET = {("sabek", "progr_sci"): 0.022}
# points MediaPipe Face Mesh : iris G/D, racine des cheveux, menton
LM = [468, 473, 10, 152]


class Analyzer:
    def __init__(self, models):
        self.seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
            base_options=BaseOptions(model_asset_path=os.path.join(models, "selfie_multiclass_256x256.tflite")),
            output_category_mask=True, output_confidence_masks=True))
        self.face = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=os.path.join(models, "face_landmarker.task")), num_faces=1))

    def run(self, bgr):
        h, w = bgr.shape[:2]
        im = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).copy())
        s = self.seg.segment(im)
        cat = s.category_mask.numpy_view().squeeze().copy()
        conf = [m.numpy_view().squeeze().copy() for m in s.confidence_masks]
        f = self.face.detect(im).face_landmarks
        if not f:
            raise RuntimeError("aucun visage détecté")
        pts = np.array([[f[0][i].x * w, f[0][i].y * h] for i in LM], np.float32)
        return cat, conf, pts


def box(x, r):
    return cv2.blur(x, (2 * r + 1, 2 * r + 1))


def guided(I, p, r, eps):
    mI, mp_ = box(I, r), box(p, r)
    a = (box(I * p, r) - mI * mp_) / (box(I * I, r) - mI * mI + eps)
    b = mp_ - a * mI
    return np.clip(box(a, r) * I + box(b, r), 0, 1)


def feather(mask, px):
    k = max(1, int(px)) * 2 + 1
    return cv2.GaussianBlur(mask.astype(np.float32), (k, k), 0)


def push_pull(f, known):
    """Remplit les trous par diffusion pyramidale : couleur lissée du fond voisin, sans couture."""
    levels, img, wts = [], f * known[..., None], known.astype(np.float32)
    while min(img.shape[:2]) > 4:
        levels.append((img, wts))
        img = cv2.pyrDown(img); wts = cv2.pyrDown(wts)
    est = img / (wts[..., None] + 1e-6)
    for img, wts in reversed(levels):
        up = cv2.resize(est, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LINEAR)
        cur = img / (wts[..., None] + 1e-6)
        a = np.clip(wts * 4, 0, 1)[..., None]
        est = cur * a + up * (1 - a)
    return est


def clean_plate(img, remove):
    """Efface la zone `remove` par diffusion du fond environnant + grain identique."""
    f = img.astype(np.float32) / 255
    fill = push_pull(f, ~remove)
    fill = cv2.GaussianBlur(fill, (0, 0), 8) + grain_like(img, remove.shape)
    a = feather(cv2.dilate(remove.astype(np.uint8), np.ones((7, 7))), 4)[..., None]
    return np.clip(f * (1 - a) + fill * a, 0, 1)


def grain_sigma(img):
    g = img.astype(np.float32) / 255
    return float(np.median(np.abs(g - cv2.GaussianBlur(g, (0, 0), 1.5)))) * 1.4826


def grain_like(img, shape, seed=7):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, grain_sigma(img[:200, -300:]), (*shape, 1)).astype(np.float32)
    return cv2.GaussianBlur(n, (0, 0), 0.6).reshape(*shape, 1)


def lab_match(src, src_mask, ref, ref_mask, strength):
    """Correspondance colorimétrique LAB calculée sur la peau : luminance sur tout le portrait,
    chrominance sur la peau seulement (les vêtements gardent leur couleur)."""
    s = cv2.cvtColor(src, cv2.COLOR_BGR2LAB).astype(np.float32)
    r = cv2.cvtColor(ref, cv2.COLOR_BGR2LAB).astype(np.float32)
    ms, ss = s[src_mask].mean(0), s[src_mask].std(0) + 1e-3
    mr, sr = r[ref_mask].mean(0), r[ref_mask].std(0) + 1e-3
    t = (s - ms) / ss * sr + mr
    skin = cv2.GaussianBlur(src_mask.astype(np.float32), (0, 0), src.shape[1] / 150)[..., None]
    wgt = np.concatenate([np.full_like(skin, strength * 0.6), skin * strength, skin * strength], -1)
    out = s * (1 - wgt) + t * wgt
    return cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


def despill(img, alpha, band=0.98):
    """Bords du détourage : remplace la couleur par celle de l'intérieur (supprime le liseré du fond d'origine)."""
    edge = ((alpha > 0.02) & (alpha < band)).astype(np.float32)
    inner = (alpha >= band).astype(np.float32)
    k = int(img.shape[1] / 60) | 1
    num = cv2.GaussianBlur(img.astype(np.float32) * inner[..., None], (k, k), 0)
    den = cv2.GaussianBlur(inner, (k, k), 0)[..., None] + 1e-4
    fill = num / den
    e = cv2.GaussianBlur(edge, (5, 5), 0)[..., None]
    return np.clip(img * (1 - e) + fill * e, 0, 255).astype(np.uint8)


def similarity(src_pts, dst_pts):
    M, _ = cv2.estimateAffinePartial2D(src_pts, dst_pts, method=cv2.LMEDS)
    return M


def compose(an, frame_key, person_key, ctrl_dir):
    fr = FRAMES[frame_key]
    adf = cv2.imread(os.path.join(A, fr["file"]))
    h, w = adf.shape[:2]
    cat, conf, fpts = an.run(adf)

    lx0, ly0, lx1, ly1 = LOGO_BOX
    logo = np.zeros((h, w), bool)
    logo[int(ly0 * h):int(ly1 * h), int(lx0 * w):int(lx1 * w)] = True

    coif = np.isin(cat, fr["coiffure"]) & ~logo
    # fragments de peau du mannequin (oreille) classés « cheveux » sous la ligne du front : exclus
    hsv = cv2.cvtColor(adf, cv2.COLOR_BGR2HSV)
    skinish = ((hsv[..., 0] < 20) | (hsv[..., 0] > 160)) & (hsv[..., 1] > 60)
    skinish &= np.arange(h)[:, None] > fpts[2, 1]
    skinish = cv2.dilate(skinish.astype(np.uint8), np.ones((9, 9))).astype(bool)
    coif &= ~skinish
    coif = cv2.morphologyEx(coif.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5))).astype(bool)
    gy = np.arange(h)[:, None]
    below = gy > fpts[2, 1] - 0.08 * h  # sous la racine des cheveux : épargne les instruments du chapeau
    person = (np.isin(cat, [FACE, BODY, CLOTHES, HAIR]) | (conf[BG] < 0.5)) & below
    remove = person & ~coif & ~logo
    remove = cv2.dilate(remove.astype(np.uint8), np.ones((25, 25))).astype(bool) & ~logo & ~coif
    plate = clean_plate(adf, remove)

    # --- portrait
    src = cv2.imread(os.path.join(A, PORTRAITS[person_key]))
    pcat, pconf, ppts = an.run(src)
    sh, sw = src.shape[:2]
    fg = 1 - pconf[BG]
    gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    r = max(4, int(sw / 120))
    alpha = guided(gray, cv2.GaussianBlur(fg, (0, 0), r / 2), r, 1e-3)
    alpha = np.clip((alpha - 0.45) / 0.35, 0, 1)
    alpha = cv2.erode(alpha, np.ones((3, 3)), iterations=max(1, r // 4))  # resserre le détourage
    hair_a = cv2.GaussianBlur((pcat == HAIR).astype(np.float32), (0, 0), r / 2)
    face_k = int(sw * 0.06) | 1
    face_near = cv2.GaussianBlur(cv2.dilate((pcat == FACE).astype(np.uint8), np.ones((face_k, face_k))).astype(np.float32), (0, 0), face_k / 3)

    skin_ref = cat == FACE
    skin_src = pcat == FACE
    src_h = lab_match(src, skin_src, adf, skin_ref, 0.6)
    if person_key in HAIR_DESAT:
        hsv_p = cv2.cvtColor(src_h, cv2.COLOR_BGR2HSV).astype(np.float32)
        hair_m = cv2.GaussianBlur((pcat == HAIR).astype(np.float32), (0, 0), r)
        hsv_p[..., 1] *= 1 - HAIR_DESAT[person_key] * hair_m
        src_h = cv2.cvtColor(hsv_p.astype(np.uint8), cv2.COLOR_HSV2BGR)
    src_h = despill(src_h, alpha)

    M = similarity(ppts, fpts)
    M[1, 2] += OFFSET.get((person_key, frame_key), 0) * h
    scale = float(np.hypot(M[0, 0], M[1, 0]))
    angle = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    # bord bas : prolonger le portrait vers le bas pour éviter tout vide en pied de cadre
    pad = int(h / scale)
    src_p = cv2.copyMakeBorder(src_h, 0, pad, 0, 0, cv2.BORDER_REPLICATE)
    a_p = cv2.copyMakeBorder(alpha, 0, pad, 0, 0, cv2.BORDER_REPLICATE)
    por = cv2.warpAffine(src_p, M, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    pa = cv2.warpAffine(a_p, M, (w, h), flags=cv2.INTER_LINEAR, borderValue=0)
    if fr["hair_under"]:
        ha = cv2.warpAffine(cv2.copyMakeBorder(hair_a, 0, pad, 0, 0, cv2.BORDER_CONSTANT), M, (w, h))
        under = feather(cv2.dilate(coif.astype(np.uint8), np.ones((7, 7))), 3)
        fn = cv2.warpAffine(cv2.copyMakeBorder(face_near, 0, pad, 0, 0, cv2.BORDER_CONSTANT), M, (w, h))
        pa = pa * (1 - ha * (1 - under) * (1 - fn))
    pa = feather(pa, 1)  # bords adoucis ≈ 2 px

    por = por.astype(np.float32) / 255
    # lumière d'ambiance : léger voile de la teinte du fond sur le portrait
    tint = cv2.GaussianBlur(plate, (0, 0), 60)
    por = np.clip(por * 0.85 + tint * 0.15, 0, 1)
    por += grain_like(adf, (h, w), seed=11)

    # --- surcoiffure au premier plan
    ca = feather(coif, 2)
    ca = np.maximum(ca, 0)[..., None]
    pa3 = pa[..., None]
    adf_f = adf.astype(np.float32) / 255
    out = plate * (1 - pa3) + por * pa3
    out = out * (1 - ca) + adf_f * ca

    name = f"{person_key}_{frame_key}"
    res = lambda x: cv2.resize(x, (OUT_W, OUT_H), interpolation=cv2.INTER_AREA)
    comp = (np.clip(res(out), 0, 1) * 255).astype(np.uint8)
    cv2.imwrite(os.path.join(A, "composites", f"{name}.png"), comp)
    # calques séparés pour l'animation (parallaxe)
    layers = os.path.join(A, "composites", "layers")
    os.makedirs(layers, exist_ok=True)
    cv2.imwrite(os.path.join(layers, f"plate_{name}.png"), (res(np.clip(plate, 0, 1)) * 255).astype(np.uint8))
    rgba = lambda c, a: np.dstack([(res(np.clip(c, 0, 1)) * 255).astype(np.uint8), (res(a) * 255).astype(np.uint8)])
    cv2.imwrite(os.path.join(layers, f"portrait_{name}.png"), rgba(por, pa))
    cv2.imwrite(os.path.join(layers, f"coiffure_{name}.png"), rgba(adf_f, ca[..., 0]))

    # --- contrôle : contours portrait (vert) et surcoiffure (magenta)
    ctrl = comp.copy()
    for m, col in ((res(pa) > 0.5, (0, 255, 0)), (res(ca[..., 0]) > 0.5, (255, 0, 255))):
        cs, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(ctrl, cs, -1, col, 2)
    cv2.imwrite(os.path.join(ctrl_dir, f"ctrl_{name}.png"), ctrl)

    k = OUT_W / w
    ys, xs = np.nonzero(cat == FACE)
    return name, {
        "frame": fr["file"], "portrait": PORTRAITS[person_key],
        "face_bbox": [int(xs.min() * k), int(ys.min() * k), int(xs.max() * k), int(ys.max() * k)],
        "eyes": (fpts[:2] * k).round(1).tolist(), "scale": round(scale, 4), "angle_deg": round(angle, 2),
    }


def duo(left, right, gap=24):
    """Assemble deux cartes côte à côte sur un canevas 1080 × 1350 transparent."""
    L = cv2.imread(os.path.join(A, "composites", f"{left}.png"))
    R = cv2.imread(os.path.join(A, "composites", f"{right}.png"))
    cw = (OUT_W - gap) // 2
    ch = int(cw * OUT_H / OUT_W)
    canvas = np.zeros((OUT_H, OUT_W, 4), np.uint8)
    y = (OUT_H - ch) // 2
    for i, c in enumerate((L, R)):
        x = i * (cw + gap)
        canvas[y:y + ch, x:x + cw, :3] = cv2.resize(c, (cw, ch), interpolation=cv2.INTER_AREA)
        canvas[y:y + ch, x:x + cw, 3] = 255
    cv2.imwrite(os.path.join(A, "composites", "duo_1080x1350.png"), canvas)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--models", required=True)
    ap.add_argument("--ctrl", default=os.path.join(ROOT, "out", "control"))
    a = ap.parse_args()
    os.makedirs(os.path.join(A, "composites"), exist_ok=True)
    os.makedirs(a.ctrl, exist_ok=True)
    an = Analyzer(a.models)
    meta = {}
    for frame in FRAMES:
        for person in PORTRAITS:
            name, m = compose(an, frame, person, a.ctrl)
            meta[name] = m
            print("ok", name, m["scale"], m["angle_deg"])
    duo("gardon_progr_sci", "sabek_progr_sci")
    with open(os.path.join(A, "composites", "frames.json"), "w") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
