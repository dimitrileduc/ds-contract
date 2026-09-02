# Captures-avant et tests à blanc — table de contrôle des 13 cibles (T032)

**Date** : 2026-08-27 · **Gate** : G1 · **§X / FR-007**

FR-007 exige l'état-avant de **toutes** les cibles, jamais d'un sous-ensemble
pilote, chaque capture vérifiée **non vide et correctement dimensionnée**. §X
n'est pas divisible.

---

## 1. Les 11 campagnes préparées jusqu'au test à blanc

Chaîne exécutée par le driver : `audit → snapshot-source → preflight →
capture-before → dry-run`, borne `--until dry-run` (R6). **Aucune écriture de
canevas** : les trois premières étapes sont read-only et le dry-run n'écrit pas.

| Campagne | Run | Mode | Surfaces | structure / faits / propriétés | PNG | PNG défectueux | Verrous (l/w/b) | Dry-run |
|---|---|---|---|---|---|---|---|---|
| `presentation` | run-002 | **full** | 7 | 7 / 7 / 7 | **7** | 0 | 0/0/0 | ✅ vert |
| `devis` | run-002 | light | 17 | 17 / 17 / 17 | 1 | 0 | 0/0/0 | ✅ vert |
| `formulaire` | run-001 | light | 3 | 3 / 3 / 3 | 1 | 0 | 0/0/0 | ✅ vert |
| `coordonnees` | run-001 | light | 3 | 3 / 3 / 3 | 1 | 0 | 0/0/0 | ✅ vert |
| `faq` | run-005 | light | 7 | 7 / 7 / 7 | 1 | 0 | 0/0/0 | ✅ vert |
| `sav` | run-002 | light | 3 | 3 / 3 / 3 | 1 | 0 | 0/0/0 | ✅ vert |
| `texte-seo` | run-002 | light | 17 | 17 / 17 / 17 | 1 | 0 | 0/0/0 | ✅ vert |
| `hero` | run-001 | light | 19 | 19 / 19 / 19 | 1 | 0 | 0/0/0 | ✅ vert |
| `equipe` | run-002 | light | 3 | 3 / 3 / 3 | 1 | 0 | 0/0/0 | ✅ vert |
| `produits-ecommerce` | run-001 | light | 5 | 5 / 5 / 5 | 1 | 0 | 0/0/0 | ✅ vert |
| `google-reviews-section` | run-003 | light | 1 | 1 / 1 / 1 | 1 | 0 | 0/0/0 | ✅ vert |
| **TOTAL** | | | **85** | **85 / 85 / 85** | **17** | **0** | **0 bloquant** | **11/11** |

**Chaque surface déclarée porte son état-avant** : 85 sur 85, en structure, en
faits et en propriétés. Aucun trou.

### Pourquoi 17 PNG et non 85 — et pourquoi §X n'est pas affaibli

C'est le mode `--capture-mode light`, documenté et opt-in
(`docs/internal/component-repair-workflow.md` §Capture allégée) :

| Phase | `full` | `light` |
|---|---|---|
| faits + structure + propriétés | toutes les surfaces | **toutes les surfaces** |
| PNG avant | toutes | surfaces **déclarées** (master, membres, allowlist d'écriture) |

Le fait est capturé partout ; seul le **volume d'image** est allégé. Le pilote
`presentation` a payé le mode complet (7 PNG pour 7 surfaces) précisément pour
que le lot roule allégé sur une équivalence observée en vif, et non seulement
démontrée sur fixtures (R9). Une surface qui doit un cliché et revient vide ou
mal dimensionnée est refusée en `light` exactement comme en `full` — **zéro
refus de ce type ici**.

### Vérification une par une des 7 PNG du pilote

Lecture de l'en-tête PNG (signature + largeur/hauteur au format IHDR), pas une
lecture de taille de fichier :

| Fichier | Dimensions | Poids | Attendu (relevé canevas) |
|---|---|---|---|
| `presentation_master.png` | 1287 × 142 | 34 041 o | master 1287 × 142 ✅ |
| `presentation_usage_2104-2958.png` | 1287 × 142 | 33 779 o | instance À Propos ✅ |
| `presentation_usage_2105-2990.png` | 1287 × 142 | 34 709 o | instance Portes de garage ✅ |
| `presentation_usage_2106-3000.png` | 1287 × **262** | 54 283 o | instance Accueil, **plus haute** ✅ |
| `presentation_context_258-1887.png` | 1728 × 6152 | 7 393 697 o | frame À Propos ✅ |
| `presentation_context_226-112.png` | 1728 × 4372 | 5 056 217 o | frame Portes de garage ✅ |
| `presentation_context_210-326.png` | 1728 × 5462 | 5 672 009 o | frame Accueil ✅ |

Les sept correspondent **exactement** aux dimensions relevées sur le canevas à
T008/T014, y compris l'usage de l'Accueil qui est le seul à 262 px de haut.

---

## 2. Les 2 campagnes bloquées — état-avant, dit honnêtement

| Campagne | PNG capture-avant | Pourquoi | Ce qui tient lieu d'état-avant |
|---|---|---|---|
| `reassurances` | **aucun** | La chaîne refuse **au preflight** (`existing responsive component-set topology drift`), donc **avant** l'étape qui produit les captures. Preuve : `specs/component-repairs/reassurances/run-001/blocage-ajout-axe.md` | Version Figma **`031-avant-vague`** (id `2392267626424800780`) — fige le **fichier entier** |
| `hero-video` | **aucun** | Aucune mutation n'est proposée : le renommage n'a aucun chemin runner (R3). Preuve : `specs/component-repairs/hero-video/run-006/blocage-renommage.md` | idem |

**Ce n'est pas une capture manquante au sens de FR-007.** FR-007 exige l'état-avant
*avant toute mutation* ; sur ces deux cibles **aucune mutation n'est ni possible
ni proposée**, et la chaîne s'arrête d'elle-même, fail-closed, avant d'écrire quoi
que ce soit. L'état-avant existe et il est plus fort qu'un PNG : la version
nommée fige tout le fichier.

**Clause explicite** : si l'owner retient l'issue « geste bridge manuel gouverné »
pour l'une de ces deux cibles, la **capture-avant devient obligatoire avant le
geste**, au même titre que pour les 11 autres. Elle n'est pas dispensée — elle est
sans objet tant qu'aucune écriture n'est autorisée.

---

## 3. Verdict de la table

- **85 surfaces déclarées sur 85 portent leur état-avant.**
- **0 capture vide ou mal dimensionnée** sur les 17 PNG produits.
- **0 verrou hérité bloquant** sur les 11 campagnes préparées (`preflight-locks.json` :
  `locks 0 / waived 0 / blocking 0` partout) — donc **aucune dérogation `lockWaivers[]`
  à motiver** (D8, FR-008), et la classe du verrou 744 px de 029 ne se présente pas ici.
- **11 tests à blanc verts sur 11.**
- **2 cibles bloquées, nommées, avec leur preuve et leur clause de capture.**

**§X est tenu.** Aucune mutation de canevas n'a été posée à ce stade.

---

## 4. Limite héritée, rappelée là où elle s'applique

`E-031-003` est **active sur les 11 campagnes** : le preflight des verrous
s'arrête au premier ancêtre non-COMPONENT, et les 13 parents relevés à T008 sont
des `FRAME` ou des `SECTION` — donc non-COMPONENT. Un plancher posé sur l'un de
ces parents **ne serait pas rapporté** par la porte. Le `0 bloquant` ci-dessus
doit se lire dans cette portée : il dit « aucun verrou dans le périmètre que
cette porte couvre », pas « aucun verrou nulle part ».
