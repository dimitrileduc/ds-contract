# TinySpec: odoo-cta-link-review-note — CTA-lien gouverné + note d'avis dans l'addon Odoo

**Branch**: 021-figma-projection-repair · **Date**: 2026-08-18 · **Status**: done · **Complexity**: small (documentation rétroactive d'un changement déjà livré et prouvé sur instance ; décision owner du 2026-08-18) · **Commit**: `cc6cd0d`

> Rétroactive. **Étend la spec 019 (`odoo-production-foundation`), qui est CLOSE** : 019 gouverne l'*état* du CTA (afficher/masquer), jamais son *lien*, et ne connaît ni la note d'avis ni la dérivation d'avatar. Plutôt que rouvrir une spec numérotée close, ce récit vit ici. Côté contrat/DS, sa jumelle : [[review-card-2.0.0-notation]].

## What

Trois extensions de gouvernance dans l'addon Odoo de production (`integrations/piqueray_ds`, module **19.0.1.4.0**), toutes sur décision owner du 2026-08-18 :

1. **CTA-lien gouverné.** Une section peut régler le lien de son CTA au panneau. Le lien est une **ADAPTATION ODOO, jamais une prop de contrat** — aucun contrat ne porte de notion de lien, `ds.button` reste un `<button>` sur la surface React. Une seule action `pqrSetCtaHref` pilotée par `actionParam` (pas une sous-classe par section) : absolu même-origine replié en relatif, `javascript:` refusé sans casser le lien existant. Le bouton se projette en `<a>` si `link_href` est fourni, en `<button>` sinon — rendu identique (100 % par classes générées), seul le soulignement UA de l'ancre est neutralisé au pont.
2. **Note d'avis au panneau.** `review-card` 2.0.0 ([[review-card-2.0.0-notation]]) porte une note enum ; l'action `pqrSetReviewNote` (un `BuilderSelect` à cinq entrées) déplace le `hidden` sur les cinq bandes déjà rendues — elle ne **construit rien** (un bloc Odoo posé est une copie HTML gelée, Odoo ne propage pas master→instance).
3. **Avatar dérivé, plus basculé.** L'avatar est décidé par la **présence d'une source photo publiée** (`reconcileAvatar`), plus par deux booléens de rédacteur. L'alternative (`alt`) est **dérivée de l'auteur** de la carte plutôt qu'exigée : une photo publiée s'affiche aussitôt, son `alt` se remplit tout seul si le rédacteur ne l'a pas saisi.

## Contexte de correction — trois défauts mesurés le 2026-08-18 sur l'instance de qualification

- **Vol de focus en édition.** Un ancêtre focusable (le `<button>` PUIS l'`<a>` du CTA) gagnait le focus contre son propre libellé éditable. Parade `pointer-events` au pont, keyée sur le **hook d'hôte** `[data-pqr-part="button-root"]` — donc elle couvre aussi les quatre CTA encore rendus en `<button>` (FAQ, Devis, SAV), pas seulement le lien.
- **Pastille photo fantôme.** Un `getValue` appelait `avatarImage` (effet de bord : crée le conteneur) à la sélection de carte → pastille vide de 40 px insérée sous les yeux du rédacteur. Corrigé par un lecteur pur `avatarImageExistante`.
- **Photo → placeholder à la sauvegarde.** Réécrire `src` dans un `onAttachmentChange` cassait le cycle média natif ; l'exception `o_modified_image_to_save` (data URL en attente jusqu'au `before_save`) est désormais reconnue par un seul foyer `sourceEnAttenteNative`.

## Context

| Fichier | Rôle |
|---|---|
| `…/static/src/js/authoring.js` | `SetCtaHrefAction` **unique** (id `pqrSetCtaHref`), part lue via `params.mainParam` ; `normaliserCtaHref` (repli même-origine, `javascript:` refusé). Chaîne noyau vérifiée sur Odoo 19.0 : `BuilderUrlPicker` → `actionParam` → `convertParamToObject` → `{mainParam}` |
| `…/static/src/js/repeat_action.js` | `SetReviewNoteAction` (`BuilderSelect` enum) : `getValue` foyer unique, `isApplied` dérivé ; une seule traversée DOM des cinq bandes |
| `…/static/src/js/media_action.js` | `reconcileAvatar` : avatar dérivé (`data-avatar` Photo/Initiale), `alt` dérivé de l'auteur ; `sourceEnAttenteNative` (un seul foyer, 5 copies avant) ; `isPublishedAvatarSource` sort tôt sur `data:` |
| `…/static/src/xml/authoring.xml` | `BuilderUrlPicker` (Hero, Présentation) → `pqrSetCtaHref` + `actionParam` ; `BuilderSelect` note (5 entrées, `preview="false"`) |
| `…/views/components.xml` | `pqr_button` projette `<a link_href>`\|`<button>` (classe hoistée) ; `pqr_notation` (5 bandes) ; versions/digest à jour |
| `…/static/src/css/odoo-bridge.css` | `ODOO-019-CTA-LIEN-BRIDGE` : `text-decoration:none` scopé racines, parade focus keyée `[data-pqr-part="button-root"]` |
| `…/static/src/js/version_guard.js` · `scripts/odoo/scan-saved-versions.ts` | Transcriptions du digest `102c372a…` + module `19.0.1.4.0` (tenues ensemble par `check-module.ts`) |
| `integrations/odoo/config/adaptation-registry.json` | `ODOO-019-CTA-LIEN-BRIDGE` déclaré (racines `ds.hero`, `ds.presentation`) |
| `integrations/odoo/config/inputs.lock.json` · `derivation-report.json` | **Repin** sur la fermeture 2.0.0 (digest `102c372a…`) ; rapport régénéré |
| `integrations/odoo/qa/lib/editor.mts` · `qa/scenarios/*.mts` | Gestes partagés `frapperAuClicHumain`/`poserHref` ; scénarios adaptés à la note enum et à l'avatar dérivé ; fixture version-drift à jour |

## Requirements

1. Une seule action `pqrSetCtaHref` sert toutes les sections via `actionParam` ; ajouter un CTA = une rangée XML, pas une sous-classe.
2. Grammaire du lien tenue : relatif accepté, absolu même-origine replié, `javascript:` refusé sans casser l'existant.
3. Le CTA se projette `<a>`/`<button>` selon `link_href` ; rendu identique aux classes générées ; soulignement UA neutralisé au pont.
4. La note d'avis se pilote au panneau (`BuilderSelect`), déplace le `hidden` des cinq bandes, ne construit aucune structure.
5. L'avatar est dérivé de la présence d'une photo publiée ; `alt` dérivé de l'auteur ; zéro état absurde possible.
6. La parade de focus est keyée sur le hook d'hôte, couvrant les CTA `<a>` ET `<button>`.
7. Le lock est repinné sur la fermeture 2.0.0 ; les quatre portes Odoo vertes ; QA rejouée verte sur instance propre.

## Plan

1. Unifier `SetCtaHref` sur `actionParam` ; XML Hero/Présentation → `pqrSetCtaHref` + `actionParam`.
2. `pqr_button` bicéphale (`<a>`/`<button>`) ; pont `odoo-bridge.css` (soulignement + parade focus sur le hook).
3. `SetReviewNoteAction` + `BuilderSelect` ; `reconcileAvatar` dérivé ; `sourceEnAttenteNative` foyer unique.
4. Repin `inputs.lock` (digest `102c372a…`), propager aux transcriptions (`version_guard`, `scan`, `components.xml`), régénérer le rapport de dérivation.
5. Rejouer la QA sur instance Docker propre ; corriger les fixtures de version-drift.

## Tasks

- [x] T1 — Action CTA unifiée `pqrSetCtaHref` (`actionParam`), grammaire du lien (repli/refus) ; XML Hero + Présentation
- [x] T2 — `pqr_button` `<a>`/`<button>` selon `link_href` ; pont soulignement + parade focus keyée `[data-pqr-part="button-root"]`
- [x] T3 — `SetReviewNoteAction` (`BuilderSelect`, `preview="false"`) ; `pqr_notation` cinq bandes
- [x] T4 — Avatar dérivé (`reconcileAvatar`), `alt` dérivé auteur, `sourceEnAttenteNative` foyer unique, lecteur pur `avatarImageExistante`
- [x] T5 — Repin `inputs.lock` (digest `102c372a…`) + transcriptions + rapport de dérivation
- [x] T6 — Gestes QA partagés + scénarios adaptés + fixture version-drift ; rejeu sur instance propre

## Done When

- [x] Quatre portes Odoo vertes : `inputs:check`, `derivation:check`, `authoring:check`, `module:check` (18/18)
- [x] QA sur instance Docker neuve : Hero **13/13**, Présentation **13/13**, Google Reviews **15/15**, Sécurité **14/14**, Versioning **6/6**
- [x] `npm run eval` **219/219**
- [x] Le CTA-lien est prouvé au panneau (absolu même-origine → relatif, `javascript:` ignoré) sur Hero ET Présentation, même action

## Écart constaté à la clôture (2026-08-18 — nommé, pas approximé)

- **Snapshot de parité Figma.** `parity/snapshots/figma-components.json` peut retarder sur les contrats 2.0.0 posés ce jour — relancer `npm run parity` pour reconfirmer canvas↔contrat (limite connue, pas un défaut mesuré).
- **Couche gouvernance non générique.** Chaque bloc accroche sa gouvernance à `const ROOT = ".s_pqr_<section>"` : une nouvelle section n'hérite de rien. Le coût de rendu est quasi nul (018), c'est la gouvernance qui coûte par section — à garder en tête pour le montage des sections restantes ([[review-card-2.0.0-notation]] n'y change rien).
