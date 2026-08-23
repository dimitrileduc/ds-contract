# Contrat de projection — bloc `s_pqr_hero_video`

**Interface exposée** : un snippet Website Odoo gouverné, projection 1:1 de `ds.hero-video` v1.0.0. Ce document est le contrat que l'implémentation QWeb doit honorer ; la référence DOM exécutable est `core/samples/hero-video.html` (sortie `emit-html`, générée — ne jamais recopier ses octets, honorer sa structure).

## DOM contractuel

```html
<section class="s_pqr_hero_video hero-video"
         data-snippet="s_pqr_hero_video"
         data-name="Piqueray · Hero vidéo"
         data-ds-contract="ds.hero-video"
         data-ds-contract-version="1.0.0"
         data-ds-authoring-version="<courante>"
         data-ds-graph-digest="<digest recalculé>"
         data-vcss="19.0.1.9.0" data-vxml="19.0.1.9.0" data-vjs="19.0.1.9.0"
         data-pqr-root-actions="move duplicate remove"
         data-pqr-instance="hero-video-default"
         data-pqr-part="root">
  <img  class="hero-video__Background o_editable_media oe_unremovable oe_unmovable"
        data-pqr-part="hero-video-poster"/>          <!-- D2 : plan poster (video→img, adaptation tracée) ; src posé par composeur/média -->
  <div  class="hero-video__VoileBas oe_unremovable oe_unmovable"
        data-pqr-part="hero-video-voile-bas"/>
  <div  class="hero-video__VoileNavigation oe_unremovable oe_unmovable"
        data-pqr-part="hero-video-voile-navigation"/>
  <div  class="hero-video__Text oe_unremovable oe_unmovable"
        data-pqr-part="hero-video-content">
    <span class="hero-video__Accroche o_pqr_editable" data-pqr-part="hero-video-title"
          data-pqr-marks="">Le numéro 1 des portes HÖRMANN en Province de Liège !</span>
  </div>
  <!-- t-call piqueray_ds.pqr_button : variant outlineBlanc, dernier enfant DIRECT du root,
       sans wrapper — émet data-pqr-part="button-root"/"button-label" -->
</section>
```

## Invariants (vérifiables)

1. **Ordre et parenté** identiques à `emit-html` : Background, VoileBas, VoileNavigation, Text(>Accroche), Bouton — le Bouton est frère de `Text`, **pas** dedans, **pas** enveloppé. Aucune `<section>` imbriquée dans la chaîne `t-call` (porte `check-module`).
2. **Aucun `t-call pqr_section_header`** — titre direct (FR-007).
3. **Classes CSS** : exactement les classes BEM émises par `emit-html` (`hero-video`, `hero-video__Background`, `hero-video__VoileBas`, `hero-video__VoileNavigation`, `hero-video__Text`, `hero-video__Accroche`) + la classe racine `s_pqr_hero_video` — la CSS vient de `components.pqr.css` (générée), **zéro style écrit à la main** hors bridge éventuel.
4. **Adaptation D2** : la part contrat `root.Background` (élément `video`, attr `poster`) se rend en `<img>` ; l'attribut `src` porte le poster. Tracée au registre (`odoo-media-dialog` + `odoo-qweb-composition`). `videoUrl` n'a **aucune** projection Odoo.
5. **Gouvernance** : chaque nœud structurel `oe_unremovable oe_unmovable` ; seuls `hero-video-title` (plain-text, marks interdits : `data-pqr-marks=""`) et `button-label` sont rouverts (`o_pqr_editable` + réouverture root-scopée dans `authoring.js`) ; le poster n'est éditable **que** via l'action média du panneau ; actions root limitées à `move duplicate remove`.
6. **Enregistrement snippet** : `views/snippets.xml`, héritage `website.snippets`, xpath `//snippets[@id='snippet_structure']` position `inside`, `group="content"`, thumbnail du répertoire natif.
7. **Panneau** (`piqueray_ds.HeroVideoOption`, `authoring.xml`) : exactement 3 réglages + info — remplacer l'image poster (dialogue média, onglet IMAGES), texte alternatif, URL du CTA. Chaque contrôle sous `<span data-pqr-control="<decisionId>">` pointant une décision de `hero-video.authoring.json`.
8. **Marqueurs** : toute zone manuelle sous `ODOO-025-HERO-VIDEO-{QWEB,SNIPPET,PANEL,MEDIA,…} BEGIN/END`, appariée 1↔1 au registre.
9. **Layout** : le bloc est full-width par lui-même ; le full-bleed home vient du descriptor (`add_class: ["s_pqr_bleed"]`), jamais du bloc ; aucun gutter cuit dans le bloc.
