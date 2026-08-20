# Research — 022 Barre de navigation Piqueray dans Odoo (le shell)

**Date**: 2026-08-20 · **Entrées**: spec.md (5 clarifications), constitution v1.2.0,
`integrations/odoo/README.md` (séquence de portage), déclarations 013 (`proofs/declarations/header.json` —
52 faits), relevé 005 `structure-header-nav.json`, dossier 020 `dossiers/header/` + décision
`020-reference-header-20260809`, contrats `ds.header` 1.0.0 / `ds.nav-item` 1.2.0 /
`ds.piqueray-logo` 0.1.0 / `ds.button` 2.0.1, schéma `contract-schema.ts`,
`docs/FIGMA-CAPABILITY-MATRIX.md` (pont CTA), ROADMAP.

Méthode d'honnêteté pour tout ce qui touche Odoo (mémoire de projet « s'inspirer des patrons
Odoo ») : chaque assertion est étiquetée **DOCUMENTÉ** (lisible dans le code d'Odoo 19 / le dépôt),
**OBSERVÉ** (constaté sur l'instance épinglée), ou **À OBSERVER** (spike obligatoire avant d'écrire
le QWeb — séquence de portage, étape 3). Rien d'« inventé » ne porte de décision.

> **Nota bene — auggie MCP indisponible** (HTTP 402 ce jour) : la règle docs-first a été appliquée
> par lecture directe des documents listés ci-dessus, repli nommé par CLAUDE.md.

---

## D1 — Découpage en deux phases : réparer puis projeter

**Decision** : la feature exécute d'abord la **remise à niveau versionnée** (`ds.header` **2.0.0**
— MAJOR, retrait de la variante Solid — + adoption `ds.piqueray-logo` 1.0.0, toutes portes
vertes), puis la **projection Odoo** qui consomme les versions re-épinglées. Le bump réel sert de
preuve SC-006 (aucun changement jetable).

**Rationale** : clarification de spec du 2026-08-20 (option A retenue) ; `ds.header` v1.0.0 ne peut
pas rendre la référence validée (reçus 013), donc « projeter sans écart visible » exige la
réparation amont. **Rationale du périmètre** : la ROADMAP nommait ce chantier « 023
`odoo-site-shell` (Header **et** Footer) » — 022 en livre la moitié Header seulement ; le Footer
reste au backlog shell. Écart de découpage nommé ici, pas silencieux.

**Alternatives considered** : projeter v1.0.0 telle quelle (rejeté : écart visible garanti — logo
sombre sur fond sombre, bouton sans style Blanc) ; réparer dans une sous-spec séparée (rejeté par
la clarification : SC-006 exige une évolution réelle, la remise à niveau EST cette évolution).

---

## D2 — Contenu exact du bump `ds.header` 1.0.0 → 2.0.0 (MAJOR — Solid retiré)

**Decision** (mise à jour du 2026-08-20, décision owner — voir D3) : le bump porte **7 éditions,
et rien d'autre** (le détail normatif vit en `contracts/header-2.0.0.delta.md` §1) :

| # | Édition | Reçu soldé |
|---|---|---|
| 1 | `version`: `1.0.0` → `2.0.0` | — |
| 2 | **RETRAIT** de la prop `fond` (enum `solid\|transparent`, binding VARIANT `Fond`) — c'est le MAJOR | audit 020 : **0 usage Solid** (9/9 Transparent) ; décision owner 2026-08-20 |
| 3 | `iconsNav.tokens` += `"color": "{color.blanc}"` (les SVG sont `currentColor` ; état 1.0.0 **vérifié** : aucune encre portée) | `header.visual.icones-couleur-par-variante` (la moitié Solid meurt avec la variante) |
| 4 | `PiquerayLogo.component.props.couleur`: `"default"` → `"blanc"` (rendu : **marque orange + wordmark blanc** — `blanc` est le nom de la variante, pas un logo tout blanc) | `header.composition.piqueray-logo-couleur-figee` |
| 5 | `Bouton.component` (ref nu en 1.0.0, **vérifié**) += `props: {variant: "blanc", iconLeft: false, iconRight: true, iconRightGlyph: "arrow-right"}` | `bouton-style-par-variante`, `bouton-icone-gauche/-droite`, `bouton-glyphe-droite` |
| 6 | `Bouton.component` += `text: "Contactez-nous"` | `bouton-libelle` (fin de la coïncidence avec le défaut de `ds.button`) |
| 7 | `repeat.sample[2].href`: `"/motorisation"` → `"/depannage-sav"` — le **libellé « Dépannage/SAV » est déjà porté depuis 016** (`e8568440`), baseline corrigée ici | `header.content.nav-item-href` (`nav-item-3-libelle` déjà soldé en 016) |

**Aucune édition sur `root`** : l'état 1.0.0 vérifié ne porte **aucun fond** (font-family, width,
paddings seulement) — Transparent = aucun fond est déjà vrai ; le fait 013 `fond-solid-remplissage`
**meurt avec la variante** au lieu d'être porté.

**Déjà réparé, ne pas refaire** : la taille des icônes est à 24 depuis 016 (commit `f854cc21`) ;
le libellé `sample[2]` depuis 016 (`e8568440`). Seuls l'encre des icônes et le href restent.

**Morts avec Solid (plus des différés)** : `header.visual.ombre-portee` (ombre Solid uniquement —
la variante n'existe plus, le fait est clos sans destination) ; la moitié Solid de
`icones-couleur-par-variante` et de `fond-solid-remplissage`.

**Différés, nommés** (hors FR-013) :
- `header.property.items-sans-defaut` et l'absence d'`actif` dans `arrayOf items` — sans effet sur
  la surface Odoo (les items y viennent de `website.menu`, l'actif de la sémantique Odoo) ; la
  vitrine `emit-html` rend le `repeat.sample`. Restent des faits 013 ouverts côté React.
- `header.semantic.root-element` / `nav-landmark` / `icones-decoratives` — la surface **livrée**
  obtient sa sémantique du QWeb manuel (le header système d'Odoo est un `<header>` natif, notre
  gabarit y pose le `<nav>` et des icônes `aria-hidden`) ; la surface React reste `<div>`,
  fait 013 ouvert, différé nommément.

**Semver** : retrait d'une prop et d'une valeur d'enum = **MAJOR → 2.0.0** (constitution VI — le
retrait est bruyamment versionné). Les autres éditions (props d'enfant figées, texte, jeton
d'encre, href de vitrine) seraient MINOR/PATCH ; le retrait impose le MAJOR.

**Alternatives considered** : MINOR 1.1.0 en gardant Solid + un canal conditionnel nouveau
(rejeté par la décision owner — voir D3) ; porter aussi ombre/sémantique/défaut d'items (rejeté :
hors mandat, chaque absence nommée ci-dessus avec sa destination ou sa clôture).

---

## D3 — La variante Solid : retirée à la source (décision owner 2026-08-20) — AUCUN canal nouveau

**Decision** : la variante `Fond=Solid` est **retirée** — du contrat (D2, MAJOR) **et du set
Figma** (suppression du master, geste canvas unique). Le canal de schéma `propsByProp` envisagé
par la première version de ce plan est **abandonné** : schéma et émetteurs restent intouchés.

**Le trou 013, et comment il se ferme.** Le reçu `piqueray-logo-couleur-figee` établissait un
trou réel : « ComponentRefSchema n'accepte qu'un scalaire figé ou un renvoi "{propParent}" à
valeur identique, pas une table de correspondance solid→default / transparent→blanc ». Tant que
Solid existait, exprimer « logo `couleur=blanc` et bouton `variant=blanc` sur Transparent
seulement » exigeait un canal conditionnel nouveau. Le constat d'usage (audit 020 : **9/9 usages
en Transparent, 0 en Solid**) a fait trancher l'owner : la variante morte est retirée, et le trou
se ferme **à la source** (§VIII : le défaut se répare à la source, jamais contourné en code) —
les props d'enfant deviennent des valeurs **figées existantes** (`couleur: "blanc"`,
`variant: "blanc"`).

**Le geste canvas** (le seul de la feature — §X actif, §XI N/A) :
1. **Répétition sur CLONE** : cloner le set header, y supprimer la variante Solid, observer le
   devenir du set et de la propriété `Fond` (set mono-variante ? propriété à retirer ? composant
   détaché ?) et la survie d'une instance test — puis supprimer le clone. Le mécanisme exact est
   **À OBSERVER** (aucun retrait de variante n'a jamais été exécuté dans ce dépôt).
2. **Capture §X** : le set complet + les **9 usages** (captures + dump JSON), chaque capture
   vérifiée non vide et correctement dimensionnée ; `saveVersionHistoryAsync("022 — avant retrait
   Fond=Solid")`.
3. **Geste réel** : suppression du master `Fond=Solid` (+ résolution de la propriété de variante
   comme répété) ; re-vérification des 9 instances **par POSITION** (intactes, toujours
   Transparent) ; captures après ; reçu machine-readable.
4. **Refresh LECTURE** de `parity/snapshots/figma-components.json` (notre geste a changé le
   fichier) — avant le sweep parity.

**Rationale** : garder une variante sans usage coûtait un canal de schéma + 3 émetteurs + des
evals — de la complexité au service de rien ; le semver MAJOR dit la vérité du retrait, et la
suppression du master maintient l'alignement contrat↔canvas sans acquittement permanent.
`ds.piqueray-logo` garde ses DEUX variantes (`default|blanc`) : c'est un composant feuille
partagé (le footer le compose aussi) — seule la valeur figée par le header change.

**Alternatives considered** : garder Solid + `propsByProp` additif (rejeté par l'owner :
complexité de schéma pour une variante morte — c'était la décision initiale de ce document,
renversée le 2026-08-20) ; garder Solid + basculer les valeurs figées vers Transparent (rejeté :
rend Solid faux — divergence échangée, pas résolue) ; retirer Solid du contrat mais laisser le
master sur le canvas avec acquittement parity (rejeté par l'owner : divergence vivante, nettoyage
reporté) ; deux parts logo avec `visibleWhen` (rejeté : ment sur la structure — une seule
INSTANCE par variante côté canvas).

---

## D4 — Adoption de `ds.piqueray-logo` : 0.1.0 draft → 1.0.0

**Decision** : relire et adopter le contrat proposé — retirer `"status": "draft"`, passer la
version à `1.0.0`, réécrire la description sur le patron des contrats adoptés (« Extracted from
the Figma COMPONENT_SET …, reviewed and adopted — not authored »), en conservant l'API
(`couleur: default|blanc`) et l'anatomie (Marque orange + Wordmark bleu/blanc via `tokensByProp`)
telles quelles. La revue d'adoption vérifie : bindings VARIANT exacts (`Default|Blanc`), jetons
(`{size.logo.width/height}`, `{color.orange}/{color.bleu}/{color.blanc}`), assets présents
(`assets/vectors/piqueray-logo-{marque,wordmark}.svg`), ancres Figma (set `da9ca0f5…`, node 4:14).

**Rationale** : FR-013 exige la sortie du statut draft avant projection ; la description actuelle
dit elle-même « review before adoption ». L'API à deux variantes est confirmée par les usages
relevés (84:256 → 4:13 Default ; 84:287 → 4:15 Blanc — déclaration 013). Le patron d'adoption est
celui des 27 contrats de 010.

**Alternatives considered** : adopter en 0.2.0 (rejeté : l'adoption est la première version
stable consommée par une projection de production — 1.0.0 dit cela ; le semver de gouvernance du
dépôt réserve 0.x aux propositions) ; étendre l'API pendant l'adoption (rejeté : rien ne le
demande, l'adoption doit être une revue, pas une réécriture).

---

## D5 — `ds.nav-item` v1.2.0 : projeté épinglé, non modifié

**Decision** : aucun octet ne change dans `contracts/nav-item.contract.json`. La projection
consomme sa CSS générée (fermeture de `ds.header`) : encre `{color.blanc}`, typo Montserrat
500/16 uppercase, chevron `octicon-chevron-down12` 16px `visibleWhen`, `Soulignement`
`visibleWhen actif` + `aria-current="page"`.

**Rationale** : contrainte de spec explicite ; la dette item 8 (encre/souligné) a été levée en
016 (v1.2.0, libellé TEXT bindé). L'état actif et le chevron sont des canaux du contrat — la
projection n'a qu'à poser la classe/l'attribut que la CSS générée attend déjà.

**Alternatives considered** : néant — toute modification violerait la spec.

---

## D6 — Route de projection : le header **système**, pas un snippet

**Decision** : le gabarit QWeb du header est un **template de layout** (patron « composant
interne » de `components.xml` : pas de `<section>` posable, pas d'inscription dans
`website.snippets`), branché dans la zone header native d'Odoo. La route de branchement précise
(hériter le template de header actif de Website via xpath, vs. fournir une variante de header et
l'activer à l'installation) est **tranchée par le spike S1** sur l'instance épinglée — critères de
choix, dans l'ordre : (1) le menu natif et son dialogue d'édition continuent de fonctionner tels
quels ; (2) survit à une mise à jour du module sans re-toucher les données ; (3) surface
d'adaptation manuelle minimale (chaque bloc compté au registre).
Statuts d'honnêteté : l'existence de la zone header système et du modèle `website.menu`
(champs `name`, `url`, `page_id`, `parent_id`, `sequence`, `website_id`) est **DOCUMENTÉ** (code
d'Odoo 19, image épinglée) ; la forme exacte des templates de header 19 et leur mécanisme
d'activation est **À OBSERVER** (S1) — aucune trace dans 018/019 (vérifié : zéro occurrence de
`website.menu`/`template_header` dans le dépôt).

**Rationale** : FR-001 (header système, pas un bloc droppable) ; l'assomption de spec — « le
header est un gabarit rendu à chaque affichage » — est exactement ce qui rend FR-010/SC-006
tenables : contrairement aux snippets (copies `outerHTML` gelées au drop, reçu 018), une vue QWeb
mise à jour se répercute à la requête suivante. C'est l'argument structurel de toute la feature.

**Alternatives considered** : snippet posable plein-largeur en haut de page (rejeté : viole
FR-001, gèle le balisage — le contraire de SC-006 — et laisse le vrai header Odoo en doublon) ;
désactiver le header Odoo et rendre la barre depuis le layout de page (rejeté : perd le menu
natif et son dialogue, donc US2).

---

## D7 — Le menu : donnée native `website.menu`, rendue par notre gabarit

**Decision** : le gabarit itère les enfants du menu racine du site (la donnée que le dialogue
« Éditer le menu » manipule) et rend chaque entrée avec le balisage `ds.nav-item`
(classes de la CSS générée + `data-pqr-part`) : libellé ← `menu.name`, cible ← URL du menu
(page interne ou URL externe, nouvel onglet respecté), chevron ← `menu.child_id` non vide,
sous-menu ← balisage déroulant Bootstrap/Odoo **par défaut** (style non piquerayisé, FR-009).
Aucun libellé, aucune cible, aucun ordre n'est écrit en dur dans le gabarit (FR-004).

**Rationale** : c'est la séparation apparence/contenu de la spec — l'apparence vient de la CSS
contractuelle régénérable, le contenu vit dans `website.menu` où l'édition standard d'Odoo
(ajouter, renommer, réordonner, imbriquer, page/URL — **DOCUMENTÉ**, dialogue natif) le conserve
(FR-005/FR-006). Toute édition de menu re-rend la barre à travers NOTRE gabarit : le design ne
peut pas casser par édition de contenu (FR-011) — c'est structurel, pas défensif.

**Alternatives considered** : stocker le menu dans un JSON du module (rejeté : le menu cesse
d'appartenir au client et son dialogue natif ne le voit plus) ; mega-menu Odoo (hors périmètre —
imbrication simple seulement cette itération).

---

## D8 — Semis unique du menu (FR-016) : l'arborescence, ses cibles, son mécanisme

**Decision** — l'arborescence semée (dérivée des 9 maquettes de la page `Pages`, inventaire 003,
et des booléens chevron du master relevés en 013) :

```text
Portes de garage      → /portes-de-garage      (chevron — enfants :)
├── Portes résidentielles → /portes-residentielles
└── Portes industrielles  → /portes-industrielles
Portes d'entrée       → /portes-entree          (chevron — enfant :)
└── Motorisation          → /motorisation        [placement INFÉRÉ — voir honnêteté]
Dépannage/SAV         → /depannage-sav
À propos              → /a-propos
```

CTA « Contactez-nous » : **hors menu** (il n'est pas une entrée éditable cette itération,
FR-014) — cible fixe posée dans le gabarit via le pont existant `pqr_button` + `link_href`
(D10). Le semis retire les entrées par défaut d'Odoo (« Home »/« Contact us ») pour que la barre
livrée montre exactement l'arborescence de la maquette — geste unique, au même moment que le
semis.

**Honnêteté du placement « Motorisation »** : la maquette ne dessine aucun panneau de sous-menu ;
les enfants sont dérivés des noms de pages (« Portes de garage (+ résidentielles /
industrielles) », inventaire 003 — evidence directe) ; « Motorisation » est la seule page sans
parent évident, et le master dessine un chevron sur « Portes d'entrée » qui exige au moins un
enfant pour que la barre livrée reproduise la référence (FR-008 : le chevron suit la donnée).
Placement marqué **`confidence: "inferred"`** dans le fichier de semis ; le menu appartient au
client dès la livraison — re-ranger cette entrée est un geste d'édition standard.

**Mécanisme du « une fois »** : données XML `noupdate="1"` pour les enregistrements de menu
(créés à la première charge, jamais réécrits par une mise à jour du module — **DOCUMENTÉ**,
sémantique standard d'Odoo) ; le retrait des entrées par défaut et le rattachement au bon
`website_id` passent par le crochet d'initialisation approprié — **À OBSERVER** (spike S2) : le
comportement exact de `<function>` sous `noupdate` à l'update, et le chemin « site déjà installé »
(le module de production est déjà en ligne : le semis doit aussi s'exécuter une fois lors de LA
mise à jour qui livre le header — script de migration de version d'addon, patron Odoo standard).
Le scénario `install-update` existant (019) sert de gabarit de preuve : semis présent après
install, **intact et non re-semé** après update et après édition client (SC-003, FR-016).

**Cibles** : les pages internes visées n'existent pas toutes sur une instance fraîche — la QA les
crée comme pages minimales AVANT les preuves SC-005 (fixture de scénario, pas donnée produit) ;
en production les pages du client existent ou seront créées par lui (un menu vers une page
manquante est un 404 Odoo standard, pas une casse de barre — edge case « menu vide » couvert par
ailleurs).

**Alternatives considered** : semer depuis `repeat.sample` du contrat (rejeté : le sample est une
vitrine — la source de l'arborescence est la maquette, et le sample ne porte ni sous-liens ni
slugs corrects avant D2) ; ne pas retirer « Home »/« Contact us » (rejeté : la barre livrée
montrerait 6 entrées, écart visible vs la référence) ; créer les pages cibles dans le module
(rejeté : contenu métier embarqué dans un addon — même règle que « aucune image métier dans
l'addon », README §Hero).

---

## D9 — État actif (FR-007/SC-005) : sémantique Odoo, design contrat

**Decision** : le gabarit mappe l'état actif calculé par Odoo sur les canaux de `ds.nav-item` :
classe `actif` (celle que la CSS générée conditionne — `Soulignement` visible) +
`aria-current="page"`. Le cas « page courante enfant d'un déroulant → parent souligné » suit la
sémantique native d'Odoo (clarification de spec) ; l'entrée de sous-menu active reste au style
Odoo par défaut. Le calcul exact côté Odoo 19 (serveur vs JS, forme des classes) est **À
OBSERVER** (spike S1b) — la clarification l'affirme nativement vrai, la règle du dépôt (« une
décision n'est pas un fait ») impose de le re-tester avant d'écrire le mapping.

**Rationale** : le design de l'actif appartient à `ds.nav-item` (v1.2.0, canaux `actif` →
soulignement + `aria-current`) ; la VÉRITÉ de l'actif appartient au routeur du site — la même
séparation apparence/donnée que le menu.

**Alternatives considered** : recalculer l'actif nous-mêmes en JS (rejeté : duplique une
sémantique qu'Odoo possède ; un écart entre les deux serait un bug invisible).

---

## D10 — CTA et icônes : composition complète, comportements différés

**Decision** : le CTA réutilise le gabarit `pqr_button` existant avec `link_href` fixé vers la
page contact — **la page « Contactez-nous » de la maquette** (`/contactez-nous`), créée par la QA
pour les preuves comme les autres cibles (D8) ; le pont `ODOO-019-CTA-LIEN-BRIDGE` documenté par
la matrice de capacités rend `<a>` stylé `.button` à balisage identique. Variante rendue :
`variant="blanc"` (figée au contrat 2.0.0 via `ComponentRef.props` — D2 ; `propsByProp` abandonné, D3), `iconRight` +
`arrow-right`, libellé fixe « Contactez-nous » — non éditable cette itération (verdict authoring
`not-editable`). Les 3 icônes (search, user, cart) sont rendues à l'identique (24px, encre
`{color.blanc}` via la CSS de la fermeture) comme spans décoratifs `aria-hidden="true"` **sans
comportement** — limite nommée dans l'authoring et le rapport (recherche/compte/panier différés).

**Rationale** : règle prior-art — le mécanisme de lien CTA existe, ne pas en inventer un ;
FR-014 fixe composition et limites. Le choix `/contactez-nous` (plutôt que le `/contactus` natif)
garde les slugs du site alignés sur la maquette française — cohérent avec les slugs de D8.

**Alternatives considered** : pointer `/contactus` natif (rejeté : mélangerait deux familles de
slugs ; la page contact du client est celle de la maquette) ; icônes en `<button>` inertes
(rejeté : un bouton qui ne fait rien est un mensonge d'affordance — pire que le span décoratif
nommé ; les comportements viendront avec leurs specs).

---

## D11 — Fond sombre sous la barre (FR-015) : Odoo seulement, en jeton

**Decision** : une règle dans `odoo-bridge.css` (zone manuelle, adaptation enregistrée
`ODOO-022-FOND-SOMBRE`) pose `background-color: var(--pqr-color-noir-bleute)` sur le conteneur
header du site. Ni le contrat ni Figma ne bougent (clarification de spec). `noir-bleute` =
`#26282C` — l'encre sombre de la marque (fond du bouton Default, encre des icônes Solid,
VariableID:5:40 des relevés 013) : la valeur roule en jeton généré, jamais en littéral
(règle geometry-rides-tokens, appliquée ici à la lettre via la variable préfixée).

**Rationale** : l'encre claire de la barre Transparent exige un fond sombre pour être lisible et
mesurable ; la superposition sur le hero est explicitement hors périmètre. Le canal Odoo-only est
exactement ce que `odoo-bridge.css` existe pour porter (mécanique cible-spécifique, comptée).

**Alternatives considered** : porter un fond sombre au contrat (rejeté : le contrat dit
Transparent — écrire un fond opaque dedans falsifierait la source pour un besoin d'hébergement) ;
littéral `#26282C` dans le bridge (rejeté : invisible au différentiel — la variable générée est
le canal gouverné).

---

## D12 — Racine **shell** dans l'intégration : `ds.header` entre au lock sans devenir posable

**Decision** : introduire la catégorie de racine « shell » dans `scripts/odoo/lib/repo-data.ts`
(p. ex. `SHELL_CONTRACT_IDS = ['ds.header']` à côté de `ROOT_CONTRACT_IDS`) ; `build-assets`
émet la CSS des fermetures des DEUX listes (le dédoublonnage existant absorbe `ds.button`,
déjà dans les fermetures posables) ; `check-module` exige l'inscription snippet des racines
posables **et son absence** pour les racines shell ; `check-inputs`/`check-authoring`/
`build-derivation-report` couvrent les deux listes. Repin explicite de `inputs.lock.json` :
`ds.header@2.0.0`, `ds.nav-item@1.2.0`, `ds.piqueray-logo@1.0.0` (chemin + version + SHA-256,
les deux requis — README).

**Rationale** : FR-001 interdit le snippet ; le README définit `ROOT_CONTRACT_IDS` comme « racines
posables » — y glisser le header mentirait au vérificateur de module. La catégorie explicite
garde chaque porte exacte : la CSS arrive, le snippet est refusé, l'authoring reste exhaustif.

**Alternatives considered** : ajouter le header à `ROOT_CONTRACT_IDS` tel quel (rejeté :
`check-module` exigerait l'inscription snippet — il faudrait affaiblir la porte au lieu de la
préciser) ; CSS du header copiée à la main (rejeté : constitution IV, `tampered`).

---

## D13 — Authoring du header : un verdict par prop et par part, mécanisme menu nommé

**Decision** : `integrations/odoo/config/header.authoring.json` exhaustif (schéma 019). Verdicts
clés : la prop `fond` n'existe plus (2.0.0 mono-variante — aucun verdict à porter, D2/D3) ; `items` → `controlled` avec un
**nouveau `mechanism` additif** `native-menu` (l'enum du schéma d'authoring 019 est étendu — le
mécanisme est le dialogue de menu natif d'Odoo, pas un contrôle de panneau à nous) ; occurrences
imbriquées : `nav-item.libelle/href/chevron/actif` → `controlled` via `native-menu` (libellé,
cible, imbrication) ou `computed-display` (chevron, actif — calculés de la donnée/du routeur,
jamais édités directement) ; `piqueray-logo.couleur`, `bouton.variant/children/iconRight/…` →
`fixed-by-composition` ou `not-editable` (CTA non éditable cette itération) ; `rootActions` du
shell : tout `forbidden` sauf ce que le header d'Odoo permet nativement (l'apparence peut dévier
par les options natives de header — edge case accepté et nommé, PAS restreint cette itération).

**Rationale** : « Il n'existe aucun verdict par défaut » (README) — une prop sans verdict fait
échouer la porte. Nommer `native-menu` plutôt que tordre `ordered-repeat` garde le registre
honnête : le mécanisme n'est pas un panneau piqueray, c'est Odoo.

**Alternatives considered** : réutiliser `ordered-repeat` (rejeté : ce mécanisme désigne les
collections gérées par NOTRE panneau — le menu ne l'est pas) ; restreindre les options natives de
header (rejeté : hors périmètre explicite).

---

## D14 — Preuves : mêmes instruments, quatre reçus

**Decision** :
1. **US1/SC-001 (visuel)** — sujet `header.mts` (schéma `Subject` 019) : référence =
   vitrine `emit-html` de `ds.header@2.0.0` (mono-variante — le sample rend les 4 liens,
   chevrons compris), capture = page de mesure publique de l'instance (barre sur fond
   `--pqr-color-noir-bleute`), clip épinglé imprimé par `render-html.mts --measure`, comparaison
   `extract/image-parity` inchangé — verdict sous la tolérance que le harnais 019 applique
   (`compare.mts`), reçu dans `proofs/`. Les deux côtés montrent le MÊME contenu (les libellés du
   sample corrigé = les libellés semés) — c'est ce que D2 verrouille.
2. **US2/SC-002-003 (fonctionnel)** — scénario Playwright : depuis le menu semé — ajouter,
   renommer, réordonner, imbriquer, pointer page interne puis URL externe, enregistrer, rouvrir
   (éditeur + public) ; assertions : contenu conservé à 100 %, balisage/classes des liens simples
   intacts (le design ne peut pas casser — D7), chevron apparu sur le nouveau parent.
3. **SC-004/SC-005** (scénario `header-nav.spec.mts`) — déroulants : ouverture + navigation pour chaque lien à enfants (style Odoo
   par défaut accepté) ; actif : chaque page atteignable du menu semé porte le soulignement sur
   son lien (cas parent-d'enfant inclus) — pages cibles créées par la QA (D8).
4. **SC-006 (gouvernance)** — le reçu du bump réel. Il n'existe pas d'« avant » en ligne à
   capturer : la projection consomme d'emblée 2.0.0 (deux temps stricts, D1) — la barre n'est
   jamais en ligne au design 1.0.0. L'évolution 1.0.0 → 2.0.0 est attestée par les reçus amont,
   et SC-001 atteste que la barre en ligne rend la vitrine 2.0.0 (ce que 1.0.0 ne rendait pas).
   Le scénario : capture avant, puis une régénération complète `contrat → build → odoo:assets →
   update module` SANS toucher au menu ; assertions : l'apparence en ligne provient du contrat
   re-épinglé (régénérable, non figée à la main) ET le menu du client (modifié par le scénario 2)
   est byte-identique avant/après. La remise à niveau EST l'évolution (aucun changement jetable).

**Rationale** : « même instrument que les sections en ligne » (SC-001) est une exigence de spec ;
le harnais 019 est agnostique des composants par construction (sujets injectés par `--subjects`).

**Alternatives considered** : comparer à un export PNG Figma (rejeté : l'instrument du dépôt
compare la référence contractuelle rendue — le contrat a été validé contre Figma par la chaîne
013→017 ; changer d'instrument romprait la comparabilité avec les sections en ligne).

---

## D15 — Spikes mécanisme (séquence de portage, étape 3) — AVANT tout QWeb

**Decision** : trois spikes sur l'instance épinglée, chacun avec reçu machine-readable sous
`proofs/` (patron `equipe-mechanism-spike.json`) :
- **S1 — zone header** : lire les vues header de l'image `odoo:19.0-20260803` (templates, méthode
  d'activation, points d'ancrage xpath) ; livrer la route de D6 avec preuve (le menu natif et son
  dialogue fonctionnent à travers notre gabarit).
- **S1b — actif natif** : constater le calcul d'actif (serveur/JS, classes émises, cas parent
  d'enfant actif) — la clarification de spec devient un fait observé ou la spec est corrigée.
- **S2 — semis** : prouver le « une fois » sur les DEUX chemins (install frais ; update d'un site
  déjà installé), le retrait des entrées par défaut, et la survie du menu client à l'update
  suivant.

**Rationale** : règle du dépôt (« une décision n'est pas un fait » ; six prémisses de design 018
fausses à la mesure — SC-009 de 018) ; le mécanisme header/menu n'a AUCUN relevé dans le dépôt.

**Alternatives considered** : écrire le QWeb directement (rejeté : la séquence de portage du
README l'interdit — étape 3 obligatoire pour tout mécanisme incertain).

---

## D16 — Portes, re-pins et rouges pré-existants

**Decision** — inventaire complet des conséquences de build, chacun par son script, jamais à la
main :
- Édition contrats (schéma et émetteurs **INTOUCHÉS** — D3) ⇒ `npm run build`, re-pin
  `evals/golden.json` (`scripts/update-golden.mjs`), re-pin
  `figma-sync/plugin/engine.receipt.json` (`plugin:check`), `npm run catalog` (hors build —
  piège nommé CLAUDE.md), `npx tsc` ×2. **PAS de re-pin `examples/polaris`** (le 3e reçu ne
  dérive que sur édition d'émetteur — mémoire du dépôt ; il n'y en a aucune).
- Intégration ⇒ repin `inputs.lock.json`, `odoo:assets` (+ `--check`), `header.authoring.json`,
  entrées `adaptation-registry.json` (`ODOO-022-*`), `odoo:derivation` régénéré, manifeste addon
  (version bump `19.0.1.5.0`, data/migrations).
- `npm run parity` : l'axe canvas compare au **snapshot** ; mémoire 017 — `figma-components.json`
  n'a pas été rafraîchi après les mutations du 2026-08-07. **Notre propre geste (retrait du
  master Solid, D3) impose le refresh lecture seule du snapshot AVANT le sweep** — ce n'est plus
  un « si l'axe rougit ». Écart nommé, non silencieux : entre le geste canvas et la merge de la
  branche, `main` compare son vieux snapshot à son vieux contrat — vert sur un état périmé,
  résorbé à la merge (limite standard du dépôt, mémoire 017).
- **Rouges pré-existants, nommés, à ne PAS re-diagnostiquer** (mémoire de projet) :
  `odoo:qualification` (reçu 019 incohérent) et `editability-boundary` 43/44 (champ périmé depuis
  `cc6cd0d4`). Politique 022 : ne pas les aggraver ; les scénarios 022 sont des `scenarioId`
  distincts ; si la qualification finale de 022 exige un manifeste vert, la remise en cohérence
  du reçu 019 est un préalable nommé dans tasks.md, pas un travail silencieux.

**Rationale** : chaque re-pin listé a déjà mordu ce dépôt (mémoires : engine.receipt distinct de
golden ; polaris au 3e reçu ; catalog hors build ; snapshot périmé).

**Alternatives considered** : néant — c'est un inventaire, pas un choix.

---

## D17 — Worktree F1

**Decision** : la spec s'exécute dans son worktree (`…/nav`) rendu autosuffisant d'abord :
`npm install` + `npx playwright install chromium` DANS le worktree ; le sweep complet y tourne à
chaque checkpoint. L'instance Docker est lancée depuis le worktree (`qa/compose.yaml` +
`.env`).

**Rationale** : constitution, Worktree Gates F1 ; le runner d'evals symlinke le `node_modules` du
checkout.

**Alternatives considered** : néant (doctrine réglée en 004).
