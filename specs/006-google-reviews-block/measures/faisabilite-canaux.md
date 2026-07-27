# Table de faisabilité des canaux — bloc « Avis Google »

Verdicts calculés **depuis le code** (`packages/schema/src/contract-schema.ts`, importé directement,
jamais recopié à la main) — `npx tsx -e "import { LITERAL_CHANNELS, DECLARED_CHANNELS } from …"` :

- **`LITERAL_CHANNELS`** (27 canaux, dont `background`/`background-color`/`color`/`width`/`height`/
  `gap`/`border-radius`/`font-size`/`line-height`/`letter-spacing`/`padding-*`) — valeur dessinée si
  elle matche `LITERAL_VALUE_RE` (nombre+`px`/`rem`/`em`, hex, `rgb()`/`rgba()`,
  `transparent`/`inherit`/`currentColor`). **`box-shadow` confirmé ABSENT** (vérifié par le code, pas
  supposé) — R10 tenait.
- **`DECLARED_CHANNELS` `canvas:'draw'`** (6, confirmé par le code) : `aspect-ratio`,
  `text-overflow`, `text-transform`, `text-decoration-line`, `text-align`, `font-family`.
- **`DECLARED_CHANNELS` `canvas:'annotate'`** (36, confirmé par le code) : `position`, `display`,
  `overflow-x/y`, `white-space`, `max-width/height`, `border-style` (+ 4 par côté), `transition-*`
  (5), `background-*` (7 sous-canaux), `cursor`, `user-select`, `pointer-events`, `touch-action`,
  `appearance`, `text-rendering`, `font-feature-settings`, `text-decoration-style/thickness`,
  `isolation`, `outline-style`.

Après cette table, `npm run build` + `npm run figma:plan` ne sont plus qu'une **confirmation**
(R10) — chaque `(part, canal, valeur)` ci-dessous a déjà son verdict avant l'écriture du contrat.

## Verdicts par valeur mesurée (T017)

| Part | Canal | Valeur mesurée | Verdict | Note |
|---|---|---|---|---|
| carte (root) | `background-color` | `#FFFFFF` | **token** | `{color.blanc}` — accord exact |
| section (root) | `background-color` | `#F4F6FA` (décision R10, pas mesuré sur cet aplat) | **token** | `{color.bleu-clair}` |
| auteur (texte) | `color` | `#000000` | **literal** | dans `LITERAL_CHANNELS`, matche `LITERAL_VALUE_RE` (hex) ; Δ vs `{color.noir}` trop visible (55/255) pour aligner |
| date (texte) | `color` | `#8A8A8A` | **literal** | idem ; Δ vs `{color.bleu-gris}` trop visible (teinte neutre vs bleutée) |
| témoignage (texte) | `color` | `#000000` | **literal** | même valeur que auteur — un seul literal réutilisable |
| badge vérifié | `background-color` | `#000000` | **literal** | fond du badge rond |
| carte (root) | `gap` (entre cartes) | ≈8,7px CSS (hors échelle `{0,4,10,16,32}`) | **literal** | `gap` **est** dans `LITERAL_CHANNELS` ; repli R10 (hors échelle) |
| carte (root) | `border-radius` | ~8px (non finement mesuré, repli R10) | **literal** | matche `LITERAL_VALUE_RE` (nombre+px) ; seul `radius/32` existe côté tokens, hors échelle |
| avatar | `width`/`height` | ≈38,7px CSS | **literal** | `width`/`height` **sont** dans `LITERAL_CHANNELS` |
| avatar | `border-radius` (cercle) | — | **literal, MAIS PAS `50%`** | ⚠️ **trouvaille** : `LITERAL_VALUE_RE` n'accepte **aucune unité `%`** (grammaire = nombre nu/px/rem/em, hex, rgba, mots-clés) — un cercle **ne peut pas** s'écrire `border-radius:"50%"` en literal. Repli : rayon en **px absolu = moitié du diamètre mesuré** (ex. `"19px"` pour un avatar de 38,7px), valeur dessinée identique à l'œil mais qui doit être recalculée si le diamètre change — à documenter dans la `description` de la part (FR-009). |
| badge vérifié | `width`/`height` | ≈14,7px CSS | **literal** | idem avatar (px absolu, pas `%`, même trouvaille) |
| étoile | `icon.asset` | `star` (existant) | **n/a — pas un canal literal/declared** | asset gouverné réemployé (registre v1.1.0), R7 — aucune mesure de couleur/taille à transcrire en canal, c'est une référence d'icône |
| marque (logo Google) | `icon.asset` | `google` (net-new) | **n/a** | glyphe interne D7 (R4) — même mécanisme que `check`/`close`, pas un canal de style |
| témoignage | `-webkit-line-clamp` | troncature multi-lignes visible sur au moins un avis | **refusé** | absent des deux registres (ni `LITERAL_CHANNELS` ni `DECLARED_CHANNELS`) — confirmé par le code. Repli R10 : transcrire exactement ce que le widget a déjà tronqué (ellipse comprise), aucune troncature CSS revendiquée |
| témoignage | `text-overflow` (1 ligne) | n/a pour ce bloc (les avis mesurés tiennent sur 1-2 lignes fixes, pas de troncature 1-ligne à dessiner) | **declared-draw** (si jamais utilisé) | disponible si besoin futur (`textTruncation:'ENDING'`), non mobilisé ici |
| carte / section (racine) | `position`/`display` | auto-layout pur, aucun positionnement absolu | **declared-annotate** (non mobilisé) | anatomie 100% flex/auto-layout — ces canaux ne sont pas utilisés, donc pas annotés en pratique |
| police (nom/date/texte/résumé) | `font-family` | Montserrat (seule police gouvernée) | **declared-draw** | dessiné nativement (`fontName`) ; substitution vs Trustindex = terme dominant de l'écart (R3), nommé, pas corrigé |
| police (nom/date/texte/résumé) | `font-size` | non tranché par T017 (cf. limite nommée) | **literal (probable) ou token si alignement à un style existant** | à confirmer contre les 16 styles de texte Piqueray (post-005) pendant l'écriture du contrat (T031) — **pas encore vérifié si un style existant matche** |
| carte (root) | `box-shadow` (séparation carte/fond) | absent des deux registres, confirmé | **refusé** | repli déjà tranché (R10) : séparation par la **couleur** (carte blanche sur fond bleu-clair), jamais par l'ombre |

## Impasses confirmées et repli (aucune nouvelle depuis research.md R10)

- **`box-shadow`** refusé → séparation carte/fond par couleur gouvernée (déjà dans le tableau).
- **`-webkit-line-clamp`** refusé → transcription exacte de la troncature déjà visible dans l'aplat.
- **Rayon circulaire (`%`)** — **trouvaille de cette table**, pas anticipée par `research.md` : le
  contournement (rayon px absolu) est mécanique et sans coût, mais doit être documenté par part
  (FR-009) pour ne pas se lire comme une valeur arbitraire.

## Verdict

Aucune valeur mesurée n'entre dans une impasse non contournable. `npm run build` + `npm run
figma:plan` (Phase 4a) ne feront que confirmer ce tableau — aucune surprise de canal attendue.
