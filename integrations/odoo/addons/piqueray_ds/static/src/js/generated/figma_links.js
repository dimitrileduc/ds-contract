// GENERATED FILE — DO NOT EDIT.
// Regenerate with: npm run odoo:figma-links
// Toute retouche à la main est perdue au prochain build ET rend la porte
// `--check` rouge avec le statut `tampered`.

// ODOO-025-FIGMA-LINKS-GENERATED BEGIN
export const FIGMA_PANEL_LINKS = Object.freeze([
    Object.freeze({ panelId: "categories-principales", selector: ".s_pqr_categories_principales", contractId: "ds.categories-principales", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2693:20242" }),
    Object.freeze({ panelId: "category-card", selector: ".s_pqr_categories_principales [data-pqr-carte]", contractId: "ds.carte-categorie", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2692:19667" }),
    Object.freeze({ panelId: "coordonnees", selector: ".s_pqr_coordonnees", contractId: "ds.coordonnees", contractVersion: "2.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2104:2904" }),
    Object.freeze({ panelId: "devis", selector: ".s_pqr_devis", contractId: "ds.devis", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2694:21604" }),
    Object.freeze({ panelId: "equipe", selector: ".s_pqr_equipe", contractId: "ds.equipe", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2115:3947" }),
    Object.freeze({ panelId: "faq", selector: ".s_pqr_faq", contractId: "ds.faq", contractVersion: "1.3.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2104:2914" }),
    Object.freeze({ panelId: "faq-row", selector: ".s_pqr_faq [data-pqr-faq-row]", contractId: "ds.accordion-row", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2059:1417" }),
    Object.freeze({ panelId: "footer", selector: ".footer[data-pqr-shell=\"footer\"]", contractId: "ds.footer", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2735:12509" }),
    Object.freeze({ panelId: "google-reviews", selector: ".s_pqr_google_reviews", contractId: "ds.google-reviews", contractVersion: "3.0.1", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2700:28391" }),
    Object.freeze({ panelId: "hero", selector: ".s_pqr_hero", contractId: "ds.hero", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2111:3382" }),
    Object.freeze({ panelId: "hero-video", selector: ".s_pqr_hero_video", contractId: "ds.hero-video", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2689:15832" }),
    Object.freeze({ panelId: "member-card", selector: ".s_pqr_equipe [data-pqr-member-card]", contractId: "ds.member-card", contractVersion: "1.4.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2074:2072" }),
    Object.freeze({ panelId: "presentation", selector: ".s_pqr_presentation", contractId: "ds.presentation", contractVersion: "4.0.1", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2693:20805" }),
    Object.freeze({ panelId: "produits-ecommerce", selector: ".s_pqr_produits_ecommerce", contractId: "ds.produits-ecommerce", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2694:21337" }),
    Object.freeze({ panelId: "reassurances", selector: ".s_pqr_reassurances", contractId: "ds.reassurances", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2700:26297" }),
    Object.freeze({ panelId: "reassurances-card", selector: ".s_pqr_reassurances [data-pqr-carte]", contractId: "ds.carte", contractVersion: "3.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2700:25961" }),
    Object.freeze({ panelId: "review-card", selector: ".s_pqr_google_reviews [data-pqr-review-card]", contractId: "ds.review-card", contractVersion: "4.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2731:9375" }),
    Object.freeze({ panelId: "sav", selector: ".s_pqr_sav", contractId: "ds.sav", contractVersion: "2.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2693:20992" }),
    Object.freeze({ panelId: "texte-seo", selector: ".s_pqr_texte_seo", contractId: "ds.texte-seo", contractVersion: "3.0.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2108:3123" }),
    Object.freeze({ panelId: "texte-seo-row", selector: ".s_pqr_texte_seo [data-pqr-accordion-row]", contractId: "ds.accordion-row", contractVersion: "1.2.0", status: "available", fileKey: "d9FYAUcqdcNtsuaMgLefvJ", nodeId: "2059:1417" }),
]);

/** Rend une correspondance seulement pour la sélection exacte du panneau. */
export function findFigmaPanelLink(editingElement) {
    const matches = FIGMA_PANEL_LINKS.filter((entry) => editingElement?.matches?.(entry.selector));
    return matches.length === 1 ? matches[0] : null;
}
// ODOO-025-FIGMA-LINKS-GENERATED END
