import { useMemo, useState } from 'react';
import { Check, Input, Section, Source, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { figmaVariableNames, primitiveTokensByGroup, semanticTokensByGroup, tokenUsedBy } from '../data';
import type { TokenInfo } from '../data';
import { resolveVar, useThemeVersion } from '../lib/use-theme-version';

function Preview({ cssVar, type }: { cssVar: string; type: string }) {
  const value = resolveVar(cssVar);
  if (type === 'color') {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="inline-block size-5 shrink-0 rounded-sm border" style={{ background: `var(${cssVar})` }} />
        <span className="text-muted-foreground text-xs tabular-nums">{value}</span>
      </span>
    );
  }
  if (type === 'dimension') {
    const px = parseFloat(value);
    return (
      <span className="inline-flex items-center gap-2">
        <span className="bg-primary/60 inline-block h-2 rounded-sm" style={{ width: Math.min(Number.isFinite(px) ? px : 0, 96) }} />
        <span className="text-muted-foreground text-xs tabular-nums">{value}</span>
      </span>
    );
  }
  return <span className="text-muted-foreground text-xs tabular-nums">{value}</span>;
}

function filterGroups(all: Map<string, TokenInfo[]>, q: string): Map<string, TokenInfo[]> {
  if (!q) return all;
  const filtered = new Map<string, TokenInfo[]>();
  for (const [group, tokens] of all) {
    const hits = tokens.filter(
      (t) => t.dotPath.includes(q) || t.figmaName.includes(q) || tokenUsedBy(t.dotPath).some((n) => n.toLowerCase().includes(q)),
    );
    if (hits.length > 0) filtered.set(group, hits);
  }
  return filtered;
}

function countTokens(layers: Array<{ groups: Map<string, TokenInfo[]> }>): number {
  return layers.reduce((n, layer) => n + [...layer.groups.values()].reduce((m, tokens) => m + tokens.length, 0), 0);
}

function GroupTable({ group, tokens }: { group: string; tokens: TokenInfo[] }) {
  return (
    <details open className="group">
      <summary className="focus-visible:ring-ring cursor-pointer list-none rounded-md py-1 text-base font-semibold outline-none select-none focus-visible:ring-2">
        <span className="text-muted-foreground mr-2 inline-block transition-transform group-open:rotate-90">›</span>
        {group}
        <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">{tokens.length}</span>
      </summary>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">Resolved (live)</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Code · CSS variable</TableHead>
            <TableHead>Design · Figma variable</TableHead>
            <TableHead className="w-20">In Figma</TableHead>
            <TableHead>Used by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => {
            const users = tokenUsedBy(token.dotPath);
            return (
              <TableRow key={token.dotPath}>
                <TableCell><Preview cssVar={token.cssVar} type={token.type} /></TableCell>
                <TableCell><code className="text-xs">{token.dotPath}</code></TableCell>
                <TableCell className="font-mono text-xs">var({token.cssVar})</TableCell>
                <TableCell className="font-mono text-xs">{token.figmaName}</TableCell>
                <TableCell>
                  <Check ok={figmaVariableNames.has(token.figmaName)} label="variable exists in the Figma file" />
                </TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1">
                    {users.length === 0 ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      users.map((name) => (
                        <a
                          key={name}
                          href={`#/components/${encodeURIComponent(`ds.${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`)}`}
                          className="bg-muted hover:bg-accent rounded px-1.5 py-0.5 text-xs"
                        >
                          {name}
                        </a>
                      ))
                    )}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </details>
  );
}

export function Tokens() {
  useThemeVersion();
  const [query, setQuery] = useState('');
  const layers = useMemo(
    () => [
      {
        title: 'Primitives',
        lead: 'The raw values extracted from the Piqueray file — the 12 colors, the nav/state switch, and the type/spacing scale. This is the layer contracts bind today.',
        groups: primitiveTokensByGroup(),
      },
      {
        title: 'Semantic',
        lead: 'Usage-named aliases over the primitives. Today: the 8 Montserrat text styles — the file defines no color or spacing semantics yet.',
        groups: semanticTokensByGroup(),
      },
    ],
    [],
  );
  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => layers.map((layer) => ({ ...layer, groups: filterGroups(layer.groups, q) })),
    [q, layers],
  );
  const total = countTokens(layers);
  const shown = countTokens(visible);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tokens</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          Every styling value in the system, in its two layers: the primitives extracted from the file, and the
          semantic aliases above them. Each row maps one token to its three lives: the value the page styles resolve
          live, the CSS custom property the code consumes, and the Figma variable designers consume — verified to
          exist in the file. "Used by" shows which contracts bind it.
        </p>
        <div className="mt-4 flex max-w-md items-center gap-3">
          <Input
            type="search"
            aria-label="Filter tokens"
            placeholder="Filter by token path, Figma name, or component…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {shown}/{total}
          </span>
        </div>
      </div>

      {shown === 0 ? <p className="text-muted-foreground text-sm">No tokens match "{query}".</p> : null}
      {visible.map((layer) =>
        layer.groups.size === 0 ? null : (
          <Section key={layer.title} title={layer.title} lead={layer.lead}>
            {[...layer.groups.entries()].map(([group, tokens]) => (
              <GroupTable key={group} group={group} tokens={tokens} />
            ))}
          </Section>
        ),
      )}
      <Source path="tokens/primitives.tokens.json · tokens/semantic.tokens.json · tokens/modes/semantic.light.tokens.json · src/styles/tokens.css (live) · parity/snapshots/figma-tokens.json · contracts/*.contract.json (used-by)" />
    </>
  );
}
