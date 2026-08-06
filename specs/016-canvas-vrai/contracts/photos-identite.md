# Interface — recensement et verdict d'identité des photos client

**Pourquoi un instrument séparé** : le restore moteur des scripts générés (`harvestImagePaints`/`restoreImagePaints`) apparie par nom puis retombe sur « premier paint non réclamé » — il peut donc intervertir deux photos de même taille sans le dire. FR-007 exige l'**identité** photo par photo ; le contrôle doit être indépendant du mécanisme contrôlé.

## Scripts (commités, spec-locaux)

- `specs/016-canvas-vrai/bridge/photos-census.js` — bridge, LECTURE SEULE : inventorie par POSITION tout nœud à paint `IMAGE` (masters DS **et** instances des 9 maquettes — les overrides d'instance, ex. les photos de `realisation`, sont la population la plus fragile à une reconstruction d'enfants du master), POST au receveur : `{ sujet, cheminNoeud, bounds, porteur: "master"|"instance-override", imageHash, octets }` (octets via `figma.getImageByHash(h).getBytesAsync()` — le sha256 est calculé côté Node, le sandbox n'a pas de crypto).
- `specs/016-canvas-vrai/tools/photos-verify.mts` (tsx, spec-local) — compare `census-avant.json` ⟷ `census-apres.json` et écrit `photos-report.json`.

## `photos-report.json` (par composant porteur)

```jsonc
{
  "schemaVersion": 1,
  "composants": [{
    "sujet": "realisation",
    "attendues": 27,                       // du census AVANT
    "verdictParPhoto": [{
      "position": { "page": "Pages", "bounds": {"x":0,"y":0,"w":743,"h":743} },
      "imageHashAvant": "…", "imageHashApres": "…",
      "sha256Avant": "…", "sha256Apres": "…",
      "verdict": "identique" | "intervertie" | "perdue" | "non-verifiable"
    }],
    "nonReplacees": ["<chemin nommé>"],    // FR-007/FR-011 — jamais en silence
    "verdict": "intact" | "replace-verifie" | "en-souffrance"
  }]
}
```

## Règles

1. Le census AVANT couvre **tous** les porteurs avant le premier lot de régénération (§X) ; son compte de composants est confronté aux **9** annoncés par la spec — écart = STOP et réconciliation consignée avant d'écrire.
2. Identité = même `imageHash` à la même position (l'imageHash Figma adresse le contenu : même hash ⇔ mêmes octets) ; le sha256 des octets est la contre-preuve re-testable hors Figma.
3. `intervertie` (hash présent mais au mauvais endroit), `perdue`, `non-verifiable` (capture refusée, pont coupé…) sont **nommés** — un composant n'est pas « régénéré » tant qu'une photo est en souffrance ; une vérification empêchée n'est jamais comptée en succès (FR-011).
4. MemberCard : recensé et vérifié intact comme les autres, mais son plan photo reste hors contrat (frontière A5, `docs/FIGMA-CAPABILITY-MATRIX.md` ligne 91) — divergence de rendu = limite nommée jusqu'à 017, pas un échec du chantier.
