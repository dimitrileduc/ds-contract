# T007 — Comptes d'ouverture (relevés vifs, jamais recopiés)

**Date** : 2026-08-05 · **Worktree** : `ds-contract-016` · **Commit** : `258fa40`

Chaque chiffre ci-dessous a été **lu en direct**. Là où l'annonce de `tasks.md` est
confirmée, c'est dit ; là où le vif la contredit, c'est le vif qui est consigné.

---

## 1 · `npm run parity` — exit 0 (vert)

Sortie brute : `parity.txt`

| | Annoncé (`tasks.md`) | **Relevé vif** | |
|---|---:|---:|---|
| Total acquittements `parity/baseline.json` | 89 | **89** | ✅ |
| dont couverture géométrie `figma-tokens\|behind\|Primitives/(space\|size)/…` | 83 | **83** | ✅ |
| dont résiduels hors géométrie | 6 | **6** | ✅ |

Les 6 résiduels, un par un — identiques à la liste annoncée :

```
figma-tokens|mismatch|Primitives/font/family/montserrat [Value]
figma|behind|Avantage.PiquerayLogo
figma|behind|Carte.Bouton
figma|behind|SectionHeader.Bouton
figma|mismatch|Presentation.Texte (default)
icons|ahead|assets/icons/close.svg
```

C'est la cible de SC-001 : **89 → 6** après U1a. L'écart avec le « ≈7 » de `spec.md` est
déjà nommé par `tasks.md` et le reste ici : **le vif en montre 6**.

## 2 · `npm run measure:gate` — PASS (exit 0)

Sortie brute : `measure-gate.txt`

```
measure:gate — verdict: PASS (exit 0)
  contracts 34 · measured lines 52 · divergent 42 · deferred work 2
  by cause: contract-geometry=0 · image-boundary=11 · rendering=24 · engine=2 · instrument=1 · figma-source=2
  browser: 151.0.7922.34
✓ all four conditions held — zero refusals
```

**Conforme en tout point à l'annonce**, `figma-source=2` compris — la cible de clôture
(`figma-source: 0`) est donc bien un travail à faire, pas un compte déjà acquis.

> ⚠️ **Prérequis découvert (O-4)** : au premier passage, cette porte a **refusé** —
> `artifact-missing: extract/figma/visual-parity/out/rows.json`. `out/` n'est pas versionné
> et le worktree était neuf. `npm run extract:figma:visual` doit tourner **avant** toute
> lecture de `measure:gate` — donc avant T035 et T051 aussi. Le refus initial est archivé
> tel quel dans `../depart-sweep.txt` plutôt que masqué.

## 3 · `npm run geometry:gate` — PASS (exit 0)

Sortie brute : `geometry-gate.txt`

```
geometry:gate — verdict: PASS (exit 0)
  contracts 34 · geometric entries 2 · governed refs 219 · named literals 2 · invisible 0
✓ zero invisible literal, zero registry refusal
```

Conforme : **0 invisible**. L'acquis de 015 est intact au départ de 016.

## 4 · `npm run extract:figma:visual:summary` — la ligne de départ de SC-006

Sortie brute : `visual-summary.txt` · `SUMMARY GATE: all rows within ±0.1pp of baseline.json`

**Les deux sujets à débloquer MESURENT déjà** — c'est plus favorable que ce que le plan
laisse entendre :

| Sujet | Variante | gate/raw | masqué | Seuil | Cause |
|---|---|---:|---:|---|---|
| **Field** | `Etat=Normal` | 1,84 % | 1,51 % | within | **`engine`** |
| **Field** | `Etat=Erreur` | 2,20 % | 1,24 % | **OVER** | **`engine`** |
| **NavItem** | `NavItem` | 1,25 % | 0,25 % | within | **`rendering`** |

Conséquence pour SC-006 : le travail restant n'est **pas** « faire mesurer des sujets qui
ne mesurent pas » — ils mesurent. C'est (a) pour Field, le défaut **moteur** de cause
`engine` qui tient `Etat=Erreur` au-dessus du seuil (fixture d'abord — T065) ; (b) pour
les deux, la substitution des **reçus `blocked`/`fail` d'époque** par des causes vivantes
(T064, T069). La condition exacte se re-dérive en T064 depuis `triage.ts`, pas depuis ce
tableau.

### Deux faits croisés au passage, utiles plus tard

- `✗ Property 1=Outilne noir: SKIPPED — axis "Property 1=Outilne noir" has no contract binding`
  → c'est **B013-8** vu par l'instrument de mesure. La faute de frappe venue de Figma a
  une conséquence mesurable : l'axe est sauté, donc non mesuré.
- `✗ Couleur=Default / Couleur=Blanc: render refused — ds.piqueray-logo: part "Marque"
  needs vector asset "assets/vectors/piqueray-logo-marque.svg" which does not exist`
  → un refus de rendu **hors périmètre 016**, nommé ici pour qu'il ne soit pas confondu
  plus tard avec un effet du chantier.

---

## Synthèse — l'annonce tient, à un prérequis près

| Élément | Verdict |
|---|---|
| 89 acquittements ventilés 83/6 | ✅ confirmé au vif |
| `measure:gate` PASS, `figma-source=2` | ✅ confirmé — **après** `extract:figma:visual` |
| `geometry:gate` PASS, 0 invisible | ✅ confirmé |
| Field/NavItem : ligne de départ | ✅ relevée — **les deux mesurent**, causes `engine` / `rendering` |
