# Portes finales — campagne 021

Date : 2026-08-10. Résultat global : **vert**, code de sortie `0`.

Commande exécutée depuis le worktree :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Résultats vivants :

- build : 231 custom properties, 34 composants, 8 assets Odoo et rapport de dérivation de 16
  blocs (`293c3e7c5d5f193f9af41f0fe659b110e4f7324744450fed3eb83e39e2a1b2ca`);
- parity : aucun nouveau drift; les 3 findings historiques déjà reconnus restent nommés;
- eval : **213/213** passés; 48 cas legacy restent explicitement en quarantaine;
- plugin : bundle frais de 627081 octets, 108 entrées, hash d'entrée `b6881e2cf6f0…`; tous les
  flux disponibles passent et les 3 formes absentes sont nommées `SKIPPED`;
- round-trip : `ds.google-reviews` byte-identique sur deux compilations, 5 instances imbriquées,
  boucle contract→canvas→contract→code verte;
- core browser : bundle 11,94 MB brut / 5,25 MB minifié; les quatre emitters s'exécutent sans
  global Node;
- `tsc --noEmit` et `tsc -p tsconfig.build.json` : codes de sortie 0, aucune sortie d'erreur.

Les evals 021 nommées sont toutes incluses dans ce sweep : campagne, lowering absolu, réparation
directe, proportions d'image, forwarding composé, swaps d'icônes, impacts, idempotence et reçus.
