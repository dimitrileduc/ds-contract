// Receveur des VUES Figma exportées par le pont. Spec 037 (décision owner 2026-09-08).
//
// ── Pourquoi le pont plutôt que la REST ─────────────────────────────────────
// Le plan (D8) exportait les 36 vues par `GET /v1/images?scale=1`, qui exige
// `FIGMA_TOKEN`. Le jeton n'est pas disponible sur ce poste ; l'owner a tranché
// le 2026-09-08 : passer par le pont figma-console. Le PIÈGE connu est nommé et
// gardé — le 2026-09-04, `exportAsync` sur un nœud IMAGE avait rendu 149 octets.
// Ici on exporte des FRAMES, et trois gardes ferment le cas : le receveur refuse
// tout corps qui n'est pas un PNG (magie), le script de pont refuse un export
// vide, et l'instrument refuse une vue dont la largeur ne fait pas celle du
// viewport attendu.
//
// Transport : le sandbox du plugin a `fetch()` et son manifeste autorise
// http://localhost:9223-9232 — les octets vont donc DIRECTEMENT du plugin au
// disque, sans transiter par un résultat d'outil (leçon de la spec 003 : les
// outils de capture MCP rabotent en silence à 1568 px).
//
// Usage : node extract/odoo-page-parity/receiver.mjs <outDir> [port]
//   POST /png?name=<page>-<largeur>    PNG → <outDir>/<name>.png (magie vérifiée)
//   POST /json?name=<page>-<largeur>   boîtes des enfants → <outDir>/<name>.json
//   POST /bin?name=img-<hash>          octets d'ORIGINE d'une photo (JPEG/PNG/WebP,
//                                      type reconnu aux octets) → <outDir>/<name>.<ext>
//   GET  /health                       { instrument, outDir, nonce, startedAt }
//   GET  /list                         ce qui est arrivé
//
// Port 9230 par défaut : le SEUL libre de la plage au 2026-09-08 (9223 = MCP
// actif, 9224-9229 et 9231-9232 = autres serveurs figma-console). Hors plage, le
// manifeste du plugin bloque le `fetch` et l'échec ressemble à « le transport est
// impossible » alors que c'est le port qui est faux.
import { createServer } from 'node:http';
import { writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const outDir = process.argv[2];
const port = Number(process.argv[3] ?? 9230);
if (!outDir) {
  console.error('usage: node extract/odoo-page-parity/receiver.mjs <outDir> [port]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const identity = {
  instrument: 'odoo-page-parity',
  outDir: path.resolve(outDir),
  nonce: randomBytes(8).toString('hex'),
  startedAt: new Date().toISOString(),
};

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Le type d'une IMAGE SOURCE, reconnu aux octets et jamais au nom de fichier.
 *  Les photos d'origine d'un fichier Figma sont le plus souvent des JPEG : le
 *  puits `/png` les refuse (à raison — c'est sa garde), `/bin` les accepte en
 *  NOMMANT leur type, et refuse tout ce qu'il ne reconnaît pas. */
function typeImage(b) {
  if (b.length >= 8 && b.subarray(0, 8).equals(PNG_MAGIC)) return 'png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length >= 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}
const nom = (v) => (v ?? 'sans-nom').replace(/[^A-Za-z0-9._-]/g, '_');

const lire = (req) => new Promise((res) => {
  const parts = [];
  req.on('data', (d) => parts.push(d));
  req.on('end', () => res(Buffer.concat(parts)));
});

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(identity));
    return;
  }
  if (req.method === 'POST' && (url.pathname === '/png' || url.pathname === '/json')) {
    const name = nom(url.searchParams.get('name'));
    const body = await lire(req);
    const estPng = url.pathname === '/png';
    if (estPng && (body.length < 8 || !body.subarray(0, 8).equals(PNG_MAGIC))) {
      // Un refus est un reçu NOMMÉ, jamais un fichier corrompu rangé en silence.
      console.error(`REFUS ${name}: le corps n'est pas un PNG (${body.length} octets) — rien écrit`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, name, refus: 'pas-un-png', bytes: body.length }));
      return;
    }
    if (!estPng) {
      try { JSON.parse(body.toString('utf8')); } catch {
        console.error(`REFUS ${name}: le corps n'est pas du JSON (${body.length} octets) — rien écrit`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, name, refus: 'pas-du-json', bytes: body.length }));
        return;
      }
    }
    const fichier = path.join(outDir, `${name}.${estPng ? 'png' : 'json'}`);
    writeFileSync(fichier, body);
    console.log(`reçu ${path.basename(fichier)} (${body.length} octets)`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, name, bytes: body.length }));
    return;
  }
  if (req.method === 'POST' && url.pathname === '/bin') {
    const name = nom(url.searchParams.get('name'));
    const body = await lire(req);
    const type = typeImage(body);
    if (!type) {
      console.error(`REFUS ${name}: octets d'un type d'image inconnu (${body.length} octets) — rien écrit`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, name, refus: 'type-inconnu', bytes: body.length }));
      return;
    }
    const fichier = path.join(outDir, `${name}.${type}`);
    writeFileSync(fichier, body);
    console.log(`reçu ${path.basename(fichier)} (${body.length} octets, ${type})`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, name, bytes: body.length, type }));
    return;
  }
  if (req.method === 'GET' && url.pathname === '/list') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readdirSync(outDir).map((f) => ({ name: f, bytes: statSync(path.join(outDir, f)).size }))));
    return;
  }
  res.writeHead(404);
  res.end('not found');
});

// Deux binds SPÉCIFIQUES, v4 ET v6 (leçon 016) : macOS résout `localhost` en
// [::1] d'abord, et un serveur qui prend [::1]:<port> ensuite gagne le trafic
// IPv6 même face à un bind générique. Tenir les deux rend le squatteur suivant
// EADDRINUSE au lieu de nous voler les octets en silence.
server.listen(port, '127.0.0.1', () =>
  console.log(`odoo-page-parity receveur sur http://localhost:${port} → ${outDir} (nonce ${identity.nonce})`),
);
const serverV6 = createServer(server.listeners('request')[0]);
serverV6.listen(port, '::1');
