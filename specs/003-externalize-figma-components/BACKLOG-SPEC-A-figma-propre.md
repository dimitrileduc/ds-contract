# Spec A — Figma propre + finitions

100 % canvas, preuve pixel (même méthode que la 003). **Prérequis de la Spec B** :
on n'extrait rien vers du code tant que les calques mentent.
Audits de référence : `audits/bonnes-pratiques-{atomes,molecules,organisms}.md`.

**Hors périmètre (décision owner)** : refacto Header nav (seul son padding 88→89
reste — bug validé) ; tout changement de design (contrastes, taille Checkbox, scrim).

## Règles

1. **3×** — se répète ≥ 3 fois → token/variable ; sinon on laisse. Typo ET couleurs.
2. **Jamais de fix design** — valeur nouvelle répétée → on AJOUTE la variable ;
   on ne « normalise » jamais la maquette.
3. **Zéro dégradation non signalée** (sauf fix design explicitement assumé).
4. **Naming d'abord** — les noms de calques deviennent les identifiants du code
   généré (receipt : Spec B, D4) → nettoyage ici, avant toute extraction.

## Tâches globales

| # | Tâche |
|---|---|
| G1 | **Text styles** : créer le style 54 (titres Hero, 8×) ; assigner un style à chaque texte dont le gabarit se répète ≥ 3× (~0 stylé aujourd'hui) |
| G2 | **Naming calques** : renommer les génériques (`Vector`, `Frame 8`, `Group 6/7`, `Text`) et les noms tirés du contenu (titre Hero « Portes de garage industrielles » ×8) |
| G3 | **Descriptions** : 14 masters (3 atomes Assets · 8 molécules · 3 organisms) |
| G4 | **Coquille 89px** : 5 masters restés à 88 — mécanisme différent chacun, jamais en bloc (D1) |
| G5 | **Couleurs — passe 3×** (plus tard) : `#000` Accordion Grand, fond Devis (à revérifier), `#E0E0E0` Réalisation |

## Par niveau

**Atomes (Assets — Figma seul, pas de contrat)**

| Tâche | Note |
|---|---|
| piqueray_logo : renommer axe `Property 1`, description | |
| member-picture : renommer axe `Property 1`, description ; trancher `hover` (axe d'état nommé ou variant retiré) | |
| 18 icônes : nommer les enfants | script ~5 min ; racine des ~69 « Vector/Group » du lint |

*(Bouton → Spec B : son axe et ses valeurs sont dans le contrat `ds.button`.)*

**Molécules**

| Tâche | Note |
|---|---|
| Tab : supprimer le variant fantôme `État3` ; décider le soulignement de `Défaut` | l'axe État ne change rien — fidèle à la source (9/9 identical) : distinguer l'actif = fix design à assumer |
| Product-card : bouton caché → prop BOOLEAN officielle ou retrait | la « leçon Button » |
| Accordion-row : lier bordure Petit à `color/noir-bleute` | zéro pixel ; `#000` Grand → G5 |
| Footer-column + Copyright : textes `#FFF` → `color/blanc` | zéro pixel |
| Section-header : 1550 vs 1552 entre variants → 1550 | géométrie réelle → capture avant/après |
| Review-card : net-new + adoption Avis Google | source = screenshot aplati widget tiers (T053/T054 reportés) |

**Organisms**

| Tâche | Note |
|---|---|
| Footer : reconstruire — auto-layout, instancier Facebook/Instagram, renommages | seul master « à l'ancienne » ; cumule G4 ; vérifier d'abord l'état réel des 9 pages |
| Section-header gouverné dans les 6 masters au titre fait main (Présentation, SAV, Hero, Texte SEO, Coordonnées, Formulaire) | 6 endroits au lieu d'1 aujourd'hui |
| Réalisations : renommer calque interne « Présentation » (collision) ; « Presentation » → « Présentation » | |
| Hero Accueil : nouveau composant SÉPARÉ (hero vidéo) | périmètre à préciser : vidéo+titre+CTA seul, ou fusion avec Catégories ? |

## Preuve & cadence (owner, 2026-07-25)

- **Instrument** : page-parity existant — capture 9 pages avant/après, score par page
  (diffCount + diffBox) + crops triptyque, sauvés dans `proofs/`.
- **Diff attendu par tâche** (le verdict devient mécanique) :
  renames/descriptions/liaisons/text styles → **0 pixel** (9/9 identical, sinon STOP) ;
  coquille 89px → bande ~1px aux bords des sections touchées ; Section-header → ~2px
  sur Avec CTA ; Tab Défaut → visible sur Dépannage/SAV seulement (fix design assumé,
  validation sur crop).
- **Cadence** : les tâches zéro-pixel groupées en **lots = 1 cycle capture/preuve par
  lot** (pas par composant) ; seules les tâches géométriques (coquille, Section-header,
  Footer, Tab) ont chacune leur cycle. ~6-8 cycles au lieu des ~30 de la 003.
- **Archive** : avant chaque geste destructif (Footer rebuild, Tab État3), cloner
  l'ancien master sur une page `Archive · Spec A` (vecteurs conservés, pas juste des
  pixels), supprimée en fin de spec. Pas d'archive pour le zéro-pixel — les checkpoints
  natifs suffisent (une version passée permet de recopier un élément précis).

## Décisions ouvertes (owner)

- **Section-layout** : 4 candidats mesurés — Avis+SEO+Footer (7/9), Devis+Réassurances
  (6/9), Hero+Catégories (6/9), Réass+Réal+FAQ (3/9). Avis : à construire.
- **Template pleine page** : 1 seul cluster 100 % (3/9) → reporter (décision Odoo).
- **Périmètre Hero Accueil**.

---

## Détails

### D1 · Coquille 89px

89 = mesuré sur le vrai contenu (`audits/categories-principales.md:33`,
`audits/hero.md:64`). 88 = hypothèse de brief jamais corrigée.

| Master | Geste | Piège |
|---|---|---|
| Header nav `84:285` | padL/R 88→89 (2 variantes) | aucun |
| Footer `2120:4785` | Copyright x 88→89 ; Separator x 88→89, w 1552→1550 | Row déjà à 89 |
| SAV `2108:3105` | w 1552→1550 | ⚠ enfant GROUP : ne suit pas le resize → convertir/repositionner d'abord |
| Réassurances `2114:3721` ×3 | w 1552→1550 | vérifier le piège GROUP par variante |
| Devis `2096:2524` | Container x 88→89, w 1552→1550 | revérifier le recentrage |

Exclus (corrects ou mécanisme différent) : Texte SEO, FAQ, Équipe, Réalisations,
Hero, Produits (1596), Formulaire (1550), Présentation (HUG), Catégories.

### D2 · Tailles de police

| Taille | Occ. | Décision |
|---|---|---|
| 54 | 8× | ajouter la variable/style 54 |
| 44 | 1× | on laisse |
| 40/32/24/20/18/16/14 | 36-146× | styles existants ✓ |
| 48 | 0× | style jamais utilisé — info |

### D3 · Molécules — les 3 🔴 (vérifiés live 2026-07-25)

- **Tab `2061:1588`** : 3 variants identiques (souligné 2px partout) ; `État3` doublon.
- **Product-card `2068:1972`** : Bouton `visible:false`, `propRefs:{}` vide.
- **Accordion-row `2059:1417`** : Grand `#000` (hors palette), Petit `#26282C`
  (= noir-bleute, non lié). Se propage à FAQ + Texte SEO — corriger ici cascade.

### D4 · Déjà fait (session 2026-07-25)

- `DS · Sections` → `DS · Organisms` + 14 masters déplacés (0 instance cassée).
- 3 liaisons `color/blanc` zéro-pixel : Separator Footer, Titre Devis, 2 Vector
  Catégories (checkpoint `2380080569764428014`).
- Hero 8 pages clos (décalage validé owner sur crops = text rendering).
- Coquille : 1ʳᵉ tentative stoppée avant écriture, canvas intact (piège SAV/GROUP).
- Checkbox jamais construit (source sans case — divergence nommée).

### D5 · Pièges Figma

- `resize()` sur enfant d'instance : sans effet silencieux → top-level puis FILL.
- Un enfant GROUP ne suit jamais le resize du parent (SAV).
- Rejouer les props d'un Bouton réinitialise l'override couleur du glyphe → relier APRÈS.
- `setBoundVariableForPaint` : relire séparément (le retour peut mentir).
- `figma.currentPage =` interdit → `setCurrentPageAsync`.
- Bridge : `fetch()` localhost 9223-9232 uniquement (hors plage = échec silencieux).
- Before-capture sur TOUTES les pages affectées, jamais un pilote.
