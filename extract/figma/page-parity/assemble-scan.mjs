// assemble-scan.mjs — classify the bridge's measured facts into the T0
// inventory scan (T009), schema of contracts/inventory-scan.md.
//
// Division of labor (see bridge/scan.js): the SANDBOX MEASURES (per-maquette
// facts: section candidates, repeated-sibling collections with per-item deep
// facts, resolved instances), THIS FILE CLASSIFIES — pure Node, re-runnable
// on the same measured data without the bridge, every matcher refinement a
// reviewable diff. Classification is by GEOMETRY + STRUCTURE + governed-
// instance content; Figma layer names ride along as documentation only
// (nomFigma), never as evidence — receipt: "item" x71 covers 3 distinct
// molecules.
//
// Usage:
//   node extract/figma/page-parity/assemble-scan.mjs <scanDir> <outFile> [--date AAAA-MM-JJ]
//   (scanDir holds the scan-<maquette>.json reports POSTed by bridge/scan.js)
//
// Honesty rules implemented here (contract §Règles, principle V):
//   - dansInstance / contenu-instance material is master content, not copies:
//     counted in contenuInstances, excluded from blocs[].
//   - text[]/rectangle[]-only collections are INTERNAL FRAGMENTS of a block
//     (a title+subtitle pair inside a section), not block candidates: counted
//     in fragmentsInternes with their parents named, never classified.
//   - every block-level candidate that matches no rule lands in nonClasses[];
//   - every expected block this pass could NOT isolate lands in
//     introuvables[] with its recovery path (the per-block audit re-measures
//     before any extraction anyway — FR-002).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dateIdx = args.indexOf('--date');
const date = dateIdx >= 0 ? args.splice(dateIdx, 2)[1] : new Date().toISOString().slice(0, 10);
const [scanDir, outFile] = args;
if (!scanDir || !outFile) {
  console.error('usage: node extract/figma/page-parity/assemble-scan.mjs <scanDir> <outFile> [--date AAAA-MM-JJ]');
  process.exit(2);
}

const reports = readdirSync(scanDir)
  .filter((f) => f.startsWith('scan-') && f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(path.join(scanDir, f), 'utf8')))
  .sort((a, b) => a.bounds.x - b.bounds.x); // canvas order, left to right
if (reports.length === 0) {
  console.error(`assemble-scan: aucun scan-*.json dans ${scanDir} — rien a assembler`);
  process.exit(2);
}

const blocs = new Map(); // cle -> { cle, niveau, origine, occurrences: [] }
const nonClasses = [];
const fragmentsInternes = [];
const contenuInstances = [];
const dejaInstancie = {};
const dependancesTierces = [];

const occ = (maquette, it, note) => {
  const o = { maquette, nodeId: it.nodeId, bounds: it.bounds, signature: it.signature, nomFigma: it.nomFigma, etat: it.etat };
  if (note) o.note = note;
  return o;
};
const push = (cle, niveau, origine, o) => {
  if (!blocs.has(cle)) blocs.set(cle, { cle, niveau, origine, occurrences: [] });
  blocs.get(cle).occurrences.push(o);
};

// ---------------------------------------------------------------- molecules
// Matchers over collection items — structural evidence only. Measured shapes
// (T0 recon receipts, 2026-07-23) cited per rule.
const isFragmentCollection = (col) =>
  /^text\[/.test(col.signatureItem) || /^rectangle\[\]$/.test(col.signatureItem) ||
  /^group\[text\]$/.test(col.signatureItem) || /^frame\[text,text\]$/.test(col.signatureItem) ||
  (col.groupement === 'dims' && col.items.every((it) => /^(text|rectangle)\[/.test(it.signature)));
// group[text] = the h2 wrappers inside Texte SEO; frame[text,text] = bare
// title/subtitle pairs — internal structure of their section, not blocks.

for (const rep of reports) {
  const m = rep.maquette;
  for (const [name, n] of Object.entries(rep.dejaInstancie)) dejaInstancie[name] = (dejaInstancie[name] || 0) + n;
  for (const t of rep.dependancesTierces) dependancesTierces.push(t);

  for (const col of rep.collections) {
    if (col.dansInstance) {
      contenuInstances.push({ maquette: m, parent: col.parentNomFigma, signatureItem: col.signatureItem, count: col.count });
      continue;
    }
    if (isFragmentCollection(col)) {
      fragmentsInternes.push({ maquette: m, parent: col.parentNomFigma, signatureItem: col.signatureItem, count: col.count });
      continue;
    }
    if (col.profondeur <= 1) {
      // depth-1 groups are same-sized SECTIONS (the maquette's own children,
      // already handled by the section rules) — molecule matching over them
      // would double-classify; measured noise from the second recon run.
      continue;
    }
    const its = col.items.filter((it) => it.etat === 'copie-brute');
    if (its.length === 0) continue; // instance-only group: already governed

    const first = its[0];
    const w = first.bounds.w, h = first.bounds.h;

    // accordion-row — frame[text,instance]+chevron, full-width (~1550px).
    // Measured: 1550x40 (closed) / x64; "item open" carries an extra text.
    if (first.aChevron && w >= 1000 && h <= 240 && /^frame\[text/.test(first.signature)) {
      for (const it of its) push('accordion-row', 'molecule', 'extraction', occ(m, it));
      // the shared parent is one accordion occurrence (container of rows)
      push('accordion', 'molecule', 'extraction', {
        maquette: m, nodeId: col.parentNodeId, bounds: col.parentBounds,
        signature: 'parent-of:' + col.signatureItem, nomFigma: col.parentNomFigma, etat: 'copie-brute',
        note: 'conteneur des rows du groupe',
      });
      continue;
    }
    // product-card — frame[rectangle,text,text,instance] ~364x312 (measured, x4 per e-commerce page).
    if (/^frame\[rectangle,text,text,instance\]$/.test(first.signature) && h >= 240 && h <= 400) {
      for (const it of its) push('product-card', 'molecule', 'extraction', occ(m, it));
      continue;
    }
    // category-card (standard) — frame[rectangle,frame] w 260-430 h 420-580,
    // 2 deep texts (measured 285x498 / 364x498-522); OR the hero-composite
    // form frame[vector,frame] 744x418 (measured x2 on Accueil / PdG).
    if ((/^frame\[rectangle,frame\]$/.test(first.signature) && w >= 260 && w <= 430 && h >= 420 && h <= 580)
      || (/^frame\[vector,frame\]$/.test(first.signature) && w >= 700 && w <= 800 && h >= 380 && h <= 460)) {
      for (const it of its) push('category-card', 'molecule', 'extraction', occ(m, it));
      continue;
    }
    // category-card variante "alt" — frame[frame,frame(,instance)]
    // (image + text + Bouton). Measured widths: 743-744 (2-col pages), 474
    // (Motorisation's 3-col row); h 470-673. One cle: the std/alt/3-col
    // layouts are properties of the future master, never separate masters.
    if (w >= 440 && w <= 800 && h >= 440 && h <= 700 && /^frame\[frame,frame/.test(first.signature)) {
      for (const it of its) push('category-card', 'molecule', 'extraction', occ(m, it, 'variante alt (large) — portée par une propriété du master, pas un second master' + (it.aBouton ? '' : ' ; sans Bouton sur cette page')));
      continue;
    }
    // member-card — frame[instance,frame]: a member-picture instance + the
    // name/role text frame (measured 364x448 x16, À Propos "grid").
    if (/^frame\[instance,frame\]$/.test(first.signature) && first.aMemberPicture) {
      for (const it of its) push('member-card', 'molecule', 'extraction', occ(m, it));
      continue;
    }
    // contact-info-row — frame[instance,frame]: an icon instance + text frame,
    // NOT member-picture (measured in Contactez-nous "features", h~396 parent).
    if (/^frame\[instance,frame\]$/.test(first.signature) && !first.aMemberPicture && h <= 450) {
      for (const it of its) push('contact-info-row', 'molecule', 'extraction', occ(m, it));
      continue;
    }
    // tab — frame[text] h 28-60, small type (measured h41, maxFont 20,
    // Dépannage/SAV "tabs" row).
    if (/^frame\[text\]$/.test(first.signature) && h >= 28 && h <= 60 && first.maxFont <= 22) {
      for (const it of its) push('tab', 'molecule', 'extraction', occ(m, it));
      continue;
    }
    // footer-column — group[text,text] ~310x100, x3 per page in the footer Row.
    if (/^group\[text,text\]$/.test(first.signature) && w <= 500 && h <= 200) {
      for (const it of its) push('footer-column', 'molecule', 'extraction', occ(m, it));
      continue;
    }
    // field — frame[text,frame] ~340x80 in the form (measured, dims-group).
    if (/^frame\[text,frame\]$/.test(first.signature) && h >= 56 && h <= 140 && w <= 800) {
      for (const it of its) push('field', 'molecule', 'extraction', occ(m, it));
      continue;
    }
    // gallery-item — rectangle 743x743 image tiles, x9 per Réalisations grid.
    // (bare rectangles: fragment rule above would eat them — match the dims
    // group explicitly by parent size + count instead)
    // NOTE: rectangle[] collections are filtered as fragments; gallery tiles
    // are recovered below from fragmentsInternes by their measured 743x743.
    nonClasses.push({
      genre: 'collection', maquette: m, parent: col.parentNomFigma, parentNodeId: col.parentNodeId,
      signatureItem: col.signatureItem, count: col.count, bounds: col.parentBounds,
      echantillon: { nomFigma: first.nomFigma, bounds: first.bounds, aBouton: first.aBouton, aChevron: first.aChevron, nTextes: first.nTextes, maxFont: first.maxFont },
    });
  }

  // gallery-item recovery: the image tiles of the Réalisations MASONRY grids
  // were classified as fragments by the generic rectangle rule; they ARE the
  // gallery items. Measured: count 9 per grid, MIXED sizes (one 743x743 +
  // smaller tiles — a mosaic, not a uniform grid), parent h ~1450+. Named
  // exception keyed on the parent's scale, not per-tile dimensions.
  for (const col of rep.collections) {
    if (col.dansInstance || !/^rectangle\[\]$/.test(col.signatureItem)) continue;
    const its = col.items.filter((it) => it.etat === 'copie-brute');
    if (its.length >= 4 && col.parentBounds.h >= 900) {
      for (const it of its) push('gallery-item', 'molecule', 'infere', occ(m, it, 'tuile image de la grille (mosaïque) Réalisations'));
      const fi = fragmentsInternes.findIndex((f) => f.maquette === m && f.parent === col.parentNomFigma && f.signatureItem === col.signatureItem);
      if (fi >= 0) fragmentsInternes.splice(fi, 1);
    }
  }

  // ------------------------------------------------------------- sections
  // Rules keyed on composition + position + typography — names documentary.
  const cands = rep.sectionCandidates.filter((s) => s.etat === 'copie-brute');
  const maxY = Math.max(...cands.map((s) => s.bounds.y));
  for (const s of cands) {
    const sec = (cle, note) => push(cle, 'section', 'extraction', { maquette: m, nodeId: s.nodeId, bounds: s.bounds, signature: s.signature, nomFigma: s.nomFigma, etat: 'copie-brute', ...(note ? { note } : {}) });
    const h = s.bounds.h;
    // header wrapper: frame[instance] h~86 — the Header nav IS a component;
    // its positioning wrapper is out of scope (FR-001), recorded as such.
    if (/^frame\[instance\]$/.test(s.signature) && h < 140) {
      contenuInstances.push({ maquette: m, parent: s.nomFigma, signatureItem: s.signature, count: 1, note: 'wrapper de positionnement du composant Header nav — exclu (FR-001)' });
      continue;
    }
    if (s.bounds.y === maxY && /^frame\[group\]$/.test(s.signature) && s.maxFont <= 30) { sec('footer-devis'); continue; }
    if (s.type === 'GROUP' && /^group\[rectangle,frame\]$/.test(s.signature) && !s.aBouton && h >= 400 && h <= 520) { sec('avis-google'); continue; }
    if (/^frame\[group,group,group,frame\]$/.test(s.signature) && s.maxFont <= 30) { sec('texte-seo'); continue; }
    if (/^frame\[frame\]$/.test(s.signature) && s.aBouton && h >= 330 && h <= 430 && s.maxFont >= 36) { sec('devis-cta'); continue; }
    if (/^frame\[text,frame\]$/.test(s.signature) && s.maxFont >= 30 && s.maxFont <= 36 && h <= 300) { sec('presentation'); continue; }
    if (h >= 640 && h <= 800 && /^frame\[frame,frame(,frame|,instance)\]$/.test(s.signature) && s.aBouton && s.maxFont >= 36) { sec('reassurances'); continue; }
    if (h >= 330 && h <= 500 && /^frame\[frame,frame,instance\]$/.test(s.signature) && s.aBouton && s.maxFont >= 36) { sec('faq'); continue; }
    if (/^frame\[frame,group\]$/.test(s.signature) && h >= 350 && h <= 500) { sec('produits-ecommerce'); continue; }
    if (h >= 1400 && h <= 1700 && /^frame\[frame,frame\]$/.test(s.signature) && !s.aBouton) { sec('realisations'); continue; }
    if (h >= 1700 && !s.aBouton && /^frame\[frame\]$/.test(s.signature)) { sec('equipe'); continue; }
    if (s.type === 'GROUP' && /^group\[frame\]$/.test(s.signature) && s.aBouton && h >= 600 && h <= 850) { sec('formulaire'); continue; }
    if (/^frame\[frame,rectangle\]$/.test(s.signature) && !s.aBouton && h >= 500 && h <= 700) { sec('coordonnees'); continue; }
    if (/^frame\[group\]$/.test(s.signature) && s.aBouton && s.maxFont >= 36 && h >= 550) { sec('sav'); continue; }
    if (h >= 550 && h <= 800 && /^frame\[frame,frame\]$/.test(s.signature) && s.aBouton && s.maxFont <= 36) { sec('categories-principales', 'variante alt en section directe'); continue; }
    // composites & hero — first block of the page (y small), big type
    if (s.bounds.y <= 100 && s.maxFont >= 40) {
      if (h <= 800) { sec('hero'); continue; }
      if (/frame,frame/.test(s.signature) || s.type === 'GROUP') {
        sec('hero-et-categories', s.type === 'GROUP' ? 'GROUP composite incluant le header (Portes d’entrée) — re-mesuré: composition réelle à trancher à l’audit' : (h >= 1200 && h <= 1300 && m === 'Dépannage/SAV' ? 'composite Hero et FAQ — divergence vs inventaire (notée T010)' : undefined));
        continue;
      }
    }
    nonClasses.push({ genre: 'section-candidate', maquette: m, nomFigma: s.nomFigma, nodeId: s.nodeId, signature: s.signature, bounds: s.bounds, aBouton: s.aBouton, maxFont: s.maxFont });
  }
}

// ----------------------------------------------------------- introuvables
// Expected blocks this pass could NOT isolate as unit occurrences — each with
// its recovery path. FR-009/FR-018: named, never silently dropped.
const introuvables = [
  { cle: 'reassurance-item', attenduDans: 'sections Réassurances (x6 localisées)', note: 'items unitaires non isolés a cette passe (icones heterogenes, fratries non appariées par le scan) — releve fin par position a l’audit T051, la section est localisée' },
  { cle: 'review-card', attenduDans: 'sections Avis Google (x8 localisées)', note: 'bloc INFERE (inventaire) — aucune repetition de card detectee dans les groupes Avis Google a cette passe ; a confirmer par passe visuelle + audit T053' },
  { cle: 'copyright', attenduDans: 'sections Footer + Devis (x9 localisées)', note: 'singleton par page, hors seuil de repetition du scan — releve a l’audit T059' },
  { cle: 'section-header', attenduDans: 'toutes maquettes (paires titre/sous-titre observees en fragments 1550px)', note: 'wrappers Titres non isolés unitairement a cette passe — releve a l’audit T063' },
  { cle: 'carousel-controls', attenduDans: 'sections Produits e-commerce (x2 localisées)', note: 'les fleches prev/next sont des instances arrow-left/right — la molecule Controls se releve a l’audit T055' },
  { cle: 'icone-etoile', attenduDans: 'sections Avis Google', note: 'bloc INFERE — non detecte a cette passe (etoiles probablement vectors dans les cards) ; passe visuelle + audit T036' },
  { cle: 'input', attenduDans: 'section Formulaire (fields localisés)', note: 'atome DANS field — releve fin des saisies brutes a l’audit T031 (net-new: le master se cree, les occurrences brutes s’adoptent via Field)' },
  { cle: 'textarea', attenduDans: 'section Formulaire', note: 'champ Message 161px — audit T031' },
  { cle: 'select', attenduDans: 'section Formulaire', note: 'input contenant un chevron-down — audit T031' },
  { cle: 'checkbox', attenduDans: 'nulle part (net-new integral)', note: 'consentement RGPD en simple texte — rien a scanner, creation pure (T035)' },
  { cle: 'icones-sociales', attenduDans: 'bloc Suivez-nous (footer)', note: 'groupes bruts dans le footer — releve a l’audit T036' },
];

// -------------------------------------------------------------- totals & out
const parNiveau = { atome: 0, molecule: 0, section: 0 };
const copiesRestantes = {};
for (const b of blocs.values()) {
  parNiveau[b.niveau] = (parNiveau[b.niveau] || 0) + 1;
  copiesRestantes[b.cle] = b.occurrences.filter((o) => o.etat === 'copie-brute').length;
}

const out = {
  date,
  fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
  pageId: '210:325',
  maquettes: reports.map((r) => ({ nom: r.maquette, nodeId: r.nodeId, bounds: r.bounds })),
  blocs: [...blocs.values()].sort((a, b) => a.cle.localeCompare(b.cle)),
  dejaInstancie,
  totaux: { blocsParNiveau: parNiveau, copiesRestantes },
  introuvables,
  dependancesTierces,
  nonClasses,
  fragmentsInternes: { count: fragmentsInternes.length, detail: fragmentsInternes },
  contenuInstances: { count: contenuInstances.length, detail: contenuInstances },
  notes: [
    'Classification par geometrie + structure + contenu en instances gouvernees — les noms Figma sont documentaires (contrat inventory-scan §Règles).',
    'dejaInstancie compte TOUTES les instances du sous-arbre, y compris celles nichees dans des masters instancies (ex. les icones du Header nav) — superset des 145 instances directes de l’inventaire.',
    'Les atomes net-new (Input, Textarea, Select, Checkbox, icones) n’ont pas d’occurrences propres a scanner : voir introuvables[] pour leur voie de releve.',
    'Ce scan est re-mesure avant CHAQUE extraction (FR-002) — le dernier scan fait foi.',
  ],
};

writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
const totalOcc = [...blocs.values()].reduce((a, b) => a + b.occurrences.length, 0);
console.log(`assemble-scan: ${blocs.size} blocs classes, ${totalOcc} occurrences, ${nonClasses.length} nonClasses, ${introuvables.length} introuvables (nommes), ${out.contenuInstances.count} groupes contenu-instance, ${out.fragmentsInternes.count} fragments internes`);
console.log(`→ ${outFile}`);
for (const b of out.blocs) console.log(`  ${b.cle} (${b.niveau}): ${b.occurrences.length}`);
