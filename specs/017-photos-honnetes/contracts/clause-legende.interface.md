# Interface — La dague cesse d'être muette sur l'image

**Spec**: 017 · US3 (P3) · FR-010, FR-010a, FR-011, FR-012, FR-013 · SC-006, SC-007
**Surfaces**: `core/emit-figma-script.ts` (la légende) · `docs/FIGMA-CAPABILITY-MATRIX.md` (la copie + l'addendum) · `docs/handoff/` (la réponse) · `contracts/{carte,member-picture,member-card}.contract.json` (trois descriptions manquantes)

**Pourquoi un contrat d'interface.** Le mécanisme d'avertissement existe, **et la dague est déjà posée sur les 9 composants porteurs d'image** — vérifié au cliché, pas supposé. Ce qui manque n'est pas la marque : c'est la phrase. Ce document fixe le texte exact, où il vit, et ce que la documentation doit répondre pour que la question ne se pose plus au code.

---

## 1 · La légende — texte arrêté

```
<Nom> — generated from contract <id> v<version> · image frame: runtime slot, photo shown is a mockup sample †
```

Exemple rendu :

```
Realisation — generated from contract ds.realisation v1.1.0 · image frame: runtime slot, photo shown is a mockup sample †
```

**Règles.**

1. **Une seule ligne.** La directive owner du 2026-07-19 tient ; aucun retour aux paragraphes de copie retirés ce jour-là (événements, `declaredNoteLines`, `gradientMissLines`, phrase meter).
2. **La clause n'apparaît que pour un composant portant au moins une part `img`.** Elle est portée par un drapeau dédié, distinct de `hasPreviewOnlyFacts` — qui agrège aussi `blockRoot` et déclencherait la clause sur des composants sans cadre photo.
3. **La dague reste en fin de ligne**, à sa place actuelle. Elle continue de marquer *l'existence* de faits qui n'existent qu'en code ; la clause dit *lequel*, pour le seul cas où le designer voit quelque chose sur le canevas et peut se méprendre dessus.
4. **Un composant sans cadre photo garde sa légende au caractère près.** Le diff attendu porte sur 9 composants, pas 34.
5. **La langue reste celle de la légende existante — l'anglais.** Les 34 composants portent aujourd'hui `generated from contract` ; passer 9 d'entre eux au français ferait une ligne bilingue et un jeu incohérent. Le français va à la documentation, où la spec l'envoie de toute façon.
6. **Ce qui arrive à la photo à la reconstruction n'est PAS dit ici** (FR-010a). La légende dit ce qu'est le cadre ; la documentation dit ce qui arrive à la photo.

---

## 2 · La documentation — trois gestes, aucun redondant

### Geste 1 — la ligne manquante à la table des avertissements

`docs/FIGMA-CAPABILITY-MATRIX.md` § (b) « The inexpressible set — on-canvas annotation copy », format exact des 15 lignes existantes :

```
| channel | annotation copy |
| `background-image: url()` (img parts) | "This frame is a runtime image slot — the photo you see is a mockup sample. The coded component receives its image at runtime." |
```

### Geste 2 — l'addendum daté qui rend la ligne cohérente

Sans lui, la ligne est incohérente : **§(b) est réservée aux canaux `CARRY-CODE-ONLY`, or la ligne 91 verdicte l'image `CARRY-BOTH (add — § a.7)`.** L'absence de ligne image n'était pas un oubli de saisie, c'est structurel. L'addendum porte ce que FR-013 exige :

- la lacune A5 reste **ouverte et nommée** — elle n'est pas fermée par 017 ;
- c'est une lacune de **transport**, ligne 91 colonne Bindable : `— (image content not bindable)`. L'image ne roulera jamais sur l'axe des variables ;
- ce n'est **pas un défaut de fidélité mesuré** : les 99,97 % du 2026-08-06 étaient un artefact d'instrument, corrigé par US2. La matrice cesse de confondre les deux.

### Geste 3 — la réponse au paquet d'accueil

`docs/handoff/08-status-what-doesnt-work.md` reçoit « que devient une image à la régénération ? », avec pointeur vers la matrice.

**État vérifié le 2026-08-06** : `docs/handoff/` est muet — deux occurrences de « photo » sur ses 12 fichiers, toutes deux narratives dans `10-history.md` ; rien dans 07, 08 ni 12 ; pas un mot sur `harvestImagePaints`, A5 ou le lavis `#D9D9D9`. Le paquet d'accueil est muet sur le sujet qui porte le pire écart mesuré du système.

**Et une affirmation du dépôt à corriger, pas à recopier.** `CLAUDE.md:19` dit que la réponse *« lived only in code comments and one eval header »*. **C'est faux depuis le 2026-08-04** : le commit `504dd0a` a ajouté `docs/FIGMA-CAPABILITY-MATRIX.md:360-372`, qui répond en clair, sans lire le code, avec sa table à deux lignes (*overwritten, deliberately* / *preserved, by an explicit rescue pass — never by luck*) et les deux limites nommées du sauvetage. Le CLAUDE.md est exact comme récit du 2026-08-03 et trompeur comme état courant : **il est daté, pas effacé**.

---

## 3 · La convention réaffirmée (FR-012)

Aucune image n'entre au contrat. Deux gestes seulement, et ils sont documentaires :

- `ds.carte.imageUrl`, `ds.member-picture.src` **et `ds.member-card.imageUrl`** reçoivent leur description — **les trois seules des onze props d'URL à ne pas porter la convention par écrit** (compte re-mesuré le 2026-08-06 : le « deux sur dix » du plan valait seulement en se restreignant aux 9 contrats à part `img`, restriction jamais écrite — et `ds.member-card`, sans part `img` mais avec sa prop d'URL nue, est **l'un des 5 sujets de mesure d'US2**). Semver : **patch** (ni prop, ni valeur, ni `accepts` ne bouge).
- Le texte de référence est déjà écrit deux fois et se cite, il ne se réinvente pas : `contracts/reassurances.contract.json:39` (*« Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets »*) et `contracts/review-card.contract.json:119` (*« inerte sur le canevas (trou A5, R6) »*).

**Le schéma tient déjà la convention par construction — vérifié.** Le canal `background-image` de 015 vit dans `literals` avec `GRADIENT_LITERAL_RE = /^linear-gradient\(.*\)$/s` : une `url()` d'image **refuse à la validation du schéma**, pas seulement à l'émission. Il n'y a rien à durcir, et rien à ajouter au schéma.

---

## 4 · Ce que la porte vérifie

| Critère | Vérification |
|---|---|
| SC-006 — la clause est émise, pour les 9 et pour eux seuls | diff des légendes **des scripts générés `figma-sync/*.js`** contre leur archivage d'avant ; 9 changent, 25 inchangées au caractère près. **Pas le cliché de canevas** : il ne bouge que par une capture vive au pont, et `parity/diff.ts` ne lit jamais la description (`FigmaSet`, `:89-96`) — la parité ne peut ni le prouver ni rougir dessus |
| SC-006-vif — le designer la lit **dans Figma** | exige le lot de régénération de la fenêtre vive (Phase 6) ; **reporté et nommé**, jamais acquis par le fait que l'émetteur émet |
| FR-010 — une seule ligne | aucun `\n` dans la description émise |
| SC-007 — la doc répond seule | la question « que devient une image à la régénération ? » trouve sa réponse dans `docs/`, sans lecture de code — **et cette réponse est épinglée par un cas d'eval** (T036a) |
| FR-013 — la lacune cesse d'être confondue | l'addendum daté existe et dit *transport*, pas *fidélité mesurée* |
| §II — fixture → eval → claim | le cas d'eval existant `img-part-canvas-placeholder-named` (claim `C3-detection`) épingle déjà le lavis et le `†` : il est **étendu** à la clause, pas doublé |
| §II — **la doc aussi** | relevé : **aucun cas de `evals/run.ts` ne lit `docs/`** aujourd'hui, donc la règle « pas de phrase sans eval » n'était tenue par rien côté documentation. T036a épingle **byte-pour-byte** la ligne de la matrice (geste 1) et la réponse du paquet d'accueil (geste 3) : éditer l'une sans l'autre rougit. Ordre : les trois gestes de doc **avant** l'eval qui les épingle |
