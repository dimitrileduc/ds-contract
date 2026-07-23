/**
 * POSITIONAL INSTANCE SCAN — the walk payload (E5, research D6).
 *
 * A committed GENERATOR for the JS handed verbatim to figma_execute, one
 * call per page frame (an agent-driven session — figma_execute is a live MCP
 * tool call, not something a plain Node script can invoke, so this module
 * emits the *code*, it does not run it).
 *
 * "Generic" is the whole design: the walk does NOT assume which
 * componentProperties are the Button's icon swaps, or which components are
 * governed icons — it dumps EVERY instance's raw facts (mainComponent
 * identity, the SET it belongs to, componentProperties verbatim, direct TEXT
 * children, and its POSITIONAL path) and leaves classification to
 * assemble.ts — a committed, iterable TS module, far easier to get right and
 * fix than JS re-typed into every figma_execute call.
 *
 * Positional identity ONLY: an array of child-indices from the page frame
 * down to the node — NEVER the layer name (CLAUDE.md rule; the 001
 * near-deletion receipt: a name-based scan wrongly called "arrow-left" dead
 * stock). `nodeId` is recorded alongside as the stable cross-run identity;
 * `position` is the audit-trail / "where is this" fact.
 *
 * Streams its one result to the existing capture-receiver.mjs sink
 * (extract/figma/gauntlet/live/capture-receiver.mjs, reused VERBATIM — zero
 * new receiver script — port 9226, the only localhost port the Desktop
 * Bridge plugin's manifest allow-lists for POSTs from its sandbox) so the
 * bulk of the payload never rides the figma_execute tool-call response back
 * through the agent's context window.
 */

/** Discover the current canvas pages + their direct FRAME children — run
 *  this FIRST, fresh, every session (re-measured, never a hardcoded list:
 *  pages can be added/renamed between sessions). Read-only. */
export function buildDiscoverPagesCode(): string {
  return `
await figma.loadAllPagesAsync();
const pages = figma.root.children.map(function (p) { return { id: p.id, name: p.name }; });
const pagesPage = figma.root.children.find(function (p) { return p.name === "Pages"; });
const frames = pagesPage
  ? pagesPage.children.filter(function (n) { return n.type === "FRAME"; }).map(function (n) {
      return { id: n.id, name: n.name };
    })
  : [];
return { pages: pages, pagesPageId: pagesPage ? pagesPage.id : null, frameCount: frames.length, frames: frames };
`.trim();
}

/**
 * Fetch a COMPONENT_SET's componentPropertyDefinitions (the DEFAULT value of
 * every property) — run ONCE per audit session, not per page. Without this,
 * "is this instance's icon/text customized?" cannot be answered: the Button's
 * swap properties always carry SOME value (default or overridden), so raw
 * presence alone never distinguishes the two (a real bug caught by smoke-
 * testing this tool before trusting it — see assemble.ts). Posted to the
 * receiver under a reserved chunk name ("defaults") assemble.ts looks for
 * specifically, separate from the per-page instance chunks.
 */
export function buildFetchSetDefaultsCode(setId: string, receiverPort = 9226): string {
  const setIdLit = JSON.stringify(setId);
  const urlLit = JSON.stringify(`http://localhost:${receiverPort}/chunk?name=defaults`);
  return `
const set = await figma.getNodeByIdAsync(${setIdLit});
if (!set) { return { error: "set not found: " + ${setIdLit} }; }
const defs = set.componentPropertyDefinitions || {};
const out = {};
for (const k in defs) out[k] = { type: defs[k].type, defaultValue: defs[k].defaultValue };
const payload = JSON.stringify({ setId: ${setIdLit}, setName: set.name, definitions: out });
const res = await fetch(${urlLit}, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
const ack = await res.json();
return { setId: ${setIdLit}, propertyCount: Object.keys(out).length, receiverAck: ack };
`.trim();
}

/**
 * The per-page walk: every INSTANCE under `pageFrameId`, recorded generically
 * and POSTed as one chunk to the capture receiver.
 *
 * @param pageFrameId  the page frame's node id (from buildDiscoverPagesCode)
 * @param pageName     the frame's name, stamped onto every record (a label,
 *                     never used as an identity key)
 * @param chunkName    the receiver's `?name=` — becomes `<chunkName>.json`
 * @param receiverPort must match the capture-receiver.mjs instance in use
 */
export function buildWalkCode(pageFrameId: string, pageName: string, chunkName: string, receiverPort = 9226): string {
  const frameIdLit = JSON.stringify(pageFrameId);
  const pageNameLit = JSON.stringify(pageName);
  const urlLit = JSON.stringify(`http://localhost:${receiverPort}/chunk?name=${chunkName}`);
  return `
const frame = await figma.getNodeByIdAsync(${frameIdLit});
if (!frame) { return { error: "frame not found: " + ${frameIdLit} }; }

const found = [];
function walk(node, position) {
  if (node.type === "INSTANCE") found.push({ node: node, position: position });
  if ("children" in node) {
    const kids = node.children;
    for (let i = 0; i < kids.length; i++) walk(kids[i], position.concat([i]));
  }
}
walk(frame, []);

const records = await Promise.all(found.map(async function (entry) {
  const node = entry.node;
  const position = entry.position;
  let mainComponentId = null, mainComponentKey = null, mainComponentName = null;
  let setId = null, setKey = null, setName = null, mainComponentError = null;
  let mainComponentRemote = null;
  try {
    const main = await node.getMainComponentAsync();
    if (main) {
      mainComponentId = main.id;
      mainComponentKey = main.key;
      mainComponentName = main.name;
      mainComponentRemote = main.remote;
      const parent = main.parent;
      if (parent && parent.type === "COMPONENT_SET") {
        setId = parent.id;
        setKey = parent.key;
        setName = parent.name;
      }
    }
  } catch (e) {
    mainComponentError = String(e && e.message ? e.message : e);
  }
  const props = {};
  try {
    const cp = node.componentProperties || {};
    for (const k in cp) props[k] = { type: cp[k].type, value: cp[k].value };
  } catch (e) { /* named via empty props, never invented */ }
  const textChildren = [];
  try {
    const kids = node.children || [];
    for (let i = 0; i < kids.length; i++) {
      if (kids[i].type === "TEXT") textChildren.push({ nodeId: kids[i].id, characters: kids[i].characters });
    }
  } catch (e) { /* named via empty textChildren, never invented */ }
  return {
    page: ${pageNameLit},
    position: position,
    nodeId: node.id,
    name: node.name,
    visible: node.visible,
    mainComponentId: mainComponentId,
    mainComponentKey: mainComponentKey,
    mainComponentName: mainComponentName,
    mainComponentRemote: mainComponentRemote,
    setId: setId,
    setKey: setKey,
    setName: setName,
    mainComponentError: mainComponentError,
    componentProperties: props,
    textChildren: textChildren,
  };
}));

const payload = JSON.stringify({ page: ${pageNameLit}, pageFrameId: ${frameIdLit}, count: records.length, records: records });
const res = await fetch(${urlLit}, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
const ack = await res.json();
return { page: ${pageNameLit}, instanceCount: records.length, receiverAck: ack };
`.trim();
}
