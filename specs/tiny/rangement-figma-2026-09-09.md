# Rangement du fichier Figma — 2026-09-09 (session « rangement », owner : « propre de chez propre »)

## Le résultat

Fichier `Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`), versions nommées « Avant rangement Figma — 2026-09-09 »
(`2397187073396592869`) et « Après rangement Figma — 2026-09-09 » (`2397189477497651266`).

| Page | Après |
|---|---|
| `DS · Tokens` | inchangée |
| `DS · Atomes` | 9 sections : Bouton, PiquerayLogo, MemberPicture, Notation, Input, Textarea, Select, Checkbox, Icônes (19 du registre) |
| `DS · Molécules` | 18 sections, une par contrat molécule, témoins existants conservés (AccordionRow ×4, Carte ×4, CarteCategorie ×12, ReviewCard) |
| `DS · Organisms` | 18 sections, ordre de lecture d'une page ; **témoins 4 modes** (Mobile 390 / Tablette 834 / Desktop 1200 / Wide 1728) posés pour chaque set à axe `Presentation` (Hero et Coordonnees les avaient déjà ; MenuMobile n'a que 2 modes) |
| `Pages` (ex-`031 · Planches de validation`) | 9 sections = une par page du site : 4 vues v2 à gauche (390 → 1728), **base v1 figée à droite** ; l'accueil porte deux bases (« Base v1 · Accueil » = ex-`Base 00.` et « … (photo hero d'origine) » = ex-`Base - NE PAS TOUCHER`, identiques au pixel sauf la photo du hero) |
| `Utilities` | `Slot` (recréée, voir incident) |
| `Pages - legacy`, `----------------------` | supprimées |

Section = « Nom du master — ds.identifiant ». Noms de master inchangés sauf le suffixe « · candidat v2 » retiré
(Input, Textarea, Select, Field, Avantage). Descriptions « candidat / provisoire / non validé » réécrites sur
AccordionRow, Hero, TexteSEO, FAQ, Realisations, Equipe (aucune description portant une clause gouvernée « † » /
« runtime slot » touchée).

## Ce qui est parti

- 31 masters sans contrat (Input/Textarea/Select v1, Field v1, AccordionRow v1, Carte v1, Carte/Categorie, ProductCard v1,
  Avantage v1, Review-card v1, CarteCategorie 023, Section Avis Google, Style=Icône seule, Etoile vide, et les 17 organismes v1)
  et leurs 27 sections ; les sections `029 · H2 …` (archive de 28 tests) ; `PiquerayLogo — Generated test`.
- 53 brouillons sur les planches (textes « proposition à valider », « instance de test », « note d'audit », les 3 croquis
  du formulaire, les options A/B/C du sous-menu, la refonte carte produit, le rectangle de fond, 2 instances égarées).
- Les 457 instances des 10 bases v1 ont été **détachées** (8 bases pointaient des composants d'un AUTRE fichier —
  ancien Bouton « Property 1=… », icônes cil/lucide/mynaui/tabler — et « Portes d'entrée » les masters v1) :
  **10/10 bases identiques au pixel** avant/après.

## La preuve (`.page-parity/rangement/`, gitignoré)

- Avant : 150 captures (95 masters, 36 vues, 10 cadres legacy, 9 bases), toutes vérifiées sur disque (taille, dimensions).
- Après : 99 captures (63 masters, 36 vues) + 10 bases. **85 identiques au pixel, 13 sous 0,004 % (bruit d'anticrénelage,
  max 0,0034 % sur Dépannage/SAV mobile), 1 écart de largeur d'arrondi (FooterColumn 311 → 310)**.
- Porte « orphelins » sur tout le fichier : 5 392 instances, **0 sans master, 0 dont le master vit dans un autre fichier**,
  **64 masters = les 63 gouvernés (44 contrats + 19 icônes) + Slot**, rien d'autre.
- Contrats : 44 ancres (identifiant + clé) identiques avant/après — déplacer un master conserve les deux.
- `npm run parity` (cliché rafraîchi par le pont : 94 → 63 sets, 31 disparus, 0 nouveau) : **« No new drift — 14 acknowledged »**,
  aucun acquittement neuf. `npm run odoo:figma-links:check` : **23 panneaux à jour**.
- Odoo : zéro fichier touché. Dépôt : 4 fichiers (`parity/snapshots/figma-{components,tokens}.json`,
  `extract/figma/photo-parity/photos-census.js` — page cherchée par NOM « Pages » et plus par l'identifiant `210:325` —,
  `extract/figma/page-parity/README.md`). Re-pin : zéro.

## Incidents et pièges

- **Deux pages ont disparu pendant le travail sans qu'aucun de mes scripts ne les touche** : `Utilities` (et son `Slot`
  gouverné) et `031 · 27 · PLAN DU SITE — pied de page (2026-09-09)`, cette dernière créée à 11h19 par une AUTRE session
  active sur le même fichier. Fenêtre : entre 11h21 et 11h26, où mes appels ne faisaient qu'exporter des PNG. `Slot`
  (`2323:10987`, clé `78b3db61…`) était encore vivant sans page : page `Utilities` recréée, nœud remis dessus, même
  identifiant, même clé. Cause non établie (pas de `FIGMA_TOKEN` pour lire les auteurs de l'historique).
- `exportAsync` d'un nœud posé DANS une section rend 1×1 sans `useAbsoluteBounds: true` (piège A6 de docs/16) —
  12 masters ré-exportés ainsi.
- `getInstancesAsync` reste périmé dans la MÊME exécution après un `remove()` : la purge itérative refusait des masters
  dont les hôtes venaient d'être supprimés ; une exécution fraîche les voyait à zéro. Les sections legacy ont été
  supprimées en bloc avec leurs masters ; la porte « orphelins » a validé après coup (0).
- Un enfant de SECTION a des coordonnées RELATIVES à la section (sondé) ; déplacer la section déplace ses enfants,
  la redimensionner non. Un `appendChild` garde l'ancienne valeur x/y : toujours reposer x/y après.
- Les dix ports 9223-9232 étaient pris ; libéré le 9229 (receveur gauntlet mort depuis 6 jours). Le receveur assainit
  les noms de fichiers (`:` → `_`).
- Le master `Bouton` garde son nom (le contrat dit « Button ») : `parity/diff.ts` cherche le set `Bouton` PAR NOM pour
  l'axe icônes. Ne jamais renommer un master sans grep préalable du nom dans `parity/`.

## Reste ouvert

- L'owner choisit laquelle des deux bases d'accueil garder (seule la photo du hero diffère) — les deux sont dans `Pages › Accueil`.
- Les masters `Tab` et `SectionHeader` restent ancrés par contrat mais ne sont plus utilisés nulle part sur le canevas.
- Le sujet visual-parity `button-with-icons` pointe une instance `237:1500` qui n'existait déjà plus avant ce rangement
  (statut `figma-declined` dans la baseline) : à repointer sur une instance v2.
- Qui a supprimé `Utilities` et `031 · 27` reste à établir avec l'autre session.
