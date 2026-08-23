// GENERATED FILE — DO NOT EDIT.
// Regenerate with: npm run odoo:figma-links
// Toute retouche à la main est perdue au prochain build ET rend la porte
// `--check` rouge avec le statut `tampered`.

// ODOO-025-FIGMA-LINKS-GENERATED BEGIN
export const FIGMA_PANEL_LINKS = Object.freeze([
    Object.freeze({ panelId: "categories-principales", selector: ".s_pqr_categories_principales", contractId: "ds.categories-principales", contractVersion: "1.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2115:4277" }),
    Object.freeze({ panelId: "category-card", selector: ".s_pqr_categories_principales [data-pqr-carte]", contractId: "ds.carte-categorie", contractVersion: "1.1.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2495:6770" }),
    Object.freeze({ panelId: "coordonnees", selector: ".s_pqr_coordonnees", contractId: "ds.coordonnees", contractVersion: "2.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2104:2904" }),
    Object.freeze({ panelId: "devis", selector: ".s_pqr_devis", contractId: "ds.devis", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2096:2524" }),
    Object.freeze({ panelId: "equipe", selector: ".s_pqr_equipe", contractId: "ds.equipe", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2115:3947" }),
    Object.freeze({ panelId: "faq", selector: ".s_pqr_faq", contractId: "ds.faq", contractVersion: "1.3.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2104:2914" }),
    Object.freeze({ panelId: "faq-row", selector: ".s_pqr_faq [data-pqr-faq-row]", contractId: "ds.accordion-row", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2059:1417" }),
    Object.freeze({ panelId: "footer", selector: ".footer[data-pqr-shell=\"footer\"]", contractId: "ds.footer", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2120:4785" }),
    Object.freeze({ panelId: "google-reviews", selector: ".s_pqr_google_reviews", contractId: "ds.google-reviews", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2178:7381" }),
    Object.freeze({ panelId: "hero", selector: ".s_pqr_hero", contractId: "ds.hero", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2111:3382" }),
    Object.freeze({ panelId: "hero-video", selector: ".s_pqr_hero_video", contractId: "ds.hero-video", contractVersion: "1.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2151:5552" }),
    Object.freeze({ panelId: "member-card", selector: ".s_pqr_equipe [data-pqr-member-card]", contractId: "ds.member-card", contractVersion: "1.4.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2074:2072" }),
    Object.freeze({ panelId: "presentation", selector: ".s_pqr_presentation", contractId: "ds.presentation", contractVersion: "3.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2103:2824" }),
    Object.freeze({ panelId: "produits-ecommerce", selector: ".s_pqr_produits_ecommerce", contractId: "ds.produits-ecommerce", contractVersion: "1.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2116:4475" }),
    Object.freeze({ panelId: "reassurances", selector: ".s_pqr_reassurances", contractId: "ds.reassurances", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2114:3721" }),
    Object.freeze({ panelId: "reassurances-card", selector: ".s_pqr_reassurances [data-pqr-carte]", contractId: "ds.carte", contractVersion: "2.0.1", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2063:1622" }),
    Object.freeze({ panelId: "review-card", selector: ".s_pqr_google_reviews [data-pqr-review-card]", contractId: "ds.review-card", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2480:5253" }),
    Object.freeze({ panelId: "sav", selector: ".s_pqr_sav", contractId: "ds.sav", contractVersion: "1.4.1", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2108:3105" }),
    Object.freeze({ panelId: "texte-seo", selector: ".s_pqr_texte_seo", contractId: "ds.texte-seo", contractVersion: "3.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2108:3123" }),
    Object.freeze({ panelId: "texte-seo-row", selector: ".s_pqr_texte_seo [data-pqr-accordion-row]", contractId: "ds.accordion-row", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2059:1417" }),
]);

/** Rend une correspondance seulement pour la sélection exacte du panneau. */
export function findFigmaPanelLink(editingElement) {
    const matches = FIGMA_PANEL_LINKS.filter((entry) => editingElement?.matches?.(entry.selector));
    return matches.length === 1 ? matches[0] : null;
}
// ODOO-025-FIGMA-LINKS-GENERATED END
