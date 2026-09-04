/**
 * La sonde navigateur du cas `focus-not-pressed-browser-probe`, en UN seul
 * exemplaire.
 *
 * Pourquoi ce module existe : la sonde vivait en double, mot pour mot, dans
 * `evals/run.ts` (le cas) et dans `specs/032-etats-bouton/tools/adverse.mts`
 * (le contrôle adverse qui prouve que le cas rougit sous sabotage). Les deux
 * copies avaient déjà divergé d'une ligne. Une divergence plus profonde aurait
 * eu la pire conséquence possible : le contrôle adverse serait resté VERT en
 * sabotant une sonde que la porte n'exécute plus — un contrôle périmé qui
 * affirme que la promesse est tenue.
 *
 * Le texte est un script exécuté par `run(TSX, ['-e', FOCUS_NOT_PRESSED_PROBE])`
 * dans l'espace de travail copié des évaluations : chemins relatifs, aucun
 * import du dépôt hôte.
 */

/** Ligne que la sonde imprime quand elle passe. Les deux appelants la cherchent. */
export const FOCUS_NOT_PRESSED_MARKER = 'le focus clavier garde le fond de repos sous l anneau';

/**
 * Ce qu'elle prouve, dans un VRAI Chromium et non par lecture du CSS : une
 * arrivée au CLAVIER peint l'anneau de focus SANS peindre le fond de survol.
 *
 * La distinction n'est pas cosmétique — si le focus rendait le fond de survol,
 * une personne qui navigue au clavier verrait un état qu'elle n'a pas
 * déclenché, et la mesure de parité visuelle photographierait le survol en
 * croyant photographier le focus (défaut constaté sur les campagnes
 * CBDS/Eventz : 68-70 % de surface masquée).
 *
 * Elle tient FR-004 (l'anneau existe, plein, 2 px, à la couleur du contrat) et
 * FR-006 (le fond ne bascule pas).
 */
export const FOCUS_NOT_PRESSED_PROBE = `
        import fs from 'node:fs';
        import { chromium } from 'playwright-core';
        import { chromiumExecutable } from './extract/figma/visual-parity/render.ts';
        import { emitHtml } from './core/emit-html.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { tokenInventoryFromJson } from './core/tokens.ts';
        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        const c = ContractSchema.parse(j('contracts/button.contract.json'));
        if (!c.states.includes('focus-visible')) throw new Error('le contrat ne declare plus focus-visible');
        if (!c.states.includes('hover')) throw new Error('le contrat ne declare plus hover');
        const inv = tokenInventoryFromJson(['tokens/primitives.tokens.json','tokens/semantic.tokens.json','tokens/modes/semantic.light.tokens.json'].map(j));
        const icons = new Map(fs.readdirSync('assets/icons').filter(f=>f.endsWith('.svg')).map(f=>[f.replace('.svg',''),fs.readFileSync('assets/icons/'+f,'utf8').trim()]));
        const emitted = emitHtml(c, { tokens: inv, icons, contracts: new Map([[c.id, c]]) });
        const doc = '<!doctype html><html><head><meta charset="utf-8"><style>' + fs.readFileSync('src/styles/tokens.css','utf8') + '</style><style>body{margin:0;padding:32px}</style><style>' + emitted.css + '</style></head><body>' + emitted.html + '</body></html>';
        (async () => {
          const browser = await chromium.launch({ executablePath: chromiumExecutable(), headless: true });
          try {
            const page = await browser.newPage();
            await page.setContent(doc, { waitUntil: 'load' });
            await page.mouse.move(0, 0); // pointeur GARÉ hors du composant
            await page.keyboard.press('Tab');
            const r = await page.evaluate("(() => { const el = document.querySelector('.showcase .button'); const cs = getComputedStyle(el); const v = (n) => { const probe = document.createElement('div'); probe.style.backgroundColor = 'var(' + n + ')'; document.body.appendChild(probe); const out = getComputedStyle(probe).backgroundColor; probe.remove(); return out; }; return { focused: document.activeElement === el, fv: el.matches(':focus-visible'), bg: cs.backgroundColor, outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, def: v('--color-noir-bleute'), hover: v('--color-etat-default-fond-survol'), ring: v('--color-etat-default-anneau-focus') }; })()");
            if (!r.focused || !r.fv) throw new Error('Tab n a pas donne le focus CLAVIER au bouton: ' + JSON.stringify(r));
            if (r.outlineStyle !== 'solid') throw new Error('anneau de focus absent: ' + JSON.stringify(r));
            if (r.outlineWidth !== '2px') throw new Error('anneau de focus pas a 2px: ' + JSON.stringify(r));
            if (r.outlineColor !== r.ring) throw new Error('l anneau ne porte pas le jeton anneau-focus: ' + r.outlineColor + ', attendu ' + r.ring);
            if (r.def === r.hover) throw new Error('repos et survol sont la MEME couleur — la sonde ne prouverait rien');
            if (r.bg !== r.def) throw new Error('le focus clavier a change le fond: ' + r.bg + ', repos ' + r.def + ' (survol ' + r.hover + ')');
            if (r.bg === r.hover) throw new Error('le focus rend le fond de SURVOL');
            console.log(${JSON.stringify(FOCUS_NOT_PRESSED_MARKER)});
          } finally { await browser.close(); }
        })().catch((e) => { console.error(e); process.exit(1); });
      `;
