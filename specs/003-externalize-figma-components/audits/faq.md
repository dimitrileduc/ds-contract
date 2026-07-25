# Audit — Section FAQ (T083)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — 4 occurrences désignées par id (brief de
délégation), **re-vérifiées live avant construction** (structure récursive complète,
`componentProperties`, texte par plage, `getMainComponentAsync` sur chaque instance
descendante) — les ids transmis restaient valides, la mesure live fait foi.

## Usage — localisation (4 occurrences, 4 maquettes)

| Maquette | nodeId `FAQ` | Bounds | Lignes accordion |
|---|---|---|---|
| Portes d'entrée | `237:1081` | 1728×384 | 2 (Fermé, Ouvert) |
| Portes de garage industrielles | `387:803` | 1728×448 | 3 (Fermé, Ouvert, Fermé) |
| Portes de garage résidentielles | `234:676` | 1728×384 | 2 (Fermé, Ouvert) |
| Dépannage/SAV | `249:1609` (dans le composite `Hero et FAQ`, `249:1512`) | 1728×586 | 3 (Fermé, Ouvert, Fermé) — **+ 4 Tab au-dessus, hors périmètre** |

Confirmé par le scan T0 (`inventory/scan-2026-07-23.json`, clé `faq`) : **seules 3
occurrences y sont classées « faq »** (Portes d'entrée / industrielles /
résidentielles, `signature: "frame[frame,frame,instance]"`) — Dépannage/SAV est
scannée séparément sous le composite `Hero et FAQ` (`dag.md` ligne 45-46 le note déjà :
« FAQ (section) ×4 — 3 directes — la 4e est dans le composite »). Ce n'est pas un oubli
du scan, c'est une classification cohérente avec ce que la structure live confirme
ci-dessous.

## Structure — les 3 occurrences « matching »

Identique sur les 3 : frame `FAQ` (`VERTICAL`, `itemSpacing` 48, padding `[0,89,0,89]`,
`primaryAxisSizingMode: AUTO`/`layoutSizingVertical: HUG` — la hauteur suit le
contenu) → 3 enfants directs :

1. **Section-header** (déjà une instance gouvernée, T063-T064, `mainId 2090:2385`,
   `Disposition=Standard`) — **contenu identique sur les 3** : `Accroche="FAQ"`,
   `Titre="Questions fréquentes"`. Hauteur figée à 50px (le piège déjà documenté à
   l'audit Section-header pour les 3 occurrences FAQ — ces instances le portent déjà
   correctement, rien à refaire ici).
2. **accordion** (`FRAME` `VERTICAL`, `itemSpacing` 0, zéro fill/bordure — wrapper de
   pure disposition, même famille que `tabs`/`row`(Field)/`accordion`(T067), pas de
   master séparé) → N instances **Accordion-row** (`Taille=Grand`, déjà gouvernées
   T041-T042) — **contenu réel, différent par page** (vraies paires question/réponse),
   toujours dans le motif Fermé (Q1) → Ouvert (Q2) → [Fermé (Q3), si présente].
3. **Bouton** (déjà une instance gouvernée, `mainId 28:114`, `componentSetId 6:122`,
   `Property 1=Outilne noir`) — **config identique sur les 3** : `Libellé="Contactez-nous"`,
   `Icône gauche=false` (masquée), `Icône droite=true` (flèche visible).

**Conséquence** : au niveau des molécules déjà gouvernées, les 3 occurrences sont
**100% instances** — rien de « brut » sous ce niveau. Le seul élément non gouverné est
le **wrapper `FAQ` lui-même** (la frame qui assemble les 3 pièces avec son padding/
gap propre) — c'est ce wrapper qui devient le master, exactement comme `Devis`
(Container) ou `Formulaire` (frame `row`) l'ont été.

## Compte de lignes — 2 sites à 2, 1 site à 3 (jamais plus)

| Maquette | Q1 (Fermé) | Q2 (Ouvert) | Q3 (Fermé) |
|---|---|---|---|
| Portes d'entrée | « Quelle est la différence entre une porte en acier et en alluminium ? » | « Peut-on motoriser une ancienne porte ? » | — |
| Portes de garage industrielles | « Nos portes répondent-elles aux normes des bâtiments publics ? » | « Quels types de bardages peuvent être intégrés sur les portes ? » | « Assurez-vous la maintenance après l'installation ? » |
| Portes de garage résidentielles | « Quelle est la différence entre une porte sectionnelle et basculante ? » | « Peut-on motoriser une ancienne porte ? » | — |

## Piège Figma trouvé — retirer un enfant d'une instance placée est refusé par l'API

Le compte de lignes variant (2 vs 3), la première approche envisagée était : master à
3 lignes (le maximum mesuré), puis **retirer** la 3e sur les instances à 2 lignes après
placement. **Testé sur un composant jetable avant toute construction réelle** (2
instances imbriquées, tentative de `secondChild.remove()` sur l'instance placée) :

```
errorMsg: "in remove: Removing this node is not allowed"
```

**Refusé par l'API Figma** — un enfant structurel hérité du master ne peut pas être
retiré d'une instance placée (cohérent avec le fait qu'on ne peut pas non plus en
**ajouter** un qui n'existe pas dans le master — même famille de restriction,
non testée séparément par symétrie logique mais cohérente avec tout ce qui est
documenté ailleurs sur le modèle d'override des instances Figma).

**Solution retenue et vérifiée bout en bout** (même composant jetable, nettoyé après
coup) : propriété **BOOLÉENNE officielle** sur le master, liée à la visibilité de la
3e ligne via `componentPropertyReferences = { visible: propId }` — mécanisme déjà
établi ailleurs dans cette spec (`Icône gauche`/`Icône droite` du Bouton, CTA
par défaut invisible de Product-card) donc pas un nouveau pattern, juste sa première
application à un enfant entier plutôt qu'à une icône. Vérifié : `setProperties({
'Ligne 3#…': false })` sur une instance placée → 3e ligne `.visible=false`, ET la
hauteur du wrapper `accordion` (auto-layout `HUG`) recalcule automatiquement
248px→184px, propageant jusqu'à la hauteur totale du wrapper `FAQ` (448px→384px) —
**exactement** la hauteur des 2 sites à 2 lignes, confirmé avant toute utilisation
réelle. Nommé ici comme piège réutilisable pour la suite du programme (toute section à
venir avec un nombre de lignes/cartes variable rencontrera la même contrainte).

## Cas Dépannage/SAV — composite `Hero et FAQ`, exclu du périmètre du master

Structure réelle : frame `FAQ` (`249:1609`, `VERTICAL`, `itemSpacing` **64** —
différent des 48 des 3 autres) → `Section-header` (top-level) + `wrapper` (`251:1813`,
`VERTICAL`, `itemSpacing` 32) contenant `tabs` (`249:1613`, 4 instances **Tab**, déjà
gouvernées T043-T044) puis `accordion` (3 lignes) + `Bouton` (top-level).

Les 3 pièces gouvernées (Section-header `2093:2404`, les 3 Accordion-row, Bouton
`249:1622`) sont **déjà des instances** ici aussi — rien de brut en dessous du niveau
molécule, exactement comme les 3 autres sites. Mais le wrapper lui-même **ne
correspond pas** au gabarit simple du master (nesting supplémentaire pour loger
`tabs`, gap différent) — et le brief de délégation est explicite : ne pas
recomposer/fusionner les Tab dans FAQ, ne pas construire de slot onglets dans le
master.

**Décision** : cette occurrence **ne reçoit pas d'instance du master FAQ**. Il n'y a
structurellement rien à y remplacer (ses 3 pièces sont déjà gouvernées
individuellement) — forcer une instance unique demanderait soit d'ajouter les onglets
au master (refusé par le brief), soit une chirurgie d'extraction des `tabs` hors de
`wrapper` pour les replacer en sibling (risque de ricochet sur un parent auto-layout,
non justifié pour un gain nul : rien de brut n'y serait réellement gouverné de plus).
Capturée avant/après comme les 3 autres par prudence (avant-capture rule) pour
prouver par la mesure qu'aucun ricochet n'a eu lieu sur les Tab voisins, mais aucune
mutation n'y est prévue. `wrapper` (`251:1813`) est un `FRAME` `VERTICAL`
(`layoutMode`), pas un `GROUP` — le risque d'origine-dynamique (leçon Section-header/
Avis Google) ne s'applique pas ici, mais la prudence reste de mise puisque c'est un
auto-layout partagé.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `FAQ` (nom natif du layer source, pas de renommage) |
| Type | `COMPONENT` (pas de `COMPONENT_SET` — aucun état/variant réel, juste une propriété booléenne pour le nombre de lignes) |
| Source du clone | Portes de garage industrielles (`387:803`, le site à 3 lignes — le maximum mesuré, pour que seule la voie « retirer via visibilité » soit nécessaire, jamais « ajouter ») |
| Propriétés | `Ligne 3` (BOOLÉEN, défaut `true`) — montre/masque la 3e ligne d'accordion |
| Structure | `FAQ` (1728×448, `VERTICAL`, gap 48, padding `[0,89,0,89]`, `HUG` vertical) → Section-header instance (50h, Standard, contenu par défaut « FAQ »/« Questions fréquentes ») → `accordion` (`FRAME`, 3× Accordion-row instance : Fermé/Ouvert/Fermé) → Bouton instance (Outilne noir, « Contactez-nous ») |
| Dépendances | Section-header (`2090:2385`), Accordion-row Fermé (`2059:1373`)/Ouvert (`2059:1405`), chevron-down (`226:373`)/chevron-up (`226:374`), Bouton (`28:114`/set `6:122`) — **10 instances descendantes vérifiées une à une, `remote: false` partout, zéro dépendance tierce** |
| Page | `DS · Molécules`, nouvelle section `FAQ` (`2104:2913`, position `(0, 6626)` — sous `Présentation`, placée par un agent concurrent, re-vérifié live juste avant), marge interne 40/60/40/40 (gauche/haut/droite/bas — même convention que Devis/Formulaire) |
| nodeId | `COMPONENT` `2104:2914` ; section `2104:2913` ; propriété `Ligne 3#2104:59` |

**Vérifié bout en bout avant adoption** (instance jetable, hors canevas, supprimée
après vérif) : hauteur par défaut 448×1728 (identique à la source) ; `Ligne 3=false` →
384px (identique aux 2 sites à 2 lignes) ; `Ligne 3=true` → retour à 448px ; override
texte sur une ligne d'accordion nichée (`setProperties` sur la propriété `Titre` de
l'instance Accordion-row) confirmé fonctionnel.

## Point de vigilance noté, pas encore tranché — largeur Bouton 249 vs 250px

Le Bouton source mesure 249px de large sur Portes de garage industrielles (mon clone),
mais 250px sur les 3 autres sites (Dépannage/SAV, Portes d'entrée, Portes de garage
résidentielles) — même config (`Libellé`/icônes identiques), donc le hug du Bouton
**devrait** produire la même largeur partout. Écart d'1px, cause non investiguée à ce
stade (dérive historique probable d'un ancien resize manuel sur une des pages, pas un
effet de ma construction — mesuré AVANT tout geste). Laissé nommé ici plutôt que
« corrigé » sans preuve ; si la preuve pixel de l'adoption révèle un écart localisé sur
le Bouton, il sera investigué à ce moment-là (jamais accepté sur un chiffre agrégé
seul, grille d'audit déjà établie cette spec).
