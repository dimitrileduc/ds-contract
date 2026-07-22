import { Card, CardContent, CardDescription, CardHeader, CardTitle, Section, Source } from '../components/ui';
import { catalog, components, evals, nativeComponentCount, parity, semanticTokens } from '../data';

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardDescription className="text-xs tracking-widest uppercase">{label}</CardDescription>
        <CardTitle className="text-3xl font-light tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground px-4 text-xs">{note}</CardContent>
    </Card>
  );
}

export function Overview() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">One contract. Two surfaces. Zero drift.</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          A machine-readable contract is the single source of truth between the Figma library and the React codebase.
          Everything on this page is read live from the governed artifacts — nothing is typed in by hand.
        </p>
      </div>

      <Section
        title="System status"
        lead="Computed from the artifacts the pipeline itself produces: what exists, whether the surfaces agree, and whether the checks pass."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Stat label="Components" value={String(components.length)} note={`${nativeComponentCount} map to native canvas features`} />
          <Stat label="Tokens" value={String(catalog.tokens.allCssVariables.length)} note={`custom properties · ${semanticTokens.length} semantic`} />
          <Stat label="Evals" value={`${evals.passed}/${evals.total}`} note="deterministic claims passing" />
          <Stat
            label="Parity"
            value={parity.findings.length === 0 ? 'Clean' : String(parity.findings.length)}
            note={`${parity.checkedContracts.length} contracts checked · ${parity.findings.length} drift findings`}
          />
          {/* The Adherence A/B is NOT a headline status tile: it was measured on the
              retired 51-component demo catalog and has not been re-run for Piqueray.
              Shown below with that stated, never as a current system metric. */}
        </div>
        <Source path="catalog/catalog.json · parity/report.json · evals/results.json" />
      </Section>

      <Section
        title="The loop"
        lead="Both surfaces are generated from the contract, and the parity check verifies each one against it — surfaces are never copied into each other."
      >
        <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-3">
          <Card className="justify-center py-4 text-center">
            <CardContent className="space-y-1">
              <p className="font-medium">Code surface</p>
              <p className="text-muted-foreground text-xs">React + CSS Modules + Storybook</p>
            </CardContent>
          </Card>
          <Card className="border-primary justify-center border-2 py-4 text-center">
            <CardContent className="space-y-1">
              <p className="text-primary font-semibold tracking-wide">CONTRACT</p>
              <p className="text-muted-foreground text-xs">the governed source — contracts/*.contract.json + tokens/</p>
            </CardContent>
          </Card>
          <Card className="justify-center py-4 text-center">
            <CardContent className="space-y-1">
              <p className="font-medium">Design surface</p>
              <p className="text-muted-foreground text-xs">Figma variables + component sets</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-muted-foreground text-center text-xs">
          changes on either side are <span className="text-foreground font-medium">promoted into the contract</span> — never
          synced side-to-side
        </p>
      </Section>

      {/* ARCHIVED 2026-07-22 — two showcase sections used to live here: the
          Adherence A/B (100 vs 69) and "Show the gaps, never fake it".
          Both were produced against the retired 51-component demo catalog and
          described a design system this repo no longer ships. Displaying them
          next to live Piqueray numbers made a demo result read as a Piqueray
          capability. They are not deleted — protocol, judge, generated screens
          and reports all remain under evals/adherence/, documented in
          evals/adherence/ARCHIVE.md with what it would take to re-run them. */}
      <Section
        title="Adherence A/B — archived"
        lead="This page used to show an experiment measuring whether a governed catalog changes what an AI generates. It scored the retired demo catalog, not Piqueray, so it is no longer displayed here."
      >
        <p className="text-muted-foreground max-w-3xl text-sm">
          The protocol, the deterministic judge and the recorded results are kept under{' '}
          <code className="text-foreground">evals/adherence/</code>. It becomes meaningful again once Piqueray has enough
          components to build a screen from — see{' '}
          <code className="text-foreground">evals/adherence/ARCHIVE.md</code>.
        </p>
        <Source path="evals/adherence/ARCHIVE.md" />
      </Section>
    </>
  );
}
