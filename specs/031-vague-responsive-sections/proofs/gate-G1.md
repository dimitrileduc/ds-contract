# G1 — Fin de préparation — 2026-08-27

Gabarit : `contracts/gates-de-vague.md`. Rappel des deux règles dures : « non
couverte » est une réponse valide, « non mentionnée » ne l'est pas ; une exigence
marquée « couverte » **sans chemin de preuve** rend le gate **non franchi**.

## Exigences re-citées depuis spec.md

| Exigence | Texte (première ligne) | Couverte ici | Preuve |
|---|---|---|---|
| **FR-003** | « La version mobile de chaque section MUST être dérivée de la structure observée de cette section et de son usage relevé sur les Pages. Aucune règle mobile unique n'est appliquée uniformément aux douze. » | **oui, pour 11** | Chaque `releve-bridge.json` porte `derivationMobile: {empile, raison}` — une raison **par section**, tirée de sa racine observée et de ses enfants. **3 sections s'empilent** (`presentation`, `formulaire`, `coordonnees` : racine HORIZONTALE à 2 colonnes réelles), **8 ne s'empilent pas**, et chacune dit pourquoi : racine déjà verticale (`devis`, `faq`, `texte-seo`, `produits-ecommerce`, `google-reviews-section`), un seul enfant (`sav`), une grille (`equipe`), des plans superposés (`hero`). Il n'y a **aucune règle uniforme** : la même racine HORIZONTALE donne un empilement pour `presentation` et un refus d'empilement pour `hero`, parce que la structure diffère. |
| **FR-004** | « Les défauts de la fiche de décisions D1–D9 MUST s'appliquer à chaque section ; toute dérogation MUST porter une ligne motivée sur la surface de décision owner. » | **partielle** | D1 (axe `Presentation` visible), D2 (`Mobile`), D9 (largeurs témoins `320/390/834/1200/1440/1728`) sont appliqués aux 11 manifestes — `responsiveWidths` et `expectedMemberNames` de chaque `campaign.json`. **Non couvert ici** : D3/D4 (typographie mobile) — aucun `typographyOverrides` n'est déclaré à ce stade, et c'est délibéré : les 82 constats `text-style` de l'audit sont des **défauts de source préexistants** (typographie brute sans lien Text Style), pas des overrides de vague ; les trancher appartient à la séance G2. Une dérogation est déjà nommée : `equipe`, dont le nombre de colonnes en mobile n'est pas un champ de layout gouverné par le runner (`releve-bridge.json`, `derivationMobile.raison`). |
| **FR-005** | « Chacune des treize campagnes MUST recevoir une surface de décision owner au gabarit fixe… » | **non couverte** | Les planches sont les tâches T034–T042, phase 4. Aucune n'est produite à ce stade — **et c'est leur place**, pas un manque. |
| **FR-006** | « Toute conséquence **invisible dans un rendu** — topologie du set, sélecteur de variantes, axes, Text Styles — MUST figurer sur la surface de décision… » | **non couverte** | Même raison : appartient aux fiches de décision (T037–T039) et au générateur de planche (T040), phase 4. |
| **FR-007** | « L'état de chaque cible MUST être capturé **avant** toute mutation, pour **toutes** les cibles concernées et non pour un sous-ensemble pilote, chaque capture vérifiée non vide et correctement dimensionnée. » | **oui** | `proofs/captures-avant-13.md` : **85 surfaces sur 85** portent leur état-avant (structure + faits + propriétés) ; **17 PNG, 0 vide, 0 mal dimensionné**, les 7 du pilote vérifiés un par un contre les dimensions relevées au canevas. Les 2 cibles bloquées n'ont pas de PNG **et la raison est écrite** : la chaîne refuse avant l'étape de capture, aucune mutation n'est possible, et la version `031-avant-vague` fige le fichier entier. Clause posée : si un geste manuel est retenu, la capture-avant redevient obligatoire avant le geste. |
| **FR-008** | « Les verrous dimensionnels hérités MUST être relevés et nommés avant toute tentative d'application ; un verrou non couvert par une dérogation référencée MUST refuser l'application. » | **oui** | `preflight-locks.json` écrit pour les 11 campagnes préparées : **`locks 0 / waived 0 / blocking 0` partout**. Aucun `lockWaivers[]` n'est donc à motiver. Portée honnête : `E-031-003` est **active** — la porte s'arrête au premier ancêtre non-COMPONENT et les 13 parents relevés sont des FRAME/SECTION, donc un plancher posé sur un parent ne serait pas rapporté. Le zéro se lit dans cette portée, pas comme « aucun verrou nulle part ». |
| **FR-014** | « Chacune des treize campagnes […] MUST produire exactement un manifeste généré, un audit frais, **une** décision de validation owner et **une ligne** au registre… » | **partielle, et l'écart est nommé** | **Manifeste** : 13 sur 13 existent et sont **validés par `validateRepairCampaign`** — mais **écrits à la main**, pas *générés* : `npm run component:repair:manifest` refuse sur les 13 (`releve-unreadable` sur les 12 composants seuls, `presentation-not-selected` sur `reassurances`). Écart mesuré et consigné : `E-031-008`, preuve `proofs/blocage-generateur-manifeste.md`. Rien n'est contourné — la validation de campagne existante s'applique inchangée. **Audit frais** : 11 sur 13 (`audit.json` par run) ; `reassurances` en a un aussi (audit vert avant le refus de preflight) ⇒ **12 sur 13**, `hero-video` n'en a pas, aucune mutation n'étant proposée. **Décision owner** et **ligne de registre de campagne** : phases 4 et 5. |

## Campagnes concernées et ce qu'elles couvrent

| Campagne | Run | Exigences couvertes à G1 | Non couvertes (et pourquoi) |
|---|---|---|---|
| `presentation` (pilote) | run-002 | FR-003, FR-004 (D1/D2/D9), FR-007 **full**, FR-008 | FR-005, FR-006 → phase 4 · FR-014 partiel (manifeste écrit main, `E-031-008`) |
| `devis`, `formulaire`, `coordonnees`, `faq`, `sav`, `texte-seo`, `hero`, `equipe`, `produits-ecommerce`, `google-reviews-section` | voir table | FR-003, FR-004 (D1/D2/D9), FR-007 **light**, FR-008 | idem |
| `reassurances` | run-001 | **aucune** — la chaîne refuse au preflight | **FR-009 est impossible tel que spécifié** : la capacité « créations déclarées dans un set existant » n'ajoute pas d'axe. Preuve : `specs/component-repairs/reassurances/run-001/blocage-ajout-axe.md`, registre `E-031-011` |
| `hero-video` | run-006 | **aucune** — aucune mutation proposée | Renommage sans chemin runner. Preuve : `specs/component-repairs/hero-video/run-006/blocage-renommage.md`, registre `E-031-002` |

## Ce que la mesure a démenti à G1, écrit plutôt que contourné

1. **Le générateur de manifeste ne sert aucune des 13 campagnes** (`E-031-008`).
   Il inverse un set déjà complet ; la vague crée 28 membres et, pour 12 cibles
   sur 13, le set lui-même. Conséquence de plan : le budget de ~25 min/campagne
   est caduc. Conséquence de spec : FR-014 dit « manifeste **généré** » et les 13
   sont **écrits**.
2. **L'Edge Case l. 61 de la spec 030 est faux** (`E-031-009`) : « un manifeste
   réduit » n'est pas produit, le générateur refuse — et le refus, lui, est
   épinglé par un eval. Une capacité écrite sans fixture derrière (§II).
3. **Le pilote imposé par FR-009 est impossible** (`E-031-011`). Mesuré deux fois :
   sur mock (`Responsive member cardinality drift`) puis par **le runner lui-même
   sur le canevas vif** (`preflight: existing responsive component-set topology
   drift`). Cause unique, commune avec `hero-video` : **rien ne renomme un membre
   existant**. Le chemin alternatif de la matrice de capacités (rename+merge à
   l'amend) est fermé par **gouvernance** (D1/FR-013), pas par capacité.
4. **`google-reviews-section` n'est utilisée nulle part** (`E-031-012`), alors que
   les avis Google sont bien sur **8 maquettes** — via la **molécule** `Avis
   Google` (`2178:7381`) enveloppée dans un GROUP. Poser l'axe sur cette section
   ne changera **rien** sur les Pages. Entrée de séance owner. Un premier énoncé
   de cette vague avait conclu « 0 usage » : exact pour le master, trompeur sur
   la réalité — la correction est au registre, pas effacée.
5. **82 typographies brutes sans lien Text Style** et **3 masters hors convention
   de conteneur** (`formulaire`, `coordonnees`, `produits-ecommerce`, posés
   directement dans une SECTION). Défauts de **source**, tous préexistants,
   **aucun** créé par la vague, `figmaWrites=0` sur les 11 audits. Sur
   `formulaire` l'audit précise même que la typo correspond *exactement* à
   « Titre 3 » et « Lead » : seul le lien manque.
6. **`expectedVariantNames` décrit l'état de SOURCE, pas la cible.** Le preflight
   compare ce champ au canevas observé ; le premier jet le remplissait avec la
   topologie visée, et le runner a refusé `variant snapshot drift`. Corrigé sur
   les 11 (`[]`, comme le précédent additif `hero-video/run-003`) ; la topologie
   cible reste portée par `expectedMemberNames`.

## Refus de franchissement — les clauses du contrat, vérifiées

- « Une seule capture manquante ou mal dimensionnée bloque **toute** la vague » :
  **0 capture défectueuse** sur 17 PNG, **85/85** surfaces couvertes en faits et
  structure. Clause non déclenchée.
- « Une planche mise à l'échelle sans mention n'est pas présentable (§XII) » :
  aucune planche n'existe encore — clause sans objet à G1, elle s'applique à
  T041b en phase 4.

## Verdict du gate

**FRANCHI POUR 11 CAMPAGNES SUR 13**, et les 2 restantes sortent avec leur preuve
de blocage plutôt qu'avec un contournement.

- 11 manifestes validés, 11 audits, 11 preflights sans verrou bloquant,
  85 surfaces capturées, **11 dry-runs verts**, **zéro mutation de canevas**.
- `reassurances` et `hero-video` : **bloquées par la même capacité absente** —
  « renommer les membres existants d'un set ». Elles ne sont pas bricolées, pas
  forcées, pas silencieuses : elles portent chacune sa preuve exécutée, sa ligne
  de registre, et deux issues posées à l'owner (geste manuel gouverné ou report
  FR-018). FR-015 interdit d'ouvrir la capacité pendant la vague ; elle appartient
  à une spec ultérieure, avec sa fixture rouge — laquelle **existe déjà**, sous la
  forme des deux manifestes validés et de leurs refus cités.
- **Correction de spec à acter, pas correction de plan** : FR-009 désigne
  `reassurances` comme pilote obligatoire au motif qu'elle exerce « créations
  déclarées dans un set existant ». Cette capacité, mesurée, ne fait pas ce que la
  vague lui demande. Le pilote a été **basculé sur `presentation`** (décision owner
  du 2026-08-27, en conversation), et c'est cette bascule qui a permis à G1
  d'aboutir.
