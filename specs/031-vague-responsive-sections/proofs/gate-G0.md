# G0 — Kick-off — 2026-08-27

Gabarit : `contracts/gates-de-vague.md` §« Le devoir de re-citation ».
Deux règles dures rappelées : « non couverte » est une réponse valide, « non
mentionnée » ne l'est pas ; une exigence marquée « couverte » **sans chemin de
preuve** rend le gate **non franchi**.

## Exigences re-citées depuis spec.md

| Exigence | Texte (première ligne) | Couverte ici | Preuve |
|---|---|---|---|
| **FR-002** | « Le périmètre MUST être exactement : `faq`, `sav`, `reassurances`, `equipe`, … » | **oui** | Les 13 cibles ont été résolues **par id sur le canevas vif**, pas par nom : les 12 sections + `HeroVideo` répondent toutes à `getNodeByIdAsync`, aucune ne manque, aucune n'est en trop. `inventory/partition-zones.json` (13 zones nommées) · `inventory/prerequis-g0.md` §4. `header` et `footer` n'apparaissent dans aucune zone — vérifiable par lecture du fichier. |
| **FR-007** (volet **préparation**) | « L'état de chaque cible MUST être capturé **avant** toute mutation, pour **toutes** les cibles concernées et non pour un sous-ensemble pilote… » | **partielle — et c'est le partage prévu** | Le volet **G0** est couvert : la version Figma `031-avant-vague` (id `2392267626424800780`) épingle l'état-avant **complet du fichier**, avant toute mutation (§X : plus fort que des PNG échantillonnés) — `inventory/prerequis-g0.md` §3. Le volet **par cible** (13 `captures/before/` vérifiées non vides et bien dimensionnées) n'est **pas** couvert ici : il appartient à G1, tâches T017/T020/T021–T031 puis contrôle T032. Aucune mutation n'a eu lieu à ce jour, donc l'ordre imposé par §X n'est pas entamé. |
| **FR-010** | « Les écritures parallèles MUST porter sur des zones disjointes, avec **un seul** cycle de vérification global possédé par l'orchestrateur… » | **partielle — préparation faite, exécution à G4** | Le préalable mesurable de FR-010 est fait : la partition §XI est **calculée sur les parents relevés** et les 13 parents sont **deux à deux distincts**, donc des zones disjointes existent et sont écrites — `inventory/partition-zones.json` (`verdictR5: "parents-distincts"`) · `inventory/prerequis-g0.md` §4. L'attribution des **ports** (T046) et le cycle de vérification unique (T062) sont des sorties de G4, non couvertes ici. Écart mesuré et annoncé : **1 writer sain**, repli séquentiel annoncé avec son coût (+1 h 45) — `E-031-007`, `inventory/prerequis-g0.md` §6. |
| **SC-004** | « Toutes les identités historiques sont préservées : aucun composant ne change d'identité, aucun usage sur les Pages ne se détache, et rien n'est écrit directement sur une Page. » | **oui, à G0 — et c'est un état de départ, pas une garantie de fin** | L'état-avant des identités est **mesuré et pinné** : les 64 `componentKey` du canevas vif sont **identiques une à une** à celles de `parity/snapshots/figma-components.json` (`identical: true`, 0 en trop, 0 manquant, 0 modifié) — `inventory/prerequis-g0.md` §5. C'est la référence contre laquelle T064 prouvera SC-004 à la clôture. À G0, **aucune mutation n'a été posée** : la seule écriture est une entrée d'historique de versions, qui ne touche aucun nœud. La preuve **de fin** de SC-004 appartient à G4/T064 et n'est pas revendiquée ici. |

## Campagnes concernées et ce qu'elles couvrent

G0 est un gate **de vague** : aucune campagne n'y est traitée individuellement
(R8 — une campagne n'a pas de gate, elle a un verdict et une décision). Les 13
sont concernées **collectivement** par les prérequis ci-dessus.

| Campagne | Exigences couvertes à G0 | Non couvertes (et pourquoi) |
|---|---|---|
| les 13 (`reassurances`, `presentation`, `devis`, `formulaire`, `coordonnees`, `faq`, `sav`, `texte-seo`, `hero`, `equipe`, `produits-ecommerce`, `google-reviews-section`, `hero-video`) | FR-002 (périmètre résolu par id) ; FR-007 volet état-avant global ; FR-010 volet partition ; SC-004 état de départ mesuré | FR-003, FR-004, FR-005, FR-006, FR-008, FR-014 — **non couvertes, et c'est leur place** : elles relèvent de G1 (préparation) et G2 (séance). FR-009, FR-013, FR-015, SC-005 relèvent de G3. FR-001, FR-018, SC-001 relèvent de G4. FR-011, FR-012, FR-016, FR-017, FR-019, SC-002, SC-003, SC-008 relèvent de G5. |

## Sorties obligatoires du contrat, une à une

| Sortie exigée par `contracts/gates-de-vague.md` §G0 | État | Chemin |
|---|---|---|
| Sweep de qualité complet, vert (seul rouge toléré : dette golden 028 **strictement inchangée**) | ✅ 7/8 `EXIT 0` ; `eval` **242/243**, rouge unique `golden-generated-output` prouvé **mot pour mot** identique à la trace de 030 | `proofs/sweep-G0.md` |
| Version Figma épinglée nommée `031-avant-vague` | ✅ id `2392267626424800780` | `inventory/prerequis-g0.md` §3 |
| `inventory/partition-zones.json` — parent relevé des 13, partition §XI | ✅ 13 zones, `verdictR5: "parents-distincts"`, zone de planches déclarée | `inventory/partition-zones.json` |
| `inventory/prerequis-g0.md` — cliché comparé, ports, writers sains | ✅ cliché **frais** (64/64 identiques) ; port 9230 en plage, probe 9 ms ; **1** writer sain | `inventory/prerequis-g0.md` §5 et §6 |
| Première ligne de registre si un écart est constaté, dont le défaut de source `TEST/Reassurances` | ✅ **7 lignes**, toutes famille `vague`, phase `G0` | `inventory/registre-ecarts.json` |
| Fiche D1–D9 signée (entrée du gate) | ✅ signée le 2026-08-27 | `inventory/prerequis-g0.md` §1 |

## Ce que la mesure a démenti, écrit plutôt que corrigé en silence

1. **R5 est tranché dans son meilleur cas, pas dans le pire.** La recherche
   annonçait les ids `2096:…` → `2116:…` « compatibles avec un catalogue commun —
   compatibles, pas concluants ». Mesure : **13 parents distincts**. Aucune
   sérialisation de `bridge-first`/`bridge-second` n'est requise. La partition par
   master est légale.
2. **Le critère littéral de T005 n'est pas tenu** (`portFallbackUsed: true` au lieu
   de `false`) alors que le prérequis opératoire l'est (port **dans** la plage
   9223-9232, plugin connecté, probe 9 ms sur le bon fichier). Écrit au registre
   (`E-031-005`) au lieu d'être coché.
3. **Trois writers sont budgétés, un seul est mesuré.** Repli séquentiel annoncé
   avec son coût (+1 h 45), à G0, avant la première campagne (`E-031-007`).
4. **Deux faits de source relevés en passant** : `Section Avis Google` est le seul
   master de section sur `DS · Molécules` (`E-031-004`) ; le parent de `Hero`
   s'appelle `Container · Demo 1728` (`E-031-006`). Ni l'un ni l'autre n'est
   corrigé par 031 — les nommer maintenant coûte moins que les découvrir dans un
   reçu.
5. **`E-031-003` est active, pas théorique** : le preflight des verrous s'arrête au
   premier ancêtre non-COMPONENT, et les 13 parents relevés sont des `FRAME` ou des
   `SECTION` — donc non-COMPONENT. Un verrou posé sur l'un d'eux ne sera pas
   rapporté sur **aucune** des 13 campagnes.

## Refus de franchissement — les deux clauses du contrat, vérifiées

- « Fiche D1–D9 non signée ⇒ STOP » : la fiche **est** signée. Pas de STOP.
- « Moins de 3 writers sains ⇒ repli séquentiel annoncé avec son coût, **pas un
  blocage** » : 1 writer sain, repli **annoncé** (`E-031-007`). Pas un blocage.

## Verdict du gate

**FRANCHI** — les prérequis sont mesurés et non supposés, l'état-avant du fichier
est épinglé sous un nom, la partition §XI est calculée sur des parents relevés et
non pariée, et les sept écarts constatés sont au registre avant d'être rencontrés.
La préparation des 13 campagnes peut commencer.
