# Quickstart — 023 Pied de page Piqueray dans Odoo (footer shell)

## 0. Worktree autosuffisant (constitution F1 — AVANT tout)

```bash
npm install
npx playwright install chromium
```

## 1. Le sweep constitutionnel (à chaque checkpoint, DANS le worktree)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Attendu : vert **sans aucun re-pin** (aucun contrat/token/schéma/émetteur modifié). Une porte
rouge = erreur de périmètre, pas un re-pin à faire.

## 2. Gate humaine « périmètre éditable » (BLOQUANTE — avant toute implémentation)

L'owner valide [contracts/verdicts-editabilite.md](./contracts/verdicts-editabilite.md)
(100 % des props/parts, occurrences imbriquées comprises). La table validée fait foi et sera
transcrite en `integrations/odoo/config/footer.authoring.json`. Point d'attention nommé :
verdicts CTA `fixé par composition` vs précédent 022 `not-editable` (research D4).

## 3. Instance de qualification (Docker, images épinglées)

```bash
cp integrations/odoo/qa/.env.example integrations/odoo/qa/.env
docker compose -f integrations/odoo/qa/compose.yaml --env-file integrations/odoo/qa/.env up -d
```

## 4. Spikes mécanisme (OBLIGATOIRES avant le QWeb — reçus dans proofs/)

```bash
# S1 : zone footer de website.layout 19 (xpath, template natif à désactiver, immunité COW
#      du gabarit système)                       → proofs/spike-footer.json
# S2 : persistance du texte libre (hôte du champ, t-field inline dans l'éditeur,
#      edit→save→reopen→public→UPDATE→intact)    → proofs/spike-persistance.json
# S3 : champs sociaux natifs website.social_* (présence 19, édition Réglages, champ vide)
#                                                → proofs/spike-social.json
# Si S2 change un verdict (ex. copyright par panneau) → RETOUR À LA GATE §2 avant le QWeb.
```

## 5. Projection (après gate validée + spikes reçus)

```bash
# 1. scripts/odoo/lib/repo-data.ts : + 'ds.footer' dans SHELL_CONTRACT_IDS
# 2. repin explicite : integrations/odoo/config/inputs.lock.json (+footer, footer-column, copyright)
npm run odoo:inputs:check
# 3. footer.authoring.json (la table validée) — enum mechanism étendue ADDITIVEMENT si besoin
npm run odoo:authoring:check
# 4. assets régénérés (fermeture élargie)
npm run odoo:assets && npm run odoo:assets -- --check
# 5. QWeb footer_bar + héritage layout (actif=False) + semis + liens sociaux
#    — zones ODOO-023-* enregistrées au registre ; manifest bump + migration d'activation
npm run odoo:module:check && npm run odoo:derivation:check && npm run odoo:typecheck
```

## 6. Preuves (SC-001 … SC-006)

```bash
npx tsx integrations/odoo/qa/visual/selftest.mts --strict     # harnais prouvé hors ligne
# footer-visual   : sujet visual/subjects/footer.mts — référence emitHtml vs capture Odoo (SC-001)
# footer-edit     : textes P9/P11 : edit → save → reopen → public (SC-002/003)
# footer-update   : édition puis `-u piqueray_ds` → contenu conservé (SC-004)
# footer-pages    : footer sur chaque page ; header + 10 sections intacts (SC-005)
# footer-regen    : variation de token régénérée → visible requête suivante, textes intacts (SC-006)
```

## 7. Clôture

Sweep §1 + suite Odoo complètes, reçus classés sous `proofs/`, `RAPPORT-CLOTURE.md` nommant ce
qui tient et ce qui reste ouvert (responsive mobile différé, icônes fixées, sémantique `<footer>`
hôte layout, portes rouges pré-existantes citées telles quelles).
