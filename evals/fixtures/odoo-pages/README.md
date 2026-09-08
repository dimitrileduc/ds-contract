# Fixtures — `odoo-pages-resolve-determinism-and-refusals` (spec 037, T007)

Entrées MINIMALES du résolveur de pages : un contenu commun réduit, et une page par comportement à prouver.
Elles ne décrivent aucune page réelle du site — leur seul travail est de faire passer **une** règle à la fois.

`--fixture <dossier> <page>` résout `<dossier>/pages/<page>.json` avec `<dossier>/commun/`. Le chemin exercé est
le VRAI (`resoudreDescripteur`, `chargerBlocsDuModule` sur le `components.xml` du module) : ce que la fixture prouve,
la page réelle le fait.

| Page | Ce qu'elle prouve |
|---|---|
| `reprise.json` | reprise pure : la page suit le commun, champ par champ |
| `surcharge.json` | surcharge par champ : une part de `set_html` remplacée, la liste `cards` remplacée entière, le reste suit le commun |
| `commun-inconnu.json` | refus — bloc commun inexistant |
| `orphelin.json` | refus — clé de surcharge orpheline |
| `destination-javascript.json` | refus — `javascript:` |
| `destination-interne-inconnue.json` | refus — chemin interne qui n'est pas une page du site |
| `destination-externe-hors-liste.json` | refus — `https://` absente de la liste fermée |
| `component-inconnu.json` | refus — composant absent de `views/components.xml` |
| `copie-locale.json` | refus — bloc commun écrit en clair dans la page (SC-004) |
| `sans-destination.json` | PAS un refus : `href="#"` conservé, une ligne au registre des restes |
