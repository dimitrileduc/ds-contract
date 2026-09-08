// export-vues.js — les vues Figma d'UNE page → PNG + boîtes, sur le disque.
// Spec 037, volet « pont » (décision owner 2026-09-08 : pas de FIGMA_TOKEN ici).
//
// S'exécute DANS le bac à sable du plugin, par `figma_execute` du pont
// figma-console : JS simple, aucun import, aucune API Node ; le global `figma`
// et `fetch()` sont disponibles (manifeste : http://localhost:9223-9232).
//
// Entrée (appel `figma_execute` précédent) :
//   globalThis.__pqr037 = { page, vues: [{ largeur, nodeId }], port, nonce }
//
// Sortie : un résumé PETIT (aucun octet d'image dans le résultat d'outil) —
//   { page, vues: [{ largeur, nodeId, w, h, octets, statut, refus }] }
//
// LECTURE SEULE : ce script n'écrit rien dans le document. Il exporte, il relève
// les boîtes des enfants directs, il envoie. Un export vide ou refusé est
// NOMMÉ et n'est jamais compté comme une vue (§V).
//
// Le piège gardé : le 2026-09-04, `exportAsync` sur un nœud IMAGE avait rendu
// 149 octets. Ici on exporte des FRAMES, et le refus « export minuscule » ferme
// quand même le cas — un PNG de vue fait des centaines de kilooctets.
(async () => {
  const input = globalThis.__pqr037 || {};
  const page = input.page;
  const vues = input.vues || [];
  const port = input.port || 9230;
  if (!page || vues.length === 0) {
    throw new Error('export-vues.js: globalThis.__pqr037 = { page, vues: [{largeur,nodeId}], port, nonce } requis');
  }

  // Identité du puits AVANT le premier octet : un receveur mort d'une session
  // précédente qui squatte le port avalerait les vues en silence (leçon 003/016).
  let health = null;
  try {
    const hr = await fetch('http://localhost:' + port + '/health');
    health = await hr.json();
  } catch (e) {
    throw new Error('export-vues.js: receveur injoignable sur :' + port + ' — demarrer receiver.mjs (' + String((e && e.message) || e) + ')');
  }
  if (!health || health.instrument !== 'odoo-page-parity') {
    throw new Error('export-vues.js: le process sur :' + port + " n'est PAS le receveur odoo-page-parity — identite " + JSON.stringify(health));
  }
  if (!input.nonce) throw new Error('export-vues.js: input.nonce requis (le nonce imprime par receiver.mjs)');
  if (health.nonce !== input.nonce) {
    throw new Error('export-vues.js: nonce ' + health.nonce + ' != attendu ' + input.nonce + ' — mauvaise session, octets NON envoyes');
  }

  await figma.loadAllPagesAsync();
  const out = [];
  for (const v of vues) {
    const nom = page + '-' + v.largeur;
    const res = { largeur: v.largeur, nodeId: v.nodeId, w: 0, h: 0, octets: 0, statut: 'ok', refus: null };
    const node = await figma.getNodeByIdAsync(v.nodeId);
    if (!node) {
      res.statut = 'introuvable';
      res.refus = 'vue introuvable — le noeud ' + v.nodeId + " n'existe plus dans le fichier";
      out.push(res);
      continue;
    }
    res.w = Math.round(node.width);
    res.h = Math.round(node.height);

    // Les boîtes des enfants DIRECTS, en coordonnees relatives au haut de la
    // vue : c'est tout ce dont le diagnostic section par section a besoin.
    const enfants = (node.children || []).map(function (c) {
      return { nom: c.name, y: Math.round(c.y), h: Math.round(c.height) };
    });

    let bytes = null;
    try {
      bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    } catch (e) {
      res.statut = 'echec';
      res.refus = 'exportAsync: ' + String((e && e.message) || e);
    }
    if (res.statut === 'ok' && (!bytes || bytes.length < 1000)) {
      res.statut = 'vide';
      res.refus = 'export minuscule (' + (bytes ? bytes.length : 0) + ' octets) — une vue pese des centaines de Ko';
    }
    if (res.statut === 'ok') {
      res.octets = bytes.length;
      const rp = await fetch('http://localhost:' + port + '/png?name=' + encodeURIComponent(nom), {
        method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: bytes,
      });
      const ack = await rp.json().catch(function () { return null; });
      if (!rp.ok || !ack || ack.ok !== true || ack.bytes !== bytes.length) {
        res.statut = 'echec';
        res.refus = 'transfert PNG: HTTP ' + rp.status + ' ack=' + JSON.stringify(ack);
      }
    }
    if (res.statut === 'ok') {
      const meta = { page: page, largeur: v.largeur, nodeId: v.nodeId, largeurVue: res.w, hauteurVue: res.h, enfants: enfants };
      const rj = await fetch('http://localhost:' + port + '/json?name=' + encodeURIComponent(nom), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meta),
      });
      if (!rj.ok) { res.statut = 'echec'; res.refus = 'transfert JSON: HTTP ' + rj.status; }
    }
    out.push(res);
  }
  return { page: page, receveur: health.nonce, vues: out };
})()
