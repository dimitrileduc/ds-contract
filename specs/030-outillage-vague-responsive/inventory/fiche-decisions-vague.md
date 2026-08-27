# Fiche de décisions de vague — D1 à D9

**Tranchées par l'owner le 2026-08-27**, en conversation, avant la vague.
Prérequis nommé par la rétro 029 : « la fiche D1–D9 est signée AVANT la première
section, sinon 12 sections divergent ».

Cette fiche est l'entrée de la spec de vague (`031-vague-responsive-sections`).
Chaque section applique le défaut ; une section qui veut déroger le fait en **une
ligne motivée**, jamais en silence.

---

| | Décision | Réponse owner |
|---|---|---|
| **D1** | Axe `Presentation` visible dans le sélecteur | **Oui, sur les 12 sections** (Wide / Desktop / Mobile) |
| **D2** | Nommage de l'étage mobile | **`Mobile`** |
| **D3** | Titre de section en mobile | **44 → 32 px**, en override local étiqueté à unifier |
| **D4** | Texte des cartes en mobile | **Taille réduite**, pas de coupure de mots |
| **D5** | Carte seule en fin de grille | **Garde sa largeur de colonne** |
| **D6** | Réglage `Colonnes` en Mobile | **Visible mais sans effet**, et la phrase est écrite sur la planche |
| **D7** | Média manquant | **Jamais de fallback silencieux** — l'auteur choisit un style sans média (règle en vigueur, reconduite) |
| **D8** | Largeur minimum sur un composant | **Interdit, mais dérogation possible au cas par cas, motivée** |
| **D9** | Largeurs témoins | **320 / 390 / 834 / 1200 / 1440 / 1728**, contenu court + contenu long |

---

## Ce que chaque décision engage, concrètement

### D1 — la molette, et ce qu'elle ne fait PAS

Les 12 sections gagnent un axe `Presentation`. **Il ne descend pas dans le
contrat**, et c'est la doctrine du dépôt, pas un oubli :

> `docs/FIGMA-CAPABILITY-MATRIX.md` : `@media` / `@container` →
> **CARRY-CODE-ONLY** — « Responsive behavior lives in code. This canvas shows
> the base layout only. »

`Style` et `Colonnes` sont des **choix d'auteur** → ils sont dans le contrat et
deviennent des réglages Odoo. `Presentation` n'est pas un choix d'auteur : c'est
la largeur d'écran du visiteur qui décide → le site le gère en CSS.

Vérifié : `contracts/hero-video.contract.json` est en v1.0.0 et **n'a aucune prop
`presentation`** alors que la molette existe dans Figma depuis 028.

**Conséquence à budgéter** : ~12 acquittements de parité supplémentaires
(`figma|ahead|<Section>.Presentation`), un par section. Il y en a 2 aujourd'hui.

**PIÈGE NOMMÉ** : `npm run parity` *propose* de promouvoir `Presentation` en prop
de contrat. **Ne pas accepter ce patch.** Il ferait de « Mobile » un réglage que
l'auteur d'une page choisit à la main — ce qui n'a aucun sens sur un site réel.

### D2 — `Mobile` gagne, donc `HeroVideo` se renomme

`HeroVideo` dit `Compact` depuis 028. Pour tenir D2, il faut le renommer
`Compact` → `Mobile`. **Ce n'est pas gratuit** : c'est une mutation de master
existant, donc §X (capture avant) s'applique, et l'acquittement de parité
`figma|ahead|HeroVideo.Presentation` change de contenu.

À traiter comme **une entrée de la vague à part entière**, pas comme un détail
de fin de journée.

### D3 + D4 — la dette typographique est tenue par la machine

Aucun nouveau Text Style n'est créé. Le runner n'autorise en local que
**taille, interligne, alignement**, et **exige** l'étiquette
`pending-responsive-text-style` + la référence de décision owner sur chaque
override. Sans l'étiquette : refus.

Résultat : à la fin de la vague, la liste complète des endroits touchés existe
automatiquement. **C'est là, et seulement là, qu'on décide s'il faut créer un
vrai « Titre section / Mobile » gouverné.** C'est le « on unifiera à la fin »
demandé par l'owner, tenu par construction et non par intention.

Même règle pour les variables (espacements, paddings) : le runner n'accepte
qu'une variable **qui existe déjà** — identifiant, nom et valeur exigés. Il ne
peut pas en créer. On prend celles du DS ou on ne prend rien.

### D6 — la phrase est obligatoire sur la planche

« En Mobile, `Colonnes` reste affiché mais sans effet » est une **conséquence
structurelle** : invisible dans un rendu. Elle doit donc figurer dans la zone
« ce que vous n'aurez pas » de chaque planche concernée. Le générateur de
planche refuse une planche dont cette zone est vide.

### D8 — la dérogation existe déjà, et elle est gouvernée

La réponse owner (« interdit, mais dérogation possible au cas par cas ») tombe
exactement sur le mécanisme livré par 030 : `lockWaivers[]`.

- sans dérogation → refus `inherited-size-lock`, avec nœud, propriété, valeur et
  origine de l'héritage, **avant** toute mutation ;
- avec dérogation → il faut `nodeId`, `property`, `value`, une `reason` écrite et
  un **`decisionRef` obligatoire**. Une dérogation sans décision owner derrière
  elle est refusée par la validation.

Autrement dit : la souplesse demandée est disponible, et elle laisse une trace
nominative. **Aucun changement de code nécessaire.**

### D9 — 6 largeurs × 2 contenus

`320 / 390 / 834 / 1200 / 1440 / 1728`, en contenu court et contenu long, soit
12 témoins par section. Sur la planche de validation, **seules les largeurs où
la sortie diffère** sont montrées à taille réelle ; les autres sont **nommées
comme identiques** (§XII) et renvoyées à l'archive technique masquée.

---

## Ce que cette fiche ne couvre pas

- La **césure** de « RÉSIDENTIEL-LES » à 390 px : D4 la traite par la réduction
  de taille. Si le mot déborde encore après réduction, c'est une décision de
  section, prise en séance.
- Les sections qui exigeraient une **capacité nouvelle du runner** : elles sortent
  de la vague et prennent une spec dédiée (règle d'éjection, rétro 029).
- `header` et `footer` : **hors périmètre**, décision owner du 2026-08-26.
