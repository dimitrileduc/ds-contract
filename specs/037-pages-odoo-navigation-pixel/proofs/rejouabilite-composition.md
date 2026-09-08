# T033 — La rejouabilité de la composition (FR-007 / SC-005)

Date : 2026-09-08 · instance `piqueray-odoo-037` · les **neuf** pages recomposées deux fois de suite, sans qu'un seul
octet de descripteur, de commun ou d'asset ne change entre les deux passes.

## Le résultat, et il tient en deux lignes

- **Les neuf `arch_db` sont identiques** d'une passe à l'autre — à un détail près, mesuré et nommé ci-dessous.
- Ce détail est l'**identifiant de pièce jointe** : `/web/image/546` devient `/web/image/659`. Normalisé
  (`/web/image/\d+` → `/web/image/N`), le HTML sauvegardé est **rigoureusement le même** sur les neuf pages.

| Page | `arch_db` brut | `arch_db` normalisé |
|---|---|---|
| `/` · `/portes-de-garage` · `/portes-residentielles` · `/portes-industrielles` · `/portes-entree` · `/motorisation` · `/depannage-sav` · `/a-propos` · `/contactez-nous` | diffère (9/9) | **identique (9/9)** |

## Le défaut que cette mesure a mis au jour, et il est antérieur à cette vague

`compose_page.py::img_url` crée une **nouvelle `ir.attachment` à chaque composition**, pour chaque image, sans jamais
chercher si la même existe déjà. Compté : **286 pièces jointes `pqr_*` avant la seconde passe, 399 après** — soit
**+113 par reconstruction complète du site**. Deux conséquences :

1. le stock de pièces jointes grossit à chaque rebuild, indéfiniment ;
2. le HTML sauvegardé change alors que **rien n'a changé** — ce qui rend impossible toute comparaison octet à octet
   du `arch_db`, et fait passer une composition parfaitement stable pour une composition instable.

C'est un défaut du **composeur**, pas de cette vague : `set_link` est la seule addition que 037 s'autorise (T019,
SC-010). Il part au registre des restes avec sa mesure. Le correctif naturel — réutiliser la pièce jointe dont le
nom et l'empreinte correspondent — est une ligne dans `img_url`, mais c'est une autre décision que celle-ci.

**Verdict : la composition est rejouable.** Ce qui bouge d'une passe à l'autre est un identifiant technique, pas un
contenu ; et la seule chose qu'il empêche de prouver, ce reçu la prouve autrement.
