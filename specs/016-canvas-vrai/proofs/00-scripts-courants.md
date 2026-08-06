# T006 — Table des scripts `figma-sync/` COURANTS

**Date** : 2026-08-05 · **Source** : sortie verbatim de `npx tsx scripts/generate-figma.ts`

`git status --short figma-sync/` : **propre** — le dépôt était déjà à jour, la régénération n'a rien modifié.

> **Un script ne se choisit JAMAIS par son numéro.** `scripts/generate-figma.ts:82` numérote par index
> de dépendance et **ne supprime jamais** les fichiers d'une génération antérieure. Exécuter un fichier
> périmé écrirait une spec d'époque dans le fichier client.

## Sortie verbatim

```
✔ Emitted figma-sync scripts (dependency order): 01-tokens.js, 02-accordionrow.js, 03-avantage.js, 04-button.js, 05-carouselcontrols.js, 06-carte.js, 07-checkbox.js, 08-sectionheader.js, 09-coordonnees.js, 10-copyright.js, 11-devis.js, 12-memberpicture.js, 13-membercard.js, 14-equipe.js, 15-faq.js, 16-input.js, 17-select.js, 18-textarea.js, 19-field.js, 20-footercolumn.js, 21-piqueraylogo.js, 22-footer.js, 23-formulaire.js, 24-reviewcard.js, 25-googlereviews.js, 26-navitem.js, 27-header.js, 28-hero.js, 29-presentation.js, 30-productcard.js, 31-realisation.js, 32-reassurances.js, 33-sav.js, 34-tab.js, 35-texteseo.js, batch-01.js, batch-02.js, batch-03.js
```

## Comptes vifs

| | |
|---|---:|
| Fichiers sur disque (`NN-*.js` + `batch-*.js`) | **72** |
| **Courants** (la sortie du générateur fait foi) | **38** |
| **PÉRIMÉS — ne jamais exécuter** | **34** |
| Préfixes numériques ambigus | **21** |

## Table `composant → script courant`

| Composant | Script COURANT | Fichiers périmés du même composant |
|---|---|---|
| `tokens` | **`figma-sync/01-tokens.js`** | — |
| `accordionrow` | **`figma-sync/02-accordionrow.js`** | — |
| `avantage` | **`figma-sync/03-avantage.js`** | `04-avantage.js` |
| `button` | **`figma-sync/04-button.js`** | `05-button.js` |
| `carouselcontrols` | **`figma-sync/05-carouselcontrols.js`** | `06-carouselcontrols.js` |
| `carte` | **`figma-sync/06-carte.js`** | `07-carte.js` |
| `checkbox` | **`figma-sync/07-checkbox.js`** | `08-checkbox.js` |
| `sectionheader` | **`figma-sync/08-sectionheader.js`** | `09-sectionheader.js`, `22-sectionheader.js` |
| `coordonnees` | **`figma-sync/09-coordonnees.js`** | `10-coordonnees.js` |
| `copyright` | **`figma-sync/10-copyright.js`** | `09-copyright.js`, `11-copyright.js` |
| `devis` | **`figma-sync/11-devis.js`** | `12-devis.js` |
| `memberpicture` | **`figma-sync/12-memberpicture.js`** | `13-memberpicture.js`, `17-memberpicture.js` |
| `membercard` | **`figma-sync/13-membercard.js`** | `14-membercard.js`, `18-membercard.js` |
| `equipe` | **`figma-sync/14-equipe.js`** | `15-equipe.js` |
| `faq` | **`figma-sync/15-faq.js`** | `16-faq.js` |
| `input` | **`figma-sync/16-input.js`** | `10-input.js`, `17-input.js` |
| `select` | **`figma-sync/17-select.js`** | `11-select.js`, `18-select.js` |
| `textarea` | **`figma-sync/18-textarea.js`** | `12-textarea.js`, `19-textarea.js` |
| `field` | **`figma-sync/19-field.js`** | `13-field.js`, `20-field.js` |
| `footercolumn` | **`figma-sync/20-footercolumn.js`** | `14-footercolumn.js`, `21-footercolumn.js` |
| `piqueraylogo` | **`figma-sync/21-piqueraylogo.js`** | `03-piqueraylogo.js` |
| `footer` | **`figma-sync/22-footer.js`** | — |
| `formulaire` | **`figma-sync/23-formulaire.js`** | — |
| `reviewcard` | **`figma-sync/24-reviewcard.js`** | `15-reviewcard.js` |
| `googlereviews` | **`figma-sync/25-googlereviews.js`** | `16-googlereviews.js` |
| `navitem` | **`figma-sync/26-navitem.js`** | `19-navitem.js` |
| `header` | **`figma-sync/27-header.js`** | — |
| `hero` | **`figma-sync/28-hero.js`** | — |
| `presentation` | **`figma-sync/29-presentation.js`** | — |
| `productcard` | **`figma-sync/30-productcard.js`** | `20-productcard.js` |
| `realisation` | **`figma-sync/31-realisation.js`** | `21-realisation.js` |
| `reassurances` | **`figma-sync/32-reassurances.js`** | — |
| `sav` | **`figma-sync/33-sav.js`** | — |
| `tab` | **`figma-sync/34-tab.js`** | `23-tab.js` |
| `texteseo` | **`figma-sync/35-texteseo.js`** | — |
| `01` | **`figma-sync/batch-01.js`** | — |
| `02` | **`figma-sync/batch-02.js`** | — |
| `03` | **`figma-sync/batch-03.js`** | — |

## ⚠️ Préfixes numériques ambigus — la raison de la règle

Un même préfixe désigne plusieurs composants différents. Choisir « le 19 » n'a aucun sens :

| Préfixe | Fichiers | Lequel est courant |
|---|---|---|
| `03-` | `03-avantage.js`, `03-piqueraylogo.js` | `03-avantage.js` |
| `04-` | `04-avantage.js`, `04-button.js` | `04-button.js` |
| `05-` | `05-button.js`, `05-carouselcontrols.js` | `05-carouselcontrols.js` |
| `06-` | `06-carouselcontrols.js`, `06-carte.js` | `06-carte.js` |
| `07-` | `07-carte.js`, `07-checkbox.js` | `07-checkbox.js` |
| `08-` | `08-checkbox.js`, `08-sectionheader.js` | `08-sectionheader.js` |
| `09-` | `09-coordonnees.js`, `09-copyright.js`, `09-sectionheader.js` | `09-coordonnees.js` |
| `10-` | `10-coordonnees.js`, `10-copyright.js`, `10-input.js` | `10-copyright.js` |
| `11-` | `11-copyright.js`, `11-devis.js`, `11-select.js` | `11-devis.js` |
| `12-` | `12-devis.js`, `12-memberpicture.js`, `12-textarea.js` | `12-memberpicture.js` |
| `13-` | `13-field.js`, `13-membercard.js`, `13-memberpicture.js` | `13-membercard.js` |
| `14-` | `14-equipe.js`, `14-footercolumn.js`, `14-membercard.js` | `14-equipe.js` |
| `15-` | `15-equipe.js`, `15-faq.js`, `15-reviewcard.js` | `15-faq.js` |
| `16-` | `16-faq.js`, `16-googlereviews.js`, `16-input.js` | `16-input.js` |
| `17-` | `17-input.js`, `17-memberpicture.js`, `17-select.js` | `17-select.js` |
| `18-` | `18-membercard.js`, `18-select.js`, `18-textarea.js` | `18-textarea.js` |
| `19-` | `19-field.js`, `19-navitem.js`, `19-textarea.js` | `19-field.js` |
| `20-` | `20-field.js`, `20-footercolumn.js`, `20-productcard.js` | `20-footercolumn.js` |
| `21-` | `21-footercolumn.js`, `21-piqueraylogo.js`, `21-realisation.js` | `21-piqueraylogo.js` |
| `22-` | `22-footer.js`, `22-sectionheader.js` | `22-footer.js` |
| `23-` | `23-formulaire.js`, `23-tab.js` | `23-formulaire.js` |

## Les 34 fichiers PÉRIMÉS — à ne jamais exécuter

```
figma-sync/03-piqueraylogo.js
figma-sync/04-avantage.js
figma-sync/05-button.js
figma-sync/06-carouselcontrols.js
figma-sync/07-carte.js
figma-sync/08-checkbox.js
figma-sync/09-copyright.js
figma-sync/09-sectionheader.js
figma-sync/10-coordonnees.js
figma-sync/10-input.js
figma-sync/11-copyright.js
figma-sync/11-select.js
figma-sync/12-devis.js
figma-sync/12-textarea.js
figma-sync/13-field.js
figma-sync/13-memberpicture.js
figma-sync/14-footercolumn.js
figma-sync/14-membercard.js
figma-sync/15-equipe.js
figma-sync/15-reviewcard.js
figma-sync/16-faq.js
figma-sync/16-googlereviews.js
figma-sync/17-input.js
figma-sync/17-memberpicture.js
figma-sync/18-membercard.js
figma-sync/18-select.js
figma-sync/19-navitem.js
figma-sync/19-textarea.js
figma-sync/20-field.js
figma-sync/20-productcard.js
figma-sync/21-footercolumn.js
figma-sync/21-realisation.js
figma-sync/22-sectionheader.js
figma-sync/23-tab.js
```

Ils restent sur disque (le générateur ne nettoie pas) et sont **commités** : leur présence n'est
pas un défaut de l'espace de travail mais une propriété du générateur. 016 ne les supprime pas
— ce serait un geste hors périmètre — mais les nomme ici pour que T059 ne s'y trompe pas.
