# Correction — icône du Bouton Devis (trouvée 2026-07-24, nuit)

Addendum à `proofs/devis-cta/` (preuve originale T069-T070, commit `490899e`,
inchangée ci-dessus — reste valide pour ce qu'elle a mesuré à l'époque). Ce dossier
documente une correction distincte, trouvée après coup, pas une ré-adoption.

## Ce qui a été trouvé

Le master **Devis** (`2096:2524`), Bouton imbriqué (`2096:2527`), variante **« Outline
blanc »** — nom qui implique un glyphe blanc — avait son glyphe droit (chevron/flèche)
lié à la couleur **sombre** (`color/noir-bleuté`, `VariableID:5:40`) au lieu de
`color/blanc`. Trouvé en balayant TOUTES les instances de Bouton sur les 9 maquettes
(déclenché par une régression similaire, mais de mécanisme différent, trouvée sur
Hero — voir `decisions.md`) : c'est la seule autre instance de la variante « Outline
blanc » de tout le fichier qui n'était pas blanche.

**Root cause — différente de Hero** : ce n'est PAS une régression du rejeu de props par
l'automation de cette spec. La couleur sombre est bakée **dans le master lui-même**,
donc antérieure à toute adoption — presque certainement héritée telle quelle du contenu
brut source au moment du clone (`createComponentFromNode`, zéro reconstruction = les
défauts du clone source survivent aussi). Les 8 instances adoptées n'avaient aucun
override sur ce fill : elles ont fidèlement hérité le défaut sombre du master.

## Le fix

Re-liaison de `color/blanc` sur les 2 vecteurs de glyphe (arrow-left, arrow-right) du
Bouton du **master** directement — pas par instance. Propagation automatique aux 8
instances confirmée (aucune n'avait d'override sur ce fill).

## Preuve d'isolation (ce dossier)

Pour prouver que le fix ne touche QUE l'icône : le master a été temporairement remis à
l'état sombre, les 8 pages recapturées (« before-isolated »), puis le fix ré-appliqué
(état déjà capturé comme « after »). Ces deux captures, à quelques minutes d'écart avec
un seul geste basculé entre les deux, isolent exactement le delta du fix — sans risque
de contamination par du travail non lié sur les mêmes pages (le piège qui aurait faussé
une comparaison contre l'ancienne baseline pré-adoption T069, vieille de 7 vagues).

**Résultat** : 8/8 pages, diffCount 55-61 (jamais 0 — un vrai changement de couleur, pas
un no-op), diffBox ~19×10-11px sur les 8 — exactement la taille d'un petit glyphe plein.
Confirmé par un second agent indépendant (Fable) : comparaison **octet-brut** (pas
seulement pixelmatch) panneau avant vs panneau après dans chaque crop — **zéro octet
différent en dehors de la boîte du glyphe**, sur les 8 pages. Un déplacement de
n'importe quel élément aurait nécessairement laissé des deltas à ses bords ; il n'y en a
aucun. Déplacement exclu, pas juste « non visible ».

## Statut

Corrigé, vérifié indépendamment, committé. Aucun écart non résolu sur ce bloc
(contrairement à Hero, qui a un second problème distinct resté ouvert).
