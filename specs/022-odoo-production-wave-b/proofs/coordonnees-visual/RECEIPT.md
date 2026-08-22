# T018 — Delta visuel Coordonnées (SC-003)

**Date** : 2026-08-19 · **Instance** : `odoo:19.0-20260803` (compose QA, base jetable
`piqueray_qa`) · **Chromium** : 151.0.7922.34

## Mesure

| Sujet | Statut | Delta | Clip épinglé |
|---|---|---|---|
| `coordonnees-default` | **mesurée** | **0.1007 %** de pixels différents | 1776×660 (mesuré par `render-html --measure`) |

- **Référence** : `emitHtml(ds.coordonnees@2.2.0)` au clip épinglé (mécanisme 019 =
  l'apparence validée en 020, `reference-validated` 2026-08-09).
- **Odoo** : page publique `/piqueray-harness/coordonnees-visual`, session anonyme,
  sans barre de backoffice.
- Rapport machine : `comparaison-image.json` (ce dossier). PNG de travail
  reproductibles, gitignorés.

## Attribution de l'écart non nul (SC-003 : chiffré + cause nommée)

L'écart de **0.1007 %** se décompose en deux causes nommées, toutes deux sous le seuil
de bruit d'anti-aliasing du banc :

1. **Bloc contact — Option A (Q-C1).** La référence rend le téléphone et l'email en
   `<u>…</u>` (soulignement de contenu) ; le QWeb les rend en `<a href="tel:…">` /
   `<a href="mailto:…">` avec `text-decoration: underline` posé au pont
   (`ODOO-022-COORDONNEES-BRIDGE`). Le soulignement d'une ancre et celui d'un `<u>`
   ne sont pas au pixel identiques (épaisseur/position sous-pixel). C'est le coût
   **assumé et nommé** de rendre les liens cliquables sans toucher le contrat
   (décision gate 2026-08-19, Q-C1 = Option A). Aucune valeur de design n'est
   dupliquée : seule la neutralisation UA (couleur héritée) vit au pont.
2. **Anti-aliasing résiduel** du rendu de texte, comme sur toutes les sections
   mesurées (hero 0.0074 %, etc.) — composition, dimensions et contenu alignés.

Aucune des deux n'est un défaut de composition, de géométrie ou de contenu : le plan
placeholder, le SectionHeader, les blocs Adresse/Horaires/Contact/Suivez-nous et les
icônes sociales se superposent au contrat. **Rien à réparer ; l'écart est expliqué,
pas absorbé.**

## Installation (de-risking, module vivant)

`piqueray_ds` + `piqueray_ds_qa` installés sur base neuve : **0 erreur console, 0
réponse HTTP ≥ 400**. La racine Coordonnées se pose et se rend sans erreur.
