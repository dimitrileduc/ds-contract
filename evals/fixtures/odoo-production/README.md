# `evals/fixtures/odoo-production/` — fixtures adversariales de la spec 019

Quatre fixtures, une par **classe de refus** que les portes de 019 doivent tenir. Elles existent
avant les claims correspondants : c'est la règle des claims du dépôt — fixture, puis eval, puis
phrase.

| Répertoire | Ce qu'il prouve | Cas d'eval qui le consomme |
|---|---|---|
| `missing-verdict/` | une prop ou une part **sans verdict** est refusée, avec son adresse canonique | `odoo-authoring-coverage-refusal` (T007) |
| `invalid-path/` | une adresse qui ne résout vers **aucune occurrence** est refusée, et une version fausse est distinguée d'un chemin faux | `odoo-authoring-coverage-refusal` (T007) |
| `generated-output/` | une sortie générée **retouchée à la main** est refusée (`tampered`), et deux générations sont identiques à l'octet | `odoo-production-generated-output` (T007) |
| `input-drift/` | un lock qui ne correspond plus au dépôt est refusé, sans se réparer tout seul | `odoo-production-version-drift` (T051, US3) |

## Ce que ces fixtures ne sont pas

Ce ne sont **pas** des configs de référence. Elles sont volontairement partielles : une config
d'authoring réelle porte un verdict pour chacune des occurrences de son graphe (36 props et 66
parts pour `ds.presentation`, 15 et 46 pour `ds.google-reviews` — occurrences, pas noms locaux).
Les vraies configs sont écrites avec l'owner par T026 et T042 sous `integrations/odoo/config/`.

Une fixture partielle suffit ici parce que la porte **nomme chaque classe de défaut séparément** :
on peut donc affirmer « le chemin invalide est refusé » sans avoir à compléter les 102 autres
verdicts.

## Piège structurel à connaître

`resetScratch()` du harnais d'evals **ne copie pas `specs/`**. Les cinq schémas JSON de 019 vivent
pourtant sous `specs/019-odoo-production-foundation/contracts/`. Les cas d'eval pointent donc
`PQR_ODOO_SCHEMA_DIR` vers le répertoire réel du dépôt avant d'exécuter une porte dans le scratch.
Sans cela, la porte échouerait sur « schéma introuvable » et ce refus se lirait comme un défaut de
la porte plutôt que comme un défaut de mise en scène.
