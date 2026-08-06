// revue-visuelle.mts — la page de revue AVANT / APRÈS du chantier, pour l'owner.
//
// Usage :
//   npx tsx specs/016-canvas-vrai/tools/revue-visuelle.mts \
//     --avant .page-parity/00-REFERENCE-AVANT-CHANTIER \
//     --apres .page-parity/<jeu-final> \
//     --out   specs/016-canvas-vrai/proofs/REVUE-VISUELLE.html
//
// POURQUOI (demande owner du 2026-08-05) : « à la fin de la feature, comment je peux
// checker moi-même avant/après ? ». Les verdicts JSON ne répondent pas — il faut VOIR.
//
// LEÇON DE LA PREMIÈRE VERSION (rejetée par l'owner le 2026-08-05) : elle réduisait
// les maquettes de 1728 px à 300-460 px pour tenir le poids du fichier. Résultat :
// texte illisible, page inutile. **Une revue qu'on ne peut pas lire ne prouve rien.**
// La lisibilité prime sur le poids — et le bon levier n'était pas la résolution mais
// le FORMAT : à 1200 px de large, un JPEG q75 pèse 0,57 Mo là où le PNG source en
// pèse 5. On garde donc une résolution confortable pour ~9× moins d'octets.
//
// Aucune dépendance ajoutée : l'encodage JPEG est fait par le Chromium que le dépôt
// utilise déjà (playwright-core, parité visuelle). pngjs sert au diff pixel.
//
// AUTONOME PAR CONSTRUCTION : images embarquées. Les captures pleine résolution
// (45 Mo) ne sont pas commitées ; cette page, elle, reste lisible dans six mois sans
// le dépôt. C'est elle l'archive.
//
// Économie de poids qui ne coûte rien à la preuve : pour une maquette INCHANGÉE, les
// deux images sont identiques par définition — on n'en embarque qu'UNE.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { chromium, type Browser, type Page } from 'playwright-core';

const argv = process.argv.slice(2);
const arg = (n: string, d?: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const dirAvant = arg('--avant');
const dirApres = arg('--apres');
const out = arg('--out', 'specs/016-canvas-vrai/proofs/REVUE-VISUELLE.html')!;
const titre = arg('--titre', 'Revue visuelle — 016 · Canvas vrai')!;
const largeurVue = Number(arg('--largeur', '1200'));
const qualite = Number(arg('--qualite', '0.75'));

if (!dirAvant || !dirApres) {
  console.error('usage: revue-visuelle.mts --avant <dir> --apres <dir> [--out x.html] [--largeur 1200] [--qualite 0.75]');
  process.exit(2);
}

const CHROMIUM = [
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  '/Users/dlstudio/Library/Caches/ms-playwright/chromium-1228/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
].filter(Boolean).find((p) => existsSync(p!));
if (!CHROMIUM) {
  console.error('Chromium introuvable — `npx playwright install chromium`, ou PLAYWRIGHT_CHROMIUM_PATH.');
  process.exit(2);
}

const pngsDe = (d: string) => existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.png')).sort() : [];
const noms = [...new Set([...pngsDe(dirAvant), ...pngsDe(dirApres)])].sort();
if (!noms.length) { console.error(`aucun PNG dans ${dirAvant} ni ${dirApres}`); process.exit(2); }

// Carte des différences : pixels changés en rouge, sur l'après atténué pour situer.
function carteDiff(a: PNG, b: PNG) {
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  const map = new PNG({ width: w, height: h });
  let n = 0, minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ia = (y * a.width + x) << 2, ib = (y * b.width + x) << 2, id = (y * w + x) << 2;
    const d = Math.abs(a.data[ia] - b.data[ib]) + Math.abs(a.data[ia + 1] - b.data[ib + 1]) + Math.abs(a.data[ia + 2] - b.data[ib + 2]);
    if (d > 12) {
      n++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      map.data[id] = 255; map.data[id + 1] = 32; map.data[id + 2] = 32; map.data[id + 3] = 255;
    } else {
      map.data[id] = 255 - ((255 - b.data[ib]) >> 2);
      map.data[id + 1] = 255 - ((255 - b.data[ib + 1]) >> 2);
      map.data[id + 2] = 255 - ((255 - b.data[ib + 2]) >> 2);
      map.data[id + 3] = 255;
    }
  }
  return { map, n, boite: maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } };
}

function recadrer(src: PNG, b: { x: number; y: number; w: number; h: number }, marge = 80): PNG {
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

// Encodage JPEG par Chromium — redimensionnement lissé, pas de flou inventé au-delà.
async function versJpeg(page: Page, pngBuffer: Buffer, largeur: number, q: number) {
  return page.evaluate(async ([data, w, qual]) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/png;base64,' + data; });
    const ech = Math.min(1, (w as number) / img.width);
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * ech); c.height = Math.round(img.height * ech);
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    cx.drawImage(img, 0, 0, c.width, c.height);
    return { url: c.toDataURL('image/jpeg', qual as number), w: c.width, h: c.height };
  }, [pngBuffer.toString('base64'), largeur, q] as const);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

type Bloc = { nom: string; statut: string; detail: string; dims?: string; une?: string; avant?: string; apres?: string; diff?: string };
const blocs: Bloc[] = [];
let identiques = 0, modifiees = 0, problemes = 0;

const nav: Browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await nav.newPage();

for (const nom of noms) {
  const pa = path.join(dirAvant, nom), pb = path.join(dirApres, nom);
  const label = nom.replace(/\.png$/, '');
  if (!existsSync(pa)) { blocs.push({ nom: label, statut: 'apparue', detail: 'présente seulement APRÈS — absente de la référence' }); problemes++; continue; }
  if (!existsSync(pb)) { blocs.push({ nom: label, statut: 'disparue', detail: "présente seulement AVANT — absente de l'état final" }); problemes++; continue; }

  const bufA = readFileSync(pa), bufB = readFileSync(pb);
  let A: PNG, B: PNG;
  try { A = PNG.sync.read(bufA); B = PNG.sync.read(bufB); }
  catch (e) { blocs.push({ nom: label, statut: 'illisible', detail: String((e as Error).message) }); problemes++; continue; }

  const dimChange = A.width !== B.width || A.height !== B.height;
  const { map, n, boite } = carteDiff(A, B);
  const inchangee = n === 0 && !dimChange;

  const bloc: Bloc = {
    nom: label,
    statut: inchangee ? 'identique' : 'modifiée',
    dims: `${A.width}×${A.height}${dimChange ? ` → ${B.width}×${B.height}` : ''} px`,
    detail: dimChange
      ? `dimensions changées${n ? ` · ${n.toLocaleString('fr-FR')} pixels différents dans la zone commune` : ''}`
      : n === 0 ? "aucun pixel n'a bougé"
      : `${n.toLocaleString('fr-FR')} pixels différents · zone ${boite!.w}×${boite!.h} px à (${boite!.x}, ${boite!.y})`,
  };

  if (inchangee) {
    // Les deux états sont identiques : une seule image suffit, et le dire est la preuve.
    bloc.une = (await versJpeg(page, bufB, largeurVue, qualite)).url;
    identiques++;
  } else {
    bloc.avant = (await versJpeg(page, bufA, largeurVue, qualite)).url;
    bloc.apres = (await versJpeg(page, bufB, largeurVue, qualite)).url;
    if (boite) bloc.diff = (await versJpeg(page, PNG.sync.write(recadrer(map, boite)), Math.max(largeurVue, boite.w + 160), 0.9)).url;
    modifiees++;
  }
  blocs.push(bloc);
  console.log(`  ${bloc.statut.padEnd(10)} ${label.padEnd(32)} ${bloc.detail}`);
}
await nav.close();

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titre)}</title>
<style>
 :root{--bd:#e3e0da;--tx:#26282c;--mu:#6b6d72;--bg:#faf9f7;--cd:#fff;--ok:#2e7d5b;--ch:#b45309;--er:#dc2626}
 @media (prefers-color-scheme:dark){:root{--bd:#33363b;--tx:#e8e6e3;--mu:#9a9da3;--bg:#17191c;--cd:#1e2124;--ok:#4ade80;--ch:#fbbf24;--er:#f87171}}
 *{box-sizing:border-box}
 body{margin:0;padding:2.5rem 1.25rem 6rem;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--tx);background:var(--bg)}
 .wrap{max-width:1320px;margin:0 auto}
 h1{font-size:1.75rem;margin:0 0 .35rem;letter-spacing:-.01em}
 .sub{color:var(--mu);margin:0 0 2rem;max-width:70ch}
 .tot{display:flex;gap:2.75rem;flex-wrap:wrap;padding:1.15rem 1.4rem;border:1px solid var(--bd);border-radius:12px;margin-bottom:2.5rem;background:var(--cd)}
 .tot div{display:flex;flex-direction:column}
 .tot b{font-size:1.8rem;font-weight:650;line-height:1.15}
 .tot span{color:var(--mu);font-size:.8rem;text-transform:uppercase;letter-spacing:.05em}
 section{border:1px solid var(--bd);border-radius:12px;padding:1.4rem;margin-bottom:1.75rem;background:var(--cd)}
 .hd{display:flex;align-items:baseline;gap:.75rem;flex-wrap:wrap}
 .hd h2{font-size:1.15rem;margin:0}
 .tag{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:.2rem .6rem;border-radius:999px;border:1px solid currentColor}
 .t-identique{color:var(--ok)} .t-modifiée{color:var(--ch)} .t-apparue,.t-disparue,.t-illisible{color:var(--er)}
 .dim{color:var(--mu);font-size:.82rem;margin-left:auto}
 .det{color:var(--mu);font-size:.92rem;margin:.35rem 0 1.1rem}
 .duo{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem}
 @media(max-width:860px){.duo{grid-template-columns:1fr}}
 figure{margin:0}
 figcaption{font-size:.72rem;color:var(--mu);margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
 .vue{position:relative;max-height:640px;overflow-y:auto;border:1px solid var(--bd);border-radius:8px;background:#fff}
 .vue img{width:100%;height:auto;display:block}
 .plein .vue{max-height:none}
 .zoom{margin-top:1.3rem;padding-top:1.3rem;border-top:1px dashed var(--bd)}
 .zoom .vue{max-height:none;overflow-x:auto}
 .zoom .vue img{width:auto;max-width:100%}
 .bar{display:flex;gap:.6rem;align-items:center;margin-bottom:.5rem;flex-wrap:wrap}
 button{font:inherit;font-size:.82rem;padding:.3rem .75rem;border:1px solid var(--bd);border-radius:7px;background:transparent;color:var(--tx);cursor:pointer}
 button:hover{border-color:var(--mu)}
 details{margin-top:2rem;border:1px solid var(--bd);border-radius:12px;padding:1.1rem 1.4rem;background:var(--cd)}
 summary{cursor:pointer;font-weight:600}
 code{background:rgba(128,128,128,.15);padding:.1em .4em;border-radius:4px;font-size:.9em}
 li{margin:.4rem 0}
</style></head><body><div class="wrap">
<h1>${esc(titre)}</h1>
<p class="sub">Comparaison pixel à pixel des ${noms.length} maquettes, entre l'état d'avant le chantier et l'état actuel. Les images sont embarquées dans cette page : elle reste lisible sans le dépôt.</p>
<div class="tot">
 <div><b>${noms.length}</b><span>maquettes</span></div>
 <div><b style="color:var(--ok)">${identiques}</b><span>inchangées</span></div>
 <div><b style="color:var(--ch)">${modifiees}</b><span>modifiées</span></div>
 ${problemes ? `<div><b style="color:var(--er)">${problemes}</b><span>à regarder</span></div>` : ''}
</div>
${blocs.map((b, i) => `<section id="s${i}">
 <div class="hd"><h2>${esc(b.nom)}</h2><span class="tag t-${b.statut}">${b.statut}</span>${b.dims ? `<span class="dim">${b.dims}</span>` : ''}</div>
 <p class="det">${esc(b.detail)}</p>
 ${b.une ? `<div class="bar"><button onclick="document.getElementById('s${i}').classList.toggle('plein')">Dérouler / replier</button></div>
   <figure><figcaption>Avant et après — identiques</figcaption><div class="vue"><img src="${b.une}" alt="${esc(b.nom)}" loading="lazy"></div></figure>` : ''}
 ${b.avant && b.apres ? `<div class="bar"><button onclick="document.getElementById('s${i}').classList.toggle('plein')">Dérouler / replier</button></div>
  <div class="duo">
   <figure><figcaption>Avant</figcaption><div class="vue"><img src="${b.avant}" alt="avant" loading="lazy"></div></figure>
   <figure><figcaption>Après</figcaption><div class="vue"><img src="${b.apres}" alt="après" loading="lazy"></div></figure>
  </div>` : ''}
 ${b.diff ? `<div class="zoom"><figcaption>Ce qui a changé — en rouge, pleine résolution</figcaption><div class="vue"><img src="${b.diff}" alt="différences" loading="lazy"></div></div>` : ''}
</section>`).join('\n')}
<details><summary>Comment lire cette page, et comment vérifier par toi-même dans Figma</summary>
<ul>
 <li><b>« inchangée »</b> : aucun pixel n'a bougé. Une seule image est affichée — les deux états étant identiques, en montrer deux n'apprendrait rien. Pour un lot annoncé « rien ne doit bouger », c'est le résultat attendu, et c'est une preuve.</li>
 <li><b>« modifiée »</b> : avant et après côte à côte, puis la zone qui a bougé en rouge, recadrée et en pleine résolution. Chaque changement doit correspondre à un écart annoncé <em>avant</em> le geste ; un écart que l'annonce ne prévoyait pas annule le lot en entier.</li>
 <li>Les vues sont limitées en hauteur pour pouvoir parcourir la page ; <b>« Dérouler »</b> affiche la maquette entière.</li>
 <li><b>Dans Figma, sans passer par le dépôt</b> : <code>Fichier › Afficher l'historique des versions</code>. Les points sont nommés <code>016/&lt;lot&gt;/avant</code> — on peut afficher n'importe lequel, comparer, et restaurer.</li>
 <li>Seuil de détection : somme des écarts R+V+B &gt; 12, pour ignorer le bruit d'encodage. Le plancher de bruit de l'instrument a été mesuré <b>nul</b> avant le chantier (étalonnage ×2, 9/9 identiques).</li>
 <li>Les vues d'ensemble sont des JPEG à ${Math.round(qualite * 100)} % de qualité, ${largeurVue} px de large ; la carte des différences est en pleine résolution. Le PNG d'origine reste la source de vérité — cette page est une aide à la lecture, pas la mesure elle-même (la mesure, c'est <code>npm run pages:compare</code>).</li>
</ul>
</details>
</div></body></html>`;

writeFileSync(out, html);
console.log(`\nrevue-visuelle → ${out} (${(Buffer.byteLength(html) / 1e6).toFixed(1)} Mo, autonome)`);
console.log(`  ${noms.length} maquettes · ${identiques} inchangées · ${modifiees} modifiées${problemes ? ` · ${problemes} à regarder` : ''}`);
