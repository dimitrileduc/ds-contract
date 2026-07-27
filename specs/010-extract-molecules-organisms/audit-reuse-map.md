# Audit Reuse Map — Spec 010

Per FR-001: « L'audit peut être réutilisé s'il existe et est validé — jamais refait dans ce cas »

All 27 targets have existing audit coverage from specs 003/005/007.

| Component | Audit source | Caveats (already named in artifacts) |
|-----------|-------------|--------------------------------------|
| **Atoms (2)** | | |
| MemberPicture | 005 L3/L4 | — |
| PiquerayLogo | 005 L1/L4 | — |
| **Molecules (13)** | | |
| AccordionRow | 003 + 005 L2 + 007 | Asymétrie Ouvert nommée |
| Avantage | 003 (pixel 4/4 complete) | — |
| CarouselControls | 003 (byte-exact) | — |
| Carte | 003 + 007 | Résidu canvas 3 488 px (named) |
| Copyright | 003 + 005 L2 | — |
| Field | 003 + 007 | — |
| FooterColumn | 003 + 005 L2 | — |
| NavItem | 005 L4 | Dette item 8 ouverte (named) |
| ProductCard | 003 + 005 L3 | BOOLEAN Bouton officialized |
| Realisation | 003 (3/3 byte-exact) + 005 | — |
| SectionHeader | 003 + 005 V5/cycle 14 | Rename Accroche2 pending (named) |
| Tab | 003 (9/9) + 005 L3/V7 | — |
| MemberCard | 003 (pixel complet) | Composes MemberPicture |
| **Organisms (12)** | | |
| Coordonnees | 003 + 005 L5 | Résidu 88 px (named) |
| Devis | 003 + 005 V2 | — |
| Equipe | 003 (byte-identical 1/1) | — |
| FAQ | 003 (2/4, root cause named) | — |
| Footer | 003 + 005 V6 (full rebuild) | — |
| Formulaire | 003 + 005 L5 + 007 | — |
| Header | 005 V1/L4 | Shares NavItem dette item 8 |
| Hero | 003 + 005 L1 | — |
| Presentation | 003 + 005 L5 | — |
| Reassurances | 003 + 005 V4/cycle 14 | — |
| SAV | 003 + 005 V3/cycle 14 | — |
| TexteSEO | 003 + 005 cycle 14 | Résidu 3 351 px + dette rich-text B1 (named) |

**Re-measurement required**: At extraction time, re-confirm the live master state.
If re-measurement reveals a new defect → fix at source with §X before-capture BEFORE extraction,
never model around the defect (§VIII).
