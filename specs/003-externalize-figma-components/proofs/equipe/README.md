# Preuve — Équipe (T087-T088)

**Date** : 2026-07-25
**Master** : `COMPONENT` `Équipe` (`2115:3947`), plain (aucune variante) — voir `audits/equipe.md`.
**Adoption** : 1 page (À Propos), 1 instance `2115:4044` (idx 2), 0 copie brute restante.

## Verdict pixel — 1/1 identical, byte-identique (raw→adopté LÉGITIME)

`verdict.json` / `verdict.md` : **1/1 `identical`, 0 diff, exit 0** (À Propos, seule maquette
concernée). Et **sha256 `before == after`** :

```
before  fcce5272417a4ca55c73bd1d20eb691b79acdb191945c33a0d8b46d769f34771  À Propos.png (1728×5928)
after   fcce5272417a4ca55c73bd1d20eb691b79acdb191945c33a0d8b46d769f34771  À Propos.png (1728×5928)
```

### Ce byte-identique est-il dégénéré comme Réassurances ? NON — vérifié.

Réassurances était dégénéré parce qu'un fork avait adopté **avant** la capture `before` (donc
`before` = état déjà adopté). **Ici c'est un vrai before(raw)→after(adopté)** :

- Le `before` a été capturé alors que le raw `Équipe` (`258:1928`) était **présent** — vérifié
  live juste avant la capture (`rawStillPresent:true`, idx 2), avant toute mutation (avant même
  la construction du master).
- Puis : construction du master (ne touche pas À Propos), checkpoint pré-adoption (raw encore
  présent idx 2, bbox `{13797,992,1728,1886}` enregistré), adoption (raw retiré, instance
  insérée idx 2), puis `after`.
- Timeline (timestamps du pont) : before-capture `…082` < build master `…142` < adoption `…253`
  < after-capture `…287`. Le `before` précède strictement la mutation.

### Pourquoi 0 diff (et pas du bruit AA) — le mécanisme, pas un arrondi

Sur **cette même maquette**, l'adoption Member-card (T050) avait produit ~4163 px de bruit AA. La
différence tient au périmètre réel du remplacement :

- Le raw `Équipe` était **déjà** un wrapper auto-layout (`FRAME` HORIZONTAL padding 89 → `grid`
  GRID 4×4) contenant **16 Member-cards DÉJÀ gouvernées** (`remote:false`, T050 fait).
- L'externalisation remplace `[wrapper FRAME + grid FRAME]` par `[instance Équipe]` **au même
  bbox** (`delta {0,0,0,0}`), avec les **mêmes 16 instances Member-card** aux **mêmes positions
  GRID**, mêmes photos, mêmes textes.
- Scène-graphe rendu **strictement identique** ⇒ `exportAsync` déterministe ⇒ PNG byte-identique.
  Il n'y a **rien de vraiment brut** à re-rastériser (le bruit AA de Member-card venait du
  remplacement de copies *hand-made* brutes ; ce niveau-là a déjà été payé en T050).

Corroboration indépendante : le sha `fcce5272417a` d'À Propos est **stable depuis le travail
Réassurances** (leur README liste le même sha pour le `before` À Propos). Mon adoption Équipe a
donc bougé **zéro pixel** sur toute la maquette — cohérent avec un swap renderable-invariant.

## La preuve structurelle (corrobore le pixel)

1. **bbox `{0,0,0,0}`** : instance `2115:4044` à `{x:13797, y:992, w:1728, h:1886}` = exactement
   le raw mesuré avant adoption.
2. **Contenu byte-exact** : les 16 `Nom`/`Poste` de l'instance == la source live lue avant
   adoption (13 réels + 3 `Prénom/Poste`), **0 mismatch**, ordre de grille identique.
3. **Gouvernance** : 16 Member-cards `remote:false` (master `2074:2072`), **0 remote / 0 tierce**
   dans tout le sous-arbre ; À Propos redevenue 9 enfants, raw disparu.
4. **Master unique** (`uniqueMasterCount=1`), 0 copie brute restante.
5. **Confirmation visuelle** : capture du master (4×4, 16 photos + noms + postes corrects, 13
   réels + 3 placeholders).

## Receipts

- Before (raw, provenance vérifiée) : `.page-parity/equipe/before/` (1 PNG, nonce receveur
  `3226875c08e9f9ee`, capturé raw présent)
- After : `.page-parity/equipe/after/` (1 PNG, nonce `d08e0b9f324050b3`, capturé post-adoption)
- Comparaison : `npm run pages:compare -- --before .page-parity/equipe/before --after
  .page-parity/equipe/after --out specs/003-externalize-figma-components/proofs/equipe`
  → `identical — 1/1 identical (exit 0)`
- Ledger : `ledger/equipe.json` (**vide explicite** 0/0, `pages:ledger:check` exit 0) — l'unique
  instance porte, par construction du master (cloné depuis cette occurrence), le contenu exact de
  la source ; 0 override à l'adoption.
- Checkpoints : `003/equipe/pre-master` (`2379927240486025877`), `003/equipe/pre-adoption`
  (`2379926917866820646`), `003/equipe/adoption` (`2379926269825387412`)
- Pas de crops (0 diff) — la revue visuelle repose sur la capture du master (rendu conforme),
  pas sur des triptyques de diff (inexistants ici).
