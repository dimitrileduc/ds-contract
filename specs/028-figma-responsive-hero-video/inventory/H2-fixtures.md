# Matrice de contenus H2

Ce fichier est un contrôle interne. Il ne constitue pas la revue demandée à l'owner.
Après validation H2, seuls les trois écrans acceptés `2577:6069`, `2577:6213`
et `2577:6357` restent sur le canvas. Les autres node IDs ci-dessous sont des
identités historiques de tests retirés, dont les captures et mesures restent la preuve.

| Option | Cas | Contenu | Présentation | Fenêtre testée | Frame produite | Croissance faible hauteur | Débordement / contenu inaccessible | Preuve |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| option-a-balanced | control-320 | default | Compact | 320×640 | 320×597 | non requis | aucun | frame Figma 2577:5997 |
| option-a-balanced | control-320 | long-title | Compact | 320×640 | 320×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/control-320-long-title.png |
| option-a-balanced | control-320 | long-cta | Compact | 320×640 | 320×597 | non requis | aucun | frame Figma 2577:6045 |
| option-a-balanced | witness-390 | default | Compact | 390×844 | 390×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-390-default.png |
| option-a-balanced | witness-390 | long-title | Compact | 390×844 | 390×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-390-long-title.png |
| option-a-balanced | witness-390 | long-cta | Compact | 390×844 | 390×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-390-long-cta.png |
| option-a-balanced | witness-834 | default | Compact | 834×1112 | 834×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-834-default.png |
| option-a-balanced | witness-834 | long-title | Compact | 834×1112 | 834×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-834-long-title.png |
| option-a-balanced | witness-834 | long-cta | Compact | 834×1112 | 834×597 | non requis | aucun | frame Figma 2577:6189 |
| option-a-balanced | witness-1200 | default | Desktop | 1200×800 | 1200×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-1200-default.png |
| option-a-balanced | witness-1200 | long-title | Desktop | 1200×800 | 1200×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-1200-long-title.png |
| option-a-balanced | witness-1200 | long-cta | Desktop | 1200×800 | 1200×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-1200-long-cta.png |
| option-a-balanced | control-1440 | default | Wide | 1440×720 | 1440×720 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/control-1440-default.png |
| option-a-balanced | control-1440 | long-title | Wide | 1440×720 | 1440×720 | non requis | aucun | frame Figma 2577:6309 |
| option-a-balanced | control-1440 | long-cta | Wide | 1440×720 | 1440×720 | non requis | aucun | frame Figma 2577:6333 |
| option-a-balanced | witness-1728 | default | Wide | 1728×720 | 1728×720 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/witness-1728-default.png |
| option-a-balanced | witness-1728 | long-title | Wide | 1728×720 | 1728×720 | non requis | aucun | frame Figma 2577:6381 |
| option-a-balanced | witness-1728 | long-cta | Wide | 1728×720 | 1728×720 | non requis | aucun | frame Figma 2577:6405 |
| option-a-balanced | control-short-landscape | default | Compact | 844×390 | 844×597 | oui — minimum sûr | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/control-short-landscape-default.png |
| option-a-balanced | control-short-landscape | long-title | Compact | 844×390 | 844×597 | oui — minimum sûr | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-a-balanced/control-short-landscape-long-title.png |
| option-a-balanced | control-short-landscape | long-cta | Compact | 844×390 | 844×597 | oui — minimum sûr | aucun | frame Figma 2577:6477 |
| option-b-expressive | witness-390 | default | Compact | 390×844 | 390×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-b-expressive/witness-390-default.png |
| option-b-expressive | witness-1200 | default | Desktop | 1200×800 | 1200×597 | non requis | aucun | specs/028-figma-responsive-hero-video/proofs/H2-options/option-b-expressive/witness-1200-default.png |

## Résultat

- 23 couples largeur/contenu contrôlés.
- 0 débordement horizontal.
- 0 débordement vertical interne.
- 0 contenu inaccessible.
- Les 3 cas paysage court utilisent le minimum de 597 px et grandissent au-delà des 390 px demandés au lieu de couper le contenu.
- Le poster, les deux voiles et le Button sont conservés dans chaque proposition.
