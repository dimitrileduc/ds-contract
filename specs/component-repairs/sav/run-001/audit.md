# Audit read-only — SAV

Verdict : **proposal — arrêt avant toute réparation**.

Audit live réalisé le 2026-08-11 sur le fichier
`d9FYAUcqdcNtsuaMgLefvJ`, version REST observée
`2386533441442286618`. Le Desktop Bridge n'a exécuté que
`specs/component-repairs/sav/run-001/live-audit.js`, qui ne contient aucune
mutation Plugin API.

## Identité et usages

- master historique unique : `SAV`, nœud `2108:3105`, key
  `bf5e147a9b56206eba9c73045d533c9868b445b2` ;
- aucune variante ;
- un seul usage Page par identité de composant : instance `2108:3135` dans
  `Pages/Accueil` ;
- dépendances structurelles : `ds.section-header` et `ds.button` ;
- images historiques présentes avec leurs hashes exacts : fond
  `3e173874828861c294938a12deea5a5a7a1799dd` et technicien
  `429c615cb090b3aa0800188acda4bc59cc6445b0` ;
- copy master et copy Page identiques, y compris le saut de ligne du
  paragraphe.

## Défauts établis

### Container et responsive

- le master est encore directement sous la SECTION `2108:3091`, sans
  Container local auto-layout ;
- root `HUG 1550×677`, section `FIXED 1550×677` ;
- row `FIXED 1288×561`, colonnes `641/647`, inner `FIXED 546` ;
- l'instance Page reste `HUG 1550×677` ; elle est un contexte de contrôle et
  n'est pas une cible d'écriture ;
- la décision existante impose la référence `1550` et un contrôle réduit à
  `1262`. Elle dit explicitement qu'un Fill du root seul ne suffit pas.

Source du défaut : **contrat/authoring SAV**, pas une variante et pas la Page.

### Textes

| Texte | Classe live | Verdict |
| --- | --- | --- |
| Accroche SectionHeader | `named-exact` — `Accroche` | conforme |
| Titre `Dépannage / SAV` | un seul segment 40/50 Regular, aucun Text Style | `defect` ; la métrique correspond exactement à `Titre 2` |
| Paragraphe | un seul segment Medium 18/27, aucun Text Style | `defect` ; les trois ranges Bold historiques ont été aplatis |
| Libellé bouton | `named-exact` — `Libellé bouton` | conforme |

Le paragraphe n'est donc pas une exception rich text saine : son contrat
déclare bien trois plages Bold (`33–52`, `101–122`, `252–299`), mais le master
live n'en porte plus aucune. La capture de référence 013 montre ces trois
passages en gras ; la capture 021 et l'état courant les ont perdus.

Le titre simple sans style provient du `SectionHeader` partagé : sa variante
`2338:29029` porte elle aussi ce titre en typographie brute. Une correction
locale sur le descendant SAV ne serait pas persistante au prochain
contract-to-Figma.

### Bouton partagé

La propriété `Icône droite` est encore `true`, mais le vecteur ArrowRight est
lié à `color/noir-bleute` dans la variante Button `Style=Default`, sur le fond
de même couleur. La flèche blanche visible dans la référence 013 est donc
devenue invisible.

Source du défaut : **dépendance partagée `ds.button` / projection de la couleur
des icônes**, avec blast radius à inventorier avant modification. Aucun patch
local au bouton contenu dans SAV n'est proposé.

## Proposition minimale

1. Adapter `contracts/sav.contract.json` avec les primitives déjà gouvernées :
   root/section/background Fill à référence 1550, row réductible, deux colonnes
   flexibles, inner/SectionHeader/texte Fill. Conserver la hauteur de référence
   677, les overlays, les deux images, le copy, le CTA et tous les ids.
2. Calibrer la composition à 1550 puis 1262 sans inventer de breakpoint : le
   rendu 1550 doit rester pixel-fidèle et le 1262 doit être sans overflow.
3. Réappliquer les trois ranges Bold du paragraphe depuis le contrat. Ne lui
   attribuer aucun Text Style global.
4. Traiter le titre simple via la source partagée `ds.section-header`, avec
   inventaire de ses usages rich text avant toute écriture.
5. Traiter séparément la couleur de glyphes du `ds.button` partagé, avec son
   blast radius. Ne pas absorber ce défaut dans une rustine SAV.
6. Présenter ensuite le master existant dans un unique Container local 1550 et
   passer le master en Fill. Ne créer aucun doublon ni variante de largeur.
7. Capturer master et usage Page avant/après, contrôler à 1550 et 1262, puis
   exiger une seconde application réellement no-op. Aucun nœud Page ne change.

## Limite du runner révélée par ce test

Le moteur d'audit a été exécuté directement en lecture seule et a rendu
`proposal`. Le CLI v2 ne peut toutefois pas initialiser honnêtement ce nouveau
run avant le GO : son validateur exige déjà un `sourceBaseline`, alors que le
workflow place précisément le snapshot après le GO. De plus, son Bridge v2 ne
transporte aujourd'hui que `ensure-organism-container`, pas l'amend généré
nécessaire à l'anatomie SAV.

Ces deux limites doivent être fermées génériquement avant l'application ; elles
ne justifient ni faux baseline, ni script SAV ad hoc, ni contournement de reçu.

## Preuves

- `specs/component-repairs/sav/run-001/live-audit.raw.json`
- `specs/component-repairs/sav/run-001/audit/sav-master.png`
- `specs/component-repairs/sav/run-001/audit/sav-page-instance.png`
- `specs/013-auditer-fidelite-organismes/proofs/organisms/sav/cases/sav-master-defaults/figma.png`
- `specs/021-figma-projection-repair/proofs/after/sav_master.png`
- `docs/organisms-responsive-decisions.md`

## Gate

Arrêt avant `--snapshot-source`, avant modification du contrat ou des
dépendances, et avant toute écriture Figma. La suite exige un GO owner explicite
sur cette proposition et son blast radius partagé.
