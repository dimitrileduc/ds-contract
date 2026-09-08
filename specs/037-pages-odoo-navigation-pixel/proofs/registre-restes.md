# Registre des restes — spec 037

Date : **2026-09-08**. Ce qui n'est pas fini s'écrit ici. Rien de « à peu près fini » n'est laissé implicite (SC-009).
Chaque ligne est typée (data-model §9), nomme sa page ou son mécanisme, et dit la décision attendue.

---

## 1. `destination-non-tranchée` — 16 boutons ou cartes sans adresse

Ces boutons EXISTENT dans les blocs et gardent `href="#"`. **Aucune adresse n'a été inventée.**
Sortie vive : `npm run odoo:pages:check -- --json`.

**Le 2026-09-08, trois adresses ont été trouvées et posées** (fiche Google, Facebook, Instagram) : le registre est
passé de **66 restes à 16**, et cinq pages n'en ont plus aucun.

| Part | Occurrences | Pages | Décision attendue |
|---|---|---|---|
| `produit-card` | 9 | home, motorisation | l'adresse de chaque produit — **la boutique n'existe pas encore** (owner, 2026-09-08). Attente assumée, pas un oubli. |
| `root-bouton-conteneur` | 2 | home, motorisation | idem, second bouton de la section produits — **pas encore de boutique**. |
| `root-entete-bouton` | 2 | home, motorisation | l'adresse de la boutique (bouton « Voir les produits ») — **pas encore de boutique**. |
| `reassurances-cta` | 2 | home, portes-de-garage | l'adresse du CTA de Réassurances là où la disposition l'affiche |
| `hero-cta` | 1 | contactez-nous | l'adresse du CTA du hero de Contactez-nous — la vue ne la dit pas, et le module n'a aucune ancre `#formulaire` |

Les adresses externes autorisées sont dans `integrations/odoo/authoring/commun/destinations-externes.json` —
**trois** au 2026-09-08. Toute autre `https://` est refusée par la grammaire.

**Écart relevé au passage** : le site actuel `piqueray.be` pointe vers `instagram.com/piqueraysprl` (l'ancienne
dénomination SPRL) alors que le compte vivant est `@piqueraysrl` — « Piqueray - Portes ». C'est le second qui est posé ;
à confirmer par l'owner.

**Limite dite** : Google ne donne pas d'adresse par AVIS. Les cinq « Lire la suite » mènent donc à la page d'avis de la
fiche, pas à l'avis précis.
---

## 2. `commun-figé-par-page` — Odoo ne propage rien

Une page composée est du **HTML figé**. Corriger `commun/devis.json`, `commun/reassurances.json` ou
`commun/avis-google.json` ne change **aucune page** tant que celles-ci n'ont pas été reconstruites :

```bash
for p in home portes-de-garage portes-residentielles portes-industrielles portes-entree \
         motorisation depannage-sav a-propos contactez-nous; do
  npm run odoo:page -- $p <projet-docker>
done
```
Prouvé le 2026-09-08 : `proofs/propagation-du-commun.md`.

---

## 3. `vue-manquante` — aucune

Les 36 vues Figma ont été exportées et comparées. **Zéro rapport `impossible`.**

---

## 4. `écart-au-dessus-du-seuil` — le score au pixel dépasse 5 %

| Page | Largeur | Score | Cause dominante |
|---|---|---|---|
| home | 390 | **15.59 %** | la carte de Réassurances rend 30 px plus court qu'en vue |
| home | 1200 | **7.19 %** | la carte de Réassurances rend 30 px plus court qu'en vue |
| portes-de-garage | 1200 | **6.67 %** | la carte de Réassurances rend 30 px plus court qu'en vue |
| portes-residentielles | 1200 | **5.54 %** | le sur-titre VIDE de la FAQ coûte quand même son écart de 16 px |
| portes-industrielles | 390 | **5.44 %** | résidu de rendu du texte, aucune section au-dessus de la tolérance |
| portes-industrielles | 1200 | **6.75 %** | le sur-titre VIDE de la FAQ coûte quand même son écart de 16 px |
| portes-entree | 390 | **10.38 %** | la section Réalisations rend plus court qu'en vue sur Portes d'entrée |
| portes-entree | 834 | **7.25 %** | la section Réalisations rend plus court qu'en vue sur Portes d'entrée |
| portes-entree | 1200 | **5.19 %** | la section Réalisations rend plus court qu'en vue sur Portes d'entrée |
| portes-entree | 1728 | **7.68 %** | la section Réalisations rend plus court qu'en vue sur Portes d'entrée |
| motorisation | 1200 | **19.12 %** | les trois cartes de Catégories rendent 51 px plus court qu'en vue à 1200 |
| a-propos | 390 | **8.29 %** | la section Avis Google rend 8 à 10 px plus haut qu'en vue |
| a-propos | 834 | **6.63 %** | la section Avis Google rend 8 à 10 px plus haut qu'en vue |
| a-propos | 1200 | **10.92 %** | la carte de Réassurances rend 30 px plus court qu'en vue |
| a-propos | 1728 | **7.13 %** | la section Avis Google rend 8 à 10 px plus haut qu'en vue |

**15 lignes.** Chacune porte sa cause dans son rapport (`cause` + `justification`), et **aucune n'est corrigée
en touchant un contrat, un jeton ou un bloc** (SC-010). La décision — corriger le bloc dans une vague suivante,
corriger la source, ou acquitter l'écart — appartient à l'owner et n'est pas prise ici.

---

## 5. `hauteur-rouge` — |Δh| dépasse 10 px (ligne DISTINCTE de la précédente)

Un écart de hauteur n'est pas un « écart au-dessus du seuil » : celui-là parle du score au pixel. Sans cette
ligne, une page au pixel vert mais 60 px trop courte n'aurait nulle part où s'écrire.

| Page | Largeur | Δh | Section d'origine | Décision attendue |
|---|---|---|---|---|
| home | 390 | **-122 px** | `s_pqr_reassurances` | la carte de Réassurances rend 30 px plus court qu'en vue |
| home | 834 | **-20 px** | `s_pqr_reassurances` | la carte de Réassurances rend 30 px plus court qu'en vue |
| home | 1200 | **-58 px** | `s_pqr_reassurances` | la carte de Réassurances rend 30 px plus court qu'en vue |
| home | 1728 | **-49 px** | `s_pqr_reassurances` | la carte de Réassurances rend 30 px plus court qu'en vue |
| portes-de-garage | 1200 | **-58 px** | `s_pqr_reassurances` | la carte de Réassurances rend 30 px plus court qu'en vue |
| portes-residentielles | 390 | **+18 px** | `s_pqr_google_reviews_section` | la section Avis Google rend 8 à 10 px plus haut qu'en vue |
| portes-residentielles | 834 | **+17 px** | `s_pqr_google_reviews_section` | la section Avis Google rend 8 à 10 px plus haut qu'en vue |
| portes-residentielles | 1200 | **+11 px** | `s_pqr_google_reviews_section` | le sur-titre VIDE de la FAQ coûte quand même son écart de 16 px |
| portes-residentielles | 1728 | **+24 px** | `s_pqr_faq` | le sur-titre VIDE de la FAQ coûte quand même son écart de 16 px |
| portes-industrielles | 390 | **+34 px** | `s_pqr_google_reviews_section` | résidu de rendu du texte, aucune section au-dessus de la tolérance |
| portes-industrielles | 1728 | **+16 px** | `s_pqr_faq` | le sur-titre VIDE de la FAQ coûte quand même son écart de 16 px |
| portes-entree | 390 | **-32 px** | `s_pqr_realisations` | la section Réalisations rend plus court qu'en vue sur Portes d'entrée |
| portes-entree | 1200 | **+13 px** | `s_pqr_realisations` | la section Réalisations rend plus court qu'en vue sur Portes d'entrée |
| portes-entree | 1728 | **-25 px** | `s_pqr_realisations` | la section Réalisations rend plus court qu'en vue sur Portes d'entrée |
| motorisation | 1200 | **-52 px** | `s_pqr_categories_principales` | les trois cartes de Catégories rendent 51 px plus court qu'en vue à 1200 |
| a-propos | 1200 | **-58 px** | `s_pqr_reassurances` | la carte de Réassurances rend 30 px plus court qu'en vue |

**16 lignes.** L'accueil est rouge sur la hauteur aux **quatre** largeurs, comme le prévoyait la spec — mais
le signe a changé depuis le relevé du 2026-09-04 (+128 +118 +34 +70 alors, −122 −20 −58 −49 aujourd'hui) : les
vues v2 ont vécu entre-temps, et la vague 031 a corrigé la page. Le fait est daté, pas reconduit.

---

## 6. `écart-de-source` — la vue dit quelque chose qu'on n'a pas corrigé dans la page

Règle FR-018 : un écart de copie se corrige **à la source**, jamais dans la page. Il est donc porté tel quel,
et écrit ici.

| Page | Fait | Décision attendue |
|---|---|---|
| home | Le titre du Devis porte un U+2028 (séparateur de ligne) dans la vue v2 ; la page rend un <br/>. Écart de source, à trancher côté Figma. | à trancher côté Figma |
| portes-de-garage | Double espace dans le titre du hero (« Hörmann :  l'alliance ») — présent dans la source, porté tel quel. | à trancher côté Figma |
| portes-de-garage | Le titre du Devis porte un U+2028 dans la vue v2. | à trancher côté Figma |
| portes-residentielles | Les réponses des rangées FERMÉES (FAQ et Texte SEO) n'existent nulle part dans la vue : elles restent VIDES plutôt qu'inventées. | à trancher côté Figma |
| portes-residentielles | La 3ᵉ rangée de la FAQ est MASQUÉE dans la vue ; la page suit la vue et ne la porte pas. | à trancher côté Figma |
| portes-industrielles | Les plages de gras du paragraphe Texte SEO sont INVERSÉES dans la vue (le liant est en gras, les termes clés ne le sont pas) — portées telles quelles. | à trancher côté Figma |
| portes-industrielles | La 5ᵉ carte de Réassurances et la 3ᵉ carte de Catégories sont masquées dans la vue ; la page suit la vue. | à trancher côté Figma |
| portes-entree | Le titre des Réassurances de cette vue dit « nos portes de garage industrielles » — copie recopiée d'une autre page. Porté tel quel, à corriger à la source. | à trancher côté Figma |
| portes-entree | Le paragraphe des Réalisations est masqué dans la vue ; la page suit la vue. | à trancher côté Figma |
| motorisation | Le titre du hero de cette vue est en graisse Regular alors que le contrat `typography.h1.weight` est SemiBold. La page rend le CONTRAT ; l'écart est du côté de la source. | à trancher côté Figma |
| a-propos | Le titre du hero de cette vue est en graisse Regular alors que le contrat est SemiBold. | à trancher côté Figma |
| a-propos | Les 16 photos de SURVOL de cette vue sont DISTINCTES, alors que celles du set l'étaient toutes identiques (défaut nommé en 035). Les portraits livrés ici restent ceux de 035 : à reprendre. | à trancher côté Figma |
| a-propos | Section Équipe : le dessin du set la donne à 2652 px en Desktop (fait de source, nommé en 035). | à trancher côté Figma |
| contactez-nous | Le formulaire v2 n'a ni champ Adresse ni champ Sujet, ni les deux boutons « Appeler pour une urgence » / « Voir la FAQ » que porte la base v1 (D13). Vague composant, pas reprise de page. | à trancher côté Figma |
| contactez-nous | Le CTA du hero n'a pas de destination : la vue ne dit pas où il mène. | à trancher côté Figma |

---

## 6bis. Ce que la LECTURE DES TRIPTYQUES a corrigé (2026-09-08, après la campagne)

Les scores avaient été attribués sans avoir regardé les images. C'est exactement le défaut que `docs/16` nomme
(« avant d'annoncer un %, REGARDE le triptyque »). La lecture a changé deux attributions sur trois pages :

| Page | Ce qui avait été dit | Ce que l'image montre |
|---|---|---|
| **Accueil** | « la carte de Réassurances rend 30 px plus court » | **La VUE porte la copie des portes INDUSTRIELLES** : titre « Pourquoi choisir nos portes de garage industrielles ? » et les cinq arguments industriels. La page rend la copie de l'accueil corrigée le 2026-09-07. **Les photos sont les mêmes des deux côtés : l'écart est du TEXTE.** Vérifié au pont sur les vues 1200 et 1728. Même défaut de copier-coller que sur la vue Portes d'entrée. **Correction à la source, la page ne bouge pas.** |
| **À propos** — *CORRIGÉ le 2026-09-08* | « résidu de rendu du texte » | **Notre section Équipe ne suivait pas la vue** : dès la première rangée les portraits divergent (page : Cécilia, Florian, Sandra Magermans, Arnaud Dahmen ; vue : Cécilia, Florian, puis deux autres). La section fait 1891 px et occupe le tiers de la page. **Cause de NOTRE côté** : le contenu Équipe a été repris du banc de la vague 035 au lieu d'être relevé sur la vue À Propos. **Corrigé** : les 16 membres suivent désormais l'ordre de la vue. Les portraits n'ont pas changé — la vue et la planche de base portent les mêmes photos, appariées aux mêmes personnes, seul l'ordre différait. La page passe de 8,29 / 6,63 / 10,92 / 7,13 % à **3,47 / 2,07 / 6,50 / 1,53 %**. |
| **Portes de garage** | « conforme » | Confirmé à l'image : même titre, mêmes cinq cartes, mêmes photos, même mise en page ; le volet de différence est quasi blanc — seulement le lissage du texte. C'est la référence de ce qu'une page conforme donne. |

**La carte de Réassurances 30 px plus courte reste vraie et mesurée** — c'est la cause de l'écart de HAUTEUR, sur
toutes les pages qui portent le bloc. Ce qui était faux, c'est d'en faire la cause du score au PIXEL de l'accueil.

---

## 6quater. LA CAUSE DES ROUGES DE 1200 — trois lectures successives, la troisième est la bonne

| Lecture | Ce qui était dit | Pourquoi c'était faux |
|---|---|---|
| 1 — depuis le tableau des sections | « la carte de Réassurances rend 30 px plus court » | vrai comme constat, muet sur la cause |
| 2 — depuis le triptyque seul | « il manque 30 px de blanc sous le texte » | déduit d'une image, jamais mesuré |
| 3 — **mesurée au pont** | **la maquette FIGE la hauteur de rangée à 561 px au 1200** | c'est celle-ci qui tient |

Relevé sur cinq vues : au 1200, la grille des Réassurances porte `gridRowSizes: [FIXED 561, FIXED 561]` — une hauteur
de rangée **écrite en dur**, identique sur toutes les pages, quel que soit le contenu.

| Page (1200) | Ce que le contenu demande | Ce que la maquette impose | Vide imposé |
|---|---|---|---|
| À Propos | 531 px | 561 px | **30 px** |
| Portes résidentielles | 558 px | 561 px | 3 px |
| Accueil | 561 px | 561 px | 0 (mais un TITRE y passe à 2 lignes côté maquette) |

Aux largeurs **390 et 834 il n'y a pas de grille du tout** (rangée flex, colonne flex) — et nos pages y sont vertes.

**Nos cartes sont justes.** Vérifié polices chargées : nos cinq blocs de texte mesurent 54/81/81/54/81 px, exactement
comme la maquette. Le texte se coupe au même endroit ; police, corps, interligne et approche sont identiques.

**Décision recommandée : corriger la SOURCE, pas le composant.** Reproduire la maquette voudrait dire figer 561 px de
rangée dans le CSS — ce qui casserait au premier texte modifié. Il faut retirer la hauteur fixe de la grille au 1200 et
la laisser suivre son contenu.

*Piège de méthode payé ici : la première mesure de nos cartes a été faite **sans attendre le chargement des polices**.
Le texte était alors mesuré avec la police de secours et tenait sur 2 lignes au lieu de 3 — la carte paraissait 27 px
plus courte qu'elle n'est. C'est exactement le piège que `docs/16` nomme.*

---

## 6ter. Décisions owner prises le 2026-09-08

| Sujet | Décision |
|---|---|
| Carte Réassurances 30 px plus courte | Décision prise **sur une explication fausse** (« il manque 30 px de blanc sous le texte »). La mesure au pont montre que c'est la MAQUETTE qui fige la rangée à 561 px au 1200, au-dessus de son propre contenu. **À re-trancher** : la correction appartient à la source, pas au composant. |
| Ordre de l'Équipe d'À propos | Repris depuis la vue. **Fait.** |
| Photos de survol de l'Équipe | Les seize de la vue sont distinctes et n'ont pas pu être exportées : **les dix ports que le plugin autorise étaient tous pris**, dont un par une autre session travaillant précisément sur les photos de survol. À reprendre quand un port se libère. |

---

## 7. `limite-moteur` — ce qu'Odoo ne sait pas faire, mesuré

| Code | Fait | Conséquence |
|---|---|---|
| `ODOO-LIMIT-MENU-PARENT-HREF` | Odoo force `url = '#'` sur une entrée de menu **qui a des enfants** (mesuré sur base fraîche ET mise à jour) | « Portes de garage » ne mène pas à `/portes-de-garage` |
| `ODOO-LIMIT-MENU-PARENT-ACTIF` | `website.menu._is_active()` exige « URL qui correspond **et** pas d'enfants » | « Portes de garage » n'est jamais soulignée sur sa propre page |
| `ODOO-SOCIAL-NON-CONFIGURE` | ~~`/website/social/*` répondaient **404**~~ — **RÉSOLU le 2026-09-08** : les deux comptes sont renseignés sur le site, la route répond 303 vers l'adresse. | à reporter sur toute nouvelle instance : c'est un réglage de site, pas du code |

---

## 8. `défaut-de-composeur` — trouvé en mesurant, antérieur à cette vague

| Fait | Mesure | Décision attendue |
|---|---|---|
| `compose_page.py::img_url` crée une **nouvelle `ir.attachment` à chaque composition**, sans jamais chercher si la même existe | **286 → 399** pièces jointes `pqr_*` après une seule reconstruction complète (**+113**) | réutiliser la pièce jointe de même nom et même empreinte — une ligne dans `img_url`, mais une autre décision que celle-ci |
| L'instabilité de capture du hero vidéo | 2 px à 834, 183 px à 1728, soit **0,0017 %** — reproductible en forme, invisible aux verdicts | rien à faire ; nommé pour que personne ne le rediagnostique |
| Le compte exact de pixels d'une capture n'est pas reproductible | 12 à 19 unités sur 1,9 million entre deux lancements de navigateur | le déterminisme porte sur `scorePct` et `ecartHauteurPx`, pas sur le compte brut — corrigé dans le schéma |

---

## 9. `validation-owner` — les neuf pages sont EN ATTENTE

**Aucune des neuf pages n'est validée à ce jour.** Les liens éditeur et le tableau des verdicts sont dans
`proofs/validations-owner.md`. Le pilote 8087 n'a pas pu être utilisé : il est levé par un autre worktree et
sert les addons de celui-ci — la validation est proposée sur `piqueray-odoo-037` (8109), qui porte exactement
le module et les pages de ce commit.

