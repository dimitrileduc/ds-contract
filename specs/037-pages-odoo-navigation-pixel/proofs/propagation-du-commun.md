# T034 — Une correction du commun atteint toutes les pages qui le reprennent, et AUCUNE de celles qui le surchargent

Date : 2026-09-08 · instance `piqueray-odoo-037`.

C'est l'invariant qui justifie l'existence du contenu commun (SC-004). Sans lui, « unifié » ne voudrait rien dire :
il faudrait encore corriger neuf fichiers.

## Le geste

Une seule ligne changée dans `integrations/odoo/authoring/commun/devis.json` — le titre du bloc Devis — puis les
**neuf** pages reconstruites. Rien d'autre n'a bougé.

## Le résultat, page par page

| Page | Devis | Texte nouveau visible | Attendu |
|---|---|---|---|
| `/` | repris | **oui** | oui |
| `/portes-de-garage` | repris | **oui** | oui |
| `/portes-residentielles` | repris | **oui** | oui |
| `/portes-entree` | repris | **oui** | oui |
| `/motorisation` | repris | **oui** | oui |
| `/depannage-sav` | repris | **oui** | oui |
| `/a-propos` | repris | **oui** | oui |
| `/portes-industrielles` | **surchargé** (« nous nous déplaçons dans vos locaux ») | **non** — la surcharge tient | non |
| `/contactez-nous` | pas de Devis | non | non |

**7 pages sur 7 qui reprennent le commun l'affichent ; la page qui le surcharge garde sa surcharge, intacte.**
La correction a ensuite été **annulée** et les pages reconstruites : plus une seule occurrence du texte d'essai.

## Ce que cela prouve, et ce que cela ne prouve pas

Cela prouve la propagation ET l'étanchéité de la surcharge dans le même geste — c'est-à-dire l'invariant SC-004
de bout en bout, sur les vraies pages et pas sur des fixtures.

Cela ne prouve **pas** que la propagation est automatique : Odoo ne propage rien. Une page composée est du **HTML
figé**. Corriger le commun ne change rien tant que `npm run odoo:page` n'a pas été relancé — les neuf fois. C'est la
ligne `commun-figé-par-page` du registre des restes, avec la commande qui rafraîchit.
