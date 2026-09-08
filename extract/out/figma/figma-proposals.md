# Proposed contracts — design-side extraction report

2 component set(s) extracted from the canvas dump. Every proposal parses against the contract schema. A proposal is a STARTING POINT: unbound values are NAMED below (never silently tokenized), and each note is a review line item.

## Realisation

- proposed: 1 props
- semantics.element defaulted to "div" — element/role/ARIA are not drawn on the canvas and the name/axis inference table matched nothing; set the real host element
- Realisation:root: root width is DRAWN FIXED in every variant — the observed dimension (743/339.5px, dump v1.5 bbox) is proposed as a minted root token (the drawn value is the only witness; rename against your real tokens)
- Realisation:root: root height is DRAWN FIXED in every variant — the observed dimension (743/339.5px, dump v1.5 bbox) is proposed as a minted root token (the drawn value is the only witness; rename against your real tokens)
- prop `taille`: two-value axis [Grand, Petit] kept as an ENUM (both states render truthfully on both surfaces); a code boolean is a compatible code-side binding — see extract/reconcile.ts bool⇄axis treatment
- MINTED {imported.realisation.root.width.grand} = 743px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisation:root width (taille=grand)
- MINTED {imported.realisation.root.width.petit} = 339.5px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisation:root width (taille=petit)
- MINTED {imported.realisation.root.height.grand} = 743px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisation:root height (taille=grand)
- MINTED {imported.realisation.root.height.petit} = 339.5px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisation:root height (taille=petit)

## Realisations

- proposed: 2 props
- semantics.element defaulted to "div" — element/role/ARIA are not drawn on the canvas and the name/axis inference table matched nothing; set the real host element
- Realisations:root padding-inline: bindings are a function of variant axis "presentation" by VALUE (default mobile={space.24}; tablette={space.48}, desktop={space.56}, wide={space.89}) — carried as tokensByProp overrides (v10; the token names do not spell the axis values, so the substituted-ref shape cannot carry them)
- Realisations:root/Bloc en-tête gap: bindings are a function of variant axis "presentation" by VALUE (default mobile={space.16}; desktop={space.64}, wide={space.64}) — carried as tokensByProp overrides (v10; the token names do not spell the axis values, so the substituted-ref shape cannot carry them)
- Realisations:root/Bloc en-tête: auto-layout differs across variants as a function of axis "Presentation" — proposed layoutByProp on `presentation` (2 override(s); reversed child order spelled as -reverse directions)
- Realisations:root/Bloc en-tête/SectionHeader: nested instance of "SectionHeader" LINKED to ds.section-header by componentSetKey 770d5801af6e899b9547461ea2c714a66e0fa356 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/Bloc en-tête/SectionHeader: fixed props of "SectionHeader" canonicalized through ds.section-header's bindings
- Realisations:root/Bloc en-tête/wrapper/Texte: node weight "null" overrides style "Paragraphe" — override not token-recoverable, review
- Realisations:root/SectionHeaderAccroche: nested instance of "SectionHeader" LINKED to ds.section-header by componentSetKey 770d5801af6e899b9547461ea2c714a66e0fa356 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/SectionHeaderAccroche: fixed props of "SectionHeader" canonicalized through ds.section-header's bindings
- Realisations:root/grid: bound variable on "gridRowGap" has no contract vocabulary — binding NAMED, not proposed (review)
- Realisations:root/grid: bound variable on "gridColumnGap" has no contract vocabulary — binding NAMED, not proposed (review)
- Realisations:root/grid: auto-layout height is FIXED — observed bbox 1058/2342/800/1146.5px carried; FILL width remains parent-owned
- Realisations:root/grid/Realisation: applied prop "Taille" varies per sibling (Grand, Petit) — per-item enum/state differences are P10 (selected-item) with no repeat vocabulary; receipted, the sample renders ds.realisation's default (review)
- Realisations:root/grid/Realisation: 9 adjacent sibling instances of "Realisation" (repeated-children collection, P9) but no per-item field is carriable — kept as 9 fixed parts, review
- Realisations:root/grid/Realisation: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 2: 8 adjacent sibling instances of "Realisation" (repeated-children collection, P9) but no per-item field is carriable — kept as 8 fixed parts, review
- Realisations:root/grid/Realisation 2: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 2: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 3: 7 adjacent sibling instances of "Realisation" (repeated-children collection, P9) but no per-item field is carriable — kept as 7 fixed parts, review
- Realisations:root/grid/Realisation 3: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 3: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 4: 6 adjacent sibling instances of "Realisation" (repeated-children collection, P9) but no per-item field is carriable — kept as 6 fixed parts, review
- Realisations:root/grid/Realisation 4: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 4: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 5: 5 adjacent sibling instances of "Realisation" (repeated-children collection, P9) but no per-item field is carriable — kept as 5 fixed parts, review
- Realisations:root/grid/Realisation 5: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 5: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 6: 4 adjacent sibling instances of "Realisation" (repeated-children collection, P9) but no per-item field is carriable — kept as 4 fixed parts, review
- Realisations:root/grid/Realisation 6: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 6: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 7: 3 adjacent sibling instances of "Realisation" (repeated-children collection, P9) but no per-item field is carriable — kept as 3 fixed parts, review
- Realisations:root/grid/Realisation 7: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 7: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 8: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 8: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root/grid/Realisation 9: nested instance of "Realisation" LINKED to ds.realisation by componentSetKey 7cf12fad8cd3bd7cc0d797ff0978554ff15d8d43 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- Realisations:root/grid/Realisation 9: fixed props of "Realisation" canonicalized through ds.realisation's bindings
- Realisations:root: root width is DRAWN FIXED in every variant — the observed dimension (390/834/1200/1728px, dump v1.5 bbox) is proposed as a minted root token (the drawn value is the only witness; rename against your real tokens)
- prop `enTete`: two-value axis [Accroche, Presentation] kept as an ENUM (both states render truthfully on both surfaces); a code boolean is a compatible code-side binding — see extract/reconcile.ts bool⇄axis treatment
- MINTED {imported.realisations.bloc-en-t-te-wrapper-texte.letter-spacing} = 0px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root/Bloc en-tête/wrapper/Texte letter-spacing
- MINTED {imported.realisations.bloc-en-t-te-wrapper-texte.line-height} = 24px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root/Bloc en-tête/wrapper/Texte line-height
- MINTED {imported.realisations.grid.height.mobile} = 1058px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root/grid height (presentation=mobile)
- MINTED {imported.realisations.grid.height.tablette} = 2342px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root/grid height (presentation=tablette)
- MINTED {imported.realisations.grid.height.desktop} = 800px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root/grid height (presentation=desktop)
- MINTED {imported.realisations.grid.height.wide} = 1146.5px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root/grid height (presentation=wide)
- MINTED {imported.realisations.root.width.mobile} = 390px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root width (presentation=mobile)
- MINTED {imported.realisations.root.width.tablette} = 834px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root width (presentation=tablette)
- MINTED {imported.realisations.root.width.desktop} = 1200px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root width (presentation=desktop)
- MINTED {imported.realisations.root.width.wide} = 1728px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Realisations:root width (presentation=wide)

