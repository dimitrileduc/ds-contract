# System memory

What this design system is and is for — the standing context every generating
surface reads before producing anything. Edit freely (or via Contract Hub's
Context page); this ships inside the catalog.

> **Rewritten 2026-07-22 for Piqueray.** The previous text described the retired
> 51-component demo system ("data-dense B2B product surfaces: settings,
> directories, billing, member management") and was still being handed to every
> generating surface. What follows is **derived from the Piqueray artifacts
> themselves** — the Figma file `d9FYAUcqdcNtsuaMgLefvJ`, the token set and the
> Button contract. Lines marked **(unconfirmed)** are read off those artifacts,
> not stated by the owner; correct them rather than letting them stand.

- **Piqueray is a public-facing brand surface, not an internal product UI.**
  (unconfirmed — inferred from the Figma file: a logo, a header nav with Solid
  and Transparent states, a member picture, search / account / cart icons.)
- **The palette is warm and editorial**, built on a deep blue `#143A84` and an
  orange `#F98A0B`, over near-black `#26282C`, white, and a beige family
  (`#F6D49F`, `#FFF3E2`). Colour is used for identity and emphasis, not only to
  signal state.
- **Typography is Montserrat throughout**, on a display-scale ramp — six title
  levels from 48px down to 16px, plus `paragraphe` and `lead`. A ramp that
  starts at 48px is built for editorial pages, not for compact tables.
  (unconfirmed as intent — the scale is a fact, the reading of it is not.)
- **The catalog currently holds one component: the Button**, six variants
  (default, orange, blanc, outlineBlanc, link, outilneNoir). Anything else a
  request needs does not exist yet.
- **When a request needs something the catalog lacks, report the gap** — never
  approximate with a lookalike. With a one-component catalog this will happen
  constantly, and saying so is the correct behaviour, not a failure.

**Still to be authored by the owner:** the tone of voice, the intended audience,
and the composition rules that are Piqueray's own. The rules file
(`context/rules.json`) was likewise stripped of the demo's rules rather than
rewritten — inventing a design constitution is the owner's call, not the tool's.
