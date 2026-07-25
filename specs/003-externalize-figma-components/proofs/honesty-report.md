# Rapport d'honnêteté — spec 003 (SC-009)

**Date** : 2026-07-25
**Portée** : tout ce qui a été reporté, personnalisé de façon non garantie, accepté avec un
écart pixel, refusé par un instrument, ou tranché hors périmètre pendant l'exécution
complète de la spec 003 (Phase 7 Molécules + Phase 8 Sections). Rien de ce qui suit n'est
silencieux ailleurs — chaque ligne pointe vers son entrée `decisions.md` complète.

## 1. Blocs reportés (jamais externalisés à moitié)

| Bloc | Tâches | Raison | Condition de reprise |
|---|---|---|---|
| **Review-card** | T053-T054 | Source Figma = capture d'écran aplatie d'un widget tiers (Trustindex) — zéro vecteur éditable, rien à extraire fidèlement. Owner a décliné le net-new pour l'instant. | Owner valide un design net-new de Review-card, ou l'intégration change de forme côté site. |
| **Avis Google** | T089-T090 | Bloquée par Review-card (dépendance directe) — jamais externalisée à moitié. | Après reprise de Review-card. |

Aucun autre bloc de la Phase 8 (16 sections attendues, 14 construites + 2 reportées ci-dessus)
n'a été laissé partiel : chaque section construite a sa preuve pixel, son ledger, et son
adoption complète sur toutes ses pages réelles.

## 2. Personnalisations `non-portable-signalee` (ledger)

| Bloc | Champ | Raison |
|---|---|---|
| Réalisations (résidentielles) | Titre du header | Le texte source original a été remplacé par l'instance avant lecture live (régression trouvée par revue, voir §7) ; restauré depuis une **capture pixel** (image), pas une relecture `.characters`. Fidélité **visible** prouvée par diff pixel (13 860→70px) ; fidélité au caractère invisible près (espace de fin, etc.) non garantissable avec la même certitude qu'un `reportee` standard. |
| Réalisations (résidentielles) | Texte du header | Idem — même restauration, même limite. |

Aucune autre entrée `non-portable-signalee` dans la spec — tous les autres ledgers sont soit
vides explicites (contenu byte-identique au master), soit intégralement `reportee` (relevé
par lecture live directe, provenance certaine).

## 3. Écarts pixel acceptés (chiffres + raison, par bloc)

Tous mesurés par `pages:compare` (pixelmatch, seuil 0.1), tous investigués par crops réels
avant acceptation — jamais un chiffre agrégé accepté sans regarder l'image.

| Bloc | Max diffCount | % page | Raison |
|---|---|---|---|
| Field | (voir `decisions.md` T040) | — | bruit AA sous-pixel, texte neuf |
| Accordion-row | — | 0,050 % | bruit AA, référence initiale de la nuit |
| Tab | — | — | bruit AA sous-pixel |
| Carte (Category/Product/Reassurance-item) | — | — | bruit AA, single-master amendé |
| Devis / CTA | 1244 (6/7 pages, signature identique) | 0,013 % moy / 0,0216 % max | bruit de rendu sub-pixel texte+bouton neuf |
| Formulaire | 1793 | 0,0266 % | + liaison volontaire `color/noir` (précédent Input) |
| FAQ | — | — | bruit AA |
| Coordonnées | — | — | bruit AA |
| Présentation | — | — | bruit AA, CTA booléen réel (pas toujours présent) |
| SAV | 3 | 0,000032 % | le plus bas de toute la spec |
| Texte SEO | — | 0,123 % | plafond de bruit de la spec (bloc le plus dense en glyphes) — **+ anomalie réelle** (§6) |
| Hero | 2062 (À Propos) | 0,0205 % | bruit AA + **régression réelle corrigée** (§7) + **écart non résolu** (§8) |
| Réassurances | — | — | preuve **byte-exacte** (plus stricte qu'un diff pixel), pas la preuve pixel standard — trou comblé après coup par capture archivée (§4) |
| Catégories principales | 2624 (Portes de garage) | 0,034 % | AA irréductible du texte natif de tuile cloné — page ancre à 0 override, donc pas un contenu substitué |
| Produits e-commerce | 0 | 0 % | **byte-identique** sur les 2 pages |
| Réalisations | 70 (résidentielles, post-fix) | ≪0,01 % | même famille qu'industrielles (31px) — **après correction d'une régression réelle** (§7) |
| Footer + Devis | 151 (industrielles) | ≪0,01 % | bruit AA, libellé Bouton neuf, contenu byte-identique sur les 9 |

## 4. Captures refusées / dégradées

- **T0 calibration (2026-07-23)** : outils de capture MCP server-side **rejetés** —
  plafond de downscale silencieux à 1568px, incompatible avec la preuve @1x exigée. Fixé en
  retenant le transport b-fetch (exportAsync + POST direct au receveur local) comme seule
  route retenue.
- **Réassurances (T077-T078, 2026-07-25)** : un incident multi-agent (fork confirmé, voir
  memory `feedback-agent-fork-coordination`) a détruit la capture `before` propre — le
  `before` recapturé après coup a en réalité saisi l'état **déjà adopté** (dégénéré : `before
  == after` byte-identique), donc **pas une vraie preuve pixel raw→adopté**. Nommé comme tel
  dans `proofs/reassurances/README.md`, remplacé par une preuve structurelle + byte-exacte.
  **Comblé après coup** (2026-07-25, même nuit) : une capture archivée d'un bloc voisin
  (`devis-fix/after`, antérieure à l'adoption Réassurances) s'est avérée être une vraie
  baseline raw exploitable — la preuve pixel standard existe finalement, voir l'entrée
  vérification-indépendante de `decisions.md`.

## 5. Anomalies hors périmètre tranchées

| Anomalie | Décision |
|---|---|
| Tokens `space`/`radius` proposés | Déclinés par l'owner |
| Tokens `orange-12`/`orange-42` | Déclinés deux fois (dont après scan d'usage prouvant zéro usage réel) — ne pas re-proposer sans fait nouveau |
| Variable STRING `nav-state` | Déjà résolue avant spec 003 (spec 001) |
| Couleur brute du texte de saisie Formulaire | Liée à `color/noir`, précédent Input |
| Icône étoile (Avis Google) | Widget tiers aplati, même famille que Review-card |
| État erreur de Field | Owner a choisi de construire sans preuve source — nouveau token `color/rouge` miné |
| Réalisations utilise un `GRID` natif | Non contractable en l'état, noté |
| Prémisse Checkbox (Formulaire) | Invalidée — la source n'a aucune Checkbox, consentement en texte simple |
| Lien tiers dans Formulaire (`jonckers-clabots.be`) | Reproduit fidèlement, owner : corriger plus tard (pas fait dans cette spec) |
| Masters Phase 8 sur `DS · Molécules` au lieu de `DS · Sections` | Catégorisation erronée reconnue en cours de route, **explicitement reportée à un futur ménage** (owner : « on refera atomes/molécules/organisme propre après ») — hors périmètre spec 003, tracée en mémoire projet, pas dans ce journal |
| **Reflow réel sur À Propos (Texte SEO)** | Un mot change de ligne (largeur du master 1550px vs source ~1515-1547px). 4 tentatives de fix réelles épuisées (toutes bloquées par des refus durs de l'API Figma — restructuration d'instance interdite, `resize()` silencieux). **Accepté et documenté**, non corrigible sans détacher l'instance (perte de gouvernance) ou risquer les 7 autres pages avec un master élargi non testé. |

## 6. Régressions réelles trouvées et corrigées (le filet de sécurité a fonctionné)

Trois régressions réelles ont été trouvées par revue indépendante **avant tout commit**,
jamais après :

1. **Hero** — glyphe du Bouton passé de blanc à sombre sur les 8 instances (rejeu de props
   réinitialisant un override de couleur hérité). Trouvé par Fable, corrigé, re-vérifié
   (chaque page a baissé ou atteint 0), committé.
2. **Devis / CTA** (déjà committé plus tôt, `490899e`) — le même défaut de couleur, mais
   **bakée dans le master lui-même depuis sa construction** (pré-existante, pas une
   régression de cette spec). Trouvé en balayant tous les Bouton du fichier après la
   trouvaille Hero, corrigé sur le master (propagation automatique aux 8 instances),
   vérifié octet-brut (zéro déplacement), committé.
3. **Réalisations** — l'instance résidentielles affichait le texte par défaut de la variante
   (contenu d'industrielles) au lieu de son propre texte : 9 photos overridées mais les 2
   textes oubliés. Trouvé par revue indépendante (diffCount 13 860, localisé exactement
   dans la bande texte), corrigé (texte restauré depuis la capture `before`), re-vérifié
   (diffCount → 70), committé. Voir aussi §2 pour la limite de fidélité du texte restauré.

## 7. Écart non résolu, remonté explicitement — Hero, déplacement +3-5px

Sur 6 des 8 pages Hero, le bloc titre/Bouton est mesuré décalé de +3 à +5px horizontalement
par rapport à la vraie baseline pré-adoption. **Antérieur à la régression de couleur**
(mesuré aussi sur l'ancien triptyque). Pas une incohérence de frame grossière (propriétés de
nœud identiques sur les 8 pages, vérifié en direct). Le master peut tomber pixel-parfait
(2/8 pages le prouvent), donc pas une limite inhérente. Hypothèse non confirmée avec
suffisamment de confiance (arrondi de largeur du sous-titre FILL décalant le Bouton).

**Statut : resté ouvert, jamais requalifié en « bruit AA »** — voir `decisions.md`, entrée de
correction Hero, et `proofs/hero/README.md`. C'est le seul point de cette spec qui reste
sans résolution à la clôture ; remonté explicitement à l'owner, pas silencieusement laissé
dans un fichier de preuve que personne ne relira.

## 8. `nonClasses[]` du scan final (2026-07-25)

23 entrées, toutes tracées et closes — voir `inventory/scan-final-2026-07-25.json` et
`tasks.md` T101. Aucune ne représente un gap réel :
- **Wrappers correctement instanciés mais volontairement non masterisés** (décision mesurée,
  pas une omission) : `Hero et catégories` (6 pages), `Footer + Devis` (9 pages), `Hero et
  FAQ` (Dépannage/SAV, décision FAQ T083).
- **Blocs explicitement reportés** (§1) : `Avis Google` (8 pages).

11 entrées `introuvables`, toutes des atomes de granularité plus fine que le seuil de
répétition du scan (Copyright singleton, Section-header wrapper, icônes, champs de
Formulaire) — chacune relevée et résolue à l'audit de son propre bloc, jamais laissée de
côté silencieusement.

## Récapitulatif

Sur toute la spec 003 : **2 blocs reportés** (raison nommée, condition de reprise claire),
**2 personnalisations à fidélité non garantie** (nommées, ledger explicite), **17 blocs avec
écart pixel accepté** (chacun investigué, jamais un chiffre pris pour argent comptant), **1
trou de preuve pixel comblé après coup**, **11 anomalies hors périmètre tranchées** (dont 1
reportée à un futur ménage, hors journal de cette spec), **3 régressions réelles trouvées et
corrigées avant tout commit**, et **1 écart réel resté ouvert** à la clôture — nommé, pas
maquillé. Rien de ce qui précède n'a été découvert après coup en écrivant ce rapport :
chaque ligne existait déjà, datée, dans `decisions.md` avant que ce document ne soit
rédigé.
