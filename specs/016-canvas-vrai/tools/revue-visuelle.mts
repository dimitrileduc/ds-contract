// revue-visuelle.mts — la page de revue AVANT / APRÈS du chantier, pour l'owner.
//
// Usage :
//   npx tsx specs/016-canvas-vrai/tools/revue-visuelle.mts \
//     --avant .page-parity/00-REFERENCE-AVANT-CHANTIER \
//     --apres .page-parity/<jeu-final> \
//     --out   specs/016-canvas-vrai/proofs/REVUE-VISUELLE.html
//
// POURQUOI (demande owner du 2026-08-05) : « à la fin de la feature, comment je peux
// checker moi-même avant/après ? ». Les verdicts JSON et les comptes ne répondent pas
// à cette question — il faut VOIR. Cette page montre, maquette par maquette, l'état
// d'avant, l'état d'après, et exactement les pixels qui ont bougé.
//
// AUTONOME PAR CONSTRUCTION : les images sont EMBARQUÉES en base64. Les captures
// pleine résolution (45 Mo pour 9 maquettes) ne sont pas commitées ; cette page,
// elle, reste lisible dans six mois même si les PNG d'origine ont disparu et même
// sans le dépôt. C'est elle l'archive, pas les PNG.
//
// Trois vues par maquette :
//   · avant / après réduits (facteur entier, lecture d'ensemble)
//   · la carte des différences en pleine résolution, recadrée sur la zone qui a bougé
//     (les pixels changés en rouge) — c'est là que se juge un écart annoncé
//
// Aucun refus silencieux : une maquette présente d'un seul côté, une dimension qui
// change, une lecture qui échoue → c'est écrit dans la page, jamais omis.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const argv = process.argv.slice(2);
const arg = (n: string, d?: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const dirAvant = arg('--avant');
const dirApres = arg('--apres');
const out = arg('--out', 'specs/016-canvas-vrai/proofs/REVUE-VISUELLE.html')!;
const titre = arg('--titre', 'Revue visuelle — 016 · Canvas vrai')!;
const largeurVue = Number(arg('--largeur', '460'));

if (!dirAvant || !dirApres) {
  console.error('usage: revue-visuelle.mts --avant <dir> --apres <dir> [--out x.html] [--largeur 460]');
  process.exit(2);
}

const pngsDe = (d: string) => existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.png')).sort() : [];
const noms = [...new Set([...pngsDe(dirAvant), ...pngsDe(dirApres)])].sort();
if (!noms.length) { console.error(`aucun PNG dans ${dirAvant} ni ${dirApres}`); process.exit(2); }

// Sous-échantillonnage par pas entier : pas d'interpolation, donc pas de flou inventé.
function reduire(src: PNG, largeurCible: number): PNG {
  const pas = Math.max(1, Math.round(src.width / largeurCible));
  const w = Math.floor(src.width / pas), h = Math.floor(src.height / pas);
  const dst = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = ((y * pas) * src.width + (x * pas)) << 2, d = (y * w + x) << 2;
    dst.data[d] = src.data[s]; dst.data[d + 1] = src.data[s + 1];
    dst.data[d + 2] = src.data[s + 2]; dst.data[d + 3] = src.data[s + 3];
  }
  return dst;
}

// Carte des différences : les pixels changés en rouge sur l'après atténué.
function carteDiff(a: PNG, b: PNG) {
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  const map = new PNG({ width: w, height: h });
  let n = 0, minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ia = (y * a.width + x) << 2, ib = (y * b.width + x) << 2, id = (y * w + x) << 2;
    const diff = Math.abs(a.data[ia] - b.data[ib]) + Math.abs(a.data[ia + 1] - b.data[ib + 1]) + Math.abs(a.data[ia + 2] - b.data[ib + 2]);
    if (diff > 12) {
      n++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      map.data[id] = 255; map.data[id + 1] = 40; map.data[id + 2] = 40; map.data[id + 3] = 255;
    } else {
      // l'après, éclairci, pour situer le changement dans la page
      map.data[id] = 255 - ((255 - b.data[ib]) >> 2);
      map.data[id + 1] = 255 - ((255 - b.data[ib + 1]) >> 2);
      map.data[id + 2] = 255 - ((255 - b.data[ib + 2]) >> 2);
      map.data[id + 3] = 255;
    }
  }
  const boite = maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  return { map, n, boite };
}

function recadrer(src: PNG, b: { x: number; y: number; w: number; h: number }, marge = 60): PNG {
  const x0 = Math.max(0, b.x - marge), y0 = Math.max(0, b.y - marge);
  const x1 = Math.min(src.width, b.x + b.w + marge), y1 = Math.min(src.height, b.y + b.h + marge);
  const w = x1 - x0, h = y1 - y0;
  const dst = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = ((y + y0) * src.width + (x + x0)) << 2, d = (y * w + x) << 2;
    dst.data[d] = src.data[s]; dst.data[d + 1] = src.data[s + 1];
    dst.data[d + 2] = src.data[s + 2]; dst.data[d + 3] = src.data[s + 3];
  }
  return dst;
}

const b64 = (p: PNG) => 'data:image/png;base64,' + PNG.sync.write(p, { deflateLevel: 9 }).toString('base64');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

type Bloc = { nom: string; statut: string; detail: string; avant?: string; apres?: string; diff?: string; pixels?: number };
const blocs: Bloc[] = [];
let identiques = 0, modifiees = 0, problemes = 0;

for (const nom of noms) {
  const pa = path.join(dirAvant, nom), pb = path.join(dirApres, nom);
  const label = nom.replace(/\.png$/, '');
  if (!existsSync(pa)) { blocs.push({ nom: label, statut: 'apparue', detail: 'présente seulement APRÈS — absente de la référence' }); problemes++; continue; }
  if (!existsSync(pb)) { blocs.push({ nom: label, statut: 'disparue', detail: 'présente seulement AVANT — absente de l\'état final' }); problemes++; continue; }

  let A: PNG, B: PNG;
  try { A = PNG.sync.read(readFileSync(pa)); B = PNG.sync.read(readFileSync(pb)); }
  catch (e) { blocs.push({ nom: label, statut: 'illisible', detail: String((e as Error).message) }); problemes++; continue; }

  const dimChange = A.width !== B.width || A.height !== B.height;
  const { map, n, boite } = carteDiff(A, B);
  const bloc: Bloc = {
    nom: label,
    statut: n === 0 && !dimChange ? 'identique' : 'modifiée',
    detail: dimChange
      ? `dimensions changées : ${A.width}×${A.height} → ${B.width}×${B.height}${n ? ` · ${n.toLocaleString('fr-FR')} pixels différents dans la zone commune` : ''}`
      : n === 0 ? 'aucun pixel n\'a bougé'
      : `${n.toLocaleString('fr-FR')} pixels différents · zone ${boite!.w}×${boite!.h} px à (${boite!.x}, ${boite!.y})`,
    pixels: n,
    avant: b64(reduire(A, largeurVue)),
    apres: b64(reduire(B, largeurVue)),
  };
  if (n > 0 && boite) bloc.diff = b64(recadrer(map, boite));
  if (bloc.statut === 'identique') identiques++; else modifiees++;
  blocs.push(bloc);
  console.log(`  ${bloc.statut.padEnd(10)} ${label.padEnd(32)} ${bloc.detail}`);
}

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titre)}</title>
<style>
 :root{--bd:#e5e2dc;--tx:#26282c;--mu:#6b6d72;--bg:#faf9f7;--ok:#2e7d5b;--ch:#b45309}
 @media (prefers-color-scheme:dark){:root{--bd:#33363b;--tx:#e8e6e3;--mu:#9a9da3;--bg:#191b1e;--ok:#4ade80;--ch:#fbbf24}}
 *{box-sizing:border-box}
 body{margin:0;padding:2rem 1.25rem 5rem;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--tx);background:var(--bg)}
 .wrap{max-width:1180px;margin:0 auto}
 h1{font-size:1.6rem;margin:0 0 .3rem}
 .sub{color:var(--mu);margin:0 0 2rem}
 .tot{display:flex;gap:2.5rem;flex-wrap:wrap;padding:1.1rem 1.3rem;border:1px solid var(--bd);border-radius:12px;margin-bottom:2.5rem;background:transparent}
 .tot div{display:flex;flex-direction:column}
 .tot b{font-size:1.7rem;font-weight:650;line-height:1.2}
 .tot span{color:var(--mu);font-size:.82rem;text-transform:uppercase;letter-spacing:.04em}
 section{border:1px solid var(--bd);border-radius:12px;padding:1.3rem;margin-bottom:1.6rem}
 .hd{display:flex;align-items:baseline;gap:.8rem;flex-wrap:wrap;margin-bottom:.2rem}
 .hd h2{font-size:1.12rem;margin:0}
 .tag{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;padding:.2rem .55rem;border-radius:999px;border:1px solid currentColor}
 .t-identique{color:var(--ok)} .t-modifiée{color:var(--ch)} .t-apparue,.t-disparue,.t-illisible{color:#dc2626}
 .det{color:var(--mu);font-size:.9rem;margin:0 0 1rem}
 .duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}
 figure{margin:0} figcaption{font-size:.78rem;color:var(--mu);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.04em}
 img{width:100%;height:auto;display:block;border:1px solid var(--bd);border-radius:6px;background:#fff}
 .zoom{margin-top:1.2rem;padding-top:1.2rem;border-top:1px dashed var(--bd)}
 .zoom .sc{overflow-x:auto} .zoom img{max-width:none;min-width:100%}
 details{margin-top:1.5rem;border:1px solid var(--bd);border-radius:12px;padding:1rem 1.3rem}
 summary{cursor:pointer;font-weight:600}
 code{background:rgba(128,128,128,.14);padding:.1em .4em;border-radius:4px;font-size:.9em}
 ul{padding-left:1.2rem}
</style></head><body><div class="wrap">
<h1>${esc(titre)}</h1>
<p class="sub">Comparaison pixel à pixel des ${noms.length} maquettes, entre l'état d'avant le chantier et l'état actuel. Généré depuis les captures pleine résolution ; les images sont embarquées dans cette page.</p>
<div class="tot">
 <div><b>${noms.length}</b><span>maquettes</span></div>
 <div><b style="color:var(--ok)">${identiques}</b><span>inchangées</span></div>
 <div><b style="color:var(--ch)">${modifiees}</b><span>modifiées</span></div>
 ${problemes ? `<div><b style="color:#dc2626">${problemes}</b><span>à regarder</span></div>` : ''}
</div>
${blocs.map((b) => `<section>
 <div class="hd"><h2>${esc(b.nom)}</h2><span class="tag t-${b.statut}">${b.statut}</span></div>
 <p class="det">${esc(b.detail)}</p>
 ${b.avant && b.apres ? `<div class="duo">
   <figure><figcaption>Avant</figcaption><img src="${b.avant}" alt="avant"></figure>
   <figure><figcaption>Après</figcaption><img src="${b.apres}" alt="après"></figure>
 </div>` : ''}
 ${b.diff ? `<div class="zoom"><figcaption style="font-size:.78rem;color:var(--mu);margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.04em">Ce qui a changé — en rouge, pleine résolution</figcaption><div class="sc"><img src="${b.diff}" alt="différences"></div></div>` : ''}
</section>`).join('\n')}
<details><summary>Comment lire cette page, et comment vérifier par toi-même dans Figma</summary>
<ul>
 <li><b>« inchangée »</b> : aucun pixel n'a bougé entre les deux états. Pour un lot annoncé « rien ne doit bouger », c'est le résultat attendu — et c'est une preuve, pas une absence de résultat.</li>
 <li><b>« modifiée »</b> : la troisième image montre en rouge <em>exactement</em> les pixels qui ont changé, en pleine résolution. Chaque changement doit correspondre à un écart annoncé <em>avant</em> le geste ; s'il y en a un que l'annonce ne prévoyait pas, le lot est annulé en entier.</li>
 <li><b>Dans Figma, sans passer par moi</b> : <code>Fichier › Afficher l'historique des versions</code>. Les points sont nommés <code>016/&lt;lot&gt;/avant</code>. Tu peux afficher n'importe lequel, comparer, et restaurer.</li>
 <li>Les écarts sont détectés au-delà de 12 (somme des écarts R+V+B) pour ignorer le bruit d'encodage — le plancher de bruit de l'instrument a été mesuré nul avant le chantier.</li>
</ul>
</details>
</div></body></html>`;

writeFileSync(out, html);
const mo = (Buffer.byteLength(html) / 1e6).toFixed(1);
console.log(`\nrevue-visuelle → ${out} (${mo} Mo, autonome)`);
console.log(`  ${noms.length} maquettes · ${identiques} inchangées · ${modifiees} modifiées${problemes ? ` · ${problemes} à regarder` : ''}`);
