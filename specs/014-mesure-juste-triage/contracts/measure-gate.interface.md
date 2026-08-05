# Contrat — Le contrôle de clôture (`measure:gate`)

**Spec** : FR-007, FR-011 · **Décision** : [research.md](../research.md) D7
· **Entité** : [data-model.md](../data-model.md) §6

La vérification fail-closed qui conditionne la fin de la fonctionnalité. Elle
reste dans le dépôt **après** 014 : FR-002 exige une vérification conservée, et
un outil jetable rangé dans `specs/` ne serait pas conservé.

---

## 1. Forme

```text
extract/figma/measure-gate/
├── gate.ts     évaluateur PUR — aucune E/S, aucun réseau, aucun navigateur
└── run.ts      CLI mince — lit les artefacts, appelle gate.ts, applique le code de sortie
```

C'est la forme déjà éprouvée deux fois dans le dépôt (`visual-parity/gate.ts`,
`organism-audit/campaign.ts`) : une politique pure qu'une fixture d'eval exerce
sans réseau ni navigateur, et un CLI qui n'a que la plomberie.

```bash
npm run measure:gate                    # évalue et refuse
npm run measure:gate -- --json          # même verdict, sortie machine
npm run measure:gate -- --explain       # chaque refus avec son artefact et son chemin
```

---

## 2. Codes de sortie

Alignés sur la table déjà employée par 013 (`organism-audit/run.ts`) — un code
distinct pour « les entrées sont invalides » et pour « la mesure est
incomplète », parce que les deux appellent des gestes différents.

| code | verdict | sens |
|---:|---|---|
| `0` | `pass` | les quatre conditions sont tenues |
| `1` | `fail` | au moins une condition manque — la mesure est incomplète |
| `2` | `blocked` | les entrées elles-mêmes sont inexploitables (artefact absent, JSON invalide, schéma inconnu) |

**Fail-closed.** L'absence d'un artefact attendu produit `2`, jamais `0`. Un
contrôle qui passe faute d'avoir trouvé quoi que ce soit serait exactement
« l'absence de donnée assimilée à une conformité » que les conventions du dépôt
interdisent.

---

## 3. Les quatre conditions et leurs refus nommés

### C1 — Zéro ligne mesurée sans cause

Population : **toute ligne divergente des deux instruments**. Une ligne est
divergente si et seulement si son score brut autoritaire est strictement
supérieur à 0 — la lecture porte sur le nombre, jamais sur la chaîne formatée à
deux décimales (décision D8).

**Les causes se lisent à deux endroits, un par instrument** (décision D12) :
`extract/figma/visual-parity/triage.ts` pour les lignes de parité visuelle,
`specs/014-…/proofs/registre/causes.json` § `organismLines` pour les 9 lignes de
l'audit d'organismes. Une ligne divergente absente des deux émet
`untriaged-line`. Le comptage `byCause` agrège les deux sources sur le même
vocabulaire — une seule taxonomie, un seul compte.

| refus | émis quand |
|---|---|
| `untriaged-line` | une ligne divergente ne porte aucune cause |
| `cause-outside-vocabulary` | une cause n'est pas l'un des six slugs |
| `cause-vocabulary-not-bijective` | `CAUSE_LABELS` n'est pas une bijection sur `CauseSlug` |

Aucun seuil n'intervient. `TRIAGE_LINE_PCT` cesse de conditionner l'attribution
d'une cause (FR-015) ; les seuils de réussite/échec, les régions déclarées et
les critères de preuve restent **intacts**.

### C2 — Tout composant généré porte une ligne de mesure

Population : les identifiants de `contracts/*.contract.json` (34 aujourd'hui,
comptés en direct, jamais figés).

| refus | émis quand |
|---|---|
| `component-without-measurement` | un contrat n'a de ligne dans aucun des deux instruments |
| `impediment-without-receipt` | une ligne est `skipped`/`refused`/`figma-declined` sans reçu (I-1.4) |

Une ligne non probante est acceptée **si et seulement si** elle est déclarée
telle avec sa cause et son reçu. L'absence silencieuse et l'empêchement affirmé
sans preuve sont les deux issues interdites (FR-006).

### C3 — Tout chiffre repose sur le node de son cas

Sur les **cinq** dérivées de FR-001, pas la seule capture.

| refus | émis par | émis quand |
|---|---|---|
| `reference-not-case-node` | `organism-audit/reference.ts` | une dérivée cite un node autre que celui du cas |
| `reference-provenance-missing` | `tools/build-registre.mts` | un dossier ne publie pas son bloc `referenceProvenance` |
| `reference-provenance-incomplete` | `organism-audit/reference.ts` | le bloc ne couvre pas les cinq dérivées (une absente) |

**Ces trois codes sont un vocabulaire, au même titre que les six causes.**
`checkReferenceProvenance` les émet sous forme structurée (`{code, derivation,
message}`) et la fixture `organism-audit-case-reference-check.ts` vérifie les
deux premiers valeur pour valeur — un code que le module émet et que ce contrat
ignore, ou l'inverse, est le même défaut que FR-004 refuse, une couche plus bas.
Distinguer « cite le mauvais node » de « dérivée absente » n'est pas cosmétique :
un contrôle qui les confondrait rapporterait « mauvais node : undefined », ce qui
ne nomme rien.

`reference-provenance-missing` est un refus, pas un « non applicable » : un
dossier qui ne dit pas d'où vient sa référence n'a pas prouvé qu'elle est bonne.

**Où la provenance se lit, organisme par organisme.** Un seul dossier de 013 est
re-rendu (reassurances, parce que FR-003 l'exige) ; les huit autres sont
antérieurs à la correction et D10 interdit de les réécrire. Leur provenance vient
donc de `proofs/registre/apres.json`, dont la re-mesure tourne sur le pilote
corrigé et publie le bloc pour **les neuf** — `build-registre.mts` applique C3 à
la source et refuse lui-même (`reference-provenance-missing`,
`reference-not-case-node`) avant même que le gate ne lise. C'est la seule route
qui tienne la propriété sans re-rendre une campagne close ni assouplir C3.

`avant.json` ne porte, lui, aucune provenance : le T0 mesure l'état **antérieur**
à la correction, où le pilote n'en émettait pas. Cette absence est le reçu de
l'état défectueux, pas un trou.

### C4 — Toute cause publiée porte un reçu re-testé

| refus | émis quand |
|---|---|
| `cause-without-receipt` | une cause publiée n'a pas de `causeReceiptId` résolvable |
| `receipt-not-dated` | un reçu n'a pas de date |
| `receipt-not-retestable` | un reçu porte `verdict: 'not-retestable'` |
| `receipt-claim-unrefuted` | un reçu `refuted` dont la ligne n'a pas été re-classée |

`receipt-not-retestable` **bloque la clôture** : une cause héritée non
re-testable est publiée comme telle, nommément, et ne passe jamais pour une
cause vérifiée (FR-012, edge case de la spec).

---

## 4. Sortie

```jsonc
{
  "schemaVersion": 1,
  "verdict": "pass" | "fail" | "blocked",
  "exitCode": 0 | 1 | 2,
  "counts": {                         // comptés EN DIRECT, jamais figés
    "contracts": 0,
    "measuredLines": 0,
    "divergentLines": 0,
    "byCause": {
      "contract-geometry": 0, "image-boundary": 0, "rendering": 0,
      "engine": 0, "instrument": 0, "figma-source": 0
    }
  },
  "refusals": [
    { "code": "untriaged-line", "subject": "…", "at": "…", "message": "…" }
  ],
  "browser": { "version": "…", "executablePath": "…" }
}
```

`counts.byCause` **est** la sortie dimensionnante de FR-011 : la part
`contract-geometry` dimensionne 015, la part `figma-source` dimensionne 016.

**Déduplication obligatoire.** Deux entrées liées par `sameDefectAs`
(receipts.schema.md §4 bis) décrivent le même défaut vu de deux endroits — un
fait épinglé et la ligne mesurée qui en résulte. Elles comptent pour **un**.
Sans ça la sortie annonce 2 travaux là où il y en a 1, et la spec suivante se
dimensionne sur un chiffre gonflé — l'inverse exact de ce que FR-011 existe pour
produire. Le compte publie aussi `counts.deferredWork` : ce que 014 a découvert
sans le réparer, qui doit être ordonnancé ailleurs.
Elle couvre les lignes des deux instruments **et** les entrées re-classées du
registre des travaux reportés de 013 — un comptage unique, une seule taxonomie.

---

## 5. Ce que le contrôle ne fait pas

- **Il ne répare rien.** Un refus nomme, il ne corrige pas. Un triage n'est pas
  une réparation (FR-005).
- **Il ne mesure pas.** Il lit les artefacts produits par les deux instruments.
  Il n'ouvre ni navigateur ni connexion Figma — ce qui est aussi ce qui le rend
  exerçable par une fixture d'eval data-only.
- **Il ne fige aucun compte en prose.** Il compte et publie le compte obtenu.
  C'est ce qui a rendu visible, plutôt qu'absorbé, l'écart entre les « 63 lignes »
  qu'écrivait SC-002 et les 39 que le rapport porte (recherche §0.9) — écart
  depuis corrigé à la source, SC-002 ne citant plus de nombre.
