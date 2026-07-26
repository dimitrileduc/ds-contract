# Gestes — cycle V1 (Header nav, coquille 88→89)

## Geste 1 — T047 : padding gauche/droite sur les 2 variants

```js
const ids = ['84:284', '84:286']; // Fond=Solid, Fond=Transparent
for (const id of ids) {
  const n = await figma.getNodeByIdAsync(id);
  n.paddingLeft = 89;
  n.paddingRight = 89;
}
```

Relevé préalable (T045, `releves/structure-header-nav.json`) confirmé trap-free :
aucun GROUP parmi les enfants directs des deux variants, aucun redimensionnement
d'enfant requis (le padding est une propriété d'auto-layout du parent, FIXED width
1728 inchangée — `piqueray_logo` reste FIXED 180px, `nav-wrapper` reste HUG).

**Résultat** : 9/9 `diff`, chaque `diffBox` démarrant à `x=88` (frontière du
padding), large de `w=1550` (largeur de contenu du site), hauteur variable
(35–54px) selon la ligne de nav visible sur la page, `diffCount` ≈ 3600–4050
pixels — le contour fin du contenu décalé de 1px, jamais un aplat (qui ne
montrerait aucun diff). Conforme à l'annoncé (bande ~1px aux bords, 9/9 pages).
Crops zoomés (`crops/Accueil.png`, `crops/Dépannage_SAV.png`) confirmés à l'œil :
avant/après indiscernables, le panneau diff ne montre que le contour du contenu.
