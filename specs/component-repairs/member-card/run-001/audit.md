# MemberCard run-001 — récit complet (audit → apply → idempotence)

Cible : `ds.member-card` 1.3.0 → **1.4.0** — `text-align: center` (canal `declared`,
verdict schéma `draw`) sur les parts `Nom` et `Poste`. Constat owner du 2026-08-18 :
au repli de ligne en largeur réduite (instance Odoo 8269), les textes se calaient à
gauche alors que l'intention est centrée. Cause racine classée **au contrat** (muet),
pas au canvas : Figma disait LEFT (défaut), l'auto-layout centrait la BOÎTE HUG, et
le canvas ne peut pas montrer le défaut (un texte HUG ne replie jamais).

## Chaîne exécutée

1. **Audit** (`audit.json`) : green mécanique — Text Styles exacts (`Titre 3` 5:43,
   `Titre 6` 5:46), 32 instances relevées, zéro override d'alignement. Le verdict
   porté à l'owner : `proposal`, contrat d'abord.
2. **GO owner** (2026-08-18) : « go ton job c member card ».
3. **snapshot-source** : `refs/codex/backups/member-card-text-align-20260818`
   (tree `e4ac449311a2352d81dbf9236ad4637092af6781`) — worktree avec modifications
   concurrentes d'une autre session (hero/Odoo), inventoriées et hors périmètre.
4. **Contrat + build** : member-card 1.4.0 ; CSS React + Odoo `text-align: center` ;
   `figma:plan` régénère `13-membercard.js` (textAlignH CENTER ×2) — `npm run build`
   ne régénère PAS figma-sync (leçon : le générateur est `figma:plan`). Repins Odoo :
   `equipe.authoring.json` (16 pins 1.4.0), `inputs.lock.json` (version + sha).
5. **Refus fondateur** : l'apply prévu (`generated-amend` rejouant 13-membercard.js)
   a été REFUSÉ par la pré-passe photos 017 — **66 empreintes IMAGE sans accueil**
   (le plan photo appartient au ds.member-picture composé ; le contrat member-card
   n'a aucune part img à lui), **zéro nœud touché**. Reçu intégral dans le journal de
   session. Conclusion : l'amend complet est disproportionné et structurellement
   bloqué pour un composite porteur de photos.
6. **Extension bornée du transport** (workflow : « lacune générique reproductible,
   fixture à l'appui ») : famille `textAlign` (enum LEFT|CENTER|RIGHT|JUSTIFIED)
   dans `set-properties` — `bridge-script.ts` (validateur + interpréteur + pré/post-
   conditions `textAlignHorizontal`), fixtures étendus
   (`component-workflow-gates-check.ts` : accepté/refusé ;
   `shared-component-responsive-bridge-check.ts` : apply LEFT→CENTER puis no-op
   strict), doc `component-repair-workflow.md` mise à jour. Manifeste rebasculé sur
   2 opérations `set-properties` (Nom 1/0 = 2351:35252, Poste 1/1 = 2351:35349),
   préconditions d'identité only (motif accordion-row).
7. **Incident transport, nommé** : la 1ʳᵉ exécution du script first a APPLIQUÉ les
   2 gestes puis a perdu son enveloppe-reçu (stockage du résultat > 100 kB/entrée
   pluginData). Récupération honnête : retour à l'état capturé (CENTER→LEFT vérifié),
   puis ré-exécution complète avec stockage par tranches ≤ 80 k. Aucun état
   intermédiaire n'est entré dans la chaîne de reçus.
8. **First apply** : 2 opérations `applied`, changedNodeIds exactement
   [2351:35252, 2351:35349], pageWrites 0, responsive 364/320 sans overflow,
   captures réelles (`responsive-*-first.png`, PNG validés CRC chunk par chunk).
9. **Verify** : zéro diff inattendu sur 35 surfaces ; **photos 17 hashes avant = 17
   après** ; instances/liens 130 = 130 ; consommateurs revalidés (ds.equipe via les
   surfaces shared-consumer capturées ; Odoo via CSS régénéré + lock 1.4.0).
10. **Second apply** : 2 × no-op strict ; exports responsive byte-identiques aux
    first (checksums croisés par tranche). **verify-idempotence : vert, zéro diff
    observable** (voir `verdict.md`, hash de reçu déterministe).
11. **Preuve visuelle livrée** : instance Odoo 8269 à 1000 px (`debug=assets`) —
    « Cécilia Piqueray » et « Collaboratrice admin & comptabilité » replient en
    lignes **centrées** ; alignement calculé `center` ×2. Témoin permanent posé dans
    `equipe.spec.mts` (`responsive()` mesure `nameTextAlign`/`roleTextAlign` en
    propriété calculée + assertion au reçu).

## Ce que ce run laisse ouvert, nommé

- **Amend complet de member-card toujours bloqué par la pré-passe photos** : toute
  future reconstruction (changement structurel du contrat) devra soit accueillir les
  plans photo du composé (mécanique d'accueil pour instances composées, à specifier),
  soit passer par des gestes bornés comme ici. Le refus est la porte voulue, pas un
  bug.
- **Motif de classe** (194 occurrences TEXT LEFT dans pile centrée, dont tous les
  SectionHeader « Alignement=Centre ») : hors périmètre sur ordre owner
  (« t'occupe pas du reste »), inventaire reproductible par la sonde REST de session.
- Preuves Odoo 019 (`equipe-functional`/`equipe-visual`) : à repasser lors du
  prochain cycle QA Odoo (le témoin ci-dessus les enrichit) — la revalidation de ce
  run repose sur le CSS régénéré (+2 règles exactement) et le lock 1.4.0.
- **Leçon de déploiement Odoo, mesurée sur l'owner (2026-08-18 ~10:56)** : un CSS
  généré régénéré sur disque NE SUFFIT PAS — Odoo sert le bundle compilé en base,
  figé à l'installation. `?debug=assets` (qui lit le disque) montrait la correction
  pendant que la page publique servait l'ancien bundle : une vérification en debug
  n'est PAS une vérification des conditions réelles. Geste requis après toute
  régénération d'assets : `odoo -u piqueray_ds` + restart (fait ici), puis contrôle
  SANS debug. À intégrer au protocole de qualification 019/025.
