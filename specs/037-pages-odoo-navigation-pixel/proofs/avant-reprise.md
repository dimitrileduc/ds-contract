# T020 — La capture de l'AVANT, avant la première mutation (constitution §X)

Date : 2026-09-08 · Instance `piqueray-odoo-037` (8109) · descripteurs composés **tels quels**, sans le résolveur
(`run-compose.sh` appelé directement : le résolveur refuse déjà ces deux fichiers, « copie locale interdite », et c'est
précisément l'état d'avant qu'on voulait photographier).

Une fois `home.json` et `portes-de-garage.json` réécrits, cet état est perdu **définitivement** — et une capture faite
par un autre chemin ne serait pas comparable à celle d'après. D'où la règle : capturer TOUT ce qui sera touché, vérifier
chaque capture non vide et à la bonne taille, **avant** la première mutation.

| Page | Largeur | Capture | sha256 (12) |
|---|---|---|---|
| home | 390 | 390×9019 | `d22133109ed9` |
| home | 834 | 834×8242 | `a0b6fd1b4af4` |
| home | 1200 | 1200×6175 | `09ed11aae071` |
| home | 1728 | 1728×6411 | `bae46c93388c` |
| portes-de-garage | 390 | 390×8152 | `ac08aafe3b73` |
| portes-de-garage | 834 | 834×7303 | `2fce3dc5b31e` |
| portes-de-garage | 1200 | 1200×5151 | `93a9f7a8035d` |
| portes-de-garage | 1728 | 1728×5258 | `d487d3c1ff93` |

**8 captures sur 8**, chacune non vide et à la largeur attendue (le refus « capture vide » et le refus « débordement
horizontal » de `capture.ts` n'ont pas eu à se déclencher : ils sont là pour le jour où ils devront).

PNG sous `.page-parity/037/avant/<page>/<largeur>.odoo.png` — hors dépôt (décision owner 2026-08-27 : aucune image
lourde committée). L'empreinte ci-dessus est ce qui reste dans le dépôt, et elle suffit à rejouer la comparaison.
