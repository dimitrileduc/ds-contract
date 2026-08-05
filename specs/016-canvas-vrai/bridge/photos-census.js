// photos-census.js — recensement des VRAIES photos du fichier client, par POSITION.
//
// Runs INSIDE the Figma plugin sandbox via the figma-console desktop bridge
// (figma_execute): plain JS, no import/require. STRICTEMENT LECTURE SEULE —
// aucune écriture, aucune mutation, aucun setter appelé.
//
// Contrat : specs/016-canvas-vrai/contracts/photos-identite.md
//
// POURQUOI CET INSTRUMENT EXISTE (D7) :
//   Les scripts générés savent déjà moissonner/reposer les paints IMAGE d'un master
//   (`harvestImagePaints` / `restoreImagePaints`) et rapportent `preservedImages`.
//   Mais leur appariement retombe, en dernier recours, sur « le premier paint non
//   réclamé » (`pool.find((e) => !e.claimed)`) : deux photos de MÊME TAILLE peuvent
//   donc être interverties sans que rien ne le signale. FR-007 exige l'IDENTITÉ, pas
//   la présence — et un contrôle ne peut pas être rendu par le mécanisme qu'il contrôle.
//   Ce script est donc indépendant du restore : il photographie l'état, avant et après.
//
// CE QU'IL RECENSE :
//   · les masters des pages DS · … (porteur "master")
//   · les 9 maquettes de la page `Pages` (porteur "instance-override" quand le paint
//     vient d'un override d'instance) — population la plus fragile : reconstruire les
//     enfants d'un master ne restaure pas nécessairement les overrides des instances.
//
// IDENTIFICATION PAR POSITION, JAMAIS PAR NOM (§VIII) : la clé d'une photo est
//   (racine, chemin d'indices, bounds absolus) — un renommage de calque ne doit pas
//   faire croire à une photo perdue, ni deux calques homonymes se confondre.
//
// LE HACHAGE EST FAIT CÔTÉ NODE : le sandbox Figma n'expose pas `crypto`. On envoie
//   donc les octets (base64) et `tools/photos-verify.mts` calcule le sha256. L'imageHash
//   de Figma adresse déjà le contenu (même hash ⇔ mêmes octets) et sert d'identité
//   primaire ; le sha256 est la contre-preuve re-testable HORS Figma.
//
// Invocation :
//   1. figma_execute préalable : globalThis.__dsc016_input =
//        { port: 9231, expectNonce: "<nonce>", nom: "census-avant", octets: true }
//   2. figma_execute le texte de ce fichier. Le rapport complet est POSTé au receveur
//      (POST /json?name=<nom>) ; l'appel ne retourne qu'un petit résumé.
//
// `octets: false` saute la lecture des octets (rapide, imageHash seul) — à n'utiliser
// que pour un repérage : le verdict d'identité final se prend AVEC les octets.
(async () => {
  const input = globalThis.__dsc016_input || {};
  const port = input.port || 9231;
  const nom = input.nom;
  const avecOctets = input.octets !== false;
  if (!nom) throw new Error('photos-census.js: input requis — { nom, port?, expectNonce?, octets? }');

  // Identité du puits AVANT tout envoi (même durcissement que capture.js : un octet
  // remis à un receveur inconnu est un octet perdu en silence).
  let health = null;
  try {
    health = await (await fetch('http://localhost:' + port + '/health')).json();
  } catch (e) {
    throw new Error('photos-census.js: receveur injoignable sur :' + port + ' — ' + String((e && e.message) || e));
  }
  if (!health || health.instrument !== 'page-parity') {
    throw new Error('photos-census.js: le process sur :' + port + " n'est PAS le receveur page-parity — " + JSON.stringify(health));
  }
  if (input.expectNonce && health.nonce !== input.expectNonce) {
    throw new Error('photos-census.js: nonce ' + health.nonce + ' != attendu ' + input.expectNonce + ' — mauvaise session');
  }

  await figma.loadAllPagesAsync();

  const bx = (n) => {
    const b = n.absoluteBoundingBox;
    return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null;
  };

  // Un paint IMAGE peut vivre sur `fills` ou sur `backgrounds` (frames anciens).
  const paintsDe = (n) => {
    const out = [];
    for (const champ of ['fills', 'backgrounds']) {
      const v = n[champ];
      if (Array.isArray(v)) v.forEach((p, i) => { if (p && p.type === 'IMAGE') out.push({ champ, index: i, paint: p }); });
    }
    return out;
  };

  // Le paint vient-il d'un override d'instance ? Vrai si un ancêtre est une INSTANCE.
  const dansUneInstance = (n) => {
    let p = n.parent;
    while (p && p.type !== 'PAGE' && p.type !== 'DOCUMENT') {
      if (p.type === 'INSTANCE') return true;
      p = p.parent;
    }
    return false;
  };

  const photos = [];
  const refus = [];

  const parcourir = (node, racine, chemin) => {
    for (const t of paintsDe(node)) {
      photos.push({
        racine: racine.nom,
        racineId: racine.id,
        racineType: racine.type,
        cheminPosition: chemin,          // "3/1/0" — indices, jamais des noms
        nomCalque: node.name,            // documentaire uniquement
        typeNoeud: node.type,
        champ: t.champ,
        indexPaint: t.index,
        bounds: bx(node),
        imageHash: t.paint.imageHash || null,
        scaleMode: t.paint.scaleMode || null,
        opacity: typeof t.paint.opacity === 'number' ? t.paint.opacity : 1,
        visible: t.paint.visible !== false,
        porteur: dansUneInstance(node) ? 'instance-override' : 'master',
      });
    }
    if ('children' in node) {
      node.children.forEach((c, i) => parcourir(c, racine, chemin === '' ? String(i) : chemin + '/' + i));
    }
  };

  // 1. Les masters (COMPONENT_SET / COMPONENT de premier rang) des pages DS.
  const pagesDS = figma.root.children.filter((p) => /^DS · /.test(p.name));
  const racines = [];
  const collecterMasters = (node, page) => {
    for (const c of node.children) {
      if (c.type === 'COMPONENT_SET' || (c.type === 'COMPONENT' && c.parent.type !== 'COMPONENT_SET')) {
        racines.push({ id: c.id, nom: c.name, type: c.type, page: page.name, noeud: c });
      } else if ('children' in c) collecterMasters(c, page);
    }
  };
  for (const pg of pagesDS) collecterMasters(pg, pg);

  // 2. Les 9 maquettes de la page `Pages`.
  const pagePages = figma.root.children.find((p) => p.id === '210:325');
  if (!pagePages) throw new Error('photos-census.js: page Pages (210:325) introuvable');
  pagePages.children.forEach((c) => racines.push({ id: c.id, nom: c.name, type: c.type, page: pagePages.name, noeud: c }));

  for (const r of racines) {
    try {
      parcourir(r.noeud, r, '');
    } catch (e) {
      // Une racine non parcourue est un TROU dans le recensement : il se dit (FR-011).
      refus.push({ racine: r.nom, racineId: r.id, motif: String((e && e.message) || e) });
    }
  }

  // 3. Les octets, par imageHash DISTINCT (une même image peut servir à plusieurs
  //    endroits — on ne la lit qu'une fois).
  const octetsParHash = {};
  if (avecOctets) {
    const hashes = [];
    for (const p of photos) if (p.imageHash && hashes.indexOf(p.imageHash) === -1) hashes.push(p.imageHash);
    for (const h of hashes) {
      try {
        const img = figma.getImageByHash(h);
        if (!img) { octetsParHash[h] = { refus: 'getImageByHash a rendu null' }; continue; }
        const bytes = await img.getBytesAsync();
        // base64 sans dépendance : le sandbox n'a ni Buffer ni btoa fiable sur Uint8Array.
        const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let s = '';
        for (let i = 0; i < bytes.length; i += 3) {
          const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
          s += B64[b0 >> 2];
          s += B64[((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4)];
          s += b1 === undefined ? '=' : B64[((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6)];
          s += b2 === undefined ? '=' : B64[b2 & 63];
        }
        octetsParHash[h] = { taille: bytes.length, base64: s };
      } catch (e) {
        // Octets illisibles ⇒ `non-verifiable` côté verdict, jamais un succès muet.
        octetsParHash[h] = { refus: String((e && e.message) || e) };
      }
    }
  }

  const rapport = {
    schemaVersion: 1,
    nom: nom,
    fileKey: figma.fileKey,
    fileName: figma.root.name,
    receveurNonce: health.nonce,
    racinesParcourues: racines.length,
    photos: photos,
    octetsParHash: octetsParHash,
    refus: refus,
  };

  const r = await fetch('http://localhost:' + port + '/json?name=' + encodeURIComponent(nom), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rapport),
  });
  if (!r.ok) throw new Error('photos-census.js: POST refusé — HTTP ' + r.status);

  // Résumé COMPACT : les octets ne transitent jamais par un résultat d'outil.
  const parRacine = {};
  for (const p of photos) parRacine[p.racine] = (parRacine[p.racine] || 0) + 1;
  const hashesDistincts = Object.keys(octetsParHash);
  return {
    nom: nom,
    poste: true,
    racinesParcourues: racines.length,
    photos: photos.length,
    porteurs: {
      master: photos.filter((p) => p.porteur === 'master').length,
      instanceOverride: photos.filter((p) => p.porteur === 'instance-override').length,
    },
    racinesPorteuses: Object.keys(parRacine).length,
    parRacine: parRacine,
    hashesDistincts: hashesDistincts.length,
    octetsIllisibles: hashesDistincts.filter((h) => octetsParHash[h].refus).length,
    refus: refus,
  };
})()
