// photos-verify.mts — verdict d'IDENTITÉ des photos client, avant ⟷ après régénération.
//
// Contrat : specs/016-canvas-vrai/contracts/photos-identite.md
// Usage   : npx tsx specs/016-canvas-vrai/tools/photos-verify.mts <census-avant.json> <census-apres.json> [--out <chemin>]
//
// POURQUOI (D7, FR-007) : le restore moteur apparie par nom puis retombe sur « premier
// paint non réclamé » — deux photos de même taille peuvent être INTERVERTIES sans que
// rien ne le dise. On vérifie donc l'identité, pas la présence, et avec un instrument
// indépendant de celui qu'il contrôle.
//
// IDENTITÉ = même `imageHash` À LA MÊME POSITION. L'imageHash de Figma adresse le
// contenu (même hash ⇔ mêmes octets) ; le sha256 des octets, calculé ici (le sandbox
// Figma n'a pas de `crypto`), est la contre-preuve re-testable HORS Figma.
//
// ⚠️ `specs/` est hors du tsconfig du dépôt (comme `evals/fixtures`) : `tsc --noEmit`
// ne voit pas ce fichier. Il se vérifie en l'EXÉCUTANT, jamais en supposant qu'il
// compile — voir `--selftest`.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

type Photo = {
  racine: string; racineId: string; racineType: string;
  cheminPosition: string; nomCalque: string; typeNoeud: string;
  champ: string; indexPaint: number;
  bounds: { x: number; y: number; w: number; h: number } | null;
  imageHash: string | null; scaleMode: string | null;
  opacity: number; visible: boolean;
  porteur: 'master' | 'instance-override';
};
type Census = {
  schemaVersion: number; nom: string; fileKey: string; fileName: string;
  photos: Photo[];
  octetsParHash: Record<string, { taille?: number; base64?: string; refus?: string }>;
  refus: { racine: string; racineId: string; motif: string }[];
};
type Verdict = 'identique' | 'intervertie' | 'perdue' | 'non-verifiable';
type VerdictComposant = 'intact' | 'replace-verifie' | 'en-souffrance';

// La clé d'une photo est sa POSITION, jamais son nom (§VIII) : un renommage de calque
// ne doit pas se lire comme une photo perdue.
const cle = (p: Photo) => `${p.racineId}::${p.cheminPosition}::${p.champ}[${p.indexPaint}]`;
const cleGeom = (p: Photo) =>
  p.bounds ? `${p.racineId}::${p.bounds.x},${p.bounds.y},${p.bounds.w},${p.bounds.h}::${p.champ}[${p.indexPaint}]` : cle(p);

const sha256 = (b64?: string) => (b64 === undefined ? null : createHash('sha256').update(Buffer.from(b64, 'base64')).digest('hex'));

function verifier(avant: Census, apres: Census) {
  const shaAvant = new Map<string, string | null>();
  const shaApres = new Map<string, string | null>();
  for (const [h, o] of Object.entries(avant.octetsParHash)) shaAvant.set(h, o.refus ? null : sha256(o.base64));
  for (const [h, o] of Object.entries(apres.octetsParHash)) shaApres.set(h, o.refus ? null : sha256(o.base64));

  // Index APRÈS : par position exacte, et par géométrie (repli quand l'arbre a été
  // reconstruit et que les indices ont bougé mais que la boîte est au même endroit).
  const parCle = new Map<string, Photo>();
  const parGeom = new Map<string, Photo[]>();
  for (const p of apres.photos) {
    parCle.set(cle(p), p);
    const g = cleGeom(p);
    if (!parGeom.has(g)) parGeom.set(g, []);
    parGeom.get(g)!.push(p);
  }
  // Tous les hashes encore présents quelque part APRÈS — pour distinguer « perdue »
  // (le contenu a disparu du fichier) de « intervertie » (il est là, ailleurs).
  const hashesApres = new Set(apres.photos.map((p) => p.imageHash).filter(Boolean) as string[]);

  const parComposant = new Map<string, { attendues: number; verdictParPhoto: any[]; nonReplacees: string[] }>();

  for (const a of avant.photos) {
    const sujet = a.racine;
    if (!parComposant.has(sujet)) parComposant.set(sujet, { attendues: 0, verdictParPhoto: [], nonReplacees: [] });
    const bloc = parComposant.get(sujet)!;
    bloc.attendues++;

    const b = parCle.get(cle(a)) ?? (parGeom.get(cleGeom(a)) ?? [])[0];

    let verdict: Verdict;
    if (!a.imageHash) {
      verdict = 'non-verifiable'; // pas d'identité de contenu à comparer
    } else if (!b) {
      verdict = hashesApres.has(a.imageHash) ? 'intervertie' : 'perdue';
    } else if (b.imageHash === a.imageHash) {
      verdict = 'identique';
    } else if (hashesApres.has(a.imageHash)) {
      verdict = 'intervertie'; // le contenu existe, mais plus à cet endroit
    } else {
      verdict = 'perdue';
    }

    const sA = a.imageHash ? shaAvant.get(a.imageHash) ?? null : null;
    const sB = b?.imageHash ? shaApres.get(b.imageHash) ?? null : null;
    // Octets illisibles des DEUX côtés : on ne peut pas prononcer l'identité (FR-011).
    if (verdict === 'identique' && a.imageHash && sA === null && sB === null) verdict = 'non-verifiable';

    const cheminNomme = `${a.racine} (${a.racineId}) › ${a.cheminPosition} › ${a.nomCalque} › ${a.champ}[${a.indexPaint}]`;
    if (verdict !== 'identique') bloc.nonReplacees.push(`${cheminNomme} — ${verdict}`);

    bloc.verdictParPhoto.push({
      position: { racine: a.racine, racineId: a.racineId, cheminPosition: a.cheminPosition, bounds: a.bounds, porteur: a.porteur },
      calque: a.nomCalque,
      imageHashAvant: a.imageHash, imageHashApres: b?.imageHash ?? null,
      sha256Avant: sA, sha256Apres: sB,
      verdict,
    });
  }

  // Photos présentes APRÈS mais absentes AVANT : jamais silencieuses non plus.
  const clesAvant = new Set(avant.photos.map(cle));
  const apparues = apres.photos.filter((p) => !clesAvant.has(cle(p)));

  const composants = [...parComposant.entries()].map(([sujet, b]) => {
    const tous = b.verdictParPhoto;
    const verdict: VerdictComposant = b.nonReplacees.length > 0
      ? 'en-souffrance'
      : tous.every((v) => v.imageHashAvant === v.imageHashApres) ? 'intact' : 'replace-verifie';
    return { sujet, attendues: b.attendues, verdictParPhoto: tous, nonReplacees: b.nonReplacees, verdict };
  }).sort((x, y) => x.sujet.localeCompare(y.sujet));

  const compte = (v: Verdict) => composants.reduce((n, c) => n + c.verdictParPhoto.filter((p: any) => p.verdict === v).length, 0);

  return {
    schemaVersion: 1,
    source: { avant: avant.nom, apres: apres.nom, fileKey: avant.fileKey },
    totaux: {
      photosAvant: avant.photos.length,
      photosApres: apres.photos.length,
      identiques: compte('identique'),
      interverties: compte('intervertie'),
      perdues: compte('perdue'),
      nonVerifiables: compte('non-verifiable'),
      apparues: apparues.length,
      composantsPorteurs: composants.length,
      composantsEnSouffrance: composants.filter((c) => c.verdict === 'en-souffrance').length,
    },
    // Un recensement incomplet des DEUX côtés doit se voir dans le verdict.
    refusRecensement: { avant: avant.refus, apres: apres.refus },
    apparues: apparues.map((p) => ({ racine: p.racine, cheminPosition: p.cheminPosition, calque: p.nomCalque, imageHash: p.imageHash })),
    composants,
  };
}

// --- selftest : le fichier étant hors tsconfig, il se prouve en tournant -------------
function selftest() {
  const b64 = (s: string) => Buffer.from(s).toString('base64');
  const photo = (o: Partial<Photo>): Photo => ({
    racine: 'X', racineId: 'X:1', racineType: 'COMPONENT', cheminPosition: '0', nomCalque: 'img',
    typeNoeud: 'RECTANGLE', champ: 'fills', indexPaint: 0, bounds: { x: 0, y: 0, w: 10, h: 10 },
    imageHash: 'h1', scaleMode: 'FILL', opacity: 1, visible: true, porteur: 'master', ...o,
  });
  const census = (photos: Photo[], oct: Record<string, any>): Census =>
    ({ schemaVersion: 1, nom: 'test', fileKey: 'K', fileName: 'F', photos, octetsParHash: oct, refus: [] });

  const cas: [string, Census, Census, (r: any) => boolean][] = [
    ['identique', census([photo({})], { h1: { base64: b64('A') } }), census([photo({})], { h1: { base64: b64('A') } }),
      (r) => r.totaux.identiques === 1 && r.composants[0].verdict === 'intact'],
    ['perdue', census([photo({})], { h1: { base64: b64('A') } }), census([], {}),
      (r) => r.totaux.perdues === 1 && r.composants[0].verdict === 'en-souffrance'],
    ['intervertie', // deux photos de même taille qui échangent leur place — le cas que le restore peut produire
      census([photo({ cheminPosition: '0', imageHash: 'h1' }), photo({ cheminPosition: '1', imageHash: 'h2' })], { h1: { base64: b64('A') }, h2: { base64: b64('B') } }),
      census([photo({ cheminPosition: '0', imageHash: 'h2' }), photo({ cheminPosition: '1', imageHash: 'h1' })], { h1: { base64: b64('A') }, h2: { base64: b64('B') } }),
      (r) => r.totaux.interverties === 2 && r.totaux.identiques === 0],
    ['non-verifiable', census([photo({})], { h1: { refus: 'illisible' } }), census([photo({})], { h1: { refus: 'illisible' } }),
      (r) => r.totaux.nonVerifiables === 1],
    ['apparue', census([], {}), census([photo({})], { h1: { base64: b64('A') } }), (r) => r.totaux.apparues === 1],
  ];
  let ok = 0;
  for (const [nom, a, b, attendu] of cas) {
    const r = verifier(a, b);
    const pass = attendu(r);
    console.log(`${pass ? '✔' : '✗'} ${nom}`);
    if (pass) ok++; else console.log('   ', JSON.stringify(r.totaux));
  }
  console.log(`\nselftest : ${ok}/${cas.length}`);
  process.exit(ok === cas.length ? 0 : 1);
}

const argv = process.argv.slice(2);
if (argv[0] === '--selftest') selftest();

const [fAvant, fApres] = argv.filter((a) => !a.startsWith('--'));
if (!fAvant || !fApres) {
  console.error('usage: photos-verify.mts <census-avant.json> <census-apres.json> [--out <chemin>]');
  process.exit(2);
}
const iOut = argv.indexOf('--out');
const out = iOut >= 0 ? argv[iOut + 1] : 'specs/016-canvas-vrai/proofs/photos/photos-report.json';

const rapport = verifier(JSON.parse(readFileSync(fAvant, 'utf8')), JSON.parse(readFileSync(fApres, 'utf8')));
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(rapport, null, 2) + '\n');

const t = rapport.totaux;
console.log(`photos-verify → ${out}`);
console.log(`  avant ${t.photosAvant} · après ${t.photosApres} · composants porteurs ${t.composantsPorteurs}`);
console.log(`  identiques ${t.identiques} · interverties ${t.interverties} · perdues ${t.perdues} · non-vérifiables ${t.nonVerifiables} · apparues ${t.apparues}`);
for (const c of rapport.composants.filter((c) => c.verdict === 'en-souffrance')) {
  console.log(`  ✗ ${c.sujet} — EN SOUFFRANCE`);
  for (const n of c.nonReplacees) console.log(`      · ${n}`);
}
// Sortie non nulle si une photo n'est pas prouvée identique : un doute n'est pas un succès.
const echec = t.interverties + t.perdues + t.nonVerifiables;
if (echec > 0) { console.log(`\n✗ ${echec} photo(s) non prouvée(s) identiques — FR-007 non tenu`); process.exit(1); }
console.log('\n✓ toutes les photos prouvées identiques');
