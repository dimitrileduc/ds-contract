# Gestes — cycle V4 (Réassurances, coquille 88→89)

## Geste 1 — T065 : resize sur les 3 variants

```js
const ids = ['2114:3619', '2114:3653', '2114:3693']; // 4 cartes / 4 cartes · 2 CTA / 5 cartes
for (const id of ids) {
  const n = await figma.getNodeByIdAsync(id);
  n.resize(1550, n.height); // 1552 -> 1550 ; aucun GROUP sur ce chemin (releve T063)
}
```

**Résultat mesuré : 9/9 `identical`, exit 0 — zéro pixel, y compris sur les 6/9 pages
qui instancient Réassurances** (Accueil, Portes de garage, Portes de garage
résidentielles, Portes de garage industrielles, Portes d'entrée, À Propos). **Pas ce
que le plan annonçait** (2px de largeur) — traité honnêtement comme un **échec de
prédiction** (`contracts/proof-cycle.md` §3), comme pour Devis (V2).

**Mécanisme (vérifié par inspection live d'une instance réelle, Accueil `2115:3892`,
pas supposé)** : centrage en cascade sur toute la hiérarchie.
- L'instance Réassurances elle-même se recentre `x: 88→89` par SON PROPRE parent
  (la pile verticale de page, également `CENTER`) — un niveau que ce geste ne touche
  jamais directement.
- `Section-header` embarqué (toujours FIXED 1552, sa propre coquille est prévue V5)
  se recentre alors `x: 0→-1` À L'INTÉRIEUR de ce parent désormais 1550-large.
- Les deux décalages s'annulent EXACTEMENT : position absolue = 89+(−1) = 88,
  identique à l'ancienne (88+0 = 88). Même calcul pour `items` (FILL) et ses 5
  `Carte` (CENTER) : 89+(−1.5) = 87.5, contre 88+(−0.5) = 87.5 avant — identique.
- Le risque nommé avant le geste (débordement de Section-header, non fixé avant V5)
  **ne se manifeste pas visuellement**, pour la même raison de cascade.

**Portée générale** : dans une hiérarchie où chaque niveau centre son enfant, un
rétrécissement symétrique ±1/∓2 se recompose exactement à travers les niveaux
imbriqués tant que le contenu terminal ne change pas de taille — la coquille est
réelle et correcte à la source, mais invisible en rendu par construction. Diffère de
Header nav (ancrage asymétrique, logo à gauche — diff réel) et SAV (translation de
groupe, pas un recentrage en cascade — diff réel).
