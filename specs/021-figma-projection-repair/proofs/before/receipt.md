# Reçu de capture avant — campagne 021

- Pin Figma lu : `2385747041460798575` (`d9FYAUcqdcNtsuaMgLefvJ`), lecture seule.
- Préflight : `7/7` cibles, `24` surfaces, `30` consommateurs inventoriés.
- État atteint : `ready-to-apply`.
- Capture : `72` artefacts valides — `24` PNG, `24` structures JSON, `24` jeux de propriétés JSON.
- Intégrité : `0` artefact invalide et `0` divergence entre les SHA-256 enregistrés et les fichiers écrits.
- Empreintes IMAGE : `69`; liens master→instance : `155`.

La capture utilise uniquement les endpoints Figma `GET /versions`, `GET /files`,
`GET /nodes` et `GET /images`. Aucun script canvas ni endpoint d'écriture n'a été
appelé. Les bornes raster réelles sont conservées, y compris les débordements qui
constituent précisément les défauts à corriger.
