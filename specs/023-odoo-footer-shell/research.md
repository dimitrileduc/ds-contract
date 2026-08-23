# Research — 023 Pied de page Piqueray dans Odoo (footer shell)

**Date**: 2026-08-22 · **Spec**: [spec.md](./spec.md) · **Précédent direct**: `specs/022-odoo-nav-shell/`
(header shell — même famille de mécanisme, patron réutilisé partout où il tient).

Méthode docs-first (§IX) : auggie MCP indisponible dans cette session — repli nommé = lecture
directe. Consultés AVANT toute décision : `integrations/odoo/README.md` (les 4 frontières, la
séquence de portage en 5 étapes), `contracts/{footer,footer-column,copyright}.contract.json`,
`integrations/odoo/addons/piqueray_ds/views/header.xml` (le patron shell livré),
`integrations/odoo/config/{header.authoring.json,inputs.lock.json}`,
`scripts/odoo/lib/repo-data.ts` (`SHELL_CONTRACT_IDS` et son commentaire « jamais de HTML
sauvegardé pour un shell »), `specs/022-odoo-nav-shell/{plan,research,data-model}.md` +
`proofs/spike-header.json`, constitution v1.2.0. Recherche préalable dans le dépôt : **aucune
occurrence** d'un relevé du mécanisme footer d'Odoo 19 (ni `website.footer`, ni COW footer, ni
`t-field` d'édition inline, ni `social_facebook`) — les spikes S1–S3 ci-dessous sont donc
réellement requis, exactement comme `website.menu` l'était en 022 (README d'intégration, étape 3 :
« prouver séparément chaque mécanisme Odoo incertain »).

---

## D1 — Une seule phase : projection pure, AUCUNE remise à niveau amont

**Decision**: 023 n'a **pas de phase amont**. Les trois contrats consommés sont projetés
**épinglés** : `ds.footer` 1.1.0, `ds.footer-column` 1.1.0, `ds.copyright` 1.0.0 — plus
`ds.piqueray-logo` 1.0.0 et `ds.button` 2.0.1 déjà au lock (le logo par le header 022, le bouton
par les sections). Aucun bump, aucune édition de contrat, aucun canal de schéma, **aucun geste
canvas Figma** (lecture seule de bout en bout).

**Rationale**: la clarification du 2026-08-22 l'établit : la géométrie de `ds.footer` est
gouvernée depuis 015 (border-box, 3 largeurs source réparées), les tokens sont bindés depuis 016,
et les compositions tiennent (`couleur: "blanc"` acceptée par piqueray-logo 1.0.0,
`variant: "outlineBlanc"` acceptée par button 2.0.1). Le header de 022 avait une variante morte à
retirer (MAJOR 2.0.0) ; le footer n'a rien de tel.

**Alternatives considered**: porter la largeur du logo relevée (180.1px, notée « travail reporté »
dans `ds.footer`) — rejeté : c'est précisément le travail que la description du contrat REPORTE
par décision datée (le logo est partagé avec le header, une largeur fixe sur son root vaudrait
pour les deux consommateurs) ; le rouvrir ici serait un bump hors périmètre (spec : « aucun
changement de contrat »).

**Conséquence sur les re-pins** : zéro contrat modifié ⇒ **zéro re-pin** golden / engine.receipt /
catalog / polaris. Le seul repin est `integrations/odoo/config/inputs.lock.json` (+3 entrées, D3).

## D2 — Route de projection : le footer **système** de `website.layout`, patron 022

**Decision**: le footer est livré comme le header 022 — un gabarit QWeb **standalone**
(`footer_bar`) rendu par un gabarit d'héritage qui remplace la zone footer native de
`website.layout`, naissant `active="False"` et activé par la finalisation (hook/migration) qui
désactive le footer par défaut d'Odoo. Zone manuelle comptée `ODOO-023-*`, classes de la CSS
générée (`components.pqr.css`) + `data-pqr-part`, SVG gouvernés inlinés (logo, icônes
facebook/instagram — `emit-html` n'émet pas les vectorAssets/icônes, limite déjà nommée en 022).

**Rationale**: FR-001/FR-003 — le footer vit dans le layout, se re-rend à chaque requête, apparaît
sur chaque page. C'est la propriété qui rend la gouvernance structurellement tenable (US3) : par
opposition aux snippets, **rien n'est cloné ni sauvegardé en HTML** — même argument que le header,
déjà inscrit dans le commentaire de `SHELL_CONTRACT_IDS`.

**Alternatives considered**: snippet droppable — rejeté (viole FR-001, et un bloc droppé est une
copie HTML morte : leçon 018) ; édition du footer natif d'Odoo via l'éditeur (zone COW) — rejeté
comme ROUTE DE LIVRAISON (voir D5 : la copie COW fige l'arch et sort le gabarit de la projection).

**Inconnu résiduel → spike S1** (bloquant avant tout QWeb) : l'ancrage xpath exact de la zone
footer d'Odoo 19 (`//footer` / `#bottom` / `t-call` du template footer par défaut), le nom du
template natif à désactiver, et la preuve que NOTRE gabarit hérité échappe au mécanisme COW tant
que personne n'édite le footer dans l'éditeur. Le spike lit `website_templates.xml` de l'instance
épinglée, comme `spike-header.json` l'a fait pour la zone nav (`//header//nav`).

## D3 — Racine **shell** n° 2 : `ds.footer` entre au lock sans devenir posable

**Decision**: `ds.footer` rejoint `SHELL_CONTRACT_IDS` dans `scripts/odoo/lib/repo-data.ts`
(catégorie créée par 022 — l'ajout est une entrée de tableau, pas un mécanisme nouveau). La
fermeture de l'intégration gagne `ds.footer-column` et `ds.copyright` ; `inputs.lock.json` est
repinné explicitement avec **3 nouvelles entrées** (footer 1.1.0, footer-column 1.1.0, copyright
1.0.0 — chemin + version + SHA-256). `npm run odoo:assets` régénère `components.pqr.css` avec la
fermeture élargie.

**Rationale**: patron 022 D12 à l'identique. La catégorie shell existe, est comprise par
`check-module` (pas d'inscription snippet exigée) et par la QA. Vérification à faire en
implémentation : aucun script ne suppose « exactement un shell » (022 n'en avait qu'un).

**Alternatives considered**: aucune — c'est le mécanisme existant, la règle prior-art interdit
d'en inventer un autre.

## D4 — La table de verdicts d'éditabilité : la gate humaine OUVRE le plan

**Decision**: la proposition exhaustive — **un verdict par prop et par part** de `ds.footer` ET
`ds.footer-column` (occurrences imbriquées piqueray-logo / button / copyright comprises) — est
livrée par ce plan dans [`contracts/verdicts-editabilite.md`](./contracts/verdicts-editabilite.md).
**Aucune implémentation ne démarre avant validation explicite de l'owner** ; la table validée fait
foi et devient `integrations/odoo/config/footer.authoring.json` (schéma 019, un verdict par
adresse canonique, `odoo:authoring:check` échoue sur toute adresse sans décision).

**Rationale**: exigence de processus du spec (checkpoint bloquant, repris du wave-b). Le format
JSON est celui de `header.authoring.json` ; la table markdown est la forme lisible pour le verdict
owner, le JSON la forme exécutable pour la porte.

**Écart nommé vis-à-vis de 022** : le header avait marqué TOUTES les props du CTA `not-editable` ;
la proposition 023 distingue `fixé par composition` (valeurs que `ds.footer` fige lui-même :
`variant`, `children`, `iconRight`) de `non éditable` (props laissées au défaut : `iconLeft`,
glyphes). C'est plus exact vis-à-vis du contrat ; l'owner tranche à la gate — harmoniser sur le
précédent 022 est une issue acceptable et ne change aucun mécanisme.

## D5 — Persistance du contenu éditable : **donnée, jamais DOM sauvegardé** — spike S2 décisif

Le point technique central de la feature (l'Assumption du spec le nomme : le header avait
`website.menu`, une donnée native ; le footer a du **texte libre**).

**Decision**: le contenu éditable (3 textes de colonnes + copyright) vit en **donnée Odoo semée
une fois**, rendue par le gabarit système à chaque requête. Le candidat par défaut est un
enregistrement dont les champs sont rendus par **`t-field`** — le mécanisme natif d'Odoo pour
éditer un champ inline dans l'éditeur website (l'édition écrit dans la BASE, pas dans la vue) ;
c'est exactement la séparation exigée : l'arch reste système (apparence gouvernée, re-rendue), la
donnée survit à `-u piqueray_ds` (FR-014/SC-004). Le spike S2 tranche l'hôte du champ
(`website` étendu par le module / modèle ad hoc minimal / `ir.config_parameter`) et prouve la
chaîne complète : édition inline → save → reopen → public → **update du module** → contenu intact.
Repli si `t-field` n'est pas éditable inline dans l'éditeur 19 : champs + panneau minimal (le spec
autorise « en inline ou via un réglage » pour le copyright ; pour les colonnes, FR-005 exige
« l'éditeur standard » — le verdict de repli remonte à l'owner AVANT le QWeb).

**Rationale**: la troisième voie — laisser Odoo sauvegarder le DOM du footer (COW de la vue) —
est **rejetée par principe** : la copie COW fige l'arch entière du gabarit ; toute évolution
ultérieure du template ne se propagerait plus (c'est le « HTML mort » de 018, appliqué au shell),
et le commentaire de `SHELL_CONTRACT_IDS` interdit déjà le HTML sauvegardé pour un shell. SC-006
(propagation CSS) survivrait à un COW, mais FR-004 (« régénérable par projection ») non.

**Alternatives considered**: (a) champs natifs `res.company` (adresse/téléphone existent) —
rejeté : le mapping tordrait la sémantique (« Horaires » n'y existe pas, le texte des colonnes est
libre avec retours à la ligne) et créerait un couplage silencieux avec la fiche société ;
(b) `ir.config_parameter` seul — candidat de repli honnête, mais sans édition inline native (il
faudrait un panneau), donc deuxième choix ; (c) COW — rejeté ci-dessus.

**Règle de semis** (patron 022 D8) : les contenus sont semés **une fois** à la livraison depuis
les `sample`/`default` des contrats (Adresse / Horaires / Contact + le texte copyright), garde
d'idempotence `ir.config_parameter` comme `hooks.py` le fait déjà — jamais re-semés, jamais
écrasés par une régénération ou un update.

## D6 — URLs des réseaux sociaux : réglage natif du site — spike S3

**Decision**: les icônes Facebook/Instagram sont rendues par le gabarit (design du contrat, taille
~31.86px, encre `{color.noir-bleute}`), enveloppées dans des liens `<a>` (adaptation manuelle,
comme le `logo-link` du header). Les **URLs** viennent des champs natifs du modèle `website`
(`social_facebook`, `social_instagram` — réglages « Liens réseaux sociaux » du site), éditables
par le rédacteur via Réglages du site — **aucun panneau à construire**. Spike S3 : confirmer la
présence et le nom exact de ces champs sur Odoo 19 épinglé, et le comportement si le champ est
vide (le spec fixe : les icônes sont fixées par le gabarit — pas de retrait conditionnel cette
itération ; une URL vide rend un lien vers la valeur par défaut semée, jamais une icône absente).

**Rationale**: FR-011 demande des liens cliquables aux URLs éditables « via un mécanisme de
réglage Odoo » ; la clarification du spec désigne « `ir.config_parameter` ou équivalent » — les
champs sociaux natifs de `website` SONT l'équivalent natif, exactement comme `website.menu` était
la donnée native du header (verdict `controlled`, mécanisme `native-settings`). Prior-art : ne pas
inventer un réglage quand Odoo en possède un.

**Alternatives considered**: `ir.config_parameter` dédiés — rejeté si S3 confirme les champs
natifs (donnée mieux logée, UI existante) ; retenu comme repli si Odoo 19 ne les porte plus.

## D7 — Le CTA « Contactez-nous » : pont existant, cible figée

**Decision**: réutilisation du pont `ODOO-019-CTA-LIEN-BRIDGE` (`t-call="piqueray_ds.pqr_button"`
+ `link_href`), variante `outlineBlanc`, `icon_right` False (le contrat fige `iconRight: false`),
libellé « Contactez-nous », cible `/contactez-nous` figée dans le gabarit — non éditable cette
itération (clarification du spec, même patron que le header).

**Rationale**: le pont existe, la CSS de `ds.button` est déjà dans la fermeture ; rien à créer.

## D8 — Adaptations manuelles prévues (registre `ODOO-023-*`)

**Decision**: chaque bloc manuel est borné et enregistré (`odoo:derivation:check`) :

| Marqueur | Contenu | reasonCode pressenti |
|---|---|---|
| `ODOO-023-FOOTER-QWEB` | gabarits `footer_bar` (standalone) + héritage layout | shell système, patron 022 |
| `ODOO-023-CONTENUS-SEED` | semis unique des textes colonnes + copyright + activation/désactivation des gabarits (hook/migration, garde d'idempotence) | donnée semée une fois |
| `ODOO-023-LIENS-SOCIAUX` | enveloppes `<a>` des icônes + lecture des champs sociaux du site | capacité Odoo hors contrat |
| `ODOO-023-FOND-LARGEUR` *(si nécessaire après S1/visuel)* | pose/adaptation du plan de fond ou de la largeur côté Odoo (le root contrat porte 1728px desktop ; le Background absolu 1728×459) | adaptation viewport, Odoo seulement |

Le 4ᵉ n'est créé QUE si la mesure visuelle l'exige — jamais préventivement, et jamais dans la CSS
générée (frontière 3 du README : une valeur retouchée dans `generated/` est un drift invisible).
Le manifest (`__manifest__.py`, hors registre) bump sa version et la migration associée porte
l'activation pour les instances existantes (patron `migrations/19.0.1.6.0/`).

## D9 — Preuves : mêmes instruments, cinq reçus

**Decision**: aucun instrument nouveau. Sujet visuel `integrations/odoo/qa/visual/subjects/footer.mts`
(référence `emitHtml` de `ds.footer` au clip épinglé vs capture Odoo — même harnais, hôte QA
`piqueray_ds_qa` comme le header) ; scénarios :

| Reçu | Prouve | SC |
|---|---|---|
| `footer-visual` | design exact vs référence, sous la tolérance du projet | SC-001 |
| `footer-edit.spec` | édition des textes autorisés : edit → save → reopen → public | SC-002, SC-003 |
| `footer-update.spec` | `-u piqueray_ds` après édition : contenu conservé | SC-004 |
| `footer-pages.spec` | footer sur chaque page ; header + 10 sections intacts | SC-005 (FR-008) |
| `footer-regen.spec` | variation de token dans la CSS régénérée → visible à la requête suivante, textes intacts | SC-006 |

**Rationale**: 022 D14 à l'identique ; SC-004 est le seul reçu de forme nouvelle (update de module
après édition) et il vit dans le scénario, pas dans un instrument.

## D10 — Portes, re-pins, rouges éventuels

**Decision**: sweep constitutionnel complet DANS le worktree (F1 : `npm install` +
`npx playwright install chromium` d'abord) + suite Odoo (`odoo:inputs:check`,
`odoo:authoring:check`, `odoo:assets -- --check`, `odoo:module:check`, `odoo:derivation:check`,
`odoo:typecheck`, `odoo:visual:selftest -- --strict`). Aucun contrat/token/schéma/émetteur
modifié ⇒ le sweep du dépôt doit rester vert **sans aucun re-pin** ; toute porte qui rougirait
signalerait une erreur de périmètre, pas un re-pin à faire. Si le schéma d'authoring 019 doit
apprendre un `mechanism` nouveau (`native-settings`, `inline-field`), l'ajout est **additif à
l'enum** — même geste que `native-menu` en 022 (D13), nommé dans le registre des décisions.

## D11 — Spikes mécanisme (séquence de portage, étape 3) — AVANT tout QWeb

| Spike | Question fermée | Reçu |
|---|---|---|
| **S1** | zone footer de `website.layout` 19 : ancrage xpath, template natif à désactiver, activation par hook, immunité COW du gabarit système | `proofs/spike-footer.json` |
| **S2** | persistance du texte libre : hôte du champ, édition inline `t-field` dans l'éditeur 19, chaîne edit→save→reopen→public→**update**→intact | `proofs/spike-persistance.json` |
| **S3** | champs sociaux natifs du site sur 19 (`social_facebook`/`social_instagram`), édition par Réglages, comportement champ vide | `proofs/spike-social.json` |

Chaque spike est un relevé sur l'instance épinglée (`odoo:19.0-20260803`), documenté avec ses
sources (fichier:ligne du code Odoo lu), au format de `spike-header.json`. **S2 est bloquant pour
la gate humaine au sens fort** : si le mécanisme retenu change le verdict d'une adresse (ex. :
copyright éditable seulement par panneau), la table retourne à l'owner avant le QWeb.

## D12 — Honnêteté : limites nommées d'avance

- **Responsive mobile hors périmètre** — le footer rend la largeur desktop de la référence
  (Out of Scope du spec) ; différé, nommé dans les artefacts livrés.
- **Icônes sociales fixées** — pas d'ajout/retrait de réseau ; une URL vide ne retire pas l'icône.
- **Titres de colonnes figés** — « Adresse », « Horaires », « Contact » ne sont pas éditables.
- **Panneau de settings minimal** — rien au-delà du nécessaire pour URLs et copyright (et rien du
  tout si S2/S3 confirment l'inline + les réglages natifs).
- **Sémantique HTML** — le contrat déclare `element: "div"` ; l'élément `<footer>` du layout
  d'Odoo reste l'hôte sémantique. Aucun bump de contrat pour ça cette itération (même famille de
  différé que la sémantique React du header).
- **2 portes Odoo rouges pré-existantes** (citées par 022 sans re-diagnostic) : si elles sont
  encore rouges au démarrage, elles sont re-citées telles quelles — jamais réparées en douce dans
  cette feature, jamais comptées comme causées par elle.
