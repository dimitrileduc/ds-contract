# Contrat — Scan d'inventaire par position (`scan.js`, bridge)

La re-mesure obligatoire avant chaque extraction (FR-002) et le volet « usage » de
l'audit de source (FR-006). Read-only strict.

## Invocation

Script bridge `extract/figma/page-parity/bridge/scan.js` via `figma_execute`, après
`figma.loadAllPagesAsync()`. Cible : page `Pages` (`210:325`), les 9 frames maquettes.

## Règles de classification (non négociables)

1. **Par position et structure, JAMAIS par nom.** Un bloc est identifié par ses bounds
   absolus + sa signature structurelle (types et comptes de ses enfants directs, motifs
   répétés). Le nom Figma est rapporté à titre **documentaire** (`nomFigma`) et n'entre
   jamais dans l'identification — receipt : `item` ×71 recouvre 3 molécules distinctes.
2. **Instances résolues** par `getMainComponentAsync()` — distingue copie brute
   (à externaliser) / instance existante (exclue, FR-001) / instance d'un nouveau
   master (adoption déjà faite). La **provenance** est rapportée : tout main
   component `remote: true` (bibliothèque externe) atterrit dans
   `dependancesTierces[]` — attendu **vide** (c'est la preuve FR-019/SC-008,
   zéro dépendance tierce) ; toute occurrence est un finding nommé, jamais omis.
3. **Tout ce qui est vu mais non classé est rapporté** dans `nonClasses[]` — jamais
   omis (principe V).

## Sortie

`specs/003-externalize-figma-components/inventory/scan-<AAAA-MM-JJ[-n]>.json` :

```json
{
  "date": "2026-07-23",
  "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",
  "pageId": "210:325",
  "maquettes": [{ "nom": "Accueil", "nodeId": "…", "bounds": {} }],
  "blocs": [
    {
      "cle": "accordion-row",
      "niveau": "molecule",
      "origine": "extraction",
      "occurrences": [
        {
          "maquette": "Accueil",
          "nodeId": "…",
          "bounds": { "x": 0, "y": 4120, "w": 1280, "h": 96 },
          "signature": "frame[text,text,instance(chevron)]",
          "nomFigma": "item",
          "etat": "copie-brute"
        }
      ]
    }
  ],
  "dejaInstancie": { "Bouton": 68, "Header nav": 9, "piqueray_logo": 9, "member-picture": 16, "icones": "…" },
  "totaux": { "atomes": 6, "molecules": 13, "sections": 16, "copiesRestantes": {} },
  "introuvables": [{ "cle": "gallery-item", "attenduDans": "Réalisations", "note": "…" }],
  "dependancesTierces": [],
  "nonClasses": []
}
```

`etat` ∈ `copie-brute | instance-existante | instance-nouveau-master` — c'est ce champ
qui prouve SC-003 (zéro copie brute restante d'un bloc externalisé).
`dependancesTierces[]` (masters `remote`) prouve SC-008 — zéro dépendance tierce.

## Règle de foi

- **Le dernier scan fait foi** sur `COMPONENT-INVENTORY.md` (chiffres de session,
  le fichier peut bouger).
- Toute divergence scan ↔ MD → mise à jour du MD avec note datée, jamais silencieuse.
- Un bloc attendu introuvable → `introuvables[]` + statut `reporte` + entrée journal
  (FR-009/FR-018) — le scan ne le supprime pas de l'inventaire.
