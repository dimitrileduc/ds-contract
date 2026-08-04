# Roadmap

The public roadmap lives in the documentation: **[docs/12-roadmap.md](docs/12-roadmap.md)**.

## Prochaines specs (séquence arrêtée le 2026-07-31, après la clôture de 013)

Ordre imposé par les dépendances — chaque spec dimensionne la suivante, gates machine fail-closed entre elles (modèle `evaluateWaveEntry`) :

1. **014 — `mesure-juste-triage`** (en cours, spec écrite) : DW-006 (référence = node du cas, jamais le set), triage des 4 lignes UNTRIAGED, `select` mesuré (34/34). Zéro correction — l'instrument et le classement seulement. Sa sortie (compte des écarts par cause) est l'entrée dimensionnante de 015.
2. **015 — géométrie gouvernée** (Figma en lecture) : la géométrie des 34 contrats portée en références de tokens. Décisions à trancher EN PREMIER dans le plan : box-sizing (matrice ligne 65 — Figma est border-box via strokeAlign INSIDE, la surface React CSS-modules n'a pas `box-sizing: border-box` → un `literals.width` sur part avec padding écrit la mauvaise boîte) ; DW-001 (largeur PiquerayLogo partagée footer/header) ; DW-002 (min-width carte, prouvé NON-local par le harnais). Conversions : DW-004 (déplacer valeur ET pointeur `/literals/` → `/tokens/` ensemble), DW-005 (minter les largeurs de cadre — doctrine déjà écrite dans `tokens/primitives.tokens.json`). Les 2 dégradés hero = **2 littéraux `background-image` à écrire, zéro code moteur** (linear-gradient est CARRY-BOTH depuis v15, `parseCssGradient` → `GRADIENT_LINEAR`). Préservation des correctifs manuels de 013 à la ré-extraction : fixture d'abord, c'est le morceau le plus risqué.
3. **016 — canvas vrai** (mutations Figma, exige le pont figma-console reconnecté) : les 8 défauts de source (backlog 013, dont DW-003 : instance SectionHeader de FAQ figée à 50px) corrigés DANS Figma (§VIII), puis régénération du canvas divergent — capture de TOUTES les cibles avant la première mutation (§X), preuve pixel avant/après. Déblocage Field + NavItem (défauts moteur/mesure nommés) ; **MemberCard reste bloqué honnêtement** (son plan photo est A5).
   **Contrainte ajoutée le 2026-08-03 — les photos du client.** La régénération passe par `amendSet`/`amendComponent`, qui reconstruisent les intérieurs depuis le contrat : sans la passe de récolte/restauration de `core/emit-figma-script.ts`, les vraies photos seraient détruites sur les **9 composants porteurs d'images**. La passe existe et est gardée (eval `img-paint-preserved-on-amend`), mais elle a deux limites qui visent exactement ces 9 composants : une image non replaçable part dans `unplacedImages` — **rapportée, pas restaurée** ; et l'appariement par nom puis ordre du document peut **intervertir deux photos** sans que rien ne le signale. Donc : après chaque régénération, **lire le rapport `preservedImages` / `unplacedImages` composant par composant**, et vérifier l'identité des photos, pas seulement leur présence. La capture-avant (§X) couvre la perte ; elle ne couvre pas l'interversion entre deux plans de même taille. Doctrine complète : `docs/FIGMA-CAPABILITY-MATRIX.md`, addendum du 2026-08-03.
4. **017 — images A5** (chantier moteur séparé, hors fenêtre courte) : `figma.createImage` (§ a.7 de la matrice) — la SEULE chose qui bougera realisation (99,97 %), carte (64 %), member-card (52 %), product-card (15,6 %). Jusqu'à lui, la frontière image reste une limite nommée des deux côtés.

Fait vérifié qui a cadré ce découpage : les gros écarts de parité visuelle des atomes/molécules sont **A5-image (6 lignes) et plancher renderer (15 lignes ≤3,6 %)** — la géométrie-en-tokens n'y changera rien ; ce qu'elle répare, ce sont les divergences des **organismes** (registre DW de 013). Deux populations, deux specs.

Short version — four phases, each with a falsifiable exit criterion:

0. **Prove the model** — complete (July 2026): 51 contracts, two generated surfaces, three-way parity, 99/99 evals, measured governed-generation result.
1. **Harden the loop** — anatomy-level parity, fresh-file rebuild, automated visual regression.
2. **Brownfield adoption** — extract proposed contracts from *pre-existing* design + code libraries, reconcile, run diagnostic-only; public pilot on a real open-source pair.
3. **Spec candidacy** — separate format from implementation: normative spec draft, conformance kit, and a second independent implementation.
4. **Community & governance** — RFC process, engagement with DTCG / OpenUI / CEM, and a neutral multi-vendor home.
