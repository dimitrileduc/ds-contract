// photos-restore.js — repose les photos d'instance effondrées, par POSITION.
//
// À EXÉCUTER DANS LE BAC À SABLE FIGMA, via le pont figma-console (`figma_execute`).
//
// ENTRÉE  : le plan de restauration de 016,
//           specs/016-canvas-vrai/proofs/repose/photos-instances.json
//           (14 sections, 97 photos, source épinglée à la version 2384251202054787848),
//           passé au script via `globalThis.__dsc_plan`.
// SORTIE  : un rapport JSON — par hôte : déjà bonne / reposée / introuvable / refusée.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA RÉSERVE, NOMMÉE AVANT DE S'EN SERVIR (registre 017, D-017-PLAN-62-SANS-DRAPEAU)
//
// Le plan liste les **97** photos du relevé SANS drapeau machine distinguant
// « déjà bonne » de « à reposer ». La répartition 62/35 ne vit que dans le message
// du commit 51cab06 — elle n'est pas re-dérivable du JSON.
//
// Ce script ne fait donc PAS confiance au plan sur ce point : il RELÈVE l'état
// courant de chaque emplacement et ne repose QUE là où le hash diffère. Une photo
// déjà correcte est comptée `deja-bonne` et laissée intacte. C'est plus lent d'un
// parcours, et c'est la seule façon de ne pas écraser un état plus récent que le
// plan.
//
// ─────────────────────────────────────────────────────────────────────────────
// DEUX RÈGLES QUI NE SE NÉGOCIENT PAS
//
// 1. §X — RIEN N'EST ÉCRIT AVANT D'AVOIR TOUT LU. Le script fait une passe de
//    relevé complète sur les 14 hôtes, décide, PUIS écrit. En `--dry-run`
//    (défaut), il ne fait que la première moitié.
// 2. Le tableau `fills` est RÉAFFECTÉ, jamais muté en place : dans le vrai Figma
//    `node.fills` est readonly et une mutation en place est ignorée EN SILENCE.
//    (Le faux-Figma l'accepte encore — défaut orthogonal consigné au registre
//    sous D-017-MOCK-FILLS-EN-PLACE.)
//
// Le lotissement est OBLIGATOIRE, pas une optimisation : le pont sature sur un
// parcours global (≈ 5 350 nœuds mesurés). Passer `__dsc_lot` pour ne traiter
// qu'une tranche des 14 gestes.

(async () => {
  const plan = globalThis.__dsc_plan;
  if (!plan || !Array.isArray(plan.gestes)) {
    throw new Error('photos-restore: globalThis.__dsc_plan manquant (le plan de 016 doit être injecté)');
  }
  const ECRIRE = globalThis.__dsc_ecrire === true; // défaut : relevé seul
  const LOT = globalThis.__dsc_lot || null;        // [debut, fin) sur plan.gestes

  await figma.loadAllPagesAsync();

  // Les nœuds porteurs d'image d'un hôte, DANS L'ORDRE DU DOCUMENT — la même
  // clé que le moteur : la position, jamais le nom de calque (§VIII).
  const porteurs = (racine) => {
    const out = [];
    const descendre = (n, chemin) => {
      const fills = Array.isArray(n.fills) ? n.fills : [];
      const i = fills.findIndex((f) => f && f.type === 'IMAGE');
      if (i >= 0) out.push({ node: n, chemin, indexPaint: i, hash: fills[i].imageHash || null, nom: n.name });
      const kids = n.children || [];
      for (let k = 0; k < kids.length; k++) descendre(kids[k], chemin === '' ? String(k) : chemin + '/' + k);
    };
    descendre(racine, '');
    return out;
  };

  const gestes = LOT ? plan.gestes.slice(LOT[0], LOT[1]) : plan.gestes;
  const rapport = { ecrire: ECRIRE, lot: LOT, hotes: [], totaux: { dejaBonne: 0, aReposer: 0, reposee: 0, introuvable: 0, refus: 0 } };

  // ── PASSE 1 — RELEVER ET DÉCIDER. Aucune écriture ici. ────────────────────
  const decisions = [];
  for (const g of gestes) {
    const hote = await figma.getNodeByIdAsync(g.hostId);
    if (!hote) {
      rapport.hotes.push({ hostId: g.hostId, maquette: g.maquette, section: g.section, verdict: 'hote-introuvable' });
      rapport.totaux.refus++;
      continue;
    }
    const cibles = porteurs(hote);
    const lignes = [];
    for (let i = 0; i < g.photos.length; i++) {
      const attendue = g.photos[i];
      const cible = cibles[i]; // l'ordre du plan EST l'ordre du document
      if (!cible) {
        lignes.push({ ordre: i, nom: attendue.nom, hash: attendue.hash, etat: 'introuvable' });
        rapport.totaux.introuvable++;
        continue;
      }
      if (cible.hash === attendue.hash) {
        lignes.push({ ordre: i, chemin: cible.chemin, hash: attendue.hash, etat: 'deja-bonne' });
        rapport.totaux.dejaBonne++;
        continue;
      }
      lignes.push({ ordre: i, chemin: cible.chemin, nomCalque: cible.nom, hashActuel: cible.hash, hashAttendu: attendue.hash, scaleMode: attendue.scaleMode || 'FILL', etat: 'a-reposer' });
      rapport.totaux.aReposer++;
      decisions.push({ node: cible.node, indexPaint: cible.indexPaint, hash: attendue.hash, scaleMode: attendue.scaleMode || 'FILL' });
    }
    rapport.hotes.push({ hostId: g.hostId, maquette: g.maquette, section: g.section, porteursTrouves: cibles.length, photosAttendues: g.photos.length, lignes });
  }

  // Une photo dont le hash n'existe plus dans le fichier est NON VÉRIFIABLE,
  // jamais « reposée » : on refuse plutôt que d'écrire un hash mort.
  for (const d of decisions) {
    if (!figma.getImageByHash(d.hash)) {
      d.refus = 'imageHash absent du fichier — refus plutôt qu\'un hash mort';
      rapport.totaux.refus++;
    }
  }

  if (!ECRIRE) {
    rapport.note = 'RELEVÉ SEUL — aucune écriture. Relancer avec globalThis.__dsc_ecrire = true pour reposer.';
    return rapport;
  }

  // ── PASSE 2 — ÉCRIRE. Rien avant cette ligne n'a muté quoi que ce soit. ───
  for (const d of decisions) {
    if (d.refus) continue;
    const fills = Array.isArray(d.node.fills) ? d.node.fills.map((f) => ({ ...f })) : [];
    fills[d.indexPaint] = { ...fills[d.indexPaint], type: 'IMAGE', imageHash: d.hash, scaleMode: d.scaleMode };
    d.node.fills = fills; // RÉAFFECTATION, jamais mutation en place
    rapport.totaux.reposee++;
  }
  return rapport;
})();
