# T052 — répétition mainteneur distinct

**Date :** 2026-08-26  
**Mode :** lecture seule, sans écriture Figma  
**Verdict final :** PASS

## Parcours rejoué

Un mainteneur distinct a commencé par quickstart.md, puis a suivi les liens vers
le ledger, les trois documents de handoff, la preuve de correction de phase 4 et
les artefacts run-005 nécessaires. Il a vérifié les identités, les hashes, les
snapshots Git, les deux reçus, les trois capture sets et les contrôles responsive
sans contexte oral.

Le premier passage de revue a rendu BLOCKED pour deux ambiguïtés documentaires :
quickstart.md dirigeait encore finalize vers run-003 et la campagne run-005
portait runId run-003. La correction a :

- explicité la lignée run-003 installation, run-004 refus et run-005 correction
  canonique ;
- interdit le rejeu des sections historiques sur la source actuelle ;
- dirigé H4 et finalize vers run-005 uniquement ;
- aligné campaignId, runId, workflow et artifactRoots de la campagne canonique ;
- corrigé les liens relatifs du handoff et borné les claims de largeur aux points
  effectivement testés.

Le mainteneur a ensuite rejoué l'intégralité du parcours et rendu PASS.

## Faits retrouvés sans aide orale

- Container 2448:4731 ; Component Set 2580:7392 en layoutMode NONE, FILL dans
  le Container et Presentation=Wide par défaut.
- Compact 2580:7378 à 390 px FIXED, Desktop 2580:7385 à 1200 px FIXED et Wide
  historique 2151:5552 à 1728 px FIXED, avec key publique préservée.
- Sélection explicite de Compact à 320/390/834 et en paysage court, Desktop à
  1200, Wide à 1440/1728.
- 19 scénarios sur default, long-title, long-cta et short-landscape ; 19/19
  passent après le premier passage et après le second.
- 13 bindings attachés et deux overrides locaux pending-responsive-text-style.
- Reçu canonique first : zéro création, quatre roots attendus modifiés,
  pageWrites=[] et childWrites=[].
- Reçu canonique second : opération no-op, zéro création/modification,
  pageWrites=[] et childWrites=[].
- 17/17 artefacts, 20/20 empreintes IMAGE et 102/102 liens/overrides préservés.
- 19 paires de PNG, soit 38 captures, présentes avec hashes first/second
  identiques à ceux du ledger.
- Les deux refs de snapshots Git se résolvent vers les commits, arbres et parents
  déclarés.

## Commandes et contrôles read-only

- pwd, git branch --show-current, git status --short et git worktree list
  --porcelain ;
- lecture ciblée avec sed et inventaire avec rg ;
- requêtes jq sur le ledger, les campagnes, les reçus et les verifies ;
- shasum -a 256 sur gates, preuves, manifestes et captures ;
- git rev-parse et git show sur les refs de backup ;
- validation d'existence des artifactRoots et des liens Markdown.

Aucun fichier ni nœud Figma n'a été modifié par le mainteneur distinct.

## États volontairement ouverts

- H4 reste pending-owner-review. Le verdict de clôture du ledger reste blocked
  jusqu'à une décision owner explicite après présentation du dossier.
- Le sweep global reste 229/234 avec cinq dettes parity/golden préexistantes
  nommées. Ce statut n'est pas présenté comme full-suite-green.
