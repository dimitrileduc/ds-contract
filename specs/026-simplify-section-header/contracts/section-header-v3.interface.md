# Interface Contract — SectionHeader v3 and specialised owners

## Generic public interface

`ds.section-header@3.0.0` is a standard section title only:

```text
SectionHeader {
  titre: RichText
  accroche: Text
  afficherAccroche: boolean = true
  alignement: "centre" | "gauche" = "centre"
}
```

Figma exposes exactly `Alignement=Centre` and `Alignement=Gauche`. Both use a dark 40/50 title. There is no CTA, `disposition`, `emphase`, `accroche2` or compatibility alias.

## Removed API and mandatory route

| v2 fact | Destination | Rule |
|---|---|---|
| `accroche2` | `afficherAccroche` | Explicit rename for each generic destination. |
| `alignement` | `alignement` | Preserve observed value. |
| `standard` + `standard` emphasis | generic SectionHeader | Remove source facts after classification. |
| `emphase=hero` | Hero direct title | Never send emphasis to generic. |
| `emphase=moyen` | Presentation or Products direct title | Use ledger-reviewed role only. |
| `emphase=compact` | TexteSEO direct title | Never send emphasis to generic. |
| `disposition=avecCta` | Produits e-commerce | The sole declared CTA route. |

An unknown/ambiguous old combination, no matching ledger row, or an unapproved destination is a migration error. It cannot fall back to default-centre rendering.

## Specialised-owner output

| Owner | Required Figma / HTML / Odoo responsibility |
|---|---|
| Hero | Direct left light Hero title; CTA remains Hero anatomy. |
| Presentation | Direct left intermediate title; CTA remains Presentation anatomy. |
| Texte SEO | Direct left compact title; no generic emphasis dependency. |
| Produits e-commerce | Direct left intermediate title, eyebrow absent, section-owned CTA. |

All three surfaces preserve text ranges and style intent. A navigation target stays host/editor content rather than becoming a SectionHeader prop.

## Versioning

This is a major migration, not an additive deprecation. Consumer contract bumps, input-lock pins, documentation, fixtures and generated output must change coherently. Saved Odoo HTML remains governed by [odoo-transition.md](odoo-transition.md).
