# T028 — Delta visuel Réassurances (SC-003)

**Date** : 2026-08-19 · **Instance** : `odoo:19.0-20260803` (compose QA, base jetable
`piqueray_qa`) · **Chromium** : 151.0.7922.34

## Mesure

| Sujet | Statut | Delta | Clip épinglé |
|---|---|---|---|
| `reassurances-default` | **mesurée** | **0.4530 %** de pixels différents | 1598×806 (mesuré par `render-html --measure`) |

- **Référence** : `emitHtml(ds.reassurances@1.2.0)` au clip épinglé (mécanisme 019 =
  l'apparence validée en 020, `reference-validated` 2026-08-09).
- **Odoo** : page publique `/piqueray-harness/reassurances-visual`, session anonyme.
- Rapport machine : `comparaison-image.json` (ce dossier). PNG de travail gitignorés.

## Attribution de l'écart non nul (SC-003 : chiffré + cause nommée)

Le **0.4530 %** (≈ 4,5× le résidu de Coordonnées à 0.10 %) s'explique par la
**densité de texte**, pas par un défaut de composition :

1. **Volume de texte × 4.** Réassurances rend 4 titres de carte + 4 textes de carte
   (chacun 2 phrases avec un segment `strong`) + l'en-tête + le libellé du CTA — soit
   environ quatre fois les arêtes de texte de Coordonnées. Le résidu d'anti-aliasing
   du rendu de texte est proportionnel aux arêtes ; plus de texte, plus de pixels
   d'AA. Aucune valeur de design n'est en cause.
2. **4 boîtes d'image placeholder.** Les cartes posent leur image `reassuranceImage`
   sans src (identique des deux côtés — boîte vide dimensionnée par le contrat) ;
   leur rendu contribue un résidu de bord.
3. **DW-002 (nommé).** La source Figma déborde d'elle-même de 2 px
   (4×364 + 3×32 = 1552 dans 1550) ; le pont `ODOO-022-REASSURANCES-BRIDGE` rétrécit
   les colonnes (`minmax(0, …)`) — comportement fidèle documenté, pas un écart à
   expliquer deux fois.

**La composition est superposée** : le scénario `reassurances.spec.mts` mesure par
ailleurs que les 4 cartes tiennent sur UNE rangée (grille de 4 colonnes) à 1728 ET
1440 avec zéro débordement — une grille correctement alignée, pas un décalage. Rien à
réparer ; l'écart est expliqué, pas absorbé.

## Installation (de-risking, module vivant)

`piqueray_ds` + `piqueray_ds_qa` installés sur base neuve avec la collection répétée :
**0 erreur console, 0 réponse HTTP ≥ 400**. La racine Réassurances (4 cartes + CTA) se
pose et se rend sans erreur.
