# Reçu — pointeurs-013-retestes (T038b, US1, « une décision du dépôt n'est pas un fait »)

**Date** : 2026-08-04 · Re-test des 5 pointeurs cités par `specs/013-auditer-fidelite-organismes/proofs/deferred/work.json`, EN DIRECT contre les contrats actuels — pas recopié depuis research.md D14 (qui avait fait le même constat en phase de plan ; ce reçu re-vérifie plutôt que de faire confiance).

## Résultat

| DW | Pointeur | Résout ? | Constat |
|---|---|---|---|
| DW-001 | `ds.piqueray-logo /anatomy/root/literals/width` | ✅ oui | `literals: {"width":"180px","height":"34px"}` — présent tel quel |
| DW-002 | `ds.carte /anatomy/root/literals/min-width` | ❌ non | `carte.root.literals = {"width":"364px","gap":"24px","padding-bottom":"24px"}` — aucun `min-width`. Recherche exhaustive (anatomie complète, `literals` ET `literalsByProp`) : `min-width` n'existe NULLE PART dans `ds.carte`. Les seules occurrences de `height` sont sur `reassuranceImage` (364px) et `categorieImage` (418px) — des faits d'image sans rapport avec DW-002. |
| DW-003 | `ds.section-header /anatomy/root/literals/height` | ❌ non | `section-header.root.literals = {"gap":"8px"}` — aucun `height`. Recherche exhaustive : `height` n'existe nulle part dans `ds.section-header`, ni en `literals` ni en `literalsByProp`. Cohérent avec la note de `causes.json` : le fait DW-003 vit dans l'INSTANCE SectionHeader `2104:2907` figée par le master **faq**, pas dans le contrat `ds.section-header` lui-même — un défaut de source pur. |
| DW-004 | `ds.footer /anatomy/root/literals` (objet) | ✅ oui | Les 6 propriétés nommées (width, padding-top/right/bottom/left, gap) + les 3 gaps imbriqués (col1, col5, col5/rseauxSociaux) + les 4 valeurs équivalentes de faq/reassurances — toutes vérifiées présentes, voir `fixtures/corrections-013.json` (18 entrées) et le contrôle `preservation.ts` (18/18 `preserved`). |
| DW-005 | `ds.footer /anatomy/root/literals/width` | ✅ oui | `1550px` présent ; la largeur imbriquée `root/parts/Row/literals/width` (`1385px`) l'est aussi. |

## Conséquence pour T042/T043 (frontière 016)

DW-002 et DW-003 restent chacun **des faits sans littéral porteur** — la clause « frontière 016 » de T042 (carte) et T043 (section-header) n'est PAS retirée : il n'y a rien à rendre visible sur ces deux contrats pour ces deux faits spécifiquement, le fait reste classé `figma-source` et part entier au chantier canvas (016). Rien d'autre ne change : les AUTRES littéraux de `ds.carte` et `ds.section-header` (width, gap, padding-bottom pour carte ; gap pour section-header ; plus toute géométrie ailleurs dans leur anatomie) sont des candidats de conversion normaux, sans lien avec DW-002/DW-003.
