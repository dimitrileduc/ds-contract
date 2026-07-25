# DAG d'exécution — figé au scan T0 (T010, 2026-07-23)

**Source** : [scan-2026-07-23.json](./scan-2026-07-23.json) (le dernier scan fait foi)
réconcilié avec `COMPONENT-INVENTORY.md` (divergences notées ci-dessous).
**Acyclicité** : vérifiée — chaque bloc ne dépend que de blocs de niveau
inférieur ou égal déjà séquencés avant lui ; aucune molécule ne dépend d'une
section ; les composites ferment la marche. Aucun cycle.

## Ordre d'exécution (inchangé vs tasks.md — le scan le confirme)

```text
T  tokens (odeurs : space/radius, imported.orange-* ; nav/state → report proposé)
A1 Input → Textarea → Select → Checkbox          (net-new, lot 1 — validation par composant)
A2 icônes sociales → icône étoile                (net-new + inféré, lot 2)
M  Field(A1) → Accordion-row → Tabs/Tab → Category-card → Product-card →
   Member-card → Reassurance-item → Review-card(A2:étoile) → Carousel-controls →
   Footer-column → Copyright → Contact-info-row(A2:sociales) → Section-header →
   Gallery-item(inféré, CONFIRMÉ au scan) → Accordion(exige Accordion-row adopté-prouvé)
S  Devis/CTA → Présentation → SAV → Hero(Section-header) → Réassurances(Reassurance-item) →
   Catégories principales(Category-card) → Texte SEO(Accordion) → FAQ(Tabs+Accordion) →
   Produits e-commerce(Product-card+Carousel-controls) → Équipe(Member-card) →
   Avis Google(Review-card) → Formulaire(Field+Checkbox) → Coordonnées(Contact-info-row+sociales) →
   Réalisations(Gallery-item) → Hero et catégories(Hero+Catégories) → Footer+Devis(Footer-column+Copyright)
```

Invariants tenus (data-model §Invariants) : T067→T042 ; T053/T054→T038 ;
T039/T040→T032-T034 ; T061/T062→T037 ; T097→T076+T080 ; T099→T058+T060 ;
T095/T096→T066.

## Comptes re-mesurés (scan T0) — les chiffres re-mesurés font foi

| Bloc | Inventaire (2026-07-23 matin) | Scan T0 (2026-07-23 soir) | Note |
|---|---|---|---|
| category-card | `item` ~15 | **41** | 3 formes mesurées : std 364×498-522, composite 744×418, alt/3-col 474-744 large — UNE cle, layouts = propriétés du master |
| footer-column | brut ×9 | **27** | 3 colonnes (Col 2/3/4) × 9 pages |
| accordion-row | ~34 | **28** isolées | rows des groupes détectés ; complément au re-scan par bloc (T041) |
| accordion | ×12 | **14** conteneurs | inclut les accordions du Texte SEO |
| product-card | ×8 | **8** ✓ | exact |
| member-card | ×16 | **16** ✓ | exact (`grid` À Propos, frame[instance,frame]) |
| contact-info-row | ×4 | **4** ✓ | exact (`features` Contactez-nous) |
| tab | ×4 | **3** isolés | rangée `tabs` Dépannage/SAV ; re-mesure à l'audit T043 |
| field | ×7 | **4** isolés | les fields larges vivent dans les rows du formulaire (2 nonClasses) — relevé complet à l'audit T039 |
| gallery-item | *(inféré, à confirmer)* | **27 — CONFIRMÉ** | grilles mosaïque ×3 pages (9 tuiles, tailles mixtes) |
| Hero (solo) | ×8 | **2** | les autres vivent dans les composites (ci-dessous) |
| Hero et catégories | ×6 | **7** composites | dont « Hero et FAQ » (Dépannage/SAV) et « Header + Hero + Cat » en GROUP (Portes d'entrée) — composition réelle tranchée aux audits T075/T097 |
| FAQ (section) | ×4 | **3** directes | la 4e est dans le composite « Hero et FAQ » |
| Présentation | ×5 | **3** directes | re-mesure aux audits ; 2 occurrences attendues non isolées à cette passe |
| Sections restantes | — | footer-devis 9 ✓, devis-cta 8 ✓, avis-google 8 ✓, texte-seo 8 ✓, réassurances 6 ✓, réalisations 3 ✓, produits 2 ✓, sav/équipe/formulaire/coordonnées 1 ✓ | conformes |

**Non isolés à cette passe** (introuvables[] du scan, jamais silencieux) :
reassurance-item (sections ×6 localisées), review-card + icône étoile (inférés,
passe visuelle due), copyright, section-header, carousel-controls, input/
textarea/select (via audits ciblés T031+) — chacun porte sa voie de reprise
dans le scan JSON.

**Découvertes** : le jeu d'icônes réel est plus riche que l'inventaire
(cart, search, user, arrow-left, chevron-left/right, octicon:chevron-down-12) ;
`dejaInstancie` compte aussi les instances nichées dans les masters instanciés
(superset des 145 directes) ; **dependancesTierces = [] sur les 9 maquettes**
(première preuve SC-008).
