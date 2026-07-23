// customizations.js — copy ↔ master structural diff BY POSITION (T023, US4).
//
// DRAFT — first exercised at the Phase 7 adoptions (contract:
// specs/003-externalize-figma-components/contracts/customization-ledger.md).
// Runs INSIDE the Figma plugin sandbox via figma_execute: plain JS, read-only.
//
// Role: BEFORE a copy is replaced by an instance, walk the copy against the
// master by child-index path (never by name — names lie, receipt: "item" x71
// covers 3 distinct molecules) and record every per-occurrence customization
// the replacement must carry: texts, image fills, swapped icon instances,
// visibility flags. The output pre-fills ledger/<bloc>.json entries.
//
// What this script deliberately does NOT decide: portePar and statut. Whether
// a customization is carried by a master property (statut "reportee") or is
// not portable (statut "non-portable-signalee" + journal entry) is a HUMAN
// call made at adoption time — the draft emits portePar: null, statut: null.
//
// Honesty: anything it can see but not read (unknown node shape, unreadable
// paint, mixed-style text it cannot serialize) becomes a type "autre" entry
// with a description — silent omission is the worst bug class here.
//
// Invocation:
//   1. Prior figma_execute:  globalThis.__dsc003_input =
//        { masterNodeId, occurrences: [{ maquette, nodeId }, ...] }
//   2. figma_execute this file's text. Returns { entrees, totauxDetectes,
//      occurrencesIllisibles } (small — entries are compact); the full list is
//      also stashed on globalThis.__dsc003.customizations for chunked reads if
//      a run ever grows past a tool result's budget.
(async () => {
  const input = globalThis.__dsc003_input || {};
  const masterNodeId = input.masterNodeId;
  const occurrences = input.occurrences;
  if (!masterNodeId || !Array.isArray(occurrences) || occurrences.length === 0) {
    throw new Error('customizations.js: input requis — { masterNodeId, occurrences: [{ maquette, nodeId }] }');
  }

  await figma.loadAllPagesAsync();
  const master = await figma.getNodeByIdAsync(masterNodeId);
  if (!master) throw new Error('customizations.js: master introuvable ' + masterNodeId);
  // A COMPONENT_SET's default variant is the comparison base; a COMPONENT is
  // itself the base.
  const masterBase = master.type === 'COMPONENT_SET' ? master.defaultVariant : master;
  if (!masterBase) throw new Error('customizations.js: master sans variante par defaut (' + master.type + ')');

  const entrees = [];
  const occurrencesIllisibles = [];

  const pushEntry = (maquette, bounds, type, chemin, valeur) => {
    entrees.push({
      maquette: maquette,
      position: bounds,
      type: type,
      chemin: chemin,
      valeur: valeur,
      portePar: null, // human call at adoption time
      statut: null,   // human call at adoption time
    });
  };

  // Serialize the paints of a node far enough to compare image fills.
  const imageHashes = (node) => {
    if (!('fills' in node) || !Array.isArray(node.fills)) return null; // figma.mixed or none
    return node.fills.filter((f) => f.type === 'IMAGE').map((f) => f.imageHash || 'sans-hash');
  };

  // Walk copy vs master by child index, depth-first. `chemin` is an
  // index path; names ride along as documentation only.
  const walkPair = (maquette, bounds, copy, ref, chemin) => {
    // Text content
    if (copy.type === 'TEXT') {
      const copyText = copy.characters;
      const refText = ref && ref.type === 'TEXT' ? ref.characters : null;
      if (copyText !== refText) {
        pushEntry(maquette, bounds, 'texte', chemin + ' (' + copy.name + ')', copyText);
      }
    }
    // Image fills
    const copyImages = imageHashes(copy);
    const refImages = ref ? imageHashes(ref) : null;
    if (copyImages && copyImages.length > 0 && JSON.stringify(copyImages) !== JSON.stringify(refImages || [])) {
      pushEntry(maquette, bounds, 'image', chemin + ' (' + copy.name + ')', 'imageHash: ' + copyImages.join(', '));
    }
    // Swapped nested instances (icons etc.)
    if (copy.type === 'INSTANCE') {
      // getMainComponentAsync exists on instances; refusal is reported, never
      // swallowed.
      return copy
        .getMainComponentAsync()
        .then((copyMain) => {
          const refPromise = ref && ref.type === 'INSTANCE' ? ref.getMainComponentAsync() : Promise.resolve(null);
          return refPromise.then((refMain) => {
            const copyKey = copyMain ? copyMain.id + '/' + copyMain.name : 'introuvable';
            const refKey = refMain ? refMain.id + '/' + refMain.name : 'introuvable';
            if (copyKey !== refKey) {
              pushEntry(maquette, bounds, 'icone', chemin + ' (' + copy.name + ')', copyKey);
            }
          });
        })
        .catch((e) => {
          occurrencesIllisibles.push({ maquette: maquette, chemin: chemin, raison: 'getMainComponentAsync: ' + String((e && e.message) || e) });
        });
    }
    // Visibility
    const refVisible = ref ? ref.visible : null;
    if (copy.visible !== refVisible && ref) {
      pushEntry(maquette, bounds, 'visibilite', chemin + ' (' + copy.name + ')', copy.visible ? 'visible' : 'masque');
    }
    // Recurse over children by index; extra children on the copy side are
    // customizations too (ref undefined → still walked, diffs vs null ref).
    const copyChildren = 'children' in copy ? copy.children : [];
    const refChildren = ref && 'children' in ref ? ref.children : [];
    let chain = Promise.resolve();
    for (let i = 0; i < copyChildren.length; i++) {
      const child = copyChildren[i];
      const refChild = refChildren[i] || null;
      chain = chain.then(() => walkPair(maquette, bounds, child, refChild, chemin + '/' + i));
    }
    if (refChildren.length > copyChildren.length) {
      // Children the master has but the copy dropped: a visibility-class
      // customization, named — never silently ignored.
      for (let i = copyChildren.length; i < refChildren.length; i++) {
        pushEntry(maquette, bounds, 'autre', chemin + '/' + i + ' (absent de la copie)', 'enfant du master absent de la copie: ' + refChildren[i].name);
      }
    }
    return chain;
  };

  for (const occ of occurrences) {
    const node = await figma.getNodeByIdAsync(occ.nodeId);
    if (!node) {
      occurrencesIllisibles.push({ maquette: occ.maquette, nodeId: occ.nodeId, raison: 'node introuvable (nodeId perime ? re-scanner)' });
      continue;
    }
    const b = node.absoluteBoundingBox;
    const bounds = b
      ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
      : { x: Math.round(node.x), y: Math.round(node.y), w: Math.round(node.width), h: Math.round(node.height) };
    await walkPair(occ.maquette, bounds, node, masterBase, '');
  }

  globalThis.__dsc003 = globalThis.__dsc003 || {};
  globalThis.__dsc003.customizations = entrees;

  const totauxDetectes = { texte: 0, image: 0, icone: 0, visibilite: 0, autre: 0 };
  for (const e of entrees) totauxDetectes[e.type]++;

  return {
    masterNodeId: masterNodeId,
    occurrencesTraitees: occurrences.length - occurrencesIllisibles.length,
    occurrencesIllisibles: occurrencesIllisibles,
    totauxDetectes: totauxDetectes,
    entrees: entrees,
  };
})()
