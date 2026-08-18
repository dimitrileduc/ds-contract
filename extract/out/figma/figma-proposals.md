# Proposed contracts — design-side extraction report

1 component set(s) extracted from the canvas dump. Every proposal parses against the contract schema. A proposal is a STARTING POINT: unbound values are NAMED below (never silently tokenized), and each note is a review line item.

## Review-card

- proposed: 6 props
- semantics.element defaulted to "div" — element/role/ARIA are not drawn on the canvas and the name/axis inference table matched nothing; set the real host element
- Review-card:root/entete/profil/avatarInitiale: auto-layout width is FIXED — observed bbox 40px carried; FILL width remains parent-owned
- Review-card:root/entete/profil/avatarInitiale: auto-layout height is FIXED — observed bbox 40px carried; FILL width remains parent-owned
- Review-card:root/entete/profil/avatarInitiale/initialeTexte: typography (18px Semi Bold) matches 0 derived text styles — font tokens not proposed, review
- Review-card:root/entete/profil/avatarPhoto: auto-layout width is FIXED — observed bbox 40px carried; FILL width remains parent-owned
- Review-card:root/entete/profil/avatarPhoto: auto-layout height is FIXED — observed bbox 40px carried; FILL width remains parent-owned
- Review-card:root/entete/profil/identite/date: typography (14px Medium) matches 0 derived text styles — font tokens not proposed, review
- Review-card:root/notation/etoiles: nested instance of "Notation" has no known contract — component ref proposed as "ds.notation" with a STUB child contract auto-proposed alongside (childStubs; API from observed applied values only, anatomy not captured — import the real child set to replace it)
- Review-card:root/notation/etoiles: fixed props of "Notation" canonicalized by spelling (dump v1.1) — verify against the child contract's bindings
- Review-card:root/notation/verification: auto-layout width is FIXED — observed bbox 16px carried; FILL width remains parent-owned
- Review-card:root/notation/verification: auto-layout height is FIXED — observed bbox 16px carried; FILL width remains parent-owned
- Review-card:root/notation/verification: visibility bound to BOOLEAN "Vérifié" — proposed as prop `vRifi` (default true: the property definition's defaultValue, dump v1.5)
- Review-card:root/notation/verification/coche/Vector: part name "Vector" already names another part of this contract (part names are contract-wide: CSS classes, swap layers, and note paths key on them) — renamed to "cocheVector" (rule: first drawn part keeps the name; later collisions take the parent-derived prefix, else an ordinal suffix)
- Review-card:root/temoignage: typography (14px Medium) matches 0 derived text styles — font tokens not proposed, review
- Review-card:root/lireLaSuite: typography (14px Medium) matches 0 derived text styles — font tokens not proposed, review
- Review-card:root: root width is DRAWN FIXED in every variant — the observed dimension (299px, dump v1.5 bbox) is proposed as a minted root token (the drawn value is the only witness; rename against your real tokens)
- prop `avatar`: two-value axis [Initiale, Photo] kept as an ENUM (both states render truthfully on both surfaces); a code boolean is a compatible code-side binding — see extract/reconcile.ts bool⇄axis treatment
- contract name: drawn set name "Review-card" is not a PascalCase component name — proposed as "ReviewCard" (the canvas set keeps its own name; the componentSetKey/nodeId anchors carry identity)
- prop `tMoignage`: Figma property "Témoignage" contains characters outside a legal identifier — name sanitized at proposal; the original spelling stays the design binding (bindings.figma.property)
- prop `vRifi`: Figma property "Vérifié" contains characters outside a legal identifier — name sanitized at proposal; the original spelling stays the design binding (bindings.figma.property)
- MINTED {imported.shared.color-ffffff} = #ffffff — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root background-color, Review-card:root/entete/profil/avatarInitiale/initialeTexte color, Review-card:root/notation/verification/coche/Vector border-color
- MINTED {imported.review-card.root.border-color} = #f4f6fa — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root border-color
- MINTED {imported.shared.size-14} = 14px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root gap, Review-card:root/entete/profil/identite/date font-size, Review-card:root/temoignage font-size, Review-card:root/lireLaSuite font-size
- MINTED {imported.review-card.root.padding-inline} = 24px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root padding-inline
- MINTED {imported.review-card.root.padding-block} = 24px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root padding-block
- MINTED {imported.shared.size-8} = 8px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root border-radius, Review-card:root/notation gap, Review-card:root/notation/verification border-radius
- MINTED {imported.review-card.root.border-width} = 1px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root border-width
- MINTED {imported.review-card.root.min-height} = 239px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root min-height
- MINTED {imported.review-card.entete-profil.gap} = 12px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil gap
- MINTED {imported.review-card.entete-profil-avatar-initiale.background-color} = #9ba4b5 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarInitiale background-color
- MINTED {imported.review-card.entete-profil-avatar-initiale.border-radius} = 20px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarInitiale border-radius
- MINTED {imported.shared.size-40} = 40px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarInitiale min-width, Review-card:root/entete/profil/avatarInitiale width, Review-card:root/entete/profil/avatarInitiale height, Review-card:root/entete/profil/avatarPhoto min-width, Review-card:root/entete/profil/avatarPhoto width, Review-card:root/entete/profil/avatarPhoto height
- MINTED {imported.review-card.entete-profil-avatar-initiale-initiale-texte.font-size} = 18px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarInitiale/initialeTexte font-size
- MINTED {imported.review-card.entete-profil-avatar-initiale-initiale-texte.font-weight} = 600 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarInitiale/initialeTexte font-weight
- MINTED {imported.shared.size-0} = 0px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarInitiale/initialeTexte letter-spacing, Review-card:root/entete/profil/identite/auteur letter-spacing, Review-card:root/entete/profil/identite/date letter-spacing, Review-card:root/temoignage letter-spacing, Review-card:root/lireLaSuite letter-spacing
- MINTED {imported.review-card.entete-profil-avatar-initiale-initiale-texte.line-height} = 18px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarInitiale/initialeTexte line-height
- MINTED {imported.review-card.entete-profil-avatar-photo.background-color} = #d9d9d9 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarPhoto background-color
- MINTED {imported.review-card.entete-profil-avatar-photo.border-radius} = 20px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/avatarPhoto border-radius
- MINTED {imported.review-card.entete-profil-identite.gap} = 2px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/identite gap
- MINTED {imported.shared.color-000000} = #000000 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/identite/auteur color, Review-card:root/entete/profil/identite/date color, Review-card:root/notation/verification background-color, Review-card:root/temoignage color, Review-card:root/lireLaSuite color
- MINTED {imported.review-card.entete-profil-identite-auteur.line-height} = 19.200000762939453px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/identite/auteur line-height
- MINTED {imported.shared.num-500} = 500 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/identite/date font-weight, Review-card:root/temoignage font-weight, Review-card:root/lireLaSuite font-weight
- MINTED {imported.review-card.entete-profil-identite-date.line-height} = 16.799999237060547px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/profil/identite/date line-height
- MINTED {imported.review-card.entete-marque-vector.background-color} = #4285f4 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/marque/Vector background-color
- MINTED {imported.review-card.entete-marque-vector-2.background-color} = #34a853 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/marque/Vector 2 background-color
- MINTED {imported.review-card.entete-marque-vector-3.background-color} = #fbbc05 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/marque/Vector 3 background-color
- MINTED {imported.review-card.entete-marque-vector-4.background-color} = #ea4335 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/entete/marque/Vector 4 background-color
- MINTED {imported.shared.size-16} = 16px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/notation/verification min-width, Review-card:root/notation/verification width, Review-card:root/notation/verification height
- MINTED {imported.review-card.notation-verification-coche-vector.border-width} = 1.5384615659713745px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/notation/verification/coche/Vector border-width
- MINTED {imported.review-card.temoignage.line-height} = 19.600000381469727px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root/temoignage line-height
- MINTED {imported.review-card.root.width} = 299px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: Review-card:root width
- stub ds.notation: renders HONEST OBSERVED GEOMETRY (dump v1.5 bounding box) via minted imported.stub-* tokens — a correctly-sized box, NOT the child's anatomy (still not captured); import the real child set to replace it
- MINTED {imported.stub-notation.root.width} = 92px — stub geometry (the "Notation" instances' OBSERVED box/paint, dump v1.5; provisional) — bound at: stub ds.notation width
- MINTED {imported.stub-notation.root.height} = 16px — stub geometry (the "Notation" instances' OBSERVED box/paint, dump v1.5; provisional) — bound at: stub ds.notation height

