# Contrat — les six gates de la vague (FR-011)

**Ce contrat est documentaire, et c'est délibéré.** FR-015 gèle le runner et les
Assumptions consomment 030 « tel quel » : écrire un contrôle machine pour ce
contrat serait ajouter une capacité, donc une fixture et un eval (§II), donc du
runner modifié pendant la vague. Rien ici ne sera jamais présenté comme un
contrôle automatique (recherche R7).

Un gate appartient à la **vague**. Une campagne n'a pas de gate : elle a un
verdict et une décision (recherche R8).

---

## Le devoir de re-citation

> **FR-011** : chaque gate MUST re-citer les exigences de ce document et cocher
> lesquelles la campagne couvre.

C'est la parade au puits n°2 de 029 : *le livrable a suivi le mauvais axe toute
la journée, et aucun des trois gates n'a re-vérifié la campagne contre `spec.md`.*

Forme obligatoire de tout franchissement de gate — un fichier
`proofs/gate-G<n>.md` :

```markdown
# G<n> — <nom> — <date/heure>

## Exigences re-citées depuis spec.md
| Exigence | Texte (première ligne) | Couverte ici | Preuve |
|---|---|---|---|
| FR-00x | … | oui / non / partielle | <chemin> |

## Campagnes concernées et ce qu'elles couvrent
| Campagne | Exigences couvertes | Non couvertes (et pourquoi) |

## Verdict du gate
franchi / refusé — <une phrase>
```

Deux règles dures :
1. « non couverte » est une **réponse valide** ; « non mentionnée » ne l'est pas.
2. Une exigence marquée « couverte » sans chemin de preuve rend le gate
   **non franchi**.

---

## G0 — Kick-off

**Entrée** : worktree autosuffisant (F1), fiche D1–D9 signée.

**Sorties obligatoires**
- Sweep de qualité complet, vert (seul rouge toléré : la dette golden 028,
  strictement inchangée).
- Version Figma épinglée nommée **`031-avant-vague`** (§X : état-avant complet,
  plus fort que des PNG échantillonnés).
- `inventory/partition-zones.json` — le parent relevé de chacun des 13 masters,
  et la partition §XI qui en découle (R5).
- `inventory/prerequis-g0.md` — comparaison du cliché de parité vif à
  `parity/snapshots/figma-components.json` (R4 : le cliché est présumé **frais**,
  la mesure tranche), état des ports 9223-9232 (`portFallbackUsed:false`), nombre
  de writers sains.
- Première ligne de registre si un écart est constaté — dont le défaut de source
  `TEST/Reassurances Responsive — Controlled` (R11).

**Refus de franchissement** : moins de 3 writers sains ⇒ **repli séquentiel
annoncé avec son coût (+1 h 45)**, pas un blocage. Fiche D1–D9 non signée ⇒ STOP.

**Exigences visées** : FR-002, FR-007 (préparation), FR-010, SC-004.

---

## G1 — Fin de préparation

**Sorties obligatoires, pour les 13**
- Audit frais (usages scannés **par position**, jamais par nom — §VIII).
- Manifeste **généré** puis relu par la validation existante ; les champs
  `generated.nonDeductible[]` sont **tranchés**, jamais laissés à leur valeur
  conservatrice par défaut. Un manifeste généré est légal, pas prêt à poser.
- `preflight-locks.json` : tout verrou hérité est nommé **avant** la séance ;
  chaque `blocking` est corrigé à la source ou porté en `lockWaivers[]` avec son
  `decisionRef` (D8, FR-008).
- Capture-avant vérifiée non vide et bien dimensionnée, pour **les 13** cibles —
  jamais un pilote d'abord (§X, FR-007).
- Dry-run vert (`--until dry-run`).
- Planche 7 zones par campagne + sommaire de triage.
- **Fidélité §XII contrôlée, pas seulement affirmée** : témoins à leur largeur
  cible réelle (aucune mise à l'échelle), même zoom entre deux témoins comparés,
  largeurs identiques nommées une fois et renvoyées à l'archive, échelle d'export
  écrite si un PNG est produit à une échelle ≠ 1.

**Refus de franchissement** : une seule capture manquante ou mal dimensionnée
bloque **toute** la vague — §X n'est pas divisible. Une planche mise à l'échelle
sans mention n'est pas présentable (§XII).

**Exigences visées** : FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-014.

---

## G2 — Séance owner (touche 1 sur 2)

**Déroulé** : sommaire de triage → lot standard → lot à décisions. Toute campagne
dont le **sélecteur change** sort d'office du lot standard.

**Règles dures**
- Un mot de l'owner couvre **exactement une** décision d'**une** campagne
  (FR-012). Aucun accord ne couvre un lot.
- La séance **ne se termine pas** avant que les 13 aient reçu leur décision
  individuelle ; le dépassement de 45 min n'autorise **aucune** approbation ou
  report en rafale (FR-012, SC-007 — clarification du 2026-08-27).
- Une décision dont un fait accepté touche topologie, sélecteur, axes ou Text
  Styles est **refusée par nom** sans sa phrase française de conséquence
  sélecteur **et** sa capture du sélecteur (FR-006,
  `structural-fact-unwitnessed`).
- Une planche dont la zone « ce que vous n'aurez pas » est vide **n'est pas
  présentable**.

**Décisions supplémentaires à trancher ici** : le sort du renommage `HeroVideo`
(R3 : geste manuel gouverné ou report FR-018) et celui du set d'essai
`TEST/Reassurances` (R11).

**Exigences visées** : FR-005, FR-006, FR-012, SC-002, SC-007, SC-009.

---

## G3 — Pilotes

**Ordre imposé** : Reassurances (`existing`, `--capture-mode full`) — la capacité
« créations déclarées dans un set existant », construite par 029 et **jamais
exercée en vif** — puis la première section `additive`, en `full` également.

**Sortie** : chaîne complète verte de bout en bout, **second passage sans effet**
(zéro nœud créé, zéro nœud modifié), sweep de qualité re-passé.

**Refus de franchissement** : tout échec ou toute dérive **arrête la vague**. Le
remède est un correctif accompagné de sa fixture ; un contournement manuel est
interdit (FR-009). C'est le seul gate qui peut annuler la journée.

**Exigences visées** : FR-009, FR-013, FR-015, SC-005.

---

## G4 — Lot et vérification globale

- 10 campagnes en `--capture-mode light`, sur **zones disjointes** issues de
  `partition-zones.json`. Un writer par zone, un port par writer.
- **Un seul** cycle de vérification global, possédé par l'orchestrateur. Aucun
  agent d'écriture ne conduit sa propre vérification (FR-010, §XI).
- Refresh de `parity/snapshots/figma-components.json` après les créations, **et
  preuve SC-004 tirée de ce diff** : `componentKey` de chaque membre historique
  inchangée, aucun composant disparu, les 28 nouveaux membres sont des ajouts.
- +12 acquittements `figma|ahead|<Set>.Presentation` dans `parity/baseline.json`
  (12 → 24 entrées au total ; `.Presentation` : 2 → 14). La 13ᵉ campagne
  n'en ajoute pas : `HeroVideo.Presentation` est déjà acquitté et se voit
  **re-qualifié** si le renommage est appliqué, inchangé s'il est reporté —
  c'est la forme que prend FR-013 pour elle.
  Le patch de promotion de contrat proposé par `npm run parity` est **refusé par
  nom** (D1, FR-013).
- Une campagne qui casse (enfant inaccessible, contenu qui déborde) **sort du
  lot** avec sa décision nommée ; les autres continuent (FR-018).

**Exigences visées** : FR-001, FR-010, FR-013, FR-018, SC-001, SC-004, SC-005,
SC-006.

---

## G5 — Acceptation finale (touche 2 sur 2)

**Ordre imposé, et il est normatif** : l'owner prend **d'abord** chaque décision
individuelle de report due à un blocage apparu après la séance, **puis** accepte
la clôture globale (FR-012, FR-018).

**Sorties** : `--finalize` ×13 depuis le dossier de décisions partagé · registre
d'écarts complet · inventaire de typographie mobile (FR-016) · version épinglée
**`031-apres-vague`** · entrée datée à `MILESTONES.md` · sweep final avec
`git status --porcelain src/ figma-sync/ catalog/ contracts/ tokens/ core/ evals/`
**vide** (SC-008 — les **sept** chemins, comme au quickstart et à T073 : la
surface de re-pin attendue est zéro, pas « zéro sur trois dossiers »).

**Le bilan nomme séparément** : sections livrées sur douze, sections reportées
avec leur cause, campagnes « sans changement ». Zéro campagne sans verdict.

**Exigences visées** : FR-011, FR-012, FR-014, FR-016, FR-017, FR-018, FR-019,
SC-001, SC-002, SC-003, SC-008.
