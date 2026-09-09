# Audit de conformité WCAG 2.2 — page « Contactez-nous »

## Périmètre

`http://localhost:8109/contactez-nous` · WCAG 2.2 **A et AA** (55 critères) · 1440, 640
(zoom 200 %), 390, 320 · 2026-09-09 · `@a11y-skills/audit` + mesures maison au pixel.
Pas de vidéo : batterie directe, **11 vérifications, 0 erreur**.

**C'est la seule page du site avec un formulaire.** Elle active donc huit critères que les
huit autres pages n'ont jamais déclenchés — et c'est la raison d'auditer chaque page plutôt
qu'un échantillon.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 25 | 2 | 2 | 3 |
| AA | 14 | 2 | 3 | 2 |
| **Total** | **39** | **4** | **5** | **5** |

**39 conformes sur 43 critères testés — 91 %.**
Le score est le même que les autres pages, mais **sur une base bien plus large** : 43
critères applicables ici contre 35 ailleurs, parce que le formulaire en active huit de plus.

## Le formulaire est le meilleur élément du site

Il passe **tous** les critères qu'il active, et de loin :

| Critère | Constat mesuré |
|---|---|
| **3.3.2 Étiquettes** (A) | Les 5 champs ont une étiquette liée. Aucun placeholder utilisé en guise d'étiquette. |
| **1.3.5 Identifier l'objet de la saisie** (AA) | `autocomplete` correct sur 4 champs : `given-name`, `family-name`, `email`, `tel`. C'est rare et c'est bien fait. |
| **3.3.1 Identification des erreurs** (A) | Envoi à vide : 2 champs passent en `aria-invalid="true"`, un résumé s'affiche en tête (« Votre message n'a pas pu être envoyé »), chaque champ porte son message. |
| **3.3.3 Suggestion après une erreur** (AA) | Les messages disent quoi faire, pas seulement que c'est faux : « Saisissez votre adresse e-mail pour que nous puissions vous répondre ». |
| **4.1.3 Messages d'état** (AA) | `aria-describedby` relie chaque champ à son message ; le résumé porte `role`. |
| **2.1.1 Clavier** (A) | Le bouton d'envoi est un vrai `<button type="submit">` depuis ce matin : la barre d'espace l'active, vérifié par un envoi réel. |

**Un point d'ergonomie, hors critère** : après un envoi refusé, le focus reste sur le bouton
au lieu d'aller au premier champ en erreur. Aucun critère AA ne l'exige, mais un utilisateur
au clavier doit remonter lui-même.

## Les 4 non-conformités

### 1. 4.1.2 Nom, rôle, valeur (A) — deux liens invisibles aux lecteurs d'écran mais atteignables au clavier · **NEUF**

Les icônes **Facebook** et **Instagram** du bloc Coordonnées sont enveloppées dans
`<span aria-hidden="true">`, **et contiennent chacune un `<a href>` qui reste dans l'ordre
de tabulation**.

Conséquence concrète : une personne au clavier avec lecteur d'écran atterrit sur deux arrêts
dont **rien n'est annoncé** — ni nom, ni rôle, ni destination. Elle ne peut ni les utiliser
ni comprendre où elle est.

**Correctif** : soit retirer `aria-hidden` et donner un nom accessible aux deux liens (comme
le fait déjà le pied de page, dont les icônes portent `aria-label="Facebook"` /
`"Instagram"`), soit les sortir du parcours de tabulation. La première voie est la bonne :
ce sont de vrais liens utiles.

### 2. 1.4.3 Contraste (AA) — les quatre étiquettes des Coordonnées · **NEUF**

| | |
|---|---|
| Texte | `#f98a0b` — l'orange de la marque |
| Fond | `#f4f6fa` |
| Taille | 24 px, graisse normale → seuil assoupli **3** |
| Mesuré | **2,23** |

Quatre occurrences : « Adresse », « Horaires », « Contact », « Suivez-nous ».
**Même cause racine que les 16 fonctions d'équipe de la page À propos** : l'orange de la
marque sur fond clair. Sur le fond sombre du pied de page, le même orange passe très bien.

### 3 et 4 — écarts déjà assumés

| Critère | Constat | Statut |
|---|---|---|
| **1.4.12 Espacement du texte** (AA) | Trois avis Google coupés à 3 lignes. | VOULU |
| **1.3.1 Info et relations** (A) | **Aucun saut de niveau**. Mais **10 titres visuels non balisés** : 4 arguments dans le formulaire, les 4 étiquettes des Coordonnées, titre + sous-titre du texte SEO. | à trancher |

## Acquis

Langue `fr-BE` · titre de page réel · un seul `h1` · **0 lien mort** · **0 défilement
horizontal à 320 px** · lien « Plan du site » présent · **0 ressource en 404** · l'unique
image de la page est un fond de hero décoratif.

## Un signalement qui n'est pas de notre code

`focus-indicator-check` marque à vérifier un `<embed-place-card-element>` sans style de
focus visible : c'est un élément interne de la **carte Google Maps** intégrée. Hors de notre
maîtrise, signalé pour mémoire.

## Limites

Aucun lecteur d'écran réel. 5 critères non testés (utilisation de la couleur, trois flashs,
contraste des éléments non textuels, langue des passages).
