# US2 — verdict live

Verdict : **vert**, repinné sur la version Figma `2385978952503240149`.

- Button conserve son identité `6:122` et expose deux propriétés natives `INSTANCE_SWAP`, chacune avec les 19 icônes gouvernées du registre.
- CarouselControls conserve son identité `2077:2191`. Le témoin précédent passe réellement de ChevronLeft à ChevronRight puis revient à ChevronLeft ; le témoin suivant fait l'inverse. La géométrie reste `104×52` en `(40, 60)`.
- Coordonnées et Formulaire exposent nativement leur instance SectionHeader. Les clés suffixées `Accroche#2090:46` et `Titre#2090:47` modifient le texte visible, puis les valeurs sont restaurées. Les géométries des occurrences restent strictement identiques.
- Les 30 impacts Button/SectionHeader/absolute sont présents, revalidés et sans ligne `pending`. La qualification Odoo 019 reste reliée à sa décision dédiée.
- La recapture après est complète : 72 artefacts, 60 empreintes IMAGE et 231 liens d'instance.

Les deux refus observés étaient protecteurs : le sandbox a refusé le fetch localhost avant mutation, puis l'API Figma a refusé l'écriture illégale sur un sous-calque d'instance. Le mécanisme final utilise `isExposedInstance`, l'API native publique de Figma, sans heuristique de nom de calque.
