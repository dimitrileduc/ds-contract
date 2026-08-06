// serve-scripts.mjs — sert les scripts GÉNÉRÉS de figma-sync/ au sandbox du plugin.
//
// Pourquoi cet outil existe (016, lot U1a) :
//   `figma_execute` doit recevoir le TEXTE du script à exécuter. Les scripts générés
//   pèsent de 20 à 200 Ko (`01-tokens.js` : 38 Ko) — les retranscrire dans l'appel
//   d'outil serait coûteux et, surtout, ouvrirait la porte à une divergence entre le
//   fichier généré et ce qui s'exécute réellement sur le fichier client. Or la garantie
//   du projet est que le canvas est produit par le script généré, EXÉCUTÉ TEL QUEL
//   (constitution §I — aucune IA dans le chemin de génération).
//
//   Le receveur page-parity sert déjà des fichiers (`GET /file`), mais il est
//   **jailé sur son propre dossier** (`extract/figma/page-parity/`) — par conception,
//   et cet instrument est réutilisé TEL QUEL par 016 : on ne l'élargit pas.
//
// Ce que fait cet outil, et rien d'autre :
//   GET /script?name=<fichier.js>  → le texte du script, lu dans figma-sync/
//   GET /health                    → { instrument: "serve-scripts", root, nonce }
//
// Garanties :
//   · LECTURE SEULE — aucune écriture, aucune mutation, aucun état.
//   · Jailé sur figma-sync/ ; refuse tout chemin qui en sort ET tout sous-dossier.
//   · N'accepte QUE les fichiers .js du premier niveau — jamais un chemin composé.
//   · Refus NOMMÉS (400/404 avec motif), jamais un corps vide qui passerait pour un
//     script valide : un `eval('')` réussirait en silence et ne ferait rien —
//     exactement le genre de succès creux que ce dépôt refuse.
//   · Écoute sur 127.0.0.1 ET [::1] : le sandbox Figma résout `localhost` en IPv6
//     d'abord sur macOS, alors qu'un bind IPv4 seul le rendrait injoignable
//     (c'est le défaut relevé en O-2 sur receiver.mjs).
//
// Port : 9230 par défaut — dans la plage autorisée par le manifest du plugin
// (http://localhost:9223 … 9232), et le seul resté libre au relevé d'ouverture.
//
// Usage :
//   node specs/016-canvas-vrai/tools/serve-scripts.mjs [port]
//   puis, dans figma_execute :
//     const src = await (await fetch('http://localhost:9230/script?name=01-tokens.js')).text();
//     return await eval(src);

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

// Racine paramétrable : `figma-sync` par défaut (les scripts générés), mais 016 doit
// aussi servir `parity/extract-figma.plugin.js` — même forme, même besoin de fidélité.
const port = Number(process.argv[2] ?? 9230);
const root = path.resolve(process.cwd(), process.argv[3] ?? 'figma-sync');
const identity = { instrument: 'serve-scripts', root, nonce: randomBytes(8).toString('hex'), startedAt: new Date().toISOString() };

const refus = (res, code, motif) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, refus: motif }));
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);

  // CORS — indispensable : le sandbox du plugin Figma est une origine étrangère.
  // Sans ces en-têtes le fetch échoue en `Failed to fetch`, sans autre indice —
  // c'est ce qui a fait rater la première tentative du lot U1a (O-5).
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(identity));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/script') {
    const name = url.searchParams.get('name') ?? '';
    // Un nom simple, .js, sans séparateur : un script généré vit à plat dans figma-sync/.
    if (!/^[A-Za-z0-9._-]+\.js$/.test(name)) {
      return refus(res, 400, `nom invalide: ${JSON.stringify(name)} — attendu un fichier .js du premier niveau de figma-sync/`);
    }
    const resolved = path.resolve(root, name);
    if (path.dirname(resolved) !== root) {
      return refus(res, 400, 'chemin hors de figma-sync/');
    }
    let data;
    try {
      data = readFileSync(resolved, 'utf8');
    } catch {
      return refus(res, 404, `script introuvable: ${name}`);
    }
    if (!data.trim()) {
      // Un script vide s'évaluerait sans erreur et ne ferait rien : refus explicite.
      return refus(res, 422, `script vide: ${name}`);
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Script-Bytes': String(Buffer.byteLength(data)) });
    res.end(data);
    return;
  }

  refus(res, 404, `route inconnue: ${req.method} ${url.pathname}`);
});

// Deux binds SPÉCIFIQUES, pas un wildcard. Leçon du 2026-08-06 (2e squat) : un
// serveur MCP né 6 s après nous a bindé [::1]:<port> SPÉCIFIQUE par-dessus notre
// wildcard *:<port> — et le routage donne la priorité au bind spécifique : le
// sandbox lui était routé, nous répondions dans le vide. En tenant nous-mêmes
// [::1] ET 127.0.0.1 en spécifique, le prochain squatteur prend EADDRINUSE et
// passe au port suivant. C'est la seule position imprenable de la plage.
const annonce = () => console.log(`serve-scripts on http://localhost:${port} → ${root} (nonce ${identity.nonce})`);
server.listen(port, '::1', annonce);
const serverV4 = createServer(server.listeners('request')[0]);
serverV4.listen(port, '127.0.0.1');
