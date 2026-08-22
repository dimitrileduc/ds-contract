// Temp — monte une instance propre avec les 8 sections + la page /showcase, la
// laisse tourner, et imprime le lien éditeur. À supprimer après la revue.
import {
  readQaEnv, baseUrl, dockerDisponible, compose,
  attendreOdoo, installerAddon, creerRedacteur,
} from './run.mts';

const env = readQaEnv();
const v = dockerDisponible();
if (!v) throw new Error('Docker ne répond pas.');
console.log(`Docker ${v} · base ${env.dbName} · ${baseUrl(env)}`);

const up = compose(['up', '-d', 'db', 'odoo']);
if (up.status !== 0) throw new Error(`up KO:\n${up.out}`);
if (!(await attendreOdoo(env))) throw new Error('Odoo ne répond pas.');

console.log('Base neuve + install piqueray_ds + piqueray_ds_qa (charge la page showcase)…');
const inst = installerAddon(env);
if (inst.status !== 0) throw new Error(`Install KO:\n${inst.out.slice(-3000)}`);

const red = creerRedacteur(env);
if (red.status !== 0) throw new Error(red.out);

compose(['restart', 'odoo']);
if (!(await attendreOdoo(env))) throw new Error('Odoo ne répond plus après restart.');

const url = `${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent('/piqueray-harness/showcase')}&enable_editor=1`;
console.log('\n==================== PRÊT ====================');
console.log(`  Éditeur (8 sections) : ${url}`);
console.log(`  Page publique        : ${baseUrl(env)}/piqueray-harness/showcase`);
console.log(`  Login  : ${env.editorLogin}`);
console.log(`  Passe  : ${env.editorPassword}`);
console.log('=============================================');
