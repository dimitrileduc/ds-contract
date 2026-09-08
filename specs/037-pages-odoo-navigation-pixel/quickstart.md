# Quickstart — 037 · valider de bout en bout

Chaque scénario est exécutable et dit ce qu'on doit voir. Détails des documents : [data-model.md](data-model.md) ;
commandes et schémas : [contracts/README.md](contracts/README.md).

## 0. Prérequis (F1 — worktree autonome)

```bash
npm install && npx playwright install chromium
npm run build && npm run odoo:typecheck && npx tsc --noEmit
```
Attendu : build vert ; `node_modules` présent dans **ce** worktree (il était vide au 2026-09-08). `FIGMA_TOKEN` exporté
(lecture seule). Docker disponible ; instance jetable `piqueray-odoo-037` (compose QA, port libre) — **jamais 8071**.

## 1. Le résolveur et le contenu commun (sans Docker)

```bash
npm run odoo:pages:check            # résout les 9 pages, imprime le registre des restes
npm run odoo:pages:check -- --json  # même chose, JSON (destinations non tranchées : page, section, part)
npm run eval                        # cas odoo-pages-resolve-determinism-and-refusals présent et vert
```
Attendu : 0 refus sur les 9 pages ; `home.json` et `portes-de-garage.json` ne contiennent plus aucune section `s_pqr_devis` /
`s_pqr_reassurances` / `s_pqr_google_reviews_section` en clair (une copie locale est **refusée**). Preuve de refus (à la main,
puis dans l'éval) : mettre `"commun": "inconnu"`, une clé orpheline, `"links": {"hero-cta": "javascript:alert(1)"}`, un chemin
`/boutique` → quatre refus qui nomment fichier, section, valeur.

## 2. Reprise sans régression de Home et Portes de garage

```bash
npm run odoo:page -- home piqueray-odoo-037 && npm run odoo:page -- portes-de-garage piqueray-odoo-037   # AVANT reprise
npm run odoo:pages:measure -- home --base http://localhost:<port> --only-odoo --out .page-parity/037/avant
# … réécrire les deux descripteurs (commun par référence + destinations) …
npm run odoo:page -- home piqueray-odoo-037 && npm run odoo:page -- portes-de-garage piqueray-odoo-037   # APRÈS
npm run odoo:pages:measure -- home --base http://localhost:<port> --only-odoo --out .page-parity/037/apres
npm run images:compare -- --before .page-parity/037/avant/home/odoo-1728.png --after .page-parity/037/apres/home/odoo-1728.png --out .image-parity/037-home
```
Attendu : `identical` aux 4 largeurs pour les deux pages (les `href` ne changent pas un pixel).

## 3. Les sept pages neuves

```bash
for p in portes-residentielles portes-industrielles portes-entree motorisation depannage-sav a-propos contactez-nous; do
  npm run odoo:page -- $p piqueray-odoo-037; done
```
Attendu : `COMPOSE_OK` ×7 ; chaque URL répond 200 avec ses sections dans l'ordre de sa vue wide (tableau R1 de research.md).
Rejouabilité (SC-005) : relancer la boucle, `GET` de chaque page identique (comparer les `arch_db` ou les captures).

## 4. La navigation sur les neuf vraies pages

```bash
PQR_ODOO_PORT=<port> npx tsx integrations/odoo/qa/scenarios/pages-navigation.spec.mts
PQR_ODOO_PORT=<port> npx tsx integrations/odoo/qa/scenarios/pages-navigation.spec.mts --red /motorisation   # preuve rouge
```
Attendu (vert) : 9 pages × (liens bureau + mobile + en-tête + pied) → 100 % en 200 ; arbre rendu = `contracts/menu-tree.json`
(Motorisation sous Portes de garage) ; actif exact (enfant + parent ; aucun sur `/`). Attendu (rouge) : échec nommant
`/motorisation` et chaque page hôte du lien ; la page est republiée à la fin ; reçus sous `proofs/navigation/`.
Sur le pilote 8087 (déjà installé), le chemin update : `odoo -u piqueray_ds` → migration `19.0.1.17.0` re-parente Motorisation
seulement si elle est encore sous « Portes d'entrée ».

## 5. L'instrument de mesure, prouvé avant de servir

```bash
npm run odoo:pages:selftest          # hors ligne : 0 % / section décalée rouge / Δh 64 rouge + section nommée / ×2 identiques / impossible
npm run eval                         # cas odoo-page-parity-selftest vert
npm run odoo:pages:measure -- portes-de-garage --base http://localhost:<port>
npm run odoo:pages:measure -- home --base http://localhost:<port>
```
Attendu (SC-006) : Portes de garage — 4 rapports `mesurée`, scores du même ordre que la mesure manuelle (1,7–3,7 %),
`|Δh| ≤ 10` → `verdictHauteur: bruit`, `verdictPage: vert` ; Home — `verdictHauteur: rouge` aux largeurs où `Δh > 10`,
`sectionOrigineDecalage` nommée, score affiché **à côté** et jamais seul. Triptyques 1:1 sous `.page-parity/037/<page>/`,
sha256 dans les JSON de `proofs/mesure/`. Deux lancers → JSON identiques.

Cas volontairement rouge sur une vraie page : retirer la section Devis de `motorisation.json`, recomposer, mesurer →
`verdictPixel: rouge` + `structure: 6 vs 7 sections` ; remettre, recomposer, mesurer → vert. Reçu conservé.

## 6. Les 36 rapports

```bash
for p in home portes-de-garage portes-residentielles portes-industrielles portes-entree motorisation depannage-sav a-propos contactez-nous; do
  npm run odoo:pages:measure -- $p --base http://localhost:<port>; done
```
Attendu (SC-001) : 36 JSON, aucun manquant ; `impossible` seulement avec raison (capture en erreur) et alors au registre.
Tout écart de contenu (double espace, U+2028, titre Réassurances d'À Propos, graisse du titre hero de Motorisation/À Propos,
champs du formulaire) est écrit dans `ecartsContenu` et **tranché à la source par l'owner** avant re-mesure — jamais dans la page.

## 7. Validation owner et clôture

- Reconstruire les 9 pages sur le **pilote** 8087 (`odoo -u piqueray_ds` puis `odoo:page` ×9) ; donner les liens éditeur
  `http://localhost:8087/odoo/website?path=<url>&enable_editor=1&with_loader=1`.
- `proofs/validations-owner.md` : une ligne datée par page ; « à corriger » ⇒ retour au §3 puis §6 avant nouveau verdict.
- `proofs/registre-restes.md` : destinations non tranchées (sortie de `odoo:pages:check --json`), commun figé par page +
  commande de rafraîchissement, vues manquantes (attendu : aucune), écarts > seuil avec cause, écarts de source ouverts.
- Docs **après** évals : `integrations/odoo/authoring/README.md` (commun, surcharge, `links`), `docs/16` (mesure de page).

## 8. Les portes, toutes vertes

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs
npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run odoo:authoring:check && npm run odoo:module:check && npm run odoo:derivation:check && npm run odoo:typecheck
npm run odoo:pages:check && npm run odoo:pages:selftest && npm run odoo:visual:selftest
```
Attendu : re-pins **zéro** (`golden.json`, `engine.receipt.json`, `examples/polaris/`) — aucun contrat ni émetteur touché ;
`odoo:derivation` voit la zone `ODOO-022-MENU-SEED` toujours classée ; `parity` : « No new drift ». Si `catalog/` bouge, c'est
la dérive non gardée connue (018) : signaler, ne pas « corriger » ici.
