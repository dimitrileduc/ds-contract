# T035 — Limites nommées (honnêteté §V)

Chaque limite est nommée là où sa capacité est revendiquée, pas en note de bas de page.

## Décisions de gate portées au comportement

1. **Plan Google en placeholder (Coordonnées, C1/C2).** `mapUrl`/`mapAlt` sont
   `not-editable` : la section pose une boîte aux dimensions du contrat SANS src,
   aucune action média au panneau. Le plan sera alimenté plus tard **via une API
   custom, hors vague 022** (décision owner, gate 2026-08-19). Jusque-là, la boîte
   vide est identique des deux côtés de la mesure visuelle (leçon 017 : ne jamais
   mesurer `<img src="">` contre une photo).

2. **Q-C1 Option A — coût sous-pixel du lien contact (Coordonnées).** Le bloc
   Tél/Email rend ses `<u>` du contrat en vrais liens `tel:`/`mailto:` ; le
   soulignement d'une ancre et celui d'un `<u>` ne sont pas au pixel identiques.
   C'est le **coût assumé** de rendre les liens cliquables sans toucher le contrat
   (contribue au 0.10 % du delta Coordonnées). Le spike D9 confirme que le
   soulignement, le saut de ligne et les liens survivent à pose→édition→save→
   reopen→public.

3. **R2d — alt de carte hors route contractuelle (Réassurances).** La route
   `items` du contrat `ds.reassurances` ne porte pas d'alt (`ds.carte.imageAlt`
   défaut `""`). La valeur d'alt d'une image de carte vit dans **l'instance Odoo**,
   comme l'URL — pas dans le contrat. Gouvernée par `SetCarteImageAltAction`,
   précédent `SetMemberPortraitAltAction`. Ce n'est pas un contournement silencieux.

## Comportements de layout documentés

4. **DW-002 — la source Réassurances déborde d'elle-même de 2 px.**
   4×364 + 3×32 = 1552 dans une racine de 1550. Le pont
   `ODOO-022-REASSURANCES-BRIDGE` rétrécit les colonnes (`minmax(0, …)`) —
   comportement fidèle connu, contribue au delta 0.45 %, pas un écart à réexpliquer.

## Limites structurelles d'Odoo (re-documentées)

5. **Un bloc posé est une COPIE FIGÉE** (constat 018, `html_builder`
   `snippet_service.js` : `cloneNode(true)` + `outerHTML`). Une mise à jour de
   l'addon ne repropage RIEN aux blocs déjà posés : Figma propage master→instances,
   React propage composant→usages, **Odoo ne propage rien**. Conséquence pour la
   QA : elle se fait sur **pose fraîche**, jamais sur un bloc migré.

## Limite de qualification nommée (US3)

6. **Incohérence de reçu 019 PRÉ-EXISTANTE.** `npm run odoo:qualification` échoue
   sur `google-reviews-performance: hash incohérent … google-reviews-functional.json`
   — un reçu 019 committé référence une empreinte périmée d'un autre reçu 019.
   Vérifié **indépendant de 022** : `git status` montre ces fichiers non modifiés
   depuis HEAD (donc antérieurs à cette vague). Nommé ici, pas absorbé ; sa
   résolution appartient à une re-qualification complète de 019.
