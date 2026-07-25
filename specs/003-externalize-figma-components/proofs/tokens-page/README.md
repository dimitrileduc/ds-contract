# Preuve pixel — ajout de la page `DS · Tokens` (T029c)

**Date** : 2026-07-24
**Résultat** : `verdict.json` / `verdict.md` — **9/9 `identical`, exit 0**

## Méthode et limite nommée (honnêteté, R4)

La séquence normative (quickstart §« La boucle d'un incrément ») demande une
capture **before** fraîche prise **immédiatement avant** le geste mutant. Ce
n'est **pas** ce qui a été fait ici : le geste (checkpoint + création de page,
T029a) a été exécuté avant qu'une capture before dédiée soit prise pour cet
incrément précis — un gap de process, nommé plutôt que caché.

**Ce qui a été fait à la place** : le `before` utilisé est
`.page-parity/drill-after/` — la capture la **plus récente disponible**, prise
**le même jour** (2026-07-24) à la fin du drill de rollback T021, elle-même
déjà prouvée `9/9 identical` contre son propre `before`. Entre cette capture
et le début de T029a, **aucune opération n'a touché la page `Pages`** (T026
était un audit lecture-seule sur les variables ; le scan d'usage `orange-12/42`
est lecture-seule ; T029a/T029b n'ont créé/modifié que la nouvelle page
`DS · Tokens`, un arbre de nœuds sans référence croisée vers `Pages`).

**Pourquoi c'est nommé comme une limite et pas juste accepté en silence** :
une anomalie de dérive nocturne inexpliquée (23→24, 2 titres hero) est déjà
consignée comme **en attente** dans `decisions.md` (receipt T021,
`proofs/T0-rollback-drill/derive-nocturne/`) — la preuve que « rien n'a été
touché programmatiquement » ne garantit pas empiriquement l'absence de dérive
dans cet environnement. Réutiliser un `before` non-immédiatement-antérieur est
donc une déviation consciente de R4, pas une négligence.

## Ce que le résultat prouve quand même

Le résultat (9/9 identical, sha256 par maquette identiques à `drill-after` —
receipt : `Accueil` sha256 `55a9c4085d2d…` égal des deux côtés) est une preuve
positive que :
1. la création + peuplement de `DS · Tokens` n'a **mesurablement** affecté
   aucune des 9 maquettes ;
2. la dérive nocturne du drill T021 **ne s'est pas reproduite** entre
   `drill-after` et maintenant (même journée, fenêtre plus courte) — un point
   de données de plus pour cette anomalie encore ouverte, pas une clôture.

## Receipt

- Before : `.page-parity/drill-after/` (capturé 2026-07-24, T021)
- After : `.page-parity/tokens-page-after/` (capturé 2026-07-24, ce tour —
  transport `b-fetch`, nonce receveur `80562341e08569ea`, 9/9 statut `ok`)
- Comparaison : `npm run pages:compare -- --before .page-parity/drill-after --after .page-parity/tokens-page-after --out specs/003-externalize-figma-components/proofs/tokens-page`
- Sortie : `identical — 9/9 identical, 0 diff, 0 capture-failed, 0 dimension-mismatch (exit 0)`
