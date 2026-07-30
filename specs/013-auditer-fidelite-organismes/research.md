# Phase 0 — Research: fidélité des douze organismes

**Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Toutes les inconnues techniques sont résolues. Les IDs de cas, nodes d'occurrence et
hashes d'assets seront des données obligatoires du manifeste au moment de
l'implémentation ; leur absence produit `not-proven` ou `blocked`, jamais une valeur
devinée.

**Méthode docs-first** : les handoffs, les docs contrat/génération/parité/validation,
`docs/STYLE-FIDELITY.md`, `docs/FIGMA-CAPABILITY-MATRIX.md`, la constitution et les
artefacts 003/005/007/010/011/012 ont été lus avant les décisions. Le connecteur auggie
demandé par la constitution n'est pas exposé dans cette session ; la lecture directe des
sources autoritatives du dépôt est la dégradation nommée.

**Mise à jour 2026-07-30** : le connecteur auggie est de nouveau exposé, donc la
dégradation ci-dessus est **levée pour l'implémentation** — §IX s'applique sans
dégradation à partir d'ici. Conséquence concrète : l'attribution de `representability`
(T029, T049, T058) consulte `docs/FIGMA-CAPABILITY-MATRIX.md` via `codebase-retrieval`
plutôt que de se ré-dériver depuis le code.

## D1 — Le contrat reste le centre de la chaîne de preuve

**Decision**: Auditer chaque fait sous la forme :

```text
fait Figma piné → contrat id/version/JSON Pointer → fait React généré → preuve → verdict
```

Figma et le code ne sont jamais comparés ou synchronisés en court-circuitant le contrat.

**Rationale**: La constitution III impose le contrat comme source gouvernante, et IV
interdit la retouche du généré. Une ressemblance Figma↔code obtenue sans cause
contractuelle ne prouve pas la reproductibilité.

**Alternatives considered**: synchronisation Figma→code ; patch de TSX/CSS ; jugement
visuel sans pointeur contractuel ; reconstruction par IA.

## D2 — Le périmètre est exactement déclaré, stable et ordonné

**Decision**: Le manifeste fixe douze IDs/contrats et trois vagues :

1. `ds.coordonnees`, `ds.devis`, `ds.hero`, `ds.presentation`, `ds.sav`,
   `ds.texte-seo` ;
2. `ds.faq`, `ds.footer`, `ds.reassurances` ;
3. `ds.equipe`, `ds.formulaire`, `ds.header`.

Chaque sujet cite sa version de contrat et son node de master. Le validateur refuse tout
doublon, omission, ajout, changement d'ordre ou rapprochement par nom d'affichage.

**Rationale**: Les quinze contrats concernés (douze cibles et trois dépendances) existent
déjà avec des IDs et ancres stables. Les noms visibles ont historiquement varié ; les
clés/IDs n'ont pas cette ambiguïté.

**Alternatives considered**: liste implicite dans `subjects.ts` ; recherche par nom ;
ordre déterminé par le filesystem ; campagne partielle présentée comme complète.

## D3 — Réutiliser 011 sans changer le sens de sa campagne historique

**Decision**: Étendre additivement `Visual Campaign v1` avec un périmètre explicite
optionnel. Sans ce champ, le validateur conserve exactement les sept sujets 011. Avec ce
champ, il exige exactement les sujets déclarés. La couche `organism-audit` porte les
vagues, dépendances, faits métier et verdicts 013.

**Rationale**: `campaign.ts`, le census 011 et le registre de sujets sont aujourd'hui
codés en dur pour sept molécules, mais les receipts de visibilité, géométrie, pixels,
sémantique, hashes et bornage sont déjà matures. Ajouter les organismes dans l'enum 011
modifierait rétrospectivement le sens d'une preuve pinée.

**Alternatives considered**: copier tout le comparateur ; modifier la liste 011 ;
utiliser le mode legacy sans couverture exacte ; créer un second moteur d'image.

## D4 — La surface prouvée est le React généré

**Decision**: Capturer le composant réellement généré sous `src/components/**` via un
harness React/Storybook déterministe. Le reçu cite le fichier généré, l'export, la story
ou le preset de props, le hash du bundle et les sélecteurs/parts observés. Le rendu
`core/emit-html` peut rester un diagnostic d'émetteur, mais ne remplace pas la preuve
React.

**Rationale**: Le runner visuel 011 appelle actuellement `core/emit-html`; React est un
émetteur séparé. Parité, golden et typecheck prouvent son API et sa reproductibilité, pas
son pixel ou sa propagation visible. FR-003 vise explicitement le rendu généré livré.

**Alternatives considered**: assimiler HTML et React parce qu'ils partagent le contrat ;
capture Storybook manuelle sans hashes ; preuve d'interface TypeScript seulement.

## D5 — Figma est une référence immuable, actuelle et probante

**Decision**: Réutiliser les audits 003/005/007 comme Step 0, puis épingler une version
Figma courante et des node IDs concrets par GET. Le cache n'est accepté que si
fileKey/version/node/propriétés/hashes correspondent. Toute nouvelle saleté de source ou
référence non équivalente bloque le fait.

**Rationale**: Les audits historiques prouvent le nettoyage/adoption mais pas la fidélité
du React courant. Une instance synthétique ou une mutation temporaire fabriquerait la
référence censée être prouvée. Figma est explicitement read-only dans 013.

**Alternatives considered**: re-audit complet sans signal ; confiance aveugle dans les
anciens PNG ; mutation temporaire ; variante/occurrence inventée ; capture vide acceptée.

## D6 — La couverture est l'union Figma + contrat + projection

**Decision**: Pour chaque organisme, calculer avant capture :

```text
expected = union(
  propriétés et occurrences Figma pinées,
  props/axes/booleans/repeats/compositions obligatoires du contrat,
  faits de contenu, image, structure, géométrie et sémantique requis,
  projections React non-défaut nécessaires pour prouver la propagation
)
```

Chaque fait obligatoire a un cas ou un alias avec empreintes d'égalité recalculées.
`missing` et `unexpected` doivent être vides pour un verdict positif.

**Rationale**: Un screenshot du défaut ne voit pas un prop exposé mais non propagé, un
BOOLEAN non matérialisé, une collection `bindings.figma.kind: "NONE"` ou une image vide.
Le dépôt contient déjà des organismes dont les props de titre/accroche sont destructurées
en React mais dont l'enfant reçoit encore un littéral.

**Alternatives considered**: defaults uniquement ; produit cartésien sans node réel ;
props d'interface prises comme preuve de projection ; `NONE` considéré conforme par
défaut ; cas manquant traité comme skip.

## D7 — Pixels, signal, géométrie et sémantique sont des gates séparés

**Decision**: Hériter des règles probantes 011 :

- score brut et chaque région obligatoire `≤2,5 %` pour 013 ;
- masque texte et baseline seulement diagnostiques/non-régression ;
- référence et généré non vides, contrastés et équivalents ;
- image attendue décodée et visible ;
- rectangles racine/parts comparés sans resampling ni registration ;
- assertions de contenu/DOM/sémantique reliées au contrat.

Le seuil global historique du comparateur n'est pas élargi.

**Rationale**: Un masque peut créer un faux 0 %, un fond identique peut rendre les deux
côtés invisibles, un score global peut diluer une petite divergence, et une baseline
rouge ne peut pas accorder l'acceptation.

**Alternatives considered**: moyenne par organisme ; baseline-only ; score masqué ;
régions choisies après observation ; redimensionnement/crop qui efface la géométrie ;
seuil 006 spécial Google Reviews réutilisé hors contexte.

## D8 — Les faits et organismes utilisent une algèbre fail-closed

**Decision**: Les faits utilisent :

- `proved` : les trois jambes et la preuve sont complètes et concordantes ;
- `divergent` : écart établi et source localisée ;
- `limited` : canal/représentation limité mais nommé ;
- `not-proven` : preuve absente, invalide, non équivalente ou non probante.

Les organismes utilisent ces quatre verdicts plus `blocked`. `proved` exige tous les
faits obligatoires `proved`, tous les cas visuels probants et toutes les dépendances
positives. Une divergence prévaut sur une limite ; `not-proven` prévaut sur l'absence ;
une dépendance non positive impose `blocked`.

**Rationale**: Cette algèbre représente directement FR-004/005/015/019 et empêche un
agrégat, une limite connue ou un champ vide de devenir vert.

**Alternatives considered**: booléen pass/fail ; meilleur effort ; limite acceptée comme
pass ; omission des faits non disponibles ; verdict manuel non reproductible.

## D9 — La vague 3 consomme des reçus frais, elle ne réinterprète pas l'historique

**Decision**: `Equipe→MemberCard`, `Formulaire→Field` et `Header→NavItem` citent un
résultat machine hashé, sa version Figma et sa version de contrat. Un reçu
`Visual Campaign v1` parle `pass`/`fail`/`blocked` au niveau sujet et ne porte
`probative` que par cas ; le gate dérive donc `probative` des cas requis du reçu et
mappe normativement le vocabulaire (`pass→proved` uniquement si la dérivation probante
tient, `fail→divergent`, `blocked→blocked`, sujet absent ou reçu
illisible→`not-proven`). Seul un verdict mappé `proved` frais ouvre le parent. Le
dernier résultat 011 retenu indique :

| Dépendance | Reçu v1 (brut) | Verdict mappé | Effet actuel |
|---|---|---|---|
| MemberCard | `blocked` | `blocked` | Equipe `blocked` |
| Field | `blocked` | `blocked` | Formulaire `blocked` |
| NavItem | `fail` | `divergent` | Header `blocked` |

L'implémentation revalide la fraîcheur et applique ce seul mappage ; elle ne
réinterprète jamais un reçu au-delà.

**Rationale**: Un organisme composé peut masquer le défaut de son enfant dans son score
global. FR-011 à FR-013 interdisent explicitement ce faux vert.

**Alternatives considered**: ancien verdict pixel 003 ; absence de nouveau run comme
validation ; audit du parent sans sa composition ; limite owner convertie en pass ;
mappage v1→013 implicite et non normé (le gate exigerait un `proved` qu'aucun reçu v1
ne peut littéralement contenir).

## D10 — Images et contenus d'occurrence sont des fixtures de comparaison, jamais des defaults

**Decision**: Les octets IMAGE utiles sont téléchargés en lecture seule, versionnés avec
provenance, dimensions, longueur et SHA-256, puis injectés uniquement par un chemin de
prop de comparaison déclaré. Un organisme dont l'image Figma n'a aucune projection
contractuelle/React reste divergent, limité ou non prouvé ; le runner n'ajoute pas de CSS
ou de default runtime pour le faire ressembler.

**Rationale**: Hero, Coordonnees et SAV portent notamment des faits image que les sorties
actuelles peuvent ne pas projeter. Un placeholder, une div vide ou une CSS de campagne
inventerait la fidélité.

**Alternatives considered**: ignorer les images ; placeholder ; URL signée ; CSS
feature-scoped injectée ; image Figma persistée comme comportement produit.

## D11 — Les corrections locales suivent une boucle bornée et contract-first

**Decision**: L'audit initial classe d'abord le fait. Une correction est autorisée
seulement si la source est localisée, le changement reste propre au périmètre et ne
touche pas les exclusions. Contrat/outil/émetteur est corrigé à la source, toute
capacité générique commence par une fixture rouge, puis les sorties sont régénérées et
le fait réaudité. Une correction non locale reste un travail reporté.

**Rationale**: La spec permet les corrections locales mais interdit la dérive de portée.
Conserver le résultat initial rend l'amélioration attribuable ; régénérer prouve que la
surface vient toujours du contrat.

**Alternatives considered**: corriger avant l'inventaire ; patch du généré ; augmenter
le seuil ; acquitter la divergence ; chantier transversal opportuniste.

## D12 — Les valeurs en dur inventoriées et les fondations de tokens sont protégées explicitement

**Decision**: Produire un reçu baseline/final qui recense les chemins
`literals`/`literalsByProp` et les liaisons de tokens des contrats avant toute
remédiation, puis refuse toute conversion littéral→token attribuable à 013. Tout finding
relevant de cette conversion ou d'une fondation globale crée un `DeferredWorkItem`
contenant organisme, fait, cause, pointeur, preuve et impact ; il ne change pas le
verdict en positif. `tokens/**` n'est pas une source modifiable par 013.

**Rationale**: Un simple rapport en prose ne prouve pas SC-005, et un simple
`git diff contracts/` empêcherait les corrections locales pourtant autorisées. Un
diff typé distingue une correction contractuelle locale d'une conversion interdite.

**Alternatives considered**: interdire tout diff de contrat ; se fier au nombre 89 sans
inventaire ; conversion opportuniste ; correction globale puis baseline ; travail
reporté traité comme waiver.

## D13 — Un résultat machine autoritaire génère tous les rapports

**Decision**: Chaque organisme conserve `result.json`, `REPORT.md` et les cinq artefacts
par cas. La campagne produit un `result.json` à douze lignes puis génère sa synthèse
Markdown, avec validation bidirectionnelle des IDs, verdicts, compteurs, chemins et
hashes. Le rapport commence par les douze verdicts en ordre de vague, puis descend vers
les faits, limites, blocages et travaux reportés.

**Rationale**: Un Markdown édité à la main dérive facilement ; le rapport 011 actuel
omet déjà des colonnes pourtant requises par son interface. Un résultat machine permet
la couverture exacte et l'objectif de revue en moins de dix minutes.

**Alternatives considered**: Markdown seul ; worst-ten ; triptyques globaux mutables ;
colonnes vides ; synthèse sans dossiers individuels.

## D14 — Les gates de preuve et du dépôt restent séparés et tous deux obligatoires

**Decision**: Ajouter des fixtures 013 pour le périmètre/vagues, la compatibilité 011,
les dépendances, la propagation de props, la capture React réelle, l'algèbre de verdict,
le rapport et la non-conversion. Exécuter ensuite la campagne 013 et le sweep complet
dans le checkout rendu autonome — dérogation F1 actée (owner, 2026-07-30) : le travail a
lieu dans le checkout primaire, pas dans un worktree dédié (plan.md, tasks.md T001). Une
campagne honnêtement `blocked` peut être un résultat
fonctionnel valide, mais une porte technique rouge bloque la clôture.

**Rationale**: `npm run parity` ne couvre ni les pixels ni toutes les projections
visibles ; la campagne ne protège pas à elle seule déterminisme, browser-purity,
schéma, plugin et types.

**Alternatives considered**: parité seule ; campagne seule ; gates ciblés seulement ;
échec hérité ignoré ; ancien compte d'evals recopié dans le plan.
