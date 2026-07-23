# Contrat — Relevé des personnalisations (ledger, FR-012)

La preuve qu'aucune personnalisation d'une copie n'est perdue quand elle devient une
instance. Un fichier par incrément d'adoption.

## Fichier

`specs/003-externalize-figma-components/ledger/<bloc>.json` — committé avec la preuve
pixel de l'incrément.

```json
{
  "bloc": "footer",
  "date": "2026-07-30",
  "masterNodeId": "…",
  "entrees": [
    {
      "maquette": "Contactez-nous",
      "position": { "x": 0, "y": 9120, "w": 1728, "h": 640 },
      "type": "texte",
      "chemin": "colonne-2/liens/3",
      "valeur": "Dépannage 24/7",
      "portePar": "propriété texte `lien-3` du master",
      "statut": "reportee"
    },
    {
      "maquette": "À Propos",
      "position": { "x": 0, "y": 8000, "w": 1728, "h": 640 },
      "type": "visibilite",
      "chemin": "colonne-3",
      "valeur": "colonne masquée sur cette page",
      "portePar": null,
      "statut": "non-portable-signalee",
      "signalement": "aucune propriété du master ne porte ce cas — voir journal 2026-07-30"
    }
  ],
  "totaux": { "reportees": 41, "nonPortables": 1 }
}
```

## Règles

1. **Détection avant remplacement** : diff structurel copie ↔ master **par position**
   (textes, fills d'image, icônes swappées, visibilités) — le relevé est constitué
   AVANT que la copie ne disparaisse, jamais reconstruit après coup.
2. `type` ∈ `texte | image | icone | visibilite | autre` ; `autre` exige une
   description — jamais un fourre-tout muet.
3. `statut` ∈ `reportee | non-portable-signalee` :
   - `reportee` exige `portePar` (la propriété/override d'instance qui la porte) ;
   - `non-portable-signalee` exige `signalement` + entrée journal — **jamais**
     abandonnée en silence (FR-012, FR-018).
4. **Complétude bloquante** : l'adoption n'est « faite » que si le ledger est complet
   ET la preuve pixel passée (les deux, pas l'un des deux) — le pixel-gate attrape la
   perte visuelle, le ledger la perte d'intention.
5. Une adoption sans aucune personnalisation écrit un ledger **vide explicite**
   (`entrees: []`, totaux à 0) — l'absence est déclarée, pas déduite.
