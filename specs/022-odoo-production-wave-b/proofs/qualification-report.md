# Rapport de qualification — 022 odoo-production-wave-b

**Date** : 2026-08-19 · **Addon** : `piqueray_ds` 19.0.1.4.0 → **19.0.1.5.0** ·
**Racines** : 8 → **10** (`+ds.coordonnees +ds.reassurances`) · **Fermeture du lock** :
15 → **18** contrats (`ds.carte` entre par la fermeture de Réassurances) ·
**graphDigest** : `102c372a…` → `8b31b022…`

Instance : `odoo:19.0-20260803` + `postgres:15` (compose QA, base jetable
reconstruite à chaque scénario). Chromium 151.0.7922.34.

---

## 1. Deux sections de production livrées, mesurées (SC-003, SC-004, SC-005)

| Section | Installe | Scénario QA (FR-015) | Spike | Delta visuel (SC-003) |
|---|---|---|---|---|
| **Coordonnées** `ds.coordonnees@2.2.0` | ✅ 0 erreur console/réseau | ✅ **15/15** | ✅ D9 Tél/Email **5/5** | **0.1007 %** — attribué (lien Option A + AA) |
| **Réassurances** `ds.reassurances@1.2.0` | ✅ 0 erreur console/réseau | ✅ **16/16** | — | **0.4530 %** — attribué (texte ×4 + placeholders + DW-002) |

Chaque delta non nul est **chiffré et attribué à une cause nommée** (reçus
`proofs/{coordonnees,reassurances}-visual/RECEIPT.md`). Aucun écart de composition, de
géométrie ou de contenu ; la composition se superpose au contrat des deux côtés.

### Ce que les scénarios prouvent (SC-007 — gate → comportement conforme)

- **Coordonnées** : pose + isolation (2 instances), inventaire de panneau **exact**,
  actions de racine {move, duplicate, remove} seules, actions natives interdites
  absentes, bloc Tél/Email en liens `tel:`/`mailto:` + saut de ligne + soulignement
  (Q-C1 Option A) survivant à pose→édition→save→reopen→public, icônes sociales
  cliquables au panneau (Q-C2, `javascript:` refusé), plan Google placeholder sans
  action média (décision gate C1/C2), zones non éditables verrouillées, persistance,
  **w-auto 1728/1440 zéro débordement** (wrapper 576 tenu, plan fléchit).
- **Réassurances** : la **collection répétée** — les 4 gestes {ajouter, supprimer,
  monter, descendre} bornes 0..n, gestes natifs de carte neutralisés, édition carte N
  sans toucher N+1, **en-tête fixé par composition non éditable** (R3), CTA libellé
  éditable + lien au panneau (Q-R2), image de carte via `/web/image` (R2c) + alt
  d'instance (R2d), persistance, **w-auto grille de 4 colonnes** (Q-R1) : 0
  débordement à 1728/1440, 4 cartes par rangée aux deux largeurs.

Toute divergence table validée ↔ comportement livré serait un défaut ou un retour au
gate ; aucune n'a été observée.

## 2. Portes Odoo statiques (sans instance) — vertes

| Porte | Résultat |
|---|---|
| `odoo:inputs:check` | ✅ 18 contrats, digest `8b31b022…` |
| `odoo:authoring:check` | ✅ les 2 configs couvrent leur graphe (Coordonnées 16/16·27/27 ; Réassurances 52/52·53/53) |
| `odoo:derivation:check` | ✅ **57 blocs** (47 fondation → 51 Coordonnées +4 → 57 Réassurances +6 ; regex de marqueur élargie `ODOO-019-` → `ODOO-\d{3}-`) |
| `odoo:module:check` | ✅ **18/18** — versions/lock/digest ancrés sur les **10** racines (FR-013) |
| `odoo:assets --check` | ✅ 8 sorties clean, deux constructions identiques à l'octet |
| `odoo:typecheck` | ✅ |

## 3. Non-régression (SC-006) — witnesses transversaux + couches statiques

Rejeu sur **instance propre** des bancs transversaux (ceux que touchent les
changements partagés de cette vague) :

| Banc | Résultat | Ce qu'il prouve |
|---|---|---|
| `versioning` | ✅ **6/6** | Le **cascade de digest** ne périme aucune des 10 racines : current/policy-stale/structure-stale/unknown classent correctement après le repin |
| `install-update` | ✅ **2/2** | Install propre + update sans altérer le contenu public déjà posé |
| `combined-isolation` | ✅ **5/5** | 6 sections co-posées restent isolées |
| `editability-boundary` | ⚠️ **43/44** (voir §5, PRÉ-EXISTANT) | Les 43 constats de **gouvernance** (racines fermées, parts rouvertes, descendants verrouillés) tiennent ; le seul écart est une sonde de comptage de champ de panneau **stale depuis `cc6cd0d4`**, indépendante de 022 |

**Honnêteté §V — portée de la non-régression.** Les **8 scénarios de section
individuels** (`{presentation,hero,equipe,faq,devis,sav,texte-seo,google-reviews}
-functional/visual`) n'ont **pas** été re-déroulés un à un dans cette session. La
non-régression des 8 sections repose donc sur : (a) les bancs transversaux ci-dessus
(qui exercent plusieurs sections + les mécanismes partagés), (b) les portes statiques
(`module`/`derivation`/`authoring` vérifient structure + versions des 10 racines), (c)
le smoke d'installation (0 erreur console avec les 10 sections installées), (d)
`versioning` (les 10 racines classent current). **Les changements de 022 aux 8
sections existantes sont purement ADDITIFS** : aucun QWeb, config, panneau ou pont
d'une section existante n'a été modifié — seuls la fondation partagée (cascade digest,
vérifiée par `versioning`) et l'ajout des 2 nouvelles racines. Un rejeu individuel
complet des 8 reste disponible (`integrations/odoo/qa/scenarios/*.spec.mts`).

## 4. Sweep dépôt (constitution) — vert

| Gate | Résultat |
|---|---|
| `npm run build` | ✅ |
| `npm run plugin:check` | ✅ (3 flows composites SKIPPED et nommés — pré-existant) |
| `npx tsx scripts/deterministic-roundtrip.mjs` | ✅ byte-identique ×2 |
| `node scripts/core-browser-check.mjs` | ✅ core bundle browser-pure |
| `npx tsc --noEmit && npx tsc -p tsconfig.build.json` | ✅ |
| `npm run eval` | ✅ **219/219** (voir §5 : fixture version-drift re-pinée au nouveau digest) |
| `npm run parity` | ✅ **exit 0** — findings « icons AHEAD » (close.svg) **pré-existants et informatifs** ; 022 ne touche NI contrats NI core NI tokens NI registre d'icônes (vérifié `git diff main..HEAD`), donc la portée de parity est intacte |
| `odoo:visual:selftest --strict --subjects {coordonnees,reassurances}.mts` | ✅ **9/9** chacun (la forme bare saute les contrôles de sujets par conception ; `--subjects` les exerce) |

## 5. Écarts nommés (honnêteté §V)

1. **`odoo:qualification` échoue sur une incohérence de reçu 019 PRÉ-EXISTANTE** —
   `google-reviews-performance` référence une empreinte périmée de
   `google-reviews-functional.json`, fichiers **non modifiés depuis HEAD** (vérifié
   `git status`), donc antérieurs à 022. Sa résolution appartient à une
   re-qualification complète de 019, pas à cette vague. Nommé, pas absorbé.
2. **`editability-boundary` 43/44 — PRÉ-EXISTANT à 022, prouvé.** La sonde « champ de
   panneau non déclaré » compte les `input` hors `[data-pqr-control="show-cta"]` ; or le
   `BuilderUrlPicker` du **lien CTA** de Présentation ajoute un tel input. Ce picker a
   été introduit par **`cc6cd0d4` (CTA-link, 2026-08-18)**, AVANT 022, et le reçu
   committé (HEAD) date d'AVANT `cc6cd0d4` — d'où son `0` périmé. Vérifié
   **déterministe** (échec identique en re-run isolé, pas un flake) et **hors 022** :
   `git log main..HEAD` montre que 022 ne touche NI `editability-boundary.spec.mts` NI
   le bloc `ODOO-019-PRESENTATION-PANEL`. L'assertion `champsNonDeclares === 0` est
   devenue fausse quand `cc6cd0d4` a ajouté le champ ; sa mise à jour appartient à une
   maintenance du banc 019, pas à 022. Les 43 constats de **gouvernance** passent.
3. **Fixture eval `version-drift` re-pinée** — le repin faisait classer le bloc
   sauvegardé « current » en structure-stale (218/219). Fixture mise au nouveau digest
   + version module ; l'eval revérifie les 4 états (`fd984314`). Aucune valeur de
   design touchée.

Limites de conception nommées ailleurs : `proofs/limits.md` (plan placeholder, Q-C1
sous-pixel, R2d alt hors route, DW-002, bloc figé).

## 6. État repartable de l'addon

Addon prouvé et **repartable** : 8 → 10 sections gouvernées, versions/lock/digest
alignés sur les 10 racines (FR-013), 2 sections de production utilisables, portes
statiques vertes, sweep dépôt vert. Aucun contrat, token, Figma ni `core/` modifié
(Figma en lecture zéro). Re-pin surface amont : **zéro** (contrats/tokens intacts) ;
les re-pins internes à la vague sont l'assets généré (fermeture élargie), le digest
cascade (3 transcriptions), et la fixture eval version-drift.
