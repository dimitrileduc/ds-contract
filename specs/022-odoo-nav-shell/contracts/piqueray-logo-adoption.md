# Contrat d'interface — adoption `ds.piqueray-logo` 0.1.0 (draft) → 1.0.0

L'adoption est une **revue**, pas une réécriture : l'API et l'anatomie proposées par
l'extraction sont confirmées telles quelles ou la divergence est traitée AVANT adoption.

## 1. Delta du fichier

| # | Édition |
|---|---|
| 1 | `"status": "draft"` — **retiré** |
| 2 | `version`: `0.1.0` → `1.0.0` |
| 3 | `description` réécrite sur le patron des contrats adoptés : « Piqueray logo. Extracted from the Figma COMPONENT_SET on DS · …, reviewed and adopted — not authored. » (mention des deux variantes Couleur et de l'usage encre claire sur surface sombre) |
| 4 | `"category": "atom"` — **ajouté en revue post-phase (2026-08-20)** : seul contrat sur 36 sans catégorie, la story tombait dans le fallback `Components/` au lieu d'`Atoms/`. Chevauche le bump d'adoption, pas de bump dédié (précédent : Button 004, `category` porté dans le minor 1.4.0→1.5.0) |

**NE CHANGENT PAS** : `props.couleur` (`default|blanc`, VARIANT `Default|Blanc`), anatomie
(`Marque` vectorAsset `{color.orange}` ; `Wordmark` vectorAsset `{color.bleu}` +
`tokensByProp couleur=blanc → {color.blanc}`), jetons racine (`{size.logo.width/height}`),
ancres (fileKey `d9FYAUcqdcNtsuaMgLefvJ`, set `da9ca0f5…`, node `4:14`), ancre code
(`src/components/PiquerayLogo`).

## 2. Liste de revue (chaque point coché avec son reçu dans le commit d'adoption)

- [x] Bindings VARIANT exacts contre le dump (4:13 `Couleur=Default`, 4:15 `Couleur=Blanc` —
      déclaration 013 `header.composition.piqueray-logo`/`…-couleur-figee`).
- [x] Assets présents et propres : `assets/vectors/piqueray-logo-{marque,wordmark}.svg`
      (géométrie intrinsèque = celle du `vectorAsset` du contrat).
- [x] Jetons référencés existants (`color.orange`, `color.bleu`, `color.blanc`,
      `size.logo.width`, `size.logo.height`) — un binding vers un jeton inexistant casse le build.
- [ ] `npm run parity` : axe canvas du composant propre (snapshot rafraîchi en LECTURE si périmé —
      research D16).
- [ ] La composition depuis `ds.header@2.0.0` (props figées `couleur: "blanc"` — mono-variante)
      rend **marque orange + wordmark blanc** dans la vitrine du header.

## 3. Limites reconnues à l'adoption (nommées, non bloquantes)

- Sémantique/a11y : le contrat ne porte ni rôle d'image ni nom accessible — sur la surface
  livrée, le QWeb du header pose le logo comme lien d'accueil avec nom accessible (zone manuelle
  comptée) ; côté React le fait reste ouvert, hérité de l'extraction, différé nommément.
- `vectorAsset.width/height/position` en nombres bruts : géométrie intrinsèque d'asset, canal
  prévu par le schéma (v18) — PAS des littéraux de style ; aucun jeton à minter.

## 4. Critère de sortie

`ds.piqueray-logo@1.0.0` re-épinglé partout où il est consommé : fermeture de `ds.header`
(lock 019 après repin), golden/engine.receipt re-épinglés par leurs scripts, catalogue régénéré.
