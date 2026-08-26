# H1 — Classification du baseline frais

**Source fraîche :** Figma `d9FYAUcqdcNtsuaMgLefvJ`, version `2391670501431838845`  
**Comparaisons historiques :** `run-001`, récupération 021 et TinySpec façade  
**Portée :** master `2151:5552`, usage Home `2170:6351`, Container local et contexte Home+Header read-only

## Résumé

Le rendu XL 1728 reste structurellement conforme au baseline accepté : même master public, même lien Home, même géométrie utile, même composition, mêmes gradients, mêmes textes, mêmes métriques et mêmes propriétés CTA. Le poster façade est un delta owner explicitement approuvé.

Deux écarts antérieurs à cette feature restent séparés du responsive : les cinq descendants du master ont été recréés dans la version `2391628413984182696` sans décision retrouvée, et cette même version a laissé sur le libellé CTA de l’instance Home un override typographique local qui a remplacé son lien au Text Style gouverné tout en gardant exactement Montserrat Medium 16/22.

## Classification exhaustive

| Fait comparé | Historique | État frais | Classification | Justification |
|---|---|---|---|---|
| Master public | `2151:5552`, key `36011e…c4490` | Identique, unique | Baseline préservé | L’identité publique et la cardinalité passent. |
| Instance Home | `2170:6351` → `2151:5552` | Identique, unique usage | Baseline préservé | Le lien au main component n’a pas changé. |
| Container local | `2448:4731`, Auto Layout, master Fill | Identique | Baseline préservé | Le runner rend `green`, zéro finding. |
| Géométrie utile | 1728×720, horizontal, bas, gap 10, padding 48/89/48/89 | Identique | Baseline préservé | Les digests géométriques changent à cause des IDs/positions absolues du canvas, pas des dimensions ou règles rendues. |
| Position absolue du master dans `DS · Organisms` | `(80,1432)` dans `run-001` | `(9322,844)` | Baseline préservé | Le master reste l’unique enfant direct du même Container ; le placement de présentation sur le canvas n’est pas un fait de rendu du composant. |
| Descendants du master | `2439:4691…2439:4701` | `2563:5956…2563:5966` | Reconstruction non expliquée | Figma attribue la recréation exacte à la version `2391628413984182696` (`dl studio`, 2026-08-25 11:49 UTC). Le master public, les chemins, noms, types, valeurs et usages restent identiques ; ce point est un écart de provenance, pas un défaut visible. |
| Ordre des parts | Background, VoileBas, VoileNavigation, Text, Bouton | Identique | Baseline préservé | Aucun ajout, retrait ou réordre. |
| Poster | `dfaa8d…` | façade `8eb8b9…`, FILL | Delta approuvé | Autorisé et prouvé par `specs/tiny/hero-video-facade.md`. |
| VideoPaint Figma | 0 après récupération 021 | 0 | Baseline préservé | Le canal vidéo reste code-only ; Figma conserve le poster statique. |
| Deux scrims | Stops 80→100 % et 75→100 %, alpha final 0,5 | Identiques | Baseline préservé | Digest gradients strictement identique. |
| Titre master | Montserrat Regular 44/48, style `2170:6388` | Identique, `named-exact` | Baseline préservé | Copy, style et métriques strictement identiques. |
| Label Button master | Montserrat Medium 16/22, style `2162:5834` | Identique, `named-exact` | Baseline préservé | La dépendance `ds.button` est déclarée et conforme. |
| CTA Home métier | “En savoir plus”, Outline blanc, icône droite | Identique | Baseline préservé | Les propriétés de l’override sont conservées. |
| Text Style du label CTA Home | Style `2162:5834` avant `2391628413984182696` | `null`, métriques 16/22 identiques | Défaut préexistant | Le Button `6:135` et sa variante restent corrects, mais l’instance Home porte désormais un override local incluant `inheritTextStyleId` et les métriques de fonte. |
| Contexte Header | Non inclus dans le nœud `210:328` seul | Capturé via `Accueil` `210:326`, Header `210:473` visible | Baseline préservé | Le Header est une preuve read-only ; il n’entre pas dans le blast radius HeroVideo. |
| Mutation responsive | Aucune | Aucune | Baseline préservé | `figmaWrites=[]`, `pageWrites=[]`; aucun contrat, web ou Odoo modifié. |

## Portée du gate H1

H1 peut accepter ce 1728 comme baseline XL/wide tout en enregistrant l’écart de provenance et le défaut CTA préexistants. Cette acceptation autorise uniquement la production locale des options Mobile/Desktop. Elle n’autorise ni correction, ni mutation Figma, ni promotion contrat.

## Direction owner enregistrée le 2026-08-25

Le défaut CTA Home n’est pas corrigé pendant H1. Sa restauration est obligatoire à T020A, avant toute écriture responsive Figma, sous une autorisation Page distincte. Le correctif devra relier uniquement le libellé « En savoir plus » au Text Style `2162:5834`, sans réinitialiser le Hero ou le Button et sans modifier le master, la variante, les propriétés CTA, les icônes, le média, les voiles ou le Header.

T020A devra ensuite refaire l’audit et comparer le master, l’instance Hero Home et le contexte Home+Header avant/après. Le rendu doit rester pixel-identique, tous les faits et overrides doivent rester inchangés hors ce lien de style, et un second passage doit être réellement sans effet. La recréation historique des identifiants reste enregistrée comme écart de provenance ; aucune restauration d’identifiants n’est autorisée.
