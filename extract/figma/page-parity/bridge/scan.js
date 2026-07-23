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
// Division of labor (decided at T0, after the first recon run): the SANDBOX
// MEASURES, the NODE SIDE CLASSIFIES. This script collects facts only —
// section candidates (direct children), repeated-sibling groups with per-item
// deep facts (governed-instance content, text counts, max font), resolved
// instances. The block classification (MATCHERS) lives in
// extract/figma/page-parity/assemble-scan.mjs: versioned, re-runnable on the
// same measured data WITHOUT the bridge, every refinement a reviewable diff.
// An earlier revision carried an in-sandbox "full" classification mode; it was
// removed because its re-fetch loops were slow and, worse, not re-runnable —
// refining a matcher meant re-scanning the live file instead of re-assembling
// measured facts. Seeds derive from COMPONENT-INVENTORY.md (2026-07-23) — the
// fresh scan always wins over the MD (règle de foi).
//
// Invocation (per maquette — a full-subtree walk + N getMainComponentAsync
// awaits fits the 30s call budget per maquette, not for all 9):
//   1. Prior figma_execute:  globalThis.__dsc003_input =
//        { maquette, nodeId, post?: true, port?: 9227 }
//   2. figma_execute this file's text → tiny summary; the FULL report is
//      stashed on globalThis.__dsc003.scan[maquette] and, when input.post is
//      true, POSTed verbatim to the page-parity receiver
//      (POST /json?name=scan-<maquette>) so it lands on disk without ever
//      transiting a tool result.
// The 9 per-maquette reports are assembled Node-side by assemble-scan.mjs into
// inventory/scan-<date>.json (schema of the contract), where classification,
// cross-maquette totals and introuvables[] are computed.
(async () => {
  const input = globalThis.__dsc003_input || {};
  const nom = input.maquette;
  const nodeId = input.nodeId;
  if (!nom || !nodeId) throw new Error('scan.js: input requis — { maquette, nodeId, post?, port? }');

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

  // Molecule candidates = groups of >=2 sibling nodes anywhere in the subtree
  // (repetition is structure, not naming), above a noise floor. Two groupers,
  // both measured lessons from the first T0 recon run:
  //   bySig  — exact structural signature (homogeneous repeats);
  //   byDims — rounded w×h (heterogeneous repeats: reassurance items whose
  //            icon node differs, accordion rows open vs closed — same block,
  //            different signature).
  // Nodes INSIDE an instance are master content, not copies: flagged
  // dansInstance and never counted as copie-brute (first recon run counted
  // the Header nav's own menu items as copies — a correctness bug).
  const collections = [];
  const itemFacts = (k, inInstance) => ({
    nodeId: k.id,
    nomFigma: k.name,
    bounds: abs(k),
    signature: sig(k),
    etat: inInstance ? 'contenu-instance' : etatOf(k),
    aBouton: hasInstanceOf(k, /^Bouton$/, true),
    aChevron: hasInstanceOf(k, /chevron/i, true),
    aMemberPicture: hasInstanceOf(k, /member-picture/i, true),
    nTextes: 'findAll' in k ? k.findAll((d) => d.type === 'TEXT').length : 0,
    maxFont: maxTextSize(k),
  });
  const visit = (n, depth, inInstance) => {
    const kids = kidsOf(n);
    if (kids.length >= 2) {
      const bySig = {};
      const byDims = {};
      for (const k of kids) {
        const b = abs(k);
        if (b.w < 120 || b.h < 24) continue; // noise floor: below any block size
        (bySig[sig(k)] = bySig[sig(k)] || []).push(k);
        const d = Math.round(b.w / 4) * 4 + 'x' + Math.round(b.h / 4) * 4;
        (byDims[d] = byDims[d] || []).push(k);
      }
      const emitted = {};
      for (const s in bySig) {
        if (bySig[s].length >= 2) {
          for (const k of bySig[s]) emitted[k.id] = true;
          collections.push({
            groupement: 'signature',
            parentNodeId: n.id,
            parentNomFigma: n.name,
            parentBounds: abs(n),
            profondeur: depth,
            dansInstance: inInstance,
            signatureItem: s,
            count: bySig[s].length,
            items: bySig[s].map((k) => itemFacts(k, inInstance)),
          });
        }
      }
      for (const d in byDims) {
        // Only emit a dims-group when it adds members the signature groups
        // did not already cover (pure supersets are noise).
        const extra = byDims[d].filter((k) => !emitted[k.id]);
        if (byDims[d].length >= 2 && extra.length >= 1) {
          collections.push({
            groupement: 'dims',
            parentNodeId: n.id,
            parentNomFigma: n.name,
            parentBounds: abs(n),
            profondeur: depth,
            dansInstance: inInstance,
            signatureItem: 'dims:' + d,
            count: byDims[d].length,
            items: byDims[d].map((k) => itemFacts(k, inInstance)),
          });
        }
      }
    }
    for (const k of kids) visit(k, depth + 1, inInstance || k.type === 'INSTANCE');
  };
  visit(frame, 1, false);

  const report = {
    maquette: nom,
    nodeId: nodeId,
    bounds: abs(frame),
    sectionCandidates: sectionCandidates,
    collections: collections,
    dejaInstancie: dejaInstancie,
    dependancesTierces: dependancesTierces,
    instancesIllisibles: instancesIllisibles,
  };

  globalThis.__dsc003 = globalThis.__dsc003 || {};
  globalThis.__dsc003.scan = globalThis.__dsc003.scan || {};
  globalThis.__dsc003.scan[nom] = report;

  // Ship the full report to disk through the receiver (POST /json) so the
  // tool result stays a tiny summary regardless of maquette complexity.
  let posted = null;
  if (input.post) {
    const port = input.port || 9227;
    const resp = await fetch('http://localhost:' + port + '/json?name=' + encodeURIComponent('scan-' + nom), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    posted = await resp.json();
    if (!resp.ok || posted.ok !== true) throw new Error('scan.js: POST /json refuse — ' + JSON.stringify(posted));
  }

  return {
    maquette: nom,
    sections: sectionCandidates.length,
    collections: collections.length,
    instancesResolues: Object.keys(dejaInstancie).reduce((a, k) => a + dejaInstancie[k], 0),
    tierces: dependancesTierces.length,
    illisibles: instancesIllisibles.length,
    posted: posted,
  };
})()
