> Lot 0-pixel — triptyque remplacé par le verdict 9/9 `identical`
> ([verdict](./verdict.md)). Base des liens :
> `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 5 (L3) · T037 — Product-card, propriété BOOLEAN Bouton

- **Cible** : [Product-card 2068:1972](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2068-1972)
- **Version enregistrée avant la passe** : `005/affordances/lot-l3` — `2380204337834005784`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : le bouton caché n'avait aucune propriété officielle (`componentPropertyReferences` vide) — l'affordance officieuse de la leçon Button (FR-007). Désormais `Bouton` BOOLEAN, défaut `false` = état actuel.

### Phase 5 (L3) · T038+T039 — Tab, archive puis suppression du variant fantôme (un seul geste destructif)

- **Cible** : [Tab 2061:1588](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2061-1588) — archive : [Archive · Spec A 2136:5429](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2136-5429)
- **Version enregistrée avant la passe** : `005/affordances/lot-l3` — `2380204337834005784`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : `État3` était un variant auto-généré, absent de la description du composant, non instancié nulle part (FR-008). Archivé (vecteurs intacts) avant suppression, conforme FR-031.

### Phase 5 (L3) · T040 — member-picture, axe + valeurs

- **Cible** : [member-picture 274:2389](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=274-2389)
- **Version enregistrée avant la passe** : `005/affordances/lot-l3` — `2380204337834005784`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : un état interactif modélisé comme valeur d'axe anonyme (`Default|hover`, casse incohérente) devient un axe d'état nommé (`État = Défaut | Survol`, FR-009/R7).
