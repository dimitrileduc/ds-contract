---
name: figma-component-repair
description: Auditer puis réparer un seul composant Figma Piqueray avec le runner component:repair, ses preuves historiques, ses dépendances et ses usages Page. Utiliser cette skill pour diagnostiquer un organisme, préparer une proposition minimale, appliquer une réparation après GO explicite, vérifier les Text Styles, le Container/Fill, les médias, les variantes, le responsive et prouver un second passage réellement no-op sans modifier directement les Pages.
---

# Réparation d'un composant Figma

Orchestrer le workflow existant. Ne pas réimplémenter ses contrôles dans la skill et ne jamais y ajouter de logique propre à un composant.

## Charger l'autorité

Lire entièrement `docs/internal/component-repair-workflow.md` avant toute action. Lire ensuite uniquement les contrats, décisions, captures et preuves historiques utiles au composant ciblé. Considérer le runner `npm run component:repair` comme l'autorité mécanique.

Préserver le worktree existant. Inventorier les changements concurrents et exclure explicitement de tout patch, snapshot ciblé ou commit les fichiers hors périmètre.

## Choisir le mode

- Pour « auditer », « analyser », « vérifier » ou « proposer » : ne muter ni les sources gouvernées ni Figma, exécuter l'audit, rendre `green`, `proposal` ou `blocked`, puis s'arrêter. Le runner peut écrire uniquement son `audit.json`. Si le mandat interdit toute écriture filesystem, exploiter seulement les preuves existantes et rendre `blocked` si elles ne suffisent pas.
- Pour « réparer » ou « fixer » : commencer par le même audit. Présenter la proposition minimale et attendre un GO owner explicite donné après cette proposition avant toute écriture source ou Figma.
- Pour un verdict `green` : ne rien générer et ne rien appliquer.
- Pour un verdict `blocked` : nommer la preuve exacte manquante. Ne pas combler le manque par une approximation.

## Auditer un composant

1. Identifier le master historique par id et nom, ses variantes exactes, ses dépendances structurelles, ses dépendances partagées et tous ses usages Page.
2. Retrouver la version Figma et le baseline source épinglables. Ne pas prendre l'état courant comme référence historique par défaut.
3. Déclarer ou vérifier un unique manifeste v2 mono-composant, sans élargir son périmètre d'écriture aux contextes d'usage.
4. Lancer :

   ```bash
   npm run component:repair -- --campaign <campaign.json> --audit
   ```

5. Classer chaque écart à sa source la plus basse : contrat/token, authoring Figma, contenu/média, lacune générique d'émetteur, ou historique insuffisant.
6. Inspecter tous les textes du master et des dépendances déclarées : `named-exact`, `rich-ranges`, `historical-custom` documenté, ou `defect`. Exiger un Text Style exact pour tout texte simple gouverné. Accepter l'absence de style global d'un rich text uniquement avec preuve de ses ranges.
7. Pour un organisme, vérifier un unique Container local à la largeur de référence propre au composant, contenant directement le master historique en Fill. Refuser doublon de démonstration et variante encodant la largeur.
8. Capturer les usages Page pour comparer le rendu, mais ne modifier aucun nœud Page. Un composant superposé est un contexte d'usage, pas automatiquement une dépendance modifiable.

Rendre un rapport court : verdict, faits établis, cause de chaque défaut, proposition minimale, blast radius, vérifications attendues et point d'arrêt owner.

## Réparer après GO

Après le GO explicite seulement, suivre dans l'ordre exact les étapes du workflow canonique : snapshot source, preflight, captures before, dry-run, application live externe, captures after, verify, seconde application, captures d'idempotence, verify-idempotence, décision owner et finalize.

Utiliser le Desktop Bridge uniquement comme transport du plan validé. Ne jamais transformer une connexion live en autorisation implicite. Vérifier avant application le fichier et la version épinglés.

Préserver en place le master, ses identifiants, textes, ranges, images, instance links et overrides. Pour les composites avec photos, réordonner les enfants existants en conservant l'association photo/contenu ; ne pas reconstruire les cartes.

Une seconde application n'est valide que si toutes ses opérations sont `no-op`, avec zéro nœud créé, zéro nœud modifié, mêmes arbres/faits protégés et aucun overflow aux largeurs déclarées.

## Limites non négociables

- Ne jamais éditer manuellement React, HTML, scripts Figma générés ou autres sorties générées.
- Ne jamais corriger un cas local en ajoutant un contournement dans l'émetteur.
- Ne proposer un changement d'émetteur que pour une lacune générique reproductible, avec fixture ciblé, documentation et analyse du blast radius.
- Ne jamais ajouter de largeur universelle, de variante de largeur, de doublon de master ou de vue responsive parallèle.
- Ne jamais modifier directement une instance, un Container ou un parent de Page sans l'autorisation Pages prévue par le workflow.
- Ne pas maquiller une capacité absente, notamment un breakpoint de grille, par une géométrie fixe. Rapporter la lacune séparément.
- Ne pas déclarer « terminé » sans les reçus, comparaisons, captures et preuve d'idempotence exigés.

## Livrer

Fournir les liens vers le manifeste et le verdict, le résumé du diff source, les captures master avant/après et usages Page avant/après, les contrôles de textes/médias/variantes/overflow, la preuve qu'aucun nœud Page n'a changé et le résultat du second passage no-op.

Si le travail s'arrête à l'audit, dire explicitement qu'aucune écriture source ou Figma n'a eu lieu et indiquer le GO nécessaire pour poursuivre.
