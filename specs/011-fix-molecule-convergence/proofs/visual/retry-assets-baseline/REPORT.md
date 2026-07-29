# Visual campaign — 011-fix-molecule-convergence

**Verdict:** `blocked` (exit 2)
**Machine receipt:** [result.json](result.json)

## Seven-verdict review index

| target | required cases | passing | failing | blocked | verdict |
|---|---:|---:|---:|---:|---|
| carte | 2 | 0 | 0 | 2 | blocked |
| field | 1 | 0 | 0 | 1 | blocked |
| member-card | 1 | 0 | 0 | 1 | blocked |
| nav-item | 1 | 0 | 0 | 1 | blocked |
| product-card | 1 | 0 | 0 | 1 | blocked |
| realisation | 1 | 0 | 0 | 1 | blocked |
| tab | 1 | 0 | 0 | 1 | blocked |

## Coverage

- expected: 18
- observed: 18
- missing: _none_
- unexpected: _none_

## Traceability matrix

| target | caseId | figmaFactId | figmaReference | contractFact | evidence | verdict |
|---|---|---|---|---|---|---|
| carte | carte-reassurance-master | carte.disposition.reassurance | v2381229993207753432 / 2063:1606 | ds.carte v2.0.0 | missing · missing · missing · missing | blocked: artifact-missing, coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-missing, non-probative, pixel-fail, render-refused, required-region-missing, visibility-receipt-failed |
| carte | carte-reassurance-master | carte.image.d62d8bf32a1935f6f709cd2a9be8081b7c7bfb96 | v2381229993207753432 / 2063:1606 | ds.carte v2.0.0 | missing · missing · missing · missing | blocked: artifact-missing, coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-missing, non-probative, pixel-fail, render-refused, required-region-missing, visibility-receipt-failed |
| carte | carte-categorie-master | carte.disposition.categorie | v2381229993207753432 / 2063:1611 | ds.carte v2.0.0 | missing · missing · missing · missing | blocked: artifact-missing, coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-missing, non-probative, pixel-fail, render-refused, required-region-missing, visibility-receipt-failed |
| carte | carte-categorie-master | carte.image.3c54b9a6dc4162164e25c6513d82696c73717826 | v2381229993207753432 / 2063:1611 | ds.carte v2.0.0 | missing · missing · missing · missing | blocked: artifact-missing, coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-missing, non-probative, pixel-fail, render-refused, required-region-missing, visibility-receipt-failed |
| field | field-master-default | field.etat.normal | v2381229993207753432 / 2056:1278 | ds.field v2.0.0 | missing · missing · missing · missing | blocked: artifact-missing, coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-missing, non-probative, pixel-fail, render-refused, required-region-missing, semantic-receipt-missing, visibility-receipt-failed |
| field | field-master-default | field.optionnel.false | v2381229993207753432 / 2056:1278 | ds.field v2.0.0 | missing · missing · missing · missing | blocked: artifact-missing, coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-missing, non-probative, pixel-fail, render-refused, required-region-missing, semantic-receipt-missing, visibility-receipt-failed |
| field | field-master-default | field.saisie.input | v2381229993207753432 / 2056:1278 | ds.field v2.0.0 | missing · missing · missing · missing | blocked: artifact-missing, coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-missing, non-probative, pixel-fail, render-refused, required-region-missing, semantic-receipt-missing, visibility-receipt-failed |
| member-card | member-card-master-default | member-card.image.c60f37abee2a78de43e7b189e77356ab1a16c7e4 | v2381229993207753432 / 2074:2072 | ds.member-card v1.1.0 | cases/member-card-master-default/figma.png · cases/member-card-master-default/generated.png · cases/member-card-master-default/diff.png · cases/member-card-master-default/triptych.png | blocked: coverage-incomplete, geometry-fail, geometry-receipt-failed, non-probative, pixel-fail, required-region-missing, visibility-receipt-failed |
| member-card | member-card-master-default | member-card.content.cecilia-piqueray | v2381229993207753432 / 2074:2072 | ds.member-card v1.1.0 | cases/member-card-master-default/figma.png · cases/member-card-master-default/generated.png · cases/member-card-master-default/diff.png · cases/member-card-master-default/triptych.png | blocked: coverage-incomplete, geometry-fail, geometry-receipt-failed, non-probative, pixel-fail, required-region-missing, visibility-receipt-failed |
| nav-item | nav-item-master-default | nav-item.chevron.true | v2381229993207753432 / 2152:5554 | ds.nav-item v1.1.0 | cases/nav-item-master-default/figma.png · cases/nav-item-master-default/generated.png · cases/nav-item-master-default/diff.png · cases/nav-item-master-default/triptych.png | blocked: coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-exceeds-threshold, non-probative, pixel-fail, required-region-missing |
| nav-item | nav-item-master-default | nav-item.actif.false | v2381229993207753432 / 2152:5554 | ds.nav-item v1.1.0 | cases/nav-item-master-default/figma.png · cases/nav-item-master-default/generated.png · cases/nav-item-master-default/diff.png · cases/nav-item-master-default/triptych.png | blocked: coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-exceeds-threshold, non-probative, pixel-fail, required-region-missing |
| product-card | product-card-master-default | product-card.bouton.false | v2381229993207753432 / 2068:1972 | ds.product-card v1.0.0 | cases/product-card-master-default/figma.png · cases/product-card-master-default/generated.png · cases/product-card-master-default/diff.png · cases/product-card-master-default/triptych.png | blocked: asset-invalid, coverage-incomplete, geometry-fail, geometry-receipt-failed, non-probative, pixel-fail, required-region-missing, visibility-receipt-failed |
| product-card | product-card-master-default | product-card.image.1ba972fd8df54b3eafdfd9c97b169cfd57c17e8c | v2381229993207753432 / 2068:1972 | ds.product-card v1.0.0 | cases/product-card-master-default/figma.png · cases/product-card-master-default/generated.png · cases/product-card-master-default/diff.png · cases/product-card-master-default/triptych.png | blocked: asset-invalid, coverage-incomplete, geometry-fail, geometry-receipt-failed, non-probative, pixel-fail, required-region-missing, visibility-receipt-failed |
| realisation | realisation-set-reference | realisation.taille.grand | v2381229993207753432 / 2095:2484 | ds.realisation v1.0.0 | cases/realisation-set-reference/figma.png · cases/realisation-set-reference/generated.png · cases/realisation-set-reference/diff.png · cases/realisation-set-reference/triptych.png | blocked: asset-invalid, geometry-fail, geometry-receipt-failed, global-score-exceeds-threshold, pixel-fail, required-region-failed |
| realisation | realisation-set-reference | realisation.taille.petit | v2381229993207753432 / 2095:2484 | ds.realisation v1.0.0 | cases/realisation-set-reference/figma.png · cases/realisation-set-reference/generated.png · cases/realisation-set-reference/diff.png · cases/realisation-set-reference/triptych.png | blocked: asset-invalid, geometry-fail, geometry-receipt-failed, global-score-exceeds-threshold, pixel-fail, required-region-failed |
| realisation | realisation-set-reference | realisation.image.inventory | v2381229993207753432 / 2095:2484 | ds.realisation v1.0.0 | cases/realisation-set-reference/figma.png · cases/realisation-set-reference/generated.png · cases/realisation-set-reference/diff.png · cases/realisation-set-reference/triptych.png | blocked: asset-invalid, geometry-fail, geometry-receipt-failed, global-score-exceeds-threshold, pixel-fail, required-region-failed |
| tab | tab-master-reference | tab.etat.defaut | v2381229993207753432 / 2061:1588 | ds.tab v2.0.0 | cases/tab-master-reference/figma.png · cases/tab-master-reference/generated.png · cases/tab-master-reference/diff.png · cases/tab-master-reference/triptych.png | blocked: coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-exceeds-threshold, non-probative, pixel-fail, required-region-missing, semantic-fail, semantic-receipt-failed |
| tab | tab-master-reference | tab.etat.selectionne | v2381229993207753432 / 2061:1588 | ds.tab v2.0.0 | cases/tab-master-reference/figma.png · cases/tab-master-reference/generated.png · cases/tab-master-reference/diff.png · cases/tab-master-reference/triptych.png | blocked: coverage-incomplete, geometry-fail, geometry-receipt-failed, global-score-exceeds-threshold, non-probative, pixel-fail, required-region-missing, semantic-fail, semantic-receipt-failed |

## Named limits and unresolved failures

- carte/carte-reassurance-master: carte-occurrence-census-not-yet-pinned
- carte/carte-categorie-master: carte-occurrence-census-not-yet-pinned
- field/field-master-default: field-cross-product-not-yet-pinned
- member-card/member-card-master-default: member-card-portrait-census-not-yet-pinned
- nav-item/nav-item-master-default: nav-item-boolean-cross-product-not-yet-pinned
- product-card/product-card-master-default: product-card-bouton-true-no-immutable-reference, product-card-image-census-not-yet-pinned
- realisation/realisation-set-reference: realisation-image-census-not-yet-pinned
- tab/tab-master-reference: tab-state-pair-not-yet-pinned

Campaign reasons: subject:carte:blocked, subject:field:blocked, subject:member-card:blocked, subject:nav-item:blocked, subject:product-card:blocked, subject:realisation:blocked, subject:tab:blocked. Each case directory is bounded below [cases/](cases/); missing artifacts are explicitly blocked in its metadata rather than replaced with a synthetic image.
