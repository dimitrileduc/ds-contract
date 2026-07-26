# Rapport de clôture — Spec 006 (le bloc « Avis Google »)

**Statut : CLOS — 2026-07-26.** `ds.review-card` + `ds.google-reviews` livrés net-new,
Piqueray's premier composite (`repeat` + `component`), adoptés sur les 8 occurrences de
l'aplat Trustindex recensées, démontrés gouvernés en direct (US4), geste canevas final
(renommage français) effectué avec procédure de retour écrite. Gates repo : 8 verts + 2
rouges hérités et nommés (voir § Gates).

## Critères de succès (spec.md)

| # | Critère | État |
|---|---|---|
| SC-001 | 0 occurrence de l'aplat widget restante, 8/8 occurrences remplacées | ✅ 8/8 adoptées ; seul fill image restant = l'avatar photo de contenu (FR-004), pas un aplat |
| SC-002 | N/N (8/8) preuves avant/après publiées, zéro échantillonnage | ✅ `proofs/rapport-avant-apres.md`, 8 entrées, audité T078 |
| SC-003 | Zéro dégât collatéral (maquettes porteuses + témoin `Motorisation`) | ✅ `outsideDiffCount=0` sur 7/8 (1 exception acquittée owner, T050), `Motorisation` identical sur les 8 |
| SC-004 | Écart ≤ 9,76 % sur chaque occurrence | ✅ 7,708-7,791 % sur les 8, sous le seuil, revu à l'œil (crops) |
| SC-005 | Carte d'avis différente produite sans dessin, deux surfaces | ✅ démontré US4 (T071), propriétés seules |
| SC-006 | Zéro étape manuelle, régénération à blanc identique | ✅ `npm run build` déterministe, zéro diff de fichiers générés (T076a) |
| SC-007 | Toutes vérifications vertes, compteurs à jour, zéro claim sans preuve | ⚠️ voir § Gates — 2 rouges **hérités**, nommés, non introduits par 006 |
| SC-008 | Compteur « blocs reportés » 2→0, zéro zone hors gouvernance | ✅ `COMPONENT-INVENTORY.md` mis à jour (T083), `honesty-report.md` (003) laissé intact (journal daté) |

## Gates (rejoués T086, après tous les gestes de Phase 7)

| Gate | Résultat |
|---|---|
| `npm run build` | ✅ vert |
| `npm run parity` | ⚠️ 24 constats actifs, exit 1 — **hérité T047a**, zéro sur `ds.review-card`/`ds.google-reviews` |
| `npm run eval` | ⚠️ 107/113 — 6 rouges hérités (conséquence directe des 24 constats parity), 48 quarantinés |
| `npm run plugin:check` | ✅ vert |
| `deterministic-roundtrip.mjs` | ✅ vert |
| `core-browser-check.mjs` | ✅ vert |
| `tsc --noEmit` + `tsc -p tsconfig.build.json` | ✅ vert |
| `pages:selftest` | ✅ 7/7 |
| `aplat:selftest` | ✅ 2/2 — **structurellement creux côté aplat** (T023, R11 : compare rendu code ↔ crop de `aplat-source.png` hors ligne, jamais contre le canevas réel) ; le relevé manuel de transcription (T012, spéc R10) est ce qui atteste réellement la fidélité du contenu |
| `pages:ledger:check` | ✅ vert |

SC-007 n'est donc pas atteint au sens strict (« toutes vertes ») — les deux rouges
préexistent à cette spec (constatés dès T047a, avant tout geste 006), reconfirmés sans lien
avec `ds.review-card`/`ds.google-reviews` à quatre reprises indépendantes (T047a, T069,
T082, T086). Nommé plutôt que masqué : SC-007 est **atteint pour tout ce que 006 a touché**,
pas pour l'héritage d'avant.

## Limites (T074, détail complet dans `decisions.md`)

1. **Trou A5 — fill image porté par le contrat, non refermé.** L'avatar photo compile en
   `imgPlaceholder:true` + lavis `#D9D9D9` sur canevas — override hors contrat.
2. **Étoile orange intrinsèque** (`#F98A0B`) — `ds.review-card` n'a aucune prop note.
3. **Troncature multi-lignes refusée** — mesure T012/T057.
4. **Transcription non garantie au caractère près (FR-010)** — retranscrite depuis l'aplat.
5. **Angle mort du témoin `Motorisation`** — n'instancie ni `Étoile` ni `check`.
6. **FR-007 — le Bouton gouverné n'est pas réutilisé** — résolution par nom
   (`findComponentByName`), flèches/CTA dessinés en parts.

## Backlog envoyé (T075)

- **B5** — résolution `contractId`-puis-nom pour `findComponentByName`
  (`core/emit-figma-script.ts`), reçu T034/R5.
- **B6** — `figma:plan` auto-nettoyant pour les orphelins de `figma-sync/`, reçu T037/R13.

Les deux dans `specs/003-externalize-figma-components/BACKLOG-SPEC-B-design-to-code.md`.

## Dernier geste canevas (T076-T076a)

Checkpoint `006/cloture/renommage` (`versionId 2380602413129417606`) → `ReviewCard`→
`Review-card`, `GoogleReviews`→`Avis Google` → sha256 avant=après sur les 9 maquettes,
`pages:compare` 9/9 identical. Procédure de retour écrite en double (`decisions.md` T076 +
`quickstart.md` §Rollback renommage). Le rafraîchissement du snapshot de parité qui a suivi a
révélé et corrigé un trou de join-par-nom côté lecture (`parity/diff.ts`, T076a) — zéro
`core/` touché, zéro churn de golden.

## Traçabilité

9 gestes canevas, 8 `versionId` capturés, 1 trou nommé deux fois (checkpoint
`006/adoption/depannage-sav`, jamais capturé au geste, non récupérable après coup). Détail
complet, chronologique, tâche par tâche : `decisions.md` (86 tâches). Rapport avant/après :
`proofs/rapport-avant-apres.md`. Journal daté : `MILESTONES.md` (entrée 2026-07-26).
