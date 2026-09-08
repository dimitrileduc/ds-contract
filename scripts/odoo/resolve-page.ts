/**
 * Le RÉSOLVEUR de descripteurs de page. Spec 037, tâches T013–T017 (D1, D2, D3).
 *
 * ── Ce qu'il fait, et pourquoi il vit ICI et pas dans le composeur ───────────
 * Un descripteur de page peut désormais reprendre un contenu COMMUN par
 * référence (`{"commun": "devis"}`) et le surcharger CHAMP PAR CHAMP, et poser
 * une DESTINATION sur chaque bouton (`"links": {"devis-cta": "/contactez-nous"}`).
 * Ce module transforme ce descripteur en un descripteur RÉSOLU — exactement le
 * format que `compose_page.py` lisait déjà, sans `commun` ni `surcharge`.
 *
 * `compose_page.py` tourne DANS le conteneur : il n'a pas `commun/` sous la main,
 * et rien de ce qui s'y passe n'est vérifiable sans Docker. Résoudre côté hôte
 * garde le composeur petit (une seule addition, `set_link`) et rend la
 * résolution ÉVALUABLE hors Docker — déterminisme (C1) et refus (C2).
 *
 * ── Ce qu'il REFUSE, toujours en nommant ────────────────────────────────────
 * Un refus dit le fichier, la section, la clé ou la part, et la valeur. Il ne
 * corrige jamais, il n'invente jamais. Sept familles (T008) :
 *   1. `component` et `commun` ensemble          5. destination hors grammaire
 *   2. `commun` inconnu                          6. `component` inconnu du module
 *   3. clé de surcharge orpheline                7. descripteur de `pages/` non classé
 *   4. copie locale d'un bloc commun (SC-004)
 *
 * Une destination ABSENTE n'est pas un refus : le bouton garde `href="#"` (le
 * comportement d'aujourd'hui) et part au REGISTRE DES RESTES — ce qui reste à
 * trancher s'écrit, il ne se devine pas (§V).
 *
 * Usage :
 *   npm run odoo:pages:check [-- --json]      les 9 pages du site + registre
 *   npx tsx scripts/odoo/resolve-page.ts <page> [--out fichier.json]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { canonicalJson, repoPath, repoRelative } from './lib/canonical.js';
import { runAsCli } from './lib/cli.js';
import {
  COMMUN_DIR, PAGES_DIR, SITE_PAGES, URLS_DU_SITE,
  descripteurPath, descripteursNonClasses, pageParNom,
} from './lib/pages.js';

// ---------------------------------------------------------------------------
// Le vocabulaire du descripteur
// ---------------------------------------------------------------------------

/** Les trois blocs communs, écrits en dur — jamais dérivés du contenu de
 *  `commun/`, qui porte aussi `destinations-externes.json` (data-model §3). */
export const BLOCS_COMMUNS = ['devis', 'reassurances', 'avis-google'] as const;
export type BlocCommun = (typeof BLOCS_COMMUNS)[number];

/** Le composant de chaque bloc commun. Une section PROPRE qui écrit l'un d'eux
 *  en clair est refusée : le commun est obligatoire (SC-004). */
export const COMPOSANTS_COMMUNS: Record<BlocCommun, string> = {
  devis: 's_pqr_devis',
  reassurances: 's_pqr_reassurances',
  'avis-google': 's_pqr_google_reviews_section',
};

/** Clés de section que `compose_page.py` sait lire, plus la neuve `links`. */
export const CLES_COMPOSEUR = [
  'set_html', 'set_button', 'images', 'links', 'variant', 'disposition',
  'cards', 'reviews', 'rows', 'remove_class', 'add_class', 'set_empty',
] as const;

/** Fusion par PART : la page ne réécrit que la part qu'elle change (D1). */
const CLES_DICT_PAR_PART = new Set(['set_html', 'set_button', 'images', 'links']);
/** Fusion par UNION : des listes de classes ou de parts, pas du contenu. */
const CLES_UNION = new Set(['remove_class', 'add_class', 'set_empty']);
/** Remplacées ENTIÈRES : une liste est UN champ (D1, alternative (b) rejetée). */
const CLES_LISTE = new Set(['cards', 'reviews', 'rows']);

// ---------------------------------------------------------------------------
// Refus
// ---------------------------------------------------------------------------

export interface Refus {
  readonly fichier: string;
  readonly section: number | null;
  readonly cle: string;
  readonly valeur: string;
  readonly raison: string;
}

/** Un refus se lit par son MESSAGE. La forme est celle de contracts/README. */
export const formatRefus = (r: Refus): string =>
  `refus: ${r.fichier}${r.section === null ? '' : ` › section ${r.section}`}`
  + ` › ${r.cle} : ${r.valeur} — ${r.raison}`;

export class RefusError extends Error {
  constructor(readonly refus: Refus) { super(formatRefus(refus)); this.name = 'RefusError'; }
}

const refuser = (r: Refus): never => { throw new RefusError(r); };

// ---------------------------------------------------------------------------
// Ce que le MODULE sait faire — lu dans components.xml, jamais recopié
// ---------------------------------------------------------------------------

export const COMPONENTS_XML = repoPath(
  'integrations', 'odoo', 'addons', 'piqueray_ds', 'views', 'components.xml',
);

interface Gabarit {
  readonly id: string;
  /** Les gabarits que celui-ci appelle (`t-call="piqueray_ds.X"`). */
  readonly appels: readonly string[];
  /** Ce gabarit est-il la carte d'une collection (marqueur du contrat de DOM) ? */
  readonly estCarte: boolean;
  /** Parts qui portent un lien, DANS ce gabarit seul. */
  readonly partsLien: readonly string[];
  /** Parts de carte qui portent un lien, DANS ce gabarit seul. */
  readonly partsLienDeCarte: readonly string[];
}

export interface BlocsDuModule {
  /** Les `s_pqr_*` que le module sait rendre. */
  readonly composants: ReadonlySet<string>;
  /** Toutes les parts connues, tous gabarits confondus. */
  readonly parts: ReadonlySet<string>;
  /** Par composant : les parts de SECTION qui portent un lien. */
  readonly partsLien: ReadonlyMap<string, readonly string[]>;
  /** Par composant : les parts de CARTE qui portent un lien (une par item). */
  readonly partsLienDeCarte: ReadonlyMap<string, readonly string[]>;
}

/** Marqueurs du contrat de DOM d'une collection : ils désignent LA CARTE. */
const MARQUEURS_CARTE = /data-pqr-(?:carte|produit|review-card|member-card)=""/;

/**
 * Lit `components.xml` et en déduit ce que le module sait faire.
 *
 * Rien n'est recopié à la main : une liste de blocs écrite dans ce fichier
 * périmerait en silence le jour où le module en gagne un (T014). Les parts qui
 * portent un lien sont reconnues à DEUX marqueurs syntaxiques, les deux mêmes
 * que le panneau d'édition adresse (`SetCtaHrefAction` / `SetLinkHrefAction`) :
 *   · une ancre qui porte elle-même la part — `<a … data-pqr-part="X"`
 *   · une part dont le contenu immédiat est un bouton gouverné —
 *     `data-pqr-part="X"…><t t-call="piqueray_ds.pqr_button">`
 */
export function chargerBlocsDuModule(xmlSource?: string): BlocsDuModule {
  const xml = xmlSource ?? readFileSync(COMPONENTS_XML, 'utf8');
  // Découpage par POSITION du prochain `<template id=`, jamais par la première
  // balise fermante : plusieurs sections portent un `<template>` IMBRIQUÉ (le
  // gabarit inerte d'une collection, `data-pqr-carte-blueprint`). Une expression
  // paresseuse s'arrêterait là et perdrait en silence tout ce qui suit — dont,
  // pour les Réassurances, le CTA de la disposition à deux boutons.
  const debuts = [...xml.matchAll(/<template id="([a-z0-9_]+)"/g)];
  const gabarits = new Map<string, Gabarit>();
  const parts = new Set<string>();

  debuts.forEach((m, k) => {
    const id = m[1];
    const debut = m.index ?? 0;
    const fin = k + 1 < debuts.length ? (debuts[k + 1].index ?? xml.length) : xml.length;
    const corps = xml.slice(debut, fin);
    for (const p of corps.matchAll(/data-pqr-part="([^"]+)"/g)) parts.add(p[1]);
    const appels = [...new Set([...corps.matchAll(/t-call="piqueray_ds\.([a-z0-9_]+)"/g)].map((a) => a[1]))];
    // Une ANCRE ne compte que si son adresse est indécise (`href="#"`) et
    // qu'elle n'est pas un CONTRÔLE (`role="button"` : le bouton d'envoi du
    // formulaire est une ancre, mais sa destination n'existe pas). Une ancre au
    // href écrit dans le gabarit (`#formulaire-email`, `/website/social/…`) est
    // GOUVERNÉE par le module : la page n'a pas à la trancher, et l'inscrire au
    // registre des restes noierait ce qui reste vraiment à décider.
    const ancres = [...corps.matchAll(/<a\b((?:[^>](?!<a\b))*?)data-pqr-part="([^"]+)"/g)]
      .filter((a) => /href="#"/.test(a[1]) && !/role="button"/.test(a[1]))
      .map((a) => a[2]);
    // Un HÔTE de CTA ne compte que si son bouton est réellement cliquable :
    // `inert_host` rend un <span> — apparence de bouton, aucune ancre (la carte
    // catégorie empilée, dont c'est la RACINE qui porte le lien).
    const hotes = [...corps.matchAll(/data-pqr-part="([^"]+)"[^>]*>\s*<t t-call="piqueray_ds\.pqr_button">((?:(?!<\/t>)[\s\S])*)/g)]
      .filter((h) => !/t-set="inert_host"[^>]*t-value="True"/.test(h[2]))
      .map((h) => h[1]);
    // `button-root` est l'ancre INTERNE de tout bouton gouverné : c'est un
    // détail d'implémentation, sauf quand la section appelle le bouton SANS
    // hôte — alors c'est sa seule adresse (le hero vidéo, seul cas au 2026-09-08).
    const appelsBouton = [...corps.matchAll(/<t t-call="piqueray_ds\.pqr_button"/g)].length;
    const boutonSansHote = id.startsWith('s_pqr_') && appelsBouton > hotes.length;
    // Un gabarit de CARTE est un gabarit INTERNE dont la racine porte le
    // marqueur du contrat de DOM. Une SECTION qui contient une carte écrite en
    // ligne (la carte produit) n'en est pas une : elle porte aussi ses propres
    // CTA de section, et les confondre les ferait tous passer par item.
    const estCarte = !id.startsWith('s_pqr_') && MARQUEURS_CARTE.test(corps);
    const liens = [...new Set([...ancres, ...hotes])].filter((p) => p !== 'button-root').sort();
    const ancreDeCarte = (p: string): boolean =>
      new RegExp(`<a\\b[^>]*?data-pqr-(?:carte|produit)=""[^>]*?data-pqr-part="${p}"`).test(corps);
    gabarits.set(id, {
      id, appels, estCarte,
      partsLien: estCarte ? [] : [...liens.filter((p) => !ancreDeCarte(p)), ...(boutonSansHote ? ['button-root'] : [])].sort(),
      partsLienDeCarte: estCarte ? liens : liens.filter(ancreDeCarte),
    });
  });

  const composants = new Set([...gabarits.keys()].filter((id) => id.startsWith('s_pqr_')));
  const partsLien = new Map<string, readonly string[]>();
  const partsLienDeCarte = new Map<string, readonly string[]>();

  /** Fermeture transitive des `t-call` — une section voit les parts de ce
   *  qu'elle appelle (la section Avis Google voit `ecrire-avis`, qui vit dans
   *  `s_pqr_google_reviews`, et `lire-la-suite`, qui vit dans `review_card`). */
  const fermer = (id: string, vus = new Set<string>()): Gabarit[] => {
    if (vus.has(id)) return [];
    vus.add(id);
    const g = gabarits.get(id);
    if (!g) return [];
    return [g, ...g.appels.flatMap((a) => fermer(a, vus))];
  };

  for (const comp of composants) {
    const section = new Set<string>();
    const carte = new Set<string>();
    for (const g of fermer(comp)) {
      // Un gabarit de CARTE porte des liens PAR ITEM, ses descendants compris.
      for (const p of g.partsLien) (g.estCarte ? carte : section).add(p);
      for (const p of g.partsLienDeCarte) carte.add(p);
    }
    partsLien.set(comp, [...section].sort());
    partsLienDeCarte.set(comp, [...carte].sort());
  }

  return { composants, parts, partsLien, partsLienDeCarte };
}

// ---------------------------------------------------------------------------
// La grammaire FERMÉE des destinations (D3, data-model §5)
// ---------------------------------------------------------------------------

export interface ContexteDestinations {
  /** Les URL internes autorisées — celles des pages du site, `/` compris. */
  readonly urlsDuSite: ReadonlySet<string>;
  /** La liste FERMÉE des adresses externes autorisées, avec leur raison. */
  readonly externes: Readonly<Record<string, string>>;
}

/**
 * Valide UNE destination. Plus stricte que le panneau d'édition, et
 * volontairement : le panneau parle d'un site vivant, ce fichier parle d'un site
 * qu'on construit — un chemin qui n'existe pas encore est une faute, pas un pari.
 */
export function verifierDestination(
  valeur: unknown, ctx: ContexteDestinations,
): string | null {
  if (typeof valeur !== 'string' || valeur.trim() === '') return 'destination vide';
  const v = valeur;
  if (v.startsWith('#')) return null;
  if (v.startsWith('tel:') && v.length > 4) return null;
  if (v.startsWith('mailto:') && v.length > 7) return null;
  if (v.startsWith('//')) return 'destination sans protocole (`//hôte`) — interdite';
  if (v.startsWith('http://')) return 'destination en clair (`http://`) — interdite, https seulement';
  if (v.startsWith('https://')) {
    return Object.prototype.hasOwnProperty.call(ctx.externes, v)
      ? null
      : 'adresse externe hors de la liste fermée `commun/destinations-externes.json`';
  }
  if (v.startsWith('/')) {
    return ctx.urlsDuSite.has(v)
      ? null
      : "chemin interne qui n'est pas une page du site (`scripts/odoo/lib/pages.ts`)";
  }
  return 'destination hors grammaire (attendu : `#…`, `/<page du site>`, `tel:`, `mailto:`, `https://` listée)';
}

// ---------------------------------------------------------------------------
// La fusion : commun + surcharge, CHAMP par CHAMP (D1, data-model §4)
// ---------------------------------------------------------------------------

type Section = Record<string, unknown>;

const estObjet = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Fusionne une section commune et sa surcharge.
 *
 * Scalaires : remplacés. Listes de contenu (`cards`, `reviews`, `rows`) :
 * remplacées ENTIÈRES — fusionner par index inventerait une identité de carte
 * que le DOM gouverné n'a pas (les cartes sont adressées par POSITION), et cinq
 * cartes du commun plus quatre de la page rendraient cinq cartes, en silence.
 * Dictionnaires par part : fusion PAR PART. Listes de classes : union.
 */
export function fusionner(
  commun: Section, surcharge: Section, refus: (r: Omit<Refus, 'fichier'>) => never,
): Section {
  const out: Section = { ...commun };
  for (const [cle, valeur] of Object.entries(surcharge)) {
    if (cle === '_note') continue;
    const connue = (CLES_COMPOSEUR as readonly string[]).includes(cle);
    if (!connue && !(cle in commun)) {
      refus({ section: null, cle, valeur: JSON.stringify(valeur), raison: 'clé de surcharge orpheline (ni dans le commun, ni une clé du composeur)' });
    }
    if (CLES_DICT_PAR_PART.has(cle)) {
      const base = estObjet(commun[cle]) ? (commun[cle] as Record<string, unknown>) : {};
      out[cle] = { ...base, ...(estObjet(valeur) ? valeur : {}) };
    } else if (CLES_UNION.has(cle)) {
      const base = Array.isArray(commun[cle]) ? (commun[cle] as unknown[]) : [];
      const ajout = Array.isArray(valeur) ? valeur : [];
      out[cle] = [...base, ...ajout.filter((v) => !base.includes(v))];
    } else if (CLES_LISTE.has(cle)) {
      out[cle] = valeur; // la liste entière, jamais élément par élément
    } else {
      out[cle] = valeur;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Résolution d'un descripteur
// ---------------------------------------------------------------------------

/** Une ligne du registre des restes : un bouton présent, sans destination. */
export interface Reste {
  readonly page: string;
  readonly section: number;
  readonly composant: string;
  readonly part: string;
}

export interface Resolution {
  /** Le descripteur RÉSOLU — le format que `compose_page.py` lit déjà. */
  readonly descripteur: Record<string, unknown>;
  /** Ce qui reste à trancher, jamais deviné (FR-021). */
  readonly restes: readonly Reste[];
}

export interface ContexteResolution {
  readonly blocs: BlocsDuModule;
  readonly communs: Readonly<Record<string, Section>>;
  readonly destinations: ContexteDestinations;
}

/** Charge le contexte (module, commun, externes) depuis le dépôt. */
export function chargerContexte(dirCommun: string = COMMUN_DIR): ContexteResolution {
  const communs: Record<string, Section> = {};
  for (const bloc of BLOCS_COMMUNS) {
    const p = path.join(dirCommun, `${bloc}.json`);
    if (!existsSync(p)) throw new Error(`Contenu commun manquant : ${p}`);
    communs[bloc] = JSON.parse(readFileSync(p, 'utf8')) as Section;
  }
  const pExternes = path.join(dirCommun, 'destinations-externes.json');
  const externes = existsSync(pExternes)
    ? (JSON.parse(readFileSync(pExternes, 'utf8')) as Record<string, string>)
    : {};
  return { blocs: chargerBlocsDuModule(), communs, destinations: { urlsDuSite: URLS_DU_SITE, externes } };
}

/**
 * Résout UN descripteur déjà chargé. Fonction PURE : mêmes entrées, même
 * sortie, à l'octet (SC-005) — c'est ce que l'éval mesure.
 */
export function resoudreDescripteur(
  fichier: string, page: string, desc: Record<string, unknown>, ctx: ContexteResolution,
): Resolution {
  const sections = desc.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    refuser({ fichier, section: null, cle: 'sections', valeur: JSON.stringify(sections), raison: 'un descripteur de page porte au moins une section' });
  }

  const restes: Reste[] = [];
  const resolues = (sections as Section[]).map((brute, i) => {
    const num = i + 1;
    const rf = (r: Omit<Refus, 'fichier'>): never => refuser({ ...r, fichier, section: r.section ?? num });

    if ('component' in brute && 'commun' in brute) {
      rf({ section: num, cle: 'component+commun', valeur: `${String(brute.component)}+${String(brute.commun)}`, raison: 'une section est PROPRE ou COMMUNE, jamais les deux' });
    }

    let sec: Section;
    if ('commun' in brute) {
      const nom = String(brute.commun);
      if (!(BLOCS_COMMUNS as readonly string[]).includes(nom)) {
        rf({ section: num, cle: 'commun', valeur: nom, raison: `bloc commun inconnu (attendu : ${BLOCS_COMMUNS.join(', ')})` });
      }
      const inconnues = Object.keys(brute).filter((k) => k !== 'commun' && k !== 'surcharge' && k !== '_note');
      if (inconnues.length > 0) {
        rf({ section: num, cle: inconnues[0], valeur: JSON.stringify(brute[inconnues[0]]), raison: 'une section commune ne porte que `commun` et `surcharge` (mettre le reste dans `surcharge`)' });
      }
      const surcharge = estObjet(brute.surcharge) ? brute.surcharge : {};
      sec = fusionner(ctx.communs[nom], surcharge, (r) => rf({ ...r, section: num }));
    } else if ('component' in brute) {
      const comp = String(brute.component);
      if (!ctx.blocs.composants.has(comp)) {
        rf({ section: num, cle: 'component', valeur: comp, raison: 'composant inconnu du module (aucun gabarit de ce nom dans views/components.xml)' });
      }
      const commun = (Object.entries(COMPOSANTS_COMMUNS) as [BlocCommun, string][])
        .find(([, c]) => c === comp);
      if (commun) {
        rf({ section: num, cle: 'component', valeur: comp, raison: `copie locale interdite — ce bloc est COMMUN, l'écrire \`{"commun": "${commun[0]}"}\` (SC-004)` });
      }
      sec = { ...brute };
    } else {
      return rf({ section: num, cle: 'section', valeur: JSON.stringify(brute).slice(0, 80), raison: 'une section porte `component` (propre) ou `commun` (reprise)' });
    }

    const comp = String(sec.component);
    delete sec._note;

    // — Destinations : grammaire fermée, refus nommé, et rien d'inventé —
    const liens = estObjet(sec.links) ? (sec.links as Record<string, unknown>) : {};
    for (const [part, dest] of Object.entries(liens)) {
      if (!ctx.blocs.parts.has(part)) {
        rf({ section: num, cle: `links.${part}`, valeur: String(dest), raison: 'part inconnue du module (aucun `data-pqr-part` de ce nom)' });
      }
      const faute = verifierDestination(dest, ctx.destinations);
      if (faute) rf({ section: num, cle: `links.${part}`, valeur: String(dest), raison: faute });
    }
    for (const [cle, itemsBruts] of [['cards', sec.cards], ['reviews', sec.reviews]] as const) {
      if (!Array.isArray(itemsBruts)) continue;
      itemsBruts.forEach((item, j) => {
        if (!estObjet(item)) return;
        for (const champ of ['lien', 'lienAvis'] as const) {
          if (!(champ in item)) continue;
          const faute = verifierDestination(item[champ], ctx.destinations);
          if (faute) rf({ section: num, cle: `${cle}[${j}].${champ}`, valeur: String(item[champ]), raison: faute });
        }
      });
    }

    // — Registre des restes : un bouton présent SANS destination —
    for (const part of ctx.blocs.partsLien.get(comp) ?? []) {
      if (!(part in liens)) restes.push({ page, section: num, composant: comp, part });
    }
    const partsCarte = ctx.blocs.partsLienDeCarte.get(comp) ?? [];
    if (partsCarte.length > 0) {
      const items = (Array.isArray(sec.cards) ? sec.cards : Array.isArray(sec.reviews) ? sec.reviews : []) as unknown[];
      items.forEach((item, j) => {
        const o = estObjet(item) ? item : {};
        if (o.lien === undefined && o.lienAvis === undefined) {
          const cle = Array.isArray(sec.cards) ? 'cards' : 'reviews';
          restes.push({ page, section: num, composant: comp, part: `${cle}[${j}] → ${partsCarte.join('/')}` });
        }
      });
    }

    return sec;
  });

  const descripteur: Record<string, unknown> = { ...desc, sections: resolues };
  delete descripteur._note;
  return { descripteur, restes };
}

/** Résout une page du site par son nom court. */
export function resoudrePage(nom: string, ctx: ContexteResolution = chargerContexte()): Resolution {
  const fichier = descripteurPath(nom);
  if (!existsSync(fichier)) {
    throw new Error(`Descripteur introuvable : ${repoRelative(fichier)}`);
  }
  const desc = JSON.parse(readFileSync(fichier, 'utf8')) as Record<string, unknown>;
  return resoudreDescripteur(repoRelative(fichier), nom, desc, ctx);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function verifierToutesLesPages(json: boolean): void {
  // Un descripteur de `pages/` non classé est REFUSÉ en étant nommé : un
  // fichier de travail se classe (liste blanche ou `*-test.json`), il ne
  // s'ignore pas — sinon il entrerait dans le site le jour où on l'oublie.
  const nonClasses = descripteursNonClasses();
  if (nonClasses.length > 0) {
    const f = `${repoRelative(PAGES_DIR)}/${nonClasses[0]}.json`;
    throw new RefusError({
      fichier: f, section: null, cle: 'descripteur', valeur: nonClasses[0],
      raison: "descripteur non classé — ni page du site (`scripts/odoo/lib/pages.ts`) ni banc `*-test.json`",
    });
  }

  const ctx = chargerContexte();
  const pages: Record<string, { sections: number; restes: number }> = {};
  const restes: Reste[] = [];
  for (const p of SITE_PAGES) {
    const r = resoudrePage(p.nom, ctx);
    pages[p.nom] = { sections: (r.descripteur.sections as unknown[]).length, restes: r.restes.length };
    restes.push(...r.restes);
  }

  if (json) { process.stdout.write(canonicalJson({ pages, restes })); return; }
  console.log(`✔ ${SITE_PAGES.length} pages du site résolues, 0 refus`);
  for (const p of SITE_PAGES) {
    console.log(`  · ${p.nom.padEnd(24)} ${String(pages[p.nom].sections).padStart(2)} sections · ${pages[p.nom].restes} reste(s)`);
  }
  console.log(`\nRegistre des restes — ${restes.length} destination(s) non tranchée(s) :`);
  for (const r of restes) console.log(`  · ${r.page} › section ${r.section} (${r.composant}) › ${r.part}`);
}

/**
 * Résout un descripteur de FIXTURE, hors du dépôt réel.
 *
 * C'est la porte d'entrée de l'éval : elle exerce le VRAI chemin (le même
 * `resoudreDescripteur`, le même chargement du module) sur des entrées
 * minimales, sans Docker et sans toucher au contenu du site. Sortie canonique
 * — deux exécutions doivent rendre le même octet (SC-005).
 */
function resoudreFixture(dir: string, nom: string): void {
  const ctx = chargerContexte(path.join(dir, 'commun'));
  const fichier = path.join(dir, 'pages', `${nom}.json`);
  const desc = JSON.parse(readFileSync(fichier, 'utf8')) as Record<string, unknown>;
  const r = resoudreDescripteur(`${path.basename(dir)}/pages/${nom}.json`, nom, desc, ctx);
  process.stdout.write(canonicalJson({ descripteur: r.descripteur, restes: r.restes }));
}

runAsCli(import.meta.url, () => {
  const argv = process.argv.slice(2);
  if (argv.includes('--check')) { verifierToutesLesPages(argv.includes('--json')); return; }

  const iFix = argv.indexOf('--fixture');
  if (iFix >= 0) {
    const dir = argv[iFix + 1];
    const nom = argv[iFix + 2];
    if (!dir || !nom) throw new Error('usage : --fixture <dossier> <page>');
    resoudreFixture(dir, nom);
    return;
  }

  const nom = argv.find((a) => !a.startsWith('--'));
  if (!nom) {
    throw new Error('usage : resolve-page.ts <page> [--out fichier.json] | --check [--json]');
  }
  if (!pageParNom(nom) && !nom.endsWith('-test')) {
    throw new RefusError({
      fichier: repoRelative(descripteurPath(nom)), section: null, cle: 'descripteur', valeur: nom,
      raison: "descripteur non classé — ni page du site (`scripts/odoo/lib/pages.ts`) ni banc `*-test.json`",
    });
  }
  const r = resoudrePage(nom);
  const i = argv.indexOf('--out');
  const sortie = i >= 0 ? argv[i + 1] : null;
  if (sortie) {
    writeFileSync(sortie, canonicalJson(r.descripteur));
    for (const reste of r.restes) {
      console.error(`  (·) reste : ${reste.page} › section ${reste.section} (${reste.composant}) › ${reste.part} — href="#" conservé`);
    }
  } else {
    process.stdout.write(canonicalJson(r.descripteur));
  }
});
