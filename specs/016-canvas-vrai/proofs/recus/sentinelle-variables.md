# Reçu — Test de sentinelle de l'axe variables (T019 → T023, FR-002 / SC-002)

**Date** : 2026-08-05 · **Fichier** : `d9FYAUcqdcNtsuaMgLefvJ`
**Point de restauration** : `016/U1a-sentinelle/avant` → `versionId 2384256876219261626`

**Verdict : ✅ la surveillance est rebranchée.** Un écart introduit côté maquette est
**signalé**, **classé**, et **remédiable** ; son annulation ramène l'état exact ; et
l'instrument est stable.

---

## T019 — état de référence

`npm run parity` vert (`total: 0, acknowledged: 3, pending: 0`), zéro acquittement de
couverture géométrie (les 83 sont tombés en T017).

Valeur **vive** de la variable sentinelle, relevée et non supposée :

| | |
|---|---|
| Variable | `Primitives / size/carte/root` (`VariableID:2309:4427`) |
| Type | `FLOAT` · mode `Value` |
| **Valeur vive** | **364** |
| scopes / codeSyntax | `["WIDTH_HEIGHT"]` · `var(--size-carte-root)` |

> Le contrat annonçait « 363,5 **ou** 364 selon l'état au moment du test ». C'est **364** :
> DW-002 (qui la passera à 363,5) est un lot de **US2**, pas encore joué. Relever plutôt
> que supposer était donc la bonne consigne.

### Un fait relevé au passage, utile à U1b

En cherchant si la variable était liée à des nœuds (pour savoir s'il fallait capturer) :

| Relevé sur les 5 353 nœuds du fichier | |
|---|---:|
| Nœuds liés à **`size/carte/root`** | **0** |
| Nœuds portant une liaison de variable quelconque | 2 082 |
| **Nœuds liés à une variable GÉOMÉTRIQUE** | **23** |

Deux conséquences. (1) Le geste sentinelle **ne peut peindre aucun pixel** — d'où
l'absence de cycle de capture pixel pour ce sous-lot, décision prise sur relevé et non
par commodité. (2) **23 nœuds seulement** sont aujourd'hui liés à une variable de
géométrie : c'est la ligne de départ de U1b (T056a), et elle confirme D2 — créer les
variables ne lie rien.

## T020 — le geste

```js
v.setValueForMode(modeId, 999);   // size/carte/root : 364 → 999
```

Vérifié relu : `999`. Geste **réversible et consigné**, précédé de son point de
restauration.

## T021 — la détection

Cliché `figma-tokens.json` ré-extrait via le pont, puis `npm run parity` :

```
[figma-tokens MISMATCH] Primitives/size/carte/root [Value]
  tokens/ says 364, Figma says 999
  proposed patch: {"tokenPath":"size.carte.root","mode":"Value","adoptFigmaValue":999}
  → Adopt into tokens/ (promotion) then npm run tokens — or push tokens/ to Figma via figma_import_tokens
```

**`npm run parity` sort en exit 1** : la dérive n'est pas seulement affichée, elle
**fait échouer la porte**.

Confrontation à l'attendu **exact** du contrat `sentinelle-variables.md` :

| Attendu | Observé | |
|---|---|---|
| finding `figma-tokens\|mismatch\|Primitives/size/carte/root [Value]` | identique | ✅ |
| `detail` citant les deux valeurs | `tokens/ says 364, Figma says 999` | ✅ |
| `proposedPatch { tokenPath, mode, adoptFigmaValue: 999 }` | `{"tokenPath":"size.carte.root","mode":"Value","adoptFigmaValue":999}` | ✅ |
| `remedy` : adopter dans `tokens/` **ou** pousser vers Figma | les deux voies proposées | ✅ |

**Signalé ET classé ET remédiable — FR-002 tenu.** Sortie verbatim :
`sentinelle-detection.txt`.

## T022 — annulation et stabilité ×2 (SC-002)

```js
v.setValueForMode(modeId, 364);   // 999 → 364
```

| Contrôle | Résultat |
|---|---|
| Valeur relue | **364** |
| Cliché ré-extrait | `size/carte/root: { Value: 364 }` |
| `npm run parity` | **exit 0**, `total: 0, acknowledged: 3, pending: 0` |
| **Passe 1 ⟷ passe 2**, sans aucun geste entre elles | **sorties byte-identiques** — `sha256[:16] = b5a9ed4b87f96c2e` des deux côtés |
| Cliché post-annulation ⟷ cliché sain d'avant sentinelle | **identiques** hors `extractedAt` |

Zéro faux signal. Les deux sorties sont archivées : `sentinelle-stabilite-1.txt`,
`sentinelle-stabilite-2.txt`.

La dernière ligne est la plus forte : l'état n'est pas « à peu près » revenu, il est
**exactement** revenu — la comparaison porte sur le cliché entier, pas sur la seule
variable touchée.

## T023 — LIMITE NOMMÉE (§V, D3)

> **Ce que cette capacité NE couvre pas.** L'axe `variables canvas ⟷ tokens` surveille
> l'**existence** et la **valeur** des variables. Il ne surveille **pas** les *liaisons* :
> si un designer **détache** une dimension au niveau du nœud (`detach`, puis saisie d'une
> valeur brute), la variable reste intacte et conforme — **le différentiel ne signale
> rien**. `parity/diff.ts` ne lit jamais `boundVariables` (0 occurrence, vérifié).
>
> Ce trou est rattrapé, mais **en différé et non en continu** : par l'audit de liaison
> (`bridge/bindings-audit.js`, T062) et par toute régénération, qui repose les liaisons.
>
> Une surveillance continue du détachement n'est **pas livrée par 016** — c'est une
> limite assumée, léguée telle quelle au rapport de clôture, à l'endroit exact où la
> capacité « la maquette est surveillée » est revendiquée.

Cette phrase est reprise **verbatim** dans `RAPPORT-CLOTURE.md` § « ce que 016 ne livre pas ».

## Re-vérification

```bash
# 1. relever la valeur vive (ne jamais la supposer), puis la porter à 999 via le pont
# 2. ré-extraire parity/snapshots/figma-tokens.json
npm run parity            # attendu : exit 1 + le finding ci-dessus
# 3. remettre la valeur d'origine, ré-extraire
npm run parity            # attendu : exit 0
npm run parity            # attendu : sortie byte-identique à la précédente
```

> **À rejouer en clôture** (T073) sur l'état final : SC-002 se prouve sur ce que le
> chantier livre, pas sur un état intermédiaire. À ce moment-là, `size/carte/root`
> vaudra **363,5** (DW-002) — relever, ne pas supposer.
