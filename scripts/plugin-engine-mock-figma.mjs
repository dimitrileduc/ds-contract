/**
 * Mocked `figma` global for the plugin-engine headless harness
 * (scripts/plugin-engine-check.mjs) — the canvas-side twin of the VM pattern
 * core-browser-check uses. It implements ONLY what the emitted sync scripts,
 * the embedded dump script, and the plugin's own inventory/marker scripts
 * actually call: node creation + tree ops, shared-plugin-data markers,
 * component properties, the variables API (collections, modes, aliases,
 * resolveForConsumer), text styles, and page traversal.
 *
 * Fidelity notes (deliberate, harness-scoped):
 *   - Geometry is not laid out: width/height start at Figma's 100×100 frame
 *     default and change only via resize()/resizeWithoutConstraints().
 *   - createNodeFromSvg validates drawable vector geometry and derives an
 *     intrinsic size from width/height or viewBox; it records vectorNodeCount
 *     for headless geometry fixtures (it is not a full SVG renderer).
 *   - Fonts load IF AND ONLY IF the (family, style) pair exists in the inventory
 *     (figma._fonts) — Inter spells composite styles with a space, Montserrat
 *     compact. The old "fonts always load" no-op is what let a hard-coded Inter
 *     ship: a failing loadFontAsync was invisible headless. Text style
 *     application is exact (textStyleId).
 */

let nextId = 1;
const newId = () => `${nextId++}:${nextId}`;

/** 017 : les seuls `scaleMode` qu'un ImagePaint accepte dans l'API réelle. */
const IMAGE_SCALE_MODES = new Set(['FILL', 'FIT', 'CROP', 'TILE']);

/** 017 : adressage par contenu, comme Figma — mêmes octets ⇔ même hash. djb2,
 *  pour garder le mock sans dépendance (le bac à sable n'a pas `crypto` non
 *  plus, et le sha256 des octets se calcule côté Node dans photo-parity/). */
const imageHashOfBytes = (bytes) => {
  let h = 5381;
  for (let i = 0; i < bytes.length; i++) h = (((h << 5) + h) + bytes[i]) >>> 0;
  return `img-${h.toString(16)}-${bytes.length}`;
};

export function createFigmaMock() {
  const allStyles = [];
  const collections = [];
  const variables = [];
  const mixed = Symbol('figma.mixed');

  class MockNode {
    constructor(type) {
      this.type = type;
      this.id = newId();
      this.key = `key-${this.id}`;
      this.name = type;
      this.parent = null;
      this.removed = false;
      this.visible = true;
      this.opacity = 1;
      this.rotation = 0;
      this.width = 100;
      this.height = 100;
      this.x = 0;
      this.y = 0;
      this.fills = [];
      this.strokes = [];
      this.strokeWeight = 1;
      this.strokeAlign = 'INSIDE';
      this.dashPattern = [];
      this.effects = [];
      this.cornerRadius = 0;
      this.layoutMode = 'NONE';
      this.primaryAxisAlignItems = 'MIN';
      this.counterAxisAlignItems = 'MIN';
      this.primaryAxisSizingMode = 'AUTO';
      this.counterAxisSizingMode = 'AUTO';
      this.itemSpacing = 0;
      this.paddingTop = 0;
      this.paddingRight = 0;
      this.paddingBottom = 0;
      this.paddingLeft = 0;
      this.layoutSizingHorizontal = 'HUG';
      this.layoutSizingVertical = 'HUG';
      this._layoutPositioning = 'AUTO';
      this.constraints = { horizontal: 'MIN', vertical: 'MIN' };
      this.constrainProportions = false;
      this.minWidth = null;
      this.maxWidth = null;
      this.minHeight = null;
      this.maxHeight = null;
      this.clipsContent = true;
      this.description = '';
      this.boundVariables = {};
      this.componentPropertyReferences = {};
      this.isExposedInstance = false;
      this._shared = new Map();
      this._svgExport = null;
      // 017 : le nœud de maître dont celui-ci est le MIROIR (null si ce n'en est
      // pas un). C'est ce lien qui fait mourir une surcharge d'instance quand le
      // nœud de maître qu'elle décorait est démoli.
      this._mirrorOf = null;
      if (type !== 'TEXT') this.children = [];
      if (type === 'TEXT') {
        this.characters = '';
        this.fontSize = 16;
        this.fontName = { family: 'Inter', style: 'Regular' };
        this._fontRanges = [];
        this.letterSpacing = { unit: 'PERCENT', value: 0 };
        this.lineHeight = { unit: 'AUTO' };
        this.textCase = 'ORIGINAL';
        this.textDecoration = 'NONE';
        this.textAlignHorizontal = 'LEFT';
        this.textStyleId = '';
      }
      if (type === 'COMPONENT' || type === 'COMPONENT_SET') {
        this._propDefs = {};
        this._propSeq = 0;
      }
      // 017 : le registre des instances d'un maître — ce que `getInstancesAsync`
      // rend, et ce sur quoi la démolition se propage.
      if (type === 'COMPONENT') this._instances = [];
    }

    // 017 (FR-002a) — `fills` cesse d'être un champ nu : un paint IMAGE est
    // VALIDÉ. Le mock transportait jusqu'ici des paints IMAGE écrits à la main
    // par la fixture 013 sans jamais les connaître (0 occurrence d'`imageHash`
    // ou de `scaleMode` dans ce fichier). Forme §VII : d'un no-op permissif à
    // une contrainte qui lève.
    get fills() {
      return this._fills;
    }
    set fills(value) {
      const arr = Array.isArray(value) ? value : [];
      for (const p of arr) {
        if (!p || p.type !== 'IMAGE') continue;
        if (typeof p.imageHash !== 'string' || p.imageHash === '') {
          throw new Error('in set_fills: an IMAGE paint requires a non-empty string imageHash');
        }
        if (!IMAGE_SCALE_MODES.has(p.scaleMode)) {
          throw new Error(
            `in set_fills: an IMAGE paint requires scaleMode ∈ {${[...IMAGE_SCALE_MODES].join('|')}}, got ${JSON.stringify(p.scaleMode)}`,
          );
        }
      }
      this._fills = arr;
    }

    get layoutPositioning() { return this._layoutPositioning; }
    set layoutPositioning(value) {
      if (value === 'ABSOLUTE' && (!this.parent || this.parent.layoutMode === 'NONE')) {
        throw new Error('in layoutPositioning: ABSOLUTE requires an auto-layout parent');
      }
      this._layoutPositioning = value;
      if (value === 'ABSOLUTE') this.parent?._reflowAfterAbsolute();
    }

    get absoluteBoundingBox() {
      let x = this.x;
      let y = this.y;
      for (let parent = this.parent; parent && parent.type !== 'DOCUMENT'; parent = parent.parent) {
        x += parent.x ?? 0;
        y += parent.y ?? 0;
      }
      return { x, y, width: this.width, height: this.height };
    }

    _reflowAfterAbsolute() {
      if (!this.children || this.layoutMode === 'NONE') return;
      const horizontal = this.layoutMode === 'HORIZONTAL';
      let cursor = horizontal ? this.paddingLeft : this.paddingTop;
      for (const child of this.children) {
        if (child.layoutPositioning === 'ABSOLUTE') continue;
        if (horizontal) {
          child.x = cursor;
          child.y = this.counterAxisAlignItems === 'MAX' ? this.height - this.paddingBottom - child.height : this.counterAxisAlignItems === 'CENTER' ? (this.height - child.height) / 2 : this.paddingTop;
          cursor += child.width + this.itemSpacing;
        } else {
          child.x = this.counterAxisAlignItems === 'MAX' ? this.width - this.paddingRight - child.width : this.counterAxisAlignItems === 'CENTER' ? (this.width - child.width) / 2 : this.paddingLeft;
          child.y = cursor;
          cursor += child.height + this.itemSpacing;
        }
      }
    }

    appendChild(node) {
      if (node.parent) {
        const i = node.parent.children.indexOf(node);
        if (i >= 0) node.parent.children.splice(i, 1);
      }
      node.parent = this;
      this.children.push(node);
      syncMirrorsOf(this);
    }

    insertChild(index, node) {
      if (node.parent) {
        const i = node.parent.children.indexOf(node);
        if (i >= 0) node.parent.children.splice(i, 1);
      }
      node.parent = this;
      this.children.splice(index, 0, node);
      syncMirrorsOf(this);
    }

    remove() {
      // 017 : dans le vrai Figma, la démolition d'un nœud de maître SE PROPAGE
      // aux instances — le nœud miroir meurt avec lui, et la surcharge de
      // peinture qu'il portait meurt avec le nœud. C'est EXACTEMENT le mécanisme
      // de la perte du 2026-08-06 (62 photos d'instance effondrées derrière un
      // rapport vert) : les deux chemins d'amend font
      // `for (const child of [...comp.children]) child.remove()`.
      const master = ownerComponentOf(this.parent);
      if (this.parent) {
        const i = this.parent.children.indexOf(this);
        if (i >= 0) this.parent.children.splice(i, 1);
      }
      this.parent = null;
      this.removed = true;
      if (master) syncMirrorsOf(master);
    }

    resize(w, h) {
      this.width = w;
      this.height = h;
      // Fidelity (016, measured live): with strokeAlign INSIDE, real Figma
      // clamps a frame's height to the total of its horizontal per-side
      // stroke weights — height 0 + strokeTopWeight 1 yields 1 (uniform
      // default weights yielded 2 on Footer.Separator). CENTER/OUTSIDE do not
      // clamp. Without this, the zero-height-line defect class is invisible
      // headless.
      this._clampInsideStrokes();
    }

    /** Real-Figma INSIDE clamp (016): applies on resize AND whenever a
     *  per-side weight is set afterwards — both orders were measured live. */
    _clampInsideStrokes() {
      if (this.strokeAlign === 'INSIDE' && (this.strokes?.length ?? 0) > 0) {
        const top = this.strokeTopWeight ?? this.strokeWeight ?? 0;
        const bottom = this.strokeBottomWeight ?? this.strokeWeight ?? 0;
        if (this.height < top + bottom) this.height = top + bottom;
      }
    }

    get strokeTopWeight() { return this._strokeTopWeight; }
    set strokeTopWeight(v) { this._strokeTopWeight = v; this._clampInsideStrokes(); }
    get strokeBottomWeight() { return this._strokeBottomWeight; }
    set strokeBottomWeight(v) { this._strokeBottomWeight = v; this._clampInsideStrokes(); }

    resizeWithoutConstraints(w, h) {
      this.resize(w, h);
    }

    setSharedPluginData(namespace, key, value) {
      this._shared.set(`${namespace}/${key}`, value);
    }

    getSharedPluginData(namespace, key) {
      return this._shared.get(`${namespace}/${key}`) ?? '';
    }

    setBoundVariable(field, variable) {
      this.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id };
    }

    findOne(cb) {
      for (const n of this.findAll()) if (cb(n)) return n;
      return null;
    }

    findAll(cb) {
      const out = [];
      const walk = (node) => {
        for (const child of node.children ?? []) {
          out.push(child);
          walk(child);
        }
      };
      walk(this);
      return cb ? out.filter(cb) : out;
    }

    findAllWithCriteria({ types }) {
      return this.findAll((n) => types.includes(n.type));
    }

    // --- component properties ---------------------------------------------
    get componentPropertyDefinitions() {
      if (this.type === 'COMPONENT_SET') {
        // Variant axes ride the children names, mirrored as VARIANT defs.
        // Real Figma surfaces properties defined on variants at SET level
        // after combineAsVariants — mirror that (dedupe by name prefix).
        const defs = { ...this._propDefs };
        const have = new Set(Object.keys(defs).map((k) => k.split('#')[0]));
        for (const ch of this.children ?? []) {
          for (const [key, def] of Object.entries(ch._propDefs ?? {})) {
            const name = key.split('#')[0];
            if (have.has(name)) continue;
            have.add(name);
            defs[key] = def;
          }
        }
        const axes = new Map();
        for (const ch of this.children ?? []) {
          for (const seg of String(ch.name).split(',')) {
            const [axis, value] = seg.split('=').map((s) => s?.trim());
            if (!axis || value === undefined) continue;
            if (!axes.has(axis)) axes.set(axis, new Set());
            axes.get(axis).add(value);
          }
        }
        for (const [axis, values] of axes) {
          defs[axis] = { type: 'VARIANT', defaultValue: [...values][0], variantOptions: [...values] };
        }
        return defs;
      }
      return { ...this._propDefs };
    }

    addComponentProperty(name, type, defaultValue, opts) {
      const key = type === 'VARIANT' ? name : `${name}#${this.id}:${this._propSeq++}`;
      this._propDefs[key] = { type, defaultValue, ...(opts?.preferredValues ? { preferredValues: opts.preferredValues } : {}) };
      return key;
    }

    editComponentProperty(key, patch) {
      if (this._propDefs[key]) {
        Object.assign(this._propDefs[key], patch);
        return key;
      }
      // Set-level edits reach variant-defined properties in real Figma.
      for (const ch of this.children ?? []) {
        if (ch._propDefs?.[key]) {
          Object.assign(ch._propDefs[key], patch);
          return key;
        }
      }
      throw new Error(`editComponentProperty: no property ${key}`);
    }

    deleteComponentProperty(key) {
      if (this._propDefs?.[key]) {
        delete this._propDefs[key];
        return;
      }
      for (const ch of this.children ?? []) {
        if (ch._propDefs?.[key]) {
          delete ch._propDefs[key];
          return;
        }
      }
      throw new Error(`deleteComponentProperty: no property ${key}`);
    }

    // --- component/instance ------------------------------------------------
    get defaultVariant() {
      return this.children?.[0] ?? null;
    }

    // 017 (FR-002a, le TROU CENTRAL) — une INSTANCE MIROITE le sous-arbre de son
    // maître, et ses nœuds miroirs acceptent une surcharge de `fills`.
    //
    // Jusqu'ici : `inst.children = []`. Rien à surcharger, donc rien à perdre,
    // donc la perte du 2026-08-06 — 62 photos posées sur des INSTANCES DE PAGE,
    // effondrées par une régénération, derrière un rapport vert — était
    // STRUCTURELLEMENT INATTEIGNABLE sans tête. 255 des 349 photos vivantes du
    // fichier client sont des surcharges d'instance : les trois quarts que le
    // sauvetage d'origine ne voyait pas (016/proofs/photos/RECONCILIATION.md:26).
    //
    // Discipline §VII, forme des trois précédents (981e446, ddac778, e856844) :
    // le mock passe d'un no-op permissif à une contrainte qui lève.
    createInstance() {
      const inst = new MockNode('INSTANCE');
      inst.name = this.name;
      inst._mainComponent = this;
      inst.children = (this.children ?? []).map((ch) => mirrorSubtree(ch, inst));
      this._instances.push(inst);
      const source = this.parent?.type === 'COMPONENT_SET' ? this.parent : this;
      inst.componentProperties = {};
      for (const [key, def] of Object.entries(source.componentPropertyDefinitions ?? {})) {
        inst.componentProperties[key] = { type: def.type, value: def.defaultValue };
      }
      inst.setProperties = (props) => {
        for (const [key, value] of Object.entries(props)) {
          inst.componentProperties[key] = {
            type: inst.componentProperties[key]?.type ?? 'TEXT',
            value,
          };
          applyComponentPropertyToInstance(inst, key, value);
        }
      };
      Object.defineProperty(inst, 'exposedInstances', {
        configurable: true,
        get: () => inst.findAll((node) => node.type === 'INSTANCE' && node._mirrorOf?.isExposedInstance === true),
      });
      inst.getMainComponentAsync = async () => inst._mainComponent;
      inst.width = this.width;
      inst.height = this.height;
      for (const [key, property] of Object.entries(inst.componentProperties)) {
        applyComponentPropertyToInstance(inst, key, property.value);
      }
      return inst;
    }

    // 017 (D1) — `ComponentNode.getInstancesAsync()`. Elle n'avait AUCUN usage
    // dans ce dépôt et n'était pas modélisée ici : c'était la seule prémisse non
    // mesurée du plan 017.
    //
    // ⚠️ CE QUE CE MOCK PROUVE, ET CE QU'IL NE PROUVE PAS. Il est écrit d'après
    // l'API PUBLIÉE (les instances du maître, refusées tant que
    // `loadAllPagesAsync` n'a pas tourné — le chargement dynamique des pages),
    // et non d'après un relevé sur le fichier client : la sonde T005 est
    // consignée `empeche` (proofs/sonde-getinstances.md — dix serveurs MCP
    // concurrents, EADDRINUSE sur toute la plage 9223-9232, pont vivant mais
    // saturé). Il prouve donc que le moteur emprunte correctement la voie ; il
    // ne prouve pas que le fichier client la rende. C'est pour cela que
    // l'émetteur garde le repli orchestré comme voie par défaut.
    async getInstancesAsync() {
      if (this.type !== 'COMPONENT') {
        throw new Error('in getInstancesAsync: only a ComponentNode has instances');
      }
      if (!pagesLoaded) {
        throw new Error(
          'in getInstancesAsync: Cannot query instances before figma.loadAllPagesAsync() — pages load dynamically',
        );
      }
      return (this._instances ?? []).filter((i) => !i.removed);
    }

    async setTextStyleIdAsync(id) {
      this.textStyleId = id;
    }

    _fontAt(index) {
      let out = this.fontName;
      for (const range of this._fontRanges ?? []) {
        if (index >= range.start && index < range.end) out = range.fontName;
      }
      return out;
    }

    getRangeFontName(start, end) {
      if (this.type !== 'TEXT') throw new Error('in getRangeFontName: node is not TEXT');
      if (end <= start) return this.fontName;
      const first = this._fontAt(start);
      for (let i = start + 1; i < end; i++) {
        if (JSON.stringify(this._fontAt(i)) !== JSON.stringify(first)) return mixed;
      }
      return first;
    }

    setRangeFontName(start, end, fontName) {
      if (this.type !== 'TEXT') throw new Error('in setRangeFontName: node is not TEXT');
      if (start < 0 || end <= start || end > this.characters.length) {
        throw new Error(`in setRangeFontName: invalid range ${start}..${end} for length ${this.characters.length}`);
      }
      this._fontRanges.push({ start, end, fontName: structuredClone(fontName) });
    }

    getStyledTextSegments() {
      if (this.type !== 'TEXT') throw new Error('in getStyledTextSegments: node is not TEXT');
      if (this.characters.length === 0) return [];
      const out = [];
      let start = 0;
      let fontName = this._fontAt(0);
      for (let i = 1; i <= this.characters.length; i++) {
        const next = i < this.characters.length ? this._fontAt(i) : null;
        if (i === this.characters.length || JSON.stringify(next) !== JSON.stringify(fontName)) {
          out.push({ start, end: i, characters: this.characters.slice(start, i), fontName });
          start = i;
          fontName = next;
        }
      }
      return out;
    }

    async exportAsync(options = {}) {
      if (options.format !== 'SVG' || typeof this._svgExport !== 'string') {
        throw new Error('mock exportAsync supports only configured SVG fixtures');
      }
      return Uint8Array.from(Buffer.from(this._svgExport, 'utf8'));
    }
  }

  // --- 017 : le miroir d'instance (FR-002a) ---------------------------------
  // Trois fonctions, et elles disent ensemble une seule chose : ce qu'une
  // surcharge d'instance vit, et comment elle meurt.

  /** Le COMPONENT dont `node` fait partie — null si on est déjà DANS un miroir
   *  (une INSTANCE n'a pas d'instances) ou hors de tout maître. */
  function ownerComponentOf(node) {
    let n = node;
    while (n) {
      if (n.type === 'INSTANCE') return null;
      if (n.type === 'COMPONENT') return n;
      n = n.parent;
    }
    return null;
  }

  /** Copie miroir d'un sous-arbre de maître. `fills` et `strokes` sont copiés
   *  en TABLEAUX NEUFS : une surcharge posée sur l'instance ne doit pas remonter
   *  au maître (c'est tout l'intérêt d'une surcharge). */
  function mirrorSubtree(master, parent) {
    const m = new MockNode(master.type === 'COMPONENT' ? 'INSTANCE' : master.type);
    for (const [k, v] of Object.entries(master)) {
      if (k === 'id' || k === 'key' || k === 'parent' || k === 'children' || k === '_shared') continue;
      if (k === '_fills' || k === 'strokes' || k === 'effects' || k === 'dashPattern') continue;
      if (k === '_instances' || k === '_mirrorOf') continue;
      if (k === 'componentPropertyReferences' || k === 'componentProperties' || k === '_fontRanges') {
        m[k] = structuredClone(v);
      } else {
        m[k] = v;
      }
    }
    m._fills = Array.isArray(master.fills) ? master.fills.map((p) => ({ ...p })) : [];
    m.strokes = Array.isArray(master.strokes) ? master.strokes.map((p) => ({ ...p })) : [];
    m.effects = Array.isArray(master.effects) ? [...master.effects] : [];
    m.dashPattern = Array.isArray(master.dashPattern) ? [...master.dashPattern] : [];
    m._mirrorOf = master;
    m.parent = parent;
    if (master.children) m.children = master.children.map((ch) => mirrorSubtree(ch, m));
    if (m.type === 'INSTANCE') {
      m.getMainComponentAsync = async () => m._mainComponent;
      m.setProperties = (props) => {
        for (const [key, value] of Object.entries(props)) {
          m.componentProperties[key] = {
            type: m.componentProperties[key]?.type ?? 'TEXT',
            value,
          };
          applyComponentPropertyToInstance(m, key, value);
        }
      };
    }
    return m;
  }

  /** Native component-property semantics needed by composed TEXT forwarding
   * and INSTANCE_SWAP glyphs. References use exact suffixed keys. */
  function applyComponentPropertyToInstance(instance, key, value) {
    const nodes = [instance, ...(instance.findAll?.() ?? [])];
    for (const node of nodes) {
      for (const [field, reference] of Object.entries(node.componentPropertyReferences ?? {})) {
        if (reference !== key) continue;
        if (field === 'characters' && node.type === 'TEXT') {
          node.characters = String(value);
        } else if (field === 'visible') {
          node.visible = Boolean(value);
        } else if (field === 'mainComponent') {
          const target = root.id === value ? root : root.findOne((candidate) => candidate.id === value);
          const main = target?.type === 'COMPONENT_SET' ? target.defaultVariant : target;
          if (!main || main.type !== 'COMPONENT') {
            throw new Error(`in setProperties: INSTANCE_SWAP target ${String(value)} is not a component`);
          }
          node._mainComponent = main;
          node.children = (main.children ?? []).map((child) => mirrorSubtree(child, node));
        }
      }
    }
  }

  /** Réaligne les enfants d'un miroir sur ceux de son maître : un miroir déjà
   *  présent est CONSERVÉ (donc sa surcharge survit à un simple réordonnancement),
   *  un nœud de maître nouveau reçoit un miroir neuf, et un miroir dont le nœud de
   *  maître a disparu MEURT — avec la surcharge qu'il portait. Cette dernière
   *  ligne est le mécanisme de la perte, et c'est délibérément ce que le mock
   *  reproduit. */
  function syncMirrorChildren(master, mirror) {
    const existing = new Map();
    for (const ch of mirror.children ?? []) if (ch._mirrorOf) existing.set(ch._mirrorOf, ch);
    const next = [];
    for (const mch of master.children ?? []) {
      let m = existing.get(mch);
      if (m) {
        existing.delete(mch);
        syncMirrorChildren(mch, m);
      } else {
        m = mirrorSubtree(mch, mirror);
      }
      m.parent = mirror;
      next.push(m);
    }
    for (const orphan of existing.values()) {
      orphan.parent = null;
      orphan.removed = true;
    }
    mirror.children = next;
  }

  /** Propage à toutes les instances du maître qui contient `node`. */
  function syncMirrorsOf(node) {
    const comp = ownerComponentOf(node);
    if (!comp || !comp._instances || comp._instances.length === 0) return;
    for (const inst of comp._instances) {
      if (!inst.removed) syncMirrorChildren(comp, inst);
    }
  }

  class MockTextStyle {
    constructor() {
      this.id = `S:${newId()}`;
      this.name = '';
      this.fontName = { family: 'Inter', style: 'Regular' };
      this.fontSize = 16;
      this.description = '';
      this._shared = new Map();
    }
    setSharedPluginData(ns, key, value) {
      this._shared.set(`${ns}/${key}`, value);
    }
    getSharedPluginData(ns, key) {
      return this._shared.get(`${ns}/${key}`) ?? '';
    }
  }

  class MockVariable {
    constructor(name, collection, resolvedType) {
      this.id = `VariableID:${newId()}`;
      this.name = name;
      this.variableCollectionId = collection.id;
      this.resolvedType = resolvedType;
      this.valuesByMode = {};
      this.scopes = [];
      this._codeSyntax = {};
    }
    setValueForMode(modeId, value) {
      this.valuesByMode[modeId] = value;
    }
    setVariableCodeSyntax(platform, value) {
      this._codeSyntax[platform] = value;
    }
    resolveForConsumer() {
      // Default-mode resolution, alias chains chased across collections.
      let value = this.valuesByMode[Object.keys(this.valuesByMode)[0]];
      let type = this.resolvedType;
      let guard = 0;
      while (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS' && guard++ < 10) {
        const target = variables.find((v) => v.id === value.id);
        if (!target) return null;
        value = target.valuesByMode[Object.keys(target.valuesByMode)[0]];
        type = target.resolvedType;
      }
      return { resolvedType: type, value };
    }
  }

  class MockCollection {
    constructor(name) {
      this.id = `VariableCollectionId:${newId()}`;
      this.name = name;
      this._modeSeq = 0;
      this.modes = [{ name: 'Mode 1', modeId: this._newModeId() }];
    }
    _newModeId() {
      return `${this.id}:m${this._modeSeq++}`;
    }
    renameMode(modeId, name) {
      const m = this.modes.find((x) => x.modeId === modeId);
      if (m) m.name = name;
    }
    addMode(name) {
      const modeId = this._newModeId();
      this.modes.push({ name, modeId });
      return modeId;
    }
  }

  const firstPage = new MockNode('PAGE');
  firstPage.name = 'Page 1';
  const root = new MockNode('DOCUMENT');
  root.appendChild(firstPage);

  // 017 : les pages se chargent dynamiquement dans l'API réelle, et
  // `getInstancesAsync` refuse tant que `loadAllPagesAsync` n'a pas tourné.
  let pagesLoaded = false;
  // 017 : le magasin d'images, adressé par contenu comme chez Figma.
  const imageStore = new Map();

  const figma = {
    mixed,
    base64Encode(bytes) {
      return Buffer.from(bytes).toString('base64');
    },
    fileKey: null,
    root,
    currentPage: firstPage,
    notify() {},
    async loadAllPagesAsync() {
      pagesLoaded = true;
    },
    // 017 (FR-002a) — le couple createImage / getImageByHash, 0 occurrence de
    // chacun jusqu'ici. `getImageByHash` rend **null** sur un hash inconnu,
    // comme l'API réelle : c'est précisément ce qui distingue « photo illisible,
    // donc NON VÉRIFIABLE » de « photo identique ». Un contrôle empêché n'est
    // pas un contrôle vert (FR-015).
    createImage(bytes) {
      const arr = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes ?? []);
      if (arr.length === 0) throw new Error('in createImage: Image is empty');
      const hash = imageHashOfBytes(arr);
      imageStore.set(hash, arr);
      return {
        hash,
        async getBytesAsync() {
          return arr;
        },
      };
    },
    getImageByHash(hash) {
      const bytes = imageStore.get(hash);
      if (!bytes) return null;
      return {
        hash,
        async getBytesAsync() {
          return bytes;
        },
      };
    },
    // Inventaire de polices calqué sur le fichier client : Inter épelle ses styles
    // composés avec une espace ('Semi Bold'), Montserrat les épelle compact
    // ('SemiBold'). Mesuré — specs/007-…/data-model.md:134 et les dumps REST
    // ("fontPostScriptName": "Montserrat-SemiBold").
    //
    // Une paire (famille, style) inconnue est REFUSÉE, comme le fait l'API réelle.
    // L'ancien no-op « les polices se chargent toujours » est EXACTEMENT ce qui a
    // laissé passer le codage en dur d'Inter : le mock ne pouvait pas voir qu'un
    // loadFontAsync échouait en silence et que tout le texte régénéré restait en
    // Inter. Discipline de fidélité du mock (§VII) : un défaut qui n'apparaît que
    // sur le canvas vivant se répare en deux temps — l'émetteur, puis le mock qui
    // doit désormais l'attraper headless pour toujours.
    _fonts: {
      Inter: ['Thin', 'Extra Light', 'Light', 'Regular', 'Medium', 'Semi Bold', 'Bold', 'Extra Bold', 'Black'],
      Montserrat: ['Thin', 'ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black'],
    },
    async loadFontAsync({ family, style } = {}) {
      const styles = figma._fonts[family];
      if (!styles || !styles.includes(style)) {
        throw new Error(`in loadFontAsync: Cannot load font ${family} ${style}`);
      }
    },
    async setCurrentPageAsync(page) {
      figma.currentPage = page;
    },
    createPage() {
      const p = new MockNode('PAGE');
      root.appendChild(p);
      return p;
    },
    createFrame: () => new MockNode('FRAME'),
    createComponent: () => new MockNode('COMPONENT'),
    createText: () => new MockNode('TEXT'),
    createRectangle: () => new MockNode('RECTANGLE'),
    createEllipse: () => new MockNode('ELLIPSE'),
    createPolygon: () => {
      const n = new MockNode('REGULAR_POLYGON');
      n.pointCount = 3;
      return n;
    },
    // Test-only source capture seam for the embedded dump fixture. It models
    // the Plugin API's VECTOR + exportAsync path without pretending to render
    // arbitrary Figma geometry in Node.
    createVector: (svg = '<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z" fill="#000000"/></svg>') => {
      const n = new MockNode('VECTOR');
      n._svgExport = svg;
      n.fills = [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0 } }];
      return n;
    },
    createNodeFromSvg: (svg) => {
      // Real Figma refuses malformed SVG with "Failed to convert SVG file".
      // The old no-op mock accepted anything, which let an emitter bug (an
      // <svg> with two `fill` attributes) pass every headless gate and only
      // fail on a live canvas. Validate the way the real API would: non-empty,
      // and NO duplicate attributes on any tag (invalid XML).
      if (typeof svg !== 'string' || svg.trim() === '') {
        throw new Error('in createNodeFromSvg: Failed to convert SVG file (empty)');
      }
      for (const tag of svg.match(/<[a-zA-Z][^>]*>/g) ?? []) {
        const seen = new Set();
        for (const m of tag.matchAll(/[\s"']([a-zA-Z_:][\w:.-]*)\s*=/g)) {
          if (seen.has(m[1])) {
            throw new Error(`in createNodeFromSvg: Failed to convert SVG file (duplicate attribute "${m[1]}")`);
          }
          seen.add(m[1]);
        }
      }
      // SVG text is drawable too (the governed Google wordmark is source
      // typography, not an empty geometry box); Figma converts it during SVG
      // import. The refusal is for assets with no drawable element at all.
      const vectorNodeCount = (svg.match(/<(path|circle|rect|polygon|ellipse|line|polyline|text)\b/g) ?? []).length;
      if (vectorNodeCount === 0) {
        throw new Error('in createNodeFromSvg: Failed to convert SVG file (no drawable vector geometry)');
      }
      const rootTag = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
      const attr = (name) => rootTag.match(new RegExp(`\\s${name}="([^" ]+)"`))?.[1];
      const viewBox = attr('viewBox')?.trim().split(/\s+/).map(Number);
      const width = Number.parseFloat(attr('width') ?? '') || (viewBox?.[2] ?? 16);
      const height = Number.parseFloat(attr('height') ?? '') || (viewBox?.[3] ?? 16);
      const n = new MockNode('FRAME');
      n.vectorNodeCount = vectorNodeCount;
      n.svg = svg;
      n.resize(width, height);
      return n;
    },
    createTextStyle: () => {
      const s = new MockTextStyle();
      allStyles.push(s);
      return s;
    },
    async getLocalTextStylesAsync() {
      return [...allStyles];
    },
    async getStyleByIdAsync(id) {
      return allStyles.find((s) => s.id === id) ?? null;
    },
    async getNodeByIdAsync(id) {
      if (root.id === id) return root;
      return root.findOne((n) => n.id === id);
    },
    combineAsVariants(nodes, page) {
      const set = new MockNode('COMPONENT_SET');
      page.appendChild(set);
      for (const n of nodes) set.appendChild(n);
      return set;
    },
    viewport: {
      scrollAndZoomIntoView() {},
    },
    ui: null,
    variables: {
      createVariableCollection(name) {
        const c = new MockCollection(name);
        collections.push(c);
        return c;
      },
      createVariable(name, collection, type) {
        const v = new MockVariable(name, collection, type);
        variables.push(v);
        return v;
      },
      async getLocalVariablesAsync() {
        return [...variables];
      },
      async getLocalVariableCollectionsAsync() {
        return [...collections];
      },
      async getVariableByIdAsync(id) {
        return variables.find((v) => v.id === id) ?? null;
      },
      async getVariableCollectionByIdAsync(id) {
        return collections.find((c) => c.id === id) ?? null;
      },
      setBoundVariableForPaint(paint, field, variable) {
        return {
          ...paint,
          boundVariables: { ...(paint.boundVariables ?? {}), [field]: { type: 'VARIABLE_ALIAS', id: variable.id } },
        };
      },
    },
  };
  return { figma, root, firstPage, variables, collections, styles: allStyles };
}
