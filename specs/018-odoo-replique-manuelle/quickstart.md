# Quickstart — 018 · monter, installer, prouver, détruire

Le chemin complet, de rien à un reçu consigné, puis à zéro trace. Chaque commande est écrite pour
être copiée telle quelle.

**Ce que ce document n'est pas** : une porte. Rien ici n'entre dans la suite de contrôles standard
du dépôt. La preuve se lance à la demande et se consigne — le patron des cycles de pont Figma des
specs 003, 005 et 007.

---

## 0. Prérequis, une fois

```bash
# Le worktree doit être autosuffisant (constitution : Worktree Gates F1) — node_modules est ABSENT aujourd'hui
cd /Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/soapy-duckling
npm install
npx playwright install chromium
```

Puis la remise à niveau, **avant toute autre chose** (research.md §D1 — cette branche est en retard
sur `main` de toute la spec 016, et les trois contrats de la chaîne ont changé) :

```bash
git merge main          # ou rebase, selon l'habitude du dépôt
npm run build && npm run parity && npm run eval    # départ vert prouvé, jamais supposé
```

Docker est déjà là (daemon vérifié : 29.2.1). Odoo 19 exige **PostgreSQL ≥ 13** — la version
minimale est passée de 12 à 13 avec la 19.

---

## 1. L'instance jetable

`specs/018-odoo-replique-manuelle/instance/compose.yaml` :

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo
    volumes:
      - odoo19-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U odoo"]
      interval: 2s
      timeout: 3s
      retries: 30

  web:
    image: odoo:19.0-20260803        # tag DATÉ : `odoo:19.0` flotte et changera demain
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8069:8069"
    environment:
      HOST: db
      USER: odoo
      PASSWORD: odoo
    volumes:
      - odoo19-web-data:/var/lib/odoo
      - ../module:/mnt/extra-addons  # le module de la spec, monté tel quel
    command: ["--", "-d", "odoo", "--dev=xml,reload"]

volumes:
  odoo19-web-data:
  odoo19-db-data:
```

> **Pourquoi le tag daté.** `odoo:19.0` est un alias **flottant**, reconstruit chaque nuit :
> l'épingler par sa date est ce qui rend le reçu relisable dans six mois. L'image officielle
> publie bien un manifeste `arm64` — aucune émulation, aucun `--platform` à passer.
> `addons_path = /mnt/extra-addons` est déjà dans l'`odoo.conf` de l'image : monter le module là
> suffit.

```bash
cd specs/018-odoo-replique-manuelle/instance

docker compose -p odoo19 up -d db                    # ~7 s

docker compose -p odoo19 run --rm web \
  odoo -d odoo -i base,website,piqueray_ds --stop-after-init    # ~2 min

docker compose -p odoo19 up -d                       # ~5 s → http://localhost:8069
```

Première connexion : `admin` / `admin`.

**SC-001 se lit ici** : l'installation se termine à **0 erreur** — la sortie du conteneur est
capturée dans `proofs/`, pas résumée de mémoire.

> **Piège nommé.** `-i` et `-u` **exigent `-d`**. Et un module de site sans `"application": True`
> dans son manifeste **n'apparaît pas** sous le filtre « Apps » par défaut : il faut le mode
> développeur, *Update Apps List*, puis le filtre **« Extra »**. La voie CLI ci-dessus évite tout
> ça — c'est pour ça qu'elle est la voie recommandée.

### La boucle de développement

| Ce qui change | Ce qu'il faut faire |
|---|---|
| `.xml` (gabarit, snippet), avec `--dev=xml` actif | **rechargement du navigateur**, rien d'autre |
| `.xml` de données / déclaration de bloc | `docker compose -p odoo19 run --rm web odoo -d odoo -u piqueray_ds --stop-after-init` — le serveur persistant le prend en compte, il n'a pas besoin d'être redémarré |
| `.js` / `.css` (bundles d'assets) | rechargement avec `?debug=assets` ; si un bundle en cache colle, *Regenerate Assets Bundles* dans le menu développeur |
| `.py` | **redémarrage du processus** : `docker compose -p odoo19 restart web` (les volumes sont conservés) |

> `--dev` en 19.0 accepte `all`, `xml`, `reload`, `qweb`, `werkzeug`, `replica`, `access`. **Il n'y a
> pas de fonction `assets`** dans cette liste — c'est une confusion facile avec des versions
> antérieures.

---

## 2. Les jetons — la seule chose générée

```bash
cd /Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/soapy-duckling
npm run tokens
```

Écrit la 4ᵉ sortie **dans le module**. Le fichier porte son en-tête `GENERATED — DO NOT EDIT` : il
ne s'édite jamais à la main, il se refait par cette commande.

Vérification d'additivité et de déterminisme, à la main comme la porte le fera :

```bash
git diff --stat src/styles/tokens.css src/styles/tokens.dark.css src/styles/tokens.brands.css
# doit être VIDE — la sortie est additive, les 3 existantes ne bougent pas d'un octet

npm run tokens && shasum -a 256 specs/018-*/module/piqueray_ds/static/src/css/tokens.pqr.css
npm run tokens && shasum -a 256 specs/018-*/module/piqueray_ds/static/src/css/tokens.pqr.css
# les deux empreintes doivent être identiques
```

---

## 3. Les gestes de gouvernance (US2)

Sur l'instance, éditeur ouvert, bloc posé. Chaque geste se **tente** et son résultat se **note** —
un verdict ne se déduit jamais du code lu (FR-013, SC-009).

1. **Poser** la section depuis le panneau. Vérifier qu'il n'y a **qu'une** entrée pour les trois
   composants (FR-003, SC-002).
2. **Cliquer chaque partie**, une par une, et relever **tout** ce que le panneau affiche. Comparer
   ligne à ligne au tableau des zones. Un réglage affiché mais non déclaré est un échec de SC-004 —
   pas un détail cosmétique.
3. **Tenter de supprimer, déplacer, dupliquer** chaque élément intérieur. Chaque tentative est un
   geste consigné.
4. **Modifier** chaque zone déclarée modifiable, **enregistrer**, **recharger la page publique** —
   la modification doit y être (acceptation US1-2, US2-3).
5. **Rouvrir la page en édition** et vérifier que les zones modifiables **le sont encore**. C'est
   l'étape qui tue FR-012 si elle tue : `contenteditable` **et** `.o_editable` sont tous deux
   effacés à chaque enregistrement (research.md §D13). **100 %** est exigé (SC-005).
6. **Changer le glyphe** d'une icône depuis le panneau — la seule liaison par échange d'instance de
   toute la chaîne, et le seul franchissement de frontière d'un registre gouverné. Elle doit être
   exercée, pas seulement exprimée (FR-004b, SC-002).
7. **Changer la variante du bouton et la disposition de l'en-tête** — elles doivent changer sur
   place, sans remplacer le bloc (acceptation US2-5).

Chaque geste alimente `proofs/verdicts-leviers.json` (schéma :
`contracts/governance-verdicts.schema.md`). **4 verdicts sur 4**, dont `L4` connu d'avance comme
`non exercé` avec sa raison.

---

## 4. La comparaison d'image (US3)

Protocole complet : `contracts/visual-comparison.md`. Trois lignes, une par composant.

```bash
# côté surface HTML — emit-html rendu au clip épinglé
npx tsx specs/018-*/harness/render-html.mts --out specs/018-*/proofs/html

# côté Odoo — page publique, MÊME clip épinglé
npx tsx specs/018-*/harness/capture-odoo.mts --base http://localhost:8069 --out specs/018-*/proofs/odoo

# la comparaison, par l'instrument générique existant, non modifié
npm run images:compare -- \
  --before specs/018-*/proofs/html/button.png \
  --after  specs/018-*/proofs/odoo/button.png \
  --out    specs/018-*/proofs/compare/button
```

**Quatre pièges, tous réels, tous déjà payés une fois ailleurs :**

1. **Capturer la page publique, sans session.** Connecté en `admin` avec l'éditeur actif, Odoo
   superpose sa barre de backoffice et son panneau latéral — la mise en page n'est plus celle que
   voit un visiteur. Un contexte de navigateur neuf, sans cookie, donne la bonne page.
2. **Épingler le viewport et le clip des deux côtés.** Sans ça, les images n'ont pas la même taille
   et `images:compare` **refuse** (`dimension-mismatch`) — un refus honnête, mais aucune mesure.
3. **Servir les mêmes faces Montserrat des deux côtés.** Le harnais HTML les embarque en base64 ;
   **le module Odoo doit les servir aussi**. Sinon la mesure oppose un repli système à la vraie
   police — c'est le bug daté du 2026-07-23, et il ne rend pas la mesure approximative, il la rend
   fausse (invariant C7).
4. **Ne jamais attendre sans borne.** Le client web d'Odoo garde une connexion longue ouverte :
   `waitUntil: 'networkidle'` peut ne jamais rendre la main. Borner l'attente, et faire courir
   `document.fonts.ready` contre un délai — la règle que le harnais de parité visuelle applique
   déjà.

> **Note d'environnement** : le cache Playwright nomme ses répertoires par architecture
> (`chrome-mac-arm64`, `chrome-mac-x64`, `chrome-mac`). `chromiumExecutable()` du dépôt les essaie
> tous — le réutiliser tel quel, jamais en recopier une version raccourcie.

Le self-test du harnais tourne **hors ligne**, sans instance :

```bash
npx tsx specs/018-*/harness/selftest.mts
```

---

## 5. La destruction

```bash
cd specs/018-odoo-replique-manuelle/instance
docker compose -p odoo19 down -v --remove-orphans     # conteneurs + volumes + réseau
```

Vérifier qu'il ne reste rien :

```bash
docker ps -a | grep odoo19 ; docker volume ls | grep odoo19 ; docker network ls | grep odoo19
# les trois doivent être vides
```

Facultatif, et **généralement à ne pas faire** — l'image est ~3,9 Go sur disque et c'est elle qui
rend le prochain montage rapide :

```bash
docker rmi odoo:19.0-20260803 postgres:15
```

**Ce qui survit à la destruction** : uniquement ce qui est consigné sous
`specs/018-odoo-replique-manuelle/` — les reçus, les captures, les verdicts, le rapport. L'instance
est un environnement de preuve, jamais une cible de déploiement.

---

## 6. Ordres de grandeur (mesurés, pas estimés)

| Étape | Durée |
|---|---|
| `docker compose pull` (les deux images) | ~2 min |
| Création de la base + installation des modules | ~2 min |
| Démarrage du serveur persistant → première page | ~5 s |
| **Total, de rien à un onglet qui marche** | **~4 min** |
| Destruction complète | ~3 s (+4 s avec les images) |

| Poste | Sur disque |
|---|---|
| Cache d'images (**une fois**, réutilisé par tous les montages suivants) | ~3,9 Go |
| État réellement jetable, par instance | ~100 Mo |

> Ces chiffres viennent d'une exécution réelle sur une machine `linux/x86_64`. Ils sont donnés
> comme ordre de grandeur, pas comme engagement.

---

## 7. La passe de portes du dépôt, à chaque point de contrôle

Elle tourne **dans le worktree**, et **sans aucune instance Odoo** :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Plus la vérification des trois **non-dérives** attendues, qui se prouve et ne se suppose pas :

```bash
git diff --stat evals/golden.json figma-sync/plugin/engine.receipt.json examples/polaris/figma/
# doit être VIDE (research.md §D2)
```

Et le contrôle typé du harnais, que le `tsconfig` racine **ne voit pas** :

```bash
npx tsc -p specs/018-odoo-replique-manuelle/harness/tsconfig.json --noEmit
```
