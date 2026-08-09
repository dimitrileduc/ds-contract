/**
 * Sonde hostile de QUALIFICATION, jamais livrée en production.
 *
 * Elle rend les quatre descendants du banc explicitement sélectionnables,
 * déplaçables et draggables pour Odoo. Sans la politique Piqueray, les gestes
 * natifs apparaissent donc réellement ; avec elle, le conteneur de sonde reste
 * sélectionnable mais les commandes intérieures doivent disparaître. Cela
 * évite un faux vert obtenu simplement parce qu'Odoo n'aurait jamais su agir
 * sur les nœuds du fixture.
 */
import { BaseOptionComponent } from "@html_builder/core/utils";
import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";

const LOCKED = [
    ".pqr-texte-fige",
    ".pqr-titre-fige",
    ".pqr-libelle-fige",
    ".pqr-bloc-structurel",
].join(", ");

export class PiquerayLockedProbeOption extends BaseOptionComponent {
    static template = "piqueray_ds_qa.LockedProbeOption";
    static selector = LOCKED;
    static title = "QA — descendant verrouillé";
    static editableOnly = false;
}

export class PiquerayLockedProbePlugin extends Plugin {
    static id = "piquerayLockedProbePlugin";

    resources = {
        builder_options: [PiquerayLockedProbeOption],
        is_movable_selector: {
            selector: LOCKED,
            direction: "vertical",
        },
        dropzone_selector: {
            selector: LOCKED,
            dropIn: ".s_pqr_presentation",
        },
    };
}

registry.category("website-plugins").add(PiquerayLockedProbePlugin.id, PiquerayLockedProbePlugin);
