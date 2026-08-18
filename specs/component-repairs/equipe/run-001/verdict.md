# Équipe — rapport de réparation

Verdict : **vert techniquement, en attente de validation visuelle owner**.

## Avant

- master unique conservé : `2115:3947`, key `786b6f6634939b2081530949058eddf071b22ab1` ;
- le root avait reçu `GRID` par erreur tandis que l'enfant `grid` restait en wrap horizontal ;
- sept colonnes de 219,43 px puis deux cartes de 500 px ;
- portraits fixes à 364 px et débordants ;
- `Nom` et `Poste` n'étaient plus liés à leurs Text Styles ;
- une instance Page existante : `2115:4044`, jamais éditée directement.

## Après

- un seul Container local `2453:4732`, contenant le master historique lui-même ;
- root et grille Fill, sans gutter externe suivant la décision owner ;
- enfant `grid` en Grid Figma natif 4 × 4, colonnes `1fr`, lignes HUG, gaps 32 × 32 ;
- cartes Fill : 408 px à 1728 et 336 px à 1440 ;
- `MemberPicture` Fill et carré ; `MemberCard` garde sa hauteur automatique ;
- ordre visuel restauré en déplaçant les instances avec leurs portraits ;
- `Nom → Titre 3`, `Poste → Titre 6` ;
- 32 IMAGE paints dans le master et 32 dans la Page avant/après chaque application ;
- zéro débordement texte mesuré à 1440 ; zéro écriture directe Page.

## Incident intercepté

Le premier essai écrivait les anciens noms de propriétés Grid puis fournissait
une `value` aux lignes HUG. Figma les a normalisées en lignes FIXED de 1 px. Le
reçu et la capture ont bloqué cet état. L'émetteur utilise désormais les vrais
champs `gridColumnSizes` / `gridRowSizes`; une ligne HUG est émise sans valeur.

## Preuves

- état source récupérable : `refs/codex/backups/equipe-grid-ready-20260811` ;
- captures avant : `before/equipe-master.png`, `before/equipe-page.png` ;
- captures après : `after/equipe-master.png`, `after/equipe-page.png`, `after/equipe-1440.png` ;
- second patch in-place : `skipped: unchanged`, zéro création/modification ;
- script officiel `figma-sync/14-equipe.js` : `skipped: unchanged`, même id/key ;
- deux générations successives byte-identiques ;
- typecheck, fixture Grid, invariants des émetteurs et plugin engine verts.

Les fichiers Odoo modifiés en parallèle sont hors de ce périmètre.
