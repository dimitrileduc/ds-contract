// bindings-audit.js — relevé des LIAISONS de variables sur les masters (U1b).
//
// Runs INSIDE the Figma plugin sandbox via figma-console (figma_execute).
// STRICTEMENT LECTURE SEULE.
//
// POURQUOI CET INSTRUMENT EXISTE (D2, D3, T056a) :
//   `parity/diff.ts` compare l'EXISTENCE et la VALEUR des variables — il ne lit
//   JAMAIS `boundVariables` (0 occurrence, vérifié). Conséquence directe : un master
//   dont la largeur n'est PAS liée à sa variable est **invisible au différentiel**.
//   La création des 83 variables (U1a) fait donc tomber les acquittements sans rien
//   prouver des liaisons ; c'est ce script, et lui seul, qui dimensionne la population
//   U1b et prouve la seconde moitié de FR-001.
//
// CE QU'IL RELÈVE, par nœud de chaque master :
//   width · height · minWidth · minHeight · maxWidth · maxHeight
//   itemSpacing · counterAxisSpacing
//   paddingLeft · paddingRight · paddingTop · paddingBottom
//   (ce sont exactement les champs que `core/emit-figma-script.ts` sait lier via
//    `fixedWidth.varName` et `spec.bindings`)
//
// La CONFRONTATION à l'attendu se fait côté Node : le sandbox ne peut pas lire les
// scripts générés du dépôt. Ce script fournit l'observé — brut, complet, par position.
//
// Invocation :
//   1. globalThis.__dsc016_input = { port: 9231, expectNonce: "<nonce>", nom: "bindings-audit-avant" }
//   2. figma_execute le texte de ce fichier → POST au receveur, petit résumé en retour.
(async () => {
  const input = globalThis.__dsc016_input || {};
  const port = input.port || 9231;
  const nom = input.nom;
  if (!nom) throw new Error('bindings-audit.js: input requis — { nom, port?, expectNonce? }');

  let health = null;
  try {
    health = await (await fetch('http://localhost:' + port + '/health')).json();
  } catch (e) {
    throw new Error('bindings-audit.js: receveur injoignable sur :' + port + ' — ' + String((e && e.message) || e));
  }
  if (!health || health.instrument !== 'page-parity') {
    throw new Error('bindings-audit.js: le process sur :' + port + " n'est PAS le receveur page-parity — " + JSON.stringify(health));
  }
  if (input.expectNonce && health.nonce !== input.expectNonce) {
    throw new Error('bindings-audit.js: nonce ' + health.nonce + ' != attendu ' + input.expectNonce);
  }

  await figma.loadAllPagesAsync();

  const CHAMPS = [
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'itemSpacing', 'counterAxisSpacing',
    'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
  ];

  // Nom de variable par id, résolu une fois (les relevés citent des NOMS, pas des ids :
  // un id ne se relit pas d'une session à l'autre).
  const nomParId = {};
  for (const v of await figma.variables.getLocalVariablesAsync()) nomParId[v.id] = v.name;

  const bx = (n) => {
    const b = n.absoluteBoundingBox;
    return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null;
  };

  const masters = [];
  const refus = [];

  const releverNoeud = (n, chemin) => {
    const bv = n.boundVariables || {};
    const liaisons = {};
    for (const champ of CHAMPS) {
      const val = bv[champ];
      if (!val) continue;
      const id = Array.isArray(val) ? (val[0] || {}).id : val.id;
      if (id) liaisons[champ] = nomParId[id] || ('(variable étrangère ' + id + ')');
    }
    // Les valeurs géométriques VIVES, même non liées : c'est ce qui permet de dire
    // « ce nœud vaut 363,5 mais ne le tient d'aucune variable » — le trou que
    // le différentiel ne voit pas.
    const geo = {};
    for (const champ of ['width', 'height', 'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) {
      if (typeof n[champ] === 'number') geo[champ] = n[champ];
    }
    const aQuelqueChose = Object.keys(liaisons).length > 0 || Object.keys(geo).length > 0;
    return aQuelqueChose
      ? {
          cheminPosition: chemin, nom: n.name, type: n.type,
          bounds: bx(n),
          layoutMode: n.layoutMode || null,
          layoutSizingHorizontal: n.layoutSizingHorizontal || null,
          layoutSizingVertical: n.layoutSizingVertical || null,
          liaisons, geometrie: geo,
        }
      : null;
  };

  const parcourir = (n, chemin, acc) => {
    const l = releverNoeud(n, chemin);
    if (l) acc.push(l);
    if ('children' in n) n.children.forEach((c, i) => parcourir(c, chemin === '' ? String(i) : chemin + '/' + i, acc));
  };

  const pagesDS = figma.root.children.filter((p) => /^DS · /.test(p.name));
  const racines = [];
  const collecter = (node, page) => {
    for (const c of node.children) {
      if (c.type === 'COMPONENT_SET' || (c.type === 'COMPONENT' && c.parent.type !== 'COMPONENT_SET')) {
        racines.push({ noeud: c, page: page.name });
      } else if ('children' in c) collecter(c, page);
    }
  };
  for (const pg of pagesDS) collecter(pg, pg);

  for (const r of racines) {
    try {
      const noeuds = [];
      parcourir(r.noeud, '', noeuds);
      masters.push({
        master: r.noeud.name, id: r.noeud.id, type: r.noeud.type, key: r.noeud.key || null,
        page: r.page, bounds: bx(r.noeud), noeuds,
        totalLiaisons: noeuds.reduce((n, x) => n + Object.keys(x.liaisons).length, 0),
      });
    } catch (e) {
      // Un master non relevé est un TROU : il se dit (FR-011), jamais un total muet.
      refus.push({ master: r.noeud.name, id: r.noeud.id, motif: String((e && e.message) || e) });
    }
  }

  const rapport = {
    schemaVersion: 1, nom, fileKey: figma.fileKey, receveurNonce: health.nonce,
    champsReleves: CHAMPS, masters, refus,
  };
  const rep = await fetch('http://localhost:' + port + '/json?name=' + encodeURIComponent(nom), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rapport),
  });
  if (!rep.ok) throw new Error('bindings-audit.js: POST refusé — HTTP ' + rep.status);

  const total = masters.reduce((n, m) => n + m.totalLiaisons, 0);
  const avec = masters.filter((m) => m.totalLiaisons > 0);
  return {
    nom, poste: true,
    masters: masters.length,
    mastersAvecAuMoinsUneLiaison: avec.length,
    mastersSansAucuneLiaison: masters.length - avec.length,
    totalLiaisons: total,
    top: avec.sort((a, b) => b.totalLiaisons - a.totalLiaisons).slice(0, 10).map((m) => ({ master: m.master, liaisons: m.totalLiaisons })),
    refus,
  };
})()
