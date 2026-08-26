# Phase 4 — correction du catalogue responsive HeroVideo

**Verdict : PASS**  
**Fichier Figma :** `d9FYAUcqdcNtsuaMgLefvJ`  
**Version auditée et appliquée :** `2391949441294093693`

Le défaut observé après `run-003` provenait du runner : le Component Set avait
été transformé en auto-layout vertical et ses trois membres en `FILL`, ce qui
les étirait tous à 1728 px. `run-004` a remis les largeurs d'aperçu mais son
verify a correctement refusé le changement implicite de valeur par défaut
`Wide → Compact`. `run-005` est la clôture canonique.

## État final Figma

| Nœud | Rôle | Largeur | Sizing dans le catalogue |
| --- | --- | ---: | --- |
| `2580:7392` | Component Set `HeroVideo` | 1728 | `FILL` dans `2448:4731` |
| `2580:7378` | `Presentation=Compact` | 390 | `FIXED` |
| `2580:7385` | `Presentation=Desktop` | 1200 | `FIXED` |
| `2151:5552` | `Presentation=Wide` historique | 1728 | `FIXED` |

Le set est `layoutMode=NONE` et `Presentation` garde `Wide` comme valeur par
défaut. Les largeurs ci-dessus sont des aperçus d'authoring ; les 19 scénarios
créent des instances transitoires en `FILL` dans leur frame 320/390/834/1200/
1440/1728 ou paysage court.

## Gates

- premier passage : zéro création, quatre roots modifiés, zéro Page/enfant write ;
- 13/13 bindings présents et 2/2 overrides typographiques allowlistés ;
- verify : zéro diff inattendu, 20/20 empreintes image et 102/102 liens préservés ;
- second passage : strict `no-op`, zéro création/modification ;
- idempotence : 17/17 artefacts, 20/20 images et 102/102 liens, zéro delta ;
- contrat, HTML, React, CSS et Odoo : non modifiés par cette correction.

## Preuves

- campagne : `specs/component-repairs/hero-video/run-005/campaign.json`
- audit : `specs/component-repairs/hero-video/run-005/audit.json`
- reçu first : `specs/component-repairs/hero-video/run-005/receipts/apply-first.json`
- comparaison : `specs/component-repairs/hero-video/run-005/verify/comparison.json`
- reçu second : `specs/component-repairs/hero-video/run-005/receipts/apply-second.json`
- idempotence : `specs/component-repairs/hero-video/run-005/idempotence-receipt.json`
- master before : `specs/component-repairs/hero-video/run-005/before/hero-video_master.png`
- master after : `specs/component-repairs/hero-video/run-005/after/hero-video_master.png`
- master idempotence : `specs/component-repairs/hero-video/run-005/idempotence/hero-video_master.png`
