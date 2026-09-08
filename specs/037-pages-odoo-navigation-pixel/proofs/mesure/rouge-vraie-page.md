# T057 — La preuve rouge sur une VRAIE page

Date : 2026-09-08 · page **Motorisation** · instance `piqueray-odoo-037`.

Un instrument qui n'a jamais rougi sur une vraie page peut être vert parce qu'il ne regarde rien. On lui retire donc
une section réelle, on recompose, on mesure — puis on remet, on recompose, on re-mesure.

## Rouge : la section Devis retirée du descripteur

| Largeur | Score | Δh | Structure | Section d'origine du décalage |
|---|---|---|---|---|
| 390 | **26,83 %** | −577 px | **4 vs 5 sections** | `s_pqr_texte_seo` |
| 834 | **23,16 %** | −547 px | **4 vs 5 sections** | `s_pqr_texte_seo` |
| 1200 | **36,07 %** | −538 px | **4 vs 5 sections** | `s_pqr_categories_principales` |
| 1728 | **29,63 %** | −698 px | **4 vs 5 sections** | `s_pqr_produits_ecommerce` |

L'écart de **structure** est nommé aux quatre largeurs (« 4 vs 5 sections ») : l'instrument ne se contente pas de
voir un score monter, il dit **ce qui manque**. Δh est du bon ordre : la section Devis fait 506 px sur la vue wide.

## Vert : la section remise

| Largeur | Score | Δh | Structure |
|---|---|---|---|
| 390 | 3,28 % | −1 px | égale |
| 834 | 1,95 % | −1 px | égale |
| 1200 | 19,11 % | −52 px | égale — *écart pré-existant, cause nommée : les 3 cartes de Catégories rendent 51 px plus court qu'en vue à cette largeur* |
| 1728 | 1,38 % | 0 px | égale |

Trois largeurs sur quatre repassent au vert, et **1728 rend toutes ses sections à zéro d'écart**. Le rouge de 1200
est antérieur à l'expérience et porte sa propre cause : il n'est pas absorbé dans ce reçu.
