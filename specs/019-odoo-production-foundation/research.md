# Recherche — Fondation Odoo de production

**Feature**: `019-odoo-production-foundation`  
**Date**: 2026-08-07  
**Portée de la recherche**: dépôt courant, POC 018, documentation Odoo 19 et source Odoo 19
épinglée. Aucun `/eval` n'a été relancé pendant cette phase.

## 1. Stratégie de livraison

**Décision**: livrer en 019 un module Odoo de production authoré avec un agent guidé, plus un
petit générateur d'assets et des contrôles déterministes. Le générateur Odoo générique reste en
025.

**Raison**: `Presentation` prouve déjà la composition QWeb et la gouvernance d'édition, mais le POC
n'a pas exercé le repeat, les images, le ciblage par carte ni la persistance multi-instance de
`GoogleReviews`. Construire l'émetteur complet avant ces faits figerait des abstractions non
éprouvées. À l'inverse, recopier tout à la main perdrait les garanties déjà disponibles pour les
tokens et la CSS contractuelle.

**Alternatives considérées**:

- émetteur contrat → Odoo complet dès 019 : rejeté avant les faits sur repeat/image/save ;
- HTML → Odoo : rejeté comme source de vérité, car le HTML ne décrit pas le panneau, les actions,
  la sauvegarde ni les frontières d'édition ;
- module entièrement manuel : rejeté pour les styles et tokens, qui sont déjà dérivables ;
- simple pixel diff : conservé comme preuve de rendu, insuffisant comme système d'authoring.

## 2. Emplacement et séparation du produit

**Décision**: placer le produit sous `integrations/odoo/`, avec l'addon dans
`integrations/odoo/addons/piqueray_ds/`, les décisions dans `integrations/odoo/config/`, les outils
QA locaux dans `integrations/odoo/qa/` et les reçus datés dans `specs/019-.../proofs/`.

**Raison**: le module 018 est un instrument de POC contenu dans une spec. Un addon de production ne
doit pas dépendre d'un répertoire historique. `packages/` accueille les workspaces npm et
`.specify/integrations/` appartient à Spec Kit, donc aucun des deux n'est le bon propriétaire.

**Alternatives considérées**:

- promouvoir `specs/018-.../module/piqueray_ds` : rejeté, car ses preuves, zones et conclusions
  historiques se contredisent partiellement ;
- créer un package npm : rejeté, l'artefact déployé est un addon Odoo.

## 3. Cible Odoo et compatibilité

**Décision**: épingler l'environnement de qualification sur `odoo:19.0-20260803` avec PostgreSQL
15, et documenter comme référence de source Odoo 19 le commit local
`ddcf4f8959ed7d185a4dc46195ac5d5a24e26891`. Toute montée de version passe le contrôle de
compatibilité avant claim.

**Raison**: l'API du builder Odoo est réelle mais plusieurs leviers utiles sont des ressources ou
classes JavaScript internes. Le pin rend la qualification reproductible et empêche de déclarer une
compatibilité par simple hypothèse.

**Alternatives considérées**:

- image flottante `odoo:19` : rejetée, non reproductible ;
- copier du code Odoo dans le module : rejeté, maintenance et sécurité inutiles.

**Sources primaires**:

- [Odoo 19 — Building blocks](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/building_blocks.html)
- source locale Odoo 19 : `addons/html_builder/static/src/core/`,
  `addons/website/static/src/builder/`.

## 4. Composition et exposition des snippets

**Décision**: exposer exactement deux racines de snippet. Composer leurs dépendances avec des
templates QWeb nommés et `t-call`; ne pas exposer `Button`, `SectionHeader` ou `ReviewCard` dans la
bibliothèque.

**Raison**: le POC 018 prouve ce patron pour `Presentation`, et le modèle respecte la fermeture du
graphe sans dupliquer les composants imbriqués. Le groupe Odoo du snippet reste explicite.

**Alternatives considérées**:

- aplatir chaque section dans un unique template : rejeté, perte de traçabilité et duplication ;
- rendre chaque contrat posable : rejeté, ce ne sont pas toutes des sections de contenu.

## 5. Modèle de décisions d'authoring

**Décision**: utiliser deux tables distinctes par section, `controls[]` pour les props et `parts[]`
pour les parts rendues, plus `rootActions`. Toute adresse traverse le graphe par une suite de
segments typés et se résout contre le snapshot. Aucun verdict par défaut n'existe.

**Raison**: un contrôle s'applique à une valeur contractuelle, tandis que l'éditabilité Odoo
s'applique à une occurrence DOM. Par exemple, le titre `SectionHeader` appartient à
`ds.section-header` tout en devant être gouverné depuis la racine `Presentation`. Un simple nom de
prop ou de part est donc ambigu. La portée actuelle compte 30 props et 61 parts locales, soit 91
verdicts explicites, avant matérialisation des occurrences imbriquées.

**Alternatives considérées**:

- ranger toutes les décisions sous `props` : rejeté, les sélecteurs de parts imbriquées ne se
  résolvent pas ainsi ;
- utiliser uniquement des sélecteurs CSS comme identité : rejeté, ils ne prouvent pas l'origine
  contractuelle et peuvent dériver ;
- réutiliser `zones/*.json` de 018 : rejeté, leur état est antérieur à la gouvernance courante.

## 6. Gouvernance de l'éditeur Odoo

**Décision**: verrouiller chaque racine avec `content_not_editable_selectors`, rouvrir les seules
parts autorisées avec `content_editable_selectors`, retirer les options natives non déclarées par
sélecteur de racine et implémenter les contrôles explicites avec `BaseOptionComponent` et des
actions ciblées. Les actions de racine et celles des descendants reçoivent des verdicts séparés.

**Raison**: l'état final de 018 prouve la fermeture/réouverture sélective sur un bloc : son `Plugin`
contribue `content_not_editable_selectors` et `content_editable_selectors`, le reçu mesure trois
textes ouverts et quatre conteneurs fermés, et huit familles d'options natives sont écartées. Le
rapport plus ancien qui concluait « zéro levier tenu » décrivait seulement le montage à balisage,
avant l'ajout de cette couche de réglages.

Le risque qui reste à fermer en 019 est **structurel** : 018 propose encore `Drag and move`,
`Duplicate` et `Remove` sur des descendants déclarés verrouillés. La qualification 019 est donc un
spike obligatoire qui reproduit d'abord le mécanisme prouvé dans le nouvel addon, puis vérifie par
gestes réels que les actions structurelles interdites ne sont plus offertes ni exécutables. En cas
d'échec, la limite est nommée avant tout claim FR-009 / FR-010. Historique et reçus :
`proofs/correction-premisse-018.md`.

**Résultat exécuté (2026-08-08)** : le banc 019 rend les descendants volontairement candidats aux
gestes natifs via un addon QA, puis mesure 12/12 refus intérieurs, 3/3 actions racine autorisées,
2/2 zones rouvertes et 4/4 zones figées. Le panneau ne conserve qu'une politique Piqueray, aucun
champ natif ni action ancre/save non déclarée, et aucune poignée de resize active. Reçu global :
44/44, zéro saut/échec (`proofs/editability-boundary.json`). Les trois actions de racine sont
exercées dans leurs deux branches sur deux instances simultanées, afin de mesurer l'isolation par
bloc réellement promise plutôt qu'une mutation à chaud étrangère au produit.


**Alternatives considérées**:

- classe globale `o_not_editable` : rejetée comme politique unique — **non pas** parce qu'elle
  bloquerait trop, mais parce qu'elle ne bloque pas assez. 018 mesure qu'elle ferme les réglages et
  l'usage comme zone de dépôt sur son sous-arbre, et **pas** l'édition de texte, tandis que les
  réglages natifs remontent malgré tout ;
- laisser les options natives visibles mais inopérantes : rejeté par FR-010 ;
- sélecteurs non préfixés par la racine : rejetés, risque de fuite entre instances.

## 7. Repeat `ReviewCard`

**Décision**: traiter la collection comme un adaptateur Odoo explicite en 019. Il fournit
ajout/suppression/réordonnancement ciblés, conserve un prototype inerte pour pouvoir repartir de
zéro élément et marque chaque carte avec une identité d'item non métier. Les descendants de la
carte restent verrouillés sauf parts déclarées. L'ordre est l'ordre DOM sauvegardé.

**Raison**: l'action native `addItem` clone un élément existant et ne suffit donc pas pour l'état
vide exigé par la spec. `BuilderList` édite une valeur JSON mais ne matérialise pas automatiquement
la composition DOM attendue. Un petit adaptateur local est plus honnête qu'une fausse abstraction
générique; il sera compté dans le rapport de dérivation.

**Alternatives considérées**:

- interdire la suppression du dernier avis : rejeté, contredit le cas collection vide ;
- détourner `BuilderList` comme modèle persistant parallèle : rejeté, double source d'état ;
- attendre le builder 025 : rejeté, la séquence approuvée le 2026-08-07 (`ROADMAP.md`) place la
  livraison production avant 025, qui ne consomme que des faits déjà accumulés.

## 8. Média et texte riche

**Décision**: utiliser le sélecteur média natif Odoo pour l'avatar, persister un `alt` non vide quand
la photo est active, et tester les quatre combinaisons indépendantes de `photo` et
`initialeVisible` sans inventer un enum exclusif. Limiter les zones rich-text aux marques du contrat
et soumettre collage, liens et attributs à la sanitization Odoo avec tests hostiles publics.

**Raison**: `o_editable_media` est le patron Odoo pour le remplacement d'image. Le contrat
`ReviewCard` porte deux booléens distincts. Le POC ne prouve ni le picker média ni la restriction
rich-text; ce sont donc des claims nouveaux à qualifier.

**Alternatives considérées**:

- champ URL libre pour l'image : rejeté, publication cassée ou dangereuse ;
- radio `photo|initiale` : rejeté sans décision amont, car il réduit quatre états contractuels ;
- accepter toute toolbar Odoo : rejeté, elle expose des capacités hors contrat.

## 9. Frontière généré / manuel

**Décision**: générer et écraser intégralement les tokens, la CSS contractuelle, les fontes et les
assets sous `static/src/css/generated/`. Garder QWeb, authoring JS/XML et
`static/src/css/odoo-bridge.css` dans une zone manuelle. Le bridge ne contient que de la mécanique
Odoo et des valeurs liées à une source gouvernée ou à une limite codifiée.

**Raison**: `emitHtml()` sait déjà fermer le graphe et produire la CSS dependency-first. Cela évite
de retaper environ 688 lignes de CSS des deux racines et leurs dépendances. En revanche, le HTML
contractuel ne contient pas le modèle d'options Odoo. Le build d'assets reste donc mince, sans
ajouter un emitter Odoo au core en 019.

**Alternatives considérées**:

- repointer brutalement la sortie tokens historique de 018 : rejeté, cela casserait une preuve
  historique et son eval ;
- autoriser des retouches dans `components.pqr.css` : rejeté, impossible à distinguer du drift ;
- modifier `core/emit-html.ts` pour Odoo : rejeté, pollution d'un emitter vendor-neutral.

## 10. Snapshot, déterminisme et détection du drift

**Décision**: `inputs.lock.json` épingle chemins, identités, versions et SHA-256 des cinq contrats,
des tokens, registres, fontes/assets et de l'image Odoo. `odoo:assets --check` régénère en mémoire et
compare les sorties; deux exécutions doivent être identiques à l'octet. Un changement venant de 020
fait échouer le lock jusqu'au repin et à la requalification explicites.

**Raison**: la version seule ne détecte pas une modification non bumpée. Le hash seul ne donne pas
de sémantique. Les deux sont requis.

**Alternatives considérées**:

- copier les contrats dans l'intégration : rejeté, deuxième source de vérité ;
- faire confiance au git diff : rejeté, ne contrôle ni la fermeture ni l'entrée réellement lue.

## 11. Rapport de dérivation

**Décision**: produire mécaniquement `derivation-report.json` depuis les hashes attendus/réels,
la couverture de config et un registre d'adaptations. Les blocs manuels portent des marqueurs
stables `BEGIN/END`; le rapport compte fichiers, blocs, octets et lignes par `reasonCode`. Toute zone
manuelle non classée fait échouer le contrôle. Aucun champ libre `derivable` n'existe.

**Raison**: l'auteur du composant ne peut pas juger objectivement si son travail était dérivable.
Un delta mesuré est reproductible et directement consommable par 025. En 019, QWeb et JS manuels
apparaissent honnêtement dans le delta.

**Alternatives considérées**:

- `patterns.json` rédigé par l'agent : rejeté, rapport flatteur et non reproductible ;
- ignorer les fichiers manuels « attendus » : rejeté, cela cacherait précisément le coût futur.

## 12. Sauvegarde, version et migration

**Décision**: chaque racine sauvegardée porte `data-ds-contract`,
`data-ds-contract-version`, `data-ds-authoring-version` et un digest du graphe. Un manifeste relie
les versions imbriquées. Un scanner signale les structures anciennes et une action humaine; aucune
migration structurelle n'est implémentée en 019.

**Raison**: Odoo clone puis sauvegarde l'`outerHTML` du bloc. Mettre à jour le template n'altère pas
les copies déjà posées. En revanche, les attributs `contenteditable` sont nettoyés à la sauvegarde
et la politique de sélecteurs est recalculée à l'ouverture : structure gelée, politique vivante.

**Alternatives considérées**:

- annoncer que `-u` migre les pages : rejeté, faux ;
- auto-réécrire toutes les arches en 019 : rejeté, risque de perte et hors périmètre ;
- omettre les versions imbriquées : rejeté, impossible d'attribuer un drift de dépendance.

## 13. Stratégie de preuve

**Décision**: qualifier d'abord le risque `GoogleReviews` sur une vraie instance, puis reproduire
`Presentation` dans le module produit. Les portes couvrent : inputs, couverture authoring, assets,
delta manuel, XML/static, installation propre, mise à jour, deux instances de chaque section,
repeat 0/1/5/6, média, contenus hostiles, save/reopen/public, versions anciennes et pixel diff des
deux racines. Le harness visuel garde une comparaison composant stricte et ajoute un smoke de page
réelle.

**Raison**: 018 a atteint 0,0000 % sur `Button` et `SectionHeader`, mais `Presentation` mesure
**4,1707 %** — un décalage horizontal pur de 15 px, sans aucune déformation, remonté au `.container`
d'Odoo (`--gutter-x: 30px`) que nous posons nous-mêmes pour l'éditabilité. Aucune des deux racines de
019 n'a donc de précédent à 0,0000 %, et GoogleReviews n'a aucun précédent du tout.

> **CORRIGÉ le 2026-08-08.** Le 4,1707 % est la mesure du **2026-08-06**, corrigée le lendemain :
> le `proofs/comparaison-image.json` final de 018 porte **0 sur les trois composants**, CTA rendu
> compris. Réserve à connaître : cet artefact à 0 % porte `plancherDeTolerance: null` et viole donc
> l'invariant **C3** de son propre contrat, là où la version à 4,17 % le respectait. Et le 0 % a
> d'abord été obtenu en retirant le `.container` — ce qui **cassait la vraie page** : « l'instrument
> a récompensé la suppression de ce qui faisait marcher la page ». La borne finale est maison, sans
> gouttière. Voir `proofs/correction-premisse-018.md`.
 Construire le
chemin risqué avant le polish réduit le risque J5.

**Alternatives considérées**:

- terminer Presentation avant d'ouvrir GoogleReviews : rejeté, faux sentiment d'avancement ;
- ne tester que l'HTML ou le public : rejeté, absence de preuve sur authoring/save ;
- ne tester que l'image diff : rejeté, une interface éditoriale incorrecte peut rendre les mêmes
  pixels initiaux.

## 14. Guide d'agent réutilisable

**Décision**: créer un skill de dépôt dédié à la production d'une section Odoo. Il impose l'ordre
snapshot → décisions → spike mécanisme → QWeb/authoring → preuves → rapport, interdit l'édition des
sorties générées et exige la classification mécanique de toute adaptation. Le guide est exercé sur
GoogleReviews puis corrigé avant de servir aux vagues 021/022.

**Raison**: l'agent est utile pour accélérer l'authoring et documenter les découvertes, mais il ne
doit ni être dans le chemin de génération ni laisser son raisonnement comme seule connaissance.

**Alternatives considérées**:

- prompt libre par composant : rejeté, oublis non détectables ;
- attendre 025 pour formaliser : rejeté, les vagues suivantes ont besoin du workflow dès J2.

## Conclusion de Phase 0

Toutes les inconnues techniques dimensionnantes ont un traitement explicite. La seule capacité à
prouver par implémentation reste le repeat/média de GoogleReviews; elle n'est pas une clarification
de spec mais le premier spike obligatoire du plan. Aucun `NEEDS CLARIFICATION` ne subsiste.
