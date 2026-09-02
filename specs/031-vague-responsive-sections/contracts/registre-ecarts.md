# Contrat — le registre d'écarts de vague

Un fichier d'autorité, `inventory/registre-ecarts.json`, et sa vue lisible
`inventory/registre-ecarts.md` (dérivée, jamais l'inverse).

**Discipline reprise de 029** : le registre est **créé au premier écart, jamais
après coup**. Une ligne écrite le soir pour un fait constaté le matin est une
reconstruction, pas une trace.

---

## Deux familles de lignes

1. **Une ligne par campagne** — treize, obligatoires, même quand rien n'a dévié
   (`ecart: "aucun"`). C'est la ligne que FR-014 exige.
2. **Une ligne par écart de vague** — autant que constatés : défaut de source,
   verrou dérogé, repli séquentiel, capacité absente, enfant qui casse.

---

## Schéma d'une ligne

```jsonc
{
  "id": "E-031-001",                    // séquentiel, jamais réattribué
  "famille": "campagne" | "vague",
  "campagne": "031-reassurances",       // null pour une ligne de vague
  "phase": "G0" | "G1" | "G2" | "G3" | "G4" | "G5",
  "constateA": "2026-08-27T09:14:00Z",  // horodatage du CONSTAT, pas de l'écriture
  "ecart": "aucun" | "<ce qui a dévié du défaut, une phrase>",
  "cause": "<pourquoi, datée ; null si ecart=aucun>",
  "disposition": "corrigé-à-la-source"
                | "dérogation-motivée"
                | "sortie-de-vague"
                | "décision-owner"
                | "reporté-au-chantier-suivant"
                | "sans-objet",
  "decisionRef": "decisions/<fichier>.json",   // obligatoire dès que la
                                               // disposition engage l'owner
  "preuveRef": "<chemin d'artefact>",
  "verdict": "appliquée" | "sans changement" | "reportée",  // lignes de campagne
  "exigencesCouvertes": ["FR-001", "FR-004"],  // ce que la campagne couvre (FR-011)
  "briefSuivant": "<référence>"                // obligatoire si reporté
}
```

### Règles de validité

- `disposition: "dérogation-motivée"` ⇒ `cause` **et** `decisionRef`
  non nuls. Une dérogation sans décision owner derrière elle est refusée — c'est
  déjà la règle machine des `lockWaivers[]` (D8) ; le registre ne l'assouplit pas.
- `verdict: "reportée"` ⇒ `preuveRef` (la preuve du blocage) **et**
  `briefSuivant` non nuls.
- `verdict: "sans changement"` ⇒ `preuveRef` pointe la preuve de conformité, et
  **aucun** reçu d'application n'est référencé.
- `ecart: "aucun"` ⇒ `cause: null`, `disposition: "sans-objet"`.
- `exigencesCouvertes` non vide sur toute ligne de campagne (FR-011).

---

## Lignes connues d'avance

Trois écarts sont déjà nommés par la recherche et entrent au registre **à G0**,
avant même d'être rencontrés :

| id | Famille | Écart | Renvoi |
|---|---|---|---|
| `E-031-001` | vague | Le set d'essai `TEST/Reassurances Responsive — Controlled` (`2563:5844`, axe `Viewport`) vit dans le fichier gouverné, sur la cible du pilote | R11 · §VIII |
| `E-031-002` | **vague** | Le renommage `HeroVideo.Presentation=Compact` → `Mobile` n'a aucun chemin runner ; FR-015 interdit d'en ouvrir un pendant la vague | R3 |
| `E-031-003` | vague | Le preflight verrous s'arrête au premier ancêtre non-COMPONENT ; un plancher posé sur la frame de catalogue n'est pas rapporté, les verrous de descendants sont visibles sans être bloquants | R13 · limite documentée de 030 |

Les nommer d'avance ne les résout pas : ce sont des entrées de la séance owner.

**Les trois sont de famille `vague`, et c'est une conséquence des règles ci-dessus.**
Une ligne de famille `campagne` exige un `verdict` et un `exigencesCouvertes` non
vide — deux faits inconnus à G0 — et il n'en existe **qu'une seule par campagne**,
écrite à la clôture. Un écart constaté à G0 sur une cible identifiée s'inscrit donc
comme ligne de **vague**, et la ligne de campagne de cette cible le référencera par
son `id` à G5. `E-031-002` nomme le blocage de `HeroVideo` ; la ligne de campagne
`031-hero-video-renommage` portera son verdict.
