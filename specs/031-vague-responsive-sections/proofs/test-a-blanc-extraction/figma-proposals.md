# Proposed contracts — design-side extraction report

1 component set(s) extracted from the canvas dump. Every proposal parses against the contract schema. A proposal is a STARTING POINT: unbound values are NAMED below (never silently tokenized), and each note is a review line item.

## HeroVideo

- proposed: 1 props
- semantics.element defaulted to "div" — element/role/ARIA are not drawn on the canvas and the name/axis inference table matched nothing; set the real host element
- HeroVideo:root: auto-layout differs across variants as a function of axis "Presentation" — proposed layoutByProp on `presentation` (2 override(s); reversed child order spelled as -reverse directions)
- HeroVideo:root paddingLeft: bound in 1/4 variants (Presentation=Wide) — inconsistent, not proposed
- HeroVideo:root paddingRight: bound in 1/4 variants (Presentation=Wide) — inconsistent, not proposed
- HeroVideo:root: left/right padding bindings differ — padding-inline not representable, review
- HeroVideo:root paddingTop: bound in 1/4 variants (Presentation=Wide) — inconsistent, not proposed
- HeroVideo:root paddingBottom: bound in 1/4 variants (Presentation=Wide) — inconsistent, not proposed
- HeroVideo:root: top/bottom padding bindings differ — padding-block not representable, review
- HeroVideo:root itemSpacing: bound in 1/4 variants (Presentation=Wide) — inconsistent, not proposed
- HeroVideo:root height: bound in 1/4 variants (Presentation=Wide) — inconsistent, not proposed
- HeroVideo:root/Text/Accroche: typography varies across variants (fontSize 32/40/54, weight SemiBold) — no single text-style identity adopted (the first variant's value would be wrong for the others); font-size minted per variant where axis-correlated (review)
- HeroVideo:root/Bouton: nested instance of "Bouton" LINKED to ds.button by componentSetKey e6fa6786ed120eb3f3507024f8cda9058ae661c6 (dump v1.5 — rename-safe: the key matches the contract's anchors, whatever either side is named)
- HeroVideo:root/Bouton: fixed props of "Bouton" canonicalized through ds.button's bindings
- HeroVideo:root/Bouton: applied prop "iconRight" of the nested "Bouton" varies across variants (false, true) without tracking any enum axis — first value "false" carried, review
- HeroVideo:root: root width is DRAWN FIXED in every variant — the observed dimension (390/668/1200/1728px, dump v1.5 bbox) is proposed as a minted root token (the drawn value is the only witness; rename against your real tokens)
- MINTED {imported.hero-video.text-accroche.font-size.mobile} = 32px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche font-size (presentation=mobile)
- MINTED {imported.hero-video.text-accroche.font-size.tablette} = 32px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche font-size (presentation=tablette)
- MINTED {imported.hero-video.text-accroche.font-size.desktop} = 40px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche font-size (presentation=desktop)
- MINTED {imported.hero-video.text-accroche.font-size.wide} = 54px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche font-size (presentation=wide)
- MINTED {imported.hero-video.text-accroche.font-weight} = 600 — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche font-weight
- MINTED {imported.hero-video.text-accroche.letter-spacing} = 0px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche letter-spacing
- MINTED {imported.hero-video.text-accroche.line-height.mobile} = 40px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche line-height (presentation=mobile)
- MINTED {imported.hero-video.text-accroche.line-height.tablette} = 40px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche line-height (presentation=tablette)
- MINTED {imported.hero-video.text-accroche.line-height.desktop} = 50px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche line-height (presentation=desktop)
- MINTED {imported.hero-video.text-accroche.line-height.wide} = 68px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root/Text/Accroche line-height (presentation=wide)
- MINTED {imported.hero-video.root.width.mobile} = 390px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root width (presentation=mobile)
- MINTED {imported.hero-video.root.width.tablette} = 668px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root width (presentation=tablette)
- MINTED {imported.hero-video.root.width.desktop} = 1200px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root width (presentation=desktop)
- MINTED {imported.hero-video.root.width.wide} = 1728px — machine-named from a resolved value — rename against your real tokens (provisional); bound at: HeroVideo:root width (presentation=wide)

