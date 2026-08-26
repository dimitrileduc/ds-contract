# Handoff — sujets différés et limites

## Enfants et surfaces en lecture seule

Le Button partagé et tous ses descendants sont restés inchangés. HeroVideo peut
placer le Button dans ses compositions, mais 028 n'autorise aucune modification
de son master, de sa variante, de sa typographie, de son padding, de ses icônes
ou de sa largeur intrinsèque.

L'instance Home 2170:6351, le Header contextuel et les Pages ont servi uniquement
de surfaces de contrôle. Les reçus first et second contiennent pageWrites=[] et
childWrites=[]. Les 102 liens d'instance et overrides comparés sont préservés.

Le défaut historique de liaison du Text Style du label CTA sur l'instance Home
reste observé, read-only et non bloquant. Il n'est ni résolu ni aggravé par 028
et doit être traité dans une spec enfant ou Page distincte s'il devient
prioritaire.

## Médias et recouvrements

Les trois compositions conservent le poster propriétaire, son IMAGE hash
8eb8b969759a5802ffb70d883409664e1169ad32, son mode FILL, son transform et les
deux voiles historiques. Les 20 empreintes IMAGE comparées sont identiques entre
after et idempotence.

Le contenu centré de Compact et Desktop recouvre une partie de la zone focale du
poster. Cette limite a été acceptée comme compromis H2 ; aucun nouveau média,
recadrage ou point focal n'a été inventé. Une demande de changement média doit
revenir devant l'owner dans un scope séparé.

## Limites Figma et dette connue

- La présentation doit être choisie explicitement ; aucun breakpoint automatique
  Figma Design n'est revendiqué.
- Les descendants générés peuvent recevoir des IDs normalisés. Les identités
  autoritatives restent le Component Set, le membre Wide historique, sa key, le
  Container et les usages inventoriés.
- Compact et Desktop portent deux overrides locaux
  pending-responsive-text-style. Aucun Text Style partagé n'a été créé ou modifié.
- Le sweep global reste honnêtement à 229/234 à cause de cinq dettes
  parity/golden préexistantes nommées dans les
  [gates complets](../proofs/runner-full-gates.md). Les quatre
  evals responsive et les deux typechecks sont verts ; cette exception ne doit
  pas être renommée full-suite-green.
- Le statut reste figma-ahead/pending-home-responsive-promotion. Il interdit de
  présenter le canvas comme une nouvelle source de vérité parallèle.

## Sujets futurs

- Comparer les primitives et métriques observées avec les autres composants de
  la Home avant toute promotion responsive globale.
- Décider la stratégie commune des Text Styles responsive à partir de plusieurs
  composants, pas du seul HeroVideo.
- Définir dans une feature transverse la sélection des compositions et la
  convergence contrat, tokens, code, HTML et Odoo.
- Traiter séparément tout besoin du CTA, du Header, de la Page ou d'un enfant
  partagé.

## Garde de régénération

La garde est active : aucune régénération Figma non coordonnée ne doit écraser
les compositions locales avant leur disposition dans la campagne Home. Le
handoff ne donne aucune autorisation d'écriture sur le contrat, les tokens
globaux, les émetteurs, React, HTML, CSS ou Odoo.
