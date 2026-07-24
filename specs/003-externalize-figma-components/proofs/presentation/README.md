# Preuve pixel — Présentation (T071-T072)

**Date** : 2026-07-24
**Résultat** : `verdict.json` / `verdict.md` — **5/9 identical, 4/9 diff, exit 1**

## Les 3 diffs qui M'APPARTIENNENT — acceptés, dans l'enveloppe déjà établie

Accueil (13px), Portes de garage (3543px), À Propos (2439px) : les 3 pages réellement touchées par
cet incrément. Grille d'audit texte complète (fontSize, lineHeight, letterSpacing, textCase, align
H/V, paragraphSpacing, fills/bindings, effects) re-vérifiée nœud par nœud après l'adoption contre
les valeurs mesurées avant remplacement — **zéro écart structurel trouvé**. Triptyques inspectés :
signature de bruit de rendu sub-pixel identique à celle déjà acceptée pour Devis-cta/Accordion-row/
Carte/Formulaire (fins contours jaunes le long des lettres, aucun mot manquant/déplacé, aucune ligne
décalée). Voir `decisions.md` pour les chiffres et l'acceptation détaillée.

## Le 4e diff (Contactez-nous, 816px) — hors périmètre, PAS de mon fait

**Ce que la mesure montre** : `Contactez-nous` (jamais touchée par cette tâche — 0 occurrence de
`Présentation` confirmée au scan avant ET après) rend un diff de 816px localisé sur la zone
« Nos coordonnées / Adresse / Horaires » (`diffBox x=1209,y=1674,w=431,h=396`).

**Pourquoi ce n'est pas nommé comme un écart de MON incrément** (honnêteté, R4/FR-016) : le sha256
de `Contactez-nous.png` avant/après diffère (`b9c55a5324f7…` → `ef9a16df2f20…`) malgré zéro geste de
ma part sur cette page. Investigation avant conclusion (jamais un diff accepté sans regarder) :

1. La zone en diff correspond exactement à une instance `2105:2968` d'un master dont les enfants
   portent les nodeIds `2104:2882` (« Nos coordonnées »), `2104:2884` (« Adresse »), `2104:2887`
   (« Horaires ») — **aucun de ces nodeIds n'a été créé par moi** (mes propres créations de cette
   session : master `2103:2824`, instances `2104:2958`/`2105:2990`/`2106:3000`).
2. Ces nodeIds tombent dans la **même fenêtre d'allocation temporelle** que mes propres instances
   (`2104:xxxx`→`2105:xxxx`, entrelacés avec les miens) — signature d'un **deuxième client connecté
   au même fichier construisant activement autre chose en parallèle**, pas d'un artefact de mon
   propre script.
3. Le contenu affiché (adresse, horaires, contact — une vraie section « Coordonnées » cohérente,
   pas du texte cassé/tronqué) est cohérent avec `T093 Master Coordonnées`, une tâche encore
   `[ ]` non cochée dans `tasks.md` au moment où j'ai commencé — quelqu'un d'autre semble l'avoir
   commencée pendant ma fenêtre de capture before/after.

**Conséquence** : ce diff est exclu de mon verdict accepté — ni chiffré ni justifié comme un écart
de CET incrément, parce qu'il n'en est structurellement pas un. Signalé à l'agent principal en
session (`SendMessage`) pour transparence, avant même de conclure cette note. Aucune action
corrective n'est de mon ressort ici : je n'ai rien cassé, je n'ai rien à réparer.

## Ce que le résultat prouve quand même

1. Les 5 pages totalement étrangères à cet incrément ET non concurremment éditées (Motorisation,
   Portes d'entrée, Dépannage/SAV, Portes de garage résidentielles, Portes de garage industrielles)
   sont **byte-identiques** avant/après (sha256 égaux) — zéro dommage collatéral de mon geste.
2. Les 2 décoys « Présentation » internes à Réalisations (Portes de garage industrielles/
   résidentielles) sont restés des `FRAME` intactes, jamais transformées en instance — le
   scope-narrowing (3 réelles, pas 5) tient à la mesure post-adoption aussi, pas seulement à
   l'audit préalable.
3. **Leçon méthodologique nommée pour la suite** : un `pages:compare` plein-9-pages pendant une
   session multi-agent peut légitimement capturer le travail EN COURS d'un autre agent sur une page
   qui n'est la cible d'AUCUN des deux incréments — ce n'est pas un défaut de l'instrument (il fait
   exactement ce qu'il doit : mesurer tout ce qui a changé), mais un rappel que « diff sur une page
   non ciblée » doit toujours être investigué avant conclusion, jamais supposé causé par son propre
   geste ni balayé comme du bruit.

## Receipt

- Before : `.page-parity/presentation/before/` (transport `b-fetch`, nonce receveur
  `c99f5a1d5820c5c0`, 9/9 statut `ok`)
- After : `.page-parity/presentation/after/` (transport `b-fetch`, nonce receveur
  `8cccc0024daaf65d`, 9/9 statut `ok`)
- Comparaison : `npm run pages:compare -- --before .page-parity/presentation/before --after .page-parity/presentation/after --out specs/003-externalize-figma-components/proofs/presentation`
- Sortie : `diff — 5/9 identical, 4 diff, 0 capture-failed, 0 dimension-mismatch (exit 1)`
