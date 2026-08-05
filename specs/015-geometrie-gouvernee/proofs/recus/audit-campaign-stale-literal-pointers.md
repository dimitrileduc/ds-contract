# Reçu — défaut découvert : `audit-campaign.json` pointe des littéraux déplacés par Phase 4

**Date** : 2026-08-04 · **Découvert pendant** : investigation T060 (coordonnees, Phase 6) · **Statut** : nommé, non réparé ici (hors périmètre de Phase 6).

## Le fait

`specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json` déclare, pour chaque fait structurel audité, un `contractReference.jsonPointer` STATIQUE — ex. `coordonnees.structure.gap-wrapper` pointe `/anatomy/root/parts/wrapper/literals/gap`. Phase 4 (015) a converti ce même site en `tokens/gap` (littéral→token, T041). Le pointeur du fait n'a pas suivi : `resolveContractPointer` (`extract/figma/organism-audit/facts.ts`) le résout `ok: false`, et `compareFigmaExpectation` classe le fait `contract-does-not-carry-figma-fact` — un FAUX NÉGATIF, puisque le canal existe bel et bien, sous `tokens` plutôt que `literals`.

**Constaté sur `ds.coordonnees`** : 9 des 10 faits `divergent` de son verdict organism-audit (`gap-wrapper`, `padding-block-wrapper`, `padding-inline-wrapper`, `width-wrapper`, `gap-adresse`, `gap-horaires`, `gap-contact`, `gap-suivez-nous`, `gap-reseaux-sociaux`) portent exactement cette cause — le 10ᵉ (`colonnes-ordre`, `row` vs `row-reverse`) est un fait DISTINCT, non affecté (voir plus bas).

**Constaté aussi sur `ds.texte-seo`** : 2 des 7 faits `divergent` (`gap-root`, `padding-inline-root`) portent la MÊME cause de pointeur périmé, avec une variante : la valeur résolue du token est comparée à un NOMBRE brut sans unité (`32` au lieu de `"32px"`) — un défaut de FORMAT dans `figmaExpectation.value`, pas seulement de pointeur. `width-root` (« does-not-carry, 1728 attendu ») est un fait DIFFÉRENT : `ds.texte-seo` n'a jamais porté de largeur sur son root. Les 4 faits restants (`section-header-titre`, ses `font-size`/`line-height`, `items-default`) sont des défauts d'attente PRÉ-EXISTANTS sans rapport avec Phase 4 (rich-text vs chaîne plate, faits cherchés au mauvais niveau de composition) — non investigués plus avant ici.

**Le niveau PIXEL (`rawPct`) n'est PAS affecté** : le verdict du CAS `texte-seo-master-defaults` est `pass` (1,837611 %, sous le seuil de 2,5 %, inchangé depuis `avant.json`) — c'est le verdict AGRÉGÉ de l'ORGANISME (facts + pixels combinés) qui affiche `divergent`, uniquement à cause des faits ci-dessus. `build-registre.mts` ne suit que le delta `rawPct` pour ses refus d'attribution (vérifié : aucun refus déclenché par ces faits) — l'objectif chiffré de Phase 6 pour texte-seo (1,84 %) et coordonnees (0,52 %) porte sur ce même `rawPct`, déjà sous seuil et inchangé pour les deux.

**Ampleur — MESURÉE le 2026-08-05 (revue de Phase 7)** : `audit-campaign.json` compte 69 faits référençant un pointeur `.../literals/...`. En croisant chacun avec le manifeste de conversion de Phase 4 (`proofs/conversions.json`, 196 entrées, appariement exact `contractId` + `pointer`) : **30 sont réellement périmés, 39 restent valides** (ceux dont le canal — border-radius, couleur, typographie — est hors du périmètre géométrique et n'a donc pas été converti).

Répartition des 30 par organisme : `ds.coordonnees` 9 · `ds.hero` 9 · `ds.faq` 4 · `ds.footer` 3 · `ds.reassurances` 3 · `ds.presentation` 2. Les 9 de `coordonnees` sont exactement ceux constatés ci-dessus, ce qui confirme la méthode ; les 21 autres n'avaient jamais été relevés. Le chiffre est reproductible : il se recalcule d'un croisement des deux fichiers commités, sans instrument.

## Pourquoi ce n'est pas réparé dans ce passage

1. **Hors périmètre nommé de Phase 6.** L'objectif de Phase 6 cite quatre lignes par leur pourcentage PIXEL (`rawPct`) : « Avec CTA (8,78 %), texte-seo 1,84 %, footer 1,04 %, coordonnees 0,52 % ». Le défaut ici est un défaut de FAIT STRUCTUREL (une couche de vérification séparée, plus stricte, à côté du pixel), pas un défaut de rendu — le `rawPct` de coordonnees (0,52 %) reste inchangé et sous le seuil de 2,5 % indépendamment de ce défaut.
2. **Ampleur potentiellement large.** 69 pointeurs à re-vérifier un par un contre le manifeste de conversion de Phase 4 (196 entrées), sur 9 organismes — un travail mécanique mais substantiel, distinct de la réparation ciblée que Phase 6 demande.
3. **Deux réparations possibles, aucune engagée ici** : (a) mettre à jour chaque `contractReference.jsonPointer` périmé pour pointer `tokens/<canal>` au lieu de `literals/<canal>` (fidèle à ce que le contrat porte réellement aujourd'hui) ; (b) réserver ce travail à une passe dédiée (016, ou un futur nettoyage de `audit-campaign.json`), puisque ce fichier appartient à 013 et que 015 n'a pas mandat de le réécrire en profondeur sans revue.

## Ce qui N'est PAS affecté

- Les conversions elles-mêmes (Phase 4, T037-T043) restent correctes — c'est le FAIT AUDITÉ qui ne suit plus son propre pointeur, pas la conversion.
- `npm run parity` (l'axe contract↔code, contract↔figma-tokens) reste vert : ce défaut vit dans un TROISIÈME outil (`organism-audit`), pas dans la chaîne de contrôle principale.
- `coordonnees.structure.colonnes-ordre` (row vs row-reverse) est un fait DIFFÉRENT, non causé par ce défaut — reste à investiguer séparément si pertinent pour T060.
