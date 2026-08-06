# Reçu d'environnement — `docker pull` pendait, et pourquoi

**Date** : 2026-08-06 · **Machine** : darwin 24.6.0, Docker Desktop **29.2.1**, `linux/amd64`.

Consigné parce que c'est **une demi-heure perdue** et que le prochain montage ne doit pas la
repayer. Rien ici n'est une hypothèse : chaque ligne est un relevé.

## Le symptôme

`docker compose -p odoo19 pull` tournait depuis ~25 minutes **sans télécharger un octet** :
processus vivant, 0 % CPU, aucune sortie, `docker system df` inchangé. Un `docker pull postgres:15`
seul — une image de 150 Mo, publique, ultra-commune — se comportait pareil : **zéro sortie en
7 minutes**.

## Ce que le diagnostic a ÉLIMINÉ

| Suspect | Relevé | Verdict |
|---|---|---|
| Daemon mort | `docker info` → `29.2.1`, 14 conteneurs, 15 images | ❌ répond |
| Réseau vers le registre | `auth.docker.io` → **HTTP 200 en 0,14 s** ; `registry-1.docker.io/v2/` → **401 en 0,29 s** (défi d'authentification normal) ; `production.cloudflare.docker.com` → **403 en 0,08 s** (normal à la racine du CDN) | ❌ réseau sain |
| Proxy d'entreprise | aucune variable `*_PROXY` dans l'environnement | ❌ aucun |
| Disque plein | 26,13 Go d'images, dont 6,73 Go récupérables | ❌ de la place |

## La cause

`~/.docker/config.json` porte `"credsStore": "desktop"`. Le CLI Docker interroge donc
`docker-credential-desktop` **avant chaque pull, y compris pour une image publique**. Cet assistant
**ne répond jamais** :

```
$ echo "https://index.docker.io/v1/" | docker-credential-desktop get
  → aucune réponse au bout de 10 s (processus tué)
```

Le CLI attend cette réponse indéfiniment. Le téléchargement n'a jamais commencé — il n'y avait rien
à voir dans les journaux du daemon, parce que le daemon n'a jamais été sollicité.

## Le contournement, et sa légitimité

Le bloc `auths` du fichier est **vide** : aucune identification n'est stockée, et les deux images de
cette spec (`postgres:15`, `odoo:19.0-20260803`) sont **publiques**. Passer une configuration Docker
sans `credsStore` ne contourne donc aucune sécurité — ça saute un appel qui n'avait rien à rendre.

```bash
mkdir -p <scratch>/dockercfg
echo '{"auths":{}}' > <scratch>/dockercfg/config.json
DOCKER_CONFIG=<scratch>/dockercfg docker pull postgres:15     # → arrive en quelques secondes
```

Vérifié : avec cette variable, `postgres:15` s'est téléchargée immédiatement, 5 couches, digest
`sha256:6eb0add3…`. La configuration de l'utilisateur n'est **pas modifiée** — `DOCKER_CONFIG` ne
vaut que pour la commande qui le porte.

## Ce que ça change pour `quickstart.md`

Toutes les commandes `docker` de la spec doivent porter `DOCKER_CONFIG=<scratch>/dockercfg` **sur
cette machine**, tant que l'assistant d'identifiants de Docker Desktop pend. Ce n'est pas une
propriété de la spec : c'est une propriété de la machine, et c'est pour ça que le reçu vit ici et
non dans le quickstart.

**Piste pour une réparation durable, non instruite ici** : redémarrer Docker Desktop, ou retirer
`credsStore` du `config.json` de l'utilisateur. Ni l'un ni l'autre n'a été tenté — 018 n'a pas à
reconfigurer la machine de l'owner pour monter une instance jetable.

## Suite : le plugin `compose` disparaît aussi

Deuxième effet, trouvé en l'heurtant : `DOCKER_CONFIG` ne déplace pas seulement le fichier
d'identifiants, il déplace **la recherche des plugins CLI**. `docker compose` répondait donc
`unknown shorthand flag: 'p' in -p` — le plugin n'était plus trouvé, et Docker interprétait
`compose` comme un argument.

Correctif : lier les plugins et les contextes dans le répertoire de contournement.

```bash
ln -sfn ~/.docker/cli-plugins <scratch>/dockercfg/cli-plugins
cp -r  ~/.docker/contexts     <scratch>/dockercfg/
```

Vérifié ensuite : `docker compose version` → `v5.0.2`, `docker info` → `29.2.1`.
