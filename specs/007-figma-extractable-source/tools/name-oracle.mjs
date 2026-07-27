#!/usr/bin/env node
// name-oracle.mjs — le test d'acceptation HORS LIGNE de la table de nommage (FR-030 / SC-003).
//
// Pourquoi il existe : l'extracteur ne REFUSE jamais un nom illégal — il translittère à la
// proposition et écrit une note. La dette est donc silencieuse. Cet oracle inverse la
// charge : il prédit, pour un nom candidat, si la note se déclenchera ENCORE, AVANT que le
// nom ne soit posé sur le canvas. Aucune ligne de la table n'est exécutable tant que
// l'oracle ne rend pas CLEAN.
//
// Il vit sous specs/ et non dans le dépôt applicatif parce que FR-025 gèle ce dernier.
//
// ⚠ MIROIR — les fonctions ci-dessous sont transcrites VERBATIM de :
//     extract/types.ts       l. 183   kebab
//     core/propose-figma.ts  l. 35    camel
//     core/propose-figma.ts  l. 63    canonicalPropName / propNameSanitized / propNameDigitLed
//     core/propose-figma.ts  l. 95    componentIdSlug / idSlugSanitized
//     core/propose-figma.ts  l. 113   pascalComponentName
// Si l'une d'elles change dans le dépôt, CE FICHIER MENT. Le contrôle de non-dérive est
// `--selftest`, qui rejoue les 5 exemples que la spec cite comme vérité terrain.
//
// Usage :
//   node name-oracle.mjs "SectionHeader" --kind set
//   node name-oracle.mjs "Etat" --kind prop
//   node name-oracle.mjs --selftest
//   node name-oracle.mjs --census        (les 55 noms + 57 props relevés le 2026-07-26)

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();

const camel = (s) =>
  s.trim().split(/[\s_-]+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');

const componentIdSlug = (name) => {
  const cleaned = kebab(name).replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
  return /^[a-z]/.test(cleaned) ? cleaned : `c${cleaned ? `-${cleaned}` : ''}`;
};
const idSlugSanitized = (name) => componentIdSlug(name) !== kebab(name);

const pascalComponentName = (setName) => {
  const p = setName.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return /^[A-Za-z]/.test(p) ? p : `C${p || 'omponent'}`;
};

const canonicalPropName = (property) => {
  const bare = property.split('#')[0].trim();
  if (/^[a-z][A-Za-z0-9]*$/.test(bare)) return bare;
  const name = camel(bare.replace(/[^A-Za-z0-9 _-]+/g, ' ').trim());
  return /^[a-z]/.test(name) ? name : `p${name}`;
};
const propNameSanitized = (property) => /[^A-Za-z0-9 _-]/.test(property.split('#')[0].trim());
const propNameDigitLed = (property) => {
  const bare = property.split('#')[0].trim();
  if (/^[a-z][A-Za-z0-9]*$/.test(bare)) return false;
  return !/^[a-z]/.test(camel(bare.replace(/[^A-Za-z0-9 _-]+/g, ' ').trim()));
};

/** Le verdict d'une ligne de table. `kind: set|part|variant` suivent la règle des sets —
 *  ils deviennent tous des identifiants générés. `prop` a sa propre règle, plus permissive
 *  (espaces, `_` et `-` sont légaux dans un nom de propriété). */
export function oracle(name, kind = 'set') {
  if (kind === 'prop') {
    const notes = [];
    if (propNameSanitized(name)) notes.push('C');
    if (propNameDigitLed(name)) notes.push('C-digit');
    return { name, kind, proposed: canonicalPropName(name), notes, verdict: notes.length ? 'NOTED' : 'CLEAN' };
  }
  const notes = [];
  if (pascalComponentName(name) !== name) notes.push('A');
  if (idSlugSanitized(name)) notes.push('B');
  return {
    name, kind,
    proposed: pascalComponentName(name),
    id: componentIdSlug(name),
    notes,
    verdict: notes.length ? 'NOTED' : 'CLEAN',
  };
}

/** La forme pleinement propre d'un nom : accents dépliés puis PascalCase strict. */
export const cleanCandidate = (name) =>
  pascalComponentName(name.normalize('NFD').replace(/[̀-ͯ]/g, ''));

// --------------------------------------------------------------------------- selftest
// Vérité terrain : les 5 exemples que spec.md cite comme comportement observé.
const GROUND_TRUTH = [
  ['Étoile', 'set', 'Toile', 'toile'],
  ['Équipe', 'set', 'Quipe', 'quipe'],
  ['Hero vidéo', 'set', 'HeroVidO', 'hero-vid-o'],
  ['État', 'prop', 'tat', null],
  ['Libellé', 'prop', 'libell', null],
];

function selftest() {
  let ok = 0;
  for (const [input, kind, expectedName, expectedId] of GROUND_TRUTH) {
    const r = oracle(input, kind);
    const nameOk = r.proposed === expectedName;
    const idOk = expectedId === null || r.id === expectedId;
    const pass = nameOk && idOk && r.verdict === 'NOTED';
    if (pass) ok++;
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${input.padEnd(12)} ${kind.padEnd(5)} -> ${r.proposed}${r.id ? ` / ${r.id}` : ''}${pass ? '' : `   ATTENDU ${expectedName}${expectedId ? ` / ${expectedId}` : ''}`}`);
  }
  console.log(`\n  ${ok}/${GROUND_TRUTH.length} — ${ok === GROUND_TRUTH.length ? 'le miroir est fidèle' : 'DÉRIVE : les fonctions du dépôt ont changé, ce fichier ment'}`);
  return ok === GROUND_TRUTH.length ? 0 : 1;
}

// --------------------------------------------------------------------------- census
// Relevé live du 2026-07-26 (figma_execute, lecture seule) — 55 masters, 57 propriétés.
const MASTERS = [
  'Checkbox','piqueray_logo','Bouton','member-picture','Input','Textarea','Select','Facebook',
  'Instagram','Étoile','piqueray','mail','phone','download','pdf','search','user','chevron-right',
  'chevron-left','chevron-down','chevron-up','cart','arrow-right','arrow-left','external-link',
  'octicon:chevron-down-12','Réassurances','Catégories principales','Réalisations','Header','Devis',
  'Formulaire','Présentation','FAQ','Coordonnées','SAV','Texte SEO','Hero','Équipe',
  'Produits e-commerce','Footer','Hero vidéo','Field','Accordion-row','Tab','Carte','Section-header',
  'Réalisation','Product-card','Member-card','Carousel-controls','Footer-column','Copyright',
  'Avantage','Nav-item',
];
const PROPS = [
  'Valeur','Valeur','Valeur','Coché','Couleur','Icône gauche','Icône droite','Glyphe gauche',
  'Glyphe droite','Libellé','Style','État','Titre','Accroche','Titre','Consentement','Titre','Texte',
  'Bouton','Ligne 3','Accroche','Titre','Titre','Disposition','Disposition','En-tête','Fond','Label',
  'Optionnel','Saisie','État','Titre','Contenu','Taille','État','Libellé','État','Titre','Texte',
  'Disposition','Titre','Prix','Bouton','Nom','Poste','Titre','Texte','Texte','Titre','Texte',
  'Accroche','Titre','Accroche2','Disposition','Taille','Chevron','Actif',
];
const VARIANT_VALUES = [
  'Défaut','4 cartes · 2 CTA','Pleine largeur · 3 cartes','Pleine largeur · RDV','Présentation',
  'Fermé','Défaut','Sélectionné','Réassurance','Catégorie',
];

function census() {
  const setRows = MASTERS.map((n) => oracle(n, 'set'));
  const a = setRows.filter((r) => r.notes.includes('A'));
  const b = setRows.filter((r) => r.notes.includes('B'));
  const propDistinct = [...new Set(PROPS)];
  const c = propDistinct.filter((p) => oracle(p, 'prop').verdict === 'NOTED');
  const cOcc = PROPS.filter((p) => oracle(p, 'prop').verdict === 'NOTED').length;

  console.log(`CLASSE A — nom de set != PascalCase : ${a.length} / ${MASTERS.length}`);
  a.forEach((r) => console.log(`  ${r.name.padEnd(26)} -> ${r.proposed.padEnd(24)} propre: ${cleanCandidate(r.name)}`));
  console.log(`\nCLASSE B — caracteres qu'un id ne porte pas : ${b.length}`);
  b.forEach((r) => console.log(`  ${r.name.padEnd(26)} -> id "${r.id}"`));
  console.log(`\nCLASSE C — propriete hors identifiant legal : ${c.length} distinctes / ${cOcc} occurrences sur ${PROPS.length}`);
  c.forEach((p) => console.log(`  ${p.padEnd(18)} -> ${oracle(p, 'prop').proposed.padEnd(14)} (x${PROPS.filter((x) => x === p).length})  propose: ${p.normalize('NFD').replace(/[̀-ͯ]/g, '')}`));
  const v = VARIANT_VALUES.filter((x) => /[^\x00-\x7F]/.test(x));
  console.log(`\nVALEURS DE VARIANT non-ASCII (hors FR actuelles, cf. decision O3) : ${v.length}`);
  v.forEach((x) => console.log(`  ${x}`));
}

// --------------------------------------------------------------------------- CLI
const argv = process.argv.slice(2);
if (argv.includes('--selftest')) process.exit(selftest());
else if (argv.includes('--census')) census();
else if (argv.length === 0 || argv.includes('--help')) {
  console.log('usage: node name-oracle.mjs "<nom>" [--kind set|prop|variant|part] | --selftest | --census');
} else {
  const kindIdx = argv.indexOf('--kind');
  const kind = kindIdx >= 0 ? argv[kindIdx + 1] : 'set';
  const name = argv[0];
  const r = oracle(name, kind);
  console.log(`${r.verdict}${r.notes.length ? ` (${r.notes.join(', ')})` : ''}  "${name}" [${kind}]`);
  console.log(`  nom propose : ${r.proposed}`);
  if (r.id) console.log(`  id propose  : ${r.id}`);
  if (r.verdict === 'NOTED' && kind !== 'prop') console.log(`  candidat propre : ${cleanCandidate(name)}`);
  process.exit(r.verdict === 'CLEAN' ? 0 : 1);
}
