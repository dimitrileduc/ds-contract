// Temp — monte une instance propre avec le module, crée le rédacteur, laisse
// tourner et imprime les liens pour VOIR ET TESTER les Catégories principales.
// À supprimer après la revue.
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

console.log('Base neuve + install piqueray_ds + piqueray_ds_qa…');
const inst = installerAddon(env);
if (inst.status !== 0) throw new Error(`Install KO:\n${inst.out.slice(-3000)}`);

const red = creerRedacteur(env);
if (red.status !== 0) throw new Error(red.out);

compose(['restart', 'odoo']);
if (!(await attendreOdoo(env))) throw new Error('Odoo ne répond plus après restart.');

const ed = (path: string) => `${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(path)}&enable_editor=1`;
console.log('\n==================== PRÊT ====================');
console.log(`  1) Se connecter d'abord :  ${baseUrl(env)}/web/login`);
console.log(`       Login : ${env.editorLogin}   Passe : ${env.editorPassword}`);
console.log('');
console.log(`  2a) Éditeur — page VIDE (glisser le bloc « Piqueray · Catégories principales »` );
console.log(`      depuis la catégorie « Content ») : ${ed('/piqueray-harness/categories-principales')}`);
console.log('');
console.log(`  2b) Éditeur — section DÉJÀ posée (éditer directement) :`);
console.log(`      ${ed('/piqueray-harness/categories-principales-visual')}`);
console.log('');
console.log(`  3) Vue publique (rendu final, sans éditeur) :`);
console.log(`      ${baseUrl(env)}/piqueray-harness/categories-principales-visual`);
console.log('=============================================');
console.log("L'instance reste debout. Pour l'arrêter :");
console.log(`  COMPOSE_PROJECT_NAME=${process.env.COMPOSE_PROJECT_NAME ?? 'piqueray-odoo-qa'} PQR_ODOO_PORT=${env.odooPort} docker compose -f integrations/odoo/qa/compose.yaml down -v`);
