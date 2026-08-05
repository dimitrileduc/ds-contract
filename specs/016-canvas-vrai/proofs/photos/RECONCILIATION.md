# T057 — Census photos AVANT : réconciliation obligatoire

**Date** : 2026-08-05 · **Statut : STOP levé après réconciliation écrite**

T057 impose : *« Confronter le compte de composants porteurs aux 9 annoncés par la spec
(candidats à confirmer, jamais à décréter). Tout écart = STOP et réconciliation écrite
avant la première écriture. »*

**Il y a un écart. Il est important. Le voici.**

---

## Les comptes vifs

| | |
|---|---:|
| Photos sur les **masters** (pages DS) | **136** |
| Photos sur les **9 maquettes** | **213** |
| **TOTAL** | **349** |
| Images **distinctes** (`imageHash` unique) | **86** |
| Photos **sans `imageHash`** (invérifiables) | **0** ✅ |

| Porteur | Compte | Ce que ça implique |
|---|---:|---|
| `master` | 94 | protégées par la passe harvest/restore du moteur |
| **`instance-override`** | **255** | **la population fragile** — reconstruire les enfants d'un master ne restaure pas nécessairement les surcharges d'instance |

**Les trois quarts des photos sont des surcharges d'instance.** C'est exactement le
risque que D7 nomme, et il est plus gros que ce que le plan supposait.

## Composants porteurs : 9 annoncés → **14 relevés**

### Les 8 annoncés qui sont bien porteurs

`Carte` (4) · `Coordonnees` (1) · `Hero` (2) · `MemberCard` (2) · `MemberPicture` (4) ·
`ProductCard` (1) · `Realisations` (36) · `SAV` (2)

### 1 annoncé qui ne porte AUCUNE photo

**`Presentation`** — 0 paint `IMAGE`. La spec le listait parmi les candidats ; le relevé
le retire. Aucun risque photo sur ce composant, aucune vérification d'identité à y faire.

### 6 porteurs que la spec n'avait PAS annoncés

| Composant | Photos | Remarque |
|---|---:|---|
| **`Realisations`** | **36** | le plus chargé (la spec l'annonçait, mais avec « ~27 » : le vif en donne **36**) |
| **`Equipe`** | **32** | **non annoncé** — second plus chargé du fichier |
| **`Reassurances`** | **26** | **non annoncé** — et c'est le composant que le lot `L-DW002` vient de modifier |
| **`CategoriesPrincipales`** | **18** | **non annoncé** |
| `ProduitsECommerce` | 4 | non annoncé |
| `Devis` | 2 | non annoncé |
| `HeroVideo` | 2 | non annoncé |

## Ce que la réconciliation change au chantier

1. **Le périmètre de protection passe de 9 à 14 composants.** Le rapport photos et le
   verdict d'identité porteront sur les 14, pas sur les 9 de la prose.
2. **`Equipe`, `Reassurances` et `CategoriesPrincipales` (76 photos à eux trois) auraient
   été régénérés sans surveillance photo** si le census s'était contenté de la liste
   annoncée. C'est précisément ce que la règle « confronter, jamais décréter » existe
   pour empêcher.
3. **Aucune photo n'est invérifiable** : les 349 portent un `imageHash`, donc le verdict
   d'identité est prononçable sur 100 % de la population (SC-004).
4. **Le risque est concentré** : 255 surcharges d'instance, dont 118 sur les trois plus
   chargés.

## Conséquence sur l'ordre de régénération

Le fichier compte **58 masters**, dont **14 porteurs de photos** et donc **44 sans aucune
photo**. Ces 44 peuvent être régénérés **sans aucun risque pour les images du client**,
et ils portent déjà l'essentiel des liaisons manquantes.

**Ordre retenu** : les 44 sans photo d'abord (risque nul), les 14 porteurs ensuite, sous
verdict d'identité photo par photo. Une interruption entre les deux blocs laisse un
système partiellement lié mais **zéro image touchée**.

## Limite nommée de ce census

Le census a été pris **sans les octets** (`octets: false`) : l'identité repose sur
l'`imageHash` de Figma, qui adresse le contenu — même hash ⇔ mêmes octets. C'est
suffisant pour prononcer `identique` / `intervertie` / `perdue`.

Ce qui manque : le **sha256 des octets**, contre-preuve re-testable **hors Figma**. Il
n'a pas été pris parce que la lecture des octets de 86 images distinctes **fait tomber le
plugin** (constaté : le pont s'est déconnecté et a dû être relancé à la main). Il sera
pris par lots si le temps le permet ; sinon la limite est portée au rapport de clôture.

## Fichiers

- `.page-parity/US3/census-avant-masters.json` (136 photos, 58 racines parcourues)
- `.page-parity/US3/census-avant-maquettes.json` (213 photos, 9 maquettes)

*(hors git — 405 Mo de captures et relevés vivent sous `.page-parity/`)*
