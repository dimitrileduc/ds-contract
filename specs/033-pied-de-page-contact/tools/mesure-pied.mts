/**
 * Vague 033 — mesure du pied de page Odoo, colonne « Contact ».
 *
 * Une seule preuve : la colonne rend-elle la MÊME hauteur qu'avant le passage
 * du texte plat aux deux vrais liens ? La question s'est posée parce que
 * l'email revenait à la ligne à une largeur de fenêtre — il fallait savoir si
 * ce repli était causé par ce changement ou s'il préexistait.
 *
 * La ruse est là : on ne compare pas deux captures d'écran prises à deux
 * moments (le module aurait changé entre les deux). On mesure l'APRÈS tel qu'il
 * est servi, et on simule l'AVANT dans la MÊME page, dans la MÊME colonne, avec
 * les MÊMES classes — un unique `span.footer-column__Texte` portant le texte
 * plat du champ `website.x_pqr_footer_col3`. Les deux mesures subissent donc
 * exactement la même feuille de style et la même largeur de colonne.
 *
 * Pourquoi trois largeurs et pas une : les colonnes du pied sont en `flex: 1 1 0`
 * et la bande « wide » démarre à 1400 px alors que la maquette large est dessinée
 * à 1728. Entre les deux, la colonne « Suivez-nous » réapparaît et la gouttière
 * passe de 56 à 89 : les colonnes de contact y sont plus étroites qu'à 1200. Une
 * mesure à une seule largeur aurait manqué ce creux.
 *
 * Emploi (instance Odoo jetable, jamais celle de l'owner) :
 *   npx tsx specs/033-pied-de-page-contact/tools/mesure-pied.mts [--url http://localhost:8087/]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { launchBrowser } from '../../../extract/figma/visual-parity/render.js';

/** Les trois largeurs : la maquette desktop, le creux, la maquette large. */
const LARGEURS = [1200, 1440, 1728] as const;

/** Le texte exact que portait `website.x_pqr_footer_col3` (models/website.py). */
const TEXTE_AVANT = 'Tél : +32 (0)87 46 32 66\nEmail: info@piqueray.be';

const arg = (nom: string, defaut: string): string => {
  const i = process.argv.indexOf(nom);
  return i === -1 || !process.argv[i + 1] ? defaut : process.argv[i + 1];
};

const URL = arg('--url', 'http://localhost:8087/');
const OUT = path.resolve(arg('--out', 'specs/033-pied-de-page-contact/proofs'));

const sonde = `((texteAvant) => {
  const cols = [...document.querySelectorAll('[data-pqr-part="footer-column-root"]')];
  const contact = cols[2];
  const h = (e) => (e ? Math.round(e.getBoundingClientRect().height) : null);

  // L'AVANT, simulé dans la colonne réelle : un seul span, texte plat.
  const avant = document.createElement('span');
  avant.className = 'footer-column__Texte';
  avant.textContent = texteAvant;
  contact.appendChild(avant);
  const hauteurAvant = h(avant);
  avant.remove();

  const tel = document.querySelector('[data-pqr-footer-contact="tel"]');
  const email = document.querySelector('[data-pqr-footer-contact="email"]');
  return {
    largeurColonne: Math.round(contact.getBoundingClientRect().width),
    avant: hauteurAvant,
    apres: h(tel) + h(email),
    detail: { tel: h(tel), email: h(email) },
    // Témoin : la colonne « Adresse », intouchée par la vague. Si elle bouge,
    // c'est la page qui a changé, pas la colonne Contact.
    temoinAdresse: h(cols[0].querySelector('[data-pqr-part="footer-column-texte"]')),
    // La hauteur de la colonne entiere : c'est elle qui trahirait une marge
    // parasite (le paragraphe qu'Odoo pose autour d'un champ Html en a
    // apporte une). Pas d'accent grave ici : la sonde est une chaine gabarit.
    hauteurColonne: Math.round(contact.getBoundingClientRect().height),
    temoinColonneAdresse: Math.round(cols[0].getBoundingClientRect().height),
    // Les liens sont-ils bien des ancres, avec la bonne destination ?
    liens: [...contact.querySelectorAll('a')].map((a) => a.getAttribute('href')),
  };
})(${JSON.stringify(TEXTE_AVANT)})`;

mkdirSync(OUT, { recursive: true });
const { browser } = await launchBrowser();
const releves: Array<Record<string, unknown>> = [];
try {
  for (const width of LARGEURS) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
    const r = await page.goto(URL, { waitUntil: 'networkidle' });
    if (r?.status() !== 200) throw new Error(`${URL} a répondu HTTP ${r?.status()}`);
    const pied = page.locator('.o_footer, footer').first();
    await pied.scrollIntoViewIfNeeded();
    writeFileSync(path.join(OUT, `pied-${width}.png`), await pied.screenshot());
    const m = (await page.evaluate(sonde)) as Record<string, unknown>;
    releves.push({ largeur: width, ...m });
    const egal = m.avant === m.apres;
    console.log(
      `  ${egal ? '✔' : '✖'} ${String(width).padStart(4)} px — colonne ${m.largeurColonne} px · ` +
        `avant ${m.avant} px, après ${m.apres} px`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}

const identiques = releves.every((r) => r.avant === r.apres);
writeFileSync(
  path.join(OUT, 'mesure-pied.json'),
  `${JSON.stringify({ spec: '033-pied-de-page-contact', url: URL, texteAvant: TEXTE_AVANT, releves, identiques }, null, 2)}\n`,
);
console.log(
  identiques
    ? '\nLa colonne rend la même hauteur qu’avant, aux trois largeurs.'
    : '\nÉCHEC : au moins une largeur rend une hauteur différente de l’avant.',
);
process.exit(identiques ? 0 : 1);
