> Lot 0-pixel — triptyque remplacé par le verdict 9/9 `identical` ([verdict](./verdict.md)).
> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 7 (L5) · T082 — Section-header ×6 adoption, réduite à 0/6

- **Cible** : [Section-header 2090:2397](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2090-2397) vs 6 organismes candidats
- **Version enregistrée avant la passe** : `005/composition/lot-l5` — `2380192818739582323`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme (aucune adoption réelle n'a laissé de trace)
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : le pré-diff structurel (`customizations.js`) confirme une forme identique (Accroche+Titre) pour Coordonnées et Formulaire, mais l'exécution réelle révèle une limite de l'API Plugin — les enfants `FIXED` hérités du maître ne sont pas redimensionnables au niveau instance, rendant l'adoption impossible dans un contexte plus étroit (480px/759px) que le maître (1550px) sans le déformer visuellement. Présentation/Texte SEO manquent d'Accroche ; Hero porte un sous-titre+bouton qu'aucune variante n'exprime ; SAV n'est pas un patron de section-header. **US7 livre 0/6**, nommé en détail dans `decisions.md`, pas absorbé en silence.

### Phase 7 (L5) · T085 — Hero vidéo, componentisation en place

- **Cible** : [Hero vidéo 2151:5552](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2151-5552) (ex-`Hero video` `210:330`)
- **Version enregistrée avant la passe** : `005/composition/lot-l5` — `2380192818739582323`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict](./verdict.md)
- **Pourquoi** : promotion FRAME→COMPONENT en place (`createComponentFromNode`), aucun contenu déplacé. Couvre exactement le cadre existant, ne fusionne pas avec le bloc catégories suivant (question déjà close par l'audit 003), n'est pas un variant de `Hero` (rôle différent). Description écrite à la naissance.
