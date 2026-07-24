# Preuve — Réassurances (T077-T078)

**Date** : 2026-07-25
**Master** : `COMPONENT_SET` `Réassurances` (`2114:3721`), variante `Disposition` (`4 cartes` /
`4 cartes · 2 CTA` / `5 cartes`) — voir `audits/reassurances.md`.
**Adoption** : 6 pages, 6 instances (industrielles `2115:3723`, Portes d'entrée `2115:3754`,
Portes de garage `2115:3794`, À Propos `2115:3830`, résidentielles `2115:3861`, Accueil
`2115:3892`), 0 copie brute restante.

## ⚠️ La preuve pixel standard N'A PAS EU LIEU — trou nommé, pas maquillé

`verdict.json` / `verdict.md` affichent **6/6 `identical`, 0 diff, exit 0**. **Ce n'est PAS
la preuve pixel standard de cette spec (raw-avant vs adopté-après), et il ne faut pas la lire
comme telle.** Elle est **dégénérée** :

- Un **fork concurrent de cette tâche** (confirmé — voir `decisions.md` et
  `audits/reassurances.md` §Incident) a **adopté les 6 pages AVANT que ma capture `before`
  ne s'exécute**. Le `before` propre de la branche fork était dans un dossier de provenance
  ambiguë (supprimé), et des `kill` de receiver par plusieurs acteurs ont détruit la ligne
  de temps du raw-avant.
- Résultat : mon `before` a capturé l'état **déjà adopté** (instances), pas les copies brutes.
  Donc `before == after` **byte-identique** — prouvé par **sha256 égal sur les 6**
  (À Propos `fcce5272417a…`, Accueil `fb26798f6862…`, Portes d'entrée `ed5f4800ca39…`,
  industrielles `2dbf35762826…`, résidentielles `4675c795886d…`, Portes de garage
  `1271624a87c8…`). Signature décisive : **À Propos porte 13 overrides** ; un vrai
  raw→adopté sur une page à 13 overrides produirait du bruit AA sous-pixel (comme toutes les
  adoptions de cette spec), **jamais** du byte-identique. Le byte-identique prouve donc
  « before == after (même état) », **pas** la fidélité raw→adopté.

La copie brute n'existe plus (remplacée) et aucun outil ne rend une image d'une version Figma
passée (R5, before-capture rule) → **ce trou est irrécupérable**, pas juste fastidieux. Il est
**nommé**, jamais présenté comme une preuve pixel réelle (même discipline que Hero/Devis cette
nuit : un écart réel n'est jamais arrondi).

## La preuve réelle — STRUCTURELLE + contenu byte-exact (plus forte qu'un diff pixel ici)

1. **bbox `{0,0,0,0}` sur les 6** : chaque instance adoptée occupe **exactement** la bounding
   box de la copie brute mesurée avant adoption (position + taille) —
   À Propos `13885,3512,1552,731` · Portes d'entrée `10029,1944,1552,755` · industrielles
   `6173,1971,1552,731` · résidentielles `4245,1944,1552,755` · Portes de garage
   `2317,1960,1552,731` · Accueil `389,3525,1552,731`. Zéro décalage de layout, zéro
   déplacement de voisin (adoption par `insertChild(idx)` dans un parent auto-layout VERTICAL).
2. **Contenu byte-exact sur les 6** : les ~100 champs de contenu (Section-header
   `Titre`/`Accroche`, chaque carte `Titre`/`Texte`/`img`, libellés de Bouton) de chaque
   instance adoptée == la source live lue **avant** adoption, **0 mismatch**. Zéro perte, zéro
   substitution silencieuse. L'espace final de Portes de garage carte0 (« Conseil personnalisé␣ »)
   est porté explicitement (ledger), pas normalisé.
3. **Bonne variante par page** : `4 cartes` (À Propos/industrielles/résidentielles),
   `4 cartes · 2 CTA` (Portes d'entrée), `5 cartes` (Portes de garage/Accueil) — cohérent avec
   le compte réel de cartes / CTA de chaque page.
4. **Un seul master** (`2114:3721`), **zéro copie brute restante**, **zéro dépendance tierce**.
5. **3 vérifications indépendantes** de l'état canvas : cette branche, l'audit de la branche
   fork, et la vérification live de l'orchestrateur.
6. **Confirmation visuelle** : capture du master (3 variantes) + capture de l'instance À Propos
   adoptée (`2115:3830`) — contenu et rendu corrects (titre, 4 cartes, images, Bouton).

**Pourquoi byte-exact > diff pixel pour « zéro perte de contenu/layout » :** un diff pixel
peut manquer une substitution de contenu qui se rend de façon similaire, et porte toujours du
bruit AA sous-pixel (d'où les écarts « acceptés » ailleurs). La comparaison de propriété
byte-exacte prouve que **chaque** valeur texte/image/variante est **exactement** la valeur
source, et bbox `{0,0,0,0}` prouve **zéro** décalage — garantie plus stricte que « ≤ X % de
pixels diffèrent ». **Mais** ce n'est pas la preuve pixel standard de la spec (raw→adopté),
réellement indisponible ici à cause de la collision — dit tel quel.

## Receipts

- Before (post-adoption, provenance nommée) : `.page-parity/reassurances/before/` (6 PNG,
  nonce receveur `02d109028565dd43`)
- After : `.page-parity/reassurances/after-final/` (6 PNG, nonce `36c196b8c356a63b`)
- Comparaison : `npm run pages:compare -- --before .page-parity/reassurances/before --after .page-parity/reassurances/after-final --out specs/003-externalize-figma-components/proofs/reassurances` → `identical — 6/6 identical (exit 0)` (dégénéré, voir ci-dessus)
- sha256 : `before == after` sur les 6 (byte-identique)
- Ledger : `ledger/reassurances.json` (27 reportee / 0 non-portable, `pages:ledger:check` exit 0)
- Checkpoints : `003/reassurances/master`, `003/reassurances/adoption`, `003/reassurances/finalize`
- Pas de crops de diff (0 diff) — la revue visuelle repose sur les captures master + instance
  ci-dessus, pas sur des triptyques de diff (inexistants ici).

## Vérification indépendante (2026-07-25, post-commit `09b1d88`) — le trou pixel est COMBLÉ par capture archivée

Le raw-avant n'était pas totalement irrécupérable : chaque run de l'instrument capture toutes les
maquettes, ce qui laisse des baselines archivées. `.page-parity/devis-fix/after/` (24 juil. 23:09,
preuve finale du fix Devis, commit `5efea53`) est la **dernière capture pré-adoption** couvrant les
6 pages — l'audit live (~00:44) lisait encore les 6 blocs en `FRAME` copie-brute, l'adoption du fork
est postérieure.

**Méthode** : pixelmatch 7.2.0, `threshold 0.1` (le seuil de l'instrument), `includeAA` défaut
(rouge = vrai diff, jaune = AA) ; `devis-fix/after` vs `reassurances/after-final`, les 6 pages
**entières**. Triptyques (avant | après | diff, empilés verticalement) + `contre-preuve-summary.json`
sous `crops/`.

| Maquette | px rouges | px AA | zone |
|---|---|---|---|
| Portes de garage industrielles | **0** | **0** | — (**byte-identique**, sha256 égal) |
| Portes de garage | **0** | **0** | — (**byte-identique**, sha256 égal ; espace final porté inclus) |
| À Propos | 76 | 479 | 1 bande de 11px : la ligne du label CTA (y4211, x772-953) |
| Accueil | 76 | 479 | idem (y4224) |
| Portes de garage résidentielles | 76 | 479 | idem (y2667) |
| Portes d'entrée | 305 | 1490 | 1 bande de 15px : les 2 labels CTA + icône PDF (y2664, x613-1113) |

**Zéro pixel rouge ailleurs sur les 6 pages entières** : aucun déplacement de bloc (pas de fantôme
rouge plein), aucun ricochet hors CTA, cartes/headers/images raster-identiques — y compris les 13
overrides d'À Propos et de résidentielles.

**Attribution de l'écart résiduel — mesurée live, pas supposée** : tous les Boutons
« Contactez-nous » adoptés rendent à leur largeur hug vraie **249px** (label 155 + 2×47 padding).
Les 4 pages qui diffèrent sont exactement celles dont la copie brute portait un **250px** figé
(À Propos, Accueil, résidentielles, Portes d'entrée) ; les 2 pages à zéro avaient déjà 249
(industrielles = ancre clonée, Portes de garage). Sur Portes d'entrée, la frame `Boutons` passe
571→570px → recentrage ~0.5px des 2 boutons (re-raster des 2 labels + icône PDF). **Écart accepté =
normalisation −1px de largeur CTA sur 4 pages** — pas du « bruit AA » pur (le bord droit bouge
réellement d'1px, liseré jaune visible dans les crops), pas une régression.

**Classes de bugs de la nuit re-vérifiées à frais (pièges 5/6)** : lecture live **séparée** des
fills de chaque vecteur de glyphe des 6 instances + des 3 variantes du master — 100 % liés
`color/noir-bleute`, résolu (0.149, 0.157, 0.173) sombre ; **zéro flip de couleur**. bbox live vs
audit : delta 0 (PdG dy −0.037px = arrondi de la référence, pas une dérive). Variante correcte 6/6,
comptes de cartes exacts, 0 copie brute restante, set 3 variantes en section.

**Limites nommées** : la fenêtre archivée (23:09→01:17) inclurait tout geste canvas tiers de
l'intervalle — attribution faite : 100 % des rouges tombent dans les 4 bandes CTA expliquées
ci-dessus, et industrielles + Portes de garage sont **byte-identiques page entière** — zéro geste
tiers sur ces pages. Les baselines archivées sont gitignorées (`.page-parity/`) ; sha256 des 6 PNG
baseline : À Propos `480e27d1af42…`, Accueil `7bfbc2066d62…`, Portes d'entrée `a331ac59c4a3…`,
industrielles `2dbf35762826…`, résidentielles `c7d91ad28fdb…`, Portes de garage `1271624a87c8…`.

**Verdict** : l'adoption Réassurances est **prouvée pixel au standard de la spec** (raw→adopté),
avec un seul écart, nommé et attribué. Les sections ci-dessus (« trou irrécupérable ») décrivent
l'état au moment du build ; cette section le met à jour — append, jamais réécrit.
