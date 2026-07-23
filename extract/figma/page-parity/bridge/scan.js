// scan.js — position-based inventory scan of one maquette (T008, FR-002/FR-006).
//
// Runs INSIDE the Figma plugin sandbox via the figma-console desktop bridge
// (figma_execute): plain JS, no import/require; READ-ONLY, strictly.
// Contract: specs/003-externalize-figma-components/contracts/inventory-scan.md.
//
// NON-NEGOTIABLE CLASSIFICATION RULES (contract §Règles):
//   1. Blocks are identified by GEOMETRY + STRUCTURAL SIGNATURE — never by
//      layer name. Names ride along as documentation only (`nomFigma`).
//      Receipt: "item" x71 covers 3 distinct molecules (Accordion-row,
//      Category-card, Reassurance-item).
//      Exception that is NOT one: resolved MAIN COMPONENT names (Bouton,
//      member-picture, chevron-down…) are governed component identities, not
//      layer names — using them to recognize an *instance dependency* inside a
//      candidate's structure is allowed; using a *copy's own* layer name never is.
//   2. Every INSTANCE is resolved via getMainComponentAsync():
//      etat "copie-brute" | "instance-existante" | "instance-nouveau-master"
//      (main sits on a page named "DS · …"). Any main with remote === true is
//      reported in dependancesTierces[] — expected EMPTY (FR-019/SC-008).
//   3. Everything seen but not classified lands in nonClasses[] — NEVER
//      silently dropped (principle V).
//
// Two modes (input.mode), because honest matchers are grown from measured
// signatures, not invented ones:
//   "recon" — facts only: direct children of the maquette (section candidates),
//             repeated-sibling groups (molecule candidates), resolved
//             instances. No block classification at all. Used once at T0 to
//             see the real structural signatures before pinning MATCHERS.
//   "full"  — recon facts + classification through the MATCHERS table below.
//             Unmatched candidates → nonClasses[].
// The MATCHERS table is versioned here so every refinement is a reviewable
// diff; seeds derive from COMPONENT-INVENTORY.md (2026-07-23 measurements) —
// the fresh scan always wins over the MD (règle de foi).
//
// Invocation (per maquette — a full-subtree walk + N getMainComponentAsync
// awaits fits the 30s call budget per maquette, not for all 9):
//   1. Prior figma_execute:  globalThis.__dsc003_input =
//        { maquette, nodeId, mode: "recon" | "full" }
//   2. figma_execute this file's text → compact per-maquette report (also
//      stashed on globalThis.__dsc003.scan[maquette]).
// The 9 per-maquette reports are assembled Node-side into
// inventory/scan-<date>.json (schema of the contract), where cross-maquette
// totals and introuvables[] are computed.
(async () => {
  const input = globalThis.__dsc003_input || {};
  const nom = input.maquette;
  const nodeId = input.nodeId;
  const mode = input.mode || 'recon';
  if (!nom || !nodeId) throw new Error('scan.js: input requis — { maquette, nodeId, mode? }');

  await figma.loadAllPagesAsync();
  const frame = await figma.getNodeByIdAsync(nodeId);
  if (!frame) throw new Error('scan.js: maquette introuvable ' + nodeId + ' (' + nom + ') — nodeIds perimes, re-sonder');

  const abs = (n) => {
    const b = n.absoluteBoundingBox;
    return b
      ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
      : { x: 0, y: 0, w: 0, h: 0 };
  };
  const kidsOf = (n) => ('children' in n ? n.children : []);
  const sig = (n) => n.type.toLowerCase() + '[' + kidsOf(n).map((k) => k.type.toLowerCase()).join(',') + ']';

  // ---------------------------------------------------------------- instances
  // Resolve every INSTANCE of the subtree once; index by node id for matchers.
  const KNOWN_MASTERS = ['Bouton', 'Header nav', 'piqueray_logo', 'member-picture'];
  const ICON_HINT = /chevron|arrow|piqueray|icon/i; // governed icon-set names
  const instances = frame.findAll((n) => n.type === 'INSTANCE');
  const mainByNodeId = {};
  const dejaInstancie = {};
  const dependancesTierces = [];
  const instancesIllisibles = [];
  for (const inst of instances) {
    let main = null;
    try {
      main = await inst.getMainComponentAsync();
    } catch (e) {
      instancesIllisibles.push({ nodeId: inst.id, nomFigma: inst.name, raison: String((e && e.message) || e) });
      continue;
    }
    if (!main) {
      instancesIllisibles.push({ nodeId: inst.id, nomFigma: inst.name, raison: 'main null (instance detachee ?)' });
      continue;
    }
    // A variant's identity is its COMPONENT_SET's name.
    const masterName = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent.name : main.name;
    let p = main.parent;
    while (p && p.type !== 'PAGE') p = p.parent;
    const masterPage = p ? p.name : null;
    const remote = main.remote === true;
    mainByNodeId[inst.id] = { masterName: masterName, masterPage: masterPage, remote: remote };
    if (remote) {
      dependancesTierces.push({ maquette: nom, nodeId: inst.id, nomFigma: inst.name, master: masterName, bounds: abs(inst) });
    }
    dejaInstancie[masterName] = (dejaInstancie[masterName] || 0) + 1;
  }
  const etatOf = (n) => {
    if (n.type !== 'INSTANCE') return 'copie-brute';
    const m = mainByNodeId[n.id];
    if (m && m.masterPage && m.masterPage.indexOf('DS · ') === 0) return 'instance-nouveau-master';
    return 'instance-existante';
  };

  // ------------------------------------------------- structural helpers
  const countTypes = (n) => {
    const c = { text: 0, frame: 0, instance: 0, vector: 0, rectangle: 0, group: 0, other: 0, total: 0 };
    for (const k of kidsOf(n)) {
      const t = k.type.toLowerCase();
      c.total++;
      if (t in c) c[t]++;
      else c.other++;
    }
    return c;
  };
  const hasInstanceOf = (n, nameRe, deep) => {
    const pool = deep ? (('findAll' in n) ? n.findAll((d) => d.type === 'INSTANCE') : []) : kidsOf(n).filter((k) => k.type === 'INSTANCE');
    return pool.some((i) => {
      const m = mainByNodeId[i.id];
      return m && nameRe.test(m.masterName);
    });
  };
  const maxTextSize = (n) => {
    let mx = 0;
    if ('findAll' in n) {
      for (const t of n.findAll((d) => d.type === 'TEXT')) {
        const fs = typeof t.fontSize === 'number' ? t.fontSize : 0;
        if (fs > mx) mx = fs;
      }
    }
    return mx;
  };

  // ------------------------------------------------- candidates (facts)
  // Section candidates = direct children of the maquette frame.
  const H = abs(frame).h;
  const sectionCandidates = kidsOf(frame).map((n, i) => ({
    index: i,
    nomFigma: n.name,
    nodeId: n.id,
    type: n.type,
    bounds: abs(n),
    signature: sig(n),
    etat: etatOf(n),
    enfants: countTypes(n),
    aBouton: n.type !== 'INSTANCE' && hasInstanceOf(n, /^Bouton$/, true),
    maxFont: n.type !== 'INSTANCE' ? maxTextSize(n) : 0,
  }));

  // Molecule candidates = groups of >=2 same-signature siblings anywhere in
  // the subtree (repetition is structure, not naming), above a noise floor.
  const collections = [];
  const visit = (n, depth) => {
    const kids = kidsOf(n);
    if (kids.length >= 2) {
      const bySig = {};
      for (const k of kids) {
        const b = abs(k);
        if (b.w < 120 || b.h < 24) continue; // noise floor: below any block size
        const s = sig(k);
        (bySig[s] = bySig[s] || []).push(k);
      }
      for (const s in bySig) {
        if (bySig[s].length >= 2) {
          collections.push({
            parentNodeId: n.id,
            parentNomFigma: n.name,
            parentBounds: abs(n),
            profondeur: depth,
            signatureItem: s,
            count: bySig[s].length,
            items: bySig[s].map((k) => ({ nodeId: k.id, nomFigma: k.name, bounds: abs(k), etat: etatOf(k) })),
          });
        }
      }
    }
    for (const k of kids) visit(k, depth + 1);
  };
  visit(frame, 1);

  const report = {
    maquette: nom,
    nodeId: nodeId,
    bounds: abs(frame),
    mode: mode,
    sectionCandidates: sectionCandidates,
    collections: collections,
    dejaInstancie: dejaInstancie,
    dependancesTierces: dependancesTierces,
    instancesIllisibles: instancesIllisibles,
  };

  // ------------------------------------------------- classification ("full")
  if (mode === 'full') {
    // MATCHERS — structural seeds, refined from the T0 recon run's measured
    // signatures. Each matcher sees a candidate node + helpers; layer names
    // are NOT consulted (resolved master names of nested instances are).
    const item = (k) => ({ node: k, b: abs(k), c: countTypes(k) });
    const MATCHERS_ITEM = [
      { cle: 'accordion-row', niveau: 'molecule',
        test: (x) => x.b.w >= 500 && x.b.h >= 36 && x.b.h <= 220 && hasInstanceOf(x.node, /chevron/i, true) && x.c.text >= 1 },
      { cle: 'member-card', niveau: 'molecule',
        test: (x) => hasInstanceOf(x.node, /member-picture/i, true) && x.c.text >= 1 },
      { cle: 'product-card', niveau: 'molecule',
        test: (x) => x.b.h >= 220 && hasInstanceOf(x.node, /^Bouton$/, true) && maxTextSize(x.node) <= 30 && x.b.w >= 200 && x.b.w <= 520 },
      { cle: 'category-card', niveau: 'molecule',
        test: (x) => x.b.h >= 220 && x.b.w >= 300 && (hasInstanceOf(x.node, /^Bouton$/, true) || x.c.rectangle + x.c.frame >= 1) && x.c.text >= 1 && x.b.h <= 900 },
      { cle: 'reassurance-item', niveau: 'molecule',
        test: (x) => x.b.h >= 40 && x.b.h <= 200 && x.b.w >= 150 && x.b.w <= 600 && x.c.text >= 1 && (x.c.vector + x.c.instance + x.c.frame >= 1) },
      { cle: 'tab', niveau: 'molecule',
        test: (x) => x.b.h >= 28 && x.b.h <= 80 && x.b.w >= 60 && x.b.w <= 420 && x.c.text === 1 && x.c.total <= 2 },
      { cle: 'footer-column', niveau: 'molecule',
        test: (x) => x.b.y >= H * 0.72 && x.c.text >= 2 && x.b.w <= 500 },
      { cle: 'contact-info-row', niveau: 'molecule',
        test: (x) => x.b.h <= 140 && x.b.w >= 250 && x.c.text >= 2 && x.c.total <= 4 },
      { cle: 'gallery-item', niveau: 'molecule',
        test: (x) => x.b.w >= 250 && x.b.h >= 200 && x.c.total <= 2 && x.c.text === 0 },
    ];
    const blocs = {};
    const nonClasses = [];
    const push = (cle, niveau, k) => {
      (blocs[cle] = blocs[cle] || { cle: cle, niveau: niveau, occurrences: [] }).occurrences.push({
        maquette: nom,
        nodeId: k.id,
        bounds: abs(k),
        signature: sig(k),
        nomFigma: k.name,
        etat: etatOf(k),
      });
    };
    // Collections first: an item classified through its repeated group.
    const claimed = {};
    for (const col of collections) {
      for (const it of col.items) if (it.etat !== 'copie-brute') claimed[it.nodeId] = 'instance'; // instances are not copies to classify
      const sample = col.items.filter((it) => !claimed[it.nodeId]);
      if (sample.length === 0) continue;
      let matched = null;
      for (const M of MATCHERS_ITEM) {
        const nodes = [];
        for (const it of sample) {
          const n = await figma.getNodeByIdAsync(it.nodeId);
          if (n) nodes.push(n);
        }
        if (nodes.length >= 2 && nodes.every((n) => M.test(item(n)))) { matched = M; break; }
      }
      if (matched) {
        for (const it of sample) {
          const n = await figma.getNodeByIdAsync(it.nodeId);
          if (n && !claimed[it.nodeId]) { push(matched.cle, matched.niveau, n); claimed[it.nodeId] = matched.cle; }
        }
      } else {
        nonClasses.push({ genre: 'collection', maquette: nom, parentNomFigma: col.parentNomFigma, parentNodeId: col.parentNodeId, signatureItem: col.signatureItem, count: col.count, bounds: col.parentBounds });
      }
    }
    // Section-level candidates: report classified state only as facts here;
    // section↔cle mapping is assembled Node-side at T010 (position + already-
    // classified molecule content give the evidence) — an unmatched section
    // candidate is still surfaced, never dropped.
    for (const s of sectionCandidates) {
      if (s.etat === 'copie-brute') {
        nonClasses.push({ genre: 'section-candidate', maquette: nom, nomFigma: s.nomFigma, nodeId: s.nodeId, signature: s.signature, bounds: s.bounds, aBouton: s.aBouton, maxFont: s.maxFont });
      }
    }
    report.blocs = blocs;
    report.nonClasses = nonClasses;
  }

  globalThis.__dsc003 = globalThis.__dsc003 || {};
  globalThis.__dsc003.scan = globalThis.__dsc003.scan || {};
  globalThis.__dsc003.scan[nom] = report;
  return report;
})()
