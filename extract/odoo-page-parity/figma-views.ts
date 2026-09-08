/**
 * Les VUES Figma de référence, par la REST API — en LECTURE SEULE. Spec 037, T048.
 *
 * Deux appels, et rien d'autre :
 *   · `GET /v1/images/<file>?ids=…&format=png&scale=1` — la vue, à l'échelle 1,
 *     la même que le DPR 1 de la capture Odoo. Exporter à 2× puis réduire
 *     rééchantillonnerait le texte et fabriquerait de la différence.
 *   · `GET /v1/files/<file>/nodes?ids=…&depth=1` — les BOÎTES des enfants de la
 *     vue, pour le diagnostic section par section. `depth=1` suffit : on ne veut
 *     que le premier niveau, et descendre coûterait des mégaoctets par page.
 *
 * Rien n'est fabriqué. Une vue de mauvaise largeur ou introuvable rend un
 * `impossible` NOMMÉ (FR-017) : la campagne préfère un trou qui se voit à un
 * chiffre qui rassure.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { figmaRestGet } from '../figma/rest/fetch.js';
import type { Boite } from './types.js';

export interface VueExportee {
  readonly png: PNG;
  readonly octets: Buffer;
  readonly largeur: number;
  readonly hauteur: number;
  /** Les enfants directs de la vue, dans l'ordre du document. */
  readonly enfants: readonly Boite[];
}

export class MesureImpossible extends Error {
  constructor(readonly raison: string) { super(raison); this.name = 'MesureImpossible'; }
}

/** Le jeton de lecture. Absent : on le DIT, on ne mesure pas à moitié. */
export function jetonFigma(env: NodeJS.ProcessEnv = process.env): string {
  const t = env.FIGMA_TOKEN;
  if (!t) {
    throw new MesureImpossible(
      'FIGMA_TOKEN absent — la vue de référence ne peut pas être exportée (mesure impossible, pas échouée)',
    );
  }
  return t;
}

interface NoeudRest {
  name?: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number } | null;
  children?: NoeudRest[];
}

/**
 * Exporte UNE vue et relève les boîtes de ses enfants.
 *
 * `largeurAttendue` est celle du viewport que la page Odoo reçoit : si la vue
 * n'a pas cette largeur, ce n'est pas la bonne vue, et la comparer produirait
 * un score qui n'a aucun sens.
 */
export async function exporterVue(
  fileKey: string, nodeId: string, largeurAttendue: number, token: string,
): Promise<VueExportee> {
  const noeuds = (await figmaRestGet(
    `/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=1`, token,
  )) as { nodes: Record<string, { document?: NoeudRest } | null> };
  const doc = noeuds.nodes?.[nodeId]?.document;
  if (!doc) throw new MesureImpossible(`vue introuvable — le nœud ${nodeId} n'existe plus dans le fichier`);
  const boite = doc.absoluteBoundingBox;
  if (!boite) throw new MesureImpossible(`vue sans boîte — le nœud ${nodeId} n'a pas de cadre mesurable`);
  if (Math.round(boite.width) !== largeurAttendue) {
    throw new MesureImpossible(
      `vue de mauvaise largeur — ${nodeId} mesure ${Math.round(boite.width)} px, ${largeurAttendue} attendus`,
    );
  }

  const enfants: Boite[] = (doc.children ?? [])
    .filter((c) => c.absoluteBoundingBox)
    .map((c) => ({
      nom: c.name ?? '(sans nom)',
      y: Math.round((c.absoluteBoundingBox as { y: number }).y - boite.y),
      h: Math.round((c.absoluteBoundingBox as { height: number }).height),
    }));

  const images = (await figmaRestGet(
    `/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=1`, token,
  )) as { err: string | null; images: Record<string, string | null> };
  if (images.err) throw new MesureImpossible(`export PNG refusé par Figma : ${images.err}`);
  const url = images.images[nodeId];
  if (!url) throw new MesureImpossible(`export PNG vide — Figma n'a pas rendu ${nodeId}`);

  const res = await fetch(url);
  if (!res.ok) throw new MesureImpossible(`téléchargement de la vue en échec (HTTP ${res.status})`);
  const octets = Buffer.from(await res.arrayBuffer());
  const png = PNG.sync.read(octets);
  if (png.width !== largeurAttendue) {
    throw new MesureImpossible(
      `PNG de mauvaise largeur — ${png.width} px exportés, ${largeurAttendue} attendus`,
    );
  }
  return { png, octets, largeur: png.width, hauteur: png.height, enfants };
}

// ---------------------------------------------------------------------------
// La voie du PONT — décision owner 2026-09-08
// ---------------------------------------------------------------------------

/**
 * Lit une vue déjà exportée par le PONT figma-console dans le cache.
 *
 * L'owner a tranché le 2026-09-08 : ce poste n'a pas de `FIGMA_TOKEN`, les vues
 * passent donc par le pont (`bridge/export-vues.js` → `receiver.mjs` → cache).
 * L'instrument, lui, ne change pas de règles : il exige toujours la BONNE
 * largeur, et il refuse toujours en nommant.
 *
 * Écart au plan assumé, et gardé : l'export par le pont a un piège daté (le
 * 2026-09-04, `exportAsync` sur un nœud IMAGE a rendu 149 octets). Trois portes
 * le ferment — la magie PNG au receveur, le refus « export minuscule » dans le
 * bac à sable, et le contrôle de largeur ci-dessous.
 */
export function lireVueDuCache(
  dir: string, page: string, largeur: number,
): VueExportee {
  const base = path.join(dir, `${page}-${largeur}`);
  if (!existsSync(`${base}.png`) || !existsSync(`${base}.json`)) {
    throw new MesureImpossible(
      `vue non exportée — ${path.basename(base)}.png/.json absents du cache du pont (relancer l'export de cette page)`,
    );
  }
  const octets = readFileSync(`${base}.png`);
  const png = PNG.sync.read(octets);
  if (png.width !== largeur) {
    throw new MesureImpossible(
      `vue de mauvaise largeur — ${png.width} px exportés, ${largeur} attendus`,
    );
  }
  const meta = JSON.parse(readFileSync(`${base}.json`, 'utf8')) as {
    nodeId: string; enfants: Boite[];
  };
  return { png, octets, largeur: png.width, hauteur: png.height, enfants: meta.enfants ?? [] };
}
