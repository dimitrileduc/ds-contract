# Preuve pixel — Hero (T076)

**Instrument** : `npm run pages:compare` (pixelmatch, seuil 0.1, dimensions strictes),
transport b-fetch (`exportAsync` @1x → receiver localhost:9227). Verdict actuel :
`verdict.json`, `verdict.md`, triptyques `crops/` (avant | après | diff, un par écart).

## Historique — ce fichier a été corrigé une fois (2026-07-24, nuit)

La première version de cette preuve (auto-validation de l'agent de construction, jamais
commitée) affirmait **« 8/9 diff = bruit AA sous-pixel pur »**. C'était **faux** : une
revue visuelle indépendante (Fable) a trouvé une régression réelle — le glyphe droit du
Bouton (chevron/flèche) passait de **blanc à sombre** sur les 8 instances adoptées,
quasi invisible sur les photos de fond sombres. Root cause : le rejeu des props du
Bouton (libellé + glyphe, nécessaire pour que le composant re-hugge à la bonne largeur —
piège déjà documenté dans `audits/hero.md`) réinitialise un override de couleur hérité
sur le vecteur du glyphe swappé — un mécanisme différent du problème Devis (voir
`decisions.md`, entrée Devis). Le master lui-même (`2111:3382`) avait toujours la bonne
couleur (blanc, `color/blanc`) ; seules les 8 instances adoptées étaient affectées.

**Corrigé** : re-liaison de `color/blanc` sur le vecteur du glyphe des 8 instances,
après le rejeu des props (pas avant — l'ordre compte). Vérifié par lecture fraîche
séparée (jamais la valeur de retour du même appel qui mute — elle peut être obsolète),
recapturé, recomparé contre la même baseline pré-adoption que l'origine. Chaque page a
soit baissé soit atteint 0 (jamais dégradée) :

| Maquette | diffCount AVANT fix | diffCount APRÈS fix |
|---|---|---|
| Contactez-nous | 627 | 595 |
| Dépannage/SAV | 68 | 8 |
| Motorisation | 97 | 37 |
| Portes d'entrée | 97 | 37 |
| Portes de garage | 39 | **0 (identical)** |
| Portes de garage industrielles | 57 | 4 |
| Portes de garage résidentielles | 39 | **0 (identical)** |
| À Propos | 2101 | 2062 |

Confirmé par un second agent indépendant (Fable) sur les crops réels : icône blanche
dans les 2 panneaux avant/après de chaque triptyque restant, aucun panneau diff ne
montre plus l'icône (uniquement du texte).

## Second problème trouvé pendant cette même revue — PAS RÉSOLU, nommé honnêtement

La même revue Fable a détecté, par corrélation croisée sur les masques de glyphes blancs
(pas juste à l'œil), un **déplacement horizontal de quelques pixels (+3 à +5px) du bloc
titre/Bouton** sur 6 des 8 pages (Contactez-nous, À Propos, Motorisation, Portes
d'entrée, Dépannage/SAV, Portes de garage industrielles) — absent sur les 2 pages qui
tombent maintenant à `identical` (Portes de garage, Portes de garage résidentielles).

Points établis :
- **Antérieur à ce fix** : mesuré aussi sur l'ancien triptyque (avant ma correction de
  couleur) — donc pas introduit par le rejeu de props ni par ma correction.
- **Pas une incohérence structurelle grossière** : vérification directe des propriétés
  de nœud (pas de l'image) sur les 8 pages — `Hero.x = 0`, `Titres.paddingLeft = 89`,
  `Titres.absoluteX === Hero.absoluteX` — **identiques aux 8 pages**, aucune variance.
  La cause n'est donc pas un mauvais alignement du frame Hero ou du padding Titres.
- **Le master PEUT tomber pixel-parfait** (2/8 pages le prouvent) — donc ce n'est pas
  une limite inhérente du master, plutôt une variation par page.
- **Hypothèse non confirmée** : un arrondi de largeur du texte du sous-titre (FILL,
  contenu différent par page → largeur calculée légèrement différente au pixel près)
  décale le Bouton positionné après lui dans la même rangée auto-layout. Cohérent avec
  « le master normalise des copies sources historiquement incohérentes », même famille
  que la dérive Bouton 1px déjà acceptée (FAQ T084, Contactez-nous ci-dessous) — mais à
  une magnitude plus grande (3-5px, pas 1px) et sur 6 pages, pas 1. **Pas vérifié avec
  une confiance suffisante pour l'affirmer.**
- Le panneau diff de `crops/Contactez-nous.png` montre un **fantôme rouge plein du
  libellé du bouton** (pas juste un liseré jaune d'arêtes AA) — signature typique d'un
  décalage de position, pas de bruit de rendu. Re-vérifié à l'œil sur ce crop
  spécifiquement après le rapport Fable — cohérent avec un vrai décalage, pas un
  artefact de la méthode de comparaison.

**Statut : ouvert, non corrigé, nécessite un regard humain sur le canvas réel.** Ne
JAMAIS redécrire ce point comme « bruit AA » dans un futur commit sans l'avoir
réellement investigué — c'est exactement l'erreur déjà commise deux fois dans cette
spec (Texte SEO/À Propos, puis ce Hero lui-même pour la couleur d'icône).

## Le point déjà connu et accepté : dérive Bouton 1px sur Contactez-nous

Sur Contactez-nous, la largeur FILL du sous-titre reconstruite est **1285 vs 1284**
source (+1px) : le Bouton source « Contactez-nous » faisait 250px, le Bouton gouverné
re-hugge à 249px pour ce libellé (mesuré). **Exactement la « dérive historique 1px du
Bouton » déjà documentée à FAQ (T084)** — une correction, pas une régression. Ce point
reste valide et distinct du déplacement +3-5px ci-dessus (magnitude différente,
mécanisme probablement différent aussi, non confirmé).

## Bilan

8/8 occurrences adoptées, 0 copie brute restante, hauteur externe 640 inchangée sur les
8. Régression réelle trouvée et corrigée (couleur d'icône). Second écart trouvé, nommé,
**non résolu** (déplacement +3-5px, 6/8 pages) — remonté à l'owner, pas silencieusement
accepté ni silencieusement corrigé.
