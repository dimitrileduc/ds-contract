# Page « Contactez-nous » — 4 vues v2 montées à côté de la base (2026-09-08)

**Demande owner** : « https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/…?node-id=2782-44493 est la base content copy,
mais le design est bien nos components v2. Monte, je valide. »
Base légataire : `2782:44493` (page « 031 · Planches de validation », 1728×3901, 7 enfants) — **intacte**, relevé après : 1728×3901, 7 enfants.

**Pourquoi maintenant** : le relevé REST de la page 031 fait pour la spec 037 (2026-09-08) n'a trouvé que **sept** sections
« 4 vues (instances v2) » plus les quatre vues home — Contactez-nous n'en avait pas, contrairement à la clarification
de la spec (« les neuf pages ont leurs quatre vues »). L'owner a tranché : monter les vues tout de suite, sur la base.

## Ce qui a été fait

- Version nommée avant : « 031 — avant DEMO CONTACTEZ-NOUS 4 vues (2026-09-08) » (id 2396800891417055477). Capture avant de la base.
- Section **2782:46963** « 031 · DEMO CONTACTEZ-NOUS — 4 vues (instances v2) », x=-5150 / y=82770 (en face de la base, aucun chevauchement — vérifié contre les 44 enfants de la page).
- Méthode : **clone des 4 vues « Dépannage/SAV »** (la page v2 dont l'ordre est le plus proche : Hero en tête, AvisGoogle › TexteSEO › Footer en pied), puis FAQ, CategoriesPrincipales et Devis retirées, et **deux instances neuves** insérées après le Hero : **Formulaire v2** (set `2782:38403`, candidat option A) et **Coordonnees v2** (set `2778:34448`), chacune dans son mode `Presentation=<mode>`, FILL en largeur, HUG en hauteur.
- Vues : Mobile **2782:46964** (390×6730) · Tablette **2782:47477** (834×5729) · Desktop **2782:47992** (1200×4063) · Wide **2782:48534** (1728×4343).
  Ordre : Hero, Formulaire, Coordonnees, AvisGoogle, TexteSEO, Footer (+ Header absolu) — l'ordre de la base (« Footer + Devis » de la base = le Footer v2, sans Devis).
- **Formulaire v2 sort de sa boîte pour la première fois** : le set était à **0 instance** avant aujourd'hui (Coordonnees en avait 4, dans sa propre planche).

## Contenus posés (relevés sur la base 2782:44493)

| Section | Contenu |
|---|---|
| Hero | « Discutons **de votre** projet » (gras 9-19 reporté par plage), sous-titre « Nous intervenons pour l'installation et le dépannage **dans toute la province de Liège** : Verviers, Liège, Eupen, Spa, Malmedy, Huy, Waremme... » (gras 53-84), bouton « Contactez-nous », photo `3bd66aa5…` (la conseillère au bureau — reposée sur le plan `Background` du Hero v2) |
| Formulaire | **contenu du set = celui de la base** : accroche « Une demande de devis ? Une réparation ? », titre « Prenez contact avec nous dès maintenant ! », 4 avantages (Conseils personnalisés · Produits de qualité · Dépannage et SAV · Expérience et savoir-faire) et leurs textes, champs Prénom / Nom / Email / Téléphone / Message, consentement, « Envoyer » — aucune surcharge nécessaire |
| Coordonnees | **contenu du set = celui de la base** : « Contact » / « Nos coordonnées », adresse, horaires, contact, « Suivez-nous », plan Google — aucune surcharge |
| AvisGoogle, Footer, Header | communs, repris du clone (identiques à la home v2) |
| TexteSEO | « Visitez notre **showroom à Pepinster** ou contactez-nous » (gras 14-34), paragraphe complet de la base avec ses **6 plages en gras**, sous-titre « Infos pratiques », 3 lignes : Accès et parking (fermée) · Faut-il prendre rendez-vous ? (**ouverte**, contenu de la base, « prise de rendez-vous » en gras) · Zones de déplacement pour devis (fermée) |

## Écarts base (v1) → vues (v2), nommés — aucun n'est un défaut de la vue

1. **Le formulaire v2 n'a ni le champ « Adresse » ni le champ « Sujet » (liste « Demande de devis ») de la base**, ni les deux
   boutons « Appeler pour une urgence » / « Voir la FAQ » sous les avantages. C'est le dessin du set candidat (option A,
   spec 036) : la base en avait, le set non. Même règle que les onglets de la FAQ (page Dépannage/SAV) : si ces champs
   doivent revenir, c'est une vague composant (`ds.formulaire`), pas une reprise de page. **À trancher par l'owner.**
2. Le titre du Hero prend la graisse du set v2 dans chaque mode (le set pose sa propre graisse de base par écran ; la base
   v1 était Regular/Bold partout). Les plages en gras de la base sont reportées telles quelles.
3. Mêmes normalisations que les autres pages v2 : « Google » en SVG, « Voir tous les avis », auteurs abrégés.

## Preuve que rien d'existant n'a bougé

- Vues Dépannage/SAV clonées : 390×6356 · 834×6001 · 1200×4175 · 1728×4804, 8 enfants chacune — identiques avant/après.
- Base `2782:44493` : 1728×3901, 7 enfants — identique.
- Comptes d'instances des sets, avant → après : Hero 33 → 37, **Formulaire 0 → 4**, Coordonnees 4 → 8, AvisGoogle 32 → 36,
  TexteSEO 30 → 34, Footer 37 → 41, Header 36 → 40. **+4 partout, exactement les 4 vues neuves.**
- Les 4 vues capturées (wide, mobile) et relues (ordre, hauteurs, plage en gras du titre, hash de la photo du hero).

## Validation

- **Validées par l'owner le 2026-09-08** (« c ok »), en session, sur les captures wide et mobile. L'écart 1 reste à trancher
  (il ne bloque ni la composition ni la mesure : la page Odoo suit le set, comme les vues).
- Relevé complémentaire : le titre du Hero v2 est **SemiBold** dans les 4 modes du set (`typography.h1.weight` du contrat) ;
  Contactez-nous et Portes de garage suivent le set, mais les vues **Motorisation** et **À Propos** portent une surcharge
  **Regular** sur ce titre (héritée de leur base v1). Écart de source à trancher par l'owner — consigné pour la spec 037 (FR-018).

## Reste à faire

- Décision owner sur l'écart 1 (champs Adresse / Sujet et les deux boutons du formulaire de la base).
- Descripteur Odoo `integrations/odoo/authoring/pages/contactez-nous.json` + composition sur le pilote, puis mesure page
  entière aux 4 largeurs — dans la spec 037.
