# Audit — Footer (+ Devis) (T099)

**Date** : 2026-07-25
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console, lecture live par position sur les 9 pages.
**Dernier bloc de construction de la Phase 8** — plus grand rayon d'impact de toute la
spec (les 9 pages, aucune exclusion).

## Reprise après interruption d'infrastructure

Une tentative de construction déléguée a été interrompue par une erreur d'infrastructure
réelle (« Connection closed mid-response ») dès l'étape de capture `before`, avant tout
geste mutant — canvas resté intact, avant-captures partielles orphelines nettoyées. Ce
bloc a été exécuté directement par l'orchestrateur (`main`) plutôt que re-délégué, vu la
récurrence de l'incident cette nuit sur des tâches longues (4 occurrences : Produits
e-commerce, Réalisations ×2, Footer+Devis) et le fait que l'audit préalable avait déjà
tranché la question structurelle (voir ci-dessous), rendant le geste simple et bien
compris.

## Usage — localisation par position (les 9 pages)

**9 occurrences**, toutes `Footer + Devis` (FRAME, 1728×459), contenant chacune UN SEUL
enfant direct : un GROUP `Footer` (raw, jamais gouverné) — Contactez-nous (`274:2676`),
À Propos (`258:1969`), Dépannage/SAV (`249:1629`), Portes d'entrée (`237:1101`),
Motorisation (`237:802`), Portes de garage industrielles (`387:843`), Portes de garage
résidentielles (`230:457`), Portes de garage (`226:233`), Accueil (`210:447`).

## La question « + Devis » tranchée par la mesure

Le nom du wrapper (« Footer + Devis ») laissait penser qu'une CTA Devis serait fusionnée
dans le footer d'au moins une page (l'entrée `decisions.md` originale de Devis/CTA notait
déjà : « toutes les maquettes sauf Contactez-nous, qui a Footer + Devis composite, hors
périmètre de ce bloc » — sous-entendant une fusion sur Contactez-nous spécifiquement).
**Mesure live sur les 9 : aucune section Devis distincte n'existe nulle part dans le
wrapper — le "+ Devis" est un artefact de nom, pas un contenu réel.** Ce que contient
réellement chaque `Footer` : un `Bouton` CTA « Contactez-nous » (déjà présent dans le
footer standard, pas un Devis séparé) — cohérent sur les 9, y compris Contactez-nous.

## Contenu byte-identique sur les 9 (mesuré, pas supposé)

Comparaison directe des 9 tableaux de textes (Copyright, Suivez-nous, Contact/Horaires/
Adresse × Titre+Texte, libellé du Bouton) : **identiques mot pour mot sur les 9 pages**,
y compris le caractère invisible `\r` dans le bloc Contact. Dimensions identiques
(1728×459). Variante du Bouton : `Outline blanc` sur les 9, glyphe **déjà correctement
blanc** (`color/blanc`, `VariableID:4:29`) — vérifié explicitement avant construction, vu
que cette même variante avait un défaut réel sur Hero et sur Devis plus tôt cette nuit
(voir `decisions.md`, entrées de correction) ; aucun défaut ici.

**Conséquence** : master `COMPONENT` simple (pas de `COMPONENT_SET`, aucune variante
nécessaire), adoption à **0 override attendu** sur les 9 — le cas le plus simple de toute
la spec.

## Structure (commune aux 9)

```
Footer (GROUP, 1728×459)
 ├ Background (RECTANGLE)
 ├ Copyright (instance, gouvernée T060)
 ├ Separator (LINE)
 └ Row (GROUP)
    ├ Col 5 : Suivez-nous (TEXT) + icônes sociales (gouvernées, T037)
    ├ Footer-column × 3 (instances, gouvernées T058)
    └ Col 1 : piqueray_logo (instance native, existant) + Bouton (instance gouvernée, CTA « Contactez-nous »)
```

## Zéro dépendance tierce

Toutes les instances imbriquées (Copyright, Footer-column ×3, Bouton, glyphes,
piqueray_logo) vérifiées `getMainComponentAsync().remote === false`. Aucune bibliothèque
externe.

## Construction — le master livré

`DS · Molécules` → section **Footer** (`2120:4766`, à `0,18050`) → `COMPONENT` **Footer**
(`2120:4785`, à `40,18110` absolu, 1728×459), cloné du GROUP `Footer` de Contactez-nous +
`createComponentFromNode`, zéro reconstruction manuelle.

**Piège Figma retrouvé (déjà documenté cette spec)** : `section.appendChild(node)` a rendu
les coordonnées du master **relatives à la section**, pas absolues à la page — le master
placé à `y=18110` s'est retrouvé à `absoluteY=36160` (cumul avec l'offset de la section à
`18050`). Corrigé en repositionnant en coordonnées LOCALES (`y=60`, relatif à la section),
revérifié par lecture séparée : `absoluteY=18110` correct.

## Adoption (T100) — 9 instances, 0 override

Remplacement du GROUP brut par une instance du master sur les 9 pages, à l'index d'origine
(`insertChild`, parent auto-layout, zéro coordonnée manuelle). Vérification exhaustive
post-adoption (leçon Réalisations — ne jamais se fier à un chiffre agrégé) : contenu texte
comparé **directement au master** (pas à une copie manuelle du texte, qui a produit un
faux-positif « ne correspond pas » lors de la première vérification — piège de retranscription,
même famille que les erreurs de comptage de caractères déjà documentées) — 9/9 instances
identiques au master, glyphes du Bouton blancs sur les 9, `remote:false` partout, bbox
`{0,0,0,0}`.

## Preuve pixel

| Maquette | diffCount | Lecture |
|---|---|---|
| Accueil, Contactez-nous, Dépannage/SAV, Motorisation, Portes de garage | 61-64 | AA sous-pixel, libellé Bouton « CONTACTEZ-NOUS » |
| Portes d'entrée, Portes de garage résidentielles | 61 | idem |
| Portes de garage industrielles | 151 | idem, magnitude légèrement supérieure |

**9/9 diff**, jamais `identical` — cohérent avec chaque autre bloc de cette spec ayant un
texte neuf ré-instancié (le rendu clone→instance produit toujours un peu de bruit
sous-pixel). Tous les résidus sont **≪ 0,01 %** de leur page respective. Crops inspectés à
l'œil (Contactez-nous et industrielles, le plus petit et le plus grand écart) : liseré
jaune fin sur les arêtes du texte, aucun fantôme rouge plein, aucun décalage, aucun
changement de couleur.

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | `Footer` (`2120:4785`), COMPONENT, 1728×459 |
| Section | `Footer` (`2120:4766`), `DS · Molécules`, à `0,18050` |
| Dépendances | Copyright (T060), Footer-column ×3 (T058), Bouton, icônes sociales — toutes locales, zéro tierce |
| Adoption | 9/9 pages, 0 override (contenu byte-identique) |
| Checkpoints | `003/footer-devis/master` (`2379977937746712738`), `003/footer-devis/adoption` (`2380011855649520154`) |
