# T055 — Final constitution gates

Exécution UTC : `2026-08-26T09:27:56Z` → `2026-08-26T09:33:30Z`  
Périmètre : feature `028-figma-responsive-hero-video`, clôture sans promotion contrat/code/Odoo et sans commit.

## Résultat

Verdict : **PASS avec dette globale connue et explicitement nommée**. Les six gates indépendants de la parité globale sont verts. `parity` et `eval` restent rouges uniquement sur le passif transverse accepté à H4 ; aucune évaluation spécifique à 028 n’échoue.

| Commande | Code | Résultat probant |
|---|---:|---|
| `npm run build` | 0 | 234 propriétés token, 40 composants générés, 8 sorties Odoo et rapport de dérivation produits sans erreur. Les sorties générées restent byte-stables dans le statut Git. |
| `npm run parity` | 1 | 6 écarts `figma behind` non baselinés sur `GoogleReviewsSection` et 9 écarts reconnus. Aucun constat `HeroVideo`. |
| `npm run eval` | 1 | 229/234 passent. Les cinq échecs sont exactement `baseline-parity-clean`, `baseline-acknowledges-without-failing`, `promotion-converges`, `golden-generated-output` et `preservation-013-clobber-detected`. Tous les tests responsive HeroVideo et component-repair passent. |
| `npm run plugin:check` | 0 après remise à jour du reçu | Le premier passage a correctement refusé un `engine.receipt.json` obsolète après modification du runner. `node scripts/build-plugin-zip.mjs --update-engine-receipt` a réenregistré le hash `70b1c10cbca5…`, 668158 octets et 110 inputs ; le second passage valide tous les flows, avec 3 skips documentés par le runner. |
| `npx tsx scripts/deterministic-roundtrip.mjs` | 0 | `contract → canvas → contract → code` déterministe, arbres canvas byte-identiques sur deux exécutions et 5 instances imbriquées exercées. |
| `node scripts/core-browser-check.mjs` | 0 | Barrel core bundlé pour navigateur ; les 4 emitters s’exécutent en VM sans globals Node. |
| `npx tsc --noEmit` | 0 | Aucun diagnostic TypeScript. |
| `npx tsc -p tsconfig.build.json` | 0 | Compilation de build sans diagnostic. |

## Dette admise, pas une revendication verte

La suite globale n’est pas présentée comme entièrement verte. Les écarts `GoogleReviewsSection`, les fixtures de baseline/convergence et le manifeste golden appartiennent au passif transverse déjà accepté dans `decisions/H4-closure.json`. Les corriger ici étendrait le périmètre au-delà de HeroVideo et violerait la décision owner.

La régénération du reçu du moteur plugin est une conséquence mécanique du changement générique de `component:repair --finalize`; elle ne modifie ni le produit Figma, ni un contrat, ni HTML, ni Odoo. Aucun commit n’a été créé.
