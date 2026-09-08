# T072 — Le quickstart rejoué de bout en bout, et les écarts entre l'attendu écrit et l'observé

Date : **2026-09-08**. Chaque §, rejoué. Les écarts sont écrits ici plutôt que corrigés en silence dans le quickstart :
un mode d'emploi qui se réécrit tout seul ne dit plus ce qui a été appris.

| § | Rejoué | Écart entre l'écrit et l'observé |
|---|---|---|
| **0** Prérequis | oui | **`FIGMA_TOKEN` n'existe pas sur ce poste.** L'owner a tranché le 2026-09-08 : les vues passent par le **pont figma-console**, pas par la REST. Le quickstart le suppose exporté ; il ne l'est pas, et l'instrument sait faire les deux. |
| **1** Résolveur | oui | Conforme. `odoo:pages:check` : 9 pages, 0 refus, registre de 66 restes. Les quatre refus décrits ont été exercés, plus trois autres (composant inconnu, copie locale, descripteur non classé) — **sept**, pas quatre. |
| **2** Reprise | oui | **Le chemin des PNG n'est pas celui écrit.** Le quickstart dit `--out .page-parity/037/avant` et `avant/home/odoo-1728.png` ; `--out` désigne le dossier des **rapports JSON**, et les PNG se rangent avec **`--png`**, sous `<dir>/<largeur>.odoo.png`. Résultat inchangé : 6 largeurs sur 8 identiques au pixel, les 2 autres expliquées par une mesure (hero vidéo). |
| **3** Sept pages | oui | Conforme (`COMPOSE_OK` ×7, 200 sur chaque URL). La rejouabilité tient **modulo l'identifiant de pièce jointe** — le quickstart disait « comparer les `arch_db` », ce qui échoue pour une raison qui n'a rien à voir avec la composition (`proofs/rejouabilite-composition.md`). |
| **4** Navigation | oui | Conforme, plus **trois défauts** que l'attendu ne prévoyait pas : deux limites du menu Odoo et les icônes sociales en 404. Le pilote 8087 **n'a pas pu** servir (levé par un autre worktree). |
| **5** Instrument | oui | **`structure: "6 vs 7 sections"`** annoncé pour le cas rouge ; l'observé est **« 4 vs 5 sections »** — Motorisation porte 5 sections, pas 7. Le mécanisme est le bon, le compte de l'attendu était faux. |
| **6** 36 rapports | oui | Conforme : 36 JSON, **aucun** `impossible`. |
| **7** Clôture | partiel | La validation owner est **en attente** ; le pilote est indisponible depuis ce worktree, la validation est proposée sur 8109. |
| **8** Portes | oui | Toutes vertes, re-pins **zéro** sur sept chemins. |

## Ce que ce rejeu apprend

Trois des quatre écarts sont des **erreurs de l'attendu écrit**, pas de l'implémentation : un drapeau qui n'existait pas
encore quand le quickstart a été rédigé (`--png`), un compte de sections faux (6 vs 7), et un jeton supposé présent.
Le quatrième — le pilote — est une contrainte d'environnement découverte à l'exécution.

C'est exactement ce que SC-009 demande de mesurer : la spec 018 avait relevé six faits « établis » et faux à la mesure.
Ici, quatre sur huit sections du quickstart portaient un détail inexact. **Aucun ne change un résultat** ; tous auraient
coûté du temps à la personne suivante.
