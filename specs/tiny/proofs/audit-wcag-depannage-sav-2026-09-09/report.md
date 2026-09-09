# Audit de conformité WCAG 2.2 — page « Dépannage / SAV »

## Périmètre

`http://localhost:8109/depannage-sav` · WCAG 2.2 **A et AA** (55 critères) · 1440, 640
(zoom 200 %), 390, 320 · 2026-09-09 · `@a11y-skills/audit` + mesures maison au pixel.
Pas de vidéo : batterie directe, **11 vérifications, 0 erreur**.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 21 | 1 | 2 | 8 |
| AA | 11 | 2 | 3 | 7 |
| **Total** | **32** | **3** | **5** | **15** |

**32 conformes sur 35 critères testés — 91 %.**

## Acquis

| Mesure | Résultat |
|---|---|
| Langue | `fr-BE` · Titre : « Dépannage et SAV portes de garage Hörmann en Province de Liège » |
| Un seul `h1` | oui, 4 titres — **aucun saut de niveau** |
| Liens qui ne mènent nulle part | **0** |
| Défilement horizontal réel à 320 px | **0 px** |
| Lien « Plan du site » | présent |
| Contrôles sans nom accessible | **0** · Ressources en 404 : **0** |
| Le bloc parle-t-il du bon sujet ? | **oui** — « Besoin d'un dépannage ? ». Pas de bloc Réassurances sur cette page, donc pas de risque de copie comme sur Portes d'entrée. |

**Les 4 images sans description sont toutes légitimes**, vérifié une par une : fond de hero
et fond de devis (décoratifs), et deux cartes de catégorie **enveloppées dans un lien déjà
nommé**. Le compte « 4 sur 4 » a l'air alarmant et ne l'est pas — c'est simplement une page
qui n'a que des images de décor.

## Les 3 non-conformités

| Critère | Constat mesuré | Statut |
|---|---|---|
| **1.4.3 Contraste** (AA) | Initiales des avis : **2,51** pour 4,5. Seul échec — hero sur photo **10,53**, Devis **6,14**, bouton **11,50**, texte SEO **11,85**. | VOULU |
| **1.4.12 Espacement du texte** (AA) | Avis Google coupés à 3 lignes. | VOULU |
| **1.3.1 Info et relations** (A) | **Aucun saut de niveau** ici. Mais **7 titres visuels non balisés** — c'est la seule cause. | **à trancher** |

### Les 7 titres non balisés

| Section | Texte | Taille |
|---|---|---|
| `faq` | « Votre porte ne se ferme plus ? » | 24 px |
| `faq` | « Votre porte est bloquée par une panne de courant ? » | 24 px |
| `faq` | « Votre télécommande ne semble plus fonctionner ? » | 24 px |
| `categories_principales` | « INTERVENTION RAPIDE » | 24 px |
| `categories_principales` | « MAINTENANCE » | 24 px |
| `texte_seo` | « Un service après-vente réactif pour vos portes » | 32 px |
| `texte_seo` | « Assistance technique » | 24 px |

**Cette page est le cas le plus net du problème** : elle n'a que 4 titres balisés pour
7 textes qui en jouent le rôle. Les trois questions de FAQ sont typiquement ce qu'un
visiteur cherche en arrivant ici — et ce sont elles qu'un lecteur d'écran ne peut pas
atteindre par la navigation par titres.

## Faux positifs

Le lien d'évitement à 1 × 1 px et 8 cibles de menu de 16 px couvertes par l'exception
d'espacement, signalée par l'outil lui-même.

## Limites

Aucun lecteur d'écran réel. 5 critères non testés.
