# Interface — le cycle de preuve d'un lot mutant (016)

Réutilise `extract/figma/page-parity/` **tel quel** (instrument de 003, durci par 005/007 — receveur santé+nonce, capture b-fetch, comparateur exit 0/1/2). Seule nouveauté : le périmètre de capture inclut les pages DS des masters touchés en plus des 9 maquettes de `Pages` (une édition de master se propage aux instances).

## Le cycle (ordre obligatoire, par lot)

```text
0. étalonnage (1× par chantier)  capture ×2 sans geste → npm run pages:compare : N/N identical, sinon RIEN ne commence
1. version enregistrée           figma_execute bridge/checkpoint.js — label "016/<lot>/<étape>"      → versionId consigné
2. relevé de structure VIF       bridge/scan.js par POSITION (fichier vivant — jamais un relevé périmé)
3. annonce ÉCRITE                proofs/<lot>/annonce.md : écart attendu PAR CIBLE, avant toute écriture
4. capture AVANT — TOUTES cibles receiver.mjs <out> 9227 (health {instrument:"page-parity"} + nonce pinné) + bridge/capture.js
5. vérification des PNG          non vides, dimensions attendues → sinon STOP, zéro écriture (§X)
6. LE(S) GESTE(S)                figma_execute — scripts transcrits dans proofs/<lot>/gestes.md
7. capture APRÈS                 même receveur, même nonce, même transport
8. verdict                       npm run pages:compare -- --before … --after … --out proofs/<lot>/
9. clôture du lot                decisions.md : annonce ⟷ observé ⟷ verdict ⟷ versionId
```

## Sémantique du verdict

- `conforme` : chaque diff observé est couvert par l'annonce (y compris « identique » quand c'est l'attendu — ex. U1a : une variable créée ne peint rien, donc tout pixel qui bouge est par construction un écart imprévu). **« Identique » ne se présume jamais** : pour DW-002, les cartes rétrécissent de 0,5 px chacune et le débordement de 2 px s'éteint — l'annonce chiffre l'écart depuis le relevé vif, elle ne le déclare pas nul.
- Tout écart **hors annonce** ⇒ le lot est **annulé en entier** : restauration **manuelle guidée** par l'historique de versions natif (aucune API programmatique — vérifié 2026-07-23), re-capture, re-preuve contre les captures d'avant, cause identifiée par écrit AVANT toute reprise. Jamais de requalification après coup en « bruit acceptable ».
- Deux captures d'étalonnage qui diffèrent sans geste ⇒ l'instrument bruite ⇒ arrêt avant la première écriture.

## Préconditions matérielles (chaque fenêtre)

Figma desktop, fichier `d9FYAUcqdcNtsuaMgLefvJ` ouvert, pont figma-console identifié (`figma_get_status`, port 9223), `figma.loadAllPagesAsync()` avant tout accès à la page `Pages` (210:325), receveur 9227 démarré pour la session avec nonce relevé. Fenêtres planifiées avec l'owner ; écrivain unique (§XI satisfait par construction — pas de parallélisme sur le fichier client).
