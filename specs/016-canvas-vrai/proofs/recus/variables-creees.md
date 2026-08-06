# Reçu T016 / T017 — les 83 variables existent, les acquittements tombent

**Date** : 2026-08-05 · **Lot** : `U1a-variables` · **Cliché** : ré-extrait après le geste
(`parity/snapshots/{figma-components,figma-tokens}.json`, `extractedAt` 1785941220242)

---

## T016 — vérification AVANT de toucher au fichier d'acquittements

La règle est stricte : **un acquittement se retire parce que le fait a disparu**, jamais
pour faire tomber un compte. Vérification faite sur le **cliché frais**, variable par
variable, contre la valeur du token source :

| Contrôle sur les 83 créées | Résultat |
|---|---:|
| Présentes **et** conformes (valeur **+** scopes **+** codeSyntax) | **83 / 83** |
| Manquantes | **0** |
| Valeur incorrecte | **0** |
| Scopes incorrects | **0** |
| codeSyntax incorrect | **0** |

Comptes vifs de la collection **Primitives**, mode **Value**, dans le cliché :

```
géométriques : 99  =  size 78  +  space 21
type unique  : FLOAT
montserrat   : "Montserrat, sans-serif"
```

La vérification ne porte pas seulement sur l'existence : **les scopes et le `codeSyntax`
sont contrôlés aussi**, parce que c'est ce que le générateur calcule et donc ce qui doit
être vrai côté canvas — une variable présente mais mal scopée serait une demi-création.

## T017 — retrait des 83, et d'elles seules

```
parity/baseline.json :  89  →  6
  retirées : 83  (toutes figma-tokens|behind|Primitives/(space|size)/…)
```

Aucune autre ligne touchée. `npm run parity` → **exit 0** :

```
✔ No new drift — 3 acknowledged finding(s) remain in parity/baseline.json.
summary: { total: 0, acknowledged: 3, pending: 0 }
```

### SC-001 : la cible est atteinte, et dépassée

| | Annoncé | Relevé |
|---|---:|---:|
| Acquittements en fichier | 89 → 6 | **89 → 6** ✅ |
| Findings **vivants** encore acquittés | — | **3** |

Le fichier porte 6 acquittements mais **3 seulement sont encore appuyés par un finding
vivant** :

```
figma|behind|Carte.Bouton
figma|behind|SectionHeader.Bouton
icons|ahead|assets/icons/close.svg
```

## Trois acquittements devenus SANS OBJET — à retirer en T072, pas ici

| Acquittement | Pourquoi il est tombé |
|---|---|
| `figma-tokens\|mismatch\|Primitives/font/family/montserrat [Value]` | **Résolu par U1a**, et **annoncé** : le script a poussé `"Montserrat"` → `"Montserrat, sans-serif"` (`annonce.md` § effet de bord) |
| `figma\|behind\|Avantage.PiquerayLogo` | **Résolu par la ré-extraction** — le cliché `figma-components.json` datait du **2026-07-26** |
| `figma\|mismatch\|Presentation.Texte (default)` | idem |

Ils ne sont **pas** retirés à cette tâche : T017 dit « les 83 et elles seules », et la
règle veut qu'on constate d'abord la disparition sur cliché frais — c'est fait ici, le
retrait se fera en **T072** avec ce reçu pour justification.

### Conséquence pour US3 : deux cibles de T056 sont déjà éteintes

T056 doit re-juger **4** acquittements figma d'avant 015. **Deux d'entre eux
(`Avantage.PiquerayLogo`, `Presentation.Texte (default)`) sont déjà tombés** — non par un
geste, mais parce que le cliché contre lequel ils étaient jugés avait deux semaines. Ils
n'étaient pas des divergences réelles, mais des **artefacts d'un cliché périmé**.

Restent à re-juger en T056 : `Carte.Bouton` et `SectionHeader.Bouton` — tous deux
« contract composes ds.button but no Bouton instance exists inside the Figma component ».

## Un fait du cliché à ne pas confondre avec un effet du lot

Le cliché frais compte **58 sets** contre 57 auparavant. Le set apparu est
**`Style=Icône seule`** (`COMPONENT` autonome, `2238:4411`, 52×52, page DS · Atomes) —
déjà présent au relevé de périmètre T004, donc **antérieur au lot U1a**, qui n'a écrit
que dans les collections de variables et n'a touché aucun nœud. Son absence de l'ancien
cliché est un effet de la péremption, pas du geste.

Son nom (`Style=Icône seule`, une graphie de *variante*) sur un composant autonome est
un signe de source à vérifier — **hors périmètre des 10 défauts de 016**, signalé ici pour
ne pas être perdu.

## Re-vérification

```bash
npm run parity                     # exit 0, acknowledged 3, pending 0
python3 - <<'PY'
import json, re
prim = next(c for c in json.load(open('parity/snapshots/figma-tokens.json'))['collections'] if c['name']=='Primitives')
geo = [v for v in prim['variables'] if re.match(r'^(size|space)/', v['name'])]
print(len(geo), 'géométriques =', sum(1 for v in geo if v['name'].startswith('size/')), 'size +',
      sum(1 for v in geo if v['name'].startswith('space/')), 'space')
PY
```
