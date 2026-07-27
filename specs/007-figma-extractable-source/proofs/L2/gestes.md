# Gestes du lot L2 — Primitives & rôles (US2, T026-T034) + correctif B

Transcription verbatim du script exécuté via `figma_execute` (`contracts/proof-cycle.md`
§2, étape 5). Toutes les valeurs viennent de `decisions.md` (section « Phase 4 (US2) —
Préparation T026-T032 »), elles-mêmes dérivées du relevé corrigé
(`releves/canaux-E-in-scope-2026-07-26.json`) et de la table de rôles de `naming-table.md`
§7, croisées avec `research.md` R8 (mesure live des 18 styles).

**Portée du geste** : création pure de variables Figma (aucun nœud/style n'en consomme
encore) + 1 renommage de calque isolé (correctif B, `decisions.md`). **0 pixel attendu par
construction** — une variable non consommée ne rend rien, un renommage ne change qu'un
libellé.

## 1 · Primitives créées (26) — collection `Primitives` (`VariableCollectionId:4:26`, mode `Value`/`4:0`)

```
font/size/44              FLOAT  44   scope FONT_SIZE
font/size/54              FLOAT  54   scope FONT_SIZE
font/weight/bold          FLOAT  700  scope FONT_WEIGHT
font/line-height/16       FLOAT  16   scope ALL_SCOPES
font/line-height/20       FLOAT  20   scope ALL_SCOPES
font/line-height/24       FLOAT  24   scope ALL_SCOPES
font/line-height/25       FLOAT  25   scope ALL_SCOPES
font/line-height/27       FLOAT  27   scope ALL_SCOPES
font/line-height/30       FLOAT  30   scope ALL_SCOPES
font/line-height/40       FLOAT  40   scope ALL_SCOPES
font/line-height/48       FLOAT  48   scope ALL_SCOPES
font/line-height/50       FLOAT  50   scope ALL_SCOPES
font/line-height/60       FLOAT  60   scope ALL_SCOPES
font/line-height/68       FLOAT  68   scope ALL_SCOPES
font/letter-spacing/15    FLOAT  15   scope ALL_SCOPES
space/8                   FLOAT  8    scope WIDTH_HEIGHT, GAP
space/12                  FLOAT  12   scope WIDTH_HEIGHT, GAP
space/24                  FLOAT  24   scope WIDTH_HEIGHT, GAP
space/48                  FLOAT  48   scope WIDTH_HEIGHT, GAP
space/64                  FLOAT  64   scope WIDTH_HEIGHT, GAP
space/89                  FLOAT  89   scope WIDTH_HEIGHT, GAP
space/96                  FLOAT  96   scope WIDTH_HEIGHT, GAP
space/128                 FLOAT  128  scope WIDTH_HEIGHT, GAP
space/392                 FLOAT  392  scope WIDTH_HEIGHT, GAP
radius/500                FLOAT  500  scope CORNER_RADIUS
border-width/1            FLOAT  1    scope STROKE_FLOAT
```

Chaque variable reçoit aussi `codeSyntax.WEB = var(--<name kebab>)`, cohérent avec les
variables sœurs déjà en place (ex. `font/size/16` → `var(--font-size-16)`).

## 2 · Rôles étendus (T033, 8) — collection `Semantic` (`VariableCollectionId:2027:975`, mode `Light`/`2027:0`)

Alias FLOAT ajoutés aux 8 rôles existants (family/size/weight déjà posés, non touchés) :

```
typography/titre-1/line-height       → alias font/line-height/60
typography/titre-2/line-height       → alias font/line-height/50
typography/titre-3/line-height       → alias font/line-height/40
typography/titre-4/line-height       → alias font/line-height/30
typography/titre-5/line-height       → alias font/line-height/25
typography/titre-6/line-height       → alias font/line-height/20
typography/paragraphe/line-height    → alias font/line-height/24
typography/lead/line-height          → alias font/line-height/27
```

## 3 · Rôles neufs (T034, 10 rôles → 40 variables)

```
typography/titre-hero/family              → alias font/family/montserrat
typography/titre-hero/size                → alias font/size/54
typography/titre-hero/weight              → alias font/weight/bold
typography/titre-hero/line-height         → alias font/line-height/68

typography/libelle-bouton/family          → alias font/family/montserrat
typography/libelle-bouton/size            → alias font/size/16
typography/libelle-bouton/weight          → alias font/weight/medium
typography/libelle-bouton/line-height     → alias font/line-height/22   (primitive existante)

typography/paragraphe-gras/family         → alias font/family/montserrat
typography/paragraphe-gras/size           → alias font/size/14
typography/paragraphe-gras/weight         → alias font/weight/bold
typography/paragraphe-gras/line-height    → alias font/line-height/24

typography/accroche/family                → alias font/family/montserrat
typography/accroche/size                  → alias font/size/20
typography/accroche/weight                → alias font/weight/regular
typography/accroche/line-height           → alias font/line-height/25
typography/accroche/letter-spacing        → alias font/letter-spacing/15   (5e propriété, seul rôle concerné)

typography/onglet/family                  → alias font/family/montserrat
typography/onglet/size                    → alias font/size/20
typography/onglet/weight                  → alias font/weight/semibold
typography/onglet/line-height             → alias font/line-height/25

typography/titre-3-majuscules/family      → alias font/family/montserrat
typography/titre-3-majuscules/size        → alias font/size/32
typography/titre-3-majuscules/weight      → alias font/weight/regular
typography/titre-3-majuscules/line-height → alias font/line-height/40

typography/titre-2-majuscules/family      → alias font/family/montserrat
typography/titre-2-majuscules/size        → alias font/size/40
typography/titre-2-majuscules/weight      → alias font/weight/regular
typography/titre-2-majuscules/line-height → alias font/line-height/50

typography/titre-hero-video/family        → alias font/family/montserrat
typography/titre-hero-video/size          → alias font/size/44
typography/titre-hero-video/weight        → alias font/weight/regular
typography/titre-hero-video/line-height   → alias font/line-height/48

typography/libelle-nav/family             → alias font/family/montserrat
typography/libelle-nav/size               → alias font/size/16
typography/libelle-nav/weight             → alias font/weight/medium
typography/libelle-nav/line-height        → alias font/line-height/16

typography/note-de-champ/family           → alias font/family/montserrat
typography/note-de-champ/size             → alias font/size/14
typography/note-de-champ/weight           → alias font/weight/regular
   (pas de line-height — interligne AUTO, non liable, cf. FR-019/T055 — décision écrite,
   pas une propriété manquante par oubli)
```

## 4 · Correctif B — renommage isolé (FR-005, gap trouvé hors recensement T008a(a))

```
2104:2891   "Tél : +32 (0)87 46 32 66  Email: info@piqueray.be"   →   ContactValeur
```

Suit le schéma déjà posé pour les 3 autres blocs du même composant `Coordonnees`
(`AdresseValeur`, `HorairesValeur`, `SuivezNousEtiquette`+`Réseaux sociaux`). Voir
`decisions.md` « Correctif B » pour le contexte complet (30/31, SC-017 à corriger).

## 5 · Résultat de l'exécution

`figma_execute` unique (script complet ci-dessus, boucles sur les tableaux) :
**createdCount: 74, errorsCount: 0**, renommage confirmé
(`before: "Tél : +32 (0)87 46 32 66  Email: info@piqueray.be"`,
`after: "ContactValeur"`). Aucune erreur, aucun fallback.

## 6 · Cycle de preuve

- **Version** : `007/tokens/L2-primitives-roles` → `versionId 2380501373999366491`.
  (Note d'honnêteté : un premier appel à `saveVersionHistoryAsync` avec le même label a
  été exécuté juste avant celui-ci après un souci d'affichage du résultat côté outil — le
  script s'est très probablement exécuté deux fois côté Figma, produisant potentiellement
  une entrée d'historique dupliquée sous le même libellé. Sans conséquence : un point de
  version supplémentaire n'altère aucun pixel ni aucune donnée ; nommé plutôt que tu.)
- **AVANT × 43** : réceveur port 9228 (nonce `36a950a3a3adbde9`) — 43/43 captées (2 appels,
  31 puis 12).
- **GESTE** : ci-dessus — 74 variables + 1 renommage, 0 erreur.
- **APRÈS × 43** : réceveur port 9229 (nonce `1ef53c677ee1077b`) — 43/43 captées (2 appels,
  29 puis 14). Tailles en octets identiques au before pour chaque cible correspondante,
  observées avant même le calcul du diff.
- **Verdict `npm run pages:compare`** : **43/43 `identical`, exit 0** — exactement l'attendu
  (aucune des 75 mutations ne touche une valeur de rendu consommée par un nœud existant).

**Note de périmètre** : au moment de re-sonder les 43 cibles en début de cycle, `DS ·
Molécules` porte désormais 14 enfants (pas 13) et `DS · Organisms` 17 (pas 16) — une
nouvelle section `Review-card` et une nouvelle section `Avis Google` sont apparues,
écriture légitime de la session concurrente `006-google-reviews-block` (zones disjointes,
règle multi-écrivains CLAUDE.md). **Exclues explicitement** des 43 cibles de ce cycle —
gardées identiques aux cycles précédents (L1/L1b/00-étalonnage) pour que la comparaison
reste valide et ne capte pas un contenu qui n'est pas le mien.
