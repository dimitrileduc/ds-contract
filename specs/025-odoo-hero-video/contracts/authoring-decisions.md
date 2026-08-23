# Décisions d'authoring — `hero-video.authoring.json`

**Interface exposée** : la config de décision consommée par `check-authoring.ts` (aucun verdict par défaut — chaque prop et part de la fermeture `ds.hero-video → ds.button` doit être tranchée explicitement). Schéma : `specs/019-odoo-production-foundation/contracts/authoring-config.schema.json`. Patron : `integrations/odoo/config/hero.authoring.json`.

## En-tête

| Champ | Valeur |
|---|---|
| `schemaVersion` | `1.0.0` |
| `configId` | `odoo-hero-video-authoring` |
| `authoringVersion` | valeur courante commune des configs (alignée à l'implémentation) |
| `snapshotId` | `odoo-019-foundation` |
| `rootContract` | `{ id: "ds.hero-video", version: "1.0.0" }` |

## `rootActions`

`move`, `duplicate`, `remove` → **allowed** ; `save-as-custom`, `resize`, `background` → **forbidden** (identique aux autres blocs).

## `controls[]` — une décision par prop de la fermeture

### Occurrence racine `ds.hero-video` v1.0.0

| Prop | Verdict | Mechanism | Cible / note |
|---|---|---|---|
| `backgroundUrl` | controlled | computed-display | `.s_pqr_hero_video [data-pqr-part="hero-video-poster"]` — « Remplacer l'image » (poster ; action média du panneau) |
| `backgroundAlt` | controlled | plain-text | même part — « Alternative de l'image » |
| `videoUrl` | **not-offered** | — | canal code-side, aucune projection Odoo (décision déterministe du contrat ; spec Edge Cases). Verdict fermé EXPLICITE, jamais silencieux (§V) |
| `accroche` | controlled | plain-text | `.s_pqr_hero_video [data-pqr-part="hero-video-title"]` — édition inline |

### Occurrence imbriquée `ds.button` (chemin `ds.hero-video → Bouton`)

Reprendre les verdicts de l'occurrence CTA de `hero.authoring.json`, réadressés `componentPath` complet (`ds.hero-video` → `ds.button`), sélecteurs préfixés `.s_pqr_hero_video ` :

| Prop `ds.button` | Verdict attendu | Note |
|---|---|---|
| libellé (text) | controlled / inline | `[data-pqr-part="button-label"]` |
| `variant` | fixed (`outlineBlanc`) | valeur du contrat hero-video, non offerte |
| `iconLeft` / `iconRight` / glyphes | fixed | valeurs du contrat hero-video (`false`/`false`/`arrow-right`) |
| href / cible du lien | controlled | `BuilderUrlPicker` du panneau (`pqrSetCtaHref`-like, actionParam adressant le CTA de ce root) |
| toute autre prop de `ds.button` | reprendre le verdict hero, réadressé | l'énumération EXACTE sort de `check-authoring.ts` : la porte liste elle-même ce qui manque |

## `parts[]` — une décision par part atteignable

| Part (partPath) | Verdict | contentKind | Selector (root-scopé obligatoire) | allowedMarks |
|---|---|---|---|---|
| `root` | not-editable | structural | `.s_pqr_hero_video` | `[]` |
| `root.Background` | not-editable (média via contrôle) | media | `.s_pqr_hero_video [data-pqr-part="hero-video-poster"]` | `[]` |
| `root.VoileBas` | not-editable | structural | `…voile-bas"]` | `[]` |
| `root.VoileNavigation` | not-editable | structural | `…voile-navigation"]` | `[]` |
| `root.Text` | not-editable | structural | `…hero-video-content"]` | `[]` |
| `root.Text.Accroche` | **editable** | text | `…hero-video-title"]` | `[]` — poids unique Regular (Step 0), pas de `strong` |
| `root.Bouton` + parts internes `ds.button` | label **editable**, structure not-editable | text/structural | `…button-root"]` / `…button-label"]` | `[]` |

## Règles de validation (portes)

- `check-authoring.ts` : zéro décision manquante / surnuméraire / doublon / ambiguë / incohérente ; refuse toute racine hors `ROOT_CONTRACT_IDS` ; exige une config pour **chaque** id de `ALL_ROOT_CONTRACT_IDS` (donc ce fichier est OBLIGATOIRE dès que `ds.hero-video` entre dans la liste).
- Chaque `decisionId` de ce fichier est référencé par le `data-pqr-control` du panneau et/ou les listes d'`authoring.js` — traçabilité contrôle ↔ décision.
