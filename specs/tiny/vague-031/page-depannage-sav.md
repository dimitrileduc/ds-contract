# Page « Dépannage/SAV » — 4 vues v2 montées à côté de la base (2026-09-08)

**Demande owner** : « monter les modes de la page Dépannage/SAV ; la base ici, à garder en légataire, et les modes à côté comme pour les autres pages. »
Base légataire : `2782:34543` (page « 031 · Planches de validation », 1728×4210) — **intacte**, relevé après : 4210 de haut, 7 enfants.

## Ce qui a été fait

- Version nommée avant : « 031 — avant DEMO DEPANNAGE SAV 4 vues (2026-09-08) » (id 2396747887187974315). Capture avant du cadre légataire.
- Section **2782:36219** « 031 · DEMO DEPANNAGE SAV — 4 vues (instances v2) », posée à x=-5150 / y=50120 (en face de la base, aucune superposition).
- Méthode : **clone des 4 vues « Portes d'entrée »** (la page v2 la plus proche : c'est la seule, avec Portes de garage résidentielles, à porter une FAQ), puis Reassurances et Realisations retirées, FAQ remontée juste après le Hero, contenus posés en surcharges.
- Vues : Mobile **2782:36220** (390×6356) · Tablette **2782:36694** (834×6001) · Desktop **2782:37168** (1200×4175) · Wide **2782:37669** (1728×4804).
  Cadre auto-layout vertical, gap de page **80 · 80 · 128 · 192**, Header en absolu en tête, chaque section = une instance du set v2 avec `Presentation=<mode>`.
- Ordre : Hero, FAQ, CategoriesPrincipales, Devis, AvisGoogle, TexteSEO, Footer (+ Header absolu) — l'ordre de la base.
- Sets v2 utilisés : Hero `2770:20976`, FAQ `2773:27504`, CategoriesPrincipales `2693:20242` (Style=Empile), Devis `2694:21604`, AvisGoogle `2700:28391`, TexteSEO `2768:20428`, Footer `2735:12509`, Header `2732:12096`.

## Contenus posés (relevés sur la base 2782:34543)

| Section | Contenu |
|---|---|
| Hero | « Besoin d'un **dépannage ?** » (le gras de la base reporté par plage, car la propriété TEXT du set est plate), sous-titre « Notre équipe technique intervient partout en Province de Liège pour vos réparations. », bouton « Demander de l'aide », photo `89d8a1ac…` |
| FAQ | accroche « Avant de nous appeler », titre « Nous pouvons peut-être déjà vous aider ! », 3 lignes (porte qui ne ferme plus · panne de courant, ouverte, avec son contenu · télécommande), bouton « Contactez-nous » |
| CategoriesPrincipales | 2 cartes : « Intervention rapide » (`cae46967…`, bouton « Contactez-nous ») et « Maintenance » (`3e24b06e…`, bouton « Prendre rendez-vous ») — chaque texte garde sa **première phrase en gras**, comme la base. La 3ᵉ carte du set est **masquée** (technique déjà employée sur Portes de garage : une instance ne perd pas un enfant, on le rend invisible). |
| Devis, AvisGoogle, Footer, Header | identiques à la home v2 (contenu commun, repris du clone) |
| TexteSEO | titre « Un service après-vente réactif pour vos portes et motorisations », paragraphe complet de la base, sous-titre « Assistance technique », 3 lignes (marques · N° de série, ouverte, avec son contenu · fréquence d'entretien) |

## Perte nommée, décidée par l'owner

La FAQ légataire porte **4 onglets** (Porte de garage · Porte d'entrée · Portails · Modes d'emploi PDF). Le set v2 `ds.faq` n'a pas d'onglets : en-tête + 3 lignes + bouton. **Décision owner du 2026-09-08 : on laisse tomber les onglets** dans les 4 vues, comme sur toutes les autres pages v2. Si les onglets doivent revenir, c'est une vague composant (contrat `ds.faq` 2.0.0 + set Figma + Odoo), pas une reprise de page.

## Preuve que rien d'existant n'a bougé

- Cadre légataire `2782:34543` : 4210 de haut, 7 enfants — identique avant/après.
- Comptes d'instances des sets v2, avant → après : Hero 21 → 25, CategoriesPrincipales 24 → 28, Devis 24 → 28, FAQ 10 → 14, AvisGoogle 20 → 24, TexteSEO 18 → 22, Footer 25 → 29, Header 24 → 28. **+4 partout, exactement les 4 vues neuves** — aucune instance existante déplacée ni détruite.
- Les 4 vues capturées et relues (textes, ordre, hauteurs).

## Reste à faire

- Descripteur Odoo `integrations/odoo/authoring/pages/depannage-sav.json` + composition sur le pilote, puis mesure page entière aux 4 largeurs (comme `portes-de-garage.json`).
- Promotion éventuelle de la copie légataire vers les sets v2 (captures avant, comptes, version nommée) — non demandée ici : l'owner veut la base gardée en légataire.

## Correction du 2026-09-08 — l'en-tête de la FAQ se centre au-delà de 992

L'owner a vu la mise en page sur les vues : la FAQ était le seul en-tête à gauche en Desktop/Wide alors qu'Avis Google
centre. Corrigé À LA SOURCE (set `2773:27504`), donc les 4 vues ont suivi sans être retouchées. Détail, mesure et piège :
`specs/tiny/vague-031/faq.md` § « Retour sur l'option B ». Hauteurs des vues **inchangées** (6356 / 6001 / 4175 / 4804) —
le geste était purement horizontal.
