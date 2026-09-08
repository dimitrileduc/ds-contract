# Formulaire — étape 0, candidat v2, contrat 3.0.0 (2026-09-08)

**Contexte.** `ds.formulaire` était le seul contrat de section sans bloc Odoo, sans config d'édition,
sans page de test, sans mention nulle part dans la vague 031, et encore ancré sur le master v1
(`2096:2564`, `dumpedAt 2026-07-27`). Journée du 2026-09-08 : audit de la source, planche 031·21,
brainstorm des états validé par l'owner, relevé, contrats de toute la famille de saisie, correctifs
d'émetteur, portes. **Le bloc Odoo n'est PAS encore écrit** (voir « Reste à faire »).

## Étape 0 — audit de la source (master `2096:2564`, lecture seule)

| # | Défaut | Nature | Effet |
|---|---|---|---|
| 1 | `SectionHeader` de **1550** posé dans une colonne de **759** | structurel | le titre déborde de 791 px et se COUPE — le master n'a jamais montré son titre |
| 2 | En-tête `Alignement=Centre` dans une colonne alignée à gauche | structurel | axe de lecture cassé |
| 3 | Les **7** champs HUG à **125 px** dans des rangées de 695 (Message 208) | structurel | les champs occupent 18 % de la largeur — c'était du HUG là où il faut FILL |
| 4 | **Deux CTA identiques** « Contactez-nous » à gauche, dans le bloc qui contient le formulaire | à retirer | inutiles (décision owner) |
| 5 | CTA du formulaire libellé « Contactez-nous » sous une phrase de consentement qui dit « Envoyer » | incohérence | le texte de loi ne désignait aucun bouton |
| 6 | Colonne 629 / panneau 723, top-alignés | structurel | 94 px de vide |
| 7 | Aucune liaison de variable sur paddings/gaps | non lié | l'extraction ne porterait rien |
| 8 | `Field` et `Avantage` sans **aucun style de texte** (vérifié nœud par nœud) | non lié | pas responsive autrement que par surcharge |
| 9 | `Avantage` : hauteur **figée à 75** | structurel | un texte sur 3 lignes déborde sur le suivant (mesuré) |
| 10 | Libellé de `Field` lié à `color/bleu-gris` : **2,32:1** sur bleu-clair ; bordure des champs **2,51:1** sur blanc | accessibilité | sous les seuils 4,5:1 / 3:1 |
| 11 | `Input` : composant simple, **aucun état** (le Bouton en a 28 depuis la vague 032) | manque | aucun focus dessiné |

Côté surface générée (avant ce chantier) : champs **pré-remplis** de « Texte de saisie » (une valeur, pas
un placeholder), tous en `type="text"`, libellé en `<span>` non relié, pas de `<form>`, identifiant du
message d'erreur en dur (dupliqué), `outline: none` posé par l'émetteur. `a11y: null`, `events: null`.

Rien n'a été corrigé sur le master : les candidats v2 sont posés sur la planche 031·21.

## Décisions owner (2026-09-08)

- Option A « le même dessin, réparé » ; **5 champs** (Adresse et Sujet retirés — se demandent au rappel) ;
  Email et Message obligatoires, les trois autres optionnels et marqués « (optionnel) » ; un seul bouton **« Envoyer »**, pleine largeur.
- Padding vertical du panneau 48 → **64** (« ça respire pas »), écart des champs 24 → **32**.
- Icône de l'argument **responsive** : 40 · 40 · 64 · 64.
- États : erreur (résumé GOV.UK + message sous chaque champ fautif, mot pour mot), focus (recette des boutons),
  **succès option B** (sous le bouton, formulaire vidé, texte en `color/vert` — premier vert de la charte, #237A3C, 4,95:1). Pas de redirection.
- **Mécanique d'envoi côté hôte (option 2)**, sur le précédent des liens (2026-08-18) : le contrat gouverne
  l'apparence et les états, Odoo (`s_website_form`, cible `mail.mail`) porte `<form>`, destination, anti-spam.
  E-mail au client pour la v1, pas de CRM, pas d'accusé de réception au visiteur (hors périmètre).

## Planche 031·21 (`2782:36037`) — ce qu'elle porte

Jeu `Formulaire` (`2782:38403`, clé `c9fd2b57…`) à 4 variantes aux largeurs d'écran avec gouttière
24/48/56/89 dans la section ; `Field · candidat v2` (`2782:43327`, Etat Normal|Erreur, libellé lié à
`typography/body/*` par mode, marque `Obligatoire`, `Saisie` → candidats) ; `Input`/`Textarea · candidat v2`
(State Default|Focus Visible) ; `Select · candidat v2` (composant simple, sans axe — focus code-only) ;
`Avantage · candidat v2` (icône liée à `spacing/avantage/icone`, Responsive) ; trois croquis de référence
(erreur, focus, succès B) ; la note d'audit. Nouvelles variables : `color/vert`, `color/etat/champ/anneau-focus`,
`spacing/avantage/icone` (40/40/64/64, littéraux par mode comme `spacing/product-card/width`),
primitives `size/avantage/icone/<mode>` et `size/formulaire/panneau/desktop|wide`.

Relevé : dump v1.8 des 6 candidats par IDENTIFIANT (deux jeux s'appellent « Formulaire »),
`.page-parity/vague-031/dumps-formulaire/`, propositions `proposals-formulaire/` (0 valeur non liée).

## Contrats (étape 2) — classement des notes et ce qu'ils portent

| Note de la proposition | Sort |
|---|---|
| `imported.*.font-size/weight/line-height.<mode>` (accroche, titre) | **renommé** : accroche → `typography.overline.*`, titre → `typography.h2.*` (échelle relevée sur Réalisations, FAQ, Réassurances) |
| `imported.formulaire.root/column/form.width.<mode>` (342/738/1088/1550 · 759…) | **témoins, supprimés** : racine `width: fill` + `referenceWidth 1728` ; panneau → `size.formulaire.panneau.desktop|wide` (528/759, motif ds.coordonnees : un côté fixe, l'autre grandit) |
| `imported.*.gap`, `padding-*` (48/32/16/24/64) | **renommés** vers `space.*` existants |
| 5 `Field` proposés en `repeat` sur un tableau | **rejeté** : cinq champs distincts, nommés (`champPrenom`… `champMessage`) |
| stubs `ds.field-candidat-v2`, `ds.avantage-candidat-v2` | **mappés** sur `ds.field` 3.0.0 et `ds.avantage` 2.0.0 (ancres → candidats) |
| `Bouton` : prop `State` non mappée | attendu (aperçu d'état canevas) |
| `letter-spacing 15 %` non porté par le dump | `literals letter-spacing 0.15em` + `declared text-transform uppercase`, comme ds.coordonnees 3.0.0 |
| liaisons typographiques des textes (trou d'instrument connu : le dump v1.8 ne lit pas `boundVariables` des textes) | posées à la main, nommées dans les descriptions |

Versions : `ds.formulaire` **3.0.0**, `ds.field` **3.0.0**, `ds.input` / `ds.textarea` / `ds.select` / `ds.avantage` **2.0.0**
(ancres sur les candidats, `dumpedAt 2026-09-08`). Jetons : `color.vert` (primitives), `color.etat.champ.anneau-focus`
(alias en SEMANTIC), `size.avantage.icone.<mode>`, `size.formulaire.panneau.<mode>`, `spacing.avantage.icone`
(base + 3 surcharges viewport).

Ce que `ds.formulaire` porte par mode :

| | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| racine | colonne, gap 48, padding-inline 24 | colonne, 48, 48 | **rangée**, gap 32, 56, align center | rangée, 32, 89 |
| panneau | fill, pad 24/32 | fill, pad 48/64 | **528** fixe, pad 48/64 | **759** fixe, 48/64 |
| paires Prénom\|Nom, Email\|Tél. | **empilées** | rangée | rangée | rangée |
| accroche / titre | 14/20 Reg · 24/30 SemiB | idem | 16/20 Med · 32/40 | 20/25 Med · 40/50 |

Props code-only : `etat` (normal|erreur, forwardé à `champEmail` et `champMessage`), `envoye`, `succes`.
Parts d'état : `ResumeErreurs` (role=alert, tabIndex -1, barre `space.4` rouge, titre h4 SemiBold, deux « liens » orange soulignés — textes ici, ancres côté Odoo), `Succes` (role=status, `color.vert`).

## Correctifs d'émetteur (core/), chacun prouvé par une éval

- `emit-react` : attributs DOM booléens en booléens (`required={Boolean(required)}` — `"required"` était une erreur TS) ;
  liste FERMÉE d'attributs où une valeur liée vide est ABSENTE (`id`, `name`, `htmlFor`, `placeholder`, `autoComplete`,
  `aria-describedby`, `aria-labelledby`, `aria-controls`) — `alt=""` garde son sens ; jetons `width/height` de base
  d'une part icône reportés sur le `<svg>` (le miroir 015 ne couvrait que les surcharges par variante).
- `emit-html` : orthographe HTML des attributs React (`htmlFor→for`, `autoComplete→autocomplete`, `tabIndex→tabindex`…),
  booléens nus, vides absents (même liste), `component.slots` honoré (avant : repli silencieux sur `defaultContent` — le
  champ Message rendait un `<input>`, sur la surface dont Odoo dérive), **`<textarea>` natif** à part de texte unique
  (avant : projeté en `<div>`, limite déclarée), miroir svg.
- `emit-react-inline` : `component.slots` honoré + dépendance importée (`Formulaire.inline.tsx` n'importait pas `Textarea`).
- Éval neuve : `form-attrs-boolean-empty-absent-and-html-spelling` (C1), adversariale sur les trois faits.

## Portes (2026-09-08, fin d'étape 2)

`build` ✓ · `geometry:gate` ✓ (0 littéral invisible) · `emitters:check` ✓ · `tsc` (src + build) ✓ ·
`plugin:check` ✓ (reçu re-pin) · `deterministic-roundtrip` ✓ · `core-browser-check` ✓ · `polaris --check` ✓ (régénéré) ·
`parity` **« No new drift », 19 acquittements, AUCUN neuf** (cliché rafraîchi 3 fois au pont) ·
`eval` **247/249** — les 2 rouges sont ceux du commit précédent (`figma-text-styles-piqueray`, `preservation-013-clobber-detected`) ;
le troisième (`golden-generated-output`) est vert après re-pin ; `odoo:authoring:check` ✓ · `odoo:module:check` 23/23 ·
`odoo:inputs:check` rouge (digest, attendu : re-pin à l'étape 3).

**Nommé, pas masqué** : `figma-text-styles-piqueray` était rouge à HEAD (96/99/28 pour 85/61/22 attendus) ; mes
candidats font bouger les comptes (93/115/32) parce qu'ils ne portent AUCUN style de texte. À traiter à l'adoption
(styles de texte sur les candidats), pas ici.

## Pièges d'outil trouvés (à ne pas rediscover)

1. Figma `FILL` répartit l'espace RESTANT, pas la largeur totale : deux colonnes de contenus différents ne tombent
   jamais à 50/50 (mesuré 711/807). Poser les moitiés explicitement au canevas.
2. Des instances imbriquées liées à la même propriété `INSTANCE_SWAP` bougent ENSEMBLE : l'état d'erreur d'un contrôle
   dans `Field` ne peut pas être un swap de variante — c'est une surcharge de trait (motif du master d'origine).
3. Lier la couleur d'un TEXTE à une variable avec une base noire a rendu le texte NOIR ; poser la vraie valeur en base
   règle le rendu. La capture du plugin peut revenir mise en cache (même poids d'octets) : capture serveur (REST) ou
   identifiant jamais capturé.
4. `resize()` sur un enfant de cadre d'instance s'exécute SANS erreur et ne fait rien.
5. Cloner une variante n'emporte pas les propriétés du jeu (Label/Optionnel/Saisie/Valeur) : à recréer et relier.
6. Les 10 ports du pont (9223-9232) étaient tous occupés : un résultat `figma_execute` volumineux est écrit ENTIER sur
   disque par l'outil (117 Ko vérifiés) — transport sans port pour le dump ET le cliché de parité.
7. La variable Responsive porte des valeurs LITTÉRALES par mode (`spacing/product-card/width` = 260/322/326/363) ; l'alias
   vers `size/…/<mode>` n'existe que côté jetons. Un alias au canevas fait un MISMATCH à la parité.

## Étape 3 — le bloc Odoo (2026-09-08, orchestrateur, pilote `piqueray-odoo-pilote` :8087)

**Option 2 tenue** : le contrat gouverne l'apparence et les états ; la mécanique d'envoi est celle d'Odoo
(`s_website_form` → `/website/form/` → `mail.mail`, destinataire `email_to`). Aucun code d'envoi à nous.

### Ce qui est posé
- `views/components.xml` zone `ODOO-036-FORMULAIRE-QWEB` (gabarits `pqr_piqueray`, `avantage`, `champ`, `s_pqr_formulaire`) ;
  `views/snippets.xml` zone `ODOO-036-FORMULAIRE-SNIPPET` ; `static/src/css/responsive/formulaire.pqr.css` (axe `presentation`
  par jeton, états pilotés par l'hôte, anneau de focus du Select, `.s_website_form_send` sans soulignement) ;
  `static/src/js/formulaire_interaction.js` zone `ODOO-036-FORMULAIRE-INTERACTION` (observe `o_has_error`/`is-invalid` et
  `#s_website_form_result`, bascule `field--etat-erreur`, `formulaire--etat-erreur`, `formulaire--envoye`, pose `aria-invalid`,
  montre + focalise le résumé, cache la ligne générique d'Odoo, montre la ligne verte) ;
  `authoring.js` : `PIQUERAY_ROOTS` + **`FORMULAIRE_EDITABLE_PARTS` / `FORMULAIRE_RICH_TEXT`** (sur-titre, titre gras autorisé,
  3 × argument titre/texte, consentement, succès) ; `formulaire.authoring.json` (8 occurrences, 51 contrôles, 69 parts) ;
  `repo-data.ts` (`ds.formulaire`, `.s_pqr_formulaire`, `closureOf` suit les slots) ; `adaptation-registry.json` (+3) ;
  miroirs de version (`version_guard.js`, `scan-saved-versions.ts`, `version-drift/cases.json`, module 19.0.1.16.0) ;
  `inputs.lock.json` re-épinglé ; page `authoring/pages/formulaire-test.json` ; `visual-parity/subjects.ts` (+formulaire).
- Contrat : `Titre` en **`element: h2`** (comme les autres sections v2) — c'était la seule cause du +8 px en 390/834 :
  le `<h2>` du gabarit héritait la marge basse Bootstrap (8 px), l'émetteur la remet à zéro quand le contrat déclare l'élément.

### Mesure (bloc Odoo contre planche 031·21, même boîte, `capture-bloc.mts` + `mesure-bloc.mjs`)
| largeur | planche | Odoo | hauteur | diff |
|---|---|---|---|---|
| 390 | 390 × 1510 | 390 × 1510 | +0 | 2,45 % |
| 834 | 834 × 1132 | 834 × 1132 | +0 | 1,52 % |
| 1200 | 1200 × 687 | 1200 × 687 | +0 | 2,16 % |
| 1728 | 1728 × 663 | 1728 × 663 | +0 | 1,79 % |

Le résidu est le rendu de police (anti-aliasing Figma vs Chromium) ; l'icône Piqueray est identique au pixel aux 4 largeurs
(`icone-mesure.mjs`). Sonde de boîtes (`sonde.mts`) : colonne et panneau aux 4 largeurs à ±0 après le passage en `h2`.

### Comportement (`.page-parity/vague-036/comportement-formulaire.mts`, visiteur anonyme, Chromium)
- Envoi vide → `formulaire--etat-erreur`, champs `email_from` + `message` en `field--etat-erreur` et `aria-invalid="true"`,
  deux messages par champ visibles, résumé montré ET focalisé (`formulaire__ResumeErreurs`), ligne Odoo « Merci de remplir… »
  cachée. Envoi plein → `formulaire--envoye`, ligne verte (#237A3C) visible, formulaire vidé, ligne Odoo cachée,
  **une ligne `mail_mail` de plus** vers `info@piqueray.be` (état `exception` : aucun SMTP sur le pilote — attendu).
- axe-core 4.10.3 sur le bloc : repos **0**, succès **0**, erreur **1** — `color-contrast` sur `LienEmail`/`LienMessage` :
  orange `#F98A0B` sur bleu-clair `#F4F6FA` = **2,23:1** (4,5 attendu). Vient de la planche (liens orange validés).
  Candidats mesurés : `color.rouge` 4,60 ✓ (cohérent avec l'état d'erreur), `color.bleu` 9,86, `color.noir-bleute` 13,65.
  **Tranché par l'owner (2026-09-08) : `color.rouge`.** Posé Figma d'abord (croquis erreur `2782:42025`, deux textes « Lien »
  reliés à `color/rouge`, capture avant/après), puis contrat (`LienEmail`/`LienMessage` → `{color.rouge}`), puis pilote :
  axe-core **0 violation aux trois états**.
- **Retour owner au test manuel** : après correction d'un seul des deux champs, le résumé gardait ses deux liens. Corrigé
  dans l'interaction (chaque lien suit son champ par `href="#<id>"`) ; l'instrument a gagné l'étape « e-mail corrigé, message
  vide » → `LienEmail:caché`, `LienMessage:visible`.
- Le corps du mail liste les champs par leur attribut `name` (`prenom`, `nom`, `e-mail`, `telephone`, `message`) — convention
  Odoo (le `name` d'un champ personnalisé EST son libellé). Lisible ; à franciser avec accents si le client le demande.

### Édition (`.page-parity/edit-formulaire.mts`, rédacteur, étape 9)
Sur-titre + titre modifiés → save RPC 200 → relus en public **conservés** → remis à l'original **conservés** ; les 8 contrôles
du formulaire intacts après chaque enregistrement ; champs, `<form>` et bouton en `contenteditable=false` (structure gouvernée).
**Défaut trouvé par ce test** : sans `FORMULAIRE_EDITABLE_PARTS` dans `authoring.js`, TOUT le bloc était gelé (`o_pqr_editable`
posé par le QWeb, jamais `o_editable`) — `odoo:authoring:check` et `odoo:module:check` étaient verts quand même. Aucune porte
ne relie une config d'authoring à la liste JS : lacune nommée (voir runbook, complément 2026-09-08).

### Faits code-only (dans `formulaire.pqr.css`, chacun commenté)
Axe `presentation` par viewport (jetons) ; `flex: 0 0 auto` du panneau (A6, lacune connue) ; visibilité conditionnelle
(`visibleWhen` non projeté par `emit-html`) ; couleur de bordure en erreur re-portée par classe (`control.styles` émis inline) ;
`.is-invalid` de Bootstrap neutralisé (fond image) ; `:focus-within` du Select ; `text-decoration: none` du déclencheur `<a>`.

### Réglages client, hors code
Serveur SMTP (16 mails en `exception` sur le pilote), `email_to` réel (gabarit : `info@piqueray.be`), clés reCAPTCHA (module installé,
non configuré), sujet du mail (« Demande de contact — site Piqueray »).

## Reste à faire

Styles de texte sur les candidats
à l'adoption. Légende « champs suivis d'un astérisque » différée. `docs/` : matrice/README non touchés (aucune capacité neuve
revendiquée). Commit : à la demande de l'owner, fichiers de cette vague uniquement.

## Fichiers touchés (étape 2)

`contracts/{formulaire,field,input,textarea,select,avantage}.contract.json` · `tokens/{primitives,semantic}.tokens.json` ·
`tokens/modes/viewport.{tablette,desktop,wide}.tokens.json` · `core/{emit-react,emit-html,emit-react-inline}.ts` ·
`evals/run.ts` (+1 cas) · re-pins : `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/generated/*` ·
`parity/snapshots/{figma-components,figma-tokens}.json` (cliché frais) · dérivés régénérés (`src/components/`, `core/samples/`,
`figma-sync/*.js`, `integrations/odoo/.../generated/*`). Le worktree porte aussi 77 fichiers d'une autre session, laissés tels quels (consigne owner).

## Fichiers touchés (étape 3)

`integrations/odoo/addons/piqueray_ds/{__manifest__.py, views/components.xml, views/snippets.xml, static/src/css/responsive/formulaire.pqr.css,
static/src/js/{formulaire_interaction.js, authoring.js, version_guard.js}}` · `integrations/odoo/config/{formulaire.authoring.json,
adaptation-registry.json, inputs.lock.json}` · `integrations/odoo/authoring/{README.md, pages/formulaire-test.json}` ·
`scripts/odoo/{lib/repo-data.ts, scan-saved-versions.ts}` · `evals/fixtures/odoo-production/version-drift/cases.json` ·
`specs/019-odoo-production-foundation/contracts/adaptation-registry.schema.json` (enum +`ds.formulaire`) ·
`extract/figma/visual-parity/subjects.ts` · `package.json` (+`axe-core`) · `contracts/formulaire.contract.json` (Titre `h2`) ·
instruments gitignorés `.page-parity/{edit-formulaire.mts, vague-036/{comportement-formulaire.mts, sonde.mts, sonde-editeur.mts, axe.mts, icone-mesure.mjs, planches/, odoo/, mesure/}}`.
